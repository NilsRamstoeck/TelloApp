<script setup lang="ts">
</script>

<template>
   <div class="video-stream-wrapper">
      <canvas id="video-canvas"></canvas>
   </div>
</template>

<script lang="ts">
export default {
   name: 'VideoStream',
   mounted: function () {
      const canvas = document.querySelector('canvas#video-canvas');
      console.log(canvas);
      // window.tello.attachStreamToCanvas(canvas);
      const url = 'ws://localhost:3001/stream';
		var player = new JSMpeg.Player(url, {canvas: canvas});
   }
}
</script>

<style scoped>

</style>
