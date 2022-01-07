# PuzzleDash

Introducing PuzzleDash! A completely free alternative for playing Chess Puzzle Rush, a popular paid Chess.com feature where you are challenged to solve a series of chess puzzles with increasing difficulty in limited time.

Once over, you can also click on any puzzle from your last PuzzleDash, and analyze it through Lichess.

**It is live at: [https://puzzledash.herokuapp.com/](https://puzzledash.herokuapp.com/)**

![PuzzleDash Demo Gif](https://i.imgur.com/z75UmzX.gif)

[Demonstration Video](https://www.youtube.com/watch?v=hKUGLylu1pY)

### [Changelog](https://github.com/sggts04/PuzzleDash/blob/master/CHANGELOG.md)

### Frontend Tech Stack/Libraries Used

* HTML/CSS/JS
* jQuery
* chessjs
* chessboardjs
* Socket.io

### Backend Tech Stack/Libraries Used

* Node.js
* Express.js
* Socket.io
* MongoDB

### Local Setup

```bash
$ git clone https://github.com/sggts04/PuzzleDash
$ cd PuzzleDash
$ npm install
$ echo "MONGO=mongodb+srv://xxx" > .env
$ npm start
```
Replace `mongodb+srv://xxx` with your MongoDB URL.

And then navigate to `localhost:3000`.