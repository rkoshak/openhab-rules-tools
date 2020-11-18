(function(context) {

  'use strict';
  var log = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.time_utils");

  // Import the Java Classes
  var ZonedDateTime = (context.ZonedDateTime === undefined) ? Java.type("java.time.ZonedDateTime") : context.ZonedDateTime;
  var LocalDateTime = (context.LocalDateTime === undefined) ? Java.type("java.time.LocalDateTime") : context.LocalDateTime;
  var ZoneId = (context.ZoneId === undefined) ? Java.type("java.time.ZoneId") : context.ZoneId;
  var ChronoUnit = (context.ChronoUnit === undefined) ? Java.type("java.time.temporal.ChronoUnit") : context.ChronoUnit;
  var Duration = (context.Duration === undefined) ? Java.type("java.time.Duration") : context.Duration;
  var DateTimeType = (context.DateTimeType === undefined) ? Java.type("org.openhab.core.types.DateTimeType") : context.DateTimeType;
  var DecimalType = (context.DecimalType === undefined) ? Java.type("org.openhab.core.types.DecimalType") : context.DecimalType;
  var PercentType = (context.PercentType === undefined) ? Java.type("org.openhab.core.types.PercentType") : context.PercentType;
  var QuantityType = (context.QuantityType === undefined) ? Java.type("org.openhab.core.types.QuantityType") : context.QuantityType;


  /** 
   * Parses a duration string returning a Duration object. Supports:
   *  - d days
   *  - h hours
   *  - m minutes
   *  - s seconds
   *  - z milliseconds
   * The unit is followed by an integer (decimals are not supported).
   * Examples:
   *  - 5d 2h 7s
   *  - 5m
   *  - 1h23m
   * 
   * @param {string} timeStr 
   * @return {java.time.Duration} the string parsed to a Duration
   */
  context.parseDuration = function(timeStr) {
    var regex = new RegExp(/[\d]+[d|h|m|s|z]/gi);
    var numMatches = 0;
    var part = null;

    var params = { "d": 0, "h": 0, "m":0, "s":0, "z":0 };
    while(null != (part=regex.exec(timeStr))) {
      log.debug("Match = " + part[0]);
      numMatches++;

      var scale = part[0].slice(-1).toLowerCase();
      var value = Number(part[0].slice(0, part[0].length-1));
      params[scale] = value;
    }

    if(numMatches === 0){
      log.warn("Could not parse any time information from '" + timeStr +"'. Examples of valid string: '8h', '2d8h5s200z', '3d 7m'.");
      return null;
    }
    else {
      log.debug("Days = " + params["d"] + " hours = " + params["h"] + " minutes = " + params["m"] + " seconds = " + params["s"] + " msec = " + params["z"]);
      return Duration.ofDays(params["d"]).plusHours(params["h"]).plusMinutes(params["m"]).plusSeconds(params["s"]).plusMillis(params["z"]);
    }
  }

  /** 
   * Adds the passed in Duration to now and returns the resultant ZonedDatetime. 
   * @param {string | java.time.Duration} dur the duration to add to now, if a string see parseDuration above
   * @return {java.time.ZonedDateTime} instant that is dur away from now
   */
  context.durationToDateTime = function(dur) {
    if(dur instanceof  Duration) {
      return ZonedDateTime.now().plus(dur);
    }
    else if(typeof dur === 'string' || dur instanceof String){
      return durationToDateTime(parseDuration(dur));
    }
  }

  /** 
   * @return {Boolean} Returns true if the passed in string conforms to ISO 8601. 
   */
  context.isISO8601 = function(dtStr) {
    var regex = new RegExp(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$/);
    return regex.test(dtStr);
  }

  /** 
   * Converts a number of supported types to a ZonedDateTime including:
   *  - ISO80601 formatted String
   *  - Duration String (see parseDuration above) which is added to now
   *  - Number types which are treated as milliseconds to add to now
   *  - openHAB Number Types which are treated as milliseconds to add to now
   *  - openHAB DateTimeType
   * @param {string|int|long|java.time.Duration|java.lang.Number|org.openhab.core.types.DateTimeType|org.openhab.core.types.DecimalType|org.openhab.core.types.QuantityType|java.time.Duration|java.time.ZonedDateTime} when the representation of time converted to ZonedDateTime
   * @return {java.time.ZonedDateTime} when converted to a ZonedDateTime
   */
  context.toDateTime = function(when) {
    var dt = null;

    if(when instanceof ZonedDateTime) {
      log.debug("Already ZonedDateTime " + when.toString());
      dt = when;
    }
    else if(typeof when === 'string' || when instanceof String){
      if(isISO8601(when)){
        log.debug("Converting ISO80601 local date time " + when);
        dt = ZonedDateTime.of(LocalDateTime.parse(when), ZoneId.systemDefault());
      }
      else {
        log.debug("Converting duration " + when);
        dt = durationToDateTime(when);
      }
    }
    else if(typeof when === 'number' || typeof when === "bigint") {
      log.debug("Converting number " + when);
      dt = ZonedDateTime.now().plus(when, ChronoUnit.MILLIS);
    }
    else if(when instanceof DateTimeType){
      log.debug("Converting DateTimeType " + when.toString());
      dt = when.getZonedDateTime();
    }
    else if(when instanceof DecimalType || when instanceof PercentType || when instanceof QuantityType || when instanceof Number){
      log.debug("Converting openHAB number type " + when.toString());
      dt = ZonedDateTime.now().plus(when.longValue(), ChronoUnit.MILLIS);
    }
    else {
      log.warn("In toDateTime, cannot convert when, unknown or unsupported type: " + when);
    }

    return dt;
  }

  /** 
   * Moves the passed in ZonedDateTime to today. 
   * @return {java.time.ZonedDateTime} when converted to a ZonedDateTime and moved to today's date
   */
  context.toToday = function(when) {
    var now = ZonedDateTime.now();
    var dt = toDateTime(when);
    return dt.withYear(now.getYear()).withMonth(now.getMonthValue()).withDayOfMonth(now.getDayOfMonth());
  }
  
  })(this);
  