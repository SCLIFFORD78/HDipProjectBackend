"use strict";

const Accounts = require("./app/controllers/accounts");
const Hives = require("./app/controllers/hives");

module.exports = [
  { method: "GET", path: "/", config: Accounts.index },
  { method: "GET", path: "/signup", config: Accounts.showSignup },
  { method: "GET", path: "/login", config: Accounts.showLogin },
  { method: "GET", path: "/logout", config: Accounts.logout },
  { method: "POST", path: "/signup", config: Accounts.signup },
  { method: "POST", path: "/login", config: Accounts.login },
  { method: "POST", path: "/googleLogin", config: Accounts.googleLogin },
  { method: "GET", path: "/settings", config: Accounts.showSettings },
  { method: "POST", path: "/settings", config: Accounts.updateSettings },
  { method: "POST", path: "/deleteAccount", config: Accounts.deleteAccount },
  { method: "POST", path: "/toggleAdmin", config: Accounts.toggleAdmin },
  { method: "POST", path: "/adminDeleteAccount/{id}", config: Accounts.adminDeleteAccount },
  { method: "GET", path: "/confirm/{status}", config: Accounts.updateStatus },


  { method: "GET", path: "/home", config: Hives.home },
  { method: "POST", path: "/addHive", config: Hives.addHive },
  { method: "GET", path: "/maps", config: Hives.maps },
  { method: "POST", path: "/maps", config: Hives.maps },
  { method: "POST", path: "/hive-info", config: Hives.hiveInfo },
  { method: "POST", path: "/addComment", config: Hives.addComments },
  { method: "POST", path: "/deleteComment/{id}", config: Hives.deleteComment },
  { method: "POST", path: "/deleteHive", config: Hives.deleteHive },
  { method: "POST", path: "/editLocation", config: Hives.editLocation },
  { method: "POST", path: "/updateLocation", config: Hives.updateLocation },
  { method: "GET", path: "/gallery/{id}", config: Hives.gallery },
  { method: "GET", path: "/deleteimage/{folder}/{id}", config: Hives.deleteImage },
  

  {
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: "./public",
      },
    },
    options: { auth: false },
  },

  
];
