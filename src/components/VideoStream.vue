<script setup lang="ts">
const props = defineProps({
   source: String
})
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
      var player = new JSMpeg.Player(this.source, {canvas: canvas});
   }
}
</script>

<style scoped>
</style>
