this is a nodejs application which listens for commands from
video SDK project

below illustrates the flow
hosted web video sdk 1:1 chat ---> video SDK ---> web-serial (this application) ---> serial commands to claw machine mother board

the communication from this appication to claw machine motherboar is via gcode

here are some web services which are exposed to (video SDK)
- up
- down
- left
- right
- start
  - this should start playing music
    - there should be a list of music, good selection too
- catch
  - this will have a fairly more complex gcode, as it will need to
    - drop the claw
    - retrieve back the claw
    - move back to origin
    - open the claw
    - drop the toy
    - stop music?
  