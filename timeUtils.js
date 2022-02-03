const javaZDT = Java.type('java.time.ZonedDateTime');
const String = Java.type('java.lang.String');
const DateTimeType = Java.type('org.openhab.core.library.types.DateTimeType');
const DecimalType = Java.type('org.openhab.core.library.types.DecimalType');
const PercentType = Java.type('org.openhab.core.library.types.PercentType');
const QuantityType = Java.type('org.openhab.core.library.types.QuantityType');

/**
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
  var regex = new RegExp(/[\d]+[d|h|m|s|z]/gi);
  var numMatches = 0;
  var part = null;

  var params = { 'd': 0, 'h': 0, 'm':0, 's':0, 'z':0 };
  while(null != (part=regex.exec(durationStr))) {
    numMatches++;

    var scale = part[0].slice(-1).toLowerCase();
    var value = Number(part[0].slice(0, part[0].length-1));
    params[scale] = value;
  }

  if(numMatches === 0){
    return null;
  }
  else {
    return time.Duration.ofDays(params['d']).plusHours(params['h']).plusMinutes(params['m']).plusSeconds(params['s']).plusMillis(params['z']);
  }
}

/**
 * Adds the duration to now. If the duration is a String, call parseDuration
 * first. 
 * @param {time.Duration|String} duration
 * @returns {time.ZonedDateTime} the duration added to now, null if not a usable duration
 */
const durationToDateTime = (duration)=> {
  if(duration instanceof  time.Duration) {
      return time.ZonedDateTime.now().plus(duration);
  }
  else if(typeof duration === 'string' || duration instanceof String){
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
 * Converts a number of date time formats and duration formats to a time.ZonedDateTime
 * @param {time.ZonedDateTime|java.time.ZonedDateTime|String|number|bigint|DateTimeType|DecimalType|PercentType|QuantityType} when date time or duration to convert
 * @returns {time.ZonedDateTime} null if it cannot be converted
 */
const toDateTime = (when) => {
  var dt = null;

  if(!when) {
    // leave dt as null
  }
  else if(when instanceof time.ZonedDateTime) {
    dt = when;
  }
  else if(when instanceof javaZDT) {
    const epoch = when.toInstant().toEpochMilli();
    const instant = time.Instant.ofEpochMilli(epoch);
    dt = time.ZonedDateTime.ofInstant(instant, time.ZoneId.SYSTEM);
  }
  else if(when instanceof Date) {
    const native = time.nativeJs(when);
    const instant = time.Instant.from(native);
    dt = time.ZonedDateTime.ofInstant(instant, time.ZoneId.SYSTEM);
  }
  else if(typeof when === 'string' || when instanceof String){
    if(isISO8601(when)){
//      dt = time.ZonedDateTime.of(time.LocalDateTime.parse(when), time.ZoneId.systemDefault());
    }
    else {
      dt = durationToDateTime(when);
    }
  }
  else if(typeof when === 'number' || typeof when === "bigint") {
    dt = time.ZonedDateTime.now().plus(when, time.ChronoUnit.MILLIS);
  }
  else if(when instanceof DateTimeType){
    dt = when.getZonedDateTime();
  }
  else if(when instanceof PercentType) {
    dt = time.ZonedDateTime.now().plusSeconds(when.intValue());
  }
  else if(when instanceof QuantityType) {
    const secs = when.toUnit('s');
    if(secs) {
      dt = time.ZonedDateTime.now().plusSeconds(when.longValue());
    }
    // else incompatible QuantityUnits type
  }
  else if(when instanceof DecimalType || when instanceof PercentType || when instanceof QuantityType || when instanceof Number){
    dt = time.ZonedDateTime.now().plus(when.longValue(), time.ChronoUnit.MILLIS);
  }
  // else unsupported type

  return dt;
}

/**
 * Moves the date time to today's date. If pass a duration, converts it to a 
 * ZonedDateTime and then moves it to today's date.
 * @param {time.ZonedDateTime|java.time.ZonedDateTime|String|number|bigint|DateTimeType|DecimalType|PercentType|QuantityType} when date time or duration to move to today's date
 * @returns time.ZonedDateTime with today's date
 */
const toToday = (when) => {
  var now = time.ZonedDateTime.now();
  var dt = toDateTime(when);
  return dt.withYear(now.year())
           .withMonth(now.month())
           .withDayOfMonth(now.dayOfMonth());
}

module.exports = {
  parseDuration,
  durationToDateTime,
  isISO8601,
  toDateTime,
  toToday
}