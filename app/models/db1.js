const firebase = require("firebase/auth");
const admin = require("firebase-admin");
const initializeApp = require("firebase/app");
const firebaseConfig = require("../utils/firebase.config");
const fireDatabase = require("firebase/database");
const User = require("./user");
const Hive = require("./hive");

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
var hives = [];
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
          users = snapshot.exportVal();
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
          this.getUsers()
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
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////HIVES///////////////////////////////////////////////////////////////////

  getHives: async function () {
    let returnStatment
    await fireDatabase
      .get(fireDatabase.child(fireDatabase.ref(database), `hives/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          Object.keys(snapshot.exportVal()).forEach(key => {
            hives.push(snapshot.exportVal()[key])
          });
          returnStatment = hives;
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
      return returnStatment
  },

  findOneHive: async function (fbid) {
    let returnStatment = null;
    for (const [key, value] of Object.entries(hives)) {
      if (key == fbid) {
        console.log(value);
        console.log(key);
        returnStatment = value;
      }
    }
    return returnStatment;
  },

  getHiveByOwner: async function (userID) {
    let returnStatment = [];
    for (const [key, value] of Object.entries(hives)) {
      if (key == userID) {
        console.log(value);
        console.log(key);
        returnStatment.push(value)
      }
    }
    return returnStatment;
  },

  createNewHive: async function (hive) {
    var newHive = Hive
    newHive.description = hive.description;
    newHive.details.push({comments: hive.details.comments, dateLogged: Date.now().toString()});
    newHive.image = "";
    newHive.location.lat = hive.latitude;
    newHive.location.lng = hive.longtitude;
    newHive.type = hive.hiveType;
    //newHive.recordedData = hive.displayName;
    newHive.sensorNumber = "84:71:27:69:43:45";
    //newHive.tag = hive.displayName;
    newHive.user = ""//testing for now test hive.owner;
    let newRef 
    await fireDatabase.push(fireDatabase.ref(database,"hives/"),newHive).then((resp)=>{
      newRef = resp.key
      newHive.fbId = newRef
      fireDatabase.update(fireDatabase.ref(database,"hives/" + newRef),{fbId: newRef})
    })
    this.getHives()
    return newHive
  },

  deleteHive: async function (fbid) {
    let returnStatment = false;
    var delHive = await this.findOneHive(fbid);
    if (delHive) {
      fireDatabase
        .remove(fireDatabase.ref(database, "hives/" + fbid))
        .then(() => {
          // Data deleted successfully!
          returnStatment = true;
          this.getHives()
        })
        .catch((error) => {
          // The delete failed...
          returnStatment = false;
        });
    }
    return returnStatment;
  },

  addComment: async function(fbid,comment){
    let returnStatment = false;
    fireDatabase.set( fireDatabase.push(fireDatabase.ref(database, "hives" + fbid / "details"))),{
      comment: comment,
      dateLogged: Date.toString()
    }.then((id)=>{
      if(id){
        returnStatment = true
      }else{
        console.log("Comment not added")
      }
    })
    return returnStatment
  }
};




module.exports = DB1;
