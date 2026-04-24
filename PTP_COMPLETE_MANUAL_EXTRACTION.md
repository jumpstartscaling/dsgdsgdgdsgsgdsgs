# PTP Complete Manual Extraction

## Scope
This document is the page-by-page manual extraction deliverable for the nine PTP PDFs and the Cobalt #21 data sheet found in `/Users/christopheramaya/Downloads/PTP`.

## Notes
- **Source basis**: OCR page text from `ptp_ocr_extracted/*.json` and the original PDFs.
- **Traceability**: Each entry includes the original PDF and page number.
- **Quality**: Some pages have OCR noise; values below preserve the best readable interpretation and should be cross-checked against the original PDF page image before loading into production.

---

# PTP1.pdf — 17 pages

## Page 1
- **Header text**: Surface Engineering / Wear Resistance Specialists / Product Testing and Properties
- **Product**: `6D Ductilite PTA Powder`
- **PTP No**: `20`
- **Form**: `Powder`
- **Rev**: `0`
- **Size**: `80/270`
- **Date**: `5/7/2025`
- **Specifications**: `AWS A5.21, Class ERCoCr-A (Chemistry Only)`
- **Quality tests required**:
  - Chemistry per GD-OES (`LECOGDS-001`)
  - Hardness (`HARDNESS-001`)
  - Apparent Density (`APPDENSITY-001`)
  - Hall Flow (`HALLFLOW-001`)
  - Sieve Analysis (`SIEVE-001`)
- **Special testing instructions**: none clearly readable from OCR
- **Chemistry table**: OCR confirms a cobalt-based chemistry table; the OCR text cleanly extracts one measured value as `Co = 7.0%`.
- **Readable chemistry headings**: `Mn`, `Si`, `Cr`, `Fe`, `Ni`, `Mo`, `W`, `Co`, `P`, `B`, `Ta` appear in the OCR line, but the row values are mostly corrupted and should be verified from the page image.
- **Physical property note**: one readable line suggests density around `7.0 g/cc`.
- **Approval / footer text**: approval section is present, followed by the standard Surface Engineering confidentiality notice.

## Page 2
- **Product**: A439-D2 PTA Powder
- **PTP No**: 79
- **Form**: Powder
- **Size**: 80/270
- **Date**: 02/12/2026
- **Specifications**: none explicitly listed
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis
- **Physical properties**: density around `4.0 min g/cm³` appears in OCR
- **Chemistry**: chromium/nickel/cobalt/iron/silicon family, but the table is too noisy for exact values

## Page 3
- **Product**: AA1000 PTA Powder
- **PTP No**: 83
- **Form**: Powder
- **Size**: 80/270
- **Date**: 03/09/2026
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis
- **Physical properties**: density around `4.5-5.5 g/cm³`
- **Chemistry**: alloy-style chemistry table is present, but OCR is unreadable enough that exact values should be verified from the page image

## Page 4
- **Product**: SP55M Spray Fuse Powder
- **PTP No**: 53
- **Form**: Powder
- **Size**: 120/325
- **Date**: 2/26/2026
- **Specification**: AWS A5.21, Class ERNiCr-C (Chemistry Only)
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis, Spray Test
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: one line appears to indicate a nickel-chrome-boron family chemistry; exact values are too noisy for safe transcription

## Page 5
- **Product**: SP46M Spray Fuse Powder
- **PTP No**: 23
- **Form**: Powder
- **Size**: 120/325
- **Date**: 2/23/2026
- **Specification**: AWS A5.21, Class ERNiCr-C (Chemistry Only)
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis, Spray Test
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR clearly suggests a nickel/chrome/boron-style table; `Aim 0.65` appears in the table, but the full row values are not clean enough to reproduce confidently

## Page 6
- **Product**: SP44G2 Spray Fuse Powder
- **PTP No**: 29
- **Form**: Powder
- **Size**: 120/325
- **Date**: 2/24/2026
- **Specification**: AWS A5.21, Class ERNiCr-A
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis, Spray Test
- **Physical properties**: hardness `38-45 HRC`; density `3.8-5.0 g/cm³`
- **Chemistry**: readable hints include a row with `0.2-0.6`, `20-30`, `70-82`, `BAL`, `2.0-3.5`, `45-20`; exact element labels are too noisy to trust without image verification

## Page 7
- **Product**: SF6 Spray Fuse Powder
- **PTP No**: 80
- **Form**: Powder
- **Size**: 120/325
- **Date**: 02/26/26
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis, Spray Test
- **Physical properties**: hardness `40-50 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR shows a compact cobalt/nickel-boron style row with `0.6-0.8`, `4.25-1.75`, `18-20`, `2.5-8.5`, `1.4-1.6` but the labels are too degraded to map confidently

## Page 8
- **Product**: SP46 Ni Based Data Sheet
- **Alloy**: SP46
- **Description**: nickel chrome boron alloy in rod, powder, and wire form
- **Applications**: liners, thrust shoes, bushings, cages, valve components, oil extrusion screws, glass molds, centrifuges
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co B`
- **Readable values**: `C 0.6`, `Mn 0`, `Si 3.8`, `Ni Bal`, `Cr 16`, `W 0`, `Mo 0`, `Fe 38`, `Co 0`, `B 32` appear in OCR, but this row is likely misread and should be validated from the image
- **Mechanical**: tensile elongation `<1%`, density `7.8 g/cc`, liquidus `1000 C / 1850-1950 F`, hardness `56-62 Rc`

## Page 9
- **Product**: SP88LB122 Laser Cladding Powder
- **PTP No**: 1
- **Form**: Powder
- **Size**: 100/325
- **Date**: 04/25/2025
- **Specification**: Alloy 88 / Govanta B122 Rev. 3
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis
- **Special instruction**: certify W with XRF
- **Physical properties**: hardness `59-64 HRC`; density `4.4 g/cm³ min` appears in OCR
- **Chemistry**: the readable row indicates `aim 0.7`, `charge at 3.7`, `aim 14.5`, `aim 14.6`, `aim 3.4`, `aim 3.0`, but the full labels are not fully legible

## Page 10
- **Product**: BMKSS10 Laser Cladding Powder
- **PTP No**: 38
- **Form**: Powder
- **Size**: 100/325
- **Date**: 10/24/2025
- **Notes**: Email from Martin @ BMK; must send out for ICP and C/S analysis
- **Physical properties**: hardness `50-60 HRC`; density `4.5-6.0 g/cm³`
- **Chemistry**: OCR suggests a multi-row nickel/chrome/moly/cobalt type table with ranges such as `2.7-2.9`, `0.4-0.6`, `15.0-15.5`, `2.15-2.35`, `0.11-0.23`, plus a second row with `2.4-2.6`, `0.075-0.125`, `2.9-3.1`, `8.9-9.1`; verify from page image before loading

