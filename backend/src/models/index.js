const dbConfig = require("../config/db.config");
console.log(dbConfig);

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;

db.url = dbConfig.url;

db.club = require("./club.model")(mongoose);


module.exports = db;