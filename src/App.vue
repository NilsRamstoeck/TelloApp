<script setup lang="ts">
import VideoStream from './components/VideoStream.vue'

const telloController = window.tello;

function streamon(): void {
   telloController.startVideoStream();
}

function streamoff(): void {
   telloController.stopVideoStream();
}

async function command(): void {
   const response = await telloController.sendCommand('command');
   console.log(response);
}


async function battery(): void {
   const battery_level = await telloController.sendCommand('battery?');
   console.log(battery_level);
}

</script>

<template>
   <VideoStream source="ws://localhost:3001/stream"></VideoStream>
   <button @click="streamon">Stream On</button>
   <button @click="streamoff">Stream Off</button>
   <button @click="command">Command</button>
   <button @click="battery">Battery</button>
</template>


<style>

</style>
