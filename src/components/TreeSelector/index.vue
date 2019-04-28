<template>
  <div>
    <el-input ref="inputText" :placeholder="placeholder" :value="showProp" readonly clearable>
      <el-button slot="append" icon="el-icon-search" @click="openTreeDialog" @focus="openTreeDialog"/>
    </el-input>
    <el-input ref="inputValue" :value="value" type="hidden" class="display: hidden;"/>
    <el-dialog v-loading="dialogLoading" :title="placeholder" :visible.sync="dialogVisible" :width="width" append-to-body>
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
  </div>
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
    selectingNode: {
      type: Function,
      default: node => {}
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
      currentNode: null
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
    loadData(node, resolve) {
      // this.dialogLoading = true
      if (this.load) {
        this.load(node, resolve)
      }
    },
    openTreeDialog() {
      this.dialogVisible = true
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
        this.$emit('selected')
      }
      // console.log(this.$refs['inputText'].val)
    }
  }
}
</script>
