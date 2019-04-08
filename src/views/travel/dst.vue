<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('travel.queryNamePlaceholder')" v-model="dstQuery.name" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
    </div>
    <!-- <tree-table v-loading="listLoading" :data="data" :eval-func="func" :eval-args="args" :expand-all="expandAll" border>
      <el-table-column label="目的地">
        <template slot-scope="scope">
          <span style="color:sandybrown">{{ scope.row.name }}</span>
          <el-tag>{{ scope.row.timeLine+'ms' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间线">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.timeLine+'ms'" effect="dark" placement="left">
            <div class="processContainer">
              <div
                :style="{ width:scope.row._width * 500+'px',
                          background:scope.row._width>0.5?'rgba(233,0,0,.5)':'rgba(0,0,233,0.5)',
                          marginLeft:scope.row._marginLeft * 500+'px' }"
                class="process">
                <span style="display:inline-block"/>
              </div>
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="text" @click="message(scope.row)">点击</el-button>
        </template>
      </el-table-column>
    </tree-table> -->
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
              <span>{{ scope.row.grade }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column :label="$t('table.readings')" align="center" width="95">
            <template slot-scope="scope">
              <span v-if="scope.row.pageviews" class="link-type" @click="handleFetchPv(scope.row.pageviews)">{{ scope.row.pageviews }}</span>
              <span v-else>0</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column> -->
          <el-table-column :label="$t('table.actions')" align="center" min-width="230" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="primary" width="" @click="openParamDialog(scope.row)">{{ $t('global.detail') }}</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
      </el-main>
    </el-container>
  </div>
</template>

<script>
/**
  Auth: Lei.j1ang
  Created: 2018/1/19-14:54
*/
import treeTable from '@/components/TreeTable'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { getDstTree, getDstPage } from '@/api/travel'
import treeToArray from './customEval'
import waves from '@/directive/waves' // Waves directive
import splitPane from 'vue-splitpane'
export default {
  name: 'DestinationList',
  components: { treeTable, splitPane, Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      total: 0,
      listLoading: false,
      func: treeToArray,
      expandAll: false,
      dstQuery: {
        name: ''
      },
      data: [],
      list: [],
      listQuery: {},
      args: [null, null, 'timeLine'],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created() {
    // this.loadTreeNode()
  },
  methods: {
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
      this.getList(node)
    },
    getList(node) {
      this.listLoading = true
      getDstPage(node.id).then(response => {
        this.list = response.data.data.records
        for (let i = 0; i < this.list.length; i++) {
          const data = this.list[i]
          if (data.intro && data.intro.length > 100) {
            data.subIntro = data.intro.slice(0, 100) + '...'
          } else {
            data.subIntro = data.intro
          }
        }
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
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleFilter() {
      // this.mddQuery.page = 1
      this.loadTreeNode()
    }
  }
}
</script>
<style scoped>
.tree-panel {
  height: 750px;
}
</style>
