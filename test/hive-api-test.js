"use strict";

const assert = require("chai").assert;
const HiveTracker = require("./hiveTracker");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("Hive API tests", function () {
  let hives = fixtures.hives;
  let newHive = {
    latitude: fixtures.newHive.latitude,
    longtitude: fixtures.newHive.longtitude,
    hiveType: fixtures.newHive.hiveType,
    description: fixtures.newHive.description,
    comments: fixtures.newHive.comments,
    owner: 1
  }
  let newUser = fixtures.newUser;
  let returnedUser;
  let users = fixtures.users;

  const hiveTracker = new HiveTracker(fixtures.hiveTracker);

  suiteSetup(async function () {
    await hiveTracker.deleteAllHives();
    returnedUser = await hiveTracker.createUser(newUser);
    const response = await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    const returnedHive = await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
  });


  suiteTeardown(async function () {
    await hiveTracker.deleteAllHives();
    hiveTracker.clearAuth();
  });

  setup(async function () {
    await hiveTracker.deleteAllHives();
  });

  test("get all hives", async function () {
    await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
    for (let u of hives) {
      await hiveTracker.createHive(u.latitude,u.longtitude,u.hiveType,u.description,u.comments,returnedUser._id);
    };

    const allHives = await hiveTracker.getHives();
    assert.equal(allHives.length, hives.length + 1);
  });

  test("get all hives by user", async function () {
    //await hiveTracker.deleteAllUsers();
    for (let u of users) {
      await hiveTracker.createUser(u);
      await hiveTracker.authenticate({email: u.email, password:u.password});
      await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,u._id);
    };

    const u1 = await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
    const u2 = await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
    
    const allHiveCount = await hiveTracker.getHives();
    var allHivesByUser = await hiveTracker.getHiveByOwner(returnedUser._id);
    assert.notEqual(allHiveCount.length,allHivesByUser.length);
    assert.equal(allHivesByUser.length, 2);
    await hiveTracker.deleteOneHive(u1._id);
    allHivesByUser = await hiveTracker.getHiveByOwner(returnedUser._id);
    assert.equal(allHivesByUser.length,1);
  });

  test("create a hive", async function () {
    const returnedHive = await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
    assert.deepEqual(returnedHive.latitude,newHive.latitude);
    assert.deepEqual(returnedHive.longtitude,newHive.longtitude);
    assert.deepEqual(returnedHive.hiveType,newHive.hiveType);
    assert.deepEqual(returnedHive.description,newHive.description);
    assert.deepEqual(returnedHive.details[0].comments,newHive.comments);
    assert.deepEqual(returnedHive.owner,returnedUser._id);
  });

  test("get hive", async function () {
    const u1 = await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
    const u2 = await hiveTracker.getHive(u1._id);
    assert.deepEqual(u1, u2);
  });

  test("Add comments", async function () {
    const u1 = await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
    const origCommentCount = u1.details.length;
    const addComment = await hiveTracker.addHiveComment(u1._id, u1.details[0].comments);
    const u2 = await hiveTracker.getHive(u1._id);
    const newCommentCount = u2.details.length;
    assert.deepEqual(u1.details[0].comments, u2.details[1].comments);
    assert.equal(origCommentCount + 1, newCommentCount);

  });

  test("Delete comments", async function () {
    const u1 = await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
    const id = u1.details[0]._id;
    const deletedComment = await hiveTracker.deleteHiveComment(u1._id, id);
    const u2 = await hiveTracker.getHive(u1._id);
    const newCommentCount = u2.details.length;
    assert.equal(u1.details.length, newCommentCount + 1);

  });

  test("get invalid hive", async function () {
    const u1 = await hiveTracker.getHive("1234");
    assert.isNull(u1);
    const u2 = await hiveTracker.getHive("012345678901234567890123");
    assert.isNull(u2);
  });

  test("delete a hive", async function () {
    let u = await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
    assert(u._id != null);
    await hiveTracker.deleteOneHive(u._id);
    u = await hiveTracker.getHive(u._id);
    await hiveTracker.deleteAllHives();
    assert(u == null);
  });


  test("Delete all hives", async function () {
    const hive = await hiveTracker.createHive(newHive.latitude,newHive.longtitude,newHive.hiveType,newHive.description,newHive.comments,returnedUser._id);
    const allHives = await hiveTracker.getHives();
    assert.equal(allHives.length, 1);
  });
});
