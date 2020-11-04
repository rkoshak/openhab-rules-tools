from datetime import datetime, time
import community.time_utils
reload(community.time_utils)
from community.time_utils import to_today, to_datetime
from core.date import days_between, seconds_between, to_python_datetime, to_joda_datetime, to_java_zoneddatetime
from core.log import logging, LOG_PREFIX
from org.joda.time import DateTime
from java.time import ZonedDateTime, ZoneId
from java.time.temporal import ChronoUnit



log = logging.getLogger("{}.TEST.time_utils".format(LOG_PREFIX))

#To_today tests

today_time = to_today(time(23, 00, 00, 00))
today_datetime = to_today(datetime(2019, 10, 8, 23, 00, 00, 00))
today_ZonedDateTime = to_today(ZonedDateTime.of(2019, 11, 8, 23, 00, 00, 00, ZoneId.systemDefault()))

try:
    log.info("start test to_today with different input and output Joda datetime")  
    #Check date was changed
    assert days_between(ZonedDateTime.now(), today_time) == 0, "time object failed to change date for today"
    assert days_between(ZonedDateTime.now(), today_datetime) == 0, "datetime object failed to change date for today"
    assert days_between(ZonedDateTime.now(), today_ZonedDateTime) == 0, "ZonedDateTime object failed to change date for today"
    #Check time wasn't changed
    assert time(23, 00, 00, 00) == to_python_datetime(today_time).time(), "time object failed, time has changed"
    assert to_joda_datetime(datetime(2019, 10, 8, 23, 00, 00)).toLocalTime() == today_datetime.toLocalTime(), "datetime object failed, time has changed"
    assert to_joda_datetime(ZonedDateTime.of(2019, 11, 8, 23, 00, 00, 00, ZoneId.systemDefault())).toLocalTime() == today_ZonedDateTime.toLocalTime()
    

    log.info("start test to_today with different input and output python datetime") 
    #Check date was changed
    #cannot store python datetime in variable due to jython bug
    assert days_between(ZonedDateTime.now(), \
                    to_today(time(23, 00, 00, 00), output= 'Python', log = log)) == 0, \
                    "time object failed to change date for today"
    assert days_between(ZonedDateTime.now(), \
                    to_today(datetime(2019, 10, 8, 23, 00, 00), output= 'Python', log = log)) == 0, \
                    "datetime object failed to change date for today"
    assert days_between(ZonedDateTime.now(), today_ZonedDateTime) == 0, \
                    "ZonedDateTime object failed to change date for today"
    #Check time wasn't changed
    assert time(22, 59, 59, 00) <= to_today(time(23,00,00, 00), output= 'Python', log = log).time() \
                    <= time(23, 00, 1, 00), \
                    "time object failed, time has changed"+str(today_time)
    assert datetime(2019, 10, 8, 23, 00, 00).time() \
                    == to_today(datetime(2019, 10, 8, 23, 00, 00), output= 'Python', log = log).time(), \
                    "datetime object failed, time has changed"
    assert to_python_datetime(ZonedDateTime.of(2019, 11, 8, 23, 00, 00, 00, ZoneId.systemDefault())).time() \
                    == to_today(ZonedDateTime.of(2019, 11, 8, 23, 00, 00, 00, ZoneId.systemDefault()), output= 'Python', log = log).time(), \
                    "ZonedDateTime object failed, time has changed"
 



    log.info("start test to_today with different input and output Java ZonedDateTime")

    today_time = to_today(time(23,00,00, 00), output='Java', log=log)
    today_datetime = to_today(datetime(2019, 10, 8, 23, 00, 00), output='Java', log=log)
    today_ZonedDateTime = to_today(ZonedDateTime.of(2019, 11, 8, 23, 00, 00, 00, ZoneId.systemDefault()), output='Java', log=log)
  
    #Check date was changed
    assert days_between(ZonedDateTime.now(), today_time) == 0, \
                "time object failed to change date for today"
    assert days_between(ZonedDateTime.now(), today_datetime) == 0, \
                "datetime object failed to change date for today"
    assert days_between(ZonedDateTime.now(), today_ZonedDateTime) == 0, \
                "ZonedDateTime object failed to change date for today"
    #Check time wasn't changed
    assert time(22, 59, 59, 500000) <= to_python_datetime(today_time).time() <= time(23, 00, 1, 00), \
                             "time object failed, time has changed"
    assert to_java_zoneddatetime(datetime(2019, 10, 8, 22, 59, 59,0)).toLocalTime() \
                    <= today_datetime.toLocalTime() <= \
                    to_java_zoneddatetime(datetime(2019, 10, 8, 23, 00, 1, 00)).toLocalTime(), \
                    "datetime object failed, time has changed {} {}" \
                    .format(str(to_java_zoneddatetime(datetime(2019, 10, 8, 23, 00, 00)).toLocalTime()), \
                    str(today_datetime.toLocalTime()))
    assert ZonedDateTime.of(2019, 11, 8, 22, 59, 59, 500000, ZoneId.systemDefault()).toLocalTime() \
                    <= today_ZonedDateTime.toLocalTime()<= \
                    ZonedDateTime.of(2019, 11, 8, 23, 00, 1, 00, ZoneId.systemDefault()).toLocalTime() \
                    , "ZonedDateTime object failed, time has changed {} {}" \
                    .format(str(ZonedDateTime.of(2019, 11, 8, 23, 00, 00, 00, ZoneId.systemDefault()).toLocalTime()), \
                    str(today_ZonedDateTime.toLocalTime()))

    #Test other format
    test_dict={'integer: ': int(5000),
               'duration: ': "5s",
               'Decimal type: ': DecimalType(5000),
               #'Percent type: ': PercentType(100),
               'Quantity Type: ': QuantityType('5000ms'),
               'ISO 8601 format': DateTime().now().plusSeconds(5).toString()
               }
    #Test other format to Joda
    for keys in test_dict:
        log.info("Checking " + keys + " to Joda DateTime")
        assert abs(seconds_between(ZonedDateTime.now().plus(5000, ChronoUnit.MILLIS),
                               to_datetime(test_dict[keys], log = log))) < 1, \
                               "failed to return a datetime with offset of {} from {}" \
                               .format(str(test_dict[keys]),str(keys))


    #Test other format to python
    test_dict['ISO 8601 format'] = DateTime().now().plusSeconds(5).toString()
    for keys in test_dict:
        log.info("Checking " + keys +" to Python datetime")
        assert abs(seconds_between(ZonedDateTime.now().plus(5000, ChronoUnit.MILLIS),
                               to_datetime(test_dict[keys], output='Python', log = log))) < 1, \
                               "failed to return a datetime with offset of {} from {}" \
                               .format(str(test_dict[keys]),str(keys))

    #Test other format to Java
    test_dict['ISO 8601 format'] = DateTime().now().plusSeconds(5).toString()
    for keys in test_dict:
        log.info("Checking " + keys +" to Java ZonedDateTime")
        assert abs(seconds_between(ZonedDateTime.now().plus(5000, ChronoUnit.MILLIS),
                               to_datetime(test_dict[keys], output='Java', log = log))) < 1, \
                               "failed to return a ZonedDateTime with offset of {} from {}" \
                               .format(str(test_dict[keys]),str(keys))


except AssertionError:
    import traceback
    log.error("Exception: {}".format(traceback.format_exc()))

else:
    log.info("Test passed!")  
