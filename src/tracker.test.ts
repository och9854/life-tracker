import { describe, expect, it } from 'vitest';
import { historyPeriods } from './tracker';

const habit = { id: 'h', name: 'Walk', weekly_target: 4, cadence: 'week' as const, week_starts_on: 1 as const, active: true };
const check = (day: string) => ({ id: day, habit_id: 'h', completed_on: day, count: 1 });
describe('habit history starts with real check-ins', () => {
  it('does not invent periods for a new habit', () => {
    expect(historyPeriods([], habit, '2026-10-09')).toEqual([]);
  });
  it('starts with the first week and retains later gaps', () => {
    expect(historyPeriods([check('2026-09-24')], habit, '2026-10-09')).toEqual(['2026-10-05', '2026-09-28', '2026-09-21']);
  });
  it('uses the configured Sunday boundary', () => {
    expect(historyPeriods([check('2026-10-04')], { ...habit, week_starts_on: 0 }, '2026-10-09')).toEqual(['2026-10-04']);
  });
  it('does not create months before the first actual record', () => {
    expect(historyPeriods([check('2026-10-09')], { ...habit, cadence: 'month' }, '2026-10-09')).toEqual(['2026-10-01']);
  });
  it('ignores other habits, zero counts and future records', () => {
    expect(historyPeriods([{ ...check('2026-08-01'), habit_id: 'other' }, { ...check('2026-08-02'), count: 0 }, check('2026-11-01'), check('2026-10-09')], habit, '2026-10-09')).toEqual(['2026-10-05']);
  });
});
