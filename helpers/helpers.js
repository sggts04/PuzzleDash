let puzzles = require('../data/puzzles.js');

function filterPuzzles(num) {
    filteredPuzzles = [];
    num = Number(num);
    if(num > 100 || num < 1 || !Number.isInteger(num)) return filteredPuzzles;
    let chunkSize = Math.floor(puzzles.length / num);
    let start = 0, end = chunkSize;
    for(let i=0; i<num; i++) {
        let randomChunkIndex = start + Math.floor(Math.random() * chunkSize);
        filteredPuzzles.push(puzzles[randomChunkIndex]);
        start = end;
        end = end + chunkSize;
    }
    return filteredPuzzles;
}

module.exports = {
    filterPuzzles
};