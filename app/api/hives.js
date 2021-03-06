"use strict";

const Hive = require("../models/hive");
const Boom = require("@hapi/boom");
const utils = require("./utils.js");
const Weather = require("../utils/weather");
const Cloudinary = require("../utils/cloudinary");
const User = require("../models/user").default;
const Joi = require("@hapi/joi");
const db1 = require("../models/db1");
const { round } = require("lodash");

const Hives = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let returnStatment;
      try {
        await db1.getAllHives().then((hives) => {
          if (hives) {
            returnStatment = hives;
          } else {
            returnStatment = Boom.notFound("No hives data found");
          }
        });
      } catch (error) {
        console.log(error);
        returnStatment = Boom.notFound("Error retriving hives data");
      }

      return returnStatment;
    },
  },

  findOne: {
    auth: false,
    handler: async function (request, h) {
      let returnStatment;
      try {
        await db1.findOneHive(request.params.id).then((returnedHive) => {
          if (!returnedHive) {
            returnStatment = Boom.notFound("No Hive with this id");
          } else {
            returnStatment = returnedHive;
          }
        });
      } catch (err) {
        returnStatment = Boom.notFound("No Hive with this id");
      }
      return returnStatment;
    },
  },

  getHiveByOwner: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let returnStatment;
      try {
        const user = await db1.findOne(request.params.id);
        await db1.getHiveByOwner(user.fbid).then((returnedHives) => {
          if (!returnedHives) {
            returnStatment = Boom.notFound("No Hive with this id");
          } else {
            returnStatment = returnedHives;
          }
        });
        return returnStatment;
      } catch (err) {
        return Boom.notFound("No Hive with this id");
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
        owner: Joi.any(),
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
      let returnStatment;
      var newHive = Hive;
      await db1
        .createNewHive(request.payload)
        .then((returnedHive) => {
          if (returnedHive) {
            returnStatment = h.response(returnedHive).code(201);
            newHive = returnedHive;
          } else {
            returnStatment = Boom.badImplementation("error creating hive");
          }
        })
        .catch((error) => {
          console.log(error);
          returnStatment = Boom.badImplementation("error creating hive");
        });
      return returnStatment;
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
      let returnStatment = false;
      await db1
        .deleteHive(request.params.id)
        .then((resp) => {
          if (resp) {
            returnStatment = true;
          } else {
            returnStatment = Boom.notFound("id not found");
          }
        })
        .catch((error) => {
          console.log(error);
        });

      try {
        await Cloudinary.deleteResourcesByPrefix(request.params.id);
      } catch (error) {
        console.log(error);
      }

      return returnStatment;
    },
  },

  addComment: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let returnStatment = { success: false };
      await db1
        .createNewComment(request.payload.comment, request.payload._id, request.payload.userid)
        .then((resp) => {
          if (resp) {
            returnStatment = { success: true };
          } else {
            console.log("Unable to add comment to hive ID (not found): ", request.payload._id);
            returnStatment = Boom.notFound("id not found");
          }
        })
        .catch((error) => {
          console.log("Error adding comment: ", error);
          returnStatment = Boom.notFound("Error trying to add comment: ", error);
        });
      return returnStatment;
    },
  },

  getHiveComments: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let returnStatment;
      try {
        await db1.getHiveComments(request.params.id).then((comments) => {
          if (comments) {
            returnStatment = comments;
          } else {
            returnStatment = Boom.notFound("No alarm data found");
          }
        });
      } catch (error) {
        console.log(error);
        returnStatment = Boom.notFound("Error retriving hives data");
      }

      return returnStatment;
    },
  },

  deleteComment: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let returnStatment = { success: false };
      await db1
        .deleteComment(request.params.comment_id)
        .then((resp) => {
          if (resp) {
            returnStatment = { success: true };
          } else {
            returnStatment = Boom.notFound("Error deleting comment");
          }
        })
        .catch((error) => {
          console.log(error);
        });
      return returnStatment;
    },
  },

  updateLocation: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let returnStatment = { success: false };
      const { id } = request.payload;
      const { longtitude } = request.payload;
      const { latitude } = request.payload;
      const update = { lng: longtitude, lat: latitude, zoom: 15 };
      await db1
        .updateLocation(id, update)
        .then((resp) => {
          if (resp) {
            returnStatment = { success: true };
          } else {
            returnStatment = Boom.notFound("Error updating location, id not found");
          }
        })
        .catch((error) => {
          console.log(error);
        });
      return returnStatment;
    },
  },

  getWeather: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const weather = await Weather.fetchWeather(request.payload.latitude, request.payload.longtitude);
      if (weather) {
        return weather;
      }
      return Boom.notFound("Error retrieving weather");
    },
  },

  readWeatherHistory: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      var combinedPointsTemperature = [];
      var combinedPointsHumidity = [];
      const hive = await db1.findOneHive(request.payload.fbid);
      if (hive.recordedData != "") {
        var values = JSON.parse("[" + hive.recordedData + "]").sort((a,b)=>a["timeStamp"] - b["timsStamp"]);
        values.forEach((element) => {
          var theDate = new Date(element["timeStamp"] * 1000);
          combinedPointsTemperature.push({
            group: "Hive Temp",
            date: theDate.toISOString(),
            value: element["Temperature"],
          });
          combinedPointsHumidity.push({
            group: "Hive Humidity",
            date: theDate.toISOString(),
            value: element["Humidity"],
          });
        });
      }

      const weather = await Weather.readWeatherHistory(hive.location.lat, hive.location.lng, hive.dateRegistered);
      if (weather.length > 0) {
        weather.forEach((element) => {
          var theDate = new Date(element["timeStamp"] * 1000);
          combinedPointsTemperature.push({
            group: "Ambient Temp",
            date: theDate.toISOString(),
            value: element["Temperature"],
          });
          combinedPointsHumidity.push({
            group: "Ambient Humidity",
            date: theDate.toISOString(),
            value: element["Humidity"],
          });
        });
        return { combinedPointsTemperature: combinedPointsTemperature, combinedPointsHumidity: combinedPointsHumidity };
      } else {
        return { combinedPointsTemperature: combinedPointsTemperature, combinedPointsHumidity: combinedPointsHumidity };
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
      const imgID = request.params.id;
      const success = await Cloudinary.deleteImage(imgID);
      if (success) {
        return "Image Deleted";
      }
      return Boom.notFound("Error retrieving Images");
    },
  },

  getHiveAlarms: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let returnStatment;
      try {
        await db1.getHiveAlarms(request.params.id).then((alarms) => {
          if (alarms) {
            returnStatment = alarms;
          } else {
            returnStatment = Boom.notFound("No alarm data found");
          }
        });
      } catch (error) {
        console.log(error);
        returnStatment = Boom.notFound("Error retriving hives data");
      }

      return returnStatment;
    },
  },

  ackAlarm: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let returnStatment = { success: false };

      await db1
        .ackAlarm(request.payload.fbid)
        .then((resp) => {
          if (resp) {
            returnStatment = { success: true };
          } else {
            returnStatment = Boom.notFound("Error acknowledging alarm");
          }
        })
        .catch((error) => {
          console.log(error);
        });
      return returnStatment;
    },
  },
};

module.exports = Hives;
