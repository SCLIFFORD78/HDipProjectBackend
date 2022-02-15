"use strict";

const assert = require("chai").assert;
const HiveTracker = require("./hiveTracker");
const fixtures = require("./fixtures.json");
const utils = require("../app/api/utils.js");

suite("Authentication API tests", function () {
  let users = fixtures.users;
  let newUser = fixtures.newUser;

  const hiveTracker = new HiveTracker(fixtures.hiveTracker);

  setup(async function () {
    await hiveTracker.deleteAllUsers();
  });

  test("authenticate", async function () {
    const test = await hiveTracker.createUser(newUser);
    const response = await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    const returnedUser = await hiveTracker.getUserByEmail(newUser.email);
    assert(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async function () {
    const returnedUser = await hiveTracker.createUser(newUser);
    const response = await hiveTracker.authenticate({email: newUser.email, password:newUser.password});

    const userInfo = utils.decodeToken(response.token);
    assert.equal(userInfo.email, returnedUser.email);
    assert.equal(userInfo.userId, returnedUser._id);
  });
});
