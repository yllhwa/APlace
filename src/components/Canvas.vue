<script setup>
import axios from "axios";
// import socketio
import io from "socket.io-client";
import Utils from "../utils/utils.js";
// get prop color
defineProps({
  drawColor: String,
});
</script>

<template>
  <div
    id="canvasDiv"
    class="container flex flex-row w-full mx-auto overflow-hidden"
  >
    <div
      ref="canvasContainer"
      class="container absolute overflow-hidden w-full bg-gray-100 shadow-2xl"
    >
      <!-- 控制canvas缩放 -->
      <div
        ref="zoomController"
        :style="{
          transform: 'scale(' + state.ratio.current + ')',
          transformOrigin:
            state.ratio.position.x + 'px ' + state.ratio.position.y + 'px',
        }"
      >
        <!-- 控制canvas位置 -->
        <div
          ref="cameraController"
          :style="{
            left: state.ratio.position.x + 'px',
            top: state.ratio.position.y + 'px',
            position: 'relative',
          }"
        >
          <canvas
            ref="canvas"
            :style="{
              width: size.width,
              height: size.height,
            }"
            :width="size.width"
            :height="size.height"
            class="w-full"
            @wheel="handleWheel"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @click="handleClick"
          ></canvas>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 缩放设置
      ratio: {
        min: 1,
        max: 20,
        step: 1,
      },
      // 绘制大小
      size: {
        width: 10000,
        height: 10000,
      },
      // 画布真实大小
      map_data: {
        width: 1000,
        height: 1000,
      },
      // 状态
      state: {
        ratio: {
          // 当前缩放比例
          current: 1,
          changing: false,
          // 缩放位置
          position: {
            x: 0,
            y: 0,
          },
        },
        // 拖拽状态
        mouse: {
          grab: false,
          grabPosition: {
            x: 0,
            y: 0,
          },
          move: false,
          moveStartPosition: {
            x: 0,
            y: 0,
          },
          touch: {
            pageX1: 0,
            pageY1: 0,
            pageX2: 0,
            pageY2: 0,
          },
        },
      },
    };
  },
  watch: {
    // 根据缩放比例控制缩放速度
    "state.ratio.current"(newValue, oldValue) {
      this.ratio.step = Math.pow(2.7, -newValue / 2) + 1 / 2;
    },
  },
  mounted() {
    this.initCanvas();
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
    // 获取相对窗口的绝对坐标
    getEventPosition(event) {
      let x = event.clientX;
      let y = event.clientY;
      return {
        x: x,
        y: y,
      };
    },
    // 获取相对画布的DOM坐标
    getEventRelativePosition(event) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      return {
        x: x,
        y: y,
      };
    },
    // 缩放后滚动到指定位置
    scroolToFixRatio(lastRatio, newRatio, position) {
      this.state.ratio.position.x -= position.x * (newRatio / lastRatio - 1);
      this.state.ratio.position.y -= position.y * (newRatio / lastRatio - 1);
    },
    // 处理滚轮缩放
    handleWheel(e) {
      e.preventDefault();
      if (this.state.ratio.changing) return;
      this.state.ratio.changing = true;
      let ratio;
      if (e.deltaY < 0) {
        if (this.state.ratio.current + this.ratio.step < this.ratio.max) {
          ratio = this.state.ratio.current + this.ratio.step;
        } else {
          ratio = this.ratio.max;
        }
      } else {
        if (this.state.ratio.current - this.ratio.step > this.ratio.min) {
          ratio = this.state.ratio.current - this.ratio.step;
        } else {
          ratio = this.ratio.min;
        }
      }
      if (ratio) {
        let lastRatio = this.state.ratio.current;
        this.state.ratio.current = ratio;
        this.scroolToFixRatio(
          lastRatio,
          ratio,
          this.getEventRelativePosition(e)
        );
      }
      setTimeout(() => {
        this.state.ratio.changing = false;
      }, 50);
    },
    // 处理鼠标按下
    handleMouseDown(e) {
      const position = this.getEventPosition(e);
      this.state.mouse.grab = true;
      this.state.mouse.grabPosition.x = position.x;
      this.state.mouse.grabPosition.y = position.y;

      this.state.mouse.move = false;

      this.state.mouse.moveStartPosition.x = position.x;
      this.state.mouse.moveStartPosition.y = position.y;
      this.state.mouse.scrollLeft = this.state.ratio.position.x;
      this.state.mouse.scrollTop = this.state.ratio.position.y;
    },
    // 处理鼠标移动
    handleMouseMove(e) {
      if (!this.state.mouse.grab) return;
      const position = this.getEventPosition(e);
      if (
        position.x !== this.state.mouse.grabPosition.x &&
        position.y !== this.state.mouse.grabPosition.y
      ) {
        this.state.mouse.move = true;
      } else {
        this.state.mouse.move = false;
      }
      if (this.state.mouse.move) {
        this.state.ratio.position.x =
          this.state.mouse.scrollLeft +
          (position.x - this.state.mouse.moveStartPosition.x);
        this.state.ratio.position.y =
          this.state.mouse.scrollTop +
          (position.y - this.state.mouse.moveStartPosition.y);
      }
    },
    // 处理鼠标抬起
    handleMouseUp(e) {
      this.state.mouse.grab = false;
    },
    //处理移动端按下
    handleTouchStart(e) {
      let touch1 = e.touches[0];
      let touch2 = e.touches[1];
      this.state.mouse.touch.pageX1 = touch1.pageX;
      this.state.mouse.touch.pageY1 = touch1.pageY;
      this.state.mouse.grab = true;
      if (touch2) {
        this.state.mouse.touch.pageX2 = touch2.pageX;
        this.state.mouse.touch.pageY2 = touch2.pageY;
      }
    },
    //处理移动端双指缩放
    handleTouchMove(e) {
      console.log(e);
      const getDistance = (start, stop) => {
        return Math.hypot(stop.x - start.x, stop.y - start.y);
      };
      if (!this.state.mouse.grab) return;
      let touch1 = e.touches[0];
      let touch2 = e.touches[1];
      // 双指移动
      if (touch2) {
        if (!this.state.mouse.touch.pageX2) {
          this.state.mouse.touch.pageX2 = touch2.pageX;
        }
        if (!this.state.mouse.touch.pageY2) {
          this.state.mouse.touch.pageY2 = touch2.pageY;
        }
        let zoom =
          getDistance(
            {
              x: touch1.pageX1,
              y: touch1.pageY1,
            },
            {
              x: touch2.pageX2,
              y: touch2.pageY2,
            }
          ) /
          getDistance(
            {
              x: this.state.mouse.touch.pageX1,
              y: this.state.mouse.touch.pageY1,
            },
            {
              x: this.state.mouse.touch.pageX1,
              y: this.state.mouse.touch.pageY1,
            }
          );
        if (zoom > this.ratio.min && zoom < this.ratio.max) {
          this.state.ratio.current *= zoom;
        }
      }
    },
    handleTouchEnd(e) {
      this.state.mouse.move = false;
    },
    handleClick(e) {
      if (this.state.mouse.move) {
        return;
      }
      // 根据缩放获取相对位置
      let position = this.getEventRelativePosition(e);
      let rect = this.$refs.canvas.getBoundingClientRect();
      let map_real_width = rect.width;
      let map_scale_ratio = map_real_width / this.size.width;
      position.x = Math.floor(
        position.x / map_scale_ratio / (this.size.width / this.map_data.width)
      );
      position.y = Math.floor(
        position.y / map_scale_ratio / (this.size.width / this.map_data.width)
      );

      // this.drawPoint(position.x, position.y, this.drawColor);
      this.socket.emit("draw", {
        x: position.x,
        y: position.y,
        color: Utils.rgbaToUint32(this.drawColor),
      });
    },
  },
};
</script>
<style scoped>
#canvasDiv {
  padding-bottom: 100%;
  height: 0;
}
</style>
