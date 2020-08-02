var http = require("http");
const websocketServer = require("websocket").server;
const {v4: uuidv4} = require('uuid');
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening to port 9090"));

const colors = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Orange",
    "Purple"
];

const clients = {};
const games = {};
const state = {};
const wsServer = new websocketServer({"httpServer": httpServer})

wsServer.on("request", request => {
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened conn..."))
    connection.on("close", () => console.log("closed conn..."))
    connection.on("message", message => { // I have received a message
        const result = JSON.parse(message.utf8Data);
        // console.log(result);

        if (result.method === "create") {
            const clientId = result.clientId;
            const gameId = uuidv4();
            games[gameId] = {
                "id": gameId,
                "balls": 24,
                "clients": []
            }
            const payLoad = {
                "method": "create",
                "game": games[gameId]

            }
            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad))
        }

        if (result.method === "join") {
            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];
            if (game.clients.length > 6) 
                return;
            
            const color = colors[game.clients.length]
            game.clients.push({"clientId": clientId, "color": color})
            const payLoad = {
                "method": "join",
                "game": game

            }
            // loop through all clients and tell them who joined...
            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad));
            });


        }

        if (result.method === "play") {
            
            const ballId = result.ballId;
            const ballColor = result.color;
            const gameId = result.gameId;
            const game = games[gameId]; 
            state[ballId] =  {
                "ballId":ballId,
                "ballColor":ballColor
            };
            const payLoad = {
                "method":"update",
                "states":state
            }
            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad));
            });

        }

    })
    const clientId = uuidv4();

    clients[clientId] = {
        "connection": connection
    }
    const keys = Object.keys(clients);
    console.log(keys);

    const payLoad = {
        "method": "connect",
        "clientId": clientId
    }
    // send back the cleint connect
    connection.send(JSON.stringify(payLoad))
})
