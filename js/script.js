const moveAudio = new Audio('sounds/Move.mp3');
const captureAudio = new Audio('sounds/Capture.mp3');
const confirmAudio = new Audio('sounds/Confirmation.mp3');
const startAudio = new Audio('sounds/Berserk.mp3');
const endAudio = new Audio('sounds/Error.mp3');
const gameOverAudio = new Audio('sounds/gameOver.wav');
const gameFinishAudio = new Audio('sounds/Victory.mp3');
const lowTimeAudio = new Audio('sounds/LowTime.mp3');

function start() {
    let selectedTime = Number($('input[name="timeSelect"]:checked').val());
    $('#startPage').hide();
    $('#loadingPage').css("display", "flex");
    $.ajax({
        url: `https://puzzle-dash.herokuapp.com/puzzles/80`,
        complete(resp) {
            $('#loadingPage').hide();
            $('#gameDiv').css("display", "flex");
            const puzzles = resp.responseJSON;
            startAudio.play();
            var a = 'hi';
            let userHistory = [];
            let id = 0;
            let correct = 0;
            let wrong = 0;
            let puzzleStartDateTime = new Date();
            let puzzleEndDateTime = new Date(puzzleStartDateTime.getTime() + selectedTime * 60000);
            let timerId = setInterval(() => {
                timer(puzzleEndDateTime, timerId)
            }, 1000);
            loadPuzzle(puzzles, id, userHistory, correct, wrong, puzzleEndDateTime, timerId);
        }
    });
}

function timer(puzzleEndDateTime, timerId) {
    let timeDifference = puzzleEndDateTime.getTime() - new Date().getTime();
    let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    if(timeDifference < 0) {
        gameOver(10, timerId);
    }
    let mins = String(minutes);
    let secs = String(seconds);
    if (seconds < 10) secs = `0${secs}`;
    if (minutes === 0 && seconds === 30) {
        lowTimeAudio.play();
        $('#timer').css("color", "red");
    }
    $('#timer').text(`${mins}:${secs}`);

}

function setInfo(puzzles, id, userHistory, correct, wrong) {
    if (id < puzzles.length) {
        const data = puzzles[id];

        // Move Color
        $('#moveColor').text(`${data.color.charAt(0).toUpperCase() + data.color.slice(1)} To Move`);
        if (data.color === 'black') {
            $('#colorSquare').css("background-color", "#363236");
        } else {
            $('#colorSquare').css("background-color", "#ececec");
        }
    }
    // Score
    $('#score').text(correct);

    // Solved Puzzles
    if (id > 0) {
        let lichessPuzzleID = puzzles[id - 1].id;
        let elem;
        if (userHistory[id - 1])
            elem = `<a href="https://lichess.org/training/${lichessPuzzleID}" target="_blank"><img class="marks" src="img/tick.png"></img></a>`;
        else
            elem = `<a href="https://lichess.org/training/${lichessPuzzleID}" target="_blank"><img class="marks" src="img/cross.png"></img></a>`;
        $('#solvedPuzzles').append(elem);
    }
}

function gameOver(correct, timerId) {
    console.log("Game Over!");
    gameOverAudio.play();
    clearInterval(timerId);
    $('#gameBoardDiv').hide();
    $('#moveColorDiv').hide();
    $('#gameOver').css("display", "flex");
    let text = '';
    if (correct < 5) text = 'Bad Luck!';
    else if (correct < 10) text = 'Keep Trying!';
    else if (correct < 20) text = 'Nice One!';
    else if (correct < 30) text = 'Amazing!';
    else text = 'Excellent!';
    $('#scoreText').text(text);
}

function gameFinish(timerId) {
    console.log("Game Finish!");
    gameFinishAudio.play();
    clearInterval(timerId);
    $('#gameBoardDiv').hide();
    $('#moveColorDiv').hide();
    $('#gameOver').css("display", "flex");
    let text = 'Outstanding!';
    $('#scoreText').text(text);
}

function loadPuzzle(puzzles, id, userHistory, correct, wrong, puzzleEndDateTime, timerId) {
    setInfo(puzzles, id, userHistory, correct, wrong);
    if (wrong == 3) {
        gameOver(correct, timerId);
        return;
    }
    if (id >= puzzles.length) {
        gameFinish(timerId);
        return;
    }
    const data = puzzles[id];
    console.log(`Puzzle ID: ${String(data.id)}`);
    console.log(`Puzzle Rating: ${String(data.rating)}`);
    const startMove = data.start;
    const playing = true;
    let color = 'white';
    let mvNum = 0;
    let board;
    let $boardHighlighting = $('#myBoard');
    const game = new Chess(data.fen);
    let squareClass = 'square-55d63'

    function removeHighlights () {
        $boardHighlighting.find('.' + squareClass)
          .removeClass('highlight-white')
        $boardHighlighting.find('.' + squareClass)
          .removeClass('highlight-black')
      }

    function onDragStart(source, piece, position, orientation) {
        // do not pick up pieces if the game is over
        if (game.game_over()) return false

        // only pick up pieces for the side to move
        if (!playing || (game.turn() === 'w' && (piece.search(/^b/) !== -1 || color === 'black')) ||
            (game.turn() === 'b' && (piece.search(/^w/) !== -1 || color === 'white')) || (color !== 'black' && color !== 'white')) {
            return false
        }
    }

    function onDrop(source, target) {
        // see if the move is legal
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });

        // illegal move
        if (move === null) return 'snapback';

        if (move.san != data.answer[mvNum]) {
            game.undo();
            endAudio.play();
            userHistory.push(false);
            wrong++;
            $('#wrong').show();
            setTimeout(() => {
                $('#wrong').hide();
            }, 200);
            loadPuzzle(puzzles, id + 1, userHistory, correct, wrong, puzzleEndDateTime, timerId);
            return 'snapback';
        }
        if (move.captured) captureAudio.play()
        else moveAudio.play()
    }

    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    function onSnapEnd() {
        board.position(game.fen())
        mvNum++;
        if (mvNum == data.answer.length) {
            confirmAudio.play();
            userHistory.push(true);
            correct++;
            $('#correct').show();
            setTimeout(() => {
                $('#correct').hide();
            }, 200);
            loadPuzzle(puzzles, id + 1, userHistory, correct, wrong, puzzleEndDateTime, timerId);
            return;
        }
        const mv = game.move(data.answer[mvNum]);
        board.position(game.fen());

        // Piece Highlighting for Computer's Move
        removeHighlights();
        $boardHighlighting.find('.square-' + mv.from).addClass('highlight-' + squares[mv.from])
        $boardHighlighting.find('.square-' + mv.to).addClass('highlight-' + squares[mv.to])

        if (mv.captured) captureAudio.play();
        else moveAudio.play();
        mvNum++;

    }
    const config = {
        draggable: true,
        position: data.fen,
        onDragStart,
        onDrop,
        onSnapEnd,
        orientation: data.color
    };
    board = Chessboard('myBoard', config)

    if (data.color === 'white') color = 'black';
    else color = 'white';

    // Play First Move
    const mv = game.move(startMove);
    board.position(game.fen())

    if (color === 'white') color = 'black';
    else color = 'white';

    // Piece Highlighting for first move
    removeHighlights();
    $boardHighlighting.find('.square-' + mv.from).addClass('highlight-' + squares[mv.from]);
    $boardHighlighting.find('.square-' + mv.to).addClass('highlight-' + squares[mv.to]);

    if (mv.captured) captureAudio.play()
    else moveAudio.play()

}