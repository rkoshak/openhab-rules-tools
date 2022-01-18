var {timeUtils, testUtils} = require('openhab_rules_tools');
var logger = log('rules_tools.timeUtils tests');

var isClose = (dur1, dur2, minDur) => {
  const delta = time.Duration.between(dur1, dur2).abs();
  return delta.compareTo(minDur) <= 0;
}

logger.info('Starting timeUtils tests');

// Test 1: parseDuration
var dur = timeUtils.parseDuration('1d 2h 3m 10s');
var standard = time.Duration.ofDays(1).plusHours(2).plusMinutes(3).plusSeconds(10);
testUtils.assert((dur.compareTo(standard) == 0), 'Duration was not parsed correctly!');

// Test 2: duration to date time
var dt = timeUtils.durationToDateTime(dur);
standard = time.ZonedDateTime.now().plus(dur);
var delta = time.Duration.between(dt, standard);
testUtils.assert((delta.compareTo(time.Duration.ofSeconds(1)) <= 0), 
                 'Library DT is more than one second off of expected DT');

// Test 3: isISO8601
testUtils.assert(timeUtils.isISO8601('2020-11-06T13:03:00-07:00'), 
                 'isISO8601 failed to identify a valid string');
testUtils.assert(!timeUtils.isISO8601('2020-11-06 13:03:00'), 
                 'isISO8601 failed to identity an invalid string');

// Test 4: Already joda-js ZonedDatetime
dt = time.ZonedDateTime.now();
testUtils.assert((dt === timeUtils.toDateTime(dt)), 
                 'joda-js ZonedDateTime was not left alone!');

// Test 5: Convert Java ZonedDateTime to joda-js ZonedDateTime
var JZDT = Java.type('java.time.ZonedDateTime');
var jnow = JZDT.now();
var jodanow = timeUtils.toDateTime(jnow);
testUtils.assert((jodanow instanceof time.ZonedDateTime 
                  && jnow.toInstant().toEpochMilli() == jodanow.toInstant().toEpochMilli()),
                 'Failed to convert Java ZonedDateTime to joda-js ZonedDateTime');

// Test 6: ISO8601 String Parsing not working
//standard = time.ZonedDateTime.parse('2021-01-07T13:50:01-07:00', time.DateTimeFormatter.ISO_LOCAL_DATE_TIME);
//testUtils.assert((standard.compareTo(timeUtils.toDateTime('2021-01-07T13:50:01')) == 0),
//                'Failed to parse ISO8601 String');

var millisDur = time.Duration.ofMillis(10);

// Test 7: Duration String

testUtils.assert(isClose(time.ZonedDateTime.now().plusMinutes(10), timeUtils.toDateTime('10m'), millisDur),
                 'Failed to convert a duration string to a datetime');

// Test 8: Milliseconds
testUtils.assert(isClose(time.ZonedDateTime.now().plus('2000', time.ChronoUnit.MILLIS), timeUtils.toDateTime(2000), millisDur),
                'Failed to convert milliseconds to datetime');

// Test 9: DateTimeType
var DateTimeType = Java.type('org.openhab.core.library.types.DateTimeType');
var dtt = new DateTimeType();
standard = dtt.getZonedDateTime();
dt = timeUtils.toDateTime(dtt);
testUtils.assert((dt === standard),
                 'Failed to convert DateTimeType');

// Test 10: DecimalType
var DecimalType =  Java.type('org.openhab.core.library.types.DecimalType');
testUtils.assert(isClose(time.ZonedDateTime.now().plus('3000', time.ChronoUnit.MILLIS), timeUtils.toDateTime(new DecimalType(3000)), millisDur),
                'Failed to convert DecimalType to datetime');

// Test 11: PercentType
var PercentType =  Java.type('org.openhab.core.library.types.PercentType');
testUtils.assert(isClose(time.ZonedDateTime.now().plusSeconds(50), timeUtils.toDateTime(new PercentType(50)), millisDur),
                'Failed to convert PercentType to datetime');

// Test 12: QuantityType
var QuantityType =  Java.type('org.openhab.core.library.types.QuantityType');
testUtils.assert(isClose(time.ZonedDateTime.now().plusSeconds(5), timeUtils.toDateTime(new QuantityType('5 s')), millisDur),
                'Failed to convert QuantityType to datetime');
testUtils.assert(!timeUtils.toDateTime(new QuantityType('68 °F')),
                'Failed to return null for unsupported QuantityType');

// Test 13: toToday
dt = dt.minusDays(1);
testUtils.assert(timeUtils.toToday(dt).dayOfMonth() == time.ZonedDateTime.now().dayOfMonth());

logger.info("timeUtils tests are done");