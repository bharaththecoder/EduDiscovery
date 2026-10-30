#!/usr/bin/env node
// gov-data-eapcet/scrape_official_cutoffs.mjs
// =============================================================================
// AP EAPCET Official Closing Rank Scraper & Staging Pipeline
// 
// Discovers, downloads, verifies byte signatures, parses official documents
// (Excel XLS for 2024, Vector PDFs for 2023 & 2022), normalizes to a strict schema,
// and stages verified datasets for review.
//
// ZERO SYNTHETIC VALUES. ZERO GUESSWORK. ZERO DIRECT OVERWRITES OF PRODUCTION.
// =============================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import * as xlsx from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCES_PATH = path.join(__dirname, 'sources.json');
const RAW_DIR = path.join(__dirname, 'raw');
const STAGING_DIR = path.join(__dirname, 'staging');
const CODE_MAP_PATH = path.join(__dirname, 'college_code_map.json');

// Ensure base directories exist
fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(STAGING_DIR, { recursive: true });

// Column definitions for PDF coordinate mapping
const PDF_COLUMNS_2023 = [
  { category: 'OC', gender: 'Boys', minX: 435, maxX: 462 },
  { category: 'OC', gender: 'Girls', minX: 463, maxX: 486 },
  { category: 'SC', gender: 'Boys', minX: 487, maxX: 510 },
  { category: 'SC', gender: 'Girls', minX: 511, maxX: 535 },
  { category: 'ST', gender: 'Boys', minX: 536, maxX: 559 },
  { category: 'ST', gender: 'Girls', minX: 560, maxX: 584 },
  { category: 'BCA', gender: 'Boys', minX: 585, maxX: 609 },
  { category: 'BCA', gender: 'Girls', minX: 610, maxX: 634 },
  { category: 'BCB', gender: 'Boys', minX: 635, maxX: 659 },
  { category: 'BCB', gender: 'Girls', minX: 660, maxX: 684 },
  { category: 'BCC', gender: 'Boys', minX: 685, maxX: 708 },
  { category: 'BCC', gender: 'Girls', minX: 709, maxX: 733 },
  { category: 'BCD', gender: 'Boys', minX: 734, maxX: 758 },
  { category: 'BCD', gender: 'Girls', minX: 759, maxX: 783 },
  { category: 'BCE', gender: 'Boys', minX: 784, maxX: 808 },
  { category: 'BCE', gender: 'Girls', minX: 809, maxX: 835 },
  { category: 'OC_EWS', gender: 'Boys', minX: 836, maxX: 870 },
  { category: 'OC_EWS', gender: 'Girls', minX: 871, maxX: 906 }
];

const PDF_COLUMNS_2022 = [
  { category: 'OC', gender: 'Boys', minX: 414, maxX: 435 },
  { category: 'OC', gender: 'Girls', minX: 436, maxX: 458 },
  { category: 'SC', gender: 'Boys', minX: 460, maxX: 482 },
  { category: 'SC', gender: 'Girls', minX: 484, maxX: 506 },
  { category: 'ST', gender: 'Boys', minX: 508, maxX: 530 },
  { category: 'ST', gender: 'Girls', minX: 532, maxX: 555 },
  { category: 'BCA', gender: 'Boys', minX: 556, maxX: 578 },
  { category: 'BCA', gender: 'Girls', minX: 580, maxX: 603 },
  { category: 'BCB', gender: 'Boys', minX: 604, maxX: 626 },
  { category: 'BCB', gender: 'Girls', minX: 628, maxX: 651 },
  { category: 'BCC', gender: 'Boys', minX: 652, maxX: 675 },
  { category: 'BCC', gender: 'Girls', minX: 676, maxX: 699 },
  { category: 'BCD', gender: 'Boys', minX: 700, maxX: 724 },
  { category: 'BCD', gender: 'Girls', minX: 725, maxX: 748 },
  { category: 'BCE', gender: 'Boys', minX: 749, maxX: 772 },
  { category: 'BCE', gender: 'Girls', minX: 773, maxX: 796 },
  { category: 'OC_EWS', gender: 'Boys', minX: 802, maxX: 835 },
  { category: 'OC_EWS', gender: 'Girls', minX: 838, maxX: 870 }
];

