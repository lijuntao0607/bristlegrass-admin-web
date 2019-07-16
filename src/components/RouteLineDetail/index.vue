<template>
  <div class="main">
    <div style="background-color: #fafafa;">
      <div class="first-row">
        <h1 class="title">{{ routeLine.title }}</h1>
        <span class="best-date">
          <i class="el-icon-sunny" style="font-size: 30px; margin-left: 5px;"/>
          <span style="margin-left: 20px;">最佳季节：{{ routeLine.bestDate }}</span>
        </span>
        <img v-if="routeLine.img" :src="routeLine.imgUrl" class="small">
      </div>
      <div style="display: flex; margin: 20px 0px;">
        <span class="cost-box">
          <i class="el-icon-ship" style="font-size: 30px; margin-left: 5px;"/>
          <span style="margin-left: 20px;">参考交通费用：{{ formatNumber(routeLine.travelCost) }}</span>
        </span>
        <span class="cost-box">
          <i class="el-icon-s-ticket" style="font-size: 30px; margin-left: 5px;"/>
          <span style="margin-left: 20px;">参考门票费用：{{ formatNumber(routeLine.ticketCost) }}</span>
        </span>
      </div>
      <div class="item-title-container">
        <el-link :underline="false" type="danger" class="item-title">行程概况</el-link>
        <el-link :underline="false" type="danger" class="item-title">行程详情</el-link>
      </div>
    </div>
    <div class="content">
      <div class="line-summary">
        <div>
          <div class="line-summary-title">路线概览</div>
          <div class="scenic-spot-path">
            <span v-for="(item, index) in routeLine.scenicSpots" :key="index + '|' + item.scenicSpotId">
              <el-link @click="openScenicSpotInfoDialog(item.scenicSpot.id)">{{ item.scenicSpot.name }}</el-link>
              <i v-if="index !== (routeLine.scenicSpots.length - 1)" class="el-icon-right right-arrow"/>
            </span>
          </div>
          <div class="line-intro">
            <div class="line-intro-item">
              <div class="mid-title">Tips</div>
              <div>{{ routeLine.tips }}</div>
            </div>
            <div class="line-intro-item">
              <div class="mid-title">总结</div>
              <div>{{ routeLine.intro }}</div>
            </div>
          </div>
        </div>
        <div class="line-map">
          <el-amap :zoom="12" :events="mapEvents" vid="routeLineMap">
            <el-amap-marker v-for="s in routeLine.scenicSpots" :key="s.id" :position="[s.scenicSpot.longitude, s.scenicSpot.latitude]"/>
          </el-amap>
        </div>
      </div>
      <div class="line-intro-shadow"/>
      <div>
        <div class="journeys">
          <el-timeline>
            <el-timeline-item v-for="day in routeLine.journeys" :key="day.day" :timestamp="`第${day.day}天`" placement="top">
              <el-card>
                <div class="day-title">
                  <span>
                    <span v-for="(dayDst,index) in day.path" :key="day.day + '_' + dayDst.dstId">
                      <span v-if="index !== 0" class="day-title-journey">{{ getValue('tripMode', dayDst.tripMode) }}{{ formatHour(dayDst.journeyTime) }}</span>
                      <span class="day-title-dst">{{ dayDst.destination.name }}</span>
                    </span>
                  </span>
                </div>
                <p v-if="day.intro" class="day-intro">{{ day.intro }}</p>
                <div class="day-list">
                  <span v-for="(dayScenicSpot,index) in day.list" :key="day.day + '_s_' + dayScenicSpot.scenicSpotId">
                    <span v-if="index != 0" class="arrow">{{ getValue('tripMode', dayScenicSpot.tripMode) }}{{ formatHour(dayScenicSpot.journeyTime) }}&nbsp;</span>
                    <i v-if="index != 0" class="el-icon-arrow-right arrow-icon"/>
                    <span class="day-scenic-spot"><i class="el-icon-location day-scenic-spot-icon"/>
                      <el-link :underline="false" @click="openScenicSpotInfoDialog(dayScenicSpot.scenicSpot.id)">{{ dayScenicSpot.scenicSpot.name }}</el-link>
                    </span>
                    <span class="day-journey-time">{{ dayScenicSpot.playTime? '' : '(' + formatHour(dayScenicSpot.playTime) + ')' }}</span>
                  </span>
                </div>
                <div v-if="day.traffic" class="day-title">
                  <i class="el-icon-bicycle" style="color: #ff9d00; font-size: 34px;"/>
                  <span class="day-title-dst">
                    交通攻略
                  </span>
                </div>
                <p v-if="day.traffic" class="day-intro">
                  {{ day.traffic }}
                </p>
                <div v-if="day.sleep" class="day-title">
                  <i class="el-icon-receiving" style="color: #0a89e4; font-size: 34px;"/>
                  <span class="day-title-dst">
                    住宿攻略
                  </span>
                </div>
                <p v-if="day.sleep" class="day-intro">
                  {{ day.sleep }}
                </p>
                <div v-if="day.food" class="day-title">
                  <i class="el-icon-tableware" style="color: #f47c68; font-size: 34px;"/>
                  <span class="day-title-dst">
                    美食攻略
                  </span>
                </div>
                <p v-if="day.food" class="day-intro">
                  {{ day.food }}
                </p>
                <div v-if="day.ticket" class="day-title">
                  <i class="el-icon-mobile" style="color: #ff5858; font-size: 34px;"/>
                  <span class="day-title-dst">
                    门票攻略
                  </span>
                </div>
                <p v-if="day.ticket" class="day-intro">
                  {{ day.ticket }}
                </p>
                <div v-if="day.visa" class="day-title">
                  <i class="el-icon-notebook-2" style="color: #f47c68; font-size: 34px;"/>
                  <span class="day-title-dst">
                    签证攻略
                  </span>
                </div>
                <p v-if="day.visa" class="day-intro">
                  {{ day.visa }}
                </p>
                <div v-if="day.shopping" class="day-title">
                  <i class="el-icon-shopping-cart-full" style="color: #cccccc; font-size: 34px;"/>
                  <span class="day-title-dst">
                    购物攻略
                  </span>
                </div>
                <p v-if="day.shopping" class="day-intro">
                  {{ day.shopping }}
                </p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>
    <scenic-spot-info-dialog ref="scenicSpotInfoDialog" :modal="false"/>
  </div>
