import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { University } from '@/types';
import { getCollegeLocation, AP_MAJOR_DISTRICT_HUBS, UniversityLocation, AP_BOUNDING_BOX } from '@/data/coordinates';

interface CampusMap3DProps {
  universities: University[];
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  onSelectCollege?: (data: { uni: University; loc: UniversityLocation }) => void;
}

// Convert AP Lat/Lng to 3D world coordinates on an extruded base plate
function latLngTo3D(lat: number, lng: number) {
  const { minLat, maxLat, minLng, maxLng } = AP_BOUNDING_BOX;
  const u = (lng - minLng) / (maxLng - minLng);
  const v = (lat - minLat) / (maxLat - minLat);

  // Map to 3D dimensions (plate width: 40 units, plate height: 32 units)
  const x = (u - 0.5) * 40;
  const z = (0.5 - v) * 32;
  return { x, z };
}

export default function CampusMap3D({
  universities,
  selectedCity,
  onSelectCity,
  onSelectCollege,
}: CampusMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredUni, setHoveredUni] = useState<{ name: string; city: string; code: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 36, 32);

    // 2. High-Performance Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 15;
    controls.maxDistance = 75;
    controls.target.set(0, 0, 0);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x6366f1, 3, 60);
    pointLight.position.set(-15, 20, -10);
    scene.add(pointLight);

    // 5. Stylized Holographic 3D Andhra Pradesh Base Terrain Plate
    const plateGeo = new THREE.BoxGeometry(44, 0.8, 36);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.4,
      metalness: 0.8,
    });
    const basePlate = new THREE.Mesh(plateGeo, plateMat);
    basePlate.position.y = -0.4;
    basePlate.receiveShadow = true;
    scene.add(basePlate);

    // Grid Floor Overlay
    const grid = new THREE.GridHelper(44, 22, 0x0ea5e9, 0x1e293b);
    grid.position.y = 0.02;
    scene.add(grid);

    // Glowing Plate Border Wireframe
    const edgeGeo = new THREE.EdgesGeometry(plateGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x0284c7 });
    const wireframe = new THREE.LineSegments(edgeGeo, edgeMat);
    wireframe.position.y = -0.4;
    scene.add(wireframe);

    // 6. District Hubs
    const hubMarkers: { hubName: string; position: THREE.Vector3 }[] = [];
    const beaconGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.4, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    const ringGeo = new THREE.RingGeometry(0.8, 1.2, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });

    AP_MAJOR_DISTRICT_HUBS.forEach((hub) => {
      const { x, z } = latLngTo3D(hub.lat, hub.lng);
      hubMarkers.push({ hubName: hub.name, position: new THREE.Vector3(x, 0, z) });

      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(x, 1.2, z);
      scene.add(beacon);

      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.05, z);
      scene.add(ring);
    });

    // 7. College Pins
    const collegeMeshes: THREE.Mesh[] = [];
    const pinGeo = new THREE.ConeGeometry(0.35, 1.1, 8);
    pinGeo.rotateX(Math.PI);

    const verifiedMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.5,
    });
    const unverifiedMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.5,
    });

    universities.forEach((u) => {
      const loc = getCollegeLocation(u);
      const { x, z } = latLngTo3D(loc.lat, loc.lng);
      const isVerified = loc.precision === 'verified_campus';

      const pin = new THREE.Mesh(pinGeo, isVerified ? verifiedMat : unverifiedMat);
      const jitterX = isVerified ? 0 : (Math.random() - 0.5) * 1.2;
      const jitterZ = isVerified ? 0 : (Math.random() - 0.5) * 1.2;

      pin.position.set(x + jitterX, 1.4, z + jitterZ);
      pin.castShadow = true;
      pin.userData = { university: u, loc: loc, baseY: 1.4 };

      scene.add(pin);
      collegeMeshes.push(pin);
    });

    // 8. Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(collegeMeshes);

      if (intersects.length > 0) {
        const topHit = intersects[0].object as THREE.Mesh;
        const u = topHit.userData.university as University;
        setHoveredUni({ name: u.name, city: u.city, code: u.counselingCode || 'EAPCET' });
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        container.style.cursor = 'pointer';
      } else {
        setHoveredUni(null);
        setTooltipPos(null);
        container.style.cursor = 'grab';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(collegeMeshes);

      if (intersects.length > 0) {
        const topHit = intersects[0].object as THREE.Mesh;
        const uni = topHit.userData.university as University;
        const loc = topHit.userData.loc as UniversityLocation;
        if (onSelectCollege) onSelectCollege({ uni, loc });
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 9. Camera Fly-To
    let targetCameraPos: THREE.Vector3 | null = null;
    let targetControlsPos: THREE.Vector3 | null = null;

    if (selectedCity) {
      const matchedHub = hubMarkers.find((h) => h.hubName.toLowerCase() === selectedCity.toLowerCase());
      if (matchedHub) {
        targetControlsPos = matchedHub.position.clone();
        targetCameraPos = new THREE.Vector3(matchedHub.position.x, 14, matchedHub.position.z + 14);
      }
    }

    // 10. Intelligent Render Loop (with Tab Visibility Pause)
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isVisible = true;

    const animate = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating oscillation on pins
      collegeMeshes.forEach((mesh, idx) => {
        mesh.position.y = mesh.userData.baseY + Math.sin(elapsedTime * 2.5 + idx * 0.1) * 0.12;
      });

      if (targetCameraPos && targetControlsPos) {
        camera.position.lerp(targetCameraPos, 0.05);
        controls.target.lerp(targetControlsPos, 0.05);
        if (camera.position.distanceTo(targetCameraPos) < 0.2) {
          targetCameraPos = null;
          targetControlsPos = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 11. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 580;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [universities, selectedCity, onSelectCollege]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '580px',
        position: 'relative',
        background: '#090d16',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '8px 14px',
          color: '#e2e8f0',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#38bdf8',
            boxShadow: '0 0 10px #38bdf8',
            display: 'inline-block',
          }}
        />
        <span>3D Spatial WebGL • Drag to Rotate • Scroll to Zoom</span>
      </div>

      {hoveredUni && tooltipPos && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y - 30}px`,
            zIndex: 20,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #0284c7',
            borderRadius: '10px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '12px',
            pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            maxWidth: '240px',
          }}
        >
          <div style={{ fontWeight: 800, color: '#38bdf8' }}>[{hoveredUni.code}]</div>
          <div style={{ fontWeight: 700, margin: '2px 0' }}>{hoveredUni.name}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>📍 {hoveredUni.city}</div>
        </div>
      )}
    </div>
  );
}
