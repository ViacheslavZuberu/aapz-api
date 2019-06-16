const express = require("express");
const router = express.Router();
const userService = require("../services/user.service");
const authorize = require("../_helpers/authorize");
const Role = require("../_helpers/role");

// routes
router.post("/authenticate", authenticate); // public route
router.post("/register", register); // public route
router.post("/upgrade/:id", authorize(Role.Admin), upgradeUser);
router.post("/downgrade/:id", authorize(Role.Admin), downgradeUser);
router.delete("/remove/:id", authorize(Role.Admin), deleteUser);
router.get("/", authorize(Role.Admin), getAll); // admin only
router.get("/:id", authorize(), getById); // all authenticated users
module.exports = router;

function authenticate(req, res, next) {
  userService
    .authenticate(req.body)
    .then(user =>
      user
        ? res.json(user)
        : res.status(400).json({
            message: "Username or password is incorrect"
          })
    )
    .catch(err => next(err));
}

function register(req, res, next) {
  userService
    .register(req.body)
    .then(ok =>
      ok
        ? res.json({ message: "OK" })
        : res.status(400).json({
            message: "Username or password is incorrect"
          })
    )
    .catch(err => next(err));
}

function deleteUser(req, res, next) {
  userService
    .removeUser(req.params.id)
    .then(deletedUser => res.status(200).json(deletedUser))
    .catch(err => next(err));
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then(users => res.json(users))
    .catch(err => next(err));
}

function getById(req, res, next) {
  const currentUser = req.user;
  const id = parseInt(req.params.id);

  // only allow admins to access other user records
  if (id !== currentUser.sub && currentUser.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .getById(req.params.id)
    .then(user => (user ? res.json(user) : res.sendStatus(404)))
    .catch(err => next(err));
}

function upgradeUser(req, res, next) {
  const id = req.params.id;

  userService
    .upgradeUser(id)
    .then(user => (user ? res.json(user) : res.sendStatus(404)))
    .catch(err => next(err));
}

function downgradeUser(req, res, next) {
  const id = req.params.id;

  userService
    .downgradeUser(id)
    .then(user => (user ? res.json(user) : res.sendStatus(404)))
    .catch(err => next(err));
}
