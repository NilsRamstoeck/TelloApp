import {UDPStreamRelay} from './UDPStreamRelay';
import {createSocket, Socket} from 'dgram';

//TELLO COMMANDS//
const ENTER_SDK_MODE = 'command';
const STREAM_ON = 'streamon';
const STREAM_OFF = 'streamoff';

//SETTINGS TYPE//
export type TelloSettings = {
   telloIP: string
   cmdPort: number,
   statePort: number,
   streamPort: number
};

//DEFAULT SETTINGS//
export const defaultSettings: TelloSettings = {
   telloIP: '192.168.10.1',
   cmdPort: 8889,
   statePort: 8890,
   streamPort: 11111
}

//CONTROLLER CLASS//
export class TelloController implements EventTarget{
   settings: TelloSettings; //Controller Settings
   cmdSocket: Socket;       //Socket to send SDK Commands on
   stateSocket: Socket;
   streamRelay: UDPStreamRelay;
   eventTarget: EventTarget;

   //save settings and initilize sockets
   constructor(settings = defaultSettings){
      this.eventTarget = new EventTarget();
      this.settings = settings;
      console.log(settings);

      this.cmdSocket = createTelloSocket(this.settings.cmdPort, this.settings.telloIP);
      this.stateSocket = createTelloSocket(this.settings.statePort);

      this.cmdSocket.bind(this.settings.cmdPort);
      this.stateSocket.bind(this.settings.statePort, '0.0.0.0');

      this.stateSocket.on('message', (msg, _rinfo) => this.dispatchEvent(
         new CustomEvent('state_update', {
            detail: msg.toString()
         }))
      );

      this.streamRelay = new UDPStreamRelay(this.settings.streamPort);

      //Enter SDK Mode
      // this.sendCommand(ENTER_SDK_MODE);
   }
   addEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
      this.eventTarget.addEventListener(type, callback, options);
   }
   dispatchEvent(event: Event): boolean {
      return this.eventTarget.dispatchEvent(event);
   }
   removeEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
      this.eventTarget.removeEventListener(type, callback, options);
   }

   //sends an arbitraty command
   sendCommand(cmd: string){
      return new Promise((resolve, reject) => {
         console.log(cmd);
         this.cmdSocket.send(cmd, this.settings.cmdPort, this.settings.telloIP);
         this.cmdSocket.once('message',  (msg, _rinfo): void => {
            resolve(msg.toString());
         });
         //set timeout to remove event listener in case no reponse comes
         setTimeout(function () {
            reject('TIMEOUT');
         }, 1000);
      })
   }

   startVideoStream(): void{
      this.sendCommand(STREAM_ON);
      this.cmdSocket.once('message',  (msg, _rinfo): void => {
         this.streamRelay.startVideoStream();
      });
   }

   stopVideoStream(): void{
      this.sendCommand(STREAM_OFF);
      this.streamRelay.stopVideoStream();
   }

}

function createTelloSocket(port: number, ip = '0.0.0.0'):Socket {
   const socket = createSocket('udp4');

   socket.on('error', (err): void => {
      console.log(`socket error:\n${err.stack}`);
      socket.close();
   });

   // socket.on('message', (msg, rinfo): void => {
   //    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
   // });

   // socket.bind(5232);
   return socket;
}
