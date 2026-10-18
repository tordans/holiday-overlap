import type { GanttData } from './gantt-types'
import { CHANCEN_SECTION } from './gantt-types'

export const DEFAULT_GANTT_DATA: GanttData = {
  sections: [
    {
      name: 'Familie_A',
      ranges: [
        {
          id: 'a1',
          name: 'Sommerferien',
          start: '2026-07-15',
          end: '2026-08-26',
        },
      ],
    },
    {
      name: 'Familie_B',
      ranges: [
        {
          id: 'b1',
          name: 'Sommerferien',
          start: '2026-06-20',
          end: '2026-09-05',
        },
      ],
    },
    {
      name: CHANCEN_SECTION,
      ranges: [
        {
          id: 'c1',
          name: 'Besuch moeglich',
          start: '2026-07-20',
          end: '2026-08-10',
        },
      ],
    },
  ],
}
