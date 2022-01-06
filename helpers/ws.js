const { Server } = require("socket.io");

function setupWs(server) {
    const io = new Server(server);
    console.log("Socket.io listening.");
    
    io.on('connection', (socket) => {
        console.log('a user connected');
    
        socket.on('start', (msg) => {
            console.log(msg);
        });
    });
}

module.exports = setupWs
