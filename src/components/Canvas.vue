<script setup>
import axios from "axios";
// import socketio
import io from "socket.io-client";
import Utils from "../utils/utils.js";
import canvasController from "../utils/canvasController.js";
// get prop color
defineProps({
  drawColor: String,
});
</script>

<template>
  <div
    id="canvasDiv"
    class="flex flex-row w-full h-full mx-auto overflow-hidden"
  >
    <div
      ref="canvasContainer"
      class="absolute overflow-hidden w-full h-full bg-gray-100 shadow-2xl"
    >
      <!-- 控制canvas缩放 -->
      <!-- 缩放比例和中心由canvasController控制 -->
      <div
        ref="zoomController"
        :style="{
          transform:
            'scale(' +
            _canvasController.ratio.current +
            ') ' +
            'translate(' +
            _canvasController.ratio.position.x +
            'px,' +
            _canvasController.ratio.position.y +
            'px)',
          transformOrigin:
            _canvasController.ratio.position.x +
            'px ' +
            _canvasController.ratio.position.y +
            'px',
        }"
      >
        <canvas
          ref="canvas"
          id="canvasMap"
          :width="size.width"
          :height="size.height"
          class="w-full"
          style="image-rendering: pixelated"
          @wheel="_canvasController.handleWheel"
          @mousedown="_canvasController.handleMouseDown"
          @mousemove="_canvasController.handleMouseMove"
          @mouseup="_canvasController.handleMouseUp"
          @touchstart="_canvasController.handleTouchStart"
          @touchmove="_canvasController.handleTouchMove"
          @touchcancel="_canvasController.handleTouchCancel"
          @touchend="_canvasController.handleTouchEnd"
          @click="handleClick"
        ></canvas>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      _canvasController: new canvasController(),
      // 绘制大小
      size: {
        width: 1000,
        height: 1000,
      },
      // 画布真实大小
      map_data: {
        width: 1000,
        height: 1000,
      },
      // 状态
    };
  },
  mounted() {
    this.initCanvas();
    this.initcanvasController();
    this.initDraw();
    this.initSocket();
  },
  methods: {
    initCanvas() {
      let canvas = this.$refs.canvas;
      this.ctx = canvas.getContext("2d");
      // 关闭平滑处理以避免像素点模糊
      this.ctx.imageSmoothingEnabled = false;
    },
    initcanvasController() {
      this._canvasController.registerCanvas(this.$refs.canvas);
    },
    // 初始化画布
    initDraw() {
      axios
        .get("/api/current_map", { responseType: "blob" })
        .then((response) => {
          let img_url = window.URL.createObjectURL(response.data);
          let img = new Image();
          img.src = img_url;
          img.onload = () => {
            console.log("image loaded");
            this.ctx.drawImage(
              img,
              0,
              0,
              this.$refs.canvas.width,
              this.$refs.canvas.height
            );
          };
        });
    },
    initSocket() {
      this.socket = io("/draw");
      this.socket.on("draw_operation", (data) => {
        // 收到绘制消息
        this.drawPoint(data.x, data.y, Utils.uint32ToRgba(data.color));
      });
    },
    drawPoint(x, y, color) {
      const pixel_width = this.size.width / this.map_data.width;
      const pixel_height = this.size.height / this.map_data.height;
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        x * pixel_width,
        y * pixel_height,
        pixel_width,
        pixel_height
      );
    },
    handleClick(e) {
      if (this._canvasController.mouse.move) {
        return;
      }
      // 根据缩放获取相对位置
      let position = this._canvasController.getEventRelativePosition(e);
      let rect = this.$refs.canvas.getBoundingClientRect();
      let map_real_width = rect.width;
      let map_scale_ratio = map_real_width / this.size.width;
      position.x = Math.floor(
        position.x / map_scale_ratio / (this.size.width / this.map_data.width)
      );
      position.y = Math.floor(
        position.y / map_scale_ratio / (this.size.width / this.map_data.width)
      );

      this.socket.emit("draw", {
        x: position.x,
        y: position.y,
        color: Utils.rgbaToUint32(this.drawColor),
      });
    },
  },
};
</script>
<style scoped></style>
