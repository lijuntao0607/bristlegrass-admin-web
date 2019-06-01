<template>
  <div>
    <!-- <el-upload
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
      action=""
      class="thumbnail-uploader"> -->
    <el-upload
      ref="upload"
      :show-file-list="false"
      :action="url"
      :before-upload="fnBeforeUpload"
      :on-success="fnUploadSuccess"
      :on-error="fnUploadError"
      :data="uploadData"
      :headers="uploadHeaders"
      class="thumbnail-uploader"
    >
      <!-- :http-request="fnUploadRequest" -->
      <slot name="main"/>
      <!-- <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip">上传文件大小不能超过 1G</div> -->
    </el-upload>
  </div>
</template>
<script>
import { getOssSignature } from '@/api/system'
import { Message } from 'element-ui'
// import * as util from 'utils/common'
export default {
  name: 'ThumbnailUpload',
  props: {
    url: {
      type: String,
      required: true
    },
    // accept: {
    //   type: Array,
    //   required: true
    // },
    path: {
      type: String,
      default: ''
    },
    success: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      uploadFileLength: 0,
      uploadFileSuccess: 0,
      uploadFileNames: [],
      uploadFileName: [],
      fileList: [],
      files: 10,
      file: {},
      uploadHeaders: {
      },
      disabled: false,
      uploadData: {
        key: '', // key后面有用，先默认设空字符串
        success_action_status: '200' // 默认200
      }
    }
  },
  methods: {
    fnUploadError(err, file, fileList) {
      console.error(err)
      Message.error('上传文件失败')
    },
    /**
     * @description [fnUploadSuccess 文件上传成功的函数]
     * @author   shanshuizinong
     * @return   {null}  [没有返回]
     */
    async fnUploadSuccess(response, file, fileList) {
      // TODO
      if (this.success) {
        this.success(response, this.file)
      }
    },
    async fnBeforeUpload(file) {
      const vm = this
      vm.disabled = true
      const isJPG = file.type === 'image/jpeg'
      const isLt8M = file.size / 1024 / 1024 < 8
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
        vm.disabled = false
        return false
      }
      if (!isLt8M) {
        this.$message.error('上传头像图片大小不能超过 8MB!')
        vm.disabled = false
        return false
      }
      // 获取OSS配置信息
      const ret = await getOssSignature(process.env.BUCKET.PROD_IMG)
      if (!(ret.data && ret.data.success && ret.data.data)) {
        vm.disabled = false
        throw new Error('获取OSS参数失败')
      }
      const point = file.name.lastIndexOf('.')
      const suffix = file.name.substr(point)
      const fileNames = file.uid + suffix
      const ossData = ret.data.data
      // const relativePath = this.path + '/'
      this.uploadData.key = this.path + '/' + this.$store.state.user.id + '/' + fileNames
      this.uploadData.policy = ossData.policy
      this.uploadData.OSSAccessKeyId = ossData.accessid
      this.uploadData.bucket = ossData.bucket
      this.uploadData.signature = ossData.signature
      this.file.name = fileNames
      this.file.size = file.size
      this.file.path = this.uploadData.key
      this.file.type = file.type
      vm.disabled = false
      return true
    }
  }
}
</script>
<style>
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
</style>
