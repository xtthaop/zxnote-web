<template>
  <div class="error-page-404">
    <div className="container">
      <img src="@/assets/images/404.png" />
      <div className="tip">
        <span className="mark">找不到您要访问的页面</span><br />
        <router-link to="/"><span className="home">返回首页</span></router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'ErrorPage404',
})
</script>

<style scoped lang="scss">
.error-page-404 {
  width: 100%;

  .container {
    width: 80%;
    margin: 0 auto;

    .tip {
      text-align: center;

      .mark {
        font-size: 24px;
        font-weight: 500;
      }

      .home {
        display: inline-block;
        margin-top: 20px;
        color: #6d6d6d;
        font-size: 14px;
      }
    }

    img {
      display: block;
      max-width: 600px;
      width: 100%;
      height: auto;
      margin: 0 auto;
    }
  }
}
</style>
