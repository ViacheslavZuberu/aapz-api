const express = require("express");
const router = express.Router();
const eventService = require("../services/event.service");
const authorize = require("../_helpers/authorize");
const Role = require("../_helpers/role");

// Routes
router.post("/create", authorize([Role.MeetupManager, Role.Admin]), create);
router.post("/subscribe/:id", authorize(), subscribe);
router.post("/unsubscribe/:id", authorize(), unsubscribe);
router.post(
  "/change_att/:att_id/:status",
  authorize([Role.MeetupManager, Role.Admin]),
  changeAttendance
);
router.get(
  "/manager",
  authorize([Role.MeetupManager, Role.Admin]),
  getManagerEvents
);
router.get(
  "/manager/:id",
  authorize([Role.MeetupManager, Role.Admin]),
  getManagerEvent
);
router.get("/", authorize(), getAll);
router.get("/subscribed", authorize(), getSubscribedEvents);
router.get("/:id", authorize(), getEventById);
router.delete("/:id", authorize([Role.MeetupManager, Role.Admin]), deleteEvent);
router.patch("/:id", authorize([Role.MeetupManager, Role.Admin]), updateEvent);

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

function deleteEvent(req, res, next) {
  let userId = req.user.sub;
  let eventId = req.params.id;

  eventService
    .deleteEvent({ eventId, userId })
    .then(events => res.json(events))
    .catch(err => next(err));
}

function updateEvent(req, res, next) {
  let userId = req.user.sub;
  let eventId = req.params.id;
  let content = req.body;

  eventService
    .updateEvent({ eventId, userId, content })
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

function getManagerEvents(req, res, next) {
  let userId = req.user.sub;

  eventService
    .getManagerEvents(userId)
    .then(events => res.json(events))
    .catch(err => next(err));
}

function getManagerEvent(req, res, next) {
  let eventId = req.params.id;

  eventService
    .getManagerEvent(eventId)
    .then(events => res.json(events))
    .catch(err => next(err));
}

function changeAttendance(req, res, next) {
  let attId = req.params.att_id;
  let newStatus = req.params.status === "true" ? true : false;

  eventService
    .changeAttendance(attId, newStatus)
    .then(events => res.json(events))
    .catch(err => next(err));
}
