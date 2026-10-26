import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, ExternalLink, Award, CheckCircle2, Building, Sparkles, X, ChevronRight } from 'lucide-react';
import type { University } from '@/types';
import { getCollegeLocation, AP_MAJOR_DISTRICT_HUBS, UniversityLocation } from '@/data/coordinates';

interface CampusMapExplorerProps {
  universities: University[];
  onSelectCity?: (city: string) => void;
  selectedCity?: string;
}

export default function CampusMapExplorer({
  universities,
  onSelectCity,
  selectedCity
}: CampusMapExplorerProps) {
  const navigate = useNavigate();
  const [selectedCollege, setSelectedCollege] = useState<{ uni: University; loc: UniversityLocation } | null>(null);
  const [hoveredCollege, setHoveredCollege] = useState<{ uni: University; loc: UniversityLocation } | null>(null);

  // Map enriched college data with projection
  const mappedColleges = useMemo(() => {
    return universities.map(u => ({
      uni: u,
      loc: getCollegeLocation(u)
    }));
  }, [universities]);

  // Aggregate count by city
  const cityClusters = useMemo(() => {
    const map = new Map<string, number>();
    universities.forEach(u => {
      map.set(u.city, (map.get(u.city) || 0) + 1);
    });
    return map;
  }, [universities]);

  return (
    <div style={{
      position: 'relative',
      background: 'var(--surface)',
      borderRadius: '24px',
      border: '1.5px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      marginBottom: '32px'
    }}>
      {/* Header Bar */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'var(--bg)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Interactive Discovery
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
              • {universities.length} Institutions Mapped
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '6px 0 0' }}>
            Andhra Pradesh Campus Map
          </h2>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontWeight: '700' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-main)' }}>Verified Campus</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-muted)' }}>City Centroid</span>
          </div>
        </div>
      </div>

      {/* District Quick-Filter Hubs */}
      <div className="no-scrollbar" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        background: 'var(--surface-hover)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto'
      }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', flexShrink: 0 }}>
          District Hubs:
        </span>
        {AP_MAJOR_DISTRICT_HUBS.map(hub => {
          const count = cityClusters.get(hub.name) || 0;
          const isActive = selectedCity === hub.name;
          return (
            <button
              key={hub.name}
              onClick={() => onSelectCity && onSelectCity(isActive ? '' : hub.name)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                background: isActive ? 'var(--primary)' : 'var(--chip-bg)',
                color: isActive ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--chip-border)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <span>{hub.name}</span>
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--primary-light)',
                color: isActive ? '#fff' : 'var(--primary)',
                padding: '1px 6px',
                borderRadius: '999px',
                fontSize: '10px'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Map Canvas Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '540px',
        background: 'radial-gradient(circle at 75% 35%, rgba(0,212,255,0.06) 0%, transparent 60%), radial-gradient(circle at 30% 60%, rgba(16,185,129,0.05) 0%, transparent 60%), var(--bg)',
        overflow: 'hidden'
      }}>
        <style>{`
          .ap-map-land {
            fill: #f0fdf4;
            stroke: #059669;
            filter: drop-shadow(0 12px 24px rgba(5, 150, 105, 0.12));
            transition: all 0.3s ease;
          }
          [data-theme='dark'] .ap-map-land {
            fill: #064e3b;
            stroke: #10b981;
            filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4));
          }
          .ap-ocean-area {
            fill: url(#oceanGrad);
          }
          [data-theme='dark'] .ap-ocean-area {
            fill: rgba(14, 165, 233, 0.12);
          }
        `}</style>

        {/* SVG Map of Andhra Pradesh */}
        <svg
          viewBox="0 0 800 650"
          style={{ width: '100%', height: '100%', pointerEvents: 'all' }}
        >
          <defs>
            {/* Bay of Bengal subtle gradient */}
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.30" />
            </linearGradient>

            {/* Pattern for delicate map grid lines */}
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.07" />
            </pattern>
          </defs>

          {/* Background Cartographic Grid */}
          <rect width="800" height="650" fill="url(#mapGrid)" />

          {/* Bay of Bengal Ocean Body (seamlessly wraps the entire coastline to canvas edge) */}
          <path
            className="ap-ocean-area"
            d="M 790,20
               C 740,70 690,115 644,149
               C 595,185 570,205 548,219
               C 495,255 465,275 438,297
               C 405,310 388,318 372,325
               C 350,335 340,350 331,364
               C 328,410 326,440 325,469
               C 326,505 327,535 328,558
               L 800,650
               L 800,0
               Z"
          />

          {/* Accurate Andhra Pradesh Geographic Territory Boundary */}
          <path
            className="ap-map-land"
            d="M 790,20
               C 740,70 690,115 644,149
               C 595,185 570,205 548,219
               C 495,255 465,275 438,297
               C 405,310 388,318 372,325
               C 350,335 340,350 331,364
               C 328,410 326,440 325,469
               C 326,505 327,535 328,558
               C 275,585 220,610 164,635
               C 135,595 105,565 78,529
               C 50,490 32,465 25,445
               C 35,420 50,405 66,397
               C 95,365 115,345 132,332
               C 165,320 190,315 214,307
               C 235,285 248,270 258,259
               C 295,245 320,235 336,227
               C 360,218 375,212 387,206
               C 425,200 445,195 463,192
               C 510,165 535,145 558,130
               C 585,110 598,98 610,86
               C 635,65 650,52 665,41
               C 715,30 755,25 790,20
               Z"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Regional Divisions (Dashed Boundaries) */}
          {/* Rayalaseema to Coastal AP Border (Nallamala to Pulicat) */}
          <path
            d="M 214,307 C 255,390 285,470 328,558"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          {/* Coastal AP to Uttarandhra Border (Godavari to Visakha hills) */}
          <path
            d="M 463,192 C 515,198 545,210 548,219"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Prominent Regional Labels */}
          <g style={{ pointerEvents: 'none' }}>
            <text x="630" y="380" fill="#0284c7" opacity="0.65" fontSize="14" fontWeight="900" letterSpacing="4">
              BAY OF BENGAL
            </text>
            <text x="110" y="480" fill="var(--text-muted)" opacity="0.5" fontSize="13" fontWeight="900" letterSpacing="3">
              RAYALASEEMA
            </text>
            <text x="360" y="270" fill="var(--primary)" opacity="0.6" fontSize="13" fontWeight="900" letterSpacing="3">
              COASTAL ANDHRA
            </text>
            <text x="630" y="80" fill="var(--text-muted)" opacity="0.5" fontSize="12" fontWeight="900" letterSpacing="3">
              UTTARANDHRA
            </text>
          </g>

          {/* District Hub Reference Markers & Labels */}
          <g opacity="0.75" style={{ pointerEvents: 'none' }}>
            <circle cx="644" cy="149" r="3" fill="var(--text-main)" />
            <text x="652" y="153" fill="var(--text-main)" fontSize="11" fontWeight="800">Visakhapatnam</text>

            <circle cx="548" cy="219" r="3" fill="var(--text-main)" />
            <text x="556" y="223" fill="var(--text-main)" fontSize="11" fontWeight="800">Kakinada</text>

            <circle cx="390" cy="275" r="3" fill="var(--text-main)" />
            <text x="398" y="279" fill="var(--text-main)" fontSize="11" fontWeight="800">Vijayawada</text>

            <circle cx="340" cy="295" r="3" fill="var(--text-main)" />
            <text x="300" y="299" fill="var(--text-main)" fontSize="11" fontWeight="800">Guntur</text>

            <circle cx="325" cy="469" r="3" fill="var(--text-main)" />
            <text x="333" y="473" fill="var(--text-main)" fontSize="11" fontWeight="800">Nellore</text>

            <circle cx="270" cy="565" r="3" fill="var(--text-main)" />
            <text x="278" y="569" fill="var(--text-main)" fontSize="11" fontWeight="800">Tirupati</text>

            <circle cx="132" cy="332" r="3" fill="var(--text-main)" />
            <text x="140" y="336" fill="var(--text-main)" fontSize="11" fontWeight="800">Kurnool</text>

            <circle cx="78" cy="529" r="3" fill="var(--text-main)" />
            <text x="86" y="533" fill="var(--text-main)" fontSize="11" fontWeight="800">Anantapur</text>
          </g>

          {/* College Pins */}
          {mappedColleges.map(({ uni, loc }) => {
            const isSelected = selectedCollege?.uni.id === uni.id;
            const isHovered = hoveredCollege?.uni.id === uni.id;
            const isVerified = loc.precision === 'verified_campus';
            const color = isVerified ? '#10B981' : '#3B82F6';

            return (
              <g
                key={uni.id}
                transform={`translate(${loc.x}, ${loc.y})`}
                onClick={() => setSelectedCollege({ uni, loc })}
                onMouseEnter={() => setHoveredCollege({ uni, loc })}
                onMouseLeave={() => setHoveredCollege(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Ping wave for selected or hovered pin */}
                {(isSelected || isHovered) && (
                  <circle
                    r="18"
                    fill={color}
                    opacity="0.25"
                    style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                  />
                )}

                {/* Base Shadow */}
                <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.2)" />

                {/* Pin Head */}
                <circle
                  r={isSelected ? 10 : isHovered ? 9 : 7}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                  style={{
                    filter: `drop-shadow(0 3px 6px ${color}60)`,
                    transition: 'r 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />

                {/* Pin Center Dot */}
                <circle r={isSelected ? 3.5 : 2.5} fill="#fff" />
              </g>
            );
          })}
        </svg>

        {/* Floating College Hover Tooltip */}
        {hoveredCollege && !selectedCollege && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(75, Math.max(10, (hoveredCollege.loc.x / 800) * 100))}%`,
              top: `${Math.max(10, (hoveredCollege.loc.y / 650) * 100 - 8)}%`,
              transform: 'translate(-50%, -100%)',
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              padding: '8px 12px',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              zIndex: 20,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>
              {hoveredCollege.uni.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
              <span>{hoveredCollege.uni.city}</span>
              <span>•</span>
              <span style={{ color: 'var(--primary)', fontWeight: '700' }}>NAAC {hoveredCollege.uni.naac}</span>
            </div>
          </div>
        )}

        {/* Selected College Detail Popup Card */}
        <AnimatePresence>
          {selectedCollege && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                maxWidth: '440px',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 30
              }}
            >
              <button
                onClick={() => setSelectedCollege(null)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'var(--primary-light)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--primary)'
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <img
                  src={selectedCollege.uni.image}
                  alt={selectedCollege.uni.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '14px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '1px solid var(--border)'
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedCollege.uni.code && (
                      <span style={{
                        background: 'var(--primary)',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '900',
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px'
                      }}>
                        [{selectedCollege.uni.code}]
                      </span>
                    )}
                    <span style={{
                      background: selectedCollege.loc.precision === 'verified_campus' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                      color: selectedCollege.loc.precision === 'verified_campus' ? '#059669' : '#2563EB',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '10.5px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {selectedCollege.loc.precision === 'verified_campus' ? (
                        <><CheckCircle2 size={11} /> Verified Campus</>
                      ) : (
                        <><Building size={11} /> City Centroid</>
                      )}
                    </span>
                    <span style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '10.5px',
                      fontWeight: '800'
                    }}>
                      NAAC {selectedCollege.uni.naac}
                    </span>
                    {selectedCollege.uni.region && (
                      <span style={{
                        background: 'var(--surface-hover)',
                        color: 'var(--text-muted)',
                        padding: '2px 7px',
                        borderRadius: '999px',
                        fontSize: '10px',
                        fontWeight: '700'
                      }}>
                        {selectedCollege.uni.region} Pool
                      </span>
                    )}
                  </div>

                  <h3 style={{
                    fontSize: '15.5px',
                    fontWeight: '800',
                    color: 'var(--text-main)',
                    margin: '6px 0 3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {selectedCollege.uni.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
                    <span>
                      {selectedCollege.loc.notes ? `${selectedCollege.loc.notes}, ${selectedCollege.uni.city}` : `${selectedCollege.uni.city}, ${selectedCollege.uni.district ? selectedCollege.uni.district + ' District, ' : ''}Andhra Pradesh`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                    Convener Fee
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                    {selectedCollege.uni.feeIntelligence?.convenerQuotaFee
                      ? `₹${(selectedCollege.uni.feeIntelligence.convenerQuotaFee / 1000).toFixed(0)}K/yr`
                      : 'Fee on inquiry'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                    Avg Package
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                    {selectedCollege.uni.avgPackage
                      ? `₹${(selectedCollege.uni.avgPackage / 100000).toFixed(1)} LPA`
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {/* CTA Action */}
              <button
                onClick={() => navigate(`/university/${selectedCollege.uni.id}`)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>View Full Institution Profile</span>
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