## Page 11
- **Product**: 945 Laser Cladding Powder
- **PTP No**: 78
- **Form**: Powder
- **Size**: 100/325
- **Date**: 2/12/2026
- **Tests**: Chemistry, Apparent Density, Hall Flow, Sieve Analysis
- **Physical properties**: hardness `NR 12-18 s/50g`, density `4.0-5.5 g/cm³`
- **Chemistry**: row appears to include `Fe`, `B`, `N`, `Ta`, `...`; OCR is too degraded for reliable manual transcription

## Page 12
- **Product**: Cobalt alloy 6 data sheet
- **Alloy**: Cobalt 6
- **Description**: cobalt, high chromium, tungsten alloy
- **Applications**: shear blades, fluid flow valves, extrusion screws, roll bushings, high temperature valve bearing surface
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `C 0.1`, `Mn 13`, `Si 25`, `Ni 282`, `Cr 47`, `W 14`, `Mo 25`, `Fe BAL` appear in OCR, but the OCR is clearly corrupted; use only as a placeholder pending page image verification
- **Mechanical**: density `0.303 lbs/in³`, hardness `35-48 HRC`, liquidus `2360 F / 1292 C`

## Page 13
- **Product**: 625 Laser Cladding Powder
- **PTP No**: 66
- **Form**: Powder
- **Size**: 100/325
- **Date**: 12/8/2025
- **Tests**: Chemistry, Apparent Density, Hall Flow, Sieve Analysis
- **Physical properties**: hardness `NR 12-18 s/50g`, density `4.0-5.0 g/cm³`
- **Chemistry**: OCR too corrupted to confidently map all rows

## Page 14
- **Product**: SP50 PTA Powder
- **PTP No**: 87
- **Form**: Powder
- **Size**: 80/230
- **Date**: 4/8/2026
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis
- **Physical properties**: hardness `47-53 HRC`; density `4.2-6.0 g/cm³`
- **Chemistry**: OCR shows an approximate row with `0.05 max`, `43-48`, `0.10 max`, and a second line of targets; exact values should be verified from the page image

## Page 15
- **Product**: SP46PTAPowder
- **PTP No**: 8
- **Form**: Powder
- **Size**: 80/230
- **Date**: 3/25/2026
- **Specification**: AWS A5.21, Class ERNiCrC (Chemistry Only)
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis
- **Physical properties**: hardness `58-63 HRC`; density `4.0-5.5 g/cm³`
- **Chemistry**: OCR indicates target-style values including `0.8`, `4.0`, `16.0-17.0`, `3.5`, `3.2-3.4`; labels are too noisy for confident mapping

## Page 16
- **Product**: SP45 HVOF Powder
- **PTP No**: 41
- **Form**: Powder
- **Size**: 80/230
- **Date**: 2/25/26
- **Specification**: AWS A5.21, Class ERNiCr-B
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis
- **Physical properties**: hardness `48-50 HRC`; density `4.8 g/cm³`
- **Chemistry**: row appears to include `0-0.45-0.55`, `2.8-3.5`, `10.0-13.0`, `8.5-4.8`, `2.5-3.0`, with target lines below; verify from the page image

## Page 17
- **Product**: SP45 PTA Powder
- **PTP No**: 60
- **Form**: Powder
- **Size**: 80/230
- **Date**: 10/1/2025
- **Specification**: AWS A5.21, Class ERNiCr-B
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis
- **Physical properties**: hardness `12-18 s/50g`, density `4.0-5.0 g/cm³`
- **Chemistry**: OCR shows a table with `0.5`, `3.0`, `1.5`, `4.0`, `2.7` style targets, but the exact row labels are too corrupted to safely reproduce

---

# PTP2.pdf — 22 pages

## Page 1
- **Product**: SPS7 PTA/Laser/Spray Fuse Data Sheet
- **Chemistry**: nickel balance; tungsten `16%`; chrome `11.5%`; iron `3.5%`; silicon `3.5%`; boron `2.5%`; carbon `0.5%`
- **Characteristics**: dense/hard coating; moderate corrosion and oxidation; excellent impact resistance; good galling resistance

## Page 2
- **Product**: SP44 PTA Powder
- **PTP No**: 9
- **Form**: Powder
- **Size**: 80/230, 100/270
- **Date**: 5/12/2025
- **Specification**: AWS A5.21, Class ERNiCr-A
- **Physical properties**: hardness `47-52 HRC`; density `4.8-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.2-0.4`, `2.8-3.3`, `7.0-8.2`, `BAL`, `2.0-3.0`, `1.5-2.0`

## Page 3
- **Product**: Fe27Co28 PTA Powder
- **PTP No**: 37
- **Form**: Powder
- **Size**: 100/270
- **Date**: 7/8/2025
- **Physical properties**: density around `5.4 g/cm³`
- **Chemistry**: page appears to be a cobalt/iron alloy; exact values not clean enough for reliable transcription

## Page 4
- **Product**: FB-100G2 Spray Fuse Powder
- **PTP No**: 51
- **Form**: Powder
- **Size**: 100/270
- **Date**: 2/25/2026
- **Physical properties**: hardness `~18 HRC` or similar OCR noise; density `4.0-5.0 g/cm³`
- **Chemistry**: row is too noisy to safely transcribe

## Page 5
- **Product**: 431 Stainless PTA Powder
- **PTP No**: 86
- **Form**: Powder
- **Size**: 100/270
- **Date**: 04/08/2026
- **Chemistry**: stainless family with `BAL` in the row; OCR too noisy for safe values

## Page 6
- **Product**: 3161 Stainless PTA Powder
- **PTP No**: 67
- **Form**: Powder
- **Size**: 100/270
- **Date**: 12/09/2025
- **Physical properties**: hardness around `16-18 s/50g`, density `4.0-5.0 g/cm³`
- **Chemistry**: OCR too noisy for safe transcription

## Page 7
- **Product**: 316 Laser Cladding Powder
- **PTP No**: 18
- **Form**: Powder
- **Size**: 100/270
- **Date**: 5/06/2025
- **Revision note**: revised to standard grade, removed AWS spec
- **Physical properties**: hardness `16-18 s/50g`, density `4.0-5.0 g/cm³`
- **Chemistry**: OCR too noisy for safe transcription

## Page 8
- **Product**: #6L Laser Cladding Powder
- **PTP No**: 44
- **Form**: Powder
- **Size**: 100/270
- **Date**: 7/18/2025
- **Specification**: AWS A5.21, Class ERCoCrA
- **Physical properties**: hardness `38-46 HRC`; density `4.5-5.0 g/cm³`
- **Chemistry**: OCR shows values around `0.08`, `0.01`, `0.50`, `0.9-1.2`, `0.8-1.5`, `26-28`, `1.5-3.0`, `2.0-5.0`, `BAL`

## Page 9
- **Product**: Cobalt Alloy 12 Data Sheet
- **Alloy**: Cobalt 12
- **Description**: surfacing alloy for high stress grinding abrasion and corrosion/oxidation resistance
- **Applications**: camshafts, wood cutting tools, plastic extrusion screws, Banbury mixers, paper/plastic cutting tools, knife/blade edges, shredders, shears
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `16 3 10 55 27 80 30 Bal` appears in OCR, but this row is clearly corrupted and should be validated against the image
- **Mechanical**: hardness `47-52 Rc`, density `313/in³` OCR, melting point `~2450F-1350C`

