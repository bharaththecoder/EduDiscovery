import { describe, it, expect } from 'vitest';
import { extractEntities, retrieveCollegeContext } from '@/services/ragEngine';

describe('ragEngine (Structured AP College Retrieval)', () => {
  it('extracts branches, categories, and college aliases correctly', () => {
    const query = 'What is the CSE cutoff for VR Siddhartha for BC-B category in AU region?';
    const entities = extractEntities(query);

    expect(entities.branches).toContain('CSE');
    expect(entities.category).toBe('BC-B');
    expect(entities.region).toBe('AU');
    expect(entities.collegeIds).toContain('vr-siddhartha');
  });

  it('retrieves relevant college facts with strict anti-hallucination header', () => {
    const query = 'Tell me fees and placements for Gayatri Vidya Parishad in Vizag';
    const result = retrieveCollegeContext(query);

    expect(result.retrievedColleges.length).toBeGreaterThan(0);
    const topCollege = result.retrievedColleges[0];
    expect(topCollege.name.toLowerCase()).toContain('gayatri');
    expect(result.factsText).toContain('VERIFIED APHERMC & APSCHE COLLEGE ADMISSIONS DATA');
    expect(result.factsText).toContain('STRICT INSTRUCTION');
  });

  it('correctly digests predictor results into structured web options context', () => {
    const mockPrediction: any = [
      {
        collegeId: 'srm-ap',
        collegeName: 'SRM University AP',
        collegeShortName: 'SRM AP',
        code: 'SRMAP',
        city: 'Amaravati',
        region: 'Statewide',
        branch: 'CSE',
        quota: 'Convener Quota (Cat-A)',
        chance: 'High',
        chanceLabel: 'Safe',
        closingCutoff: 15000,
        probabilityPercent: 92,
        convenerFee: 70000,
        mgmtFee: 350000,
        naac: 'A++',
        nirf: '#12',
        reason: 'Within safe margins'
      }
    ];

    const result = retrieveCollegeContext('Which college should I choose?', mockPrediction, { candidateRank: 12000 });
    expect(result.structuredSummary.isPredictorDriven).toBe(true);
    expect(result.factsText).toContain('Candidate Rank: 12,000');
    expect(result.factsText).toContain('SRM University AP');
    expect(result.factsText).toContain('Safe');
  });
});
