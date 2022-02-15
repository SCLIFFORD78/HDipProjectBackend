'use strict';

const cloudinary = require('cloudinary');
//const fs = require('fs');
//const util = require('util');
//const writeFile = util.promisify(fs.writeFile);

const Cloudinary = {
  configure: function() {
    const credentials = {
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret
    };
    cloudinary.config(credentials);
  },

  createUploadPreset: async function(hive){
    await cloudinary.v2.api.create_upload_preset({name:hive, unsigned:true, folder:hive, tags:hive},console.log);
    try {
      const folder = await cloudinary.v2.api.create_folder(hive);

    } catch (error) {
      
      console.log(error);
    }

  },

  deleteUploadPreset: async function (hive) {
    await cloudinary.api.delete_upload_preset(hive, console.log);
  },

  deleteResourcesByPrefix: async function (hive) {
    await cloudinary.api.delete_resources_by_prefix(hive,console.log);
  },

  deleteFolder: async function (hive) {
    await cloudinary.api.delete_folder(hive,console.log);
  },

  getAllImages: async function(id) {
    const result = await cloudinary.v2.api.resources_by_tag(id);
    return result.resources;
  },

  deleteImage: async function(id) {
    
    await cloudinary.v2.uploader.destroy(id, {},console.log);
  }, 



};

module.exports = Cloudinary;
