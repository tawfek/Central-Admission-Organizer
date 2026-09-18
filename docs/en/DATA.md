# Data and importing

## Canonical source

The admissions dataset now has one source of truth:

```text
public/admission-minimums.pdf
```

The PDF is both downloadable by users and consumed by the build-time importer. The old per-page TXT intermediary is no longer used.

## Generate JSON

Run:

```bash
bun run data:import
```

The importer uses PDF.js text coordinates to detect the admission table, reconstruct visual rows, normalize Arabic/Persian digits, validate every record, and write:

```text
src/features/admissions/data/admissions.json
src/features/admissions/data/admission-import-report.json
```

`admissions.json` contains semantic objects rather than legacy positional arrays:

```json
{
  "sourceId": "103",
  "code": "287",
  "name": "جامعة بغداد / كلية الهندسة - قسم الحاسوب",
  "degreeAll": 668,
  "percent": 95.43,
  "type": "علمي",
  "sex": "مختلط"
}
```

The generated files should not be edited manually.

## Importing another PDF

The default command reads `public/admission-minimums.pdf`. To inspect another compatible Ministry PDF without replacing the canonical file first:

```bash
bun scripts/import-admissions.ts "./path/to/minimums.pdf"
```

The parser skips non-table pages automatically. It records physical PDF page numbers and per-page record counts in the import report.

## Validation and rejected rows

Normal imports are strict. The command fails when:

- no admission records are extracted;
- a required field is missing or non-numeric where a number is required;
- duplicate source IDs are generated;
- a row looks like admission data but cannot be parsed.

Rejected rows are written to:

```text
src/features/admissions/data/admission-import-rejected.json
```

That file includes the physical page, table page, Y coordinate, and raw column text for diagnosis. It is removed automatically after a clean import.

While adapting the parser to a newly formatted PDF, rejected rows can temporarily be allowed with:

```bash
bun scripts/import-admissions.ts "./path/to/minimums.pdf" --allow-rejected
```

Do not use `--allow-rejected` for a production dataset without reviewing every rejected row.

## Dynamic filters

Branch and sex dropdown values are generated from the imported data. Values such as `علمي`, `ادبي`, `مهني`, or `فنون` appear only when present in the dataset.
