# Ferien & Home Exchange Gantt

Vergleiche Urlaubs- und Ferienzeiträume in einem interaktiven Gantt-Chart. Der gesamte Chart-Zustand steckt in der URL (`g`, LZ-komprimiertes JSON) und ist per „Link kopieren“ teilbar.

## Entwicklung

```bash
bun install
bun dev
```

## Skripte

- `bun dev` — Entwicklungsserver
- `bun run build` — Produktions-Build
- `bun run type-check` — TypeScript (`tsc --noEmit`)
- `bun run lint` — oxlint (with `--fix`)
- `bun run lint-check` — oxlint, read-only
- `bun run format` — oxfmt (write)
- `bun run format-check` — oxfmt, read-only
- `bun run test` — Vitest
- `bun run knip` — unused / unlisted dependency check
- `bun run check` — all of the above (mutating); `bun run check-ci` — read-only variant used in CI

## URL-Parameter

| Parameter | Beschreibung                               |
| --------- | ------------------------------------------ |
| `g`       | LZ-komprimiertes JSON mit Gantt-Daten      |
| `editor`  | `open` oder `closed` — linkes Editor-Panel |

## Datenformat

```json
{
  "sections": [
    {
      "name": "Familie_A",
      "ranges": [{ "id": "a1", "name": "Sommerferien", "start": "2026-07-15", "end": "2026-08-26" }]
    },
    {
      "name": "Chancen",
      "ranges": [
        { "id": "c1", "name": "Besuch moeglich", "start": "2026-07-20", "end": "2026-08-10" }
      ]
    }
  ]
}
```

- Jede Familie/Ort = eigene `section` mit explizitem Start- und Enddatum
- Chancen/Besuchsfenster in `section Chancen` (werden hervorgehoben dargestellt)
