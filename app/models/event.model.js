const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventScheme = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  type: { type: String, required: true },
  place: { type: String, required: true },
  datetime: { type: Date, required: true },
  status: { type: String, default: "not started" },
  hostUser: { type: Schema.Types.ObjectId, ref: "User" },
  subscribedUsers: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      attended: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model("Event", eventScheme);
