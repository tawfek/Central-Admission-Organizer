# Data and importing

## Raw format

Raw files live in `src/data/raw/`. The importer discovers every `.txt` file automatically and sorts filenames naturally.

Each record occupies seven non-empty lines:

```text
source id
university / department name
total degree
percentage
code
branch
sex
```

Example:

```text
103
جامعة بغداد / كلية الهندسة - قسم الحاسوب
668
95.43
287
علمي
مختلط
```

## Generate JSON

```bash
bun run data:import
```

Output:

```text
src/features/admissions/data/admissions.raw.json
```

The generated JSON should not be edited by hand. Edit/replace the TXT sources and rerun the importer.

## Dynamic filters

Branch and sex dropdown values are generated from the data. Values such as `علمي`, `ادبي`, `مهني`, or `فنون` appear only when present in the dataset. The old `احيائي` / `تطبيقي` assumptions are not hard-coded.
