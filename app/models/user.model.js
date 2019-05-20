const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userScheme = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: false,
        unique: false,
        match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    birth_date: { type: String, required: false },
    role: { type: String, required: true }
});

module.exports = mongoose.model("User", userScheme);