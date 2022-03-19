"use strict";

const axios = require("axios");
const weatherapiKey = process.env.weatherapiKey;

const Weather = {
  readWeather: async function (lat, lon) {
    let weather = null;
    const weatherRequest = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherapiKey}`;
    try {
      const response = await axios.get(weatherRequest);
      if (response.status == 200) {
        weather = response.data;
      }
    } catch (error) {
      console.log(error);
    }
    return weather;
  },

  readWeatherHistory: async function (lat, lon, dateLogged) {
    let weather = [];
    let returnWeather = [];
    var dateNow = Math.round((Date.now() / 1000)-((Date.now() / 1000)%3600));
    var epocDate = new Date(dateLogged);
    epocDate = epocDate.getTime() / 1000;

    var weatherRequest = `http://history.openweathermap.org/data/2.5/history/city?lat=${lat}&lon=${lon}&type=hour&start=${epocDate}&end=${dateNow}&appid=${weatherapiKey}`;
    try {
      var response = await axios.get(weatherRequest);
      if (response.status == 200) {
        weather = response.data.list;
        var ts = epocDate;
      }
      var lastDate = weather[(weather.length)-1]["dt"]
      while(lastDate < dateNow-86400){
        epocDate = weather[(weather.length)-1]["dt"]
        weatherRequest = `http://history.openweathermap.org/data/2.5/history/city?lat=${lat}&lon=${lon}&type=hour&start=${epocDate}&end=${dateNow}&appid=${weatherapiKey}`;
        response = await axios.get(weatherRequest);
        if (response.status == 200) {
          Array.prototype.push.apply(weather,response.data.list)
          //weather.concat(response.data.list);
          ts = epocDate;
        }
        lastDate = weather[(weather.length)-1]["dt"]
      }
      if (weather.length > 0) {
        weather.forEach((element) => {
          //element.reverse()
          returnWeather.push({
            Temperature: Math.round(element["main"]["temp"] - 273.15),
            Humidity: element["main"]["humidity"],
            timeStamp: element["dt"],
          });
        });
      }
    } catch (error) {
      console.log(error);
    }
    return returnWeather.reverse();
  },

  fetchWeather: async function (lat, lon) {
    let weather = await this.readWeather(lat, lon);
    let report = "";
    if (weather != null) {
      report = {
        feelsLike: Math.round(weather.main.feels_like - 273.15),
        clouds: weather.weather[0].description,
        windSpeed: weather.wind.speed,
        windDirection: weather.wind.deg,
        visibility: weather.visibility / 1000,
        humidity: weather.main.humidity,
      };
    } else {
      report = "Unknown Location";
    }
    return report;
  },
};

module.exports = Weather;
