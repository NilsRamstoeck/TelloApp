import {WebSocketServer} from 'ws';
import {spawn} from 'child_process';
import {Server} from 'http';
import JSMpeg from 'jsmpeg';

const WS_STREAM_PORT = 3001;

export class UDPVideoSocket {
   streamServer: Server;
   webSocketServer: WebSocketServer;


   constructor(udpStreamPort: number, udpStreamAdress = '0.0.0.0'){
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

      // Delay for 3 seconds before we start ffmpeg
      setTimeout(function() {
         var args = [
            "-i", `udp://${udpStreamAdress}:${udpStreamPort}`,
            "-r", "30",
            "-s", "960x720",
            "-codec:v", "mpeg1video",
            "-b", "800k",
            "-f", "mpegts",
            `http://127.0.0.1:${WS_STREAM_PORT}/stream`
         ];

         // Spawn an ffmpeg instance
         var streamer = spawn('ffmpeg', args);
         // Uncomment if you want to see ffmpeg stream info
         //streamer.stderr.pipe(process.stderr);
         streamer.on("exit", function(code){
            console.log("Failure", code);
         });
      }, 3000);
   }

   attachStreamToCanvas(canvas: HTMLCanvasElement): any{
      const url = `ws://localhost:${WS_STREAM_PORT}/stream`;
      console.log(canvas);
      const player = JSMpeg(url, {canvas: canvas});
      // return player;
   }
}