</template>
<script>
import { getDictionary, getValue } from '@/utils/dict'
import ScenicSpotInfoDialog from '@/components/ScenicSpotInfoDialog'
import { formatHour, formatStr, formatNumber } from '@/utils/index'
export default {
  name: 'RouteLineDetail',
  components: { ScenicSpotInfoDialog },
  directives: { },
  props: {
    routeLine: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      mapEvents: {
        init: (o) => {
          // console.log(o.getCenter())
          // console.log(this.$refs.map.$$getInstance())
          // o.getCity(result => {
          //   console.log(result)
          // })
        },
        'moveend': () => {
        },
        'zoomchange': () => {
        },
        'rightclick': (e) => {
        }
      }
    }
  },
  created() {
    getDictionary(this.$store, 'tripMode')
  },
  mounted() {
    const scenicSpots = []
    for (let index = 0; index < this.routeLine.journeys.length; index++) {
      const journeyDay = this.routeLine.journeys[index]
      for (let p = 0; p < journeyDay.list.length; p++) {
        scenicSpots.push(journeyDay.list[p])
      }
    }
    this.$set(this.routeLine, 'scenicSpots', scenicSpots)
  },
  methods: {
    getValue: getValue,
    formatHour: formatHour,
    formatNumber: formatNumber,
    formatStr: formatStr,
    openScenicSpotInfoDialog(id) {
      this.$refs['scenicSpotInfoDialog'].show(id)
    }
  }
}
</script>
<style>
.first-row {
  display: flex;
  align-items: center;
}
.title {
  font-size: 30px;
  font-weight: normal;
  color: #333;
  padding-left: 10px;
  flex-grow: 1;
}
.best-date {
  display: inline-block;
  height: 24px;
  border-left: 1px solid #e6e6e6;
  padding-left: 20px;
  vertical-align: center;
  line-height: 24px;
  display: flex;
  align-items: center;
  flex-grow: 1;
}
.cost-box {
  display: inline-block;
  height: 24px;
  padding-left: 20px;
  vertical-align: center;
  line-height: 24px;
  display: flex;
  align-items: center;
}
.item-title-container {
  border-top: 1px solid #ededed;
  height: 60px;
  display: flex;
  flex-direction: row;
  justify-content: left;
  padding-left: 20px;
}
.item-title {
  width: 120px;
  padding: 0px 10px;
}
.main {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.content {
  padding-left: 5px;
}
.line-summary {
  display: flex;
  flex-direction: row;
}
.line-summary-title {
  margin: 20px 10px;
  font-size: 18px;
  color: #333;
  line-height: 24px;
}
.right-arrow {
  font-size: 14px;
  vertical-align: middle;
  margin: 3px 10px 0px 10px;
}
.scenic-spot-path {
  margin-left: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 30px;
  width: 600px;
  line-height: 24px;
}
.line-intro {
  border-top: 1px solid #ededed;
  display: flex;
  flex-direction: row;
  width: 700px;
}
.line-intro-item {
  width: 50%;
  flex-grow: 1;
  margin: 10px 0px 50px 10px;
}
.line-map {
  margin: 20px;
  width: 500px;
  height: 300px;
}
.line-intro-shadow {
  border-bottom: 1px solid #ececec;
  box-shadow: 0 1px 2px rgba(0,0,0,.15);
}
.mid-title {
  margin: 10px 0px 20px 0px;
  font-size: 18px;
  color: #333;
  line-height: 24px;
}
.journeys {
  width: 1100px;
  margin-top: 40px;
}
.day-title {
  height: 45px;
  margin-bottom: 15px;
  margin-top: 30px;
  border-bottom: 1px solid #efefee;
  width: 100%;
}
.day-title-dst {
  color: #333;
  font-size: 20px;
}
.day-title-journey {
  margin: 0px 20px 0px 20px;
  font-size: 14px;
  color: darkgray;
  border-bottom: 1px solid #ececec;
}
.day-intro {
  border-bottom: 1px solid #efefee;
  padding-bottom: 30px;
  font-size: 16px;
  color: #333;
  line-height: 24px;
}
.day-list {
  padding: 20px 5px;
}
.day-scenic-spot {
  line-height: 30px;
}
.day-scenic-spot-icon {
  margin: 0px 8px;
  color: #85c65e;
  font-size: 18px;
}
.day-journey-time {
  margin-right: 10px;
}
.arrow {
  border-bottom: 1px solid #ddd;
  padding: 0px 20px;
  margin: 0px 0px;
  min-width: 200px;
}
.arrow-icon {
  color: #ddd;
  position: absolute;
  margin-left: -9px;
  margin-top: 17px;
}
</style>
