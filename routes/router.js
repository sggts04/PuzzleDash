const express = require('express');
const router = express.Router();
const {
    filterPuzzles
} = require('../helpers/helpers.js');

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
})

router.get('/puzzles/:num', (req, res) => {
    const {
        num
    } = req.params;
    let filteredPuzzles = filterPuzzles(num);
    res.json(filteredPuzzles);
})

module.exports = router