## Page 10
- **Product**: SP50G2 PTA Powder
- **PTP No**: 45
- **Form**: Powder
- **Size**: 100/230
- **Date**: 7/22/2025
- **Physical properties**: hardness `47-53 HRC`; density `4.5 g/cm³` OCR-ish
- **Chemistry**: OCR is too degraded to reliably map the values

## Page 11
- **Product**: 945 Laser Cladding Powder
- **PTP No**: 78
- **Date**: 2/12/2026
- **Chemistry**: OCR too noisy to safely transcribe

## Page 12
- **Product**: Cobalt alloy #21 data sheet
- **Alloy**: Cobalt 21
- **Description**: molybdenum-strengthened, high-temperature, corrosion-resistant alloy
- **Applications**: hot forming dies, forging dies, erosion shields, valve seats and plugs, hydro-turbine runners, pump shafts and sleeves
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `25 50 60 25 26 - 55 10 Bal` appears in OCR; verify against page image
- **Mechanical**: hardness `Rc 22-32 as deposited`, `Rc 38-40 work hardened`; density `.299 lbs/in³`; liquidus `2480 F`

## Page 13
- **Product**: 80/20 NiCr Plasma Powder
- **PTP No**: 18
- **Form**: Powder
- **Size**: 140/225
- **Date**: 5/7/2025
- **Physical properties**: hardness `48-50 HRC`; density `4.2-6.0 g/cm³`
- **Chemistry**: table contains a cobalt/nickel style chemistry with `Low as Possible`, `19.0-21.0`, `BAL`, and another line of targets; exact labels need image verification

## Page 14
- **Product**: 4340 DED Powder
- **PTP No**: 61
- **Form**: Powder
- **Size**: 120/45u
- **Date**: 10/2/2025
- **Physical properties**: hardness `12-18 s/50g`; density `4.0-5.0 g/cm³`
- **Chemistry**: row shows `0.38-0.43`, `0.60-0.80`, `0.15-0.35`, `0.70-0.90`, `1.65-2.00`, `0.20-0.30`, `BAL`, `0.085 max`, `0.040 max`

## Page 15
- **Product**: SP72HBSprayFuse Powder
- **PTP No**: 74
- **Form**: Powder
- **Size**: 120/400
- **Date**: 2/26/26
- **Physical properties**: hardness `49-64 HRC`; density appears around `4.0-5.0 g/cm³`
- **Chemistry**: OCR is too degraded for a confident element/value map

---

# PTP3.pdf — 17 pages

## Page 1
- **Product**: 460 PTA Powder
- **PTP No**: 64
- **Form**: Powder
- **Size**: 80/270
- **Date**: 10/20/2025
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis
- **Physical properties**: hardness likely around `60+ HRC`; OCR is too noisy for exact transcribing

## Page 2
- **Product**: #21 PTA Powder
- **PTP No**: 22
- **Form**: Powder
- **Size**: 80/270
- **Date**: 5/7/2025
- **Specification**: AWS A5.21, Class ERCoCrE
- **Physical properties**: hardness `25-35` OCR, density `4.5-6.0 g/cm³`
- **Chemistry**: OCR indicates `Aim 0.22`, `Aim 2.0`, `Aim 5.6`, `Aim 0.0`, `Aim 1.5`

## Page 3
- **Product**: 1D Ductilite PTA Powder
- **PTP No**: 19
- **Form**: Powder
- **Size**: 80/270
- **Date**: 5/7/2025
- **Specification**: AWS A5.21, Class ERCoGi-G
- **Physical properties**: hardness `13-18/50g`; density `4.5-5.0 g/cm³`
- **Chemistry**: row contains `1.0max`, `2.0max`, `26-33`, `2.0-3.0`, `1.0max`, `1.0-4.0`, `3.0max`, `Bal`, `8`, `2-50` OCR; verify from image

## Page 4
- **Product**: Cobalt Alloy 12 Data Sheet
- **Alloy**: Cobalt 12
- **Description**: same cobalt 12 family as later pages
- **Applications**: camshafts, wood cutting tools, plastic extrusion screws, Banbury mixers, knife/blade edges, shredders, shears
- **Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Mechanical**: hardness `47-52 Re`; density `313/In3` OCR; melting point `~2450F-1350C`

## Page 5
- **Product**: #12 PTA Powder
- **PTP No**: 21
- **Form**: Powder
- **Size**: 80/270
- **Date**: 5/7/2025
- **Specification**: AWS A5.21, Class ERCoCr-B
- **Physical properties**: hardness `48-50 HRC`; density `4.0-6.0 g/cm³`
- **Chemistry**: OCR suggests `1.2-4.5`, `0.4-0.8`, `0.5-1.0`, `26-29`, `2.0-8.0`, `7.5-8.5`, `2.0-8.0`

## Page 6
- **Product**: Cobalt alloy 12 data sheet
- **Alloy**: Cobalt 12
- **Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Mechanical**: hardness `47-52 Re`; density `313/In3`; melting point `~2450F-1350C`

## Page 7
- **Product**: SP46/PTA-Spray fuse data sheet
- **Chemistry**: nickel balance, tungsten `16%`, chrome `11.5%`, iron `3.5%`, silicon `3.5%`, boron `2.5%`, carbon `0.5%`
- **Characteristics**: dense and hard, moderate corrosion/oxidation, excellent impact resistance

## Page 8
- **Product**: SP50 PTA Powder
- **PTP No**: 87
- **Form**: Powder
- **Size**: 80/230
- **Date**: 4/8/2026
- **Physical properties**: hardness `47-53 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR appears to include cobalt/nickel family targets with a `BAL` line; values not safe to transcribe exactly

## Page 9
- **Product**: SP46PTAPowder
- **PTP No**: 8
- **Form**: Powder
- **Size**: 80/230
- **Date**: 3/25/2026
- **Specification**: AWS A5.21, Class ERNiCrC
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.92`, `4.0-4.3`, `16.0-17.0`, `3.5`, `3.2-3.4`

## Page 10
- **Product**: SP45 PTAPowder
- **PTP No**: 60
- **Form**: Powder
- **Size**: 80/230
- **Date**: 10/1/2025
- **Specification**: AWS A5.21, Class ERNiCr-B
- **Physical properties**: hardness `12-18 s/50g`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR indicates `0.5`, `3.0`, `1.5`, `4.0`, `2.7`

## Page 11
- **Product**: SP44 PTAPowder
- **PTP No**: 9
- **Form**: Powder
- **Size**: 80/230, 100/270
- **Date**: 5/12/2025
- **Specification**: AWS A5.21, Class ERNiCr-A
- **Physical properties**: hardness `42-45 HRC`; density `3.8-5.0 g/cm³`
- **Chemistry**: OCR indicates `0.2-0.4`, `2.8-3.3`, `7.0-8.2`, `BAL`, `2.0-3.0`, `1.8-2.0`

