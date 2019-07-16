<template>
  <div class="app-container">
    <div>
      <el-steps :active="currentStep" finish-status="success" simple style="margin-top: 20px">
        <el-step title="1. 路线概览" />
        <el-step title="2. 每日行程" />
        <el-step title="3. 路线预览" />
      </el-steps>
    </div>
    <el-container v-if="currentStep === 0" class="container" style="width: 80%;">
      <el-form ref="dataForm" :rules="rules" :model="routeLine" label-position="left" label-width="120px" style="width: 600px; margin-left:50px; margin-top: 50px;">
        <el-form-item :label="$t('global.img')" prop="img">
          <thumbnail-upload :url="getBucketUrl()" :path="'temp'" :success="fnUploadSuccess">
            <div slot="main">
              <img v-if="routeLine.img" :src="routeLine.imgUrl" class="small">
              <i v-else class="el-icon-plus avatar-uploader-icon"/>
            </div>
          </thumbnail-upload>
        </el-form-item>
        <el-form-item :label="$t('global.title')" prop="title">
          <el-input :placeholder="$t('global.titlePlaceHolder')" v-model="routeLine.title"/>
        </el-form-item>
        <el-form-item :label="$t('travel.days')" prop="playDays">
          <el-col :span="5">
            <el-input-number v-model="routeLine.playDays" :min="1" size="mini"/>
          </el-col>
          <el-col :span="2">&nbsp;</el-col>
          <el-col :span="7">
            天
          </el-col>
        </el-form-item>
        <el-form-item :label="$t('travel.intro')" prop="twoThousand">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="routeLine.intro" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.bestDate')" prop="twoThousand">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="routeLine.bestDate" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.merits')" prop="twoThousand">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="routeLine.merits" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.tips')" prop="twoThousand">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="routeLine.tips" type="textarea"/>
        </el-form-item>
        <div style="text-align: center;">
          <el-button @click="firstStep">下一步</el-button>
        </div>
      </el-form>
    </el-container>
    <el-container v-if="currentStep === 1" class="container" style="display: flex; flex-direction: column; width: 100%;">
      <el-form :inline="true" :rules="rules" :model="routeLine" label-position="left" label-width="120px" style="margin:0px 70px;">
        <el-form-item :label="$t('travel.travelCost')">
          <el-input-number v-model="routeLine.travelCost1" :min="0" :step="10" size="mini"/>&nbsp;元
        </el-form-item>
        <el-form-item :label="$t('travel.ticketCost')">
          <el-input-number v-model="routeLine.ticketCost1" :min="0" :step="10" size="mini"/>&nbsp;元
        </el-form-item>
      </el-form>
      <el-collapse v-model="activeNames" style="width: 90%; margin: 20px;">
        <el-collapse-item v-for="item in routeLine.journeys" :key="item.day" :name="item.day">
          <template slot="title">
            <div style="display: flex; width: 80%;">
              <div @click.stop><el-link :underline="false" icon="el-icon-delete" type="danger" style="padding: 0px 10px;" @click="removeDay(item.day)">删除</el-link></div>
              <div style="flex-grow: 1; text-align: center; display: flex; margin-left: 200px; padding-left: 20px;">
                <span style="font-size: 18px; font-weight: bold;">第{{ item.day }}天</span>
                <span v-for="(dayDst, index) in item.path" :key="item.day + 'd_d' +dayDst.dstId" class="dst-item" @click.stop>
                  <span v-if="index !== 0">
                    <span v-if="dayDst.edit">
                      <el-select v-model="dayDst.tripMode" :placeholder="$t('travel.tripModePlaceHolder')" clearable class="filter-item" style="width: 130px">
                        <el-option v-for="tripMode in tripModeList" :key="tripMode.name" :label="tripMode.value" :value="tripMode.name"/>
                      </el-select>
                      <el-input-number :placeholder="$t('travel.journeyTime')" :step="15" v-model="dayDst.journeyTime" size="mini" @blur="setValue(dayDst, 'edit', false)"/>
                    </span>
                    <el-link v-else :underline="false" icon="el-icon-edit" type="primary" style="margin-right: 10px;" @click="setValue(dayDst, 'edit', true)">
                      {{ getValue('tripMode', dayDst.tripMode) }}{{ formatHour(dayDst.journeyTime) }}
                    </el-link>
                  </span>
                  <span>{{ dayDst.destination.name }}</span>
                  <el-link :underline="false" icon="el-icon-close" type="primary" @click="removeDst(item, index)"/>
                </span>
                <span class="dst-item" @click.stop>
                  <tree-selector :placeholder="$t('travel.parentPlaceHolder')" :query-data="loadQueryDstData" :load="loadDialogTreeData" :dialog-loading="treeDialogLoading" icon="el-icon-plus" style="width: 120px;" input-type="link" button-text="添加目的地" @click="dstClick(item)" @selected="selectedNode"/>
                </span>
              </div>
            </div>
          </template>
          <div style="display: flex; flex-direction: row;">
            <el-form ref="dataForm2" :rules="rules" :model="item" label-position="left" label-width="80px" style="margin:10px 50px; width: 500px;">
              <div v-if="!item.introEdit">
                <label>{{ $t('travel.intro') }} <el-link :underline="false" icon="el-icon-edit" type="primary" @click="item.introEdit=true">编辑</el-link></label>
                <div>{{ item.intro }}</div>
              </div>
              <el-form-item v-else :label="$t('travel.intro')" prop="twoThousand">
                <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="item.intro" type="textarea" @blur="item.introEdit=false"/>
              </el-form-item>
              <div v-if="!item.trafficEdit">
                <label>{{ $t('travel.traffic') }} <el-link :underline="false" icon="el-icon-edit" type="primary" @click="item.trafficEdit=true">编辑</el-link></label>
                <div>{{ item.traffic }}</div>
              </div>
              <el-form-item v-else :label="$t('travel.traffic')" prop="twoThousand">
                <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="item.traffic" type="textarea" @blur="item.trafficEdit=false"/>
              </el-form-item>
              <div v-if="!item.sleepEdit">
                <label>{{ $t('travel.sleep') }} <el-link :underline="false" icon="el-icon-edit" type="primary" @click="item.sleepEdit=true">编辑</el-link></label>
                <div>{{ item.sleep }}</div>
              </div>
              <el-form-item v-else :label="$t('travel.sleep')" prop="twoThousand">
                <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="item.sleep" type="textarea" @blur="item.sleepEdit=false"/>
              </el-form-item>
              <div v-if="!item.foodEdit">
                <label>{{ $t('travel.food') }} <el-link :underline="false" icon="el-icon-edit" type="primary" @click="item.foodEdit=true">编辑</el-link></label>
                <div>{{ item.food }}</div>
              </div>
              <el-form-item v-else :label="$t('travel.food')" prop="twoThousand">
                <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="item.food" type="textarea" @blur="item.foodEdit=false"/>
              </el-form-item>
              <div v-if="!item.ticketEdit">
                <label>{{ $t('travel.ticket') }} <el-link :underline="false" icon="el-icon-edit" type="primary" @click="item.ticketEdit=true">编辑</el-link></label>
                <div>{{ item.ticket }}</div>
              </div>
              <el-form-item v-else :label="$t('travel.ticket')" prop="twoThousand">
                <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="item.ticket" type="textarea" @blur="item.ticketEdit=false"/>
              </el-form-item>
              <div v-if="!item.visaEdit">
                <label>{{ $t('travel.visa') }} <el-link :underline="false" icon="el-icon-edit" type="primary" @click="item.visaEdit=true">编辑</el-link></label>
                <div>{{ item.visa }}</div>
              </div>
              <el-form-item v-else :label="$t('travel.visa')" prop="twoThousand">
                <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="item.visa" type="textarea" @blur="item.visaEdit=false"/>
              </el-form-item>
              <div v-if="!item.shoppingEdit">
                <label>{{ $t('travel.shopping') }} <el-link :underline="false" icon="el-icon-edit" type="primary" @click="item.shoppingEdit=true">编辑</el-link></label>
                <div>{{ item.shopping }}</div>
              </div>
              <el-form-item v-else :label="$t('travel.shopping')" prop="twoThousand">
                <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="item.shopping" type="textarea" @blur="item.shoppingEdit=false"/>
              </el-form-item>
            </el-form>
            <div>
              <div style="margin:10px 0px;">
                <el-button @click="openSelectScenicSpotDialog(item)">添加行程</el-button>
              </div>
              <el-table
                :data="item.list"
                border
                fit
                highlight-current-row
                style="width: 100%;">
                <el-table-column :label="$t('travel.name')" width="100px" align="center">
                  <template slot-scope="scope">
                    <el-link :underline="false" type="primary" @click="openScenicSpotInfoDialog(scope.row.scenicSpot.id)">{{ scope.row.scenicSpot.name }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('travel.tripMode')" min-width="150px" align="center">
                  <template slot-scope="scope">
                    <el-select v-if="scope.row.edit" v-model="scope.row.tripMode" :placeholder="$t('travel.tripModePlaceHolder')" clearable class="filter-item" style="width: 130px">
                      <el-option v-for="item in tripModeList" :key="item.name" :label="item.value" :value="item.name"/>
                    </el-select>
                    <span v-else>{{ getValue('tripMode', scope.row.tripMode) }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('travel.journeyTime')" min-width="200px" align="center">
                  <template slot-scope="scope">
                    <el-input-number v-if="scope.row.edit" :placeholder="$t('travel.journeyTime')" :step="15" v-model="scope.row.journeyTime" size="mini"/>
                    <span v-else>{{ scope.row.journeyTime }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('travel.playTime')" min-width="200px" align="center">
                  <template slot-scope="scope">
                    <el-input-number v-if="scope.row.edit" :placeholder="$t('travel.playTime')" :step="15" v-model="scope.row.playTime" size="mini"/>
                    <span v-else>{{ scope.row.playTime }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('travel.journeyIntro')" min-width="100px" align="center">
                  <template slot-scope="scope">
                    <el-input v-if="scope.row.edit" :autosize="{ minRows: 2, maxRows: 4}" v-model="scope.row.intro" type="textarea"/>
                    <span v-else>{{ subInfo(scope.row.intro) }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('table.actions')" align="center" min-width="150" class-name="small-padding fixed-width">
                  <template slot-scope="scope">
                    <el-button v-if="!scope.row.edit" class="handle-btn" type="primary" icon="el-icon-edit" @click="scope.row.edit=true" />
                    <el-button v-else class="handle-btn" type="success" icon="el-icon-check" @click="scope.row.edit=false" />
                    <el-button :loading="scope.row.deleteLoading" class="handle-btn" type="danger" icon="el-icon-delete" @click="removeplayDayscenicSpot(item, scope.$index)" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div style="text-align: center;">
        <el-button @click="prevStep">上一步</el-button>
        <el-button @click="secondStep">下一步</el-button>
      </div>
    </el-container>
    <el-container v-if="currentStep === 2" class="container" style="display: flex; flex-direction: column; width: 100%;">
      <route-line-detail :route-line="routeLine" />
      <div style="text-align: center; margin-top: 30px;">
        <el-button @click="prevStep">上一步</el-button>
        <el-button @click="finish">完成</el-button>
      </div>
    </el-container>
    <scenic-spot-dialog ref="selectScenicSpotDialog" append-to-body @selected="changeScenicSpotDst"/>
    <scenic-spot-info-dialog ref="scenicSpotInfoDialog" />
  </div>
</template>
<script>
import { getDstPage, getDstTree, saveRouteLine, getRouteLine } from '@/api/travel'
import ThumbnailUpload from '@/components/ThumbnailUpload'
import ScenicSpotDialog from '@/components/ScenicSpotDialog'
import ScenicSpotInfoDialog from '@/components/ScenicSpotInfoDialog'
import RouteLineDetail from '@/components/RouteLineDetail'
import TreeSelector from '@/components/TreeSelector'
import { getDictionary, getValue } from '@/utils/dict'
import { formatHour } from '@/utils/index'
export default {
  name: 'EditRouteLine',
  components: { ThumbnailUpload, ScenicSpotDialog, ScenicSpotInfoDialog, TreeSelector, RouteLineDetail },
  data() {
    return {
      routeLine: {
        journeys: []
      },
      activeNames: [
      ],
      currentDay: {},
      bucket: process.env.BUCKET.PROD_IMG,
      domain: process.env.OSS_DOMAIN,
      scenicSpotDialogVisible: false,
      treeDialogLoading: false,
      dialogStatus: '',
      currentStep: 0,
      isLeave: false,
      tripModeList: [],
      rules: {
        // img: [
        //   { required: true, message: '请上传首页图', trigger: 'blur' }
        // ],
        playDays: [
          { required: true, message: '请输入游玩天数', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        fifty: [{ min: 0, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }],
        twoThousand: [{ min: 0, max: 2000, message: '长度必须小于2000字符', trigger: 'blur' }]
      }
    }
  },
  created() {
    const _this = this
    getDictionary(this.$store, 'tripMode').then(data => {
      _this.tripModeList = data
    })
  },
  beforeRouteEnter(to, from, next) {
    next()
  },
  beforeRouteLeave(to, from, next) {
    if (this.isLeave) {
      next()
      return
    }
    if (!this.routeLine.title && !this.routeLine.days) {
      next()
      return
    }
    this.$confirm('离开将丢失已编辑的内容,确认离开?', '警告', {
      confirmButtonText: '离开',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      next()
    }).catch(() => {
      next(false)
    })
  },
  mounted() {
    if (this.$route.query && this.$route.query.routeLine) {
      const _this = this
      getRouteLine(this.$route.query.routeLine.id).then(response => {
        _this.routeLine = response.data.data
      })
    }
  },
  methods: {
    getValue: getValue,
    formatHour: formatHour,
    setValue(obj, valueName, value) {
      this.$set(obj, valueName, value)
    },
    removeDst(day, index) {
      if (!day) return
      this.$confirm('你确实要删除此行程?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        day.path.splice(index, 1)
      })
    },
    dstClick(day) {
      this.currentDay = day
    },
    loadDialogTreeData(node, resolve) {
      getDstTree(node ? node.data.id : null).then(response => {
        resolve(response.data.data.slice(0, 300))
      })
    },
    loadQueryDstData(name, resolve) {
      getDstPage({
        name: name,
        size: 100
      }).then(response => {
        resolve(response.data.data.records)
      })
    },
    fnUploadSuccess(response, file, fileList) {
      if (file) {
        this.routeLine.img = file.path
        this.routeLine.imgUrl = this.getImgUrl(file.path)
        console.log(this.routeLine)
      }
    },
    removeplayDayscenicSpot(day, index) {
      if (!day) return
      this.$confirm('你确实要删除此行程?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        day.list.splice(index, 1)
      })
    },
    removeDay(index) {
      const _this = this
      this.$confirm(`你确实要删除第${index}日行程?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for (let i = index; i < _this.routeLine.journeys.length; i++) {
          const journeyDay = _this.routeLine.journeys[i]
          journeyDay.day = journeyDay.day - 1
        }
        _this.routeLine.journeys.splice(index - 1, 1)
      })
    },
    openSelectScenicSpotDialog(day) {
      this.$refs['selectScenicSpotDialog'].show()
      this.currentDay = day
    },
    openScenicSpotInfoDialog(id) {
      this.$refs['scenicSpotInfoDialog'].show(id)
    },
    getBucketUrl() {
      return 'https://' + this.bucket + '.' + this.domain + '/'
    },
    getImgUrl(img) {
      if (img) {
        return 'https://' + this.bucket + '.' + this.domain + '/' + img + '-small'
      }
      return null
    },
    subInfo(str) {
      if (!str) {
        return str
      }
      if (str.length > 100) {
        return str.slice(0, 100) + '...'
      }
      return str
    },
    changeScenicSpotDst(selectedScenicSpot) {
      if (!selectedScenicSpot) return
      if (!this.currentDay) return
      for (let index = 0, list = this.currentDay.list, exists = false; index < selectedScenicSpot.length; index++) {
        const scenicSpot = selectedScenicSpot[index]
        for (let p = 0; p < list.length; p++) {
          const journey = list[p]
          if (journey.scenicSpotId === scenicSpot.id) {
            exists = true
            break
          }
        }
        if (exists) {
          continue
        }
        if (!this.routeLine.ticketCost1) {
          this.routeLine.ticketCost1 = 0
        }
        if (scenicSpot.ticketPrice && scenicSpot.ticketPrice > 0) {
          this.routeLine.ticketCost1 += scenicSpot.ticketPrice
        }
        list.push({
          scenicSpot: scenicSpot,
          scenicSpotId: scenicSpot.id,
          playTime: scenicSpot.playTime
        })
      }
      // console.log(selectedScenicSpot)
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep -= 1
      }
    },
    secondStep() {
      if (!this.routeLine.journeys || this.routeLine.journeys.length === 0) {
        this.$message.error('行程不能为空')
        return
      }
      if (!this.ticketCost1 || this.ticketCost1 === 0) {
        let ticketCost = 0
        for (let i = 0; i < this.routeLine.journeys.length; i++) {
          const journeyDay = this.routeLine.journeys[i]
          if (!journeyDay.list || journeyDay.list.length === 0) {
            this.$message.error('请编写第' + journeyDay.day + '日行程')
            return
          }
          if (!journeyDay.path || journeyDay.path.length === 0) {
            this.$message.error('请编写第' + journeyDay.day + '日目的地')
            return
          }
          for (let p = 0; p < journeyDay.list.length; p++) {
            const scenicSpot = journeyDay.list[p].scenicSpot
            if (scenicSpot.ticketPrice && scenicSpot.ticketPrice > 0) {
              ticketCost += scenicSpot.ticketPrice
            }
          }
        }
        this.routeLine.ticketCost1 = ticketCost
      }
      if (this.routeLine.ticketCost1) {
        this.routeLine.ticketCost = this.routeLine.ticketCost1 * 100
      }
      if (this.routeLine.travelCost1) {
        this.routeLine.travelCost = this.routeLine.travelCost1 * 100
      }
      this.currentStep += 1
    },
    finish() {
      const _this = this
      this.isLeave = true
      saveRouteLine(this.routeLine).then(response => {
        _this.$router.push({ name: 'routeLine' })
      })
    },
    selectedNode(node) {
      const dstPath = this.currentDay.path
      if (dstPath && dstPath[dstPath.length - 1] && dstPath[dstPath.length - 1].dstId === node.id) {
        return
      }
      dstPath.push({
        dstId: node.id,
        dstName: node.name,
        destination: node,
        seq: dstPath.length,
        tripMode: '',
        journey: 0
      })
    },
    firstStep() {
      const _this = this
      if (_this.routeLine.title) {
        _this.routeLine.title = _this.routeLine.title.trim()
      }
      if (this.currentStep === 0) {
        this.$refs.dataForm.validate(valid => {
          if (valid) {
            _this.currentStep += 1
            if (_this.routeLine.playDays > _this.routeLine.journeys.length) {
              for (let index = _this.routeLine.journeys.length; index < _this.routeLine.playDays; index++) {
                _this.routeLine.journeys.push({
                  day: index + 1,
                  intro: '',
                  introEdit: false,
                  traffic: '',
                  trafficEdit: false,
                  sleep: '',
                  sleepEdit: false,
                  food: '',
                  foodEdit: false,
                  ticket: '',
                  ticketEdit: false,
                  visa: '',
                  visaEdit: false,
                  shopping: '',
                  shoppingEdit: false,
                  path: [],
                  list: []
                })
                _this.activeNames.push(index + 1)
              }
            } else {
              const diff = _this.routeLine.journeys.length - _this.routeLine.playDays
              _this.routeLine.journeys.splice(_this.routeLine.playDays, diff)
              _this.activeNames.splice(_this.routeLine.playDays, diff)
            }
          } else {
            return false
          }
        })
      } else {
        console.log('完成')
      }
    }
  }
}
</script>

<style>
.container {
  margin-left:50px;
  margin-top: 50px;
}
.dst-item {
  margin-left: 20px;
}
</style>
