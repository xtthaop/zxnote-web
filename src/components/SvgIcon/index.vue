<template>
  <svg :class="classObj" aria-hidden="true" v-bind="$attrs">
    <use :href="iconName" />
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    name: {
      type: String,
      required: true,
    },
    svgClass: {
      type: String,
      default: '',
    },
  },
  computed: {
    iconName() {
      return `#icon-${this.name}`
    },
    classObj() {
      if (this.svgClass) {
        return 'svg-icon ' + this.svgClass
      } else {
        return 'svg-icon'
      }
    },
  },
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
