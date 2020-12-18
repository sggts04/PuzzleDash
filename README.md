# PuzzleDash Frontend

Introducing PuzzleDash! A completely free alternative for playing Chess Puzzle Rush, a popular paid Chesscom feature where you are challenged to solve a series of chess puzzles with increasing difficulty in limited time.

**It is live at: [https://shreyasgupta.in/PuzzleDash/](https://shreyasgupta.in/PuzzleDash/)**

![PuzzleDash Demo Gif](https://i.imgur.com/z75UmzX.gif)

[Demonstration Video](https://www.youtube.com/watch?v=hKUGLylu1pY)

### Frontend Tech Stack/Libraries Used

* HTML/CSS/JS
* jQuery
* chessjs for Move Validation
* chessboardjs for Displaying Chessboard

### Local Setup

```bash
$ git clone https://github.com/sggts04/PuzzleDash
$ cd PuzzleDash
$ python -m http.server
```
and then navigate to `localhost:8000`.
You can use any preferred way to host the files on a local server, I use python's `http.server` module to quickly setup a local server for current folder's files.

### Backend API

Backend API is hosted at `https://puzzle-dash.herokuapp.com` and can be queried at `https://puzzle-dash.herokuapp.com/puzzles/50` where `50` is the number of puzzles you want, you can set this number anywhere between `1-100`.

The API returns a list of puzzles in ascending order of rating.