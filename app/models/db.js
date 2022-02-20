"use strict";

const env = require("dotenv");
env.config();

const Mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");

Mongoose.set("useNewUrlParser", true);
Mongoose.set("useUnifiedTopology", true);
Mongoose.set("useFindAndModify", false);
Mongoose.set("useCreateIndex", true);

Mongoose.connect(process.env.db);
const db = Mongoose.connection;

function initDB(){
  autoIncrement.initialize(db);
;}

initDB();

db.on("error", function (err) {
  console.log(`database connection error: ${err}`);
});

db.on("disconnected", function () {
  console.log("database disconnected");
});

db.once("open", function () {
  console.log(`database connected to ${this.name} on ${this.host}`);
});

async function seed() {
  var seeder = require("mais-mongoose-seeder")(Mongoose);
  const data = require("./seed-data.json");
  const Hive = require("./hive");
  const User = require("./user");
  const dbData = await seeder.seed(data, { dropDatabase: false, dropCollections: true });
  console.log(dbData);
}

/*  db.once("open", function () {
  console.log(`database connected to ${this.name} on ${this.host}`);
  seed();
});  */