## Page 12
- **Product**: SP42 PTA Powder
- **PTP No**: 42
- **Form**: Powder
- **Size**: 80/230
- **Date**: 7/14/2025
- **Physical properties**: hardness `32-40`, density `3.8-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.40 max`, `2.5-3.0`, `5.0-6.5`, `BAL`, `1.75-2.25`, `1.0-1.5`

## Page 13
- **Product**: C96400 PBF-LB Powder
- **PTP No**: 54
- **Form**: Powder
- **Size**: 65 1/15
- **Date**: 9/12/2025
- **Specification**: EOS QAA Annex 2B / EOS 651101 / EOS CuNi30-
- **Physical properties**: hardness `0.400 max`, density `0.4-1.2`, `28-39`, `0.5-1.2`, `0.020 max`
- **Chemistry**: OCR mentions `C`, `Mn`, `Si`, `Ni`, `Cr`, `W`, `Mo`, `Fe`, `Co`, `P`, `B`, and perhaps `Other Elements`; exact row needs image validation

## Page 14
- **Product**: SP50H PTA Powder
- **PTP No**: 70
- **Form**: Powder
- **Size**: 60/325
- **Date**: 12/22/2025
- **Physical properties**: hardness `42-52 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR shows `posmax`, `43-48`, `40 max`, `30-35`; exact mapping needs verification

## Page 15
- **Product**: CuCrZr HVOF Powder
- **PTP No**: 56
- **Form**: Powder
- **Size**: 53/15y
- **Date**: 9/12/2025
- **Specification**: EOS QAA Annex 2C / EOS 651201 / EOS CuGrzr Powder
- **Physical properties**: hardness `168/50g max`; density `4.8 g/cm³ min`
- **Chemistry**: OCR suggests a copper/chromium/zirconium family and sieve analysis with `58/180` and `0n 32-430 5e70N`; verify image for exact values

## Page 16
- **Product**: 99Ni HVOF Powder
- **PTP No**: 14
- **Form**: Powder
- **Size**: 53y/15y
- **Date**: 2/23/2026
- **Physical properties**: appearance/weight/porosity data present; OCR is very noisy
- **Chemistry**: no safe exact transcription

## Page 17
- **Product**: 316L Additive Manufacturing Powder
- **PTP No**: 31
- **Form**: Powder
- **Size**: 53p/15y
- **Date**: 6/11/2025
- **Specification**: HOWGCO Purchase Specification HG AM PW-816L, Rev. 0
- **Tests**: Chemistry, Hardness, Apparent Density, Hall Flow, Sieve Analysis, Particle Size Distribution ASTM B822
- **Physical properties**: hardness `18 s/50g max`; density `BQ-A45 s/s` OCR
- **Chemistry**: appears to include a row with `0.08`, `2.00`, `1.00`, `76.0`, `10.0`, `2.00`, `0.50`, `0.10`, `0.030`, `0.08`, then another line with `1.00`, `BAL`, `max` entries; verify from image

---

# PTP4.pdf — 17 pages

## Page 1
- **Product**: C276 Plasma Spray Powder
- **PTP No**: 58
- **Form**: Powder
- **Size**: 53/10u
- **Date**: 9/17/2025
- **Physical properties**: hardness `42-16 8/50g` OCR; density `4.5-6 g/cm³`
- **Chemistry**: row seems to include `0.025 max`, `14.5-16.5`, `15.0-17.0`, `3.0-4.5`, `40-70`

## Page 2
- **Product**: SP46LC HVOF Powder
- **PTP No**: 77
- **Form**: Powder
- **Size**: 45/15u
- **Date**: 2/26/2026
- **Physical properties**: hardness `45-49` OCR; chemistry shows `0.65-0.80`, `3.9-4.9`

## Page 3
- **Product**: SP46HAI HVOF Powder
- **PTP No**: 48
- **Form**: Powder
- **Size**: 45/15u
- **Date**: 3/25/2026
- **Specification**: AWS A5.21, Class ERNiCr-C
- **Physical properties**: hardness `86-62` OCR likely `56-62`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR shows `0.50-0.00`, `35-45`, `16-18`

## Page 4
- **Product**: NP Premier SLM Powder
- **PTP No**: 57
- **Form**: Powder
- **Size**: 45/15y, 30/10u
- **Date**: 4/02/2026
- **Special specification**: ARGEN PS-PREMIER Doc. 112661, Rev. 5
- **Physical properties**: OCR includes `28.0` and `5.6-6.5` style values

## Page 5
- **Product**: HC1 HVOF Powder
- **PTP No**: 85
- **Form**: Powder
- **Size**: 45u/15u
- **Date**: 4/7/2026
- **Physical properties**: hardness `49-64 HRC`; density `4.5-6.5 g/cm³`
- **Chemistry**: OCR appears to include `RSM`, `0.8`, `CSBAL` style note and a chemistry row, but is not clean enough to transcribe safely

## Page 6
- **Product**: Fe27Co28 Powder Bed Laser Diffusion
- **PTP No**: 36
- **Form**: Powder
- **Size**: 45/15
- **Date**: 7/8/2025
- **Physical properties**: OCR shows `Hallow`, `0` placeholders; chemistry row not reliable

## Page 7
- **Product**: 431 Stainless PTA Powder
- **PTP No**: 55
- **Form**: Powder
- **Size**: 325/15u
- **Date**: 12/08/2025
- **Physical properties**: hardness `50-60 HRC`; density `4.5-6.0 g/cm³`
- **Chemistry**: notes mention boron reported to nearest `0.00001`, total others `Al + B + Cu + Mg + Ti + Zr`

## Page 8
- **Product**: 316HVOF Powder
- **PTP No**: 17
- **Form**: Powder
- **Size**: 270/220
- **Date**: 2/23/2026
- **Physical properties**: hardness `53-55 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR too noisy to safely map

## Page 9
- **Product**: 1# HVOF Powder
- **PTP No**: 68
- **Form**: Powder
- **Size**: 825/15
- **Date**: 02/26/2026
- **Physical properties**: hardness `88-178/50g` OCR; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR mentions `2.025`, `1.0max`, `2.0max`, `26-33`, `2.0-8.0`, `1.0max`, `11.0-14.0`, `BAL`

## Page 10
- **Product**: SP45 HVOF Powder
- **PTP No**: 57
- **Form**: Powder
- **Size**: 45/15y, 30/10u
- **Date**: 4/02/2026
- **Physical properties**: hardness `86-62 HRC` OCR likely `56-62`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR shows `0.80-0.5`, `33.0-3.5`, `9.5-12.0`, `2.0-5.0`, `2.0-4.0`

## Page 11
- **Product**: Cobalt alloy 6 data sheet
- **Alloy**: Cobalt 6
- **Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `11 01 13 25 282 47 41 25 BAL` appears in OCR; validate before production use
- **Mechanical**: density `0.303 lbs/in³`, hardness `35-48 HRC`, liquidus `2360F / 1292C`

## Page 12
- **Product**: SP88S-PG Spray Fuse Powder
- **PTP No**: 43
- **Form**: Powder
- **Size**: 170/400
- **Date**: 2/25/2026
- **Physical properties**: hardness `58-64 HRC`; density `4.0-6.0 g/cm³`
- **Chemistry**: OCR suggests `054.0`, `35-45`, `13.0-15.0`, `3.5-5.5`, `30-35`

