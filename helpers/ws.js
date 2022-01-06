const { Server } = require("socket.io");
const {
    filterPuzzles
} = require('../helpers/helpers.js');

leaderboard = {}
state = {}

function handleAbruptGameChange(id) {
    // todo: update points from old score
    delete state[id]
}

function finishGame(socketId) {
    if(!(socketId in state)) {
        return;
    }
    let gameState = state[socketId];

    if(!(gameState.username in leaderboard))
        leaderboard[gameState.username] = 0;

    if(gameState.score > leaderboard[gameState.username])
        leaderboard[gameState.username] = gameState.score;

    console.log(leaderboard);
    delete state[socketId];
}

function setupWs(server) {
    const io = new Server(server);
    console.log("Socket.io listening.");
    
    io.on('connection', (socket) => {
        console.log('a user connected');
    
        socket.on('start', (msg) => {
            console.log(msg);
            if(socket.id in state) {
                handleAbruptGameChange(socket.id);
            }
            let newGame = {
                username: msg.username,
                puzzleStartDateTime: new Date(),
                puzzleEndDateTime: new Date((new Date()).getTime() + msg.selectedTime * 60000),
                puzzles: filterPuzzles(80),
                curr: 0,
                score: 0,
                currentAnsIter: 0
            }
            state[socket.id] = newGame;
            let puzzle = newGame.puzzles[newGame.curr];
            reply = {
                puzzleEndDateTime: newGame.puzzleEndDateTime,
                puzzle: {
                    id: puzzle.id,
                    rating: puzzle.rating,
                    fen: puzzle.fen,
                    color: puzzle.color,
                    start: puzzle.start
                }
            };
            console.log("emit: ", reply);
            socket.emit("start", reply);
            setTimeout(() => {
                finishGame(socket.id);
            }, msg.selectedTime * 60000);
        });

        socket.on('move', (msg) => {
            // game has already ended
            if(!(socket.id in state)) {
                return;
            }
            // check if game ended
            let timeDifference = state[socket.id].puzzleEndDateTime.getTime() - new Date().getTime();
            if(timeDifference < 0) {
                finishGame(socket.id);
                return;
            }
            console.log(msg);
            let puzzle = state[socket.id].puzzles[state[socket.id].curr]
            if(puzzle.answer[state[socket.id].currentAnsIter] != msg.move) {
                state[socket.id].currentAnsIter = 0;
                state[socket.id].curr++;
                let puzzleN = state[socket.id].puzzles[state[socket.id].curr];
                reply = {
                    correct: false,
                    puzzle: {
                        id: puzzleN.id,
                        rating: puzzleN.rating,
                        fen: puzzleN.fen,
                        color: puzzleN.color,
                        start: puzzleN.start
                    }
                }
                console.log("emit: ", reply);
                socket.emit("change", reply);
            } else {
                state[socket.id].currentAnsIter++;
                if(state[socket.id].currentAnsIter != puzzle.answer.length) {
                    let reply = {move: puzzle.answer[state[socket.id].currentAnsIter]}
                    console.log("emit: ", reply);
                    socket.emit("move", reply);
                    state[socket.id].currentAnsIter++;
                } else {
                    state[socket.id].currentAnsIter = 0;
                    state[socket.id].curr++;
                    state[socket.id].score++;
                    let puzzleN = state[socket.id].puzzles[state[socket.id].curr];
                    reply = {
                        correct: true,
                        puzzle: {
                            id: puzzleN.id,
                            rating: puzzleN.rating,
                            fen: puzzleN.fen,
                            color: puzzleN.color,
                            start: puzzleN.start
                        }
                    }
                    console.log("emit: ", reply);
                    socket.emit("change", reply);
                }
            }
        })

        socket.on('end', (msg) => {
            // game has already ended
            if(!(socket.id in state)) {
                return;
            }
            finishGame(socket.id);
        });

    });
}

module.exports = setupWs
