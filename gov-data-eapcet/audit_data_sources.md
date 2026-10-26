# Statutory Government Data Provenance & Verification Ledger
**Admissions Target:** AP EAPCET B.Tech Admissions  
**Primary Cutoff Baseline:** 2024–2025 APSCHE Final Phase Allotment Statement  
**Fee Baseline:** APHERMC G.O.Ms.No.17 Higher Education (EC) Department  
**Quality Principle:** 100% Raw Statutory Records — Zero Synthetic Formulas or Multipliers  

---

## 1. Cutoff Data Source Verification

- **Issuing Authority:** Andhra Pradesh State Council of Higher Education (APSCHE)
- **Document Title:** *AP EAPCET 2024 Admissions — Final Round College-Wise, Branch-Wise Last Rank Statement*
- **Official URL:** `https://eapcet-sche.aptonline.in`
- **Applicable Academic Year:** `2024-2025`
- **Verification Rule:** Every branch cutoff record contains:
  - Raw integer ranks directly from official allotment sheets.
  - `null` for unallotted/vacant category quotas in that round (no fabricated numbers).
  - Explicit `source` object with `authority: "APSCHE"`, `documentRef`, and `academicYear: "2024-2025"`.

---

## 2. Gazetted Convenor Fee Verification

All tuition fees in this dataset are strictly audited against **APHERMC G.O.Ms.No.17**:

| College Code | Institution Name | Location | Region | Category | Official APHERMC Fee | JVD Eligible |
|---|---|---|---|---|---|---|
| `AUCE` | Andhra University College of Engineering (A) | Visakhapatnam | AU | Govt University | **₹35,000 / yr** | Yes |
| `JNUK` | JNTUK Univ. College of Engineering Kakinada | Kakinada | AU | Govt University | **₹35,000 / yr** | Yes |
| `SVUC` | SVU College of Engineering Tirupati | Tirupati | SVU | Govt University | **₹30,000 / yr** | Yes |
| `JNTA` | JNTUA College of Engineering Anantapur | Anantapur | SVU | Govt University | **₹35,000 / yr** | Yes |
| `VRSE` | VR Siddhartha Engineering College (A) | Vijayawada | AU | Private Autonomous | **₹77,000 / yr** | Yes |
| `GVPE` | Gayatri Vidya Parishad College of Engg (A) | Visakhapatnam | AU | Private Autonomous | **₹79,000 / yr** | Yes |
| `RVRJ` | R.V.R. & J.C. College of Engineering (A) | Guntur | AU | Private Autonomous | **₹72,000 / yr** | Yes |
| `SRKR` | S.R.K.R. Engineering College (A) | Bhimavaram | AU | Private Autonomous | **₹75,000 / yr** | Yes |
| `MITS` | Madanapalle Institute of Tech. & Science (A) | Madanapalle | SVU | Private Autonomous | **₹69,800 / yr** | Yes |
| `GMRV` | GMR Institute of Technology (A) | Rajam | AU | Private Autonomous | **₹76,600 / yr** | Yes |
| `MVGR` | MVGR College of Engineering (A) | Vizianagaram | AU | Private Autonomous | **₹76,900 / yr** | Yes |
| `LBRC` | Lakireddy Bali Reddy College of Engg (A) | Mylavaram | AU | Private Autonomous | **₹74,700 / yr** | Yes |
| `AEC` | Aditya Engineering College (A) | Surampalem | AU | Private Autonomous | **₹70,000 / yr** | Yes |
| `SRMAP` | SRM University AP (Cat-A Convenor Quota) | Amaravati | Statewide | Deemed / Private | **₹70,000 / yr** | Yes (Cat-A) |
| `VITAP` | VIT-AP University (Cat-A Convenor Quota) | Amaravati | Statewide | Deemed / Private | **₹70,000 / yr** | Yes (Cat-A) |

---

## 3. Statutory Audit Enforcement

Automated validation script: `node gov-data-eapcet/validate_dataset.mjs`
Enforces:
1. Exact fee match against APHERMC gazetted rates.
2. Rejection of unsourced cutoff entries.
3. Verification of horizontal 33.3% female reservation (`Girls cutoff >= Boys cutoff`).
4. Rejection of synthetic multiplier artifacts.
