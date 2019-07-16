<template>
  <div class="app-container">
    <el-container>
      <h1>哈哈哈哈哈，地图测试</h1>
      <el-button @click="open">按下</el-button>
      <div class="amap-wrapper">
        <el-amap
          :zoom="zoom"
          :center="center"
          class="amap-box"
          vid="map"/>
      </div>
      <scenic-spot-info-dialog ref="scenicSpotInfoDialog"/>
    </el-container>
  </div>
</template>

<script>
/**
  Auth: dalizi
  Created: 2019/4/10-14:54
*/
import ScenicSpotInfoDialog from '@/components/ScenicSpotInfoDialog'
// import AMap from 'AMap'
export default {
  name: 'TestPage',
  components: { ScenicSpotInfoDialog },
  directives: { },
  data() {
    return {
      zoom: 16,
      center: [121.406051, 31.179695]
    }
  },
  created() {
  },
  mounted() {

  },
  methods: {
    open() {
      this.$refs['scenicSpotInfoDialog'].show(130)
    }
  }
}
</script>
<style scoped>
</style>
