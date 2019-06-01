<template>
  <div>
    <el-dialog :title="$t('travel.selectScenicSpot')" :visible.sync="dialogVisible" append-to-body>
      <div class="selectedContainer">
        <el-tag
          v-for="(scenicSpot, index) in selectedScenicSpots"
          :key="scenicSpot.id"
          closable
          @close="removeScenicSpot(scenicSpot, index)">
          {{ scenicSpot.name }}
        </el-tag>
      </div>
      <div class="filter-container">
        <el-input :placeholder="$t('travel.queryNamePlaceholder')" v-model="scenicSpotQuery.name" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="getSelectScenicSpotList"/>
        <el-select v-model="scenicSpotQuery.type" :placeholder="$t('travel.type')" clearable class="filter-item" style="width: 130px">
          <el-option v-for="item in scenicSpotType" :key="item.name" :label="item.value" :value="item.name"/>
        </el-select>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getSelectScenicSpotList">{{ $t('table.search') }}</el-button>
        <!-- <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-check" @click="'d'">{{ $t('global.confirm') }}</el-button> -->
      </div>
      <el-table
        v-loading="scenicSpotSelectLoading"
        :data="selectScenicSpotList"
        border
        highlight-current-row
        style="width: 100%;">
        <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="65">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('travel.name')" min-width="200px" align="center">
          <template slot-scope="scope">
            <el-link @click="openScenicSpotInfoDialog(scope.row.id)">{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="$t('travel.enName')" min-width="200px">
          <template slot-scope="scope">
            <span>{{ scope.row.enName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('travel.type')" width="100px">
          <template slot-scope="scope">
            <span>{{ getValue('scenicSpotType', scope.row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.actions')" align="center" width="100" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button :disabled="scope.row.selected" :icon="scope.row.selected? 'el-icon-check': ''" class="handle-btn" type="primary" @click="selectScenicSpot(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="selectScenicSpotTotal>0"
        :total="selectScenicSpotTotal"
        :page-size="scenicSpotQuery.size"
        :page.sync="scenicSpotQuery.page"
        :limit.sync="scenicSpotQuery.size"
        style="padding: 20px 5px;"
        @pagination="getSelectScenicSpotList"/>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button @click="dialogVisible = false">{{ $t('global.cancel') }}</el-button>
        <el-button :loading="commitLoading" type="primary" @click="confirm">
          {{ $t('global.confirm') }}
        </el-button>
      </div>
    </el-dialog>
    <scenic-spot-info-dialog ref="scenicSpotInfoDialog" />
  </div>
</template>
<script>
import { getScenicSpotPage } from '@/api/travel'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
// import { Message } from 'element-ui'
import { getDictionary, getValue } from '@/utils/dict'
import ScenicSpotInfoDialog from '@/components/ScenicSpotInfoDialog'
import waves from '@/directive/waves' // Waves directive
export default {
  name: 'ScenicSpotDialog',
  components: { Pagination, ScenicSpotInfoDialog },
  directives: { waves },
  props: {
    appendToBody: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scenicSpotSelectLoading: false,
      selectScenicSpotList: [],
      scenicSpotType: [],
      selectScenicSpotTotal: 0,
      saveScenicSpotLoading: false,
      dialogVisible: this.visible,
      commitLoading: false,
      scenicSpotQuery: {
        name: '',
        type: '',
        page: 1,
        size: 5
      },
      selectedScenicSpots: [],
      selectedScenicSpotIds: {}
    }
  },
  created() {
    const _this = this
    getDictionary(this.$store, 'scenicSpotType').then(data => {
      _this.scenicSpotType = data
    })
  },
  mounted() {
    this.getSelectScenicSpotList()
  },
  methods: {
    getValue: getValue,
    openScenicSpotInfoDialog(id) {
      this.$refs['scenicSpotInfoDialog'].show(id)
    },
    getSelectScenicSpotList() {
      this.scenicSpotSelectLoading = true
      getScenicSpotPage(this.scenicSpotQuery).then(response => {
        this.selectScenicSpotList = response.data.data.records
        this.selectScenicSpotTotal = response.data.data.total
        this.scenicSpotSelectLoading = false
        for (let index = 0; index < this.selectScenicSpotList.length; index++) {
          const scenicSpot = this.selectScenicSpotList[index]
          if (this.selectedScenicSpotIds[scenicSpot.id] === 1) {
            scenicSpot.selected = true
          }
        }
      })
    },
    show() {
      this.dialogVisible = true
      this.selectedScenicSpots = []
      this.selectedScenicSpotIds = {}
      this.scenicSpotQuery = {
        name: '',
        type: '',
        page: 1,
        size: 5
      }
      this.getSelectScenicSpotList()
    },
    hide() {
      this.dialogVisible = false
    },
    selectScenicSpot(row) {
      if (this.selectedScenicSpotIds[row.id]) {
        return
      }
      this.selectedScenicSpots.push(row)
      this.selectedScenicSpotIds[row.id] = 1
      row.selected = true
    },
    removeScenicSpot(scenicSpot, index) {
      if (scenicSpot && this.selectedScenicSpotIds[scenicSpot.id]) {
        this.selectedScenicSpotIds[scenicSpot.id] = undefined
        this.selectedScenicSpots.splice(index, 1)
        for (let i = 0; i < this.selectScenicSpotList.length; i++) {
          const data = this.selectScenicSpotList[i]
          if (data.id === scenicSpot.id) {
            data.selected = false
          }
        }
      }
    },
    confirm() {
      this.dialogVisible = false
      this.$emit('selected', this.selectedScenicSpots)
    }
  }
}
</script>
<style>
.selectedContainer {
  display: flex;
  width: 100%;
  margin-bottom: 20px;
  padding-left: 5px;
  flex-wrap: wrap;
}
</style>
