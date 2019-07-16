<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('travel.queryNamePlaceholder')" v-model="listQuery.name" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="query"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="query">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="showCreateDialog">{{ $t('table.add') }}</el-button>
      <el-checkbox v-model="listQuery.listChildren" class="filter-item" style="margin-left:55px;" @change="getList">{{ $t('travel.children') }}</el-checkbox>
    </div>
    <el-container>
      <el-aside>
        <el-scrollbar class="tree-panel">
          <el-tree ref="tree" :load="loadTreeNodeData" :data="data" :props="defaultProps" lazy @node-click="handleNodeClick"/>
        </el-scrollbar>
      </el-aside>
      <el-main>
        <el-table
          v-loading="listLoading"
          :key="tableKey"
          :data="list"
          border
          fit
          highlight-current-row
          style="width: 100%;">
          <el-table-column :label="$t('travel.thumbnail')" sortable="custom" align="center" width="120">
            <template slot-scope="scope">
              <el-link :underline="false" type="primary" @click="openDetailDialog(scope.row)">
                <el-image
                  :src="'https://' + bucket + '.' + domain + '/' + scope.row.img + '-thumbnail'"
                  style="width: 100px;" />
              </el-link>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.name')" width="100px" align="center">
            <template slot-scope="scope">
              <el-link :underline="false" type="primary" @click="openDetailDialog(scope.row)">{{ scope.row.name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.enName')" min-width="100px">
            <template slot-scope="scope">
              <el-link :underline="false" type="primary" @click="openDetailDialog(scope.row)">{{ scope.row.enName }}</el-link>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.intro')" min-width="200px" align="center">
            <template slot-scope="scope">
              <span>{{ subInfo(scope.row.subIntro) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.bestDate')" width="150px">
            <template slot-scope="scope">
              <span>{{ subInfo(scope.row.bestDate) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.days')" min-width="120px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.days }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.parentDst')" min-width="65px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.parentName }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column :label="$t('travel.grade')" min-width="65px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.grade === -1? "" : scope.row.grade / 100 }}</span>
            </template>
          </el-table-column> -->
          <el-table-column :label="$t('travel.layer')" min-width="65px" align="center">
            <template slot-scope="scope">
              <span>{{ getValue('destinationLayer', scope.row.layer) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.actions')" align="center" min-width="150" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button class="handle-btn" type="primary" icon="el-icon-info" width="" @click="openDetailDialog(scope.row)">详细</el-button>
              <el-button class="handle-btn" type="primary" icon="el-icon-discover" width="" @click="openScenicSpotDialog(scope.row)">景点</el-button>
              <el-button class="handle-btn" type="primary" icon="el-icon-collection" width="" @click="openAncestorDialog(scope.row)">祖先</el-button>
              <el-button :loading="scope.row.deleteLoading" class="handle-btn" type="danger" icon="el-icon-delete" width="" @click="deleteDst(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total>0" :total="total" :page-size="listQuery.size" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
        <el-dialog :title="$t('global.detail')" :visible.sync="detailDialogVisible">
          <div class="dialog-footer" style="text-align: right; margin-right: 30px; margin-bottom: 20px;">
            <!-- <el-button v-if="dialogStatus!=='show'" @click="dialogStatus = 'show'">{{ $t('global.cancel') }}</el-button> -->
            <el-button :loading="commitLoading" type="primary" @click="saveDst()">
              {{ dialogStatus==='show'? $t('global.edit'): $t('global.save') }}
            </el-button>
          </div>
          <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 600px; margin-left:50px;">
            <el-form-item :label="$t('global.img')" prop="img">
              <thumbnail-upload v-if="dialogStatus==='edit'" :url="getBucketUrl()" :path="'temp'" :success="fnUploadSuccess">
                <div slot="main">
                  <img v-if="temp.img" :src="temp.imgUrl" class="small">
                  <i v-else class="el-icon-plus avatar-uploader-icon"/>
                </div>
              </thumbnail-upload>
              <img v-else :src="temp.imgUrl" class="small">
            </el-form-item>
            <el-form-item :label="$t('global.name')" prop="name">
              <div v-if="dialogStatus==='show'">{{ temp.name }}</div>
              <el-input v-else :placeholder="$t('travel.namePlaceHolder')" v-model="temp.name"/>
            </el-form-item>
            <el-form-item :label="$t('global.enName')" prop="fifty">
              <div v-if="dialogStatus==='show'">{{ temp.enName }}</div>
              <el-input v-else :placeholder="$t('travel.enNamePlaceHolder')" v-model="temp.enName"/>
            </el-form-item>
            <el-form-item :label="$t('travel.parentDst')" prop="parentId">
              <div v-if="dialogStatus==='show'">{{ temp.parentName }}</div>
              <tree-selector
                v-else
                :placeholder="$t('travel.parentPlaceHolder')"
                :load="loadDialogTreeData"
                :query-data="loadQueryDstData"
                :dialog-loading="treeDialogLoading"
                :show-prop.sync="temp.parentName"
                :selecting-node="selectingNode"
                :value.sync="temp.parentId"
                node-label="name"
                node-value="id"
                height="250px"/>
            </el-form-item>
            <el-form-item :label="$t('travel.layer')" prop="layer">
              <div v-if="dialogStatus==='show'">{{ getValue('destinationLayer', temp.layer) }}</div>
              <el-select v-else v-model="temp.layer" :placeholder="$t('travel.layer')" clearable class="filter-item" style="width: 130px">
                <el-option v-for="item in stateLayerList" :key="item.name" :label="item.value" :value="item.name"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('travel.position')" :class="dialogStatus==='show'?'amap-dst-show':'amap-dst-edit-item'">
              <!-- <div id="container-map" style="width:500px; height:200px"/>
              <button @click="addTool">加载</button>
              <input id="input_id" type="text">
              <span>{{ chosePosition }}</span> -->
              <div v-if="dialogStatus==='show'">{{ temp.latitude? (temp.latitude+','+temp.longitude): '' }}</div>
              <el-tooltip v-else :disabled="dialogStatus==='show'" content="右键点击地图更新定位坐标" placement="right" effect="light">
                <el-input :value="temp.latitude? (temp.latitude+','+temp.longitude): ''"/>
              </el-tooltip>
              <el-amap-search-box v-if="dialogStatus!=='show'" :search-option="searchOption" :on-search-result="onSearchResult" class="search-box"/>
              <el-amap :center="mapCenter" :zoom="12" :events="mapEvents" :class="dialogStatus==='show'?'amap-dst-show':'amap-dst-edit'" vid="amapDemo">
                <el-amap-marker :position="mapCenter" vid="component-marker"/>
                <el-amap-info-window ref="dst-pos-info-window" :visible="showPosWindow" :position="newPosition" :close-when-click-map="closeWhenClickMap">
                  <div :style="slotStyle">
                    <b>确定将{{ temp.name }}定位更新</b>
                    <button @click="confirmPosition">{{ $t('global.confirm') }}</button>
                  </div>
                </el-amap-info-window>
              </el-amap>
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
        <el-dialog :title="$t('travel.scenicSpot')" :visible.sync="scenicSpotDialogVisible" width="1200">
          <scenic-spot-dialog ref="selectScenicSpotDialog" append-to-body @selected="changeScenicSpotDst"/>
          <div style="margin-bottom: 20px;">
            <el-button v-waves type="primary" @click="openSelectScenicSpotDialog">{{ $t('global.add') }}</el-button>
          </div>
          <el-table
            v-loading="scenicSpotDialogLoading"
            :key="tableKey"
            :data="scenicSpotList"
            border
            highlight-current-row
            style="width: 100%;">
            <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="65">
              <template slot-scope="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('travel.name')" width="100px" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('travel.enName')" min-width="100px">
              <template slot-scope="scope">
                <span>{{ scope.row.enName }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('travel.type')" min-width="40px">
              <template slot-scope="scope">
                <span>{{ getValue('scenicSpotType', scope.row.type) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('travel.intro')" min-width="200px" align="center">
              <template slot-scope="scope">
                <span>{{ subInfo(scope.row.subIntro) }}</span>
              </template>
            </el-table-column>
            <!-- <el-table-column :label="$t('table.actions')" align="center" min-width="80" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button :loading="scope.row.removeScenicSpotLoading" type="danger" icon="el-icon-delete" @click="removeScenicSpot(scope.row)">移除</el-button>
              </template>
            </el-table-column> -->
          </el-table>
        </el-dialog>
        <el-dialog v-loading="ancestorLoading" :title="$t('travel.ancestorEdit')" :visible.sync="ancestorDialogVisible">
          <el-table
            :data="ancestorList"
            border
            fit
            highlight-current-row
            style="width: 100%;">
            <el-table-column :label="$t('global.id')" width="50px" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.id }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('travel.name')" width="200px" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('travel.enName')" width="200px" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.enName }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')" align="center" min-width="80" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <div style="display:flex; justify-content: center; align-items: center;">
                  <tree-selector
                    :placeholder="$t('travel.parentPlaceHolder')"
                    :load="loadDialogTreeData"
                    :dialog-loading="treeDialogLoading"
                    :selecting-node="selectingAncestorNode"
                    :query-data="loadQueryDstData"
                    icon="el-icon-info"
                    input-type="button"
                    button-text="插入"
                    node-label="name"
                    node-value="id"
                    @click="ancestorIndex=scope.$index"
                    @selected="selectedNode"/>
                  <el-button type="danger" icon="el-icon-delete" size="medium" style="height:35px;margin-left:10px;" @click="removeAncestor(scope.$index)">移除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex;justify-content: center;margin-top: 20px;">
            <el-button @click="ancestorDialogVisible = false">{{ $t('global.cancel') }}</el-button>
            <el-button :loading="commitLoading" type="primary" @click="saveAncestor">
              {{ $t('global.confirm') }}
            </el-button>
          </div>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script>
/**
  Auth: dalizi
  Created: 2019/4/10-14:54
*/
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import ThumbnailUpload from '@/components/ThumbnailUpload'
import { Message } from 'element-ui'
import TreeSelector from '@/components/TreeSelector'
import ScenicSpotDialog from '@/components/ScenicSpotDialog'
import { getDstTree, getDstPage, saveDst, deleteDst, getAncestor, getScenicSpotPage, changeScenicSpotDst } from '@/api/travel'
import { getDictionary, getValue } from '@/utils/dict'
import waves from '@/directive/waves' // Waves directive
// import AMap from 'AMap'
let dstPage
export default {
  name: 'DestinationList',
  components: { Pagination, TreeSelector, ThumbnailUpload, ScenicSpotDialog },
  directives: { waves },
  data() {
    return {
      map: null,
      dialogStatus: '',
      detailDialogVisible: false,
      ancestorDialogVisible: false,
      scenicSpotDialogVisible: false,
      selectScenicSpotDialogVisible: false,
      closeWhenClickMap: true,
      tableKey: 0,
      total: 0,
      bucket: process.env.BUCKET.PROD_IMG,
      domain: process.env.OSS_DOMAIN,
      listLoading: false,
      dialogLoading: false,
      commitLoading: false,
      saveScenicSpotLoading: false,
      ancestorLoading: false,
      scenicSpotDialogLoading: false,
      scenicSpotSelectLoading: false,
      treeDialogLoading: false,
      expandAll: false,
      removeScenicSpotLoading: false,
      dstQuery: {
        name: ''
      },
      data: [],
      list: [],
      ancestorList: [],
      scenicSpotList: [],
      selectScenicSpotList: [],
      stateLayerList: [],
      scenicSpotTotal: 0,
      selectScenicSpotTotal: 0,
      ancestorIndex: -1,
      listQuery: {
        size: 10,
        page: 1,
        parentId: null,
        name: '',
        listChildren: false
      },
      scenicSpotQuery: {
        size: 5,
        page: 1,
        name: ''
      },
      temp: {},
      tempAncestor: {},
      args: [null, null, 'timeLine'],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      rules: {
        name: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        fifty: [{ min: 0, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }],
        twoThousand: [{ min: 0, max: 2000, message: '长度必须小于2000字符', trigger: 'blur' }],
        img: [{ min: 0, max: 700, message: '长度必须小于700字符', trigger: 'blur' }]
      },
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
      getValue: getValue,
      citycode: '广州',
      searchOption: {
        city: '广州',
        citylimit: false,
        pageSize: 5,
        pageIndex: 2,
        lang: 'zh_cn'
      },
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
      showPosWindow: false,
      newPosition: [121.59996, 31.197646],
      slotStyle: {
        padding: '2px 8px',
        background: '#eee',
        color: '#333',
        border: '1px solid #aaa'
      }
    }
  },
  created() {
    const _this = this
    this.getList()
    dstPage = this
    getDictionary(this.$store, 'scenicSpotType')
    getDictionary(this.$store, 'destinationLayer').then(data => {
      _this.stateLayerList = data
    })
  },
  mounted() {
  },
  methods: {
    removeScenicSpot(row) {
      console.log(row)
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    getScenicSpotType(type) {
      for (let index = 0; index < this.scenicSpotType.length; index++) {
        const element = this.scenicSpotType[index]
        if (element.name === type) {
          return element.value
        }
      }
      return type
    },
    // beforeAvatarUpload(file) {
    //   const isJPG = file.type === 'image/jpeg'
    //   const isLt2M = file.size / 1024 / 1024 < 8

    //   if (!isJPG) {
    //     this.$message.error('上传头像图片只能是 JPG 格式!')
    //   }
    //   if (!isLt2M) {
    //     this.$message.error('上传头像图片大小不能超过 2MB!')
    //   }
    //   return isJPG && isLt2M
    // },
    showCreateDialog() {
      this.detailDialogVisible = true
      this.dialogStatus = 'create'
      this.temp = {}
      this.newPosition = this.mapCenter
      this.closeMapInfoWindow()
    },
    closeMapInfoWindow() {
      const mapWindow = this.$refs['dst-pos-info-window']
      if (mapWindow) {
        mapWindow.$amapComponent.close()
      }
    },
    saveDst() {
      if (this.dialogStatus !== 'edit') {
        this.dialogStatus = 'edit'
      } else {
        this.$refs.dataForm.validate(valid => {
          if (valid) {
            this.commitLoading = true
            saveDst(this.temp).then(response => {
              this.getList()
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
    confirmPosition() {
      this.temp.longitude = this.newPosition[0]
      this.temp.latitude = this.newPosition[1]
      this.mapCenter = this.newPosition
      this.closeMapInfoWindow()
    },
    saveAncestor() {
      this.commitLoading = true
      const tempDest = {
        ...this.temp,
        ancestor: []
      }
      // 这里只更新祖宗节点路径，不更新parentId， 所以设置为空
      tempDest.parentId = null
      for (let i = 0; i < this.ancestorList.length; i++) {
        tempDest.ancestor.push(this.ancestorList[i].id)
      }
      saveDst(tempDest).then(response => {
        this.getList()
        this.commitLoading = this.ancestorDialogVisible = false
      }, () => {
        this.commitLoading = false
      })
    },
    removeAncestor(index) {
      this.$confirm('你确实要删除此节点?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.ancestorList.splice(index, 1)
      })
    },
    openSelectScenicSpotDialog() {
      this.$refs['selectScenicSpotDialog'].show()
    },
    openAncestorDialog(row) {
      this.ancestorDialogVisible = true
      this.ancestorLoading = true
      this.temp = row
      getAncestor(row.id).then(response => {
        this.ancestorList = response.data.data
        this.ancestorLoading = false
      }).catch(e => {
        this.ancestorLoading = false
      })
    },
    openScenicSpotDialog(row) {
      this.scenicSpotDialogVisible = true
      this.scenicSpotDialogLoading = true
      this.temp = row
      getScenicSpotPage({
        parentDstId: row.id
      }).then(response => {
        this.scenicSpotList = response.data.data.records
        for (let i = 0; i < this.scenicSpotList.length; i++) {
          const data = this.scenicSpotList[i]
          data.deleteLoading = false
          if (data.intro && data.intro.length > 100) {
            data.subIntro = data.intro.slice(0, 100) + '...'
          } else {
            data.subIntro = data.intro
          }
        }
        this.scenicSpotTotal = response.data.data.total
        this.scenicSpotDialogLoading = false
      })
    },
    openDetailDialog(row) {
      this.dialogStatus = 'show'
      this.detailDialogVisible = true
      this.temp = row
      this.temp.imgUrl = this.getImgUrl(row.img)
      this.mapCenter = [this.temp.longitude, this.temp.latitude]
      this.$nextTick(() => {
        this.initMap()
      })
      this.closeMapInfoWindow()
    },
    deleteDst(row) {
      row.deleteLoading = true
      this.$confirm('你确实要删除此节点?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDst(row.id).then(response => {
          this.getList()
          this.loadTreeNodeData()
          row.deleteLoading = false
        }, () => {
          row.deleteLoading = false
        })
      })
    },
    initMap() {
      // this.map = new AMap.Map('container-map', {
      //   resizeEnable: true,
      //   zoom: 15,
      //   viewMode: '2D',
      //   zooms: [4, 18]
      // })
      // /* 添加工具条 */
      // this.addTool()
      // this.search()
    },
    /* 添加工具条 */
    addTool() {
      // AMap.plugin(['AMap.ToolBar', 'AMap.Driving'], () => {
      //   const toolbar = new AMap.ToolBar()
      //   this.map.addControl(toolbar)
      // })
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
    subInfo(str) {
      if (!str) {
        return str
      }
      if (str.length > 100) {
        return str.slice(0, 100) + '...'
      }
      return str
    },
    message(row) {
      this.$message.info(row.event)
    },
    handleNodeClick(node) {
      this.listQuery.parentId = node.id
      this.listQuery.name = ''
      this.getList()
    },
    query() {
      this.listQuery.parentId = null
      this.getList()
    },
    getList() {
      this.listLoading = true
      getDstPage(this.listQuery).then(response => {
        this.list = response.data.data.records
        for (let i = 0; i < this.list.length; i++) {
          const data = this.list[i]
          data.deleteLoading = false
          if (data.intro && data.intro.length > 100) {
            data.subIntro = data.intro.slice(0, 100) + '...'
          } else {
            data.subIntro = data.intro
          }
        }
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    loadTreeNodeData(node, resolve) {
      getDstTree(node ? node.data.id : null).then(response => {
        if (node && node.data && node.data.id) {
          resolve(response.data.data)
        } else {
          this.data = response.data.data.slice(0, 300)
          for (let i = 0; i < this.data.length; i++) {
            this.data[i].children = [{}]
          }
        }
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
    loadDialogTreeData(node, resolve) {
      getDstTree(node ? node.data.id : null).then(response => {
        resolve(response.data.data.slice(0, 300))
      })
    },
    selectingNode: node => {
      if (node.id === dstPage.temp.id || node.path.indexOf(dstPage.temp.id) > 0) {
        Message.error('不能选择自己或子孙节点')
        return false
      } else {
        return true
      }
    },
    selectingAncestorNode: node => {
      for (let i = 0; i < dstPage.ancestorList.length; i++) {
        if (dstPage.ancestorList[i].id === node.id) {
          Message.error('不能重复选择')
          return false
        }
        return true
      }
    },
    selectedNode: node => {
      dstPage.ancestorList.splice(dstPage.ancestorIndex, 0, node)
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
    getImgUrl(img) {
      if (img) {
        return 'https://' + this.bucket + '.' + this.domain + '/' + img + '-small'
      }
      return null
    },
    getBucketUrl() {
      return 'https://' + this.bucket + '.' + this.domain + '/'
    },
    changeScenicSpotDst(selectedScenicSpot) {
      if (!selectedScenicSpot) return
      const arr = []
      for (let index = 0; index < selectedScenicSpot.length; index++) {
        const scenicSpot = selectedScenicSpot[index]
        arr.push(scenicSpot.id)
      }
      changeScenicSpotDst({
        dstId: this.temp.id,
        scenicSpots: arr
      }).then(response => {
        this.scenicSpotList = response.data.data.records
        for (let i = 0; i < this.scenicSpotList.length; i++) {
          const data = this.scenicSpotList[i]
          data.deleteLoading = false
          if (data.intro && data.intro.length > 100) {
            data.subIntro = data.intro.slice(0, 100) + '...'
          } else {
            data.subIntro = data.intro
          }
        }
      })
    }
  }
}
</script>
<style scoped>
.tree-panel {
  height: 750px;
}
.amap-dst-edit {
  height: 300px;
}
.amap-dst-edit-item {
  height: 400px;
}
.amap-dst-show {
  height: 200px;
}
.search-box {
  position: relative;
  top: 25px;
  left: 10px;
}
.handle-btn {
  margin-left: 0px;
  margin-top: 5px;
}
.small {
  max-width: 380px;
  max-height: 380px;
  display: block;
}
</style>
