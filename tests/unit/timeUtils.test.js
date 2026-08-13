const timeUtils = require('../../timeUtils');
const { time } = require('openhab');

describe('timeUtils', () => {
  test('isISO8601', () => {
    expect(timeUtils.isISO8601('2026-08-13T12:00:00Z')).toBe(true);
    expect(timeUtils.isISO8601('invalid')).toBe(false);
  });

  test('is24Hr', () => {
    expect(timeUtils.is24Hr('12:00')).toBe(true);
    expect(timeUtils.is24Hr('23:59')).toBe(true);
    expect(timeUtils.is24Hr('24:00')).toBe(false);
    expect(timeUtils.is24Hr('12:00 PM')).toBe(false);
  });

  test('is12Hr', () => {
    expect(timeUtils.is12Hr('12:00 pm')).toBe(true);
    expect(timeUtils.is12Hr('12:00 PM')).toBe(true);
    expect(timeUtils.is12Hr('4:56 AM')).toBe(true);
    expect(timeUtils.is12Hr('23:59')).toBe(false);
  });

  test('parseDuration', () => {
    const duration = timeUtils.parseDuration('5h 10m 30s');
    expect(duration).not.toBeNull();
    expect(duration.seconds()).toBe(18630);
    
    expect(timeUtils.parseDuration('invalid')).toBeNull();
  });

  test('toTomorrow', () => {
    const tomorrowZdt = timeUtils.toTomorrow('2026-08-13T12:00:00Z');
    // It should be tomorrow's date relative to now
    const realTomorrow = time.toZDT('P1D');
    expect(tomorrowZdt.year()).toBe(realTomorrow.year());
    expect(tomorrowZdt.monthValue()).toBe(realTomorrow.monthValue());
    expect(tomorrowZdt.dayOfMonth()).toBe(realTomorrow.dayOfMonth());
  });

  test('toYesterday', () => {
    const yesterdayZdt = timeUtils.toYesterday('2026-08-13T12:00:00Z');
    const realYesterday = time.toZDT('P-1D');
    expect(yesterdayZdt.year()).toBe(realYesterday.year());
    expect(yesterdayZdt.monthValue()).toBe(realYesterday.monthValue());
    expect(yesterdayZdt.dayOfMonth()).toBe(realYesterday.dayOfMonth());
  });

  test('toDateTime (deprecated)', () => {
    const now = time.ZonedDateTime.now();
    const dt = timeUtils.toDateTime('12:00');
    expect(dt).not.toBeNull();
    expect(dt.hour()).toBe(12);
    expect(dt.minute()).toBe(0);

    const dt2 = timeUtils.toDateTime('5h');
    expect(dt2).not.toBeNull();

    const dt3 = timeUtils.toDateTime(1000); // 1000ms
    expect(dt3).not.toBeNull();
  });

  test('toToday (deprecated)', () => {
    const todayZdt = timeUtils.toToday('12:00');
    const now = time.ZonedDateTime.now();
    expect(todayZdt.year()).toBe(now.year());
    expect(todayZdt.monthValue()).toBe(now.monthValue());
    expect(todayZdt.dayOfMonth()).toBe(now.dayOfMonth());
  });

  test('betweenTimes (deprecated)', () => {
    // 12:00 pm should be between 10:00 and 14:00
    const start = '10:00';
    const end = '14:00';
    const testTime = '12:00';
    expect(timeUtils.betweenTimes(start, end, testTime)).toBe(true);

    const outOfBounds = '15:00';
    expect(timeUtils.betweenTimes(start, end, outOfBounds)).toBe(false);
  });
});