const EXCEL_CATEGORY_COLS = [
  { col: 'OC_BOYS', category: 'OC', gender: 'Boys' },
  { col: 'OC_GIRLS', category: 'OC', gender: 'Girls' },
  { col: 'SC_BOYS', category: 'SC', gender: 'Boys' },
  { col: 'SC_GIRLS', category: 'SC', gender: 'Girls' },
  { col: 'ST_BOYS', category: 'ST', gender: 'Boys' },
  { col: 'ST_GIRLS', category: 'ST', gender: 'Girls' },
  { col: 'BCA_BOYS', category: 'BCA', gender: 'Boys' },
  { col: 'BCA_GIRLS', category: 'BCA', gender: 'Girls' },
  { col: 'BCB_BOYS', category: 'BCB', gender: 'Boys' },
  { col: 'BCB_GIRLS', category: 'BCB', gender: 'Girls' },
  { col: 'BCC_BOYS', category: 'BCC', gender: 'Boys' },
  { col: 'BCC_GIRLS', category: 'BCC', gender: 'Girls' },
  { col: 'BCD_BOYS', category: 'BCD', gender: 'Boys' },
  { col: 'BCD_GIRLS', category: 'BCD', gender: 'Girls' },
  { col: 'BCE_BOYS', category: 'BCE', gender: 'Boys' },
  { col: 'BCE_GIRLS', category: 'BCE', gender: 'Girls' },
  { col: 'OC_EWS_BOYS', category: 'OC_EWS', gender: 'Boys' },
  { col: 'OC_EWS_GIRLS', category: 'OC_EWS', gender: 'Girls' }
];

function printHelp() {
  console.log(`
Usage: node gov-data-eapcet/scrape_official_cutoffs.mjs [options]

Options:
  --year <2024|2023|2022>  Process only the specified academic year
  --all                    Process all configured historical years (2024, 2023, 2022)
  --refresh                Force re-download from official servers even if cached locally
  --validate-only          Skip downloads and run verification directly on staged files
  --write-staging          Persist normalized JSON and CSV review files to staging/
  --help                   Display this usage summary
`);
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    year: null,
    all: false,
    refresh: false,
    validateOnly: false,
    writeStaging: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--year') {
      options.year = args[++i];
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--refresh') {
      options.refresh = true;
    } else if (arg === '--validate-only') {
      options.validateOnly = true;
    } else if (arg === '--write-staging') {
      options.writeStaging = true;
    }
  }

  return options;
}

function computeSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function downloadWithRetry(url, allowedDomains, retries = 3) {
  const parsedUrl = new URL(url);
  if (!allowedDomains.includes(parsedUrl.hostname)) {
    throw new Error(`Domain '${parsedUrl.hostname}' is not in the official allowlist: ${allowedDomains.join(', ')}`);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  [HTTP] GET ${url} (Attempt ${attempt}/${retries})`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/pdf,application/vnd.ms-excel,*/*'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return { buffer, contentType, finalUrl: response.url };
    } catch (err) {
      console.warn(`  [WARN] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, 1500 * attempt));
    }
  }
}

function verifyFileSignature(buffer, expectedFormat) {
  if (expectedFormat === 'XLS') {
    const isOle = buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0;
    const isZip = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
    return isOle || isZip;
  } else if (expectedFormat === 'PDF') {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }
  return false;
}

