"use strict";

const User = require("../models/user");
const Boom = require("@hapi/boom");
const utils = require("./utils.js");
const jwt = require("jsonwebtoken");
const auth = require("../utils/auth.config");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Joi = require("@hapi/joi");
const firebase = require("firebase/auth")
const admin = require("firebase-admin")
const initializeApp  = require("firebase/app")
const firebaseConfig = require("../utils/firebase.config")

const serviceAccount = require("../../config/hdip-65317-firebase-adminsdk-3auua-29b2f2e643.json");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const app = initializeApp.initializeApp (firebaseConfig)
const fireAuth = firebase.getAuth(app)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hdip-65317-default-rtdb.firebaseio.com"
});

var user = fireAuth.currentUser

const characters = "3PDQU5T2elyDBwtYlbc7kiRx5o2sLQyw";

const Users = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const users = await User.find();
      return users;
    },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const user = await User.findOne({ _id: request.params.id });
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return user;
      } catch (err) {
        return Boom.notFound("No User with this id");
      }
    },
  },

  findByEmail: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const user = await User.findByEmail( request.params.email );
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return user;
      } catch (err) {
        return Boom.notFound("No User with this id");
      }
    },
  },

  create: {
    auth: false,
    validate: {
      payload: {
        firstName: Joi.string().required().regex(/^[A-Z][a-z-a*]{2,}$/),
        lastName: Joi.string().required().regex(/^[A-Z][A-Za-z\s\'\-]{2,}$/),
        email: Joi.string().email().required(),
        password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
      },
      options: {
        abortEarly: false,
      },
      failAction: function (request, h, error) {
        return h
          .view("signup", {
            title: "Sign up error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      try {
        let token = "";
        for (let i = 0; i < characters.length; i++) {
          token += characters[Math.floor(Math.random() * characters.length)];
        };
        const hash = await bcrypt.hash(request.payload.password, saltRounds);
        token = jwt.sign({ email: request.payload.email }, auth.secret);
        await admin.auth().createUser({
          email: request.payload.email,
          password: request.payload.password,
          displayName: request.payload.firstName + " " + request.payload.lastName
        }).then(function(userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log('Successfully created new user:', userRecord.uid);
          
        }).catch(function(error) {
          console.log('Error creating new user:', error);
          throw Boom.badData(error);
        });
        const newUser = new User({
          firstName: request.payload.firstName,
          lastName: request.payload.lastName,
          email: request.payload.email,
          password: hash,
          confirmationCode: token,
        });
        let user = newUser.save();
        return h.response(newUser).code(201);

      } catch (error) {
        console.log(error)
        return Boom.badImplementation("error creating user");
      };
    },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },

    handler: async function (request, h) {
      const success = await User.deleteMany({}, (err) => console.log(err));
      return { success: true };
    },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const user = await User.deleteOne({ _id: request.params.id });
      if (user) {
        return { success: true };
      }
      return Boom.notFound("id not found");
    },
  },

  update: {
    auth: {
      strategy: "jwt",
    },
    validate: {
      payload: {
        firstName: Joi.string().required().regex(/^[A-Z][a-z-a*]{2,}$/),
        lastName: Joi.string().required().regex(/^[A-Z][A-Za-z\s\'\-]{2,}$/),
        email: Joi.string().email().required(),
        password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
      },
      options: {
        abortEarly: false,
      },
      failAction: function (request, h, error) {
        return h
          .view("settings", {
            title: "Sign up error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const userEdit = request.payload;
      const user = await User.findById(request.params.id);
      let token = "";
      for (let i = 0; i < characters.length; i++) {
        token += characters[Math.floor(Math.random() * characters.length)];
      };
      const hash = await bcrypt.hash(request.payload.password, saltRounds);
      token = jwt.sign({ email: request.payload.email }, auth.secret);
      user.firstName = userEdit.firstName;
      user.lastName = userEdit.lastName;
      user.email = userEdit.email;
      user.password = hash;
      await user.save();
      if (user) {
        return { success: true };
      }
      return Boom.notFound("id not found");
    },
  },

  authenticate: {
    auth: false,
    validate: {
      payload: {
        email: Joi.string().email().required(),
        password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
      },
      options: {
        abortEarly: false,
      },
      failAction: function (request, h, error) {
        return h
          .view("login", {
            title: "Sign in error",
            errors: error.details,
            toggle: false
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      try {
        var test = request.payload.password
        console.log(test)
        await firebase.signInWithEmailAndPassword(fireAuth,request.payload.email,request.payload.password).then((userCredential) => {
          // Signed in
          user = userCredential.user;
          console.log('Successfully loggedin new user:',userCredential.user.displayName );
          // ...
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('Error loggedin new user:',errorMessage );
        });
          
        const user = await User.findOne({ email: request.payload.email });
        if (!user) {
          return Boom.unauthorized("User not found"); 
        } else if (!await user.comparePassword(request.payload.password) ){
          return Boom.unauthorized("Wrong Password"); 
        } else {
          const token = utils.createToken(user);
          return h.response({ success: true, token: token }).code(201);
        }
      } catch (err) {
        return Boom.notFound("internal db failure");
      }
    },
  },

  toggleAdmin: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const { id } = request.params;
        const adminId = request.auth.credentials.id;
        const user = await User.findById(adminId).lean();
        const member = await User.findById(id).lean();

        if (member.admin) {
          member.admin = false;
        } else member.admin = true;
        const filter = { _id: id };
        const update = { admin: member.admin };
        let adminRights = await User.findOneAndUpdate(filter, update, { new: true });
        return adminRights;
        console.log("Member " + member.email + " Has admin rights updated");
      } catch (err) {
        return Boom.notFound("internal db failure");
      }
    },
  },
};

module.exports = Users;
