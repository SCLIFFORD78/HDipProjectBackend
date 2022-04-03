const firebase = require("firebase/auth");
const admin = require("firebase-admin");
const initializeApp = require("firebase/app");
const firebaseConfig = require("../../config/firebase.config");
const fireDatabase = require("firebase/database");
const User = require("./user");
const Hive = require("./hive");
const serviceAccount = require("../../config/hdip-65317-firebase-adminsdk-3auua-1d23de656e.json");
const { authenticate } = require("../api/users");
const { func } = require("@hapi/joi");
const { child } = require("firebase/database");
const { map } = require("lodash");
const { details } = require("./hive");

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
var hives = [];
const DB1 = {
  findOne: async function (userId) {
    let returnStatment = null;
    for (const [key, value] of Object.entries(users)) {
      if (key == userId) {
        console.log(value.email);
        console.log(key);
        returnUser = User;
        returnUser.firstName = value.firstName;
        returnUser.secondName = value.secondName;
        returnUser.image = value.image;
        returnUser.userName = value.userName;
        returnUser.dateJoined = value.dateJoined;
        returnUser.email = value.email;
        returnUser.fbid = key;
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
          users = snapshot.exportVal();
          return snapshot;
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return users;
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
    for (const [key, value] of Object.entries(users)) {
      if (value.fbid == userId) {
        returnUser = value;
        return returnUser;
      }
    }
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
        var newUser = User;
        newUser.fbid = userRecord.uid;
        newUser.firstName = firstName;
        newUser.secondName = lastName;
        newUser.email = userRecord.email;
        newUser.userName = userRecord.displayName;
        fireDatabase.set(fireDatabase.ref(database, "users/" + userRecord.uid), {
          email: newUser.email,
          fbid: newUser.fbid,
          firstName: newUser.firstName,
          secondName: newUser.secondName,
          dateJoined: newUser.dateJoined,
          admin: newUser.admin,
          image: newUser.image,
          userName: newUser.userName,
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

  logout: async function () {
    let returnStatment = false;
    await firebase.signOut(fireAuth).then(() => {
      // Sign-out successful.
      console.log("Signout successful")
      returnStatment = true
      user = ""
    }).catch((error) => {
      // An error happened.
      console.log(error)
    });
    return returnStatment
  },
  

  deleteOne: async function (userId) {
    let returnStatment = false;
    var delUser = await this.findOne(userId);
    if (delUser) {
      await fireDatabase
        .remove(fireDatabase.ref(database, "users/" + userId))
        .then(() => {
          // Data deleted successfully!
          returnStatment = true;
          admin
            .auth()
            .deleteUser(userId)
            .then(() => {
              console.log("Successfully deleted user");
              returnStatment = true;
            })
            .catch((error) => {
              console.log("Error deleting user:", error);
            });
          this.getUsers();
        })
        .catch((error) => {
          // The delete failed...
          returnStatment = false;
        });
    }
    return returnStatment;
  },

  updateUser: async function (user,password) {
    map.bind(user, User);
    await fireDatabase
      .set(fireDatabase.ref(database, "users/" + user.fbid), {
        firstName: user.firstName,
        secondName: user.secondName,
        image: user.image,
        userName: user.firstName+" "+user.secondName,
        admin: user.admin,
        dateJoined: user.dateJoined,
        email: user.email,
        fbid: user.fbid,
      })
      .then(() => {
        admin
          .auth()
          .updateUser(user.fbid, {
            email: user.email,
            //phoneNumber: "+11234567890",
            //emailVerified: true,
            password: password,
            displayName: user.firstName+" "+user.secondName,
            //photoURL: "http://www.example.com/12345678/photo.png",
            //disabled: true,
          })
          .then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully updated user", userRecord.toJSON());
          })
          .catch((error) => {
            console.log("Error updating user:", error);
          });

        return true;
        // Data saved successfully!
      })
      .catch((error) => {
        // The write failed...
      });
    return true;
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////HIVES///////////////////////////////////////////////////////////////////var test = snapshot.exportVal()[key].details

  getHives: async function () {
    let returnStatment;
    await fireDatabase
      .get(fireDatabase.child(fireDatabase.ref(database), `hives/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          hives = [];
          comments = [];
          Object.keys(snapshot.exportVal()).forEach((key) => {
            comments = [];
            if (snapshot.exportVal()[key].details) {
              Object.keys(snapshot.exportVal()[key].details).forEach((comment) => {
                comments.push(snapshot.exportVal()[key].details[comment]);
              });
            }

            var test = snapshot.exportVal()[key]; // = comments
            test.details = comments;
            hives.push(test);
          });
          returnStatment = hives;
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return returnStatment;
  },

  findOneHive: async function (fbid) {
    let returnStatment = null;
    hives.forEach((hive) => {
      if (hive.fbid == fbid) {
        returnStatment = hive;
      }
    });
    return returnStatment;
  },

  getHiveByOwner: async function (userID) {
    let returnStatment = [];
    for (const [key, value] of Object.entries(hives)) {
      if (value.user == userID) {
        console.log(value);
        console.log(key);
        returnStatment.push(value);
      } else {
        console.log("No user found with id ", userID);
      }
    }
    return returnStatment;
  },

  createNewHive: async function (hive) {
    var newHive = Hive;
    hives.sort((a, b) => a.tag - b.tag);
    num = 1;
    hives.forEach((hive) => {
      if (hive.tag == num) {
        num++;
      }
    });
    newHive.description = hive.description;
    newHive.details = [];
    newHive.image = "";
    newHive.location.lat = hive.latitude;
    newHive.location.lng = hive.longtitude;
    newHive.type = hive.hiveType;
    //newHive.recordedData = hive.displayName;
    newHive.sensorNumber = "84:71:27:69:43:45";
    newHive.tag = num;
    newHive.user = user.uid; //testing for now test hive.owner;
    let newRef;
    await fireDatabase
      .push(fireDatabase.ref(database, "hives/"), newHive)
      .then((resp) => {
        newRef = resp.key;
        newHive.fbid = newRef;
      })
      .then((resp) => {
        fireDatabase.update(fireDatabase.ref(database, "hives/" + newRef), { fbid: newRef });
      })
      .catch((error) => {
        console.log(error);
      });
    await fireDatabase
      .push(fireDatabase.ref(database, "hives/" + newRef + "/details/"), {
        comments: hive.details.comments,
        dateLogged: Date().toString(),
      })
      .then((resp) => {
        var newRefComment = resp.key;
        fireDatabase.update(fireDatabase.ref(database, "hives/" + newRef + "/details/" + newRefComment), {
          fbid: newRefComment,
        });
      })
      .catch((error) => {
        console.log(error);
      });
    this.getHives();
    return newHive;
  },

  deleteHive: async function (fbid) {
    let returnStatment = false;
    var delHive = await this.findOneHive(fbid);
    if (delHive) {
      await fireDatabase
        .remove(fireDatabase.ref(database, "hives/" + fbid))
        .then((resp) => {
          // Data deleted successfully!
          returnStatment = true;
          this.getHives();
        })
        .catch((error) => {
          // The delete failed...
          returnStatment = false;
        });
    }
    return returnStatment;
  },

  addComment: async function (fbid, comment) {
    let returnStatment = false;
    await fireDatabase
      .push(fireDatabase.ref(database, "hives/" + fbid + "/details/"), {
        comments: comment,
        dateLogged: Date().toString(),
      })
      .then((resp) => {
        var newRefComment = resp.key;
        fireDatabase.update(fireDatabase.ref(database, "hives/" + fbid + "/details/" + newRefComment), {
          fbid: newRefComment,
        });
      })
      .then(() => {
        returnStatment = true;
        this.getHives();
      });
    return returnStatment;
  },

  deleteComment: async function (hiveID, commentID) {
    let returnStatment = false;
    await fireDatabase
      .remove(fireDatabase.ref(database, "hives/" + hiveID + "/details/" + commentID))
      .then((resp) => {
        returnStatment = true;
        this.getHives();
      })
      .catch((error) => {
        console.log("Error deleting comment ", commentID, " for hive: ", hiveID);
      });
    return returnStatment;
  },

  updateLocation: async function (hiveID, update) {
    let returnStatment = false;
    await fireDatabase
      .update(fireDatabase.ref(database, "hives/" + hiveID), { location: update })
      .then((resp) => {
        returnStatment = true;
      })
      .catch((error) => {
        console.log(error);
      });
    return returnStatment;
  },
};

module.exports = DB1;
