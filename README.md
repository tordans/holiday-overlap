# Ferien & Home Exchange Gantt

Vergleiche Urlaubs- und Ferienzeiträume als [Mermaid-Gantt](https://mermaid.ai/open-source/syntax/gantt.html). Der gesamte Chart-Zustand steckt in der URL (`g`, komprimiert) und ist per „Link kopieren“ teilbar.

## Entwicklung

```bash
bun install
bun dev
```

## Skripte

- `bun dev` — Entwicklungsserver
- `bun run build` — Produktions-Build
- `bun run lint` — oxlint
- `bun run fmt` — oxfmt

## URL-Parameter

| Parameter | Beschreibung |
|-----------|--------------|
| `g` | LZ-komprimierter Mermaid-Gantt-Quelltext |
| `editor` | `open` oder `closed` — linkes Editor-Panel |

## Mermaid-Tipps

- Jede Familie/Ort = eigene `section` mit explizitem Start- und Enddatum (`:id, 2026-07-15, 2026-08-26`)
- Chancen/Besuchsfenster in `section Chancen` mit `crit`-Tag
- Keine `after`-Verkettung zwischen Ferienzeilen, sonst verschiebt Mermaid die Balken sequentiell
