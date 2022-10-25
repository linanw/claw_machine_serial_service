/*
 Node.js Serial Port Data to Web
 From: earl@microcontrollerelectronics.com
*/

var serport = "";
var rate = 115200;
var serports = [];
var fs = require('fs');
const { syncBuiltinESMExports } = require('module');
const { send, stdout } = require('process');
const { SerialPort } = require('serialport');
const { spawn } = require("child_process");
var music_player;

const startMusic = () => {
  music_player = spawn("aplay", ["--device","plughw:CARD=Device,DEV=0","/home/zoomda/claw.wav"], {
    detached: true,
    stdin: 'ignore'
  })
  music_player.stdout.on('data', (data)=>{
    console.log(`stdout: ${data}`);
    return;
  });
  music_player.stderr.on('data', (data)=>{
      console.log(`stderr: ${data}`);
      return;
  });
};

const stopMusic = () => {
  if(music_player)music_player.kill();
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

process.on('exit', ()=>{
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

app.get('/stop', function (req, res) {
  //TODO: to be implemented
  console.log("stop");
  serport.write("!");
  res.end();
});

app.get('/up', function (req, res) {
  //TODO: to be implemented
  console.log("up");
  sendGrblCmd("$J=G91 G21 Y10 F8000");
  res.end();
});
app.get('/down', function (req, res) {
  //TODO: to be implemented
  console.log("down");
  sendGrblCmd("$J=G91 G21 Y-10 F8000");
  res.end();
});
app.get('/left', function (req, res) {
  //TODO: to be implemented
  console.log("left");
  sendGrblCmd("$J=G91 G21 X-10 F8000");
  res.end();
});
app.get('/right', function (req, res) {
  //TODO: to be implemented
  console.log("right");
  sendGrblCmd("$J=G91 G21 X+10 F8000");
  res.end();
});
app.get('/start', async function (req, res) {
  sendGrblCmd("M11");
  sendGrblCmd("M7");
  startMusic();
  sendGrblCmd("$H");
  sendGrblCmd("$J=G91 G21 X200 Y100 F8000")
  console.log("start");
  res.end();
});
app.get('/catch', async function (req, res) {
  console.log("catch...");
  sendGrblCmd("$J=G91 G21 Z-175 F8000");
  await sleep(3000);
  sendGrblCmd("M8");
  sendGrblCmd("$H");
  sendGrblCmd("M11");
  await sleep(8000);
  stopMusic();
  res.end();
});

const sleep = (ms) =>
{
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
const sendGrblCmd = (cmd) =>{
  // serport.write("$X\n");
  serport.write(cmd + "\n");
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
    //dreamtcs to uncomment this in production
    
    process.exit();
  }
  //dreamtcs to uncomment this in production

  serport = new SerialPort({
    path: serports[0], baudRate: rate, autoOpen: true,
  })
  serport.on('open', async function(){
    console.log("port opened");
    await sleep(1000)
    sendGrblCmd("$X"); // unlock motor
    sendGrblCmd("M7"); // turn LED light on
  })
  serport.on('error', function (err) {
    console.log('Error: ', err.message)
  })
  serport.on('data', function (data) {
    console.log(data.toString('utf8'));
    io.emit('data', { data: data.toString('utf8') });
  })
  serport.on('close', function () {
    console.log("port closed");
    io.emit('close');
  })
});