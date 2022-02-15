"use strict";
const { logger } = require("handlebars");
const Hive = require("../models/hive");
const User = require("../models/user");
const Cloudinary = require("../utils/cloudinary");

const Analytics = {

    report: async function () {
        let report = '';
        try {
            const totalHives =  await Hive.find({}).lean();
            const hivesCount = totalHives.length;
            const totalSuperHives = (await Hive.find({ hiveType: "Super" }).lean()).length;
            const totalNationalHives = (await Hive.find({ hiveType: "National" }).lean()).length;
            const totalMembers = (await User.find({}).lean()).length;
            const totalMembersAdmin = (await User.find({ admin: "true" }).lean()).length;

            report = {
                total: hivesCount,
                supers: totalSuperHives,
                nationals: totalNationalHives,
                memberCount: totalMembers,
                adminCount: totalMembersAdmin,
            };
        
        } catch (error) {
            console.log(error);
        }
        return report;
  }
};

module.exports = Analytics;
