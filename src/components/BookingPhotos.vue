<template>
  <div class="booking-photos" v-loading="loading">
    <el-upload :action="getFileUrl()" :before-remove="handleRemove"
               :before-upload="startUpload"
               :disabled="!$can('manage', 'manage_appointment')" :file-list="photos"
               :headers="getHeaders()"
               :on-preview="handlePictureCardPreview" :on-success="uploadSuccess"
               list-type="picture-card">
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-dialog :append-to-body="true" :fullscreen="true" :show-close="false" :visible.sync="dialogVisible" @closed="closedDialog" title="Booking photos update" width="40%">
      <div slot="title">
        <el-page-header :content="dialogImageComment" @back="closedDialog"/>
        <el-divider></el-divider>
      </div>
      <div class="modal-body" style="min-height: 200px;">
        <el-row :row="40">
          <el-col :sm="18">
            <el-image :src="dialogImageUrl" alt="" class="image-preview" size="fit" width="100%"/>
          </el-col>
          <el-col :sm="6">
            <el-input :rows="6" class="image-comment" placeholder="Add comment" type="textarea" v-model="dialogImageComment"></el-input>
            <el-button @click="cancelImageDialog" round size="small">Cancel</el-button>
            <el-button @click="saveImage()" round size="small" type="primary">Save Image</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    export default {
        props: ["booking_id"],
        data() {
            return {
                dialogImageUrl: "",
                dialogVisible: false,
                dialogImageComment: '',
                previewDialog: false,
                loading: true,
                photos: [],
                photoId: false
            };
        },
        watch: {
            booking_id() {
                this.photos = [];
                this.loadPhotos();
            }
        },
        mounted() {
            this.loadPhotos();
        },
        methods: {
            startUpload() {
                this.loading = true
            },
            closedDialog() {
                this.loading = false
                this.previewDialog = false
                this.dialogVisible = false
            },
            loadPhotos() {
                this.loading = true;
                this.axios
                    .get("/companies/current/images/", {params: {filter: {where: {bookingId: this.booking_id}}}})
                    .then(res => {
                        this.photos = res.data;
                    })
                    .catch()
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            getHeaders() {
                return {Authorization: this.$auth.token()};
            },
            getFileUrl() {
                return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
            },
            saveImage() {
                if (!this.photoId) {
                    this.axios
                        .post("/companies/current/images", {
                            bookingId: this.booking_id,
                            url: this.dialogImageUrl,
                            description: this.dialogImageComment
                        })
                        .then()
                        .catch()
                        .finally(() => {
                            this.dialogVisible = false
                            this.loading = false
                            this.loadPhotos();
                        });
                } else {
                    this.axios
                        .patch("/images/" + this.photoId, {
                            description: this.dialogImageComment
                        })
                        .then()
                        .catch()
                        .finally(() => {
                            this.dialogVisible = false
                            this.loading = false
                            this.loadPhotos();
                        });
                }

            },
            uploadSuccess(res, file) {
                this.dialogImageUrl = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
                this.dialogVisible = true
                this.photoId = false
                this.photos = []
            },
            handleRemove(file, fileList) {
                return new Promise((resolve, reject) => {
                    this.$confirm("Confirm deletion of booking photo?", {
                        confirmButtonText: "Yes, delete",
                        cancelButtonText: "Cancel",
                        type: "warning"
                    })
                        .then(() => {
                            this.loading = true;
                            this.axios
                                .delete("/companies/current/images/" + file.id)
                                .then(res => {
                                    resolve();
                                })
                                .catch(err => {
                                    reject();
                                })
                                .finally(_ => {
                                    this.loading = false;
                                });
                        })
                        .catch(() => {
                            reject();
                        });
                });
            },
            handlePictureCardPreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogImageComment = file.description;
                this.dialogVisible = true;
                this.photoId = file.id
                this.photos = [];
            },
            cancelImageDialog(){
              this.dialogVisible = false;
              this.loadPhotos();
            }
        }
    };
</script>

<style lang="scss">

  .el-dialog__body {
    .image-comment {
      /*width: calc(100% - 220px);*/
      /*margin-left: 10px;*/
      height: 200px;
    }

    .image-preview {
      max-width: 100%;
      /*max-height: 250px;*/
      /*float: left;*/
    }
  }


  .booking-photos {


    .el-upload--picture-card {
      box-sizing: border-box;
      width: 100px;
      height: 100px;
      line-height: 100px;
    }

    .el-upload-list--picture-card .el-progress {
      width: 90px !important;
    }

    .el-upload-list--picture-card .el-upload-list__item {
      width: 100px;
      height: 100px;
      margin: 0 8px 8px 0;
    }

    .el-progress-circle {
      width: 90px !important;
      height: 90px !important;
    }
  }
</style>
