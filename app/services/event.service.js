const Event = require("../models/event.model");
const mongoose = require("mongoose");

module.exports = {
  createEvent,
  getAll,
  register,
  unregister,
  getSubscribedEvents,
  getEventById
};

async function createEvent({ title, type, place, datetime, user }) {
  let event = new Event({
    _id: new mongoose.Types.ObjectId(),
    title,
    type,
    place,
    datetime,
    hostUser: user.sub
  });

  event.save();

  return event;
}

async function getAll() {
  let events = await Event.find().lean();

  return events.map(e => {
    const { __v, ...clearEvent } = e;
    return clearEvent;
  });
}

async function register({ userId, eventId }) {
  let subscriptions = await Event.findById(eventId).findOne({
    subscribedUsers: { _id: userId }
  });

  if (subscriptions) {
    throw "Already subscribed!";
  }

  let event = await Event.findById(eventId);

  event.subscribedUsers.push(userId);

  event.save();

  return event;
}

async function unregister({ userId, eventId }) {
  let event = await Event.findById(eventId);

  event.subscribedUsers.pull(userId);

  event.save();

  return event;
}

async function getSubscribedEvents(userId) {
  let events = await Event.find({ subscribedUsers: userId }).lean();

  return events.map(event => {
    const { __v, subscribedUsers, ...safeEvent } = event;
    return safeEvent;
  });
}

async function getEventById(eventId, userId) {
  let event = await Event.findById(eventId).lean();
  let isSubscribed = await Event.findById(eventId)
    .find({
      subscribedUsers: userId
    })
    .countDocuments();

  isSubscribed = Boolean(isSubscribed);
  const { __v, subscribedUsers, ...pureEvent } = event;
  pureEvent.isSubscribed = isSubscribed;

  return pureEvent;
}