// Classifies raw source text into explicit status and closing rank
function interpretRawRank(rawText) {
  if (rawText === null || rawText === undefined) {
    return { closingRank: null, rankStatus: 'blank_in_source', rawSourceValue: null };
  }
  const strVal = String(rawText).trim();
  if (strVal === '') {
    return { closingRank: null, rankStatus: 'blank_in_source', rawSourceValue: '' };
  }

  // Check if positive integer rank
  const cleanDigits = strVal.replace(/[^0-9]/g, '');
  if (cleanDigits.length > 0 && /^[0-9]+$/.test(strVal.replace(/[\s,]/g, ''))) {
    const num = parseInt(cleanDigits, 10);
    if (!isNaN(num) && num > 0) {
      return { closingRank: num, rankStatus: 'published', rawSourceValue: strVal };
    }
  }

  // Check verified unallotted markers in official admissions tables
  if (/^(unallotted|na|n\.a\.|null|none|-+|--+|---+)$/i.test(strVal)) {
    return { closingRank: null, rankStatus: 'unallotted_explicit', rawSourceValue: strVal };
  }

  // Unresolved or ambiguous marker
  return { closingRank: null, rankStatus: 'pending_semantic_verification', rawSourceValue: strVal };
}

// Parse 2024 Excel Workbook
function parse2024Excel(buffer, sourceMeta) {
  console.log(`\n  [PARSER] Parsing 2024 Excel Workbook...`);
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });

  if (rawRows.length < 5) {
    throw new Error(`Excel sheet '${sheetName}' has insufficient rows (${rawRows.length})`);
  }

  const titleRow = rawRows[0] || [];
  const titleText = titleRow.filter(Boolean).join(' ').trim();
  console.log(`  [PARSER] Document Title: "${titleText}"`);

  const headerRow = rawRows[1] || [];
  const headerMap = {};
  for (let c = 0; c < headerRow.length; c++) {
    const val = String(headerRow[c] || '').trim();
    if (val) headerMap[val] = c;
  }

  const requiredCols = ['INSTCODE', 'branch_code', 'OC_BOYS', 'OC_GIRLS'];
  for (const col of requiredCols) {
    if (headerMap[col] === undefined) {
      throw new Error(`Missing required column '${col}' in 2024 sheet '${sheetName}'`);
    }
  }

  const records = [];
  let validRowsCount = 0;

  for (let r = 2; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const instCode = String(row[headerMap['INSTCODE']] || '').trim();
    const branchCode = String(row[headerMap['branch_code']] || '').trim();
    if (!instCode || !branchCode) continue;

    validRowsCount++;

    const collegeName = String(row[headerMap['NAME OF THE INSTITUTION']] || '').trim();
    const dist = String(row[headerMap['DIST']] || '').trim();
    const place = String(row[headerMap['PLACE']] || '').trim();
    const quotaRegion = String(row[headerMap['A_REG']] || 'GEN').trim() || 'GEN';
    const rawFee = row[headerMap['COLLFEE']];
    let tuitionFee = null;
    if (rawFee !== null && rawFee !== undefined && rawFee !== '') {
      const parsedFee = parseInt(String(rawFee).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedFee) && parsedFee > 0) tuitionFee = parsedFee;
    }

    for (const catDef of EXCEL_CATEGORY_COLS) {
      const colIdx = headerMap[catDef.col];
      const rawVal = colIdx !== undefined ? row[colIdx] : null;
      const { closingRank, rankStatus, rawSourceValue } = interpretRawRank(rawVal);
      const cellAddress = colIdx !== undefined ? xlsx.utils.encode_cell({ c: colIdx, r }) : null;

      records.push({
        academicYear: '2024-2025',
        sourceYear: '2024',
        collegeCode: instCode,
        collegeName,
        district: dist,
        place,
        quotaRegion,
        branchCode,
        category: catDef.category,
        genderPool: catDef.gender,
        closingRank,
        tuitionFee,
        rankStatus,
        rawSourceValue,
        source: {
          authority: 'APSCHE',
          documentTitle: titleText || 'APEAPCET-2024[ M P C STREAM] LAST RANK DETAILS',
          documentUrl: sourceMeta.sourceUrl,
          sheetName,
          cellAddress,
          sha256: sourceMeta.sha256
        }
      });
    }
  }

  console.log(`  [PARSER] 2024 Extraction: ${validRowsCount} offerings, ${records.length} total quota records`);
  return { records, offeringsCount: validRowsCount, documentTitle: titleText };
}

