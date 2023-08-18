const javaZDT = Java.type('java.time.ZonedDateTime');
const String = Java.type('java.lang.String');
const DateTimeType = Java.type('org.openhab.core.library.types.DateTimeType');
const DecimalType = Java.type('org.openhab.core.library.types.DecimalType');
const PercentType = Java.type('org.openhab.core.library.types.PercentType');
const QuantityType = Java.type('org.openhab.core.library.types.QuantityType');

/**
 * DEPRECATED DEPRECATED DEPRECATED
 * Use openhab-js time.Duration.parse() instead, note it uses ISO8601 duration formats
 * Parses a duration string returning a js-joda Duration representing the
 * duration. Supports the followiung units:
 *   - d days
 *   - h hours
 *   - m minutes
 *   - s seconds
 *   - s milliseconds
 * The unit is preceeded by an integer (decimals are not supported).
 * Examples:
 *   - 5d 2h 7s
 *   - 5m
 *   - 1h23m
 *
 * @param {String} durationStr string representation of the duration
 * @returns {time.Duration} null if the string is not parsable
 */
const parseDuration = (durationStr) => {
  console.warn('timeUtils.parseDuration() is deprecated. Use time.Duration.parse() instead.');
  var regex = new RegExp(/[\d]+[d|h|m|s|z]/gi);
  var numMatches = 0;
  var part = null;

  var params = { 'd': 0, 'h': 0, 'm': 0, 's': 0, 'z': 0 };
  while (null != (part = regex.exec(durationStr))) {
    numMatches++;

    var scale = part[0].slice(-1).toLowerCase();
    var value = Number(part[0].slice(0, part[0].length - 1));
    params[scale] = value;
  }

  if (numMatches === 0) {
    return null;
  }
  else {
    return time.Duration.ofDays(params['d']).plusHours(params['h']).plusMinutes(params['m']).plusSeconds(params['s']).plusMillis(params['z']);
  }
}

/**
 * DEPRECATED DEPRECATED DEPRECATED
 * Use openhab-js time.toZDT(duration)
 * Adds the duration to now. If the duration is a String, call parseDuration
 * first.
 * @param {time.Duration|String} duration
 * @returns {time.ZonedDateTime} the duration added to now, null if not a usable duration
 */
const durationToDateTime = (duration) => {
  console.warn('timeUtils.durationToDateTime() is deprecated, use time.toZDT() instead.');
  if (duration instanceof time.Duration) {
    return time.ZonedDateTime.now().plus(duration);
  }
  else if (typeof duration === 'string' || duration instanceof String) {
    return durationToDateTime(parseDuration(duration));
  }
}

/**
 * Tests the passed in string to see if it conforms to the ISO8601 standard
 * @param {String} dtStr potential ISO8601 string
 * @returns {boolean} true if ISO8601 format
 */
const isISO8601 = (dtStr) => {
  var regex = new RegExp(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$/);
  return regex.test(dtStr);
}

/**
 * Tests the string to see if it matches a 24 hour clock time
 * @param {String} dtStr potential HH:MM String
 * @returns {boolean} true if it matches HH:MM
 */
const is24Hr = (dtStr) => {
  var regex = new RegExp(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);
  return regex.test(dtStr);
}

/**
 * Tests the string to see if it matches a 12 hour clock time
 * @param {String} dtStr potential hh:MM aa string
 * @returns {boolean} true if it matches hh:mm aa
 */
const is12Hr = (dtStr) => {
  var regex = new RegExp(/^(0?[0-9]|1[0-2]):[0-5][0-9] ?[a|p|A|P]\.?[m|M]\.?$/);
  return regex.test(dtStr);
}

/**
 * DEPRECATED DEPRECATED DEPRECATED
 * openhab-js now ships with toZDT() which implements this.
 *
 * Converts a number of date time formats and duration formats to a
 * time.ZonedDateTime. Durations represeted by a Duration, duration string (see
 * parseDuration), and raw numbers are added to now. Raw numbers are assumed to
 * represent milliseconds. PercentType and QuantityTypes are assumed to
 * represent seconds. Date times are converted to a time.ZonedDateTime.
 * Time strings (e.g. "13:12" or "4:56 pm") return a ZonedDateTime with at that
 * time with today's date.
 * @param {time.ZonedDateTime|java.time.ZonedDateTime|String|number|bigint|DateTimeType|DecimalType|PercentType|QuantityType} when date time or duration to convert
 * @returns {time.ZonedDateTime} null if it cannot be converted
 */
