import {WebSocketServer} from 'ws';
import {spawn, ChildProcess} from 'child_process';
import {Server} from 'http';

const WS_STREAM_PORT = 3001;

export class UDPStreamRelay {
   streamServer: Server;
   webSocketServer: WebSocketServer;
   udpStreamPort: number;
   udpStreamAdress: string;
   streamer: ChildProcess | null;


   constructor(udpStreamPort: number, udpStreamAdress = '0.0.0.0'){
      this.udpStreamPort = udpStreamPort;
      this.udpStreamAdress = udpStreamAdress;
      this.streamer = null;
      const self = this; //make object available in different contexts
      this.streamServer = new Server(function(request, _response) {
         // When data comes from the stream (FFmpeg) we'll pass this to the web socket
         request.on('data', function(data) {
            // Now that we have data let's pass it to the web socket server
            self.webSocketServer.clients.forEach(function each(client) {
               if (client.readyState === WebSocket.OPEN) {
                  client.send(data);
               }
            });
         });

      }).listen(WS_STREAM_PORT); // Listen for streams on port 3001

      this.webSocketServer = new WebSocketServer({
         server: this.streamServer
      });
   }

   startVideoStream(): boolean{
      if(this.streamer != null)return false;
      var args = [
         "-i", `udp://${this.udpStreamAdress}:${this.udpStreamPort}`,
         "-r", "60",
         // "-s", "960x720",
         "-s", "640x480",
         // "-s", "480x360 ",
         "-codec:v", "mpeg1video",
         "-b", "1200k",
         "-f", "mpegts",
         '-tune', 'zerolatency',
         `http://127.0.0.1:${WS_STREAM_PORT}/stream`
      ];

      // Spawn an ffmpeg instance
      this.streamer = spawn('ffmpeg', args);
      this.streamer.unref();
      return true;
   }

   stopVideoStream(): boolean{
      if(this.streamer == null)return false;
      this.streamer.kill('SIGTERM');
      this.streamer = null;
      return true;
   }
}
