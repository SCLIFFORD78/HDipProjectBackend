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

  readWeatherHistory: async function (lat, lon, time) {
    let weather = [];
    let returnWeather = [];
    var weatherRequest = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${time}&appid=${weatherapiKey}`;
    try {
      var response = await axios.get(weatherRequest);
      if (response.status == 200) {
        weather.push(response.data["hourly"]);
        var ts = time;
        for (let index = 0; index < 5; index++) {
          var ts = ts - 86400;
          weatherRequest = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${ts}&appid=${weatherapiKey}`;
          response = await axios.get(weatherRequest);
          if (response.status == 200) {
            weather.push(response.data["hourly"]);
          }
        }
      }
      if (weather.length > 0){
        weather.forEach(element => {
            element.reverse()
            element.forEach(reading => {
                returnWeather.push({Temperature:Math.round(reading['temp'] - 273.15), Humidity:reading['humidity'], timeStamp:reading['dt']})
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
