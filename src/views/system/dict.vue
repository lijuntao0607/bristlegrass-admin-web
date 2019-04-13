<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('dict.searchText')" v-model="listQuery.searchText" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="getList"/>
      <el-select v-model="listQuery.client" :placeholder="$t('dict.client')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in clientDict" :key="item.name" :label="item.value" :value="item.name"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">{{ $t('global.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('global.add') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column :label="$t('global.number')" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dict.dictName')" min-width="100px" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.dictName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dict.dictDesc')" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.dictDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dict.dictType')" min-width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type===0? '字典': '字典树' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dict.dictItemSize')" min-width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.itemSize }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dict.client')" min-width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.client }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <!-- <el-button v-if="scope.row.status!='deleted'" size="mini" type="danger" @click="handleDelete(scope.row)">{{ $t('table.delete') }}
          </el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-dialog v-loading="dialogLoading" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <div @click="itemTableOnBlur($event)">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 800px; margin-left:50px;">
          <el-row :gutter="30" type="flex">
            <el-col>
              <el-form-item :label="$t('dict.dictName')" prop="dictName">
                <el-input v-model="temp.dictName"/>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item :label="$t('dict.dictDesc')" prop="dictDesc">
                <el-input v-model="temp.dictDesc"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="30" type="flex">
            <el-col>
              <el-form-item :label="$t('dict.dictType')" prop="type">
                <!-- <el-radio-group>
                  <el-radio-button v-for="item in dictTypeDic" :key="item.name" :label="item.name" v-model="temp.type">{{ item.value }}</el-radio-button>
                </el-radio-group> -->
                <el-select v-model="temp.type">
                  <el-option v-for="item in dictTypeDic" :key="item.name" :label="item.value" :value="item.name"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item :label="$t('dict.client')" prop="client">
                <el-select v-model="temp.client" :placeholder="$t('dict.client')" clearable class="filter-item" style="width: 100%;">
                  <el-option v-for="item in clientDict" :key="item.name" :label="item.value" :value="item.name"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="success" icon="el-icon-plus" @click="handleAdd"/>
            <el-button type="danger" icon="el-icon-minus" @click="handleDelete"/>
          </el-form-item>
          <el-row/>
          <el-table
            ref="dataTable"
            :key="tableKey"
            :data="temp.items"
            border
            fit
            highlight-current-row
            style="width: 100%;"
            @row-click="rowClick">
            <el-table-column :label="$t('dict.dictItemName')" min-width="100px" align="center">
              <template slot-scope="scope">
                <span v-if="rowIndex!==scope.$index">{{ scope.row.name }}</span>
                <el-form-item v-else :prop="'items.' + scope.$index + '.name'" :rules="rules.name" label-width="0px">
                  <el-input v-model="scope.row.name"/>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('dict.dictItemValue')" min-width="150px">
              <template slot-scope="scope">
                <span v-if="rowIndex!==scope.$index">{{ scope.row.value }}</span>
                <el-form-item v-else :prop="'items.' + scope.$index + '.value'" :rules="rules.value" label-width="0px">
                  <el-input v-model="scope.row.value"/>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('dict.dictItemRemark')" min-width="150px" align="center">
              <template slot-scope="scope">
                <span v-if="rowIndex!==scope.$index">{{ scope.row.remark }}</span>
                <el-form-item v-else :prop="'items.' + scope.$index + '.remark'" :rules="rules.remark" label-width="0px">
                  <el-input v-model="scope.row.remark"/>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('dict.dictItemNum')" min-width="120px" align="center">
              <template slot-scope="scope">
                <span v-if="rowIndex!==scope.$index">{{ scope.row.num }}</span>
                <el-input-number v-else v-model="scope.row.num" :step="10" :min="0" label="顺序" style="width: 100%;"/>
              </template>
            </el-table-column>
            <el-table-column :label="$t('dict.dictItemVisible')" min-width="60px" align="center">
              <template slot-scope="scope">
                <span v-if="rowIndex!==scope.$index">{{ scope.row.visible===1? '是' :'否' }}</span>
                <el-select v-else v-model="scope.row.visible">
                  <el-option label="否" value="0"/>
                  <el-option label="是" value="1"/>
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" @click="itemTableOnBlur($event)">
        <el-button @click="dialogFormVisible = false">{{ $t('global.cancel') }}</el-button>
        <el-button type="primary" @click="saveDictHandler">{{ $t('global.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
import { getDictPage, getDictItems, saveDict } from '@/api/system'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'DictList',
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
    }
  },
  data() {
    var sameNameValidator = (rule, value, callback) => {
      const index = parseInt(rule.field.split('.')[1])
      for (let i = 0; i < this.temp.items.length; i++) {
        if (index !== i && this.temp.items[i].name === value) {
          callback(new Error('已存在相同项'))
        }
      }
      callback()
    }
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 10,
        searchText: null,
        type: 0,
        client: null
      },
      clientDict: [],
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        remark: '',
        name: '',
        value: '',
        type: 0,
        client: undefined,
        items: [],
        deleteIds: []
      },
      dialogFormVisible: false,
      dialogLoading: false,
      dialogStatus: '',
      textMap: {
        update: '字典',
        create: '创建字典'
      },
      dictTypeDic: [
        { name: '0', value: '参数' },
        { name: '1', value: '目录' }
      ],
      rules: {
        dictName: [
          { required: true, message: '字典名不能为空', trigger: 'blur' },
          { min: 0, max: 50, message: '长度不能多于 50 个字符', trigger: 'blur' }
        ],
        dictDesc: [{ min: 0, max: 50, message: '长度不能多于 50 个字符', trigger: 'blur' }],
        name: [
          { required: true, message: '字典项不能为空', trigger: 'blur' },
          { min: 0, max: 50, message: '长度不能多于 50 个', trigger: 'blur' },
          { validator: sameNameValidator, trigger: 'blur' }
        ],
        value: [
          { required: true, message: '值不能为空', trigger: 'blur' },
          { min: 0, max: 50, message: '长度不能多于 50 个', trigger: 'blur' }
        ],
        remark: [{ min: 0, max: 50, message: '长度不能多于 50 个', trigger: 'blur' }]
      },
      rowIndex: -1,
      currentRow: -1
    }
  },
  created() {
    const _this = this
    this.getList()
    this.$store.getters.getDict('client', data => {
      _this.clientDict = data
    })
  },
  methods: {
    itemTableOnBlur(event) {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.rowIndex = -1
        } else {
          return false
        }
      })
    },
    rowClick(row, column, event) {
      if (this.rowIndex === this.temp.items.indexOf(row)) {
        this.$nextTick(() => {
          this.rowIndex = this.temp.items.indexOf(row)
        })
      }
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.currentRow = this.temp.items.indexOf(row)
          this.$nextTick(() => {
            this.rowIndex = this.temp.items.indexOf(row)
          })
        }
      })
    },
    getList() {
      this.listLoading = true
      getDictPage(this.listQuery).then(response => {
        this.list = response.data.data.records
        this.total = response.data.data.total
        // Just to simulate the time of the request
        this.listLoading = false
      })
    },
    handleFilter() {
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    resetTemp() {
      this.temp = {
        dictName: '',
        dictDesc: '',
        type: 0,
        client: null,
        items: [],
        deleteIds: []
      }
      this.rowIndex = -1
    },
    saveDictHandler() {
      for (let i = 0; i < this.temp.items.length; i++) {
        if (!this.temp.items[i].name) {
          this.$refs.dataTable.setCurrentRow(this.temp.items[i])
          this.$nextTick(() => {
            this.rowIndex = i
            this.$refs['dataForm'].validate()
          })
          return
        }
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          saveDict(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
          })
        }
      })
    },
    handleCreate() {
      this.resetTemp()
      this.temp.items.push({
        edit: true,
        visible: 1,
        num: 10
      })
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.rowIndex = -1
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogLoading = true
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      getDictItems(row.dictName).then(response => {
        this.temp.items = response.data.data
        this.dialogLoading = false
      })
      this.rowIndex = -1
    },
    handleDelete(row) {
      this.$confirm('你确实要删除此项吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(this.currentRow)
        const deleteRow = this.temp.items[this.currentRow]
        if (!this.temp.deleteIds) {
          this.temp.deleteIds = []
        }
        if (deleteRow.id) {
          this.temp.deleteIds.push(deleteRow.id)
        }
        this.temp.items.splice(this.currentRow, 1)
        console.log(this.temp.items)
      })
    },
    handleAdd() {
      const newItem = Object.assign({}, this.temp.items[this.temp.items.length - 1])
      newItem.name = newItem.value = newItem.remark = ''
      newItem.id = null
      newItem.visible = 1
      newItem.num = newItem.num + 10
      this.temp.items.push(newItem)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    }
  }
}
</script>
