"use strict";

const Hive = require("../models/hive");
const Boom = require("@hapi/boom");
const utils = require("./utils.js");
const Weather = require("../utils/weather")
const Cloudinary = require("../utils/cloudinary");
const User = require("../models/user").default
const Joi = require('@hapi/joi');


const Hives = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const hives = await Hive.find();
      return hives;
    },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const hive = await Hive.findOne({ _id: request.params.id });
        if (!hive) {
          return Boom.notFound("No hive with this id");
        }
        return hive;
      } catch (err) {
        return Boom.notFound("No hive with this id");
      }
    },
  },

  getHiveByOwner: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const owner = await User.findOne({_id:request.params.id});
        const hives = await Hive.find({ owner: owner._id });
        if (!hives) {
          return Boom.notFound("No hive with this id");
        }
        return hives;
      } catch (err) {
        return Boom.notFound("No hive with this id");
      }
    },
  },

  create: {
    auth: {
      strategy: "jwt",
    },
    validate: {
      payload: {
        details: Joi.object(),
        description: Joi.string().required(),
        latitude: Joi.number().required(),
        longtitude: Joi.number().required().negative(),
        hiveType: Joi.any(),
        owner: Joi.any()
      },
      options: {
        abortEarly: false,
      },
      failAction: function (request, h, error) {
        return h
          .view("home", {
            title: "Sign in error",
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const hive = await Hive.create(request.payload);
      try {
        await Cloudinary.createUploadPreset(hive._id.toString());
      } catch (err) {
        console.log(err);
      };
      if (hive) {
        return h.response(hive).code(201);
      }
      return Boom.badImplementation("error creating hive");
    },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {

      return { success: true };
    },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const hive = await Hive.deleteOne({ _id: request.params.id });
    
      try {
        await Cloudinary.deleteUploadPreset(request.params.id);
      } catch (error) {
        console.log(error);
      }
      try {
        await Cloudinary.deleteResourcesByPrefix(request.params.id);
      } catch (error) {
        console.log(error);
      }
      try {
        await Cloudinary.deleteFolder(request.params.id);
      } catch (error) {
        console.log(error);
      }
      if (hive) {
        return { success: true };
      }
      return Boom.notFound("id not found");
    },
  },
 
  addComment: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const test = request;
      const hive = await Hive.findById(request.payload._id);

      await hive.details.push({ comments: request.payload.comment });
      await hive.save();
      if (hive) {
        return { success: true };
      }
      return Boom.notFound("id not found");
    },
  }, 

  deleteComment: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const hive = await Hive.findById( request.params.id );
      hive.details.pull({"_id": request.params.comment_id })
      await hive.save();
      if (hive) {
        return { success: true };
      }
      return Boom.notFound("id not found");
    },
  },

  updateLocation: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const {id} = request.payload;
      const {longtitude} = request.payload;
      const {latitude} = request.payload;
      const update = { longtitude: longtitude,latitude: latitude};
      const hive = await Hive.findByIdAndUpdate(id,update,{ new: true }).lean();
      if (hive) {
        return { success: true };
      }
      return Boom.notFound("id not found");
    },
  },

  getWeather: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const weather = await Weather.fetchWeather( request.payload.latitude, request.payload.longtitude);
      if (weather) {
        return weather;
      }
      return Boom.notFound("Error retrieving weather");
    },
  },

  gallery: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const allImages = await Cloudinary.getAllImages(request.params.id);
      if (allImages) {
        return allImages;
      }
      return Boom.notFound("Error retrieving Images");
    },
  },

  deleteImage: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const imgID = request.params.folder + "/" + request.params.id;
      const success = await Cloudinary.deleteImage(imgID);
      if (success) {
        return "Image Deleted";
      }
      return Boom.notFound("Error retrieving Images");
    },
  },
  

};

module.exports = Hives;
