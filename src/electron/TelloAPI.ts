import { TelloCommand, TelloEvent, TelloSettings } from './TelloTypes';
import {UDPStreamRelay} from './UDPStreamRelay';
import {createSocket, Socket} from 'dgram';

//DEFAULT SETTINGS//
const defaultSettings: TelloSettings = {
   telloIP: '192.168.10.1',
   cmdPort: 8889,
   statePort: 8890,
   streamPort: 11111
}

//CONTROLLER CLASS//
export class TelloController implements EventTarget{
   settings: TelloSettings;      //Controller Settings
   cmdSocket: Socket;            //Socket to send SDK Commands on
   stateSocket: Socket;          //Socket to receive flight information
   streamRelay: UDPStreamRelay;  //UDP Video stream relay
   eventTarget: EventTarget;     //EventTarget for API Events

   constructor(settings = defaultSettings){
      //Initilize properties
      this.eventTarget = new EventTarget();
      this.settings = settings;
      this.cmdSocket = createTelloSocket(this.settings.cmdPort);
      this.stateSocket = createTelloSocket(this.settings.statePort);
      this.streamRelay = new UDPStreamRelay(this.settings.streamPort);

      //Setup stateSocket to dispatch state_update event when new state is reveived
      this.stateSocket.on('message', (msg, _rinfo) => this.dispatchEvent(
         new CustomEvent('state_update', {
            detail: {
               state: msg.toString()
            }
         }))
      );
   }

   //EventTarget Implimentation
   public addEventListener<T extends keyof TelloEvent>(
      type: T,
      callback: (ev: TelloEvent[T]) => any,
      options?: boolean | AddEventListenerOptions
   ): void{
      this.eventTarget.addEventListener(type, callback, options);
   }
   dispatchEvent(event:  Event): boolean {
      return this.eventTarget.dispatchEvent(event);
   }
   removeEventListener<T extends keyof TelloEvent>(
      type: T,
      callback: (ev: TelloEvent[T]) => any,
      options?: boolean | AddEventListenerOptions
   ): void{
      this.eventTarget.removeEventListener(type, callback, options);
   }

   //sends an arbitraty command and returns a promise waiting for the response
   sendCommand(cmd: TelloCommand){
      return new Promise((resolve: (response: string) => void, reject: (reason: string) => void): void => {
         //set timeout to remove event listener in case no reponse comes
         const timeout = setTimeout(function () {
            reject('TIMEOUT: ' + cmd);
         }, 1000);

         this.cmdSocket.send(cmd, this.settings.cmdPort, this.settings.telloIP);
         this.cmdSocket.once('message',  (msg, _rinfo): void => {
            clearTimeout(timeout);
            const strMsg = msg.toString();
            if(strMsg == 'error')
            reject('error');
            else
            resolve(strMsg);
         });
      })
   }

   //Sends streamom command and starts relay
   startVideoStream(): void{
      this.sendCommand('streamon')
      .then((_response) => {
         if (this.streamRelay.startVideoStream())
         this.dispatchEvent(new Event('stream_start'));
      })
      .catch((_reason) => {});
   }

   //Sends streamoff command and stops relay
   stopVideoStream(): void{
      this.sendCommand('streamoff').finally(() => {
         if (this.streamRelay.stopVideoStream())
         this.dispatchEvent(new Event('stream_stop'));
      })
      .catch((_reason) => {});
   }

}

function createTelloSocket(port: number):Socket {
   const socket = createSocket('udp4');

   socket.on('error', (err): void => {
      console.log(`socket error:\n${err.stack}`);
      socket.close();
   });

   socket.bind(port);
   return socket;
}
