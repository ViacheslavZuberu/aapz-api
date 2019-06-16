const Event = require("../models/event.model");
const mongoose = require("mongoose");

module.exports = {
  createEvent,
  getAll,
  register,
  unregister,
  getSubscribedEvents,
  getEventById,
  deleteEvent,
  updateEvent,
  getManagerEvents,
  getManagerEvent
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

async function deleteEvent({ eventId, userId }) {
  let event = await Event.findById(eventId)
    .select("title place datetime hostUser")
    .lean();

  if (!event) {
    throw "There's no event with such ID";
  }

  if (event.hostUser.equals(userId)) {
    await Event.findByIdAndDelete(eventId);
    return event;
  }

  throw {
    name: "PermissionError",
    text: "User is not an owner of this event!"
  };
}

async function updateEvent({ eventId, userId, content }) {
  let event = await Event.findById(eventId).exec();

  if (!event) {
    throw "Wrong event ID!";
  }

  if (!event.hostUser.equals(userId)) {
    throw {
      name: "PermissionError",
      text: "You are not an owner of the event!"
    };
  }

  event.title = content.title || event.title;
  event.type = content.type || event.type;
  event.place = content.place || event.place;
  event.datetime = content.datetime || event.datetime;
  event.status = content.datetime || event.status;

  await event.save();

  return event;
}

async function getAll() {
  let events = await Event.find()
    .select("-__v -subscribedUsers")
    .lean();

  return events;
}

async function register({ userId, eventId }) {
  let subscriptions = await Event.findById(eventId).findOne({
    subscribedUsers: { _id: userId }
  });

  if (subscriptions) {
    throw "Already subscribed!";
  }

  let event = await Event.findById(eventId);

  event.subscribedUsers.push({ user: userId });

  event.save();

  return event;
}

async function unregister({ userId, eventId }) {
  let event = await Event.findByIdAndUpdate(eventId, {
    $pull: {
      subscribedUsers: {
        user: userId
      }
    }
  });

  return event;
}

async function getSubscribedEvents(userId) {
  let events = await Event.find({ "subscribedUsers.user": userId }).lean();

  return events.map(event => {
    const { __v, subscribedUsers, ...safeEvent } = event;
    return safeEvent;
  });
}

async function getEventById(eventId, userId) {
  let event = await Event.findById(eventId)
    .select("title type place datetime subscribedUsers")
    .lean();
  let isSubscribed = await Event.findById(eventId)
    .find({
      subscribedUsers: userId
    })
    .countDocuments();

  isSubscribed = Boolean(isSubscribed);
  event.isSubscribed = isSubscribed;
  event.subscribers = event.subscribedUsers.length;

  const { subscribedUsers, ...resultEvent } = event;

  return resultEvent;
}

async function getManagerEvents(userId) {
  let events = await Event.find({ hostUser: userId })
    .select("-hostUser -__v")
    .lean();

  return events.map(event => {
    event.subscribers = event.subscribedUsers.length;
    delete event.subscribedUsers;
    return event;
  });
}

async function getManagerEvent(eventId) {
  return await Event.findById(eventId)
    .select("-__v -hostUser")
    .populate({ path: "subscribedUsers.user", select: "-__v -password" })
    .lean();
}
