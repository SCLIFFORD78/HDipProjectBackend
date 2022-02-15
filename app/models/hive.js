"use strict";

const Mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
const Schema = Mongoose.Schema;
const DB = require('./db');



const hiveSchema = new Schema({
  added: { type: Date, default: Date.now },
  latitude: Number,
  longtitude: Number,
  hiveType: String,
  description: String,
  details: [{comments: String, dateLogged: { type: Date, default: Date.now }}],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});
hiveSchema.plugin(autoIncrement.plugin, {model: 'Hive', field:'hiveNumber'});


module.exports = Mongoose.model("Hive", hiveSchema);

