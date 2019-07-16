<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('travel.queryNamePlaceholder')" v-model="listQuery.name" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="query"/>
      <el-select v-model="listQuery.type" :placeholder="$t('travel.type')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in scenicSpotType" :key="item.name" :label="item.value" :value="item.name"/>
      </el-select>
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
              <span>{{ scope.row.enName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.type')" min-width="40px">
            <template slot-scope="scope">
              <span>{{ getScenicSpotType(scope.row.type) }}</span>
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
        <pagination v-show="total>0" :total="total" :page-size="listQuery.size" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
        <scenic-spot-info-dialog ref="scenicSpotInfoDialog" editable />
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
import ScenicSpotInfoDialog from '@/components/ScenicSpotInfoDialog'
import { getDstTree, getScenicSpotPage, deleteScenicSpot } from '@/api/travel'
import waves from '@/directive/waves' // Waves directive
// import AMap from 'AMap'
let dstPage
export default {
  name: 'ScenicSpotList',
  components: { Pagination, TreeSelector, ThumbnailUpload, ScenicSpotDialog, ScenicSpotInfoDialog },
  directives: { waves },
  data() {
    return {
      map: null,
      dialogStatus: '',
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
      scenicSpotList: [],
      showPosWindow: false
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
    destinationSelected() {
      if (!this.temp.destinationId) {
        return
      }
      getScenicSpotPage({
        dstId: this.temp.destinationId,
        size: 100
      }).then(response => {
        this.scenicSpotList = response.data.data.records
      })
    },
    showCreateDialog() {
      this.temp = {}
      this.newPosition = this.mapCenter
      // this.closeMapInfoWindow()
    },
    openDetailDialog(row) {
      this.dialogStatus = 'show'
      this.$refs['scenicSpotInfoDialog'].show(row.id)
      this.temp = row
      this.temp.imgUrl = this.getImgUrl(row.img)
      this.mapCenter = [this.temp.longitude, this.temp.latitude]
      // this.closeMapInfoWindow()
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
    closeMapInfoWindow() {
      const mapWindow = this.$refs['dst-pos-info-window']
      if (mapWindow) {
        mapWindow.$amapComponent.close()
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
      this.listQuery.dstId = node.id
      this.listQuery.name = ''
      this.getList()
    },
    query() {
      this.listQuery.dstId = null
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
