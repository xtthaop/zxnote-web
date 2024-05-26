<template>
  <div class="img-container" ref="imgRef" v-loading="listLoading">
    <div class="imgs-wrapper">
      <div class="statistics">
        <span>共</span>
        <span class="num">&nbsp;{{ imgList.length }}&nbsp;</span>
        <span>张图片</span>
      </div>
      <div>
        <div class="img-item" v-for="item in imgList" :key="item">
          <img :src="`${item.split('.')[0]}_low_ratio.${item.split('.')[1]}`" :data-src="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getBackupImgs } from '@/api/notebook/img'
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
    display: inline-block;
    width: calc(20% - 10px);
    aspect-ratio: 1;
    margin: 5px;
    border: 1px solid #eee;
    border-radius: 5px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }
}
</style>
