const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visitScheme = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: Schema.Types.ObjectId, ref: "User" },
    event: { type: Schema.Types.ObjectId, ref: "Event" }
});

module.exports = mongoose.model("Visit", visitScheme);