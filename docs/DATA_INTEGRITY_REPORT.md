# EDUDISCOVERY — DATA INTEGRITY & PROVENANCE REPORT

**Audit Date:** November 21, 2026  
**Auditor:** Principal Data Architect & Quality Assurance Specialist  
**Status:** **AUTHORITATIVE DATASETS VALIDATED (PASS)**  

---

## 1. Official Dataset Inventory

EduDiscovery hosts official AP EAPCET / APSCHE admission data in `public/data/official-cutoffs/` accompanied by cryptographic verification manifests.

| Admission Cycle | Academic Year | Source Format | File Name | Size | Total Records | Validated Colleges | Branches |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2024-2025** | 2024 | Official APSCHE Non-SW XLS | `2024.json` | 831 KB | **7,380** | 39 colleges (45 codes) | 55 |
| **2023-2024** | 2023 | APSCHE Gazetted PDF | `2023.json` | 667 KB | **6,768** | 40 colleges (47 codes) | 50 |
| **2022-2023** | 2022 | APSCHE Gazetted PDF | `2022.json` | 662 KB | **6,678** | 40 colleges (46 codes) | 50 |

---

## 2. Schema Structure & Normalization

Each cutoff entry adheres to the strict 11-column tuple schema:
```json
[
  "branchCode",         // e.g. "CSE", "ECE", "CIV", "INF", "CSD"
  "quotaRegion",        // e.g. "AU", "SVU", "UR" (Unreserved)
  "category",           // e.g. "OC", "BC_A", "BC_B", "SC", "ST", "EWS"
  "genderPool",         // "Boys" or "Girls"
  "closingRank",        // integer (e.g. 148777) or null if unallotted
  "rankStatus",         // "published" or "unallotted"
  "rawSourceValue",     // original string from government sheet
  "sourceLocation",     // row/column or sheet reference
  "tuitionFee",         // gazetted annual fee in INR
  "sourceCollegeCode",  // official APSCHE institution code (e.g. "ANURSF", "JNTUK")
  "sourceCollegeName"   // official name as registered with APSCHE
]
```

### Unallotted / Blank Values Preservation:
- In the 2024 dataset, exactly **496 records** represent unallotted seats (where no candidate met eligibility or opted for that specific quota/pool).
- These records are preserved as `closingRank: null` with `rankStatus: "unallotted"`. They are **never** filled with artificial zeroes or fabricated numbers, ensuring true government data fidelity.

---

## 3. Cryptographic Provenance & Sources

Official datasets in `public/data/official-cutoffs/manifest.json` are validated against government source documents:
- **2024 Source URL:** `https://apsche.ap.gov.in/Pdf/APEAMCET2024LASTRANKDETAILSNONSW.XLS`  
  *SHA-256:* `4b216e35375320f0c97a640e67ec6e568e149420e5adb8bf4729e4b07cd363a8`
- **2023 Source URL:** `https://apsche.ap.gov.in/Pdf/APEAPCET2023LASTRANKDETAILS.pdf`  
  *SHA-256:* `498f6dd6eb08d1eed230e5e79bea33660609d1207b92ab0b371de552f073c7c5`
- **2022 Source URL:** `https://apsche.ap.gov.in/Pdf/APEAMCET2022LASTRANKDETAILS.pdf`  
  *SHA-256:* `909ec9b9506919342d95cbe9c8f8a7006aeca2d6e90a0ea12e27455b927db4d9`

---

## 4. University Catalog Resolution Integrity

- In `src/data/universities.ts`, all **60 institution profiles** map directly to official APSCHE institution codes.
- `universityResolution.test.ts` confirms that slug casing (e.g. `VIT-AP` vs `vit-ap`), spaces, and hyphens resolve synchronously to the correct verified record.
- **Result:** **PASS**
