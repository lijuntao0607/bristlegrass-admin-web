<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('travel.queryNamePlaceholder')" v-model="listQuery.name" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="showCreateDialog"/>
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
              <span>{{ scope.row.type }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.intro')" min-width="200px" align="center">
            <template slot-scope="scope">
              <span>{{ subInfo(scope.row.subIntro) }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column :label="$t('travel.bestDate')" width="150px">
            <template slot-scope="scope">
              <span>{{ subInfo(scope.row.bestDate) }}</span>
            </template>
          </el-table-column> -->
          <el-table-column :label="$t('travel.days')" min-width="120px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.days }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.grade')" min-width="65px" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.grade === -1? "" : scope.row.grade / 100 }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.actions')" align="center" min-width="80" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-info" width="" @click="openDetailDialog(scope.row)"/>
              <el-button :loading="scope.row.deleteLoading" type="danger" icon="el-icon-delete" width="" @click="deleteScenicSpot(scope.row)"/>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page-size="listQuery.pageSize" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

        <el-dialog :title="$t('global.detail')" :visible.sync="detailDialogVisible">
          <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 600px; margin-left:50px;">
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
              <el-input v-else :placeholder="$t('travel.namePlaceHolder')" v-model="temp.name"/>
            </el-form-item>
            <el-form-item :label="$t('global.enName')" prop="fifty">
              <div v-if="dialogStatus==='show'">{{ temp.enName }}</div>
              <el-input v-else :placeholder="$t('travel.enNamePlaceHolder')" v-model="temp.enName"/>
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
            <el-form-item :label="$t('travel.parentDst')" prop="destinationId">
              <div v-if="dialogStatus==='show'">{{ temp.parentName }}</div>
              <el-select v-else v-model="temp.parentId" :placeholder="$t('travel.parentScenicSpot')" clearable class="filter-item">
                <el-option v-for="item in scenicSpotList" :key="item.name" :label="item.value" :value="item.name"/>
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
          <div slot="footer" class="dialog-footer">
            <el-button @click="detailDialogVisible = false">{{ $t('global.cancel') }}</el-button>
            <el-button :loading="commitLoading" type="primary" @click="saveScenicSpot()">
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
import { Message } from 'element-ui'
import TreeSelector from '@/components/TreeSelector'
import { getDstTree, getScenicSpotPage, saveScenicSpot, deleteScenicSpot } from '@/api/travel'
import waves from '@/directive/waves' // Waves directive
// import AMap from 'AMap'
let dstPage
export default {
  name: 'DestinationList',
  components: { Pagination, TreeSelector },
  directives: { waves },
  data() {
    return {
      map: null,
      dialogStatus: '',
      detailDialogVisible: false,
      closeWhenClickMap: true,
      tableKey: 0,
      total: 0,
      listLoading: false,
      dialogLoading: false,
      commitLoading: false,
      treeDialogLoading: false,
      scenicSpotTreeDialogLoading: false,
      expandAll: false,
      dstQuery: {
        name: ''
      },
      data: [],
      list: [],
      listQuery: {
        size: 10,
        page: 1,
        destinationId: null,
        name: '',
        type: ''
      },
      temp: {},
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
      citycode: '广州',
      searchOption: {
        city: '广州',
        citylimit: false,
        pageSize: 5,
        pageIndex: 2,
        lang: 'zh_cn'
      },
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
    dstPage = this
  },
  mounted() {
  },
  methods: {
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
    saveScenicSpot() {
      if (this.dialogStatus !== 'edit') {
        this.dialogStatus = 'edit'
      } else {
        this.$refs.dataForm.validate(valid => {
          if (valid) {
            this.commitLoading = true
            saveScenicSpot(this.temp).then(response => {
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
    openDetailDialog(row) {
      this.dialogStatus = 'show'
      this.detailDialogVisible = true
      this.temp = row
      this.mapCenter = [this.temp.longitude, this.temp.latitude]
      this.closeMapInfoWindow()
    },
    deleteScenicSpot(row) {
      row.deleteLoading = true
      deleteScenicSpot(row.id).then(response => {
        this.getList()
        this.loadTreeNodeData()
        row.deleteLoading = false
      }, () => {
        row.deleteLoading = false
      })
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
      if (str.length > 100) {
        return str.slice(0, 100) + '...'
      }
      return str
    },
    message(row) {
      this.$message.info(row.event)
    },
    handleNodeClick(node) {
      this.listQuery.destinationId = node.id
      this.listQuery.name = ''
      this.getList()
    },
    query() {
      this.listQuery.destinationId = null
      this.getList()
    },
    getList() {
      this.listLoading = true
      getScenicSpotPage(this.listQuery).then(response => {
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
          this.data = response.data.data.slice(0, 100)
          for (let i = 0; i < this.data.length; i++) {
            this.data[i].children = [{}]
          }
        }
      })
    },
    loadDialogTreeData(node, resolve) {
      getDstTree(node ? node.data.id : null).then(response => {
        resolve(response.data.data.slice(0, 100))
      })
    },
    selectingNode: node => {
      if (node.id === dstPage.temp.id || node.path.indexOf(dstPage.temp.id) > 0) {
        Message.error('不能选择自己或子孙节点')
        return false
      } else {
        return true
      }
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
