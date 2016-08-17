# Testing procedure for Reticulum

Araneola (lat. dim. f.) - little spider

**Disclaimer:** This application was developed to help me with testing of the [Reticulum](https://github.com/GrimmKull/Reticulum) project. It is not fully automated and needs a lot of oversight and careful timing. Use at your own risk.

## Installation

Clone repository:

```bash
git clone https://github.com/GrimmKull/araneola.git
```

Enter repository directory:

```bash
cd araneola
```

Install Node.js dependencies:

```bash
npm install
```

## Starting the application

To get the available command line options call:

```bash
node app.js --help
```

When testing a [Reticulum](https://github.com/GrimmKull/Reticulum) instance deployed to a server:

```bash
node app.js --number 1000 --server wss://reticulum.outbox.systems
```

When testing a [Reticulum](https://github.com/GrimmKull/Reticulum) instance deployed on a local Raspberry Pi:

```bash
node app.js --number 1000 --server wss://192.168.1.109:7000
```

The above examples will launch the testing application which will connect to the [Reticulum](https://github.com/GrimmKull/Reticulum) proxy defined by the `server` option and will attempt to make 1000 **concurrent** calls.

**NOTE:** Make sure that the [Reticulum](https://github.com/GrimmKull/Reticulum) proxy is running and that has enough users in the registrar database.

## Sending commands to the Araneola application

The testing application will serve its web interface locally using the default port 5010 (if not otherwise specified using the `port` cli option). To access the interface inside your Chrome web browser navigate to: https://$IP_ADDRESS:5010 `$IP_ADDRESS` is the address of your local machine.

The web interface will show several sections including a Phones section under the Requests tab. This section will show the

Open the Console panel in Chrome using the keyboard shortcuts. On Windows and Linux: **Ctrl + Shift + J**. On Mac: **Cmd + Option + J**.

The following commands need to be sent in sequence. To do that simply type them using the Console prompt and press Enter.

**Note:** Make sure that the `[OPENED]` indicator is displayed inside the Console. If this is not the case there is a problem with the WebSocket implementation and the interface failed to connect to it.

The state of testing phones is depicted by a colored square inside the Phones section of the interface. On start each square representing a phone is gray.

To spawn the phone pairs that will be used for the actual testing send the following command:

```javascript
create()
```

Once the corresponding phones are created their color will change to black.

Once all the phones turn black proceed with sending the next command to connect to the Reticulum proxy using WebSockets.

```javascript
connect()
```
Once the corresponding phones are connected their color will change to red.

If you are testing with a large number of phones, some might not change color to red. This is due to the fact that the system is not able to handle all the attempted concurrent connections. Before proceeding please wait a while to give the Reticulum proxy time to handle the requests. You can use the testing application cli to monitor the activity. If there is no activity for some time you may proceed with registering the connected phones by sending the command:

```javascript
register()
```

Only the phones that have connected each member of the pair will be registered. Once the corresponding phones are registered successfully their color will change to green.

If you are testing with a large number of phones, some might not change color to green. This is due to the fact that the system is not able to handle all the attempted concurrent registrations. Before proceeding please wait a while to give the Reticulum proxy time to handle the requests. You can use the testing application cli to monitor the activity. If there is no activity showing REGISTER transaction state change to TERMINATED, for some time, you may proceed with making the phone calls by sending the command:

```javascript
call()
```

**NOTE:** You need to monitor the INVITE Server transaction output in the test application cli. Once the output stops showing INVITE Server transaction changes to the TERMINTED state you can proceed with plotting the data. This is the current procedure until the transaction state tracker is implemented. **_Sorry._**

## Plotting the gathered data

To generate a final report and plot the gathered information call the following command:

```javascript
plotData()
```

## Potential issues

If for some reason no data was plotted for the BYE transactions this might be due to the fact that on systems with bad performance the BYE transaction response might take too long which will cause the transaction to timeout. In that cases we don't track the TERMINATED transaction state.

## Retriving plotted data for later use

The following code snippets will dump the tracked data as json. This output can than be copied to a file for later use or to generate static reports like those present in the reports folder (report.rpi1c4.6.html, report.rpi2c4.6.html, report.sc.8.html, report.sc.8.html ...).

### Phone states

```javascript
calcPhoneStates()
```

```javascript
a_states
```

```javascript
b_states
```

### Call duration statistics

```javascript
parseCallDuration()

JSON.stringify(calls)
```

```javascript
calcMeanSdVar(calls)
```

### Transaction state change and duration

```javascript
var t = [a_reg_401_reqs, a_reg_200_reqs, b_reg_401_reqs, b_reg_200_reqs, a_inv_reqs, b_inv_reqs, a_bye_reqs, b_bye_reqs];

for (var i = 0; i < t.length; i++)
   console.log(JSON.stringify(t[i]));
```


```javascript
var t = [a_reg_401_history, a_reg_200_history, b_reg_401_history, b_reg_200_history, a_inv_history, b_inv_history, a_bye_history, b_bye_history];

for (var i = 0; i < t.length; i++)
	console.log(JSON.stringify(t[i]));
```
