export type Bundesland = {
  code: string
  name: string
  slug: string
}

export const BUNDESLAENDER: Bundesland[] = [
  { code: 'BW', name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  { code: 'BY', name: 'Bayern', slug: 'bayern' },
  { code: 'BE', name: 'Berlin', slug: 'berlin' },
  { code: 'BB', name: 'Brandenburg', slug: 'brandenburg' },
  { code: 'HB', name: 'Bremen', slug: 'bremen' },
  { code: 'HH', name: 'Hamburg', slug: 'hamburg' },
  { code: 'HE', name: 'Hessen', slug: 'hessen' },
  { code: 'MV', name: 'Mecklenburg-Vorpommern', slug: 'mecklenburg-vorpommern' },
  { code: 'NI', name: 'Niedersachsen', slug: 'niedersachsen' },
  { code: 'NW', name: 'Nordrhein-Westfalen', slug: 'nordrhein-westfalen' },
  { code: 'RP', name: 'Rheinland-Pfalz', slug: 'rheinland-pfalz' },
  { code: 'SL', name: 'Saarland', slug: 'saarland' },
  { code: 'SN', name: 'Sachsen', slug: 'sachsen' },
  { code: 'ST', name: 'Sachsen-Anhalt', slug: 'sachsen-anhalt' },
  { code: 'SH', name: 'Schleswig-Holstein', slug: 'schleswig-holstein' },
  { code: 'TH', name: 'Thüringen', slug: 'thueringen' },
]

export const DEFAULT_BUNDESLAND_CODE = 'BY'

export function bundeslandByCode(code: string): Bundesland | undefined {
  return BUNDESLAENDER.find((b) => b.code === code)
}
