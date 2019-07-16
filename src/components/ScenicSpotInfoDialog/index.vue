<template>
  <div>
    <el-dialog :title="$t('global.detail')" :visible.sync="detailDialogVisible" :modal="modal">
      <div v-if="editable" style="text-align: right; margin-right: 30px; margin-bottom: 20px;">
        <!-- <el-button v-if="dialogStatus!=='show'" @click="dialogStatus = 'show'">{{ $t('global.cancel') }}</el-button> -->
        <el-button :loading="commitLoading" type="primary" @click="saveScenicSpot()">
          {{ dialogStatus==='show'? $t('global.edit'): $t('global.save') }}
        </el-button>
      </div>
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 600px; margin-left:50px;">
        <el-form-item :label="$t('global.img')" prop="img">
          <thumbnail-upload v-if="dialogStatus==='edit' || dialogStatus==='create'" :url="getBucketUrl()" :path="'temp'" :success="fnUploadSuccess">
            <div slot="main">
              <img v-if="temp.img" :src="temp.imgUrl" class="small">
              <i v-else class="el-icon-plus avatar-uploader-icon"/>
            </div>
          </thumbnail-upload>
          <img v-else :src="temp.imgUrl" class="small">
        </el-form-item>
        <el-form-item :label="$t('global.name')" prop="name">
          <div v-if="dialogStatus==='show'">
            {{ temp.name }}
          </div>
          <el-input v-else :placeholder="$t('travel.namePlaceHolder')" v-model="temp.name"/>
        </el-form-item>
        <el-form-item :label="$t('global.enName')" prop="fifty">
          <div v-if="dialogStatus==='show'">{{ temp.enName }}</div>
          <el-input v-else :placeholder="$t('travel.enNamePlaceHolder')" v-model="temp.enName"/>
        </el-form-item>
        <el-form-item :label="$t('travel.type')">
          <div v-if="dialogStatus==='show'">{{ getValue('scenicSpotType', temp.type) }}</div>
          <el-select v-else v-model="temp.type" :placeholder="$t('travel.type')" clearable>
            <el-option v-for="item in scenicSpotTypeList" :key="item.name" :label="item.value" :value="item.name"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('travel.playTime')">
          <div v-if="dialogStatus==='show'">{{ temp.playTime }}</div>
          <el-input-number v-else v-model="temp.playTime" :min="0" :step="10"/>
        </el-form-item>
        <el-form-item :label="$t('travel.playTimeStr')" prop="twoThousand">
          <div v-if="dialogStatus==='show'">{{ temp.playTimeStr }}</div>
          <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.playTimeStr" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.ticketPrice')">
          <div v-if="dialogStatus==='show'">{{ temp.ticketPrice }}</div>
          <el-input-number v-else v-model="temp.ticketPrice" :min="0" :step="10"/>
        </el-form-item>
        <el-form-item :label="$t('travel.scenicSpotTicket')" prop="twoThousand">
          <div v-if="dialogStatus==='show'">{{ temp.ticketPriceStr }}</div>
          <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.ticketPriceStr" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.phone')" prop="phone">
          <div v-if="dialogStatus==='show'">{{ temp.phone }}</div>
          <el-input v-else :placeholder="$t('travel.phone')" v-model="temp.phone"/>
        </el-form-item>
        <el-form-item :label="$t('travel.website')" prop="fifty">
          <div v-if="dialogStatus==='show'">{{ temp.website }}</div>
          <el-input v-else :placeholder="$t('travel.website')" v-model="temp.website"/>
        </el-form-item>
        <el-form-item :label="$t('travel.address')" prop="fifty">
          <div v-if="dialogStatus==='show'">{{ temp.address }}</div>
          <el-input v-else :placeholder="$t('travel.address')" v-model="temp.address"/>
        </el-form-item>
        <el-form-item :label="$t('travel.parentDst')" prop="destinationId">
          <div v-if="dialogStatus==='show'">{{ temp.destinationName }}</div>
          <tree-selector
            v-else
            :placeholder="$t('travel.parentPlaceHolder')"
            :load="loadDialogTreeData"
            :dialog-loading="treeDialogLoading"
            :show-prop.sync="temp.destinationName"
            :selecting-node="selectingNode"
            :value.sync="temp.destinationId"
            node-label="name"
            node-value="id"
            height="350px"
            @selected="destinationSelected"
          />
        </el-form-item>
        <!-- <el-form-item :label="$t('travel.parentDst')" prop="destinationId">
          <div v-if="dialogStatus==='show'">{{ temp.parentName }}</div>
          <el-select v-else v-model="temp.parentId" :placeholder="$t('travel.parentScenicSpot')" clearable class="filter-item">
            <el-option v-for="item in scenicSpotList" :key="item.name" :label="item.value" :value="item.name"/>
          </el-select>
        </el-form-item> -->
        <el-form-item :label="$t('travel.position')" :class="dialogStatus==='show'?'amap-dst-show':'amap-dst-edit-item'">
          <div :class="dialogStatus==='show'?'amap-dst-container':'amap-dst-edit-item'">
            <span v-if="dialogStatus==='show'">{{ temp.latitude? (temp.latitude+','+temp.longitude): '' }}</span>
            <el-tooltip v-else :disabled="dialogStatus==='show'" content="右键点击地图更新定位坐标" placement="right" effect="light">
              <el-input :value="temp.latitude? (temp.latitude+','+temp.longitude): ''"/>
            </el-tooltip>
            <el-amap-search-box v-if="dialogStatus!=='show'" :search-option="searchOption" :on-search-result="onSearchResult" class="search-box" style="position: absolute;"/>
            <el-amap :center="mapCenter" :zoom="12" :events="mapEvents" :class="dialogStatus==='show'?'amap-dst-show':'amap-dst-edit'" vid="scenicSpotInfoMap">
              <el-amap-marker :position="mapCenter" vid="component-marker"/>
              <el-amap-info-window ref="pos-info-window" :visible="showPosWindow" :position="newPosition" :close-when-click-map="closeWhenClickMap">
                <div :style="slotStyle">
                  <b>确定将{{ temp.name }}定位更新</b>
                  <button @click="confirmPosition">{{ $t('global.confirm') }}</button>
                </div>
              </el-amap-info-window>
            </el-amap>
          </div>
        </el-form-item>
        <el-form-item :label="$t('travel.intro')" prop="twoThousand">
          <div v-if="dialogStatus==='show'">{{ temp.intro }}</div>
          <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.intro" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.bestDate')" prop="twoThousand">
          <div v-if="dialogStatus==='show'">{{ temp.bestDate }}</div>
          <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.bestDate" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.days')" prop="twoThousand">
          <div v-if="dialogStatus==='show'">{{ temp.days }}</div>
          <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.days" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.traffic')" prop="twoThousand">
          <div v-if="dialogStatus==='show'">{{ temp.traffic }}</div>
          <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.traffic" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.climate')" prop="twoThousand">
          <div v-if="dialogStatus==='show'">{{ temp.climate }}</div>
          <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.climate" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.lang')" prop="twoThousand">
          <div v-if="dialogStatus==='show'">{{ temp.lang }}</div>
          <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.lang" type="textarea"/>
        </el-form-item>
        <el-form-item :label="$t('travel.mores')" prop="twoThousand">
          <div v-if="dialogStatus==='show'">{{ temp.mores }}</div>
          <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.mores" type="textarea"/>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { getDstTree, getScenicSpotPage, getScenicSpot, saveScenicSpot } from '@/api/travel'