const toDateTime = (when) => {
  console.warn('timeUtils.toDateTime() is deprecated. Use time.toZDT() instead.');
  var dt = null;

  if (!when) {
    // leave dt as null
  }
  else if (when instanceof time.ZonedDateTime) {
    dt = when;
  }
  else if (when instanceof javaZDT) {
    const epoch = when.toInstant().toEpochMilli();
    const instant = time.Instant.ofEpochMilli(epoch);
    dt = time.ZonedDateTime.ofInstant(instant, time.ZoneId.SYSTEM);
  }
  else if (when instanceof Date) {
    const native = time.nativeJs(when);
    const instant = time.Instant.from(native);
    dt = time.ZonedDateTime.ofInstant(instant, time.ZoneId.SYSTEM);
  }
  else if (typeof when === 'string' || when instanceof String) {
    if (isISO8601(when)) {
      //      dt = time.ZonedDateTime.of(time.LocalDateTime.parse(when), time.ZoneId.systemDefault());
    }
    else if (is24Hr(when)) {
      const parts = when.split(':');
      dt = time.ZonedDateTime.now().withHour(parseInt(parts[0]))
        .withMinute(parseInt(parts[1]))
        .withSecond(0)
        .withNano(0);
    }
    else if (is12Hr(when)) {
      const parts = when.split(':');
      const hr = parseInt(parts[0]);
      const hrConverted = (when.contains('p') || when.contains('P')) ? hr + 12 : hr;
      dt = time.ZonedDateTime.now().withHour(hrConverted)
        .withMinute(parseInt(parts[1]))
        .withSecond(0)
        .withNano(0);
    }
    else {
      dt = durationToDateTime(when);
    }
  }
  else if (typeof when === 'number' || typeof when === "bigint") {
    dt = time.ZonedDateTime.now().plus(when, time.ChronoUnit.MILLIS);
  }
  else if (when instanceof DateTimeType) {
    dt = toDateTime(when.getZonedDateTime());
  }
  else if (when instanceof PercentType) {
    dt = time.ZonedDateTime.now().plusSeconds(when.intValue());
  }
  else if (when instanceof QuantityType) {
    const secs = when.toUnit('s');
    if (secs) {
      dt = time.ZonedDateTime.now().plusSeconds(when.longValue());
    }
    // else incompatible QuantityUnits type
  }
  else if (when instanceof DecimalType || when instanceof Number) {
    dt = time.ZonedDateTime.now().plus(when.longValue(), time.ChronoUnit.MILLIS);
  }
  // else unsupported type

  return dt;
}

/**
 * DEPRECATED DEPRECATED DEPRECATED
 * Use openhab-js toToday.
 * Moves the date time to today's date. If pass a duration, converts it to a
 * ZonedDateTime and then moves it to today's date.
 * @param {time.ZonedDateTime|java.time.ZonedDateTime|String|number|bigint|DateTimeType|DecimalType|PercentType|QuantityType} when date time or duration to move to today's date
 * @returns time.ZonedDateTime with today's date
 */
const toToday = (when) => {
  console.warn('timeUtils.toToday() is deprecated. Use time.toZDT() instead.');
  var now = time.ZonedDateTime.now();
  var dt = toDateTime(when);
  return dt.withYear(now.year())
    .withMonth(now.month())
    .withDayOfMonth(now.dayOfMonth());
}

/**
 * Moves the date time to tomorrow's date. If pass a duration, converts it to a
 * ZonedDateTime and then moves it to tomorrow's date.
 * @param {time.ZonedDateTime|java.time.ZonedDateTime|String|number|bigint|DateTimeType|DecimalType|PercentType|QuantityType} when date time or duration to move to today's date
 * @returns time.ZonedDateTime with tomorrow's date
 */
const toTomorrow = (when) => {
  var tomorrow = time.toZDT('P1D');
  var dt = time.toZDT(when);
  return dt.withYear(tomorrow.year())
    .withMonth(tomorrow.month())
    .withDayOfMonth(tomorrow.dayOfMonth());
}

/**
 * Moves the date time to yesterday's date. If pass a duration, converts it to a
 * ZonedDateTime and then moves it to yesterday's date.
 * @param {time.ZonedDateTime|java.time.ZonedDateTime|String|number|bigint|DateTimeType|DecimalType|PercentType|QuantityType} when date time or duration to move to today's date
 * @returns time.ZonedDateTime with yesterday's date
 */
const toYesterday = (when) => {
  var yesterday = time.toZDT('P-1D');
  var dt = time.toZDT(when);
  return dt.withYear(yesterday.year())
    .withMonth(yesterday.month())
    .withDayOfMonth(yesterday.dayOfMonth());
}

/**
 * DEPRECATED DEPRECATED DEPRECATED
 * Use openhab-js time.betweenTimes instead.
 * Tests to see if now falls between a start time or end time (ignoring the date) with logic
 * to handle cases where the time period spans midnight.
 * @param {time.ZonedDateTime|java.time.ZonedDateTime|String|number|bigint|DateTimeType|DecimalType|PercentType|QuantityType} start date time or duration whose time portion indicates the start of the time period
 * @param {time.ZonedDateTime|java.time.ZonedDateTime|String|number|bigint|DateTimeType|DecimalType|PercentType|QuantityType} end date time or duration whose time portion indicates the end of the time period
 * @param {time.ZonedDateTime|java.time.ZonedDateTime|String|number|bigint|DateTimeType|DecimalType|PercentType|QuantityType} test date time or duration whose time portion indicates time to check whether it falls between, uses now if not supplied
 * @returns {boolean} true if now is between the times (ignoring dates) of the passed in start and end
 */
const betweenTimes = (start, end, test = time.ZonedDateTime.now()) => {
  console.warn('timeUtils.betweenTimes() is deprecated. Use time.ZonedDateTime.isBetweenTimes() instead.');
  var startTime = toDateTime(start);
  var endTime = toDateTime(end);
  const testTime = toDateTime(test);
  const now = time.ZonedDateTime.now();

  // Time spans midnight
  if (endTime.isBefore(startTime)) {
    if (testTime.isAfter(startTime)) {
      endTime = toTomorrow(endTime);
    }
    else if (testTime.isBefore(startTime)) {
      startTime = toYesterday(startTime);
    }
  }

  return testTime.isAfter(startTime) && testTime.isBefore(endTime);
}

module.exports = {
  parseDuration,
  durationToDateTime,
  isISO8601,
  toDateTime,
  toToday,
  toTomorrow,
  toYesterday,
  is24Hr,
  is12Hr,
  betweenTimes
}