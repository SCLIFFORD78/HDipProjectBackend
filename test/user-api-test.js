"use strict";

const assert = require("chai").assert;
const HiveTracker = require("./hiveTracker");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("User API tests", function () {
  let users = fixtures.users;
  let newUser = fixtures.newUser;

  const hiveTracker = new HiveTracker(fixtures.hiveTracker);

  suiteSetup(async function () {
    await hiveTracker.deleteAllUsers();
    const returnedUser = await hiveTracker.createUser(newUser);
    const response = await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
  });

  setup(async function () {
   await hiveTracker.deleteAllUsers();
  });


  suiteTeardown(async function () {
    await hiveTracker.deleteAllUsers();
    hiveTracker.clearAuth();
  });

  test("get all users", async function () {
    await hiveTracker.createUser(newUser);
    await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    for (let u of users) {
      await hiveTracker.createUser(u);
      await hiveTracker.authenticate({email: u.email, password:u.password});
    };

    const allUsers = await hiveTracker.getUsers();
    assert.equal(allUsers.length, users.length + 1);
  });

  test("create a user", async function () {
    const noUsersCount = await hiveTracker.getUsers();
    const returnedUser = await hiveTracker.createUser(newUser);
    await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    assert.isNull(noUsersCount, "Delete all users failed");
    assert.deepEqual(returnedUser.email, newUser.email);
    assert.deepEqual(returnedUser.firstName, newUser.firstName);
    assert.deepEqual(returnedUser.lastName, newUser.lastName, "User last neame not matching");


  });

  test("get user", async function () {
    const u1 = await hiveTracker.createUser(newUser);
    await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    const u2 = await hiveTracker.getUser(u1._id);
    assert.deepEqual(u1, u2);
  });

  test("get invalid user", async function () {
    const u1 = await hiveTracker.getUser("1234");
    assert.isNull(u1);
    const u2 = await hiveTracker.getUser("012345678901234567890123");
    assert.isNull(u2);
  });

  test("Register with existing email", async function () {
    const u1 = await hiveTracker.createUser(newUser);
    await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    const testUser = {
      firstName: "John",
      lastName: "Patrick",
      email: newUser.email,
      password: newUser.password
    };
    const u2 = await hiveTracker.createUser(testUser);
    const totalUsers = await hiveTracker.getUsers();
    assert.equal(totalUsers.length, 1);
  });

  test("Change user Admin", async function () {
    const u1 = await hiveTracker.createUser(newUser);
    await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    assert.isFalse(u1.admin);
    await hiveTracker.toggleAdmin(u1._id)
    const u2 = await hiveTracker.getUser(u1._id)
    assert.isTrue(u2.admin);
  });

  test("Change user Details", async function () {
    const u1 = await hiveTracker.createUser(newUser);
    await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    const fName = u1.firstName;
    const lName = u1.lastName;
    const test = await hiveTracker.update("James", "Flynn", u1.email, "Secret01?",u1._id);
    const u2 = await hiveTracker.getUser(u1._id);
    assert.notDeepEqual(u2.firstName,fName);
    assert.notDeepEqual(u2.lastName,lName);
    assert.deepEqual(u1.email,u2.email);
  });

  test("Change user Password", async function () {
    const u1 = await hiveTracker.createUser(newUser);
    await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    const fName = u1.firstName;
    const lName = u1.lastName;
    const test = await hiveTracker.update(u1.firstName, u1.lastName, u1.email, "Secret02?",u1._id);
    const u2 = await hiveTracker.getUser(u1._id);
    const response = await hiveTracker.authenticate({email: u2.email, password:"Secret02?"});
    const response2 = await hiveTracker.authenticate({email: u2.email, password:newUser.password});
    assert.deepEqual(u2.firstName,fName);
    assert.deepEqual(u2.lastName,lName);
    assert.deepEqual(u1.email,u2.email);
    assert(response.success);
    assert.isNull(response2);
  });

  test("delete a user", async function () {
    let u = await hiveTracker.createUser(newUser);
    assert(u._id != null);
    await hiveTracker.deleteOneUser(u._id);
    u = await hiveTracker.getUser(u._id);
    await hiveTracker.deleteAllUsers();
    assert(u == null);
  });

  test("get users details", async function () {
    const user = await hiveTracker.createUser(newUser);
    await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    for (let u of users) {
      await hiveTracker.createUser(u);
      await hiveTracker.authenticate({email: u.email, password:u.password});
    }

    const testUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
    };
    users.unshift(testUser);
    const allUsers = await hiveTracker.getUsers();
    for (var i = 0; i < users.length; i++) {
      assert.deepEqual(allUsers[i].firstName,users[i].firstName);
      assert.deepEqual(allUsers[i].lastName,users[i].lastName);
      assert.deepEqual(allUsers[i].email,users[i].email);

    }
  });

  test("Delete all users empty", async function () {
    const user = await hiveTracker.createUser(newUser);
    await hiveTracker.authenticate({email: newUser.email, password:newUser.password});
    const allUsers = await hiveTracker.getUsers();
    assert.equal(allUsers.length, 1);
  });
});
