"use strict";

const axios = require("axios");

class HiveTracker {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getUsers() {
    try {
      const response = await axios.get(this.baseUrl + "/api/users");
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async getUser(id) {
    try {
      const response = await axios.get(this.baseUrl + "/api/users/" + id);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async getUserByEmail(email) {
    try {
      const response = await axios.get(this.baseUrl + "/api/users/findByEmail/" + email);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async createUser(newUser) {
    try {
      const response = await axios.post(this.baseUrl + "/api/users", newUser);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async update(firstName, lastName, email, password, id) {
    const details = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password
    }
    try {
      const response = await axios.put(this.baseUrl + "/api/users/" + id, details);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async deleteAllUsers() {
    try {
      const response = await axios.delete(this.baseUrl + "/api/users");
      return response.data;
    } catch (e) {
      return e;
    }
  }

  async deleteOneUser(id) {
    try {
      const response = await axios.delete(this.baseUrl + "/api/users/" + id);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async toggleAdmin(id){
    try {
      const response = await axios.put(this.baseUrl + "/api/users/toggleAdmin/" + id)
      return response.statusText;
    } catch (error) {
      return error
    }
  }

  async getHives() {
    try {
      const response = await axios.get(this.baseUrl + "/api/hives");
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async getHive(id) {
    try {
      const response = await axios.get(this.baseUrl + "/api/hives/" + id);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async getHiveByOwner(id) {
    try {
      const response = await axios.get(this.baseUrl + "/api/hives/getHiveByOwner/" + id);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async createHive(latitude, longtitude, hiveType, description, comments , owner ) {

    const newHive = {
      latitude: latitude,
      longtitude: longtitude,
      hiveType: hiveType,
      description: description,
      details: {comments: comments},
      owner: owner

    }
    try {
      const response = await axios.post(this.baseUrl + "/api/hives", newHive);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async deleteAllHives() {
    try {
      const allHives = await axios.get(this.baseUrl + "/api/hives");
      const hives = allHives.data;
      var resp = [];
      for (var i = 0; i< hives.length; i++){
        const response = await axios.delete(this.baseUrl + "/api/hives/" + hives[i]._id.toString());
        resp.push(response.data)
      }
      return resp;
    } catch (e) {
      return null;
    }
  }

  async deleteOneHive(id) {
    try {
      const response = await axios.delete(this.baseUrl + "/api/hives/" + id);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async addHiveComment(id, comment) {

    const details = {
      _id: id,
      comment: comment
    }
    try {
      const response = await axios.post(this.baseUrl + "/api/hives/addComment", details);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async deleteHiveComment(hive_id, comment_id) {
    try {
      const response = await axios.delete(this.baseUrl + "/api/hives/deleteComment/" + hive_id + "/" + comment_id);
      return response.data;
    } catch (e) {
      return null;
    }
  }


  async authenticate(user) {
    try {
      const response = await axios.post(this.baseUrl + "/api/users/authenticate", user);
      axios.defaults.headers.common["Authorization"] = "Bearer " + response.data.token;
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async clearAuth(user) {
    axios.defaults.headers.common["Authorization"] = "";
  }
}

module.exports = HiveTracker;
