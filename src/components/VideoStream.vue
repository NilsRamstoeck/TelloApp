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
      window.tello.attachStreamToCanvas(canvas);
   }
}
</script>

<style scoped>

</style>