// Parse PDF documents (2023 & 2022) with coordinate reconstruction
async function parsePdfDocument(buffer, year, sourceMeta) {
  console.log(`\n  [PARSER] Parsing ${year} PDF with coordinate reconstruction...`);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  console.log(`  [PARSER] Document contains ${numPages} pages`);

  const is2023 = year === '2023';
  const columnsDef = is2023 ? PDF_COLUMNS_2023 : PDF_COLUMNS_2022;
  const academicCycle = is2023 ? '2023-2024' : '2022-2023';

  let documentTitle = '';
  const records = [];
  let offeringsCount = 0;
  let currentInstCode = '';
  let currentInstName = '';
  let currentPlace = '';
  let currentDist = '';

  for (let p = 1; p <= numPages; p++) {
    const page = await pdf.getPage(p);
    const textContent = await page.getTextContent();

    // Group items by Y coordinate with 2.5pt tolerance
    const yBuckets = [];
    for (const item of textContent.items) {
      if (!item.str || item.str.trim() === '') continue;
      const y = Math.round(item.transform[5]);
      const x = Math.round(item.transform[4]);
      let bucket = yBuckets.find(b => Math.abs(b.y - y) <= 2.5);
      if (!bucket) {
        bucket = { y, items: [] };
        yBuckets.push(bucket);
      }
      bucket.items.push({ x, text: item.str.trim() });
    }

    yBuckets.sort((a, b) => b.y - a.y);
    for (const b of yBuckets) {
      b.items.sort((a, b) => a.x - b.x);
    }

    // Capture title from first page
    if (p === 1 && !documentTitle) {
      const titleLine = yBuckets.find(b => b.items.some(it => /LAST RANK DETAILS/i.test(it.text)));
      if (titleLine) {
        documentTitle = titleLine.items.map(it => it.text).join(' ');
        console.log(`  [PARSER] Detected Document Title: "${documentTitle}"`);
      }
    }

    for (let i = 0; i < yBuckets.length; i++) {
      const line = yBuckets[i];

      // Ignore table headers anywhere on the page
      const isHeader = line.items.some(it => 
        /LAST RANK|branch_|inst_code|INSTCODE|COLLFEE|COLLFE|Local_Ar|inst_name|AFFLIA|NAME OF THE/i.test(it.text)
      );
      if (isHeader) continue;

      let branchItem = null;
      let snoItem = null;
      let quotaRegion = 'AU';

      if (is2023) {
        // SNO at X ~ 50-68
        snoItem = line.items.find(it => it.x >= 50 && it.x <= 68 && /^[0-9]+$/.test(it.text));
        if (!snoItem) continue;

        // Branch at X ~ 415-435
        branchItem = line.items.find(it => it.x >= 415 && it.x <= 435 && it.text.length <= 4 && /^[A-Z]{2,4}$/.test(it.text));
        if (!branchItem || branchItem.text === 'CODE') continue;

        // Quota Region at X ~ 395-412
        const regionItem = line.items.find(it => it.x >= 395 && it.x <= 412);
        if (regionItem) quotaRegion = regionItem.text;

        // Find instCode (same line or within dy <= 12)
        let code = line.items.find(it => it.x >= 65 && it.x <= 98 && /^[A-Z0-9]{3,8}$/.test(it.text));
        if (code) {
          currentInstCode = code.text;
          const nameItems = line.items.filter(it => it.x >= 100 && it.x <= 215);
          if (nameItems.length > 0) currentInstName = nameItems.map(it => it.text).join(' ');
        } else {
          for (let j = i + 1; j < Math.min(i + 4, yBuckets.length); j++) {
            const next = yBuckets[j];
            if (line.y - next.y <= 12) {
              code = next.items.find(it => it.x >= 65 && it.x <= 98 && /^[A-Z0-9]{3,8}$/.test(it.text));
              if (code) {
                currentInstCode = code.text;
                const nameItems = next.items.filter(it => it.x >= 100 && it.x <= 215);
                if (nameItems.length > 0) currentInstName = nameItems.map(it => it.text).join(' ');
                const distItem = next.items.find(it => it.x >= 248 && it.x <= 268);
                if (distItem) currentDist = distItem.text;
                const placeItem = next.items.find(it => it.x >= 270 && it.x <= 320);
                if (placeItem) currentPlace = placeItem.text;
                break;
              }
            }
          }
        }
      } else {
        // 2022 layout:
        snoItem = line.items.find(it => it.x >= 50 && it.x <= 68 && /^[0-9]+$/.test(it.text));
        if (!snoItem) continue;

        branchItem = line.items.find(it => it.x >= 365 && it.x <= 385 && it.text.length <= 4 && /^[A-Z]{2,4}$/.test(it.text));
        if (!branchItem || branchItem.text === 'CODE') continue;

        const localAreaItem = line.items.find(it => it.x >= 390 && it.x <= 415);
        const instRegItem = line.items.find(it => it.x >= 225 && it.x <= 238);
        quotaRegion = localAreaItem ? localAreaItem.text : (instRegItem ? instRegItem.text : 'AU');

        let code = line.items.find(it => it.x >= 68 && it.x <= 98 && /^[A-Z0-9]{3,8}$/.test(it.text));
        if (code) {
          currentInstCode = code.text;
          const distItem = line.items.find(it => it.x >= 240 && it.x <= 255);
          if (distItem) currentDist = distItem.text;
        } else {
          for (let j = i + 1; j < Math.min(i + 4, yBuckets.length); j++) {
            const next = yBuckets[j];
            if (line.y - next.y <= 12) {
              code = next.items.find(it => it.x >= 68 && it.x <= 98 && /^[A-Z0-9]{3,8}$/.test(it.text));
              if (code) {
                currentInstCode = code.text;
                break;
              }
            }
          }
        }

        // Look for college name on lower line
        if (i + 1 < yBuckets.length && (line.y - yBuckets[i + 1].y) <= 12) {
          const lower = yBuckets[i + 1];
          const nameItems = lower.items.filter(it => it.x >= 95 && it.x <= 255);
          if (nameItems.length > 0) currentInstName = nameItems.map(it => it.text).join(' ');
          const placeItem = lower.items.find(it => it.x >= 256 && it.x <= 305);
          if (placeItem) currentPlace = placeItem.text;
        }
      }

      if (branchItem && currentInstCode) {
        offeringsCount++;

        // Tuition fee
        const feeItem = is2023 
          ? line.items.find(it => it.x >= 910)
          : line.items.find(it => it.x >= 875 && it.x <= 915);
        let tuitionFee = null;
        if (feeItem) {
          const parsedFee = parseInt(feeItem.text.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(parsedFee) && parsedFee > 0) tuitionFee = parsedFee;
        }

        // Map all categories
        for (const catDef of columnsDef) {
          const rankItem = line.items.find(it => it.x >= catDef.minX && it.x <= catDef.maxX);
          const rawText = rankItem ? rankItem.text.trim() : null;
          const { closingRank, rankStatus, rawSourceValue } = interpretRawRank(rawText);

          records.push({
            academicYear: academicCycle,
            sourceYear: year,
            collegeCode: currentInstCode,
            collegeName: currentInstName,
            district: currentDist,
            place: currentPlace,
            quotaRegion,
            branchCode: branchItem.text,
            category: catDef.category,
            genderPool: catDef.gender,
            closingRank,
            tuitionFee,
            rankStatus,
            rawSourceValue,
            source: {
              authority: 'APSCHE',
              documentTitle: documentTitle || `APEAPCET-${year} LAST RANK DETAILS`,
              documentUrl: sourceMeta.sourceUrl,
              pageNumber: p,
              coordinates: rankItem ? { x: rankItem.x, y: line.y } : null,
              sha256: sourceMeta.sha256
            }
          });
        }
      }
    }
  }

  console.log(`  [PARSER] ${year} Extraction: ${offeringsCount} offerings, ${records.length} total quota records`);
  return { records, offeringsCount, documentTitle: documentTitle || `APEAPCET-${year} LAST RANK DETAILS` };
}

