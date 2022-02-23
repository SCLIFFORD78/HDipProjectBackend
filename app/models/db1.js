const firebase = require("firebase/auth");
const admin = require("firebase-admin");
const initializeApp = require("firebase/app");
const firebaseConfig = require("../utils/firebase.config");
const fireDatabase = require("firebase/database");
const User = require("./user");

const serviceAccount = require("../../config/hdip-65317-firebase-adminsdk-3auua-29b2f2e643.json");
const { authenticate } = require("../api/users");
const { func } = require("@hapi/joi");
const { child } = require("firebase/database");
const { map } = require("lodash");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const app = initializeApp.initializeApp(firebaseConfig);
const fireAuth = firebase.getAuth(app);
const database = fireDatabase.getDatabase(app);
var user = fireAuth.currentUser;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hdip-65317-default-rtdb.firebaseio.com",
});
var users = {};
const DB1 = {
  findOne: async function (userId) {
    let returnStatment = null;
    for (const [key, value] of Object.entries(users)) {
      if (key == userId) {
        console.log(value.email);
        console.log(key);
        returnUser = User;
        returnUser.email = value.email;
        returnUser.fbId = key;
        returnStatment = returnUser;
      }
    }
    return returnStatment;
  },

  getUsers: async function () {
    fireDatabase
      .get(fireDatabase.child(fireDatabase.ref(database), `users/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          return snapshot;
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },

  findByEmail: async function (email) {
    for (const [key, value] of Object.entries(users)) {
      if (value.email == email) {
        returnUser = value;
        return returnUser;
      }
    }
  },

  findById: async function (userId) {
    let returnStatment = null;
    fireDatabase
      .get(fireDatabase.child(database, `users/${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          returnStatment = snapshot.val();
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return returnStatment;
  },

  createNewUser: async function (email, password, firstName, lastName) {
    admin
      .auth()
      .createUser({
        email: email,
        password: password,
        displayName: firstName + " " + lastName,
      })
      .then(function (userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully created new user:", userRecord.uid);
        var newUser = User
        newUser.fbId = userRecord.uid;
        newUser.firstName = firstName;
        newUser.secondName = lastName;
        newUser.email = userRecord.email;
        newUser.userName = userRecord.displayName;
        fireDatabase.set(fireDatabase.ref(database, "users/" + userRecord.uid), {
          email: newUser.email,
          fbid: newUser.fbId,
          firstName: newUser.firstName,
          secondName: newUser.secondName,
          dateJoined: newUser.dateJoined,
          admin: newUser.admin,
          image: newUser.image,
          userName: newUser.userName

        });
        

        return newUser;
      })
      .catch(function (error) {
        console.log("Error creating new user:", error);
        //throw Boom.badData(error);
      });
  },

  authenticate: async function (email, password) {
    await firebase
      .signInWithEmailAndPassword(fireAuth, email, password)
      .then((userCredential) => {
        // Signed in
        if (!userCredential) {
          throw Boom.notFound(`No tutorial available for slug`);
        } else {
          console.log("Successfully loggedin new user:", userCredential.user.uid);
          user = userCredential.user;
          fireDatabase.onValue(
            fireDatabase.ref(database, "/users/"),
            (snapshot) => {
              //const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
              // ...
              users = snapshot.exportVal();
              console.log(users);
            },
            {
              onlyOnce: true,
            }
          );
        }

        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("Error loggedin new user:", errorMessage);
      });
    return user;
  },

  deleteUser: async function (userId) {
    let returnStatment = false;
    var delUser = this.findOne(userId);
    if (delUser) {
      fireDatabase
        .remove(fireDatabase.ref(database, "users/" + userId))
        .then(() => {
          // Data deleted successfully!
          returnStatment = true;
        })
        .catch((error) => {
          // The delete failed...
          returnStatment = false;
        });
    }
    return returnStatment;
  },

  updateUser: async function (user) {
    map.bind(user, User);
    fireDatabase
      .set(fireDatabase.ref(database, "users/" + user.fbId), {
        firstName: user.firstName,
        secondName: user.secondName,
        image: user.image,
        userName: user.userName,
        admin: user.admin,
      })
      .then(() => {
        // Data saved successfully!
      })
      .catch((error) => {
        // The write failed...
      });
  },
};

module.exports = DB1;
