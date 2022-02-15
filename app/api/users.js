"use strict";

const User = require("../models/user");
const Boom = require("@hapi/boom");
const utils = require("./utils.js");
const jwt = require("jsonwebtoken");
const auth = require("../utils/auth.config");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Joi = require("@hapi/joi");

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
        const email = request.payload.email;
        let user = await User.findByEmail(email);
        if (user) {
          const message = "Email address is already registered";
          throw Boom.badData(message);
        };
        let token = "";
        for (let i = 0; i < characters.length; i++) {
          token += characters[Math.floor(Math.random() * characters.length)];
        };
        const hash = await bcrypt.hash(request.payload.password, saltRounds);
        token = jwt.sign({ email: request.payload.email }, auth.secret);
        const newUser = new User({
          firstName: request.payload.firstName,
          lastName: request.payload.lastName,
          email: request.payload.email,
          password: hash,
          confirmationCode: token,
        });

        // space here for email auth after

        user = await newUser.save();
      } catch (error) {
        console.log(error)
      };
      const test1 = await User.findByEmail(request.payload.email).lean();
      if (test1) {
        return h.response(test1).code(201);
      }
      return Boom.badImplementation("error creating user");
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