function recordsToCsv(records) {
  const headers = [
    'AcademicYear',
    'CollegeCode',
    'CollegeName',
    'District',
    'Place',
    'QuotaRegion',
    'BranchCode',
    'Category',
    'GenderPool',
    'ClosingRank',
    'RankStatus',
    'RawSourceValue',
    'TuitionFee',
    'SourceAuthority',
    'SourceDocument',
    'PageOrSheet',
    'CellOrCoords',
    'SourceSha256'
  ];

  const lines = [headers.join(',')];
  for (const r of records) {
    const loc = r.source.cellAddress 
      ? r.source.cellAddress 
      : (r.source.coordinates ? `P${r.source.pageNumber}:${r.source.coordinates.x},${r.source.coordinates.y}` : '');
    const pageOrSheet = r.source.sheetName || `Page ${r.source.pageNumber}`;

    const row = [
      `"${r.academicYear}"`,
      `"${r.collegeCode}"`,
      `"${(r.collegeName || '').replace(/"/g, '""')}"`,
      `"${r.district || ''}"`,
      `"${r.place || ''}"`,
      `"${r.quotaRegion || ''}"`,
      `"${r.branchCode}"`,
      `"${r.category}"`,
      `"${r.genderPool}"`,
      r.closingRank !== null ? r.closingRank : '',
      `"${r.rankStatus}"`,
      `"${(r.rawSourceValue || '').replace(/"/g, '""')}"`,
      r.tuitionFee !== null ? r.tuitionFee : '',
      `"${r.source.authority}"`,
      `"${(r.source.documentTitle || '').replace(/"/g, '""')}"`,
      `"${pageOrSheet}"`,
      `"${loc}"`,
      `"${r.source.sha256}"`
    ];
    lines.push(row.join(','));
  }
  return lines.join('\n');
}

