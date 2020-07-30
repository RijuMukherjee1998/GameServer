var http =require("http");
const websocketServer=require("websocket").server;
const { v4: uuidv4 } = require('uuid');
const httpServer=http.createServer();
httpServer.listen(9090,()=>console.log("Listening to port 9090"));

const clients = {};
const wsServer = new websocketServer({
    "httpServer":httpServer
})

wsServer.on("request",request=>{
    const connection =request.accept(null,request.origin);
    connection.on("open",()=> console.log("opened conn..."))
    connection.on("close",()=> console.log("closed conn..."))
    connection.on("message",message=>{
        //I have received a message
        const result=JSON.parse(message.utf8Data);
        console.log(result);
    })
    const clientId=uuidv4();
    clients[clientId]={
        "connection":connection
    }

    const payLoad={
        "method":"connect",
        "clientId":clientId
    }
    //send back the cleint connect
    connection.send(JSON.stringify(payLoad))
})