## Page 13
- **Product**: SP88 WOM Spray Fuse Powder
- **PTP No**: 34
- **Form**: Powder
- **Size**: 170/400
- **Date**: 2/25/2026
- **Physical properties**: hardness `53-63 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `05-10`, `3.0-4.5`, `120-160`, `12.0-45.0`, `8.5-5.5`, `25-45`

## Page 14
- **Product**: SP72S-PG Spray Fuse Powder
- **PTP No**: 25
- **Form**: Powder
- **Size**: 170/400
- **Date**: 2/23/2026
- **Physical properties**: hardness `57-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.50-0.80`, `3.7-4.0`, `11.0-14.0`, `BAL`, `9.0-12.0`, `3.5-5.5`, `2.3-3.5`

## Page 15
- **Product**: SP46S and SP46S-PG Spray Fuse Powder
- **PTP No**: 2
- **Form**: Powder
- **Size**: 140/400 and 170/400
- **Date**: 02/20/2026
- **Specification**: AWS A5.21, Class ERNiCr-C
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.50-1.00`, `3.8-4.5`, `13.0-16.0`, `BAL`, `3.0-5.5`, `0`-ish; verify from image

## Page 16
- **Product**: SP46SF Spray Fuse Powder
- **PTP No**: 39
- **Form**: Powder
- **Size**: 170/400
- **Date**: 3/25/2026
- **Specification**: AWS A5.21, Class ERNiCr-C / SP46 WOM
- **Physical properties**: hardness `58-63 HRC`; density `4.2 min g/cm³`
- **Chemistry**: OCR shows `0.8-4.00`, `8.0-58`, `12.5`, `8.0-5.5`

## Page 17
- **Product**: SP46SF Spray Fuse Powder
- **PTP No**: 39
- **Form**: Powder
- **Size**: 170/400
- **Date**: 3/25/2026
- **Physical properties**: hardness `58-63 HRC`; density `4.2 min g/cm³`
- **Chemistry**: OCR shows `Aim 0.65`, `Aim 15.0`, `Aim 3.4`

---

# PTP5.pdf — 8 pages

## Page 1
- **Product**: SP45 data sheet
- **Description**: nickel chrome boron alloy with low melting point
- **Applications**: liners, thrust shoes, bushings, cages, valve components, oil extrusion screws, glass molds, centrifuges
- **Typical Chemical Analysis**: `C Si Ni Cr W Mo Fe Co B`
- **Mechanical**: tensile strength `77 ksi, as cast`; elongation `<1%`; density `7.8 g/cc`; liquidus `1000 C / 1850 F`; hardness `45-50 Rc`

## Page 2
- **Product**: SP88THVOF Powder
- **PTP No**: 59
- **Form**: Powder
- **Size**: 270/22u
- **Date**: 2/26/26
- **Physical properties**: hardness `58-64 HRC`; density `4-8 g/cm³` OCR
- **Chemistry**: OCR unreadable enough to avoid precise transcription

## Page 3
- **Product**: SP45 HVOF Powder
- **PTP No**: 41
- **Form**: Powder
- **Size**: 2/0/22
- **Date**: 2/25/26
- **Physical properties**: hardness `48-50 HRC`; density `4.8 g/cm³`
- **Chemistry**: OCR indicates `0.45-0.55`, `2.8-3.5`, `10.0-13.0`, `8.5-4.8`, `2.5-3.0`

## Page 4
- **Product**: 80/20 NiCr Micro-Velocity HVOF Powder
- **PTP No**: 15
- **Form**: Powder
- **Size**: 270/22?
- **Date**: 2/28/2026
- **Physical properties**: hardness `47-58? HRC` OCR; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `low as possible`, `19.0-21.0`, `BAL`, `0`-ish; verify from image

## Page 5
- **Product**: Cobalt 6 data sheet
- **Alloy**: Cobalt 6
- **Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Mechanical**: density `0.303 lbs/in³`, hardness `35-48 HRC`, liquidus `2360 F / 1292 C`

## Page 6
- **Product**: SP77P HVOF Powder
- **PTP No**: 16
- **Form**: Powder
- **Size**: 230/81?
- **Date**: 2/23/2028
- **Physical properties**: hardness `4550` OCR-ish; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.02 max`, `4.5-5.0`, `5.75`, `BAL`, `1.0 max`, `0.540`, `3238`-like noise

## Page 7
- **Product**: SP46 HVOF Powder
- **PTP No**: 7
- **Form**: Powder
- **Size**: 230/22p
- **Date**: 03/24/2026
- **Specification**: AWS A5.21, Class ERNiCr-C
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.7`, `4.0`, `15.0`, `4.0`, `0`/`34-38`

## Page 8
- **Product**: SPAGSF Spray Fuse Powder
- **PTP No**: 5
- **Form**: Powder
- **Size**: 200/400
- **Date**: 3/20/2026
- **Specification**: AWS A5.21, Class ERNiCr-C
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.50-1.00`, `3.5-4.5`, `13-16`, `BAL`, `28-40`, `2.5-4.0`, `3.0-3.5`

---

# PTP6.pdf — 15 pages

## Page 1
- **Product**: SP99S Spray Fuse Powder
- **PTP No**: 72
- **Form**: Powder
- **Size**: 140/400
- **Date**: 2/26/2026
- **Physical properties**: hardness `59-64 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.1-0`, `8.5-4.3`, `13-14`, `2.5-3.5`, `11.5-14.0`, `3.0-8.7`

## Page 2
- **Product**: SP88S-PG Spray Fuse Powder
- **PTP No**: 52
- **Form**: Powder
- **Size**: 140/400
- **Date**: 2/25/2026
- **Physical properties**: hardness `58-64 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.45`, `13.0-15.0`, `36-55`, `3.0-4.0`

## Page 3
- **Product**: SP72S Spray Fuse Powder
- **PTP No**: 24
- **Form**: Powder
- **Size**: 140/400
- **Date**: 2/24/2026
- **Physical properties**: hardness `57-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.50-0.80`, `3.0-4.0`, `11.0-14.0`, `BAL`, `9.0-12.0`, `3.5-5.5`, `2.8-3.5`

## Page 4
- **Product**: SP72D Spray Fuse Powder
- **PTP No**: 27
- **Form**: Powder
- **Size**: 140/400
- **Date**: 2/24/2026
- **Physical properties**: hardness `57-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.4-0.9`, `3.0-4.5`, `9.0-12.0`, `8.5-5.6`, `3.0-3.7`

## Page 5
- **Product**: D92 Manual Torch Powder
- **PTP No**: 62
- **Form**: Powder
- **Size**: 140/D
- **Date**: 10/2/2025
- **Physical properties**: hardness `35-45 HRC`; density `4.5-5.5 g/cm³`
- **Chemistry**: OCR suggests `3.5-4.0`, `1.0 max`, `1.0 max`, `1.0 max`, `1.75 max`, `9.0-11.0`, `BAL`, `0.030 max`

## Page 6
- **Product**: SP44 Manual Torch Powder
- **PTP No**: 10
- **Form**: Powder
- **Date**: 4/22/2025
- **Specification**: AWS A5.21, Class ERNiCr-A
- **Physical properties**: hardness `35-45 HRC`; density `4.5-5.5 g/cm³`
- **Chemistry**: OCR suggests `0.2-0.6`, `20-30`, `70-82`, `BAL`, `2.0-3.5`, `45-20`

## Page 7
- **Product**: SP46 Manual Torch Powder
- **PTP No**: 6
- **Form**: Powder
- **Date**: 3/20/2026
- **Specification**: AWS A5.21, Class ERNiCr-C
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.50-1.00`, `8.845`, `12.0-18.0`, `30-55`, `34-38`