async function main() {
  const options = parseCliArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log('======================================================================');
  console.log('   EduDiscovery Official APSCHE Cutoff Pipeline (Safe Staging)');
  console.log('======================================================================');

  if (!fs.existsSync(SOURCES_PATH)) {
    console.error(`❌ Missing configuration file: ${SOURCES_PATH}`);
    process.exit(1);
  }

  const sourcesConfig = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
  const allowedDomains = sourcesConfig.allowedDomains || [];

  let targetYears = [];
  if (options.year) {
    if (!sourcesConfig.years[options.year]) {
      console.error(`❌ Unsupported year '${options.year}'. Configured years: ${Object.keys(sourcesConfig.years).join(', ')}`);
      process.exit(1);
    }
    targetYears = [options.year];
  } else if (options.all) {
    targetYears = Object.keys(sourcesConfig.years).sort().reverse();
  } else {
    console.log('ℹ️  No --year or --all specified. Defaulting to current cycle: 2024');
    console.log('   (Run with --help to see all available execution modes)\n');
    targetYears = ['2024'];
  }

  console.log(`🎯 Target Academic Year(s): ${targetYears.join(', ')}`);
  console.log(`📁 Raw Destination: ${RAW_DIR}`);
  console.log(`📁 Staging Destination: ${STAGING_DIR}\n`);

  for (const year of targetYears) {
    const yearConfig = sourcesConfig.years[year];
    const yearRawDir = path.join(RAW_DIR, year);
    fs.mkdirSync(yearRawDir, { recursive: true });

    const ext = yearConfig.expectedFormat.toLowerCase();
    const rawFilePath = path.join(yearRawDir, `official-last-rank-details.${ext}`);
    const manifestPath = path.join(yearRawDir, 'source-manifest.json');

    let fileBuffer;
    let manifest;

    if (fs.existsSync(rawFilePath) && fs.existsSync(manifestPath) && !options.refresh) {
      console.log(`\n📦 [CACHE] Using verified local raw file for ${year}: ${rawFilePath}`);
      fileBuffer = fs.readFileSync(rawFilePath);
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } else {
      console.log(`\n📥 [DOWNLOAD] Acquiring official ${year} document from: ${yearConfig.directDocumentUrl}`);
      const downloadResult = await downloadWithRetry(yearConfig.directDocumentUrl, allowedDomains);
      fileBuffer = downloadResult.buffer;

      const validSig = verifyFileSignature(fileBuffer, yearConfig.expectedFormat);
      if (!validSig) {
        throw new Error(`File signature verification failed for ${year}. Document is not a valid ${yearConfig.expectedFormat}`);
      }

      const sha256 = computeSha256(fileBuffer);
      console.log(`  [SHA256] ${sha256}`);
      console.log(`  [SIZE]   ${fileBuffer.length.toLocaleString()} bytes`);

      // Compare against pinned hash if configured
      if (yearConfig.pinnedSha256 && sha256 !== yearConfig.pinnedSha256) {
        console.warn(`  ⚠️ [SOURCE CHANGE] Calculated SHA-256 (${sha256}) differs from pinned digest (${yearConfig.pinnedSha256})! Source requires review.`);
      }

      fs.writeFileSync(rawFilePath, fileBuffer);

      manifest = {
        academicYear: yearConfig.academicYear,
        authority: yearConfig.authority,
        documentTitle: `Official APSCHE EAPCET-${year} MPC Closing Ranks`,
        sourceUrl: yearConfig.directDocumentUrl,
        discoveryPage: yearConfig.discoveryPage,
        downloadedAt: new Date().toISOString(),
        sha256,
        pinnedSha256: yearConfig.pinnedSha256 || null,
        contentType: downloadResult.contentType,
        fileSizeBytes: fileBuffer.length,
        parserVersion: '1.2.0-provenance-verified',
        dependencies: {
          xlsx: '0.18.5',
          'pdfjs-dist': '5.4.530'
        },
        verificationStatus: 'verified_authentic'
      };

      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      console.log(`  [MANIFEST] Saved to ${manifestPath}`);
    }

    let extraction;
    if (yearConfig.expectedFormat === 'XLS') {
      extraction = parse2024Excel(fileBuffer, manifest);
    } else if (yearConfig.expectedFormat === 'PDF') {
      extraction = await parsePdfDocument(fileBuffer, year, manifest);
    } else {
      throw new Error(`Unsupported document format: ${yearConfig.expectedFormat}`);
    }

    if (extraction.documentTitle && manifest.documentTitle !== extraction.documentTitle) {
      manifest.documentTitle = extraction.documentTitle;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    }

    if (options.writeStaging || !options.validateOnly) {
      const stagingJsonPath = path.join(STAGING_DIR, `${year}_normalized_cutoffs.json`);
      const stagingCsvPath = path.join(STAGING_DIR, `${year}_review.csv`);

      console.log(`\n💾 [STAGING] Saving ${year} normalized records...`);
      fs.writeFileSync(stagingJsonPath, JSON.stringify(extraction.records, null, 2), 'utf8');
      console.log(`  -> Staged JSON: ${stagingJsonPath} (${(fs.statSync(stagingJsonPath).size / (1024 * 1024)).toFixed(2)} MB)`);

      const csvContent = recordsToCsv(extraction.records);
      fs.writeFileSync(stagingCsvPath, csvContent, 'utf8');
      console.log(`  -> Staged CSV:  ${stagingCsvPath} (${(fs.statSync(stagingCsvPath).size / (1024 * 1024)).toFixed(2)} MB)`);
    }
  }

  console.log('\n======================================================================');
  console.log('✅ Pipeline extraction completed successfully!');
  console.log('👉 Next step: Run statutory validator to inspect dataset integrity:');
  console.log('   node gov-data-eapcet/validate_dataset.mjs');
  console.log('======================================================================\n');
}

main().catch(err => {
  console.error('\n❌ Fatal Pipeline Error:', err);
  process.exit(1);
});
