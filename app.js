var cluster = require('cluster');
// var http = require('http');
var cli = require('commander');
var url = require('url');
var WebSocket = require('ws');

var Worker = require('./worker')

// WebPhone Proxy Configuration
var _protocol = 'wss';
var _server = '10.1.80.105'; //'10.1.80.105'
var _port = '7000';
var _realm = 'reticulum';
var _localPort = 5010;
var nMaxWorkers = 6;


if (cluster.isMaster) {
	cli
		.option('-s, --server <server>', 'Proxy server to use for testing')
		.option('-r, --realm <realm>', 'Realm of proxy server for testing')
		.option('-p, --port <port>', 'Local port for test web ui')
		.option('-n, --number <number>', 'Number of jobs to run')
		.parse(process.argv);

	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

	var proxy = {
		protocol: undefined,
		hotname: undefined,
		port: undefined,
	};

	if (cli.server) {
		proxy = url.parse(cli.server);
		proxy.protocol = proxy.protocol.replace(':','');
	}

	_protocol = proxy.protocol || 'wss';
	_server = proxy.hostname || '10.1.80.105';
	_port = proxy.port || '7000';
	_realm = cli.realm || 'reticulum';

	_localPort = cli.port || 5010;

	const nCPUs = require('os').cpus().length;

	var nJobs = cli.number || 1;

	//console.log(_protocol, _server, _port, _realm, nJobs);
	//console.log(nCPUs);

	if (nMaxWorkers > nCPUs) {
		nMaxWorkers = nCPUs;
	}

	if (nMaxWorkers > nJobs) {
		nMaxWorkers = nJobs;
	}

	var WebSocketServer = WebSocket.Server;
	var wss = new WebSocketServer({ port: _localPort });

    for (var i = 0; i < nMaxWorkers; i++) {
        cluster.fork();
    }

	wss.on('connection', function connection(ws) {
		ws.on('message', function incoming(data) {
			//console.log('received: %s', data);

			var message = JSON.parse(data).command;

			if (message === 'jobs') {
				wss.clients.forEach(function each(client) {
					client.send(JSON.stringify({
						event: 'jobs',
						data: nJobs,
					}));
				});
			} else if (message === 'create') {
				// // Send Phone Create Command with array of users
				for(var wid in cluster.workers) {
			        cluster.workers[wid].send({
			            text: 'create',
			            from: 'master'
			        });
			    }
			} else if (message === 'connect') {
				for(var wid in cluster.workers) {
			        cluster.workers[wid].send({
			            text: 'connect',
			            from: 'master'
			        });
			    }
			} else if (message === 'register') {
				for(var wid in cluster.workers) {
					cluster.workers[wid].send({
						text: 'register',
						from: 'master'
					});
				}
			} else if (message === 'call') {
				for(var wid in cluster.workers) {
					cluster.workers[wid].send({
						text: 'call',
						from: 'master'
					});
				}
			}
		});
	});

	cluster.on('online', function(worker) {
        console.log('Worker ' + worker.id + ", " + worker.process.pid + ' is online');

		worker.on('message', function(message) {
			// If message info just print to Console
		    //console.log('Message from worker', message);

			// EVENT EXAMPLE
			//{
			//	event: command,
			// 	data: {
			// 		phone: name,
			// 		state: state,
			// 		msg: JSON.decycle(data),
			// 	},
			//	pid: process.pid,
			//}

			if (message.event === 'created') {
			} else if (message.event === 'connected') {
			} else if (message.event === 'registered') {

			} else if (message.event === 'transactions') {}
			// If event Created
			// If event Registered
			// If event Answered

			// If event Error


			wss.clients.forEach(function each(client) {
				client.send(JSON.stringify(message));
			});

		});

		worker.send({
			type: 'log',
			text: 'Welcome from the master',
		});

    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });

	// Assign work to Workers
	var work = assignJobs(nJobs, nMaxWorkers);

	var counter = 0;

	//console.log(work);

	for(wid in cluster.workers) {
        cluster.workers[wid].send({
            text: 'init',
            from: 'master',
			server: _server,
			port: _port,
			protocol: _protocol,
			realm: _realm,
			work: work[counter],
        });

		counter++;
    }

	// // Send Phone Create Command with array of users
	// for(wid in cluster.workers) {
    //     cluster.workers[wid].send({
    //         text: 'create',
    //         from: 'master'
    //     });
    // }

} else {
	var wrkr = new Worker();

	process.on('message', function(message) {
	    //console.log('Message from master:', message);

		if (message.text === 'Welcome from the master') {
			process.send('Thank you from worker with id: ' + process.pid);
		} else if (message.text === 'init') {
			//console.log('Create in worker');
			wrkr.init(message.server, message.port, message.protocol, message.realm, message.work);
		} else if (message.text === 'create') {
			//console.log('Create in worker');
			wrkr.create();
		} else if (message.text === 'connect') {
			//console.log('Connect in worker');
			wrkr.connect();
		} else if (message.text === 'register') {
			//console.log('Register in worker');
			wrkr.register();
		}else if (message.text === 'call') {
			//console.log('Call in worker');
			wrkr.call();
		}
	});
}

function assignJobs(jobs, workers) {
    var maxperworker = Math.ceil(jobs / workers);

    var total = jobs;

    var work = [];

    for (var i = 0; i < workers; i++) {
        min = i * maxperworker;

        max = (i + 1) * maxperworker - 1;

        if (max > jobs) max = jobs - 1;

        work.push({
            min: min,
            max: max
        });
    }

    return work;
}
