

"use strict";

const Hive = {
  fbid:   "",
  type: "",
  user: "",
  tag:  0,
  description:  "",
  recordedData : "",
  image : "",
  dateRegistered:  Math.floor(Date.now() / 1000).toString(),
  sensorNumber: "",
  location: {lat:0.0, lng:0.0, zoom:15},
  tempAlarm: 18,
<<<<<<< HEAD
  alarmEvents: "",
=======
>>>>>>> master
}
module.exports = Hive;

