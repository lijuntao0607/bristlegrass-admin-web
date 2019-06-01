<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('travel.queryNamePlaceholder')" v-model="listQuery.name" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="query"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="query">{{ $t('table.search') }}</el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus"><router-link to="/travel/edit-route-line">新建路线</router-link></el-button>
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
              <el-link :underline="false" type="primary">{{ scope.row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.bestDate')" min-width="40px">
            <template slot-scope="scope">
              <span>{{ scope.row.bestDate }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.days')" min-width="40px">
            <template slot-scope="scope">
              <span>{{ scope.row.days }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.travelCost')" min-width="40px">
            <template slot-scope="scope">
              <span>{{ scope.row.travelCost }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.ticketCost')" min-width="40px">
            <template slot-scope="scope">
              <span>{{ scope.row.ticketCost }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.intro')" min-width="200px" align="center">
            <template slot-scope="scope">
              <span>{{ subInfo(scope.row.subIntro) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.actions')" align="center" min-width="80" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-info" width="" @click="openDetailDialog(scope.row)"/>
              <el-button :loading="scope.row.deleteLoading" type="danger" icon="el-icon-delete" width="" @click="deleteScenicSpot(scope.row)"/>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total>0" :total="total" :page-size="listQuery.size" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
      </el-main>
    </el-container>
  </div>
</template>

<script>
/**
  Auth: dalizi
  Created: 2019/4/10-14:54
*/
import ThumbnailUpload from '@/components/ThumbnailUpload'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'
import TreeSelector from '@/components/TreeSelector'
import ScenicSpotDialog from '@/components/ScenicSpotDialog'
// import ScenicSpotInfoDialog from '@/components/ScenicSpotInfoDialog'
import { getDstTree, getRouteLinePage, saveScenicSpot, deleteScenicSpot } from '@/api/travel'
import waves from '@/directive/waves' // Waves directive
// import AMap from 'AMap'
let dstPage
export default {
  name: 'RouteLineList',
  components: { Pagination, TreeSelector, ThumbnailUpload, ScenicSpotDialog },
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
      bucket: process.env.BUCKET.PROD_IMG,
      domain: process.env.OSS_DOMAIN,
      data: [],
      list: [],
      scenicSpotType: [],
      listQuery: {
        size: 10,
        page: 1,
        dstId: null,
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
    const _this = this
    // this.loadTreeNode()
    this.getList()
    dstPage = this
    this.$store.getters.getDict('scenicSpotType', data => {
      _this.scenicSpotType = data
    })
  },
  mounted() {
  },
  methods: {
    getScenicSpotType(type) {
      for (let index = 0; index < this.scenicSpotType.length; index++) {
        const element = this.scenicSpotType[index]
        if (element.name === type) {
          return element.value
        }
      }
      return type
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
      this.temp.imgUrl = this.getImgUrl(row.img)
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
      getRouteLinePage(this.listQuery).then(response => {
        this.list = response.data.data.records
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
    },
    getImgUrl(img) {
      if (img) {
        return 'https://' + this.bucket + '.' + this.domain + '/' + img + '-small'
      }
      return null
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
