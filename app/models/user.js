"use strict";

const User = {
  fbid:   "",
  firstName: "",
  secondName:  "",
  image:  "",
  userName : "",
  dateJoined:  Math.floor(Date.now() / 1000).toString(),
  admin: false,
  email: ""
}
module.exports = User;
