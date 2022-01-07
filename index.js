const http = require('http');
const express = require('express');
const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const router = require('./routes/router.js');
const setupWs = require('./helpers/ws.js');
const mongoose = require('mongoose');
require('dotenv').config();

/*
// Rate Limiter Setup
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "You have been rate limited."
});
app.use(limiter);
*/

mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db = mongoose.connection;
db.once("open", () => {
    console.log("Connected to MongoDB");
});
db.on("error", (err) => {
    console.log(err);
});

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('static'));

app.use('/', router);
setupWs(server);

server.listen(port, () => {
    console.log("PuzzleDash Server started.");
})