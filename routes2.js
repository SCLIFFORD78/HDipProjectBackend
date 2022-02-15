"use strict";

const Accounts = require("./app/controllers/accounts");


module.exports = [
 
  { method: "GET", path: "/confirm/{status}", config: Accounts.updateStatus },
  { method: "GET", path: "/login", config: Accounts.showLogin },

 

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
