<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('travel.queryNamePlaceholder')" v-model="listQuery.name" style="width: 200px;" class="filter-item" @keyup.enter.native="showCreateDialog"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="query">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="showCreateDialog">{{ $t('table.add') }}</el-button>
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
          <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="65">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.dstName')" width="100px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.dstEnName')" min-width="100px">
            <template slot-scope="scope">
              <span>{{ scope.row.enName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.dstIntro')" min-width="200px" align="center">
            <template slot-scope="scope">
              <span>{{ subInfo(scope.row.subIntro) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.dstBestDate')" width="150px">
            <template slot-scope="scope">
              <span>{{ subInfo(scope.row.bestDate) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.dstDays')" min-width="120px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.days }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.dstGrade')" min-width="65px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.grade === -1? "" : scope.row.grade / 100 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.actions')" align="center" min-width="80" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-info" width="" @click="openDetailDialog(scope.row)"/>
              <el-button type="danger" icon="el-icon-delete" width="" @click="openDetailDialog(scope.row)"/>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page-size="listQuery.pageSize" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

        <el-dialog v-loading="dialogLoading" :title="$t('global.detail')" :visible.sync="detailDialogVisible">
          <el-form ref="dataForm" :rules="rules" :model="tmpDst" label-position="left" label-width="70px" style="width: 600px; margin-left:50px;">
            <el-form-item :label="$t('global.img')" prop="img">
              <div v-if="dialogStatus==='show'">{{ '1' }}</div>
              <el-input v-else :placeholder="$t('global.img')" v-model="temp.img"/>
              <!-- <el-upload
                class="avatar-uploader"
                action="https://jsonplaceholder.typicode.com/posts/"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload">
                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload> -->
            </el-form-item>
            <el-form-item :label="$t('global.name')" prop="name">
              <div v-if="dialogStatus==='show'">{{ temp.name }}</div>
              <el-input v-else :placeholder="$t('travel.dstNamePlaceHolder')" v-model="temp.name"/>
            </el-form-item>
            <el-form-item :label="$t('global.enName')" prop="enName">
              <div v-if="dialogStatus==='show'">{{ temp.enName }}</div>
              <el-input v-else :placeholder="$t('travel.dstEnNamePlaceHolder')" v-model="temp.enName"/>
            </el-form-item>
            <el-form-item :label="$t('travel.position')" :class="dialogStatus==='show'?'amap-dst-show':'amap-dst-edit-item'">
              <!-- <div id="container-map" style="width:500px; height:200px"/>
              <button @click="addTool">加载</button>
              <input id="input_id" type="text">
              <span>{{ chosePosition }}</span> -->
              <el-input :value="temp.latitude+','+temp.longitude"/><span>右击地图更新目的地定位坐标</span>
              <el-amap-search-box v-if="dialogStatus!=='show'" :search-option="searchOption" :on-search-result="onSearchResult" class="search-box"/>
              <el-amap :center="mapCenter" :zoom="12" :events="mapEvents" :class="dialogStatus==='show'?'amap-dst-show':'amap-dst-edit'" vid="amapDemo">
                <el-amap-marker :position="mapCenter" vid="component-marker"/>
                <el-amap-info-window ref="dst-pos-info-window" :visible="showPosWindow" :position="newPosition">
                  <div :style="slotStyle">
                    <b>确定将{{ temp.name }}定位更新</b>
                    <button @click="confirmPosition">{{ $t('global.confirm') }}</button>
                  </div>
                </el-amap-info-window>
              </el-amap>
            </el-form-item>
            <el-form-item :label="$t('travel.intro')" prop="intro">
              <div v-if="dialogStatus==='show'">{{ temp.intro }}</div>
              <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.intro" type="textarea"/>
            </el-form-item>
            <el-form-item :label="$t('travel.bestDate')" prop="bestDate">
              <div v-if="dialogStatus==='show'">{{ temp.bestDate }}</div>
              <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.bestDate" type="textarea"/>
            </el-form-item>
            <el-form-item :label="$t('travel.days')" prop="days">
              <div v-if="dialogStatus==='show'">{{ temp.days }}</div>
              <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.days" type="textarea"/>
            </el-form-item>
            <el-form-item :label="$t('travel.climate')" prop="climate">
              <div v-if="dialogStatus==='show'">{{ temp.climate }}</div>
              <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.climate" type="textarea"/>
            </el-form-item>
            <el-form-item :label="$t('travel.lang')" prop="lang">
              <div v-if="dialogStatus==='show'">{{ temp.lang }}</div>
              <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.lang" type="textarea"/>
            </el-form-item>
            <el-form-item :label="$t('travel.mores')" prop="mores">
              <div v-if="dialogStatus==='show'">{{ temp.mores }}</div>
              <el-input v-else :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.mores" type="textarea"/>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="detailDialogVisible = false">{{ $t('global.cancel') }}</el-button>
            <el-button type="primary" @click="saveDst()">
              {{ dialogStatus==='show'? $t('global.edit'): $t('global.confirm') }}
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
import { getDstTree, getDstPage, saveDst } from '@/api/travel'
import treeToArray from './customEval'
import waves from '@/directive/waves' // Waves directive
// import AMap from 'AMap'

export default {
  name: 'DestinationList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      map: null,
      dialogStatus: '',
      detailDialogVisible: false,
      tableKey: 0,
      total: 0,
      listLoading: false,
      dialogLoading: false,
      func: treeToArray,
      expandAll: false,
      dstQuery: {
        name: ''
      },
      tmpDst: {},
      data: [],
      list: [],
      listQuery: {
        size: 10,
        page: 1,
        parentId: null,
        name: ''
      },
      temp: {},
      args: [null, null, 'timeLine'],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'change' }]
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
    // this.loadTreeNode()
    this.getList()
  },
  mounted() {
  },
  methods: {
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
        this.dialogLoading = true
        saveDst(this.temp).then(response => {
          this.dialogLoading = this.detailDialogVisible = false
          this.getList()
        })
      }
    },
    confirmPosition() {
      this.temp.longitude = this.newPosition[0]
      this.temp.latitude = this.newPosition[1]
      this.mapCenter = this.newPosition
      this.closeMapInfoWindow()
    },
    openDetailDialog(row) {
      this.dialogStatus = 'show'
      this.detailDialogVisible = true
      this.temp = row
      this.mapCenter = [this.temp.longitude, this.temp.latitude]
      this.$nextTick(() => {
        this.initMap()
      })
      this.closeMapInfoWindow()
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
    /* 搜索 */
    search() {
      // const vm = this
      // AMap.plugin(['AMap.PlaceSearch', 'AMap.Autocomplete'], () => {
      //   console.log('search')
      //   var autoOptions = {
      //     city: vm.citycode,
      //     input: 'input_id'
      //   }
      //   // eslint-disable-next-line no-unused-vars
      //   const autoComplete = new AMap.Autocomplete(autoOptions)
      //   // eslint-disable-next-line no-unused-vars
      //   const placeSearch = new AMap.PlaceSearch({
      //     city: vm.citycode,
      //     map: vm.map
      //   })
      //   AMap.event.addListener(autoComplete, 'select', e => {
      //     console.log(e)
      //   })
      // })
    },
    subInfo(str) {
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
          this.data = response.data.data.slice(0, 100)
          for (let i = 0; i < this.data.length; i++) {
            this.data[i].children = [{}]
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
</style>
