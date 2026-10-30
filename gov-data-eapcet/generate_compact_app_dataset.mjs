#!/usr/bin/env node
// gov-data-eapcet/generate_compact_app_dataset.mjs
// =============================================================================
// Deterministic Build-Time Generator for EduDiscovery Official Cutoffs Dataset
//
// Reads verified normalized staging datasets from gov-data-eapcet/staging/
// Filters to EduDiscovery-supported EAPCET MPC colleges mapped in college_code_map.json
// Produces lazy-loadable compact year files in public/data/official-cutoffs/{year}.json
// and a master manifest in public/data/official-cutoffs/manifest.json.
//
// Key Principles:
// - Keeps full 54.5 MB statewide normalized files safely in gov-data-eapcet/staging/
// - Strictly zero fuzzy matching; uses reviewed official college code mappings
// - Preserves year, collegeCode, internal collegeId, branch, category, gender, quota region,
//   closing rank, explicit rankStatus, rawSourceValue, tuitionFee, and source provenance
// - Preserves empty/unallotted without converting them to numbers or 0
// - Records source URL, SHA-256 digest, source year, and generator version
// - Retains the historical college code and historical name per cutoff tuple to eliminate ambiguity
// =============================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STAGING_DIR = path.join(__dirname, 'staging');
const SOURCES_PATH = path.join(__dirname, 'sources.json');
const CODE_MAP_PATH = path.join(__dirname, 'college_code_map.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'official-cutoffs');

const GENERATOR_VERSION = '2.3.0-preview';

function generateCompactDataset() {
  console.log('======================================================================');
  console.log('GENERATING COMPACT APPLICATION DATASET FOR EDUDISCOVERY');
  console.log('======================================================================');

  if (!fs.existsSync(SOURCES_PATH) || !fs.existsSync(CODE_MAP_PATH)) {
    console.error('❌ Missing sources.json or college_code_map.json');
    process.exit(1);
  }

  const sourcesConfig = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
  const codeMapData = JSON.parse(fs.readFileSync(CODE_MAP_PATH, 'utf8'));
  const mappings = codeMapData.mappings || {};
  const supportedRegistry = codeMapData.supportedRegistry || [];

  // Create output directory if it does not exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest = {
    generatorVersion: GENERATOR_VERSION,
    generatedAt: new Date().toISOString(),
    supportedCollegesCount: supportedRegistry.length,
    years: {},
    disclaimer: 'Official APSCHE closing ranks are reference guidance based on past counseling rounds, not a guarantee of admission.',
    promotionStatus: 'READY_FOR_REVIEW'
  };

  const years = Object.keys(sourcesConfig.years).sort().reverse(); // ['2024', '2023', '2022']

  for (const year of years) {
    const cycleConfig = sourcesConfig.years[year];
    const stagingFile = path.join(STAGING_DIR, `${year}_normalized_cutoffs.json`);

    if (!fs.existsSync(stagingFile)) {
      console.error(`❌ Staged file missing for ${year}: ${stagingFile}`);
      process.exit(1);
    }

    console.log(`\nProcessing Admission Cycle ${year} (Academic Year ${cycleConfig.academicYear})...`);
    const records = JSON.parse(fs.readFileSync(stagingFile, 'utf8'));

    // Filter to only records whose collegeCode is mapped in college_code_map.json
    const collegesMap = {};
    const matchedCodes = new Set();
    const branchSet = new Set();
    let totalRecordsCount = 0;

    for (const r of records) {
      const mapping = mappings[r.collegeCode];
      if (!mapping) continue;

      matchedCodes.add(r.collegeCode);
      branchSet.add(r.branchCode);
      totalRecordsCount++;

      const cId = mapping.id || mapping.universityId;
      if (!collegesMap[cId]) {
        collegesMap[cId] = {
          code: r.collegeCode,
          name: mapping.name || mapping.canonicalName || r.collegeName,
          historicalCodes: [],
          cutoffs: []
        };
      }

      if (!collegesMap[cId].historicalCodes.includes(r.collegeCode)) {
        collegesMap[cId].historicalCodes.push(r.collegeCode);
      }

      // Compact cutoff tuple adhering to schema:
      // 0: branchCode, 1: quotaRegion, 2: category, 3: genderPool,
      // 4: closingRank, 5: rankStatus, 6: rawSourceValue, 7: sourceLocation, 8: tuitionFee,
      // 9: sourceCollegeCode, 10: sourceCollegeName
      collegesMap[cId].cutoffs.push([
        r.branchCode,
        r.quotaRegion,
        r.category,
        r.genderPool,
        r.closingRank,
        r.rankStatus,
        r.rawSourceValue,
        r.source.cellAddress || (r.source.pageNumber ? `Page ${r.source.pageNumber}` : null),
        r.tuitionFee,
        r.collegeCode,
        mapping.historicalName || r.collegeName
      ]);
    }

    // Sort cutoffs deterministically inside each college
    for (const cId of Object.keys(collegesMap)) {
      collegesMap[cId].cutoffs.sort((a, b) => {
        if (a[0] !== b[0]) return a[0].localeCompare(b[0]); // branch
        if (a[1] !== b[1]) return a[1].localeCompare(b[1]); // region
        if (a[2] !== b[2]) return a[2].localeCompare(b[2]); // category
        if (a[3] !== b[3]) return a[3].localeCompare(b[3]); // gender
        return (a[9] || '').localeCompare(b[9] || ''); // sourceCollegeCode
      });
    }

    const yearDataPayload = {
      academicYear: cycleConfig.academicYear,
      admissionCycle: year,
      sourceDocumentUrl: cycleConfig.directDocumentUrl,
      sourceSha256: cycleConfig.pinnedSha256,
      sourceFormat: cycleConfig.expectedFormat,
      schema: [
        'branchCode',
        'quotaRegion',
        'category',
        'genderPool',
        'closingRank',
        'rankStatus',
        'rawSourceValue',
        'sourceLocation',
        'tuitionFee',
        'sourceCollegeCode',
        'sourceCollegeName'
      ],
      totalRecords: totalRecordsCount,
      distinctColleges: Object.keys(collegesMap).length,
      distinctOfficialCodes: matchedCodes.size,
      distinctBranches: branchSet.size,
      colleges: collegesMap
    };

    const outFilePath = path.join(OUTPUT_DIR, `${year}.json`);
    const jsonString = JSON.stringify(yearDataPayload);
    fs.writeFileSync(outFilePath, jsonString, 'utf8');

    const fileSizeBytes = Buffer.byteLength(jsonString, 'utf8');
    const fileSizeKB = (fileSizeBytes / 1024).toFixed(1);

    manifest.years[year] = {
      academicYear: cycleConfig.academicYear,
      file: `${year}.json`,
      sizeKB: parseFloat(fileSizeKB),
      recordsCount: totalRecordsCount,
      collegesCount: Object.keys(collegesMap).length,
      officialCodesCount: matchedCodes.size,
      sha256: crypto.createHash('sha256').update(jsonString).digest('hex'),
      sourceSha256: cycleConfig.pinnedSha256,
      sourceDocumentUrl: cycleConfig.directDocumentUrl
    };

    console.log(`  ✓ Written: ${outFilePath}`);
    console.log(`  Records: ${totalRecordsCount} across ${Object.keys(collegesMap).length} supported colleges (${matchedCodes.size} official codes)`);
    console.log(`  Compact payload size: ${fileSizeKB} KB (Uncompressed)`);
  }

  // Save manifest
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n✓ Manifest written to: ${manifestPath}`);
  console.log('======================================================================\n');
}

generateCompactDataset();
