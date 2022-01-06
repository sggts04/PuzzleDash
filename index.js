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

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: "You have been rate limited."
});

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
//app.use(limiter);
app.use(cors());
app.use(express.static('static'));

app.use('/', router);
setupWs(server);

server.listen(port, () => {
    console.log("PuzzleDash Server started.");
})