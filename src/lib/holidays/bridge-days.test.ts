import { describe, expect, it } from 'vitest'
import { expandBridgeDayPeriod, expandBridgeDayPeriods } from './bridge-days'
import { processPublicHolidayPeriods } from './fetch-periods'
import { mergeOverlappingPeriods, mergePeriodsByRange } from './merge-periods'

describe('expandBridgeDayPeriod', () => {
  it('extends Thursday through the following weekend to Sunday', () => {
    expect(
      expandBridgeDayPeriod({
        title: 'Christi Himmelfahrt',
        start: '2025-05-29',
        end: '2025-05-29',
      }),
    ).toEqual({
      title: 'Christi Himmelfahrt (Brückentag)',
      start: '2025-05-29',
      end: '2025-06-01',
    })
  })

  it('extends Friday through the following weekend to Sunday', () => {
    expect(
      expandBridgeDayPeriod({
        title: 'Extra holiday',
        start: '2025-05-02',
        end: '2025-05-02',
      }),
    ).toEqual({
      title: 'Extra holiday (Brückentag)',
      start: '2025-05-02',
      end: '2025-05-04',
    })
  })

  it('extends Tuesday back through the previous weekend to Saturday', () => {
    expect(
      expandBridgeDayPeriod({
        title: 'Neujahr',
        start: '2025-01-07',
        end: '2025-01-07',
      }),
    ).toEqual({
      title: 'Neujahr (Brückentag)',
      start: '2025-01-04',
      end: '2025-01-07',
    })
  })

  it('extends Monday back through the previous weekend to Saturday', () => {
    expect(
      expandBridgeDayPeriod({
        title: 'Pfingstmontag',
        start: '2025-06-09',
        end: '2025-06-09',
      }),
    ).toEqual({
      title: 'Pfingstmontag (Brückentag)',
      start: '2025-06-07',
      end: '2025-06-09',
    })
  })

  it('leaves multi-day periods unchanged', () => {
    const period = {
      title: 'Sommerferien',
      start: '2025-07-14',
      end: '2025-08-22',
    }
    expect(expandBridgeDayPeriod(period)).toEqual(period)
  })

  it('leaves Wednesday single-day holidays unchanged', () => {
    const period = {
      title: 'Tag der Deutschen Einheit',
      start: '2025-10-01',
      end: '2025-10-01',
    }
    expect(expandBridgeDayPeriod(period)).toEqual(period)
  })
})

describe('mergeOverlappingPeriods', () => {
  it('merges overlapping expanded Thursday and Monday holidays into one bar', () => {
    const expanded = expandBridgeDayPeriods([
      { title: 'Tag der Arbeit', start: '2025-05-01', end: '2025-05-01' },
      { title: 'Extra holiday', start: '2025-05-05', end: '2025-05-05' },
    ])

    expect(mergeOverlappingPeriods(expanded)).toEqual([
      {
        title: 'Tag der Arbeit / Extra holiday (Brückentag)',
        start: '2025-05-01',
        end: '2025-05-05',
      },
    ])
  })

  it('keeps separate bars when expanded ranges do not overlap', () => {
    const expanded = expandBridgeDayPeriods([
      { title: 'Holiday A', start: '2025-01-07', end: '2025-01-07' },
      { title: 'Holiday B', start: '2025-05-29', end: '2025-05-29' },
    ])

    expect(mergeOverlappingPeriods(expanded)).toEqual([
      {
        title: 'Holiday A (Brückentag)',
        start: '2025-01-04',
        end: '2025-01-07',
      },
      {
        title: 'Holiday B (Brückentag)',
        start: '2025-05-29',
        end: '2025-06-01',
      },
    ])
  })
})

describe('processPublicHolidayPeriods', () => {
  it('expands bridge days and merges overlapping API rows into one chart bar', () => {
    const apiLikeRows = [
      { title: 'Tag der Arbeit', start: '2025-05-01', end: '2025-05-01' },
      { title: 'Tag der Arbeit', start: '2025-05-01', end: '2025-05-01' },
      { title: 'Extra holiday', start: '2025-05-05', end: '2025-05-05' },
      { title: 'Christi Himmelfahrt', start: '2025-05-29', end: '2025-05-29' },
    ]

    expect(processPublicHolidayPeriods(apiLikeRows)).toEqual([
      {
        title: 'Tag der Arbeit / Extra holiday (Brückentag)',
        start: '2025-05-01',
        end: '2025-05-05',
      },
      {
        title: 'Christi Himmelfahrt (Brückentag)',
        start: '2025-05-29',
        end: '2025-06-01',
      },
    ])
  })

  it('merges duplicate API rows with the same range before expanding', () => {
    const apiLikeRows = [
      { title: 'Holiday A', start: '2025-05-29', end: '2025-05-29' },
      { title: 'Holiday B', start: '2025-05-29', end: '2025-05-29' },
    ]

    expect(processPublicHolidayPeriods(apiLikeRows)).toEqual([
      {
        title: 'Holiday A / Holiday B (Brückentag)',
        start: '2025-05-29',
        end: '2025-06-01',
      },
    ])
  })
})

describe('mergePeriodsByRange', () => {
  it('combines labels for identical start/end rows', () => {
    expect(
      mergePeriodsByRange([
        { title: 'A', start: '2025-05-01', end: '2025-05-01' },
        { title: 'B', start: '2025-05-01', end: '2025-05-01' },
      ]),
    ).toEqual([{ title: 'A / B', start: '2025-05-01', end: '2025-05-01' }])
  })
})
