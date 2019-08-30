<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input :placeholder="$t('dict.searchText')" v-model="listQuery.searchText" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="getList"/> -->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">{{ $t('global.search') }}</el-button>
    </div>
    <el-container>
      <el-row v-for="(item, index) in list" :key="item.id">
        <div>
          {{ index }}
        </div>
      </el-row>
    </el-container>
  </div>

</template>

<script>
import { getFeedbackPage } from '@/api/system'
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
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 10
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getFeedbackPage(this.listQuery).then(response => {
        this.list = response.data.data.records
        this.total = response.data.data.total
        // Just to simulate the time of the request
        this.listLoading = false
      })
    },
    handleFilter() {
      this.getList()
    }
  }
}
</script>
