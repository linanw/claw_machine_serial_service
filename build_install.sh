git checkout claw_machine_serial
npm i
set -x
sudo mkdir -p /var/claw-machine
sudo cp claw.wav /var/claw-machine/claw.wav
sudo cp claw_machine_serial.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable claw_machine_serial.service
sudo systemctl start claw_machine_serial.service
