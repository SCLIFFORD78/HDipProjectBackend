"use strict";

const User = require("../models/user").default;
const Boom = require("@hapi/boom");
const utils = require("./utils.js");
const jwt = require("jsonwebtoken");
const auth = require("../utils/auth.config");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Joi = require("@hapi/joi");
const db1 = require("../models/db1");
const { isNull } = require("lodash");
/* const firebase = require("firebase/auth")
const admin = require("firebase-admin")
const initializeApp  = require("firebase/app")
const firebaseConfig = require("../utils/firebase.config")
const fireDatabase = require("firebase/database")
const db = require("../models/db1")


const serviceAccount = require("../../config/hdip-65317-firebase-adminsdk-3auua-29b2f2e643.json");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const app = initializeApp.initializeApp (firebaseConfig)
const fireAuth = firebase.getAuth(app)
const database = fireDatabase.getDatabase(app)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hdip-65317-default-rtdb.firebaseio.com"
});*/


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
    auth: false,
    handler: async function (request, h) {
      let returnStatment
      try {
        //const user = await User.findOne({ _id: request.params.id });
        await db1.findOne({ userId: request.params.id }).then((returnedUser)=>{
          if (!returnedUser) {
            returnStatment =  Boom.notFound("No User with this id");
          }else{
            returnStatment = returnedUser
          }
        });
        return returnStatment
      } catch (err) {
        return Boom.notFound("No User with this id");
      }
    },
  },

  findOneTwo: {
    auth: false,
    async function (userId) {
      try {
        //const user = await User.findOne({ _id: request.params.id });
        const user = await db1.findOne({ userId: userId });
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
        var user = User
        //const user = await User.findByEmail( request.params.email );
        await db1.findByEmail( request.params.email ).then((returnUser)=>{
          if (!returnUser) {
            return Boom.notFound("No User with this id");
          }
          user = returnUser
        })
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
        
        var user = await db1.createNewUser(request.payload.email,request.payload.password,request.payload.firstName,request.payload.lastName)
        return h.response(user).code(201);

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
      let returnStatment
      await db1.deleteOne({ userId: request.params.id }).then((rslt)=>{
        if (rslt) {
          returnStatment = { success: true };
        }else{
          returnStatment =  Boom.notFound("id not found");
        }
        
      })
      .catch((error) => {
        console.log(error)
      })
      return returnStatment
      
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
      let returnStatment
      const userEdit = request.payload;
      const user = await db1.findById(request.params.id);
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
      await db1.updateUser(user).then((returnedUser)=>{
        if (returnedUser) {
          returnStatment = { success: true };
        }else{
          returnStatment = Boom.notFound("id not found");
        }
        
      }).catch((error) => {
        console.log(error)
      })
      return returnStatment
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
        let user
        await db1.authenticate(request.payload.email, request.payload.password).then((usr) => {
          if (!usr) {
            return Boom.unauthorized("User not found"); 
          }  else {
            const token = utils.createToken(usr);
            var retu =  h.response({ success: true, token: token }).code(201);
            user = usr
            return retu
          }        
          
        })
        
        if (typeof user !== 'undefined'){
          const token = utils.createToken(user);
          console.log(user)
          var retu =  h.response({ success: true, token: token }).code(201);
          return retu
        }else{
          return Boom.unauthorized("User not found"); 
        }
        
        
        
        
        
      } catch (err) {
        console.log(err)
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
