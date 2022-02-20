const firebase = require("firebase/auth")
const admin = require("firebase-admin")
const initializeApp  = require("firebase/app")
const firebaseConfig = require("../utils/firebase.config")
const fireDatabase = require("firebase/database")
const User = require("./user")


const serviceAccount = require("../../config/hdip-65317-firebase-adminsdk-3auua-29b2f2e643.json");
const { authenticate } = require("../api/users")

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const app = initializeApp.initializeApp (firebaseConfig)
const fireAuth = firebase.getAuth(app)
const database = fireDatabase.getDatabase(app)
//var user = fireAuth.currentUser
let user
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hdip-65317-default-rtdb.firebaseio.com"
});




const DB1 = {
    //user: user,
    createNewUser: async function(email,password,firstName, lastName){
        admin.auth().createUser({
          email: email,
          password: password,
          displayName: firstName + " " + lastName
        }).then(function(userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log('Successfully created new user:', userRecord.uid);
          fireDatabase.set(fireDatabase.ref(database, 'users/' + userRecord.uid), {
            username: userRecord.displayName,
            email: userRecord.email,
            dateJoined : Date()
          });
          var user1 = User
          user1.fbId = userRecord.uid
          user1.firstName = firstName
          user1.lastName = lastName
          user1.email = userRecord.email
          
          return user
        
          
        }).catch(function(error) {
          console.log('Error creating new user:', error);
          //throw Boom.badData(error);
        });
      } ,

      authenticate: async function(email, password){
        await firebase.signInWithEmailAndPassword(fireAuth,email,password).then((userCredential) => {
          // Signed in
          if (!userCredential){
            throw Boom.notFound(`No tutorial available for slug`)
          }else{
            console.log('Successfully loggedin new user:',userCredential.user.uid );
            user =  userCredential.user
          }
          
          
          // ...
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('Error loggedin new user:',errorMessage );
          
        });
        return user
      }

      
    
}

module.exports = DB1
