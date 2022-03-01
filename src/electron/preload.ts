// electron/preload.js

import { contextBridge } from 'electron';
import {TelloController} from './tello-controller';

const telloController = new TelloController;

contextBridge.exposeInMainWorld('tello', {
   sendCommand: (cmd: string) => telloController.sendCommand(cmd),
   startVideoStream: () => telloController.startVideoStream(),
   stopVideoStream: () => telloController.stopVideoStream(),
   addEventListener: (event: string, callback: EventListenerOrEventListenerObject) => telloController.addEventListener(event, callback),
})
