<template>
  <div class="app-container">
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
      <el-table-column :label="$t('crawler.crawlerName')" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('crawler.description')" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('crawler.source')" min-width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.source }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('crawler.industry')" width="80px">
        <template slot-scope="scope">
          <span>{{ scope.row.industryClassification }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('crawler.className')" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.className }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('crawler.jobStatus')" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.jobStatus }}</span>
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
          <el-button type="primary" width="" @click="openParamDialog(scope.row)">{{ $t('crawler.detail') }}</el-button>
          <el-button v-if="scope.row.jobStatus === 'running'" type="danger" width="" @click="stopJob(scope.row)">{{ $t('crawler.stopJob') }}</el-button>
          <el-button type="success" @click="openJobList(scope.row,'published')">{{ $t('crawler.lookJob') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="currentCrawlerDesc + '参数列表'" :visible.sync="paramDialogVisible">
      <div style="margin:20px;">
        <el-button type="primary" @click="addEmptyParam()">{{ $t('global.add') }}</el-button>
      </div>
      <el-table v-loading="paramListLoading" :data="paramList" border fit highlight-current-row style="width: 100%">
        <el-table-column :label="$t('global.number')" prop="id" sortable="custom" align="center" width="65">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('crawler.paramName')" min-width="110px" align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <el-input v-model="scope.row.paramNameTmp" class="edit-input" size="small"/>
              <!-- <el-button class="cancel-btn" size="small" icon="el-icon-refresh" type="warning" @click="cancelEdit(scope.row)">取消</el-button> -->
            </template>
            <span v-else><span>{{ scope.row.paramName }}</span></span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('crawler.paramDesc')" min-width="150px">
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <el-input v-model="scope.row.paramDescTmp" class="edit-input" size="small"/>
            </template>
            <span v-else>{{ scope.row.paramDesc }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('crawler.paramValue')" min-width="110px" align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <el-input v-model="scope.row.paramValueTmp" class="edit-input" size="small"/>
            </template>
            <span v-else>{{ scope.row.paramValue }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.actions')" align="center" width="200">
          <template slot-scope="scope">
            <el-button v-if="scope.row.edit" type="success" size="small" icon="el-icon-check" @click="saveParam(scope.row)"/>
            <el-button v-if="scope.row.edit" class="cancel-btn" size="small" icon="el-icon-close" type="warning" @click="cancelEdit(scope.row)"/>
            <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="startEdit(scope.row)"/>
            <el-button v-if="!scope.row.edit && scope.row.paramName" size="small" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)"/>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="paramDialogVisible = false">{{ $t('crawler.cancel') }}</el-button>
        <el-button type="danger" @click="startJob()">{{ $t('crawler.startJob') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { loadCrawlerList, loadCrawlerParam, addCrawlerParam, editParam, deleteParam, startJob, stopJob } from '@/api/crawler'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      paramList: null,
      total: 0,
      listLoading: true,
      paramListLoading: false,
      currentCrawlerName: '',
      currentCrawlerDesc: '',
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      paramTemp: {
        id: undefined,
        paramName: '',
        paramDesc: '',
        paramValue: ''
      },
      dialogFormVisible: false,
      paramDialogVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新建'
      },
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      loadCrawlerList(this.listQuery).then(response => {
        this.list = response.data.data
        // this.total = response.data.total
        // Just to simulate the time of the request
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    startJob() {
      if (!this.currentCrawlerName) {
        return
      }
      startJob(this.currentCrawlerName).then(() => {
        this.paramDialogVisible = false
        this.$message({
          title: '成功',
          message: '爬虫正在工作',
          type: 'success',
          duration: 2000
        })
      })
    },
    stopJob(row) {
      if (!row.name) {
        return
      }
      stopJob(row.name).then(() => {
        this.paramDialogVisible = false
        row.jobStatus = 'ready'
        this.$message({
          title: '成功',
          message: '停止任务',
          type: 'success',
          duration: 2000
        })
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    openParamDialog(row) {
      this.paramDialogVisible = true
      this.currentCrawlerName = row.name
      this.currentCrawlerDesc = row.description
      this.paramListLoading = true
      loadCrawlerParam(row.name).then(response => {
        this.paramList = response.data.data
        this.paramList.forEach(element => {
          this.$set(element, 'edit', false)
        })
        this.paramListLoading = false
      })
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    cancelEdit(row) {
      row.paramNameTmp = row.paramName
      row.paramDescTmp = row.paramDesc
      row.paramValueTmp = row.paramValue
      row.edit = false
    },
    startEdit(row) {
      row.edit = !row.edit
      row.paramNameTmp = row.paramName
      row.paramDescTmp = row.paramDesc
      row.paramValueTmp = row.paramValue
    },
    addEmptyParam() {
      this.paramList.push({
        paramName: '',
        paramNameTmp: '',
        paramDesc: '',
        paramDescTmp: '',
        paramValue: '',
        paramValueTmp: '',
        edit: true
      })
    },
    saveParam(row) {
      if (row.id) {
        this.editParam(row)
      } else {
        this.addParam(row)
      }
    },
    editParam(row) {
      if (row.paramNameTmp && row.paramDescTmp && row.paramValueTmp) {
        row.paramName = row.paramNameTmp
        row.paramDesc = row.paramDescTmp
        row.paramValue = row.paramValueTmp
        editParam(row).then(response => {
          this.$nextTick(() => {
            row.edit = false
          })
          this.$message({
            title: '成功',
            message: '修改成功',
            type: 'success',
            duration: 2000
          })
        })
      }
    },
    addParam(row) {
      if (row.paramNameTmp && row.paramDescTmp && row.paramValueTmp) {
        row.paramName = row.paramNameTmp
        row.paramDesc = row.paramDescTmp
        row.paramValue = row.paramValueTmp
        addCrawlerParam(this.currentCrawlerName, row).then(response => {
          this.$nextTick(() => {
            row.id = response.data.data.id
            this.$set(row, 'edit', false)
          })
          this.$message({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
        })
      }
    },
    // resetTemp() {
    //   this.temp = {
    //     id: undefined,
    //     importance: 1,
    //     remark: '',
    //     timestamp: new Date(),
    //     title: '',
    //     status: 'published',
    //     type: ''
    //   }
    // },
    // handleCreate() {
    //   this.resetTemp()
    //   this.dialogStatus = 'create'
    //   this.dialogFormVisible = true
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    // },
    // createData() {
    //   this.$refs['dataForm'].validate((valid) => {
    //     if (valid) {
    //       this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
    //       this.temp.author = 'vue-element-admin'
    //       createCrawlerGlobalParam(this.temp).then(() => {
    //         this.list.unshift(this.temp)
    //         this.dialogFormVisible = false
    //         this.$notify({
    //           title: '成功',
    //           message: '创建成功',
    //           type: 'success',
    //           duration: 2000
    //         })
    //       })
    //     }
    //   })
    // },
    openJobList(row) {
      // this.$refs['dataForm'].validate((valid) => {
      //   if (valid) {
      //     const tempData = Object.assign({}, this.temp)
      //     tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      //     updateCrawlerParam(tempData).then(() => {
      //       for (const v of this.list) {
      //         if (v.id === this.temp.id) {
      //           const index = this.list.indexOf(v)
      //           this.list.splice(index, 1, this.temp)
      //           break
      //         }
      //       }
      //       this.dialogFormVisible = false
      //       this.$notify({
      //         title: '成功',
      //         message: '更新成功',
      //         type: 'success',
      //         duration: 2000
      //       })
      //     })
      //   }
      // })
    },
    handleDelete(row) {
      if (!row.id) {
        return
      }
      this.$confirm('你确实要删除此参数吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteParam(row.id).then(() => {
          this.$message({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.paramList.indexOf(row)
          this.paramList.splice(index, 1)
        })
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
<style scoped>
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
