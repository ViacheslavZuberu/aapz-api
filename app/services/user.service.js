const config = require("config.json");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const Role = require("../_helpers/role");
const mongoose = require("mongoose");

module.exports = {
  authenticate,
  getAll,
  getById,
  register,
  removeUser,
  upgradeUser,
  downgradeUser
};

async function authenticate({ username, password }) {
  const user = await User.findOne({
    username
  }).lean();

  let userPass = password;

  if (user) {
    const correctPass = bcrypt.compareSync(userPass, user.password);

    if (!correctPass) {
      throw "Password is incorrect!";
    }

    const token = jwt.sign(
      {
        sub: user._id,
        role: user.role
      },
      config.secret
    );

    const { password, __v, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      token
    };
  }
}

async function register({
  username,
  password,
  email,
  firstname,
  lastname,
  birth_date
}) {
  const existing = await User.findOne({ username }).lean();

  if (existing) {
    throw "User already exists!";
  }

  let userBase = {
    _id: new mongoose.Types.ObjectId(),
    username,
    password: bcrypt.hashSync(password, 10),
    firstname,
    lastname,
    role: Role.User
  };

  if (email) {
    userBase.email = email;
  }

  if (birth_date) {
    userBase.birth_date = birth_date;
  }

  let newUser = new User(userBase);

  newUser.save().catch(err => console.log(err));

  return true;
}

async function removeUser(userId) {
  let deletedUser = await User.findByIdAndDelete(userId);
  let result = {
    message: "There's no user with such ID!"
  };

  if (deletedUser) {
    const { __v, password, ...safeUser } = deletedUser;
    result = safeUser;
  }

  return result;
}

async function getAll({ perPage, page }) {

  perPage = parseInt(perPage) || 10;
  page = parseInt(page) || 0;

  let lastPage = Math.ceil(await User.find().countDocuments() / perPage); 
  let usersQuery = User.find().select("-password -__v");

  if (perPage > 0) {
    usersQuery.limit(perPage)
  }

  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;

  if (page > 0) {
    usersQuery.skip(perPage * (page - 1));
  }

  let users = await usersQuery.lean();

  return { 
    users,
    page,
    perPage,
    lastPage
  };
}

async function getById(id) {
  const user = await User.findOne({ _id: id }).lean();

  if (!user) {
    throw `There is no user with id: ${id}`;
  }

  const { password, __v, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

async function upgradeUser(id) {
  const user = await User.findByIdAndUpdate(id, {
    $set: {
      role: Role.MeetupManager
    }
  }).select("-__v -password");

  return user;
}

async function downgradeUser(id) {
  const user = await User.findByIdAndUpdate(id, {
    $set: {
      role: Role.User
    }
  }).select("-__v -password");

  return user;
}