## Page 8
- **Product**: SP88S-PG Spray Fuse Powder
- **PTP No**: 43
- **Form**: Powder
- **Size**: 170/400
- **Date**: 2/25/2026
- **Physical properties**: hardness `58-64 HRC`; density `4.0-6.0 g/cm³`
- **Chemistry**: OCR suggests `0.54.0`, `35-45`, `13.45`, `18.0-15.0`, `3.5-5.5`, `30-35`

## Page 9
- **Product**: SP88 WOM Spray Fuse Powder
- **PTP No**: 34
- **Form**: Powder
- **Size**: 170/400
- **Date**: 2/25/2026
- **Physical properties**: hardness `53-63 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `05-10`, `3.0-4.5`, `120-160`, `12.0-45.0`, `3.0-4.0`, `25-45`

## Page 10
- **Product**: SP72S-PG Spray Fuse Powder
- **PTP No**: 25
- **Form**: Powder
- **Size**: 170/400
- **Date**: 2/23/2026
- **Physical properties**: hardness `57-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.50-0.80`, `3.7-4.0`, `11.0-14.0`, `BAL`, `9.0-12.0`, `3.5-5.5`, `2.3-3.5`

## Page 11
- **Product**: SP46S and SP46S-PG Spray Fuse Powder
- **PTP No**: 2
- **Form**: Powder
- **Size**: 140/400 and 170/400
- **Date**: 02/20/2026
- **Specification**: AWS A5.21, Class ERNiCr-C
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.50-1.00`, `3.8-4.5`, `13.0-16.0`, `BAL`, `3.0-5.5`, `30-38`

## Page 12
- **Product**: SP46SF Spray Fuse Powder
- **PTP No**: 39
- **Form**: Powder
- **Size**: 170/400
- **Date**: 3/25/2026
- **Physical properties**: hardness `58-63 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.804.00`, `8.0-58`, `12.15`, `8.0-5.5`

## Page 13
- **Product**: SP46SF Spray Fuse Powder
- **PTP No**: 39
- **Form**: Powder
- **Size**: 170/400
- **Date**: 3/25/2026
- **Physical properties**: hardness `58-63 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.80-4.00`, `8.0-58`, `12.15`, `8.0-5.5`

## Page 14
- **Product**: SP45S WOM Spray Fuse Powder
- **PTP No**: 12
- **Form**: Powder
- **Size**: 170/400
- **Date**: 02/23/2026
- **Specification**: AWS A5.21, Class ERNiCr-B / SP45 WOM
- **Physical properties**: hardness `43-53 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.80-0.5`, `33.0-3.5`, `9.5-12.0`, `2.0-5.0`, `2.0-4.0`

## Page 15
- **Product**: SP44 WOM Spray Fuse Powder
- **PTP No**: 35
- **Form**: Powder
- **Size**: 170/325
- **Date**: 4/8/2026
- **Physical properties**: hardness `84-43 HRC` OCR likely `43-48`; density `4.0-6.0 g/cm³`
- **Chemistry**: OCR is too noisy for safe transcription

---

# PTP7.pdf — 17 pages

## Page 1
- **Product**: SP55S Spray Fuse Powder
- **PTP No**: 33
- **Form**: Powder
- **Size**: 140/400
- **Date**: 2/24/2026
- **Physical properties**: hardness `55-64 HRC` or similar OCR; density around `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.5-1.0`, `3.5-4.5`, `13-16`, `BAL`, `28-40`, `2.5-4.0`, `3.0-3.5`

## Page 2
- **Product**: SP46S and SP46S-PG Spray Fuse Powder
- **PTP No**: 2
- **Form**: Powder
- **Size**: 140/400 and 170/400
- **Date**: 02/20/2026
- **Specification**: AWS A5.21, Class ERNiCr-C
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.50-1.00`, `3.8-4.5`, `13.0-16.0`, `BAL`, `3.0-5.5`, `30-38`

## Page 3
- **Product**: SP46M Halliburton Spray Fuse Powder
- **PTP No**: 4
- **Form**: Powder
- **Size**: 140/400
- **Date**: 2/20/2026
- **Specification**: AWS A5.21, Class ERNiCr-C
- **Reference**: Halliburton Specification 70.37208 Rev U
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests a cobalt/nickel family row with `0.54/8`, `3.0-5.0`, `18.0-20.0`, `3.0-5.0`, `26-38.5`

## Page 4
- **Product**: SP46M Halliburton Spray Fuse Powder
- **PTP No**: 4
- **Form**: Powder
- **Size**: 140/400
- **Date**: 2/20/2026
- **Physical properties**: hardness `56-62 HRC`; density around `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.56-1.8`, `3.0-5.0`, `13.0-20.0`, `3.0-5.0`, `50-75`, `26-35`

## Page 5
- **Product**: SP46-22 Chrome X Spray Fuse Powder
- **PTP No**: 50
- **Form**: Powder
- **Size**: 140/400
- **Date**: 08/27/2026
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.22`, `3.5`, `42`, `2.0`, `4.0`, `2.0`, `3.4`

## Page 6
- **Product**: SPAS data sheet
- **Description**: nickel chrome boron alloy with low melting point
- **Applications**: liners, thrust shoes, bushings, cages, valve components, oil extrusion screws, glass molds, centrifuges
- **Typical Chemical Analysis**: `C Si Cr Ni B`-style row, OCR unreadable but clearly a nickel-chrome-boron alloy family
- **Mechanical**: tensile strength `77 ksi`; elongation `<1%`; density `7.8 g/cc`; liquidus `1000 C / 1850 F`; hardness `45-50 Rc`

