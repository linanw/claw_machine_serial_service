/*
 Node Process for Serial Connection to an Arduino
 Data  Sent and Received is displayed on the console
 From: earl@microcontrollerelectronics.com
*/

const {SerialPort} = require('serialport')
var stdin        = process.openStdin();
const port       = new SerialPort({path:'/dev/ttyUSB0',   baudRate: 115200 })

port.on('error', function(err)  { console.log('Error: ', err.message)} )
port.on('data', function (data) { console.log('', data.toString('utf8')) })

stdin.addListener("data", function(data) {
  console.log(data.toString().trim());
  port.write(data);
});