const rate = 9600;
const x_max = 260
const y_max = 150
const z_max = 210;
const music_file = '/var/claw-machine/claw.wav';
const MINUTES_TO_REST = 2;

var serport = "";
var serports = [];
var fs = require('fs');
const { syncBuiltinESMExports } = require('module');
const { send, stdout, exit } = require('process');
const { SerialPort } = require('serialport');
const { spawn } = require("child_process");
var music_player;
var grblResponse = 0;

const startMusic = () => {
  music_player = spawn("aplay", ["--device", "plughw:CARD=Device,DEV=0", music_file], {
    detached: true,
    stdin: 'ignore'
  })
  music_player.stdout.on('data', (data) => {
    console.log(`${data}`);
    return;
  });
  music_player.stderr.on('data', (data) => {
    console.log(`${data}`);
    return;
  });
};

const stopMusic = () => {
  if (music_player) music_player.kill(2);
};

const cleanAPlay = () => {
  const kill_all_aplay = spawn('killall aplay');
  kill_all_aplay.on('error', (data) => {
    console.log(`error: ${data}`);
  });
  console.log('killall aplay');
};

var express = require('express'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  port = 8888;

process.on('exit', () => {
  console.log('process exit')
});

server.listen(port, () => console.log('Server Listening on port' + port))

app.get('/', function (req, res) {
  fs.readFile(__dirname + '/index.html', 'utf8', function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200, { 'Content-Type': "text/html; charset=utf-8" });
    var result = data.replace("Node Serial Connection", "Node Serial Connection " + serports[0]);
    res.end(result);
  });
});
app.get('/open', function (req, res) {
  serport.open();
  res.end();
});
app.get('/close', function (req, res) {
  serport.close();
  res.end();
});
app.get('/home', function (req, res) {
  home();
  res.end();
});
app.get('/center', function (req, res) {
  center();
  res.end();
});
app.get('/stop', function (req, res) {
  console.log("stop");
  serport.write("!");
  res.end();
});
app.get('/up', async (req, res) => {
  console.log("up");
    serport.write("up");
  res.end();
});
app.get('/down', async (req, res) => {
  console.log("down");
   serport.write("down");
  res.end();
});
app.get('/left', async (req, res) => {
  console.log("left");
  serport.write("left");
  res.end();
});
app.get('/right', async (req, res) => {
  console.log("right");
  serport.write("right");
  res.end();
});
app.get('/lighton', async (req, res) => {
  lightOn();
  res.end();
});
app.get('/lightoff', async (req, res) => {
  lightOff();
  res.end();
});
app.get('/clawopen', async (req, res) => {
  clawOpen();
  res.end();
});
app.get('/clawClose', async (req, res) => {
  clawClose();
  res.end();
});
app.get('/start', async (req, res) => {
  console.log("start");

  //await clawOpen();
  //await lightOn();
  startMusic();
  serport.write("start");
  //await home()
  //await center();
  res.end();
});
app.get('/catch', async function (req, res) {
  console.log("catch...");
  serport.write("catch");
  //await clawDown();
  //await clawClose();
  //await home();
  //await clawOpen();
  stopMusic();
  res.end();
});

app.get('/rest', async function (req, res) {
  await rest();
  res.end();
});

const clawOpen = async () => await sendGrblCmd("M11");

const clawClose = async () => await sendGrblCmd("M8");

const lightOn = async () => await sendGrblCmd("M7");

const lightOff = async () => await sendGrblCmd("M10");

const zUnhold = async () => await sendGrblCmd("M12");

const clawDown = async () => {
  await sendGrblCmd("$J=G90 G21 Z-" + z_max.toString() + " F8000");
}

const rest = async () => {
  if (countBeforeIdle >= 0) {
    console.log("rest...");
    console.log("rest:home");
    await home();
    //console.log("rest:center");
    // await center();
  }
  console.log("rest:clawOpen");
  await clawOpen();
  console.log("rest:clawDown");
  await clawDown();
  console.log("rest:Z Unhold");
  await zUnhold();
  console.log("rest:lightOff");
  await lightOff();
  console.log("rest:stopMusic");
  stopMusic();
  stopIdleCounter();
}

const home = async () => {
  await sendGrblCmd("$H");
  await sendGrblCmd("G10 P0 L20 X0 Y0 Z0");
  resetIdleCounter()
}

const center = async () => {
  await sendGrblCmd(
    "$J=G90 G21 X" + (x_max / 2).toString() +
    " Y" + (y_max / 2).toString() + " F8000");
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const sendGrblCmd = async (cmd) => {
  while (grblResponse == -1) await sleep(50);
  while (true) {
    grblResponse = -1;
    serport.write(cmd + "\n");
    while (grblResponse == -1) await sleep(50);
    if (grblResponse != 9) break; // 9 means joging status is blocking the command
    await sleep(500); // wait for 500 ms then retry.
    console.log('retry...');
  }
  return grblResponse;

}

io.on('connection', onConnection);

var connectedSocket = null;
function onConnection(socket) {
  connectedSocket = socket;
  connectedSocket.on('send', function (data) {
    console.log(data);
    serport.write(data.Data);
  });
}

if (process.argv.length > 2) {
  console.log(process.argv);
  serports.push(process.argv[2]);
  if (process.argv.length > 3) rate = parseInt(process.argv[3]);
}

SerialPort.list().then(ports => {
  ports.forEach(function (port) {
    if (typeof port['manufacturer'] !== 'undefined') {
      serports.push(port.path);
      console.log(port);
    }
  });
  if (serports.length == 0) {
    console.log("No serial ports found!");
    process.exit();
  }
  serport = new SerialPort({
    path: serports[0], baudRate: rate, autoOpen: true,
  });
  serport.on('open', async function () {
    console.log("port opened");
    //await sleep(1000)
    //await sendGrblCmd("$X"); // unlock motor
    //lightOn();
  });
  serport.on('error', function (err) {
    console.log('Error: ', err.message)
  });
  serport.on('data', function (data) {
    var message = data.toString('utf8').trimStart('\r\n');
    process.stdout.write(message);
    var lines = message.split('\r\n');
    if (lines.indexOf('ok') > -1) grblResponse = 0;
    else if ((lines.filter(l => l.startsWith('error:'))).length > 0) {
      grblResponse = parseInt((lines.filter(l => l.startsWith('error:')))[0].split(':')[1]);
    }
    io.emit('data', { data: message });
  })
  serport.on('close', function () {
    console.log("port closed");
    io.emit('close');
  })
});

// process.on('SIGINT', async () => {
//   await rest();
//   exit(0);
// });

process.on('SIGTERM', async () => {
  await rest();
  exit(0);
});

const resetIdleCounter = () => countBeforeIdle = 60 * MINUTES_TO_REST / 10;
const stopIdleCounter = () => countBeforeIdle = -1;

resetIdleCounter();
setInterval(async () => {
  // countdown and rest claw
  console.log("countBeforeIdle: " + countBeforeIdle.toString());
  if (countBeforeIdle == 0) {
    await rest();
  }
  if (countBeforeIdle > 0) countBeforeIdle--;
}, 10000); // trigger every 10 sec