## Page 7
- **Product**: SP46 data sheet
- **Description**: nickel chrome boron alloy in cast rod, powder, and wire form
- **Applications**: liners, thrust shoes, bushings, cages, valve components, oil extrusion screws, glass molds, centrifuges
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co B`
- **Readable values**: OCR suggests `0.6`, `0`, `3.8`, `Bal`, `16`, `0`, `0`, `38`, `0`, `32` but this is likely partially misread
- **Mechanical**: density `7.8 g/cc`; liquidus `1000 C / 1850-1950 F`; hardness `56-62 Rc`

## Page 8
- **Product**: 4530R RAW MATERIAL POWDER
- **PTP No**: 82
- **Form**: Powder
- **Size**: 140/325
- **Date**: 4138/2026 OCR likely means 4/13/2026
- **Physical properties**: hardness around `12-18` OCR; density `4.2 g/cm³ min`
- **Chemistry**: OCR too noisy for confident transcription

## Page 9
- **Product**: 4470 technical data sheet
- **Type**: combustion plasma powder information
- **Description**: machinable one-step powder coating with high quality coatings and minimum operator technique dependence
- **Properties**: coating hardness `HRB 85 / HRB-80`, coating density `6.9 g/cc / 12 g/cc`, tensile strength `>4500 psi / >5000 psi`, coating weight, porosity, service temperature, thickness limits, melting point `1950-2500 F`
- **Use**: general purpose build-up and bearing fit applications

## Page 10
- **Product**: 4440R RAW MATERIAL POWDER
- **PTP No**: 75
- **Form**: Powder
- **Size**: 140/325
- **Date**: 04/18/2026
- **Physical properties**: hardness `12-18/50g`; density `4.2 g/cm³`
- **Chemistry**: OCR suggests `0.02`, `4.5-5.0`, `5.75`, `BAL`, `1.0`, `0.540`, `3238`

## Page 11
- **Product**: 431 Fe@rNiC Thermal Spray Powder
- **PTP No**: 76
- **Form**: Powder
- **Size**: 140/325
- **Date**: 02/04/2026
- **Physical properties**: chemistry/hardness values not clean enough for safe transcription

## Page 12
- **Product**: 80/20 NiCr Plasma Powder
- **PTP No**: 18
- **Form**: Powder
- **Size**: 140/22?
- **Date**: 5/7/2025
- **Physical properties**: hardness `18-?`; density `4.2-6.0 g/cm³`
- **Chemistry**: OCR suggests `low as possible`, `19.0-21.0`, `BAL`, `0 max`

## Page 13
- **Product**: 4340 DED Powder
- **PTP No**: 61
- **Form**: Powder
- **Size**: 120/45u
- **Date**: 10/2/2025
- **Physical properties**: hardness `12-18 s/50g`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.38-0.43`, `0.60-0.80`, `0.15-0.35`, `0.70-0.90`, `1.65-2.00`, `0.20-0.30`, `BAL`, `0.085 max`, `0.040 max`

## Page 14
- **Product**: SP72HBSprayFuse Powder
- **PTP No**: 74
- **Form**: Powder
- **Size**: 120/400
- **Date**: 2/26/26
- **Physical properties**: hardness `49-64 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR too noisy for safe transcription

## Page 15
- **Product**: SP55M Spray Fuse Powder
- **PTP No**: 53
- **Form**: Powder
- **Size**: 120/825
- **Date**: 2/26/2026
- **Physical properties**: hardness `86-62 HRC` OCR likely `56-62`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `9:80-1.00`, `3.0-4.0`, `14-17`, `2.0-4.0`, `3.0-5.5`, `3.0-5.0`

## Page 16
- **Product**: SP46M Spray Fuse Powder
- **PTP No**: 23
- **Form**: Powder
- **Size**: 120/325
- **Date**: 2/23/2026
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `Aim 0.65`, `Aim 15.0`, `Aim 3.4`

## Page 17
- **Product**: SP46M Spray Fuse Powder
- **PTP No**: 23
- **Form**: Powder
- **Size**: 120/325
- **Date**: 2/23/2026
- **Physical properties**: hardness `56-62 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `Aim 0.65`, `Aim 15.0`, `Aim 3.4`

---

# PTP8.pdf — 15 pages

## Page 1
- **Product**: 625 Laser Cladding Powder
- **PTP No**: 66
- **Form**: Powder
- **Size**: 100/325
- **Date**: 12/8/2025
- **Physical properties**: hardness `12-18/50g`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR too noisy for safe transcription

## Page 2
- **Description**: NiCrB hardfacing with superior resistance to fine particle abrasion, corrosion, and impact at elevated temperatures
- **Applications**: overlaying hot extrusion dies, punches, glass molds, hot shear blades, trimmers, plastic extrusion and injection screws
- **Typical Chemical Analysis**: `C Si Ni Fe B`
- **TYPICAL HARDNESS**: `40 Rc`
- **Spec**: Chemistry meets AWS A5.21-01 ERNiCrA

## Page 3
- **Product**: SP44G2 Spray Fuse Powder
- **PTP No**: 29
- **Form**: Powder
- **Size**: 120/825
- **Date**: 2/24/2026
- **Specification**: AWS A5.21, Class ERNiCrA
- **Physical properties**: hardness `38-45 HRC`; density `4.8-5.0 g/cm³`
- **Chemistry**: OCR suggests `2.2-4`, `2.8-3.3`, `2.0-3.0`

## Page 4
- **Product**: SF6 Spray Fuse Powder
- **PTP No**: 80
- **Form**: Powder
- **Size**: 120/325
- **Date**: 02/26/26
- **Physical properties**: hardness `40-50 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.6-0.8`, `4.25-1.75`, `18-20`, `12-14`, `2.5-3.5`, `1.4-1.6`

## Page 5
- **Product**: SF1 Spray Fuse Powder
- **PTP No**: 73
- **Form**: Powder
- **Size**: 120/825
- **Date**: 02/26/2026
- **Physical properties**: hardness `58-60 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.50-1.00`, `3.0-4.0`, `14-17`, `2.0-4.0`, `3.0-5.5`, `3.0-5.0`

## Page 6
- **Product**: #21L Laser Cladding Powder
- **PTP No**: 47
- **Form**: Powder
- **Size**: 120/325
- **Date**: 7/24/2025
- **Specification**: AWS A5.21, Class ERCoCr-E
- **Physical properties**: hardness `10-15s/50g`; density `4.5-6.0 g/cm³`
- **Chemistry**: OCR suggests `0.22`, `0.9`, `1.2`, `27.8`, `2.0`, `0.2`, `1.4`, `1.5`, `280 max`

## Page 7
- **Product**: Cobalt Alloy 12 Data Sheet
- **Alloy**: Cobalt 12
- **Description**: surfacing alloy for high stress grinding abrasion, corrosion, oxidation, and erosion
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `16 3 10 55 27 80 1 30 Bal`
- **Mechanical**: hardness `47-52 Re`, density `313/In3`, melting point `~2450F-1350C`

## Page 8
- **Product**: SP88LB122 Laser Cladding Powder
- **PTP No**: 1
- **Form**: Powder
- **Size**: 100/325
- **Date**: 04/25/2025
- **Spec**: Govanta B122 Rev. 3 / Alloy 88
- **Physical properties**: hardness `59-64 HRC`; density `4.4 g/cm³ min` OCR
- **Chemistry**: OCR suggests `4.0-9`, `88-45`, `14-16`, `14.0-18.0`, `3.0-4.0`
- **Special instruction**: certify W with XRF

