var WebSocket = require('ws');

var Transport = function(app, server, port, protocol) {
	this.app = app;
	if (!protocol) protocol = "wss";
	this.ws = null;
	this.protocol = protocol;
	this.server = server; //"ws://localhost:3001";
	this.port = port;
};

Transport.prototype.isConnected = function() {
	return this.ws.readyState === WebSocket.OPEN;
}

Transport.prototype.isSecure = function() {
	return (this.protocol === "wss");
};

Transport.prototype.isReliable = function() {
	return true;
};

Transport.prototype.connect = function() {
	//try {
		var server = this.server;
		var self = this;

		if (this.port !== "") server += ":" + this.port;

		this.ws = new WebSocket(this.protocol + "://" + server + "/ws", "sip");
		//console.log("[CONNECT PHONE]");
		this.log({
			event: 'transport',
			text: 'transport ws connect',
			error: null,
			name: self.app.authinfo.user,
			state: self.app.state,
		});

		this.ws.onopen = function() {
			//console.log("[OPENED PHONE]", self.app.authinfo.user);
			self.log({
				event: 'connected',
				text: 'transport ws open',
				error: null,
				name: self.app.authinfo.user,
				state: self.app.state,
			});

			//self.app.register();

			// var remote = '<sip:'+ "bob" + '@' + _realm + '>';
			// this.app.call(remote);
		};

		this.ws.onclose = function() {
			//console.log("[CLOSED PHONE]");
			self.log({
				event: 'disconnected',
				text: 'transport ws close',
				error: null,
				name: self.app.authinfo.user,
				state: self.app.state,
			});
		};

		var stack = this.app.stack;

		var _orig = this.ws;

		this.ws.onmessage = function(msg) {
			// NOTE: instead of using origin as in browser use this.ws._socket
			stack.onData(msg.data, Reticulum.Parser.parseAddress(_orig._socket.remoteAddress + ":" + _orig._socket.remotePort).uri.host);
		};

		this.ws.onerror = function(error) {
			// console.log("/\\/\\/\\/\\/\\/\\/\\/\\/\\");
			// console.log("[ERROR PHONE]", error);
			// console.log("\\/\\/\\/\\/\\/\\/\\/\\/\\/");
			console.log("[Transport Error]", self.app.authinfo.user, JSON.stringify(error));
			self.log({
				event: 'error',
				text: 'transport ws error',
				error: error,
				name: self.app.authinfo.user,
				state: self.app.state,
			});
		};

	//} catch(exception) {
		//addMessage("Error: " + exception);
	//}
};

Transport.prototype.listen = function(callback) {
	this.ws.onmessage = callback;
};

Transport.prototype.send = function(data) {
	try {
		this.ws.send(data);
	} catch(exception) {
		// console.log("SEND ERROR", exception);
		this.log({
			event: 'error',
			text: 'transport send error',
			error: exception,
			name: this.app.authinfo.user,
			state: this.app.state,
		});
	}
};

Transport.prototype.disconnect = function() {
	// console.log("[DISCONNECT PHONE]");
	this.ws.close();
};

Transport.prototype.log = function(data) {
	//console.log("[TRANSPORT]", data);
};


module.exports = Transport;
