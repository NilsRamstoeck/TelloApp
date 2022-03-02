// electron/preload.js

import { contextBridge } from 'electron';
import {TelloController} from './TelloAPI';
import { TelloCommand, TelloEvent } from './TelloTypes';

const telloController = new TelloController;

contextBridge.exposeInMainWorld('tello', {
   sendCommand: (cmd: TelloCommand) => telloController.sendCommand(cmd),
   startVideoStream: () => telloController.startVideoStream(),
   stopVideoStream: () => telloController.stopVideoStream(),
   addEventListener: <T extends keyof TelloEvent>(
      event: T,
      callback: (ev: TelloEvent[T]) => any,
      options?: boolean | AddEventListenerOptions
   ): void => telloController.addEventListener(event, callback, options),
})

