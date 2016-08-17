var Phone = require('reticulum');

var Cycle = require('./cycle');
var Transport = require('./transport');

var Worker = function() {
	this.server = undefined;
	this.port = undefined;
	this.protocol = undefined;
	this.realm = undefined;

	this.pairs = [];

}

Worker.prototype.init = function (server, port, protocol, realm, work) {
	this.server = server;
	this.port = port;
	this.protocol = protocol;
	this.realm = realm;

	this.work = work;

	//console.log("Worker init:", server, port, protocol, realm);
};

Worker.prototype.create = function () {
	// Create A and B phone pairs
	for (var i = this.work.min; i <= this.work.max; i++) {
		var local = new Phone(false, false, {
			user: "ana_" + i,
			password: "apass",
			realm: this.realm,
			nc: 0,
		}, this.server, this.port, this.protocol);

		var remote = new Phone(false, false, {
			user: "bob_" + i,
			password: "bpass",
			realm: this.realm,
			nc: 0,
		}, this.server, this.port, this.protocol);

		// Setup local handlers

		local._setState = setWebphoneState;
		local._setRegState = setWebphoneRegState;
		local.setStateFromTransaction = setWebphoneStateFromTransaction;

		var local_transport = new Transport(local, this.server, this.port, this.protocol);

		local_transport.log = logTransport;

		local.transport = local_transport;
		local.stack.transport = local_transport;

		logTransport({
			event: 'created',
			text: 'created A (local) phone',
			error: null,
			name: local.authinfo.user,
			state: local.state,
		});

		// Setup remote handlers

		remote._setState = setWebphoneState;
		remote._setRegState = setWebphoneRegState;
		remote.setStateFromTransaction = setWebphoneStateFromTransaction;

		var remote_transport = new Transport(remote, this.server, this.port, this.protocol);

		remote_transport.log = logTransport;

		remote.transport = remote_transport;
		remote.stack.transport = remote_transport;

		// NOTE: enable Autoanswer and Autohangup for remote phones
		remote.autorespond = true;
		remote.autohangup = true;

		logTransport({
			event: 'created',
			text: 'created B (remote) phone',
			error: null,
			name: remote.authinfo.user,
			state: remote.state,
		});

		this.pairs.push({
			local: local,
			remote: remote,
		});
	}
}

Worker.prototype.connect = function () {
	// Connect phone pairs
	for (var i = 0, pair; i < this.pairs.lenght, pair = this.pairs[i]; i++) {
		//console.log(pair);
		pair.local.transport.connect();
		pair.remote.transport.connect();
	}
};

Worker.prototype.register = function () {
	// TODO: check local and remote for IDLE status
	// Register phone pairs
	for (var i = 0, pair; i < this.pairs.lenght, pair = this.pairs[i]; i++) {
		//console.log(pair.local.transport.isConnected(), pair.remote.transport.isConnected());
		if (pair.local.transport.isConnected() && pair.remote.transport.isConnected()) {
			pair.local.register();
			pair.remote.register();
		}
	}
};

Worker.prototype.call = function (index) {
	var pair = this.pairs[index];
	// TODO: check local and remote for IDLE status
	for (var i = 0, pair; i < this.pairs.lenght, pair = this.pairs[i]; i++) {
		pair.local.call(pair.remote._ua.local.toString());
	}
};

/// Custom Handlers

function setWebphoneStateFromTransaction(type, oldstate, state, method, transaction) {
	console.log(method, "request", type, "transaction state from:", oldstate, ", to:", state)

	if (type === "INV_SERVER" && oldstate === "PROCEEDING" && state === "COMPLETED") {
		this._ua.setState("ACTIVE");
	} else if (type === "INV_SERVER" && oldstate === "COMPLETED" && state === "CONFIRMED" && method === "INVITE") {
		this._ua.setState("IDLE");
	} else if (type === "INV_CLIENT" && oldstate === "COMPLETED" && state === "TERMINATED" && method === "INVITE") {
		this._ua.setState("IDLE");
	} else if (this.state === "TERMINATING" && type === "NON_CLIENT" && method === "BYE" && oldstate === "TRYING" && state === "COMPLETED") {
		this._ua.setState("IDLE");
	}

	if (state === "TERMINATED") {
		broadcast("transaction", "DONE", this.authinfo.user, transaction);//getHistory(this.stack.stores.transactions));

		// console.log();
		// console.log(type, "transaction", state);
		// console.log();
	}
};

function setWebphoneState(state) {
	console.log("[P state] from:", this.state, ", to:", state)
	//if (EXISTS(this._ua)) console.log("[UA state]", this._ua.state)
	if (state === "IDLE") {
		broadcast("transactions", "AVAILABLE", this.authinfo.user, getHistory(this.stack.stores.transactions));
	} else if (state === "PROCEEDING") {
		broadcast("transactions", "RINGING", this.authinfo.user, getHistory(this.stack.stores.transactions));
	} else if (state === "PREPARING") {
		broadcast("transactions", "PREPARING CALL", this.authinfo.user, getHistory(this.stack.stores.transactions));
	} else if (state === "INVITING") {
		broadcast("transactions", "CALLING", this.authinfo.user, getHistory(this.stack.stores.transactions));
	} else if (state === "ACTIVE") {
		broadcast("transactions", "ON CALL", this.authinfo.user, getHistory(this.stack.stores.transactions));
	} else if (state === "ACCEPTED") {
		broadcast("transactions", "ON CALL", this.authinfo.user, getHistory(this.stack.stores.transactions));
	} else if (state === "CONFIRMED") {
	} else if (state === "COMPLETED") {
	} else if (state === "TERMINATING") {
		if (this.state == "ACTIVE") {
			this._ua.setState("IDLE");
			return;
		}
	} else if (state === "TERMINATED") {
	} else {
		//broadcast("transactions", "UNAVAILABLE", this.authinfo.user, getHistory(this.stack.stores.transactions));
	}

	if (this.regState === "REGISTERED") {
		;
	} else if (this.regState === "REGISTERING") {
		;
	} else if (this.regState === "UNREGISTERING") {
		;
	} else if (this.regState === "UNREGISTERED") {
		//broadcast("transactions", "UNREGISTERED", this.authinfo.user, getHistory(this.stack.stores.transactions));
	}

	this.state = state;
};

function setWebphoneRegState(state) {
	this.regState = state;

	if (state === "REGISTERED") {
		broadcast("registered", state, this.authinfo.user, this.stack.stores.requests);
		//broadcast("transactions", state, this.authinfo.user, getHistory(this.stack.stores.transactions));
	}
};

function broadcast(command, state, name, data) {
	// if (state !== "DONE") return;

	// wss.clients.forEach(function each(client) {
	// 	client.send(JSON.stringify({ event: command, data: { phone: name, state: state, msg: JSON.decycle(data)} }));
	// });

	process.send({
		event: command,
		data: {
			phone: name,
			state: state,
			msg: JSON.decycle(data),
		},
		pid: process.pid,
	});
};

function getHistory(transactions) {
	var history = [];

	transactions.values().forEach(function(val) {
		// val.request.responses.forEach(function(resp){
		// 	if (resp.statusCode === 200) {console.log(); console.log(resp.statusCode); console.log();}
		// });

		var code = 0;

		if (val.request.responses && val.request.responses.length > 0) {
			code = val.request.responses[0].statusCode;
		}

		if (val.state === "TERMINATED") {
			history.push({ id: val.id, type: val.type, hist: val.history, code: code });
		}
	});

	return history;
}

function logTransport(data) {
	broadcast(data.event, data.state, data.name, data);
}

module.exports = Worker;
