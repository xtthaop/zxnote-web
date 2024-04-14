<template>
  <div class="captcha-container">
    <div class="header">
      <div>
        <span style="margin-right: 5px">完成拼图验证</span>
        <span style="color: var(--base-primary-color); cursor: pointer" @click="canvasInt">
          换一张
        </span>
      </div>
      <el-icon
        style="font-size: 1.2em; cursor: pointer"
        @click="emits('update:captchaVisible', false)"
      >
        <Close />
      </el-icon>
    </div>
    <div class="img-container" v-loading="imgLoading">
      <canvas id="puzzle" width="320" height="170" :style="{ left: puzzleLeft }"></canvas>
      <canvas id="img" width="320" height="170"></canvas>
      <div v-if="showImgError" class="img-error">加载失败！</div>
    </div>
    <div
      class="slider-container"
      id="slider"
      :style="{ visibility: !showImgError && !imgLoading ? 'visible' : 'hidden' }"
    >
      <div class="status" :style="status"><span v-show="!btnShow">拼接成功！</span></div>
      <div
        class="btn"
        @mousedown.prevent="drag"
        @touchstart.prevent="drag"
        :style="btnStyle"
        v-show="btnShow"
      >
        <el-icon><Right /></el-icon>
      </div>
      <div class="track">向右滑动完成拼图</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getCaptcha } from '@/api/permission'

defineOptions({
  name: 'SliderCaptcha',
})

const emits = defineEmits(['update:captchaVisible', 'verify'])

const props = defineProps({
  captchaVisible: {
    type: Boolean,
    default: false,
  },
})

const btnShow = ref(false)
const puzzleLeft = ref(0)
const btnStyle = ref({
  left: 0,
  transition: '',
})
const status = ref({
  width: 0,
  background: '#67C23A',
  transition: '',
})

const imgLoading = ref(false)
const showImgError = ref(false)

watch(
  () => props.captchaVisible,
  (val) => {
    if (val) {
      btnShow.value = true
      puzzleLeft.value = 0
      btnStyle.value.left = 0
      status.value.width = 0
      canvasInt()
    }
  }
)

function canvasInt() {
  if (imgLoading.value) return
  imgLoading.value = true
  getCaptcha()
    .then((res) => {
      draw(res.data)
    })
    .catch(() => {
      imgLoading.value = false
      showImgError.value = true
    })
}

function draw(imgInfo) {
  const imgDom = document.querySelector('#img')
  const imgCtx = imgDom.getContext('2d')

  const puzzleDom = document.querySelector('#puzzle')
  const puzzleCtx = puzzleDom.getContext('2d')

  // 重绘清空画布
  imgDom.height = 170
  puzzleDom.height = 170

  const dstImg = new Image()
  const jigsawImg = new Image()

  dstImg.src = imgInfo.dst_img
  jigsawImg.src = imgInfo.jigsaw_img

  const dstPromise = new Promise((resolve, reject) => {
    dstImg.onload = () => {
      imgCtx.drawImage(dstImg, 0, 0, 320, 170)
      resolve('success')
    }

    dstImg.onerror = () => {
      showImgError.value = true
      reject('error')
    }
  })

  const jigsawPromise = new Promise((resolve, reject) => {
    jigsawImg.onload = () => {
      puzzleCtx.drawImage(jigsawImg, 2, imgInfo.y, 50, 50)
      resolve('success')
    }

    jigsawImg.onerror = () => {
      showImgError.value = true
      reject('error')
    }
  })

  Promise.allSettled([dstPromise, jigsawPromise]).then(() => {
    imgLoading.value = false
  })

  Promise.all([dstPromise, jigsawPromise]).then(() => {
    showImgError.value = false
  })
}

const downX = ref(0)
const offset = ref(0)
let verifying = false

function drag(e) {
  if (verifying) return
  downX.value = e.x || e.touches[0].pageX

  btnStyle.value.transition = ''
  status.value.transition = ''
  status.value.background = '#67C23A'

  document.getElementById('slider').addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)

  document.getElementById('slider').addEventListener('touchmove', move)
  document.addEventListener('touchend', up)
}

function move(e) {
  const x = e.x || e.touches[0].pageX
  offset.value = x - downX.value

  if (offset.value >= 320 - 52 || offset.value <= 0) return

  puzzleLeft.value = offset.value + 'px'
  btnStyle.value.left = offset.value + 'px'
  status.value.width = offset.value + 50 + 'px'
}

function up() {
  document.getElementById('slider').removeEventListener('mousemove', move)
  document.removeEventListener('mouseup', up)

  document.getElementById('slider').removeEventListener('touchmove', move)
  document.removeEventListener('touchend', up)

  emits('verify', offset.value)
  verifying = true
}

function handleVerifySuccess() {
  btnShow.value = false
  status.value.width = '100%'
}

function handleVerifyFail(noNeedRefresh) {
  btnStyle.value.transition = 'left 1s'
  status.value.transition = 'width 1s'
  status.value.background = '#F56C6C'
  status.value.width = '50px'
  puzzleLeft.value = 0
  btnStyle.value.left = 0
  verifying = false
  if (noNeedRefresh) return
  canvasInt()
}

defineExpose({
  handleVerifySuccess,
  handleVerifyFail,
})
</script>

<style lang="scss" scoped>
.captcha-container {
  width: 320px;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .img-container {
    position: relative;
    width: 320px;
    height: 170px;
    background-color: #eee;
    border-radius: 8px;
    overflow: hidden;

    #img,
    #puzzle {
      width: 100%;
      height: 100%;
    }

    #puzzle {
      position: absolute;
      top: 0;
    }

    .img-error {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: red;
    }
  }

  .slider-container {
    position: relative;
    width: 320px;
    margin-top: 10px;

    .status {
      position: absolute;
      left: 0;
      top: 0;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 20px;
      font-size: 14px;
      color: #fff;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: -6px;
      width: 52px;
      height: 52px;
      background: var(--base-primary-color);
      border-radius: 100%;
      cursor: pointer;

      i {
        font-size: 24px;
        color: #fff;
      }
    }

    .track {
      width: 320px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      background: #ebeef5;
      border-radius: 20px;
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
