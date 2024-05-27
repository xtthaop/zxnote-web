<template>
  <div class="img-container" ref="imgRef" v-loading="listLoading">
    <div class="imgs-wrapper">
      <div class="statistics">
        <span>共</span>
        <span class="num">&nbsp;{{ imgList.length }}&nbsp;</span>
        <span>张图片</span>
      </div>
      <div>
        <div
          class="img-item"
          :class="{ restored: item.restored }"
          v-for="(item, index) in imgList"
          :key="item"
        >
          <img
            :src="`${item.url.split('.')[0]}_low_ratio.${item.url.split('.')[1]}`"
            :data-src="item.url"
          />

          <div class="handle-wrapper">
            <div>
              <el-button type="primary" @click="handleRestoreImg(item)" :loading="restoreLoading">
                恢复图片
              </el-button>
              <br />
              <el-button
                type="danger"
                @click="handleDeleteImg(item.url, index)"
                :disabled="restoreLoading"
                style="margin-top: 10px"
              >
                彻底删除
              </el-button>
            </div>
          </div>

          <div class="restored-info">
            <div>
              <div class="tip">已恢复</div>
              <el-button
                :type="item.copied ? 'primary' : ''"
                :icon="item.copied ? Select : DocumentCopy"
                round
                @click="handleCopy(item)"
              >
                <span>{{ item.copied ? '复制成功' : '复制文本' }}</span>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getBackupImgs, restoreImg, completelyDeleteImg } from '@/api/notebook/img'
import { Select, DocumentCopy } from '@element-plus/icons-vue'
import useImgLazyLoad from '../preview/img-lazy-load'

defineOptions({
  name: 'ImgRecycleBin',
})

const imgList = ref([])
const listLoading = ref(false)
const imgRef = ref()

onMounted(() => {
  const { loadImgFn } = useImgLazyLoad(imgRef.value)
  imgRef.value.addEventListener('scroll', loadImgFn)
  loadImgFn()
})

handleGetBackupImgs()

function handleGetBackupImgs() {
  listLoading.value = true
  getBackupImgs()
    .then((res) => {
      imgList.value = res.data
    })
    .finally(() => {
      listLoading.value = false
    })
}

const restoreLoading = ref(false)

function handleRestoreImg(item) {
  restoreLoading.value = true
  restoreImg({ img_path: item.url })
    .then(() => {
      item.restored = true
    })
    .finally(() => {
      restoreLoading.value = false
    })
}

function handleCopy(item) {
  const text = `![${item.update_time}.png](${item.url.replace('uploads_clear_backup', 'uploads')})`
  navigator.clipboard.writeText(text).then(() => {
    item.copied = true
  })
}

function handleDeleteImg(url, index) {
  listLoading.value = true
  completelyDeleteImg({ img_path: url })
    .then(() => {
      imgList.value.splice(index, 1)
    })
    .finally(() => {
      listLoading.value = false
    })
}
</script>

<style lang="scss" scoped>
.img-container {
  width: 100%;
  height: calc(100% - 50px);
  overflow-y: auto;
}

.imgs-wrapper {
  max-width: 1200px;
  min-width: 500px;
  padding: 20px;
  padding-top: 10px;
  margin: 0 auto;

  .statistics {
    width: 100%;
    padding-left: 5px;
    font-size: 14px;
    line-height: 20px;
    color: #555;

    .num {
      color: var(--base-primary-color);
    }
  }

  .img-item {
    position: relative;
    display: inline-block;
    width: calc(20% - 10px);
    aspect-ratio: 1;
    margin: 5px;
    border: 1px solid #eee;
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;

    &:not(.restored):hover .handle-wrapper {
      display: flex;
    }

    &.restored .restored-info {
      display: flex;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .handle-wrapper,
    .restored-info {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);
    }

    .restored-info {
      .tip {
        margin-bottom: 20px;
        color: var(--base-primary-color);
        font-size: 20px;
        text-align: center;
      }
    }
  }
}
</style>
