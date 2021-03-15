// timeUtils 
var logger = Java.type("org.slf4j.LoggerFactory").getLogger("org.openhab.model.script.Rules.Tests");
var OPENHAB_CONF = java.lang.System.getenv("OPENHAB_CONF");
load(OPENHAB_CONF+'/automation/lib/javascript/community/timeUtils.js');

logger.info("parsing the duration");
var dur = parseDuration("1d 2h 3s 10s");
logger.info(dur.toString());
var dt = durationToDateTime(dur);
logger.info(dt.toString());
dur = parseDuration("10D 3H 200z");
logger.info(dur.toString());

if(isISO8601("2020-11-06T13:03:00")) {
  logger.info("It's ISO8601!");
}
if(!isISO8601("2020-11-06 13:03:00")) {
  logger.info("It's not ISO8601!");
}

var ZonedDateTime = Java.type("java.time.ZonedDateTime");
dt = ZonedDateTime.now()
logger.info("Already ZDT: " + toDateTime(dt));
logger.info("ISO8601: " + toDateTime("2020-11-06T13:03:01"));
logger.info("Duration: " + toDateTime("10m"));
logger.info("Millis: " + toDateTime(2000));

var dtt = new DateTimeType();
logger.info("Raw date time type: " + dtt);
logger.info("DateTimeType: " + toDateTime(new DateTimeType()));
logger.info("DecimalType: " + toDateTime(new DecimalType(5000)));
logger.info("PercentType: " + toDateTime(new PercentType(50)));
logger.info("QuantityType: " + toDateTime(new QuantityType("50 %")));

dt = dt.minusDays(1);
logger.info("Yesterday : " + dt + " To today: " + toToday(dt));
