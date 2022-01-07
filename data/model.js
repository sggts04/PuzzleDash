const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: String,
    score: Number,
    time: Number
});

const Player = mongoose.model("Player", playerSchema);

module.exports = Player