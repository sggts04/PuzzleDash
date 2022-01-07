const { Server } = require("socket.io");
const {
    filterPuzzles,
    getExtendedPuzzleSet,
    getNumOfPuzzles
} = require('../helpers/helpers.js');
const Player = require('../data/model.js')

state = {}

async function finishGame(socketId) {
    // check if game already ended
    if(!(socketId in state)) {
        return;
    }
    let gameState = JSON.parse(JSON.stringify(state[socketId]));
    delete state[socketId];

    let result = await Player.findOne({ username: gameState.username, time: gameState.time }).exec();

    if(!result) {
        await Player.create({ username: gameState.username, time: gameState.time, score: gameState.score });
    } else {
        if(gameState.score > result.score) {
            await Player.updateOne({ username: gameState.username, time: gameState.time }, { score: gameState.score })
        }
    }
}

function setupWs(server) {
    const io = new Server(server);
    console.log("Socket.io listening.");
    
    io.on('connection', (socket) => {
        console.log('a user connected');
    
        socket.on('start', async (msg) => {
            // start new game
            console.log(msg);
            if(socket.id in state) {
                // socket already in state, delete old state for new game
                await finishGame(socket.id);
            }
            let newGame = {
                username: msg.username,
                time: msg.selectedTime,
                puzzleStartDateTime: new Date(),
                puzzleEndDateTime: new Date((new Date()).getTime() + msg.selectedTime * 60000),
                puzzles: filterPuzzles(getNumOfPuzzles(msg.selectedTime)),
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
            setTimeout(async () => {
                await finishGame(socket.id);
            }, msg.selectedTime * 60000);
        });

        socket.on('move', async (msg) => {
            // game has already ended
            if(!(socket.id in state)) {
                return;
            }
            // check if game ended
            let timeDifference = state[socket.id].puzzleEndDateTime.getTime() - new Date().getTime();
            if(timeDifference < 0) {
                await finishGame(socket.id);
                return;
            }
            console.log(msg);
            let puzzle = state[socket.id].puzzles[state[socket.id].curr]
            if(puzzle.answer[state[socket.id].currentAnsIter] != msg.move) {
                // wrong move
                state[socket.id].currentAnsIter = 0;
                state[socket.id].curr++;
                if(state[socket.id].puzzles.length == state[socket.id].curr) {
                    state[socket.id].puzzles.push(...getExtendedPuzzleSet()) 
                }
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
                    // correct move but puzzle hasn't ended
                    let reply = {move: puzzle.answer[state[socket.id].currentAnsIter]}
                    console.log("emit: ", reply);
                    socket.emit("move", reply);
                    state[socket.id].currentAnsIter++;
                } else {
                    // correct move and puzzle ended
                    state[socket.id].currentAnsIter = 0;
                    state[socket.id].curr++;
                    state[socket.id].score++;
                    if(state[socket.id].puzzles.length == state[socket.id].curr) {
                        state[socket.id].puzzles.push(...getExtendedPuzzleSet()) 
                    }
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

        socket.on('end', async (msg) => {
            // game has already ended
            if(!(socket.id in state)) {
                return;
            }
            await finishGame(socket.id);
        });

        socket.on('disconnect', async () => {
            // game has already ended
            if(!(socket.id in state)) {
                return;
            }
            await finishGame(socket.id);
        });

    });
}

module.exports = setupWs