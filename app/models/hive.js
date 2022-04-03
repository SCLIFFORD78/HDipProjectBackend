

"use strict";

const Hive = {
  fbId:   "",
  type: "",
  user: "",
  tag:  0,
  description:  "",
  recordedData : "",
  image : "",
  dateRegistered:  Math.floor(Date.now() / 1000),
  sensorNumber: "",
  location: {lat:0.0, lng:0.0, zoom:15},
  details: []
}
module.exports = Hive;

