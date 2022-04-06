

"use strict";

const Alarm = {
  fbid:   "",
  alarmEvent: "",
  act: false,
  hiveid:  "",
  tempAlarm:  0,
  dateActive : "",
  recordedValue : 0,
  dateLogged:  Math.floor(Date.now() / 1000).toString()
}
module.exports = Hive;

