const express = require('express');
const router = express.Router();
const {
    filterPuzzles
} = require('../helpers/helpers.js');
const Player = require('../data/model.js')

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
})

router.get('/puzzles/:num', (req, res) => {
    const { num } = req.params;
    let filteredPuzzles = filterPuzzles(num);
    res.json(filteredPuzzles);
})

router.get('/leaderboard/:time', async (req, res) => {
    const { time } = req.params;
    const players = await Player.find({time: time}).sort({score: "descending"});
    return res.json(players)
})

module.exports = router