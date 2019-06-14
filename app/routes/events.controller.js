const express = require("express");
const router = express.Router();
const eventService = require("../services/event.service");
const authorize = require("../_helpers/authorize");
const Role = require("../_helpers/role");

// Routes
router.post("/create", authorize([Role.MeetupManager, Role.Admin]), create);
router.post("/subscribe/:id", authorize(), subscribe);
router.post("/unsubscribe/:id", authorize(), unsubscribe);
router.get("/", authorize(), getAll);
router.get("/subscribed", authorize(), getSubscribedEvents);
router.get("/:id", authorize(), getEventById);
module.exports = router;

function create(req, res, next) {
  let data = Object.assign({}, req.body);
  data["user"] = req.user;

  console.log(req.body);

  eventService
    .createEvent(data)
    .then(event => res.json(event))
    .catch(err => next(err));
}

function getAll(req, res, next) {
  eventService
    .getAll()
    .then(events => res.json(events))
    .catch(err => next(err));
}

function subscribe(req, res, next) {
  let userId = req.user.sub;
  let eventId = req.params.id;

  eventService
    .register({ userId, eventId })
    .then(event => res.json(event))
    .catch(err => next(err));
}

function unsubscribe(req, res, next) {
  let userId = req.user.sub;
  let eventId = req.params.id;

  eventService
    .unregister({ userId, eventId })
    .then(event => res.json(event))
    .catch(err => next(err));
}

function getSubscribedEvents(req, res, next) {
  let userId = req.user.sub;

  eventService
    .getSubscribedEvents(userId)
    .then(events => res.json(events))
    .catch(err => next(err));
}

function getEventById(req, res, next) {
  let userId = req.user.sub;
  let eventId = req.params.id;

  eventService
    .getEventById(eventId, userId)
    .then(event => res.json(event))
    .catch(err => next(err));
}
