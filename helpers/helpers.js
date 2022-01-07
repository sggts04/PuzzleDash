let puzzles = require('../data/puzzles.js');

function filterPuzzles(num) {
    let filteredPuzzles = [];
    num = Number(num);
    if(num > 200 || num < 1 || !Number.isInteger(num)) return filteredPuzzles;
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

function getExtendedPuzzleSet() {
    let filteredPuzzles = [];
    let num = 10;
    let startPoint = Math.floor(3 * puzzles.length / 4) - 10;
    let chunkSize = Math.floor((startPoint/3)/num);
    let start = startPoint, end = startPoint + chunkSize;
    for(let i=0; i<num; i++) {
        let randomChunkIndex = start + Math.floor(Math.random() * chunkSize);
        filteredPuzzles.push(puzzles[randomChunkIndex]);
        start = end;
        end = end + chunkSize;
    }
    return filteredPuzzles;
}

function getNumOfPuzzles(time) {
    let min = 40;
    return min + time * 10;
}

module.exports = {
    filterPuzzles,
    getExtendedPuzzleSet,
    getNumOfPuzzles
};