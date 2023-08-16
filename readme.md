this is a branch for small toy claw machine which is controlled from an arduino uno

to select the sound devices, use `aplay --list-pcms` and change the string "plughw.......DEV=0" accordingly in index.js
music_player = spawn("aplay", ["--device", "plughw:CARD=Device,DEV=0", music_file]

this is a nodejs application which listens for commands from
video SDK project

below illustrates the flow
hosted web video sdk 1:1 chat ---> video SDK ---> web-serial (this application) ---> serial commands to claw machine mother board

the communication from this appication to claw machine motherboar is via gcode

here are some web services which are exposed to (video SDK) within serial_port_web.js
- app.get('/up'......
- app.get('/down'....
- app.get('/left'....
- app.get('/right'....
- app.get('/start'....
  - this should start playing music
    - there should be a list of music, good selection too
- app.get('/catch'....
  - this will have a fairly more complex gcode, as it will need to
    - drop the claw
    - retrieve back the claw
    - move back to origin
    - open the claw
    - drop the toy
    - stop music?
  

  need to install node on a fresh machine
  node12?

sudo apt update
sudo apt -y upgrade
sudo apt update
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt -y install nodejs
sudo apt -y install gcc g++ make
