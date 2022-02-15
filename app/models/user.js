"use strict";

const Mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
const Boom = require("@hapi/boom");
const bcrypt = require("bcrypt");
const Schema = Mongoose.Schema;
const DB = require("./db");


const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  admin: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["Pending", "Active"],
    default: "Pending",
  },
  confirmationCode: {
    type: String,
    unique: true,
  },
});

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email : email});
};

userSchema.methods.comparePassword = async function(candidatePassword) {          
  const isMatch = await bcrypt.compare(candidatePassword, this.password);         
  if (!isMatch) {
    throw Boom.unauthorized('Password mismatch');
  }
  return this;
};
userSchema.plugin(autoIncrement.plugin, { model: "User", field: "memberNumber" });

module.exports = Mongoose.model("User", userSchema);
