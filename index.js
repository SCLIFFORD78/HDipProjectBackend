"use strict";

const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Handlebars = require("handlebars");
const Cookie = require("@hapi/cookie");
const env = require("dotenv");
const Bell = require("@hapi/bell");
const fs = require("fs");
const https = require("https");
const utils = require("./app/api/utils.js");
const express = require("express");
env.config();



/* const server = Hapi.server({
  port: process.env.PORT || 443,
  tls: {
    key: fs.readFileSync("keys/private/webserver.key"),
    cert: fs.readFileSync("keys/webserver.crt"),
  },
});
 */
const server2 = Hapi.server({
  port: process.env.PORT || 4001,
  routes: { cors: true },
});

async function init() {

  await server2.register(Inert);
  await server2.register(Vision);
  await server2.register(Cookie);
  await server2.register(require("hapi-auth-jwt2"));
  server2.validator(require("@hapi/joi"));

  server2.views({
    engines: {
      hbs: require("handlebars"),
    },
    relativeTo: __dirname,
    path: "./app/views",
    layoutPath: "./app/views/layouts",
    partialsPath: "./app/views/partials",
    layout: true,
    isCached: false,
  });





  server2.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.cookie_name,
      password: process.env.cookie_password,
      isSecure: false,
    },
    redirectTo: "/",
  });
  server2.auth.strategy("jwt", "jwt", {
    key: process.env.secret,
    validate: utils.validate,
    verifyOptions: { algorithms: ["HS256"] },
  });

  server2.auth.default("session");


  server2.route(require("./routes-api"));

  await server2.start();

  console.log(`Server running at: ${server2.info.uri}`);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});



init();
