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
              <el-link :underline="false" type="primary" @click="openDetailDialog(scope.row)">{{ scope.row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.bestDate')" min-width="40px">
            <template slot-scope="scope">
              <span>{{ scope.row.bestDate }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.playTime')" min-width="40px">
            <template slot-scope="scope">
              <span>{{ scope.row.playDays }}天</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.travelCost')" min-width="40px">
            <template slot-scope="scope">
              <span>{{ formatNumber(scope.row.travelCost) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.ticketCost')" min-width="40px">
            <template slot-scope="scope">
              <span>{{ formatNumber(scope.row.ticketCost) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('travel.intro')" min-width="200px" align="center">
            <template slot-scope="scope">
              <span>{{ subInfo(scope.row.subIntro) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.actions')" align="center" min-width="80" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit"><router-link :to="{path: '/travel/edit-route-line', query: { routeLine: scope.row}}">编辑</router-link></el-button>
              <el-button :loading="scope.row.deleteLoading" type="danger" icon="el-icon-delete" @click="deleteScenicSpot(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total>0" :total="total" :page-size="listQuery.size" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
      </el-main>
    </el-container>
    <el-dialog :load="dialogLoading" :title="'路线详情'" :visible.sync="detailDialogVisible" width="1200px">
      <route-line-detail :route-line="routeLine"/>
    </el-dialog>
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
import RouteLineDetail from '@/components/RouteLineDetail'
// import ScenicSpotInfoDialog from '@/components/ScenicSpotInfoDialog'
import { getDstTree, getRouteLinePage, getRouteLine } from '@/api/travel'
import waves from '@/directive/waves' // Waves directive
import { formatNumber } from '@/utils/index'
// import AMap from 'AMap'
let dstPage
export default {
  name: 'RouteLineList',
  components: { Pagination, TreeSelector, RouteLineDetail },
  directives: { waves },
  data() {
    return {
      detailDialogVisible: false,
      tableKey: 0,
      total: 0,
      listLoading: false,
      dialogLoading: false,
      dstQuery: {
        name: ''
      },
      bucket: process.env.BUCKET.PROD_IMG,
      domain: process.env.OSS_DOMAIN,
      data: [],
      list: [],
      listQuery: {
        size: 10,
        page: 1,
        dstId: null,
        name: '',
        type: ''
      },
      temp: {},
      routeLine: {
        title: ''
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created() {
    // const _this = this
    // this.$store.getters.getDict('scenicSpotType', data => {
    //   _this.scenicSpotType = data
    // })
    this.getList()
    dstPage = this
  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    formatNumber: formatNumber,
    openDetailDialog(row) {
      this.dialogLoading = true
      getRouteLine(row.id).then(response => {
        this.routeLine = response.data.data
        this.detailDialogVisible = true
        this.dialogLoading = false
      })
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
</style>
