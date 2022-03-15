const Hives = require("./app/api/hives");
const Users = require("./app/api/users");


module.exports = [
  { method: "GET", path: "/api/hives", config: Hives.find },
  { method: "GET", path: "/api/hives/{id}", config: Hives.findOne },
  { method: "GET", path: "/api/hives/getHiveByOwner/{id}", config: Hives.getHiveByOwner },
  { method: "POST", path: "/api/hives", config: Hives.create },
  { method: "DELETE", path: "/api/hives/{id}", config: Hives.deleteOne },
  { method: "DELETE", path: "/api/hives", config: Hives.deleteAll },
  { method: "POST", path: "/api/hives/addComment", config: Hives.addComment },
  { method: "DELETE", path: "/api/hives/deleteComment/{id}/{comment_id}", config: Hives.deleteComment },
  { method: "POST", path: "/api/hives/getWeather", config: Hives.getWeather },
  { method: "POST", path: "/api/hives/readWeatherHistory", config: Hives.readWeatherHistory },
  { method: "PUT", path: "/api/hives/updateLocation", config: Hives.updateLocation },
  { method: "GET", path: "/api/hives/gallery/{id}", config: Hives.gallery },
  { method: "DELETE", path: "/api/hives/deleteImage/{folder}/{id}", config: Hives.deleteImage },

  { method: "GET", path: "/api/users", config: Users.find },
  { method: "GET", path: "/api/users/{id}", config: Users.findOne },
  { method: "POST", path: "/api/users", config: Users.create },
  { method: "DELETE", path: "/api/users/{id}", config: Users.deleteOne },
  { method: "DELETE", path: "/api/users", config: Users.deleteAll },
  { method: "PUT", path: "/api/users/{id}", config: Users.update },
  { method: "GET", path: "/api/users/findByEmail/{email}", config: Users.findByEmail },
  { method: "PUT", path: "/api/users/toggleAdmin/{id}", config: Users.toggleAdmin },
  

  { method: "POST", path: "/api/users/authenticate", config: Users.authenticate },

  {
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: "./public",
      },
    },
    options: { auth: false },
  },
];
