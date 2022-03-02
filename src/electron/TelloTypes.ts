//SETTINGS TYPE//
export type TelloSettings = {
   telloIP: '192.168.10.1'| string      //IP of the Tello Device
   cmdPort: 8889 | number,     //port for sending commands
   statePort: 8890 | number,   //port for receiving sdk flight state listening
   streamPort: 11111 | number   //port for receiving video stream
};

//API Events
export type TelloEvent = {
   'state_update' : CustomEvent<{state: string}>,
   'stream_start' : Event,
   'stream_stop'  : Event,
};

//Possible Commands
export type TelloCommand =
'command'   |  //SDK Command: enter SDK mode
'takeoff'   |  //SDK Command: auto takeoff
'land'      |  //SDK Command: auto land
'emergency' |  //SDK Command: stop all motors immediatly
'stop'      |  //SDK Command: hover in mid air (works at any time)
'streamon'  |  //SDK Command: Turn UDP stream on
'streamoff' |  //SDK Command: Turn UDP stream off
'speed?'    |  //SDK Command: Query for speed
'battery?'  |  //SDK Command: Query for battery level
'time?'     |  //SDK Command: Query for flight time
'wifi?'     |  //SDK Command: Query for Wi-Fi SNR
'sdk?'      |  //SDK Command: Query for SDK version
'sn?'          //SDK Command: Query for serial number
;
