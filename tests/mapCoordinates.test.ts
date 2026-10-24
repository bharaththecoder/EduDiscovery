import { describe, it, expect } from 'vitest';
import {
  AP_BOUNDING_BOX,
  AP_CITY_CENTROIDS,
  VERIFIED_CAMPUS_LOCATIONS,
  projectCoordinates,
  getCollegeLocation
} from '../src/data/coordinates';
import { universities } from '../src/data/universities';

describe('Andhra Pradesh Geographic Projection & Coordinates (FEAT-10)', () => {
  it('correctly defines the calibrated Andhra Pradesh bounding box', () => {
    expect(AP_BOUNDING_BOX.minLat).toBe(12.60);
    expect(AP_BOUNDING_BOX.maxLat).toBe(19.20);
    expect(AP_BOUNDING_BOX.minLng).toBe(76.70);
    expect(AP_BOUNDING_BOX.maxLng).toBe(84.80);
    expect(AP_BOUNDING_BOX.canvasWidth).toBe(800);
    expect(AP_BOUNDING_BOX.canvasHeight).toBe(650);
  });

  describe('Mathematical Projection Function', () => {
    it('projects the northwest corner (maxLat, minLng) to (0, 0)', () => {
      const point = projectCoordinates(19.20, 76.70);
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
    });

    it('projects the southeast corner (minLat, maxLng) to (canvasWidth, canvasHeight)', () => {
      const point = projectCoordinates(12.60, 84.80);
      expect(point.x).toBe(800);
      expect(point.y).toBe(650);
    });

    it('projects central Vijayawada (16.5062, 80.6480) within expected bounds', () => {
      const point = projectCoordinates(16.5062, 80.6480);
      expect(point.x).toBeGreaterThan(350);
      expect(point.x).toBeLessThan(450);
      expect(point.y).toBeGreaterThan(240);
      expect(point.y).toBeLessThan(300);
    });

    it('clamps coordinates outside bounding box without throwing NaN', () => {
      const outOfBounds = projectCoordinates(25.0, 90.0);
      expect(isNaN(outOfBounds.x)).toBe(false);
      expect(isNaN(outOfBounds.y)).toBe(false);
      expect(outOfBounds.x).toBe(800);
      expect(outOfBounds.y).toBe(0);
    });
  });

  describe('Dataset City Centroid Coverage', () => {
    it('contains verified centroids for all 29 cities in the university catalog', () => {
      const distinctCities = Array.from(new Set(universities.map(u => u.city)));
      expect(distinctCities.length).toBe(29);

      distinctCities.forEach(city => {
        const centroid = AP_CITY_CENTROIDS[city];
        expect(centroid).toBeDefined();
        expect(centroid.lat).toBeGreaterThanOrEqual(AP_BOUNDING_BOX.minLat);
        expect(centroid.lat).toBeLessThanOrEqual(AP_BOUNDING_BOX.maxLat);
        expect(centroid.lng).toBeGreaterThanOrEqual(AP_BOUNDING_BOX.minLng);
        expect(centroid.lng).toBeLessThanOrEqual(AP_BOUNDING_BOX.maxLng);
      });
    });
  });

  describe('University Location Resolution & Precision Tagging', () => {
    it('marks verified campuses with precision: verified_campus', () => {
      const vit = getCollegeLocation({ id: 'vit-ap', city: 'Amaravati' });
      expect(vit.precision).toBe('verified_campus');
      expect(vit.notes).toContain('Inavolu');
      expect(vit.lat).toBe(16.4950);
      expect(vit.lng).toBe(80.5002);
    });

    it('marks institutions without verified campus coordinates as city_centroid', () => {
      const bapatla = getCollegeLocation({ id: 'bapatla-engg', city: 'Bapatla' });
      expect(bapatla.precision).toBe('city_centroid');
      expect(bapatla.notes).toContain('Centroid');
    });

    it('resolves valid projected coordinates for all 60 universities in dataset', () => {
      expect(universities.length).toBe(60);

      universities.forEach(u => {
        const loc = getCollegeLocation(u);
        expect(loc.x).toBeGreaterThanOrEqual(0);
        expect(loc.x).toBeLessThanOrEqual(800);
        expect(loc.y).toBeGreaterThanOrEqual(0);
        expect(loc.y).toBeLessThanOrEqual(650);
        expect(typeof loc.lat).toBe('number');
        expect(typeof loc.lng).toBe('number');
      });
    });
  });
});
