const mongoose = require("mongoose");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const roles = require("./role");

async function connectDatabase(url) {
  mongoose.connect(url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
  });

  const hasAdmin = await User.findOne({ username: "admin" })
    .select("_id")
    .lean();

  if (!hasAdmin) {
    let admin = new User({
      _id: new mongoose.Types.ObjectId(),
      username: "admin",
      password: bcrypt.hashSync("admin", 10),
      role: roles.Admin,
      firstname: "Admin",
      lastname: "Admin"
    });

    admin
      .save()
      .then(user => {
        console.log("Object is saved: ", user);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = connectDatabase;