## Page 9
- **Product**: Cobalt 6 data sheet
- **Alloy**: Cobalt 6
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `11 04 13 25 282 47 14 25 BAL`
- **Mechanical**: density `0.303 lbs/in³`, hardness `35-48 HRC`, liquidus `2360F / 1292C`

## Page 10
- **Product**: BMKSS10 Laser Cladding Powder
- **PTP No**: 38
- **Form**: Powder
- **Size**: 100/325
- **Date**: 10/24/2025
- **Physical properties**: hardness `50-60 HRC`; density `4.5-6.0 g/cm³`
- **Chemistry**: row with `2.7-2.9`, `0.4-0.6`, `15.0-15.5`, `2.15-2.35`, `0.11-0.28`; special note: charge last / small chunks

## Page 11
- **Product**: 945 Laser Cladding Powder
- **PTP No**: 78
- **Date**: 2/12/2026
- **Physical properties**: chemistry/hardness values too noisy for safe transcription

## Page 12
- **Description**: Cobalt alloy #21 data sheet
- **Alloy**: Cobalt 21
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `2 50 60 25 26 - 55 10 Bal`
- **Mechanical**: hardness `Rc 22-32`, density `299 Lbs/In³`, liquidus `2480F`

## Page 13
- **Product**: Cobalt Alloy 12 Data Sheet
- **Alloy**: Cobalt 12
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `16 3 lo 5 27 80 1 30 Bal`
- **Mechanical**: hardness `47-52 Re`, density `313/In3`

## Page 14
- **Product**: SP87 PTA/Laser/Spray Fuse Data Sheet
- **Chemistry**: nickel balance; tungsten `16%`; chrome `4?H`; iron `3.5%`; silicon; boron `2.5%`; carbon `0.5%`
- **Characteristics**: dense and hard coating; moderate corrosion and oxidation; excellent impact resistance

## Page 15
- **Product**: SP45 data sheet
- **Description**: nickel chrome boron alloy with low melting point
- **Applications**: liners, thrust shoes, bushings, cages, valve components, oil extrusion screws, glass molds, centrifuges
- **Typical Chemical Analysis**: `C Si Ni Cr B`
- **Mechanical**: tensile strength `77 ksi, as cast`; elongation `<1%`; density `7.8 g/cc`; liquidus `1000 C / 1850 F`; hardness `45-50 Rc`

---

# PTP9.pdf — 9 pages

## Page 1
- **Product**: SP44 PTA Powder
- **PTP No**: 9
- **Form**: Powder
- **Size**: 80/230, 100/270
- **Date**: 5/12/2025
- **Physical properties**: hardness `18/50g` OCR; density `8.85? g/cc`
- **Chemistry**: OCR suggests `0.204`, `2.8-3.3`, `70-82`, `2.0-3.0`, `1.5-2.0`

## Page 2
- **Product**: Fe27Co28 PTA Powder
- **PTP No**: 37
- **Form**: Powder
- **Size**: 100/270
- **Date**: 7/8/2025
- **Physical properties**: hardness `25-29`, density `2.7-2.8` OCR
- **Chemistry**: OCR suggests `0.1-0.3`, `0.4-0.6`, `BAL`, `25-29`, `27-28`

## Page 3
- **Product**: FB-100G2 Spray Fuse Powder
- **PTP No**: 51
- **Form**: Powder
- **Size**: 100/270
- **Date**: 2/25/2026
- **Physical properties**: hardness `25-40`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR suggests `1.8-2.4`

## Page 4
- **Product**: 431 Stainless PTA Powder
- **PTP No**: 86
- **Form**: Powder
- **Size**: 100/270
- **Date**: 04/08/2026
- **Physical properties**: hardness `17s/50g` OCR; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR too noisy for safe transcription

## Page 5
- **Product**: 316L Stainless PTA Powder
- **PTP No**: 67
- **Form**: Powder
- **Size**: 100/270
- **Date**: 12/09/2025
- **Physical properties**: hardness `16-18/50g`; density `4.0-5.0 g/cm³`
- **Chemistry**: row shows `0.08 max`, `1.0-2.5`, `18.0-20.0`, `11.0-14.0`, `2.0-3.0`, `BAL`, `0.75 max`

## Page 6
- **Product**: 316 Laser Cladding Powder
- **PTP No**: 18
- **Form**: Powder
- **Size**: 100/270
- **Date**: 5/06/2025
- **Revision note**: revised to standard grade, remove AWS spec
- **Physical properties**: hardness `NR 16-18s/50g`; density `4.0-5.0 g/cm³`

## Page 7
- **Product**: #6L Laser Cladding Powder
- **PTP No**: 44
- **Form**: Powder
- **Size**: 100/270
- **Date**: 7/18/2025
- **Specification**: AWS A5.21, Class ERCoCrA
- **Physical properties**: hardness `38-46 HRC`; density `4.5-5.0 g/cm³`
- **Chemistry**: OCR suggests `0.08`, `0.01`, `0.50`, `0.9-1.2`, `0.8-1.5`, `26-28`, `1.5-3.0`, `3.0-5.0`, `BAL`

## Page 8
- **Product**: Cobalt Alloy 12 Data Sheet
- **Alloy**: Cobalt 12
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `16 3 10 55 27 80 30 Bal`
- **Mechanical**: hardness `47-52 Re`, density `313/In3`, melting point `~2450F-1350C`

## Page 9
- **Product**: SP50G2 PTA Powder
- **PTP No**: 45
- **Form**: Powder
- **Size**: 100/230
- **Date**: 7/22/2025
- **Physical properties**: hardness `47-53 HRC`; density `4.0-5.0 g/cm³`
- **Chemistry**: OCR too noisy for safe transcription

---

# PDS-3 Cobalt 21 Data Sheet

## Page 1
- **Product**: Cobalt #21 Data Sheet
- **Description**: molybdenum-strengthened, high-temperature, corrosion-resistant alloy with exceptional impact, erosion, and wear resistance
- **Applications**: hot forming dies, forging dies, erosion shields, valve seats and plugs, hydro-turbine runners, pump shafts and sleeves
- **Typical Chemical Analysis**: `C Mn Si Ni Cr W Mo Fe Co`
- **Readable values**: `.25 .50 .60 2.5 26 - 5.5 1.0 Bal`
- **Machineability**: Good
- **Hardness**: `Rc 22-32 as deposited`, `Rc 38-40 work hardened`
- **Hot Hardness (DPH)**: `800F-130`, `1000F-135`, `1200F-140`, `1400F-110`
- **Density**: `.299 Lbs/In³`
- **Liquidus**: `2480°F`

---

# Extraction Guidance for Production Use

## What to load directly
- The page and product metadata
- Clear test names and document types
- Clear physical properties
- Clearly marked `BAL` balance values
- Clear `max` impurity values when the value is readable

## What to verify from the original page image
- Any OCR row with label/value corruption
- Pages with low-confidence chemistry tables
- All rows where the chemical labels are ambiguous
- Any `max` / `aim` values that conflict with the documented alloy family

## Recommended next step
For database loading, use the page-based extraction as the primary source and add a verification pass against the original page images for any chemistry row that is not explicitly clear in this document.
