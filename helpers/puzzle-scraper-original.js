const axios = require('axios').default;
const fs = require('fs');
var id = 61272
puzzles = []

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}   

async function getPuzzles() {
    var i = 0
    while(true) {
        await axios.post(`https://lichess.org/training/${id+i}/attempt`, {
            win: (Math.random() > 0.4) ? 1: 0,
            time: Math.floor(Math.random() * 1000)
        })
        .then(response => {
            console.log(id+i);
            let resp = {};
            let data = response.data;
            resp.id = Number(data.puzzle.id);
            resp.rating = Number(data.puzzle.rating);
            resp.fen = data.puzzle.fen;
            resp.color = data.puzzle.color;
            resp.start = data.game.treeParts[data.game.treeParts.length - 1].san;
            resp.answer = []
            let iter = data.puzzle.branch;
            while (iter) {
                resp.answer.push(iter.san);
                iter = iter.children[0];
            }
            puzzles.push(resp);
            fs.writeFile("data/puzzles.json", JSON.stringify(puzzles), function (err) {
                if (err) throw err;
                console.log('Wrote ' + String(puzzles.length) + ' Puzzles to File');
            });
        })
        .catch(err => {
            console.log(err);
        })
        i++;
        if(i%5==0) {
            console.log('Sleeping 2sec after 5!');
            await sleep(2000);
        }
    }
}

getPuzzles();