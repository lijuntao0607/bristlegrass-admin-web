<template>
  <span>
    <el-input v-if="inputType==='input'" ref="inputText" :placeholder="placeholder" :value="showProp" readonly clearable>
      <el-button slot="append" icon="el-icon-search" @click="openTreeDialog" @focus="openTreeDialog"/>
      <el-input ref="inputValue" :value="value" type="hidden" style="display: hidden; height: 0px;"/>
    </el-input>
    <el-link v-if="inputType==='link'" :underline="false" :icon="icon" @click="openTreeDialog" @focus="openTreeDialog">
      <span>{{ buttonText }}</span>
    </el-link>
    <el-button v-if="inputType==='button'" :icon="icon" @click="openTreeDialog" @focus="openTreeDialog">
      <span>{{ buttonText }}</span>
      <el-input ref="inputValue" :value="value" type="hidden" style="display: hidden; height: 0px;"/>
    </el-button>
    <el-dialog v-loading="dialogLoading" :title="placeholder" :visible.sync="dialogVisible" :width="width" append-to-body>
      <el-input v-if="queryData" v-model="queryName" clearable @keyup.enter.native="queryTreeData(queryName)">
        <el-button slot="append" icon="el-icon-search" @click="queryTreeData(queryName)"/>
      </el-input>
      <el-scrollbar :style="'height:' + height + ';'">
        <el-tree :load="loadData" :data="data" :props="defaultProps" lazy @node-click="handleNodeClick"/>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">{{ $t('global.cancel') }}</el-button>
        <el-button type="primary" @click="selectedNode">
          {{ $t('global.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </span>
</template>

<script>
export default {
  name: 'TreeSelector',
  props: {
    load: {
      type: Function,
      default: (node, resolve) => {
      }
    },
    queryData: {
      type: Function,
      default: undefined
    },
    selectingNode: {
      type: Function,
      default: node => {
        return true
      }
    },
    inputType: {
      type: String,
      default: 'input'
    },
    placeholder: {
      type: String,
      default: ''
    },
    nodeLabel: {
      type: String,
      default: 'name'
    },
    nodeValue: {
      type: String,
      default: 'id'
    },
    value: {
      type: Number,
      default: -1
    },
    showProp: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '300px'
    },
    height: {
      type: String,
      default: '200px'
    },
    dialogLoading: {
      type: Boolean,
      default: false
    },
    buttonText: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'el-icon-search'
    }
  },
  data() {
    return {
      dialogVisible: false,
      data: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      currentNode: null,
      queryName: ''
    }
  },
  mounted() {
    this.defaultProps.label = this.nodeLabel
  },
  activated() {
  },
  destroyed() {
  },
  methods: {
    queryTreeData(queryText) {
      if (!queryText) {
        this.loadData(-1, this.queryResolve)
        return
      }
      if (this.queryData) {
        this.queryData(queryText, this.queryResolve)
      }
    },
    queryResolve(list) {
      this.data = list
    },
    loadData(node, resolve) {
      // this.dialogLoading = true
      if (this.load) {
        this.load(node, resolve)
      }
    },
    openTreeDialog() {
      this.dialogVisible = true
      this.$emit('click')
    },
    loadTreeData() {
    },
    handleNodeClick(node) {
      this.currentNode = node
    },
    handleInput(event) {
      // this.$emit('input', event.target.value)// 这里$emit调用的是默认的input
    },
    selectedNode() {
      if (this.selectingNode(this.currentNode)) {
        this.dialogVisible = false
        this.$emit('update:showProp', this.currentNode[this.nodeLabel])
        this.$emit('update:value', this.currentNode[this.nodeValue])
        this.$emit('selected', this.currentNode)
      }
      // console.log(this.$refs['inputText'].val)
    }
  }
}
</script>