import { Message } from 'element-ui'
import TreeSelector from '@/components/TreeSelector'
import { getDictionary, getValue } from '@/utils/dict'
import { formatNumber } from '@/utils/index'
import ThumbnailUpload from '@/components/ThumbnailUpload'
let page
export default {
  name: 'ScenicSpotInfoDialog',
  components: { ThumbnailUpload, TreeSelector },
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    modal: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      map: null,
      treeDialogLoading: false,
      detailDialogVisible: false,
      commitLoading: false,
      dialogStatus: '',
      temp: {},
      bucket: process.env.BUCKET.PROD_IMG,
      domain: process.env.OSS_DOMAIN,
      closeWhenClickMap: true,
      showPosWindow: false,
      newPosition: [121.59996, 31.197646],
      currentPosition: {
        location: '',
        lng: '',
        lat: ''
      },
      /* 选取的位置 */
      chosePosition: {
        location: '',
        lng: '',
        lat: ''
      },
      citycode: '广州',
      searchOption: {
        city: '广州',
        citylimit: false,
        pageSize: 5,
        pageIndex: 2,
        lang: 'zh_cn'
      },
      scenicSpotTypeList: [],
      scenicSpotList: [],
      mapCenter: [121.59996, 31.197646],
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
          if (!e.lnglat || this.dialogStatus === 'show') {
            return
          }
          const mapWindow = this.$refs['dst-pos-info-window']
          mapWindow.$amapComponent.close()
          mapWindow.$amapComponent.open(mapWindow.$amap, { latitude: mapWindow.position[0], longitude: mapWindow.position[1] })
          this.showPosWindow = true
          this.newPosition = [e.lnglat.lng, e.lnglat.lat]
        }
      },
      slotStyle: {
        padding: '2px 8px',
        background: '#eee',
        color: '#333',
        border: '1px solid #aaa'
      },
      rules: {
        name: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        phone: [{ min: 0, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }],
        fifty: [{ min: 0, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }],
        twoThousand: [{ min: 0, max: 2000, message: '长度必须小于2000字符', trigger: 'blur' }],
        img: [{ min: 0, max: 700, message: '长度必须小于700字符', trigger: 'blur' }]
      }
    }
  },
  created() {
    getDictionary(this.$store, 'scenicSpotType').then(data => {
      this.scenicSpotTypeList = data
    })
    page = this
  },
  mounted() {
    // this.getSelectScenicSpotList()
  },
  methods: {
    getValue: getValue,
    formatNumber: formatNumber,
    loadDialogTreeData(node, resolve) {
      getDstTree(node ? node.data.id : null).then(response => {
        resolve(response.data.data.slice(0, 100))
      })
    },
    selectingNode: node => {
      if (node.id === page.temp.id || node.path.indexOf(page.temp.id) > 0) {
        Message.error('不能选择自己或子孙节点')
        return false
      } else {
        return true
      }
    },
    destinationSelected() {
      if (!this.temp.destinationId) {
        return
      }
      getScenicSpotPage({
        destinationId: this.temp.destinationId,
        size: 100
      }).then(response => {
        this.scenicSpotList = response.data.data.records
      })
    },
    saveScenicSpot() {
      if (this.dialogStatus !== 'edit') {
        this.dialogStatus = 'edit'
      } else {
        this.$refs.dataForm.validate(valid => {
          if (valid) {
            this.commitLoading = true
            saveScenicSpot(this.temp).then(response => {
              // this.getList()
              this.commitLoading = this.detailDialogVisible = false
            }, () => {
              this.commitLoading = false
            })
          } else {
            this.$message.warning('操作失败，请检查')
            return false
          }
        })
      }
    },
    /**
     * @description [fnUploadSuccess 文件上传成功的函数]
     * @author   shanshuizinong
     * @return   {null}  [没有返回]
     */
    fnUploadSuccess(response, file, fileList) {
      if (file) {
        this.temp.img = file.path
        this.temp.imgUrl = this.getImgUrl(file.path)
      }
    },
    getBucketUrl() {
      return 'https://' + this.bucket + '.' + this.domain + '/'
    },
    onSearchResult(pois) {
      console.log(pois)
      if (pois.length > 0) {
        const center = {
          lng: pois[0].lng,
          lat: pois[0].lat
        }
        this.mapCenter = [center.lng, center.lat]
      }
    },
    confirmPosition() {
      this.temp.longitude = this.newPosition[0]
      this.temp.latitude = this.newPosition[1]
      this.mapCenter = this.newPosition
      this.closeMapInfoWindow()
    },
    closeMapInfoWindow() {
      const mapWindow = this.$refs['pos-info-window']
      if (mapWindow) {
        mapWindow.$amapComponent.close()
      }
    },
    show(id, status) {
      this.dialogStatus = status || 'show'
      this.detailDialogVisible = true
      if (id) {
        getScenicSpot(id).then(response => {
          this.temp = response.data.data
          this.temp.imgUrl = this.getImgUrl(this.temp.img)
          this.mapCenter = [this.temp.longitude, this.temp.latitude]
          this.closeMapInfoWindow()
        })
      } else {
        console.log(this.temp)
      }
    },
    getImgUrl(img) {
      if (img) {
        return 'https://' + this.bucket + '.' + this.domain + '/' + img + '-small'
      }
      return null
    }
  }
}
</script>
<style>
.amap-dst-edit {
  height: 300px;
}
.amap-dst-edit-item {
  width: 600px;
  height: 400px;
  margin-bottom: 40px;
}
amap-dst-map {
height: 350px;
}
.amap-dst-show {
  width: 600px;
  height: 220px;
}
.amap-dst-container {
  width: 600px;
  height: 200px;
}
.search-box {
  position: absolute;
  top: 25px;
  left: 10px;
  margin-top: 20px;
}
.thumbnail-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.thumbnail-uploader .el-upload:hover {
  border-color: #409EFF;
}
.thumbnail-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.thumbnail {
  width: 178px;
  display: block;
}
.small {
  max-width: 380px;
  max-height: 380px;
  display: block;
}
</style>
