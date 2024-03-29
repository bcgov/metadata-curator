var websocket = {};
var config = require('config');
var buildProfile = require('./auth/auth').buildProfile;
var jwt = require('jsonwebtoken');
const WebSocket = require('ws');

websocket.connections = {};
websocket.server = null;

websocket.init = function(){
    var self = this;

    this.server = new WebSocket.Server({
        port: 3030,
        perMessageDeflate: false,
        verifyClient: function(info, cb){
            var token = info.req.headers['sec-websocket-protocol'];
            if (!token){
                cb(false, 401, "Unauthorized")
            }else{
                jwt.verify(token, config.get("jwtSecret"), function(err, decoded){
                    if (err){
                        cb(false, 401, "Unauthorized");
                    }else{
                        var user = decoded;
                        if (decoded.email){
                            user.id = decoded.email
                        }
                        info.req.user = user;
                        cb(true);
                    }
                })
            }
        }
    });

    function heartbeat() {
        this.isAlive = true;
    }

    this.server.on('connection', function connection(ws, req) {
        var logger = require('npmlog');
        logger.debug("Websocket connection opened for ", req.user.id);
        ws.isAlive = true;
        ws.on('pong', heartbeat);
        ws.on('close', function close() {
            let message = {left: req.user.id};
            if (!self.locations){
                self.locations = {};
            }
            let keys = Object.keys(self.locations);
            for (let i=0; i<keys.length; i++){
                if (self.locations[keys[i]] && self.locations[keys[i]].type && self.locations[req.user.id] && self.locations[req.user.id].type && self.locations[req.user.id].id){
                    if ( (keys[i] !== req.user.id) && (self.locations[keys[i]].type === self.locations[req.user.id].type) ){
                        if (self.locations[keys[i]].id === self.locations[req.user.id].id){
                            self.connections[keys[i]].send(JSON.stringify(message));
                        }
                    }
                }
            }
            delete self.connections[req.user.id];
            delete self.locations[req.user.id];
        });

        ws.on('message', function message(data){
            try{
                let dataObj = JSON.parse(data.toString());
                if (self && self.locations){
                    let keys = Object.keys(self.locations);

                    if (dataObj.type === 'none'){
                        let mes = {left: req.user.id};
                        for (let i=0; i<keys.length; i++){
                            if (self.locations[keys[i]] && self.locations[keys[i]].type && self.locations[req.user.id] && self.locations[req.user.id].type){
                                if ( (keys[i] !== req.user.id) && (self.locations[keys[i]].type === self.locations[req.user.id].type) ){
                                    if (self.locations[keys[i]].id === self.locations[req.user.id].id){
                                        if (self.locations[keys[i]].type !== 'none'){ //catch the left when on nothing and closes browser
                                            self.connections[keys[i]].send(JSON.stringify(mes));
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (!self.locations){
                        self.locations = {};
                    }
                    self.locations[req.user.id] = JSON.parse(JSON.stringify(dataObj));
                    
                    let m = []
                    if (dataObj.id){
                        for (let i=0; i<keys.length; i++){
                            if ( (self.locations[keys[i]].type === dataObj.type) && (keys[i] !== req.user.id) ){
                                if (self.locations[keys[i]].id === dataObj.id){
                                    m.push(keys[i]);
                                    self.connections[keys[i]].send(JSON.stringify({arrived: req.user.id}))
                                }
                            }
                        }
                        ws.send(JSON.stringify({users: m}));
                    }
                }
            }catch(e){
                if (!self.locations){
                    self.locations = {};
                }
                console.log("E", e, self.locations);
                self.locations[req.user.id] = {type: "none"}
            }
            
        });
        ws.user = req.user;
        self.connections[req.user.id] = ws;
    });


//terminate stale websockets
    const interval = setInterval(function ping() {
        self.server.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping(function(){});
        });
    }, 30000);
};

websocket.getConnections = function(){
    return this.connections;
};

websocket.updateClient = function(message, id){
    this.connections[id].send(message);
};

websocket.isOpen = function (client) {
    return (client.readyState === WebSocket.OPEN);
}

module.exports = websocket;