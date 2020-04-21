<template>
  <div class="modal-body">
    <el-row :gutter="40">
      <el-col :md="16" :sm="16" :xs="24">
        <el-card shadow="hover" v-loading="loading">
          <el-form :rules="rules" class="bg-white padding-2x" label-position="top" style="padding-top: 0px;padding-bottom:0px;" v-model="form">
            <el-row :gutter="40">
              <el-col :md="12" :sm="12">
                <el-row :gutter="20">
                  <el-col :md="24" :sm="24" :xs="24">
                    <el-form-item label="Checklist Name">
                      <el-input placeholder="e.g. Clean Bathroom" ref="newchecklist" v-model="form.name" />
                    </el-form-item>
                  </el-col>

                  <el-col :md="24" :sm="24" :xs="24">
                    <el-form-item label="Attach to Service">
                      <el-select collapse-tags filterable multiple v-model="form.serviceIds">
                        <el-option :key="service.id" :label="service.name" :value="service.id" v-for="service in company_services" />
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :md="24" :sm="24" :xs="24">
                    <el-form-item label="Attach to Service Category">
                      <el-select filterable multiple v-model="form.serviceCategoryIds">
                        <el-option :key="category.id" :label="category.name" :value="category.id" v-for="category in service_categories" />
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :md="24" :sm="24" :xs="24">
                    <el-form-item label="Checklist Description">
                      <el-input :autosize="false" :rows="3" type="textarea" v-model="form.description" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>

              <el-col :md="12" :sm="12">
                <el-row :gutter="20">
                  <el-col :md="24" :sm="24" :xs="24">
                    <el-form-item label="Add Tags">
                      <el-select allow-create clearable default-first-option filterable multiple v-model="form.tags">
                        <el-option :key="tag.name" :label="tag.name" :value="tag.name" v-for="tag in form.tags" />
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :md="12" :sm="12" :xs="24">
                    <el-form-item label="Attach to Client">
                      <el-select filterable multiple v-model="form.customerIds">
                        <el-option :key="customer.id" :label="customer.name" :value="customer.id" v-for="customer in customers" />
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :md="12" :sm="12" :xs="24">
                    <el-form-item label="Checklist Duration">
                      <el-time-select
                        :editable="false"
                        :picker-options="{
                          start: '00:30',
                          step: '00:15',
                          end: '24:00'
                        }"
                        placeholder="Duration"
                        v-model="form.duration"
                        value-format="timestamp"
                      />
                    </el-form-item>
                  </el-col>

                  <el-col :md="24" :sm="24" :xs="24">
                    <el-form-item label="Upload Checklist icon">
                      <el-upload :action="getFileUrl()" :headers="getHeaders()" :limit="1" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="uploadSuccess" :show-file-list="true" class="avatar-uploader">
                        <img :src="form.icon" class="business-logo" v-if="form.icon" />
                        <i class="avatar-uploader-icon" v-else>
                          <img src="@/assets/svgs/onboarding/upload.svg" svg-inline />
                        </i>
                      </el-upload>
                    </el-form-item>
                  </el-col>

                  <el-col :md="12" :sm="12" :xs="24" class="divider-3x pull-right">
                    <el-button @click="saveChecklist()" class="text-center block-center" round size="small" type="primary">
                      Save Checklist
                    </el-button>
                    <el-button @click="showTasks = true" type="text">Show tasks</el-button>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>

      <side-help></side-help>

      <el-drawer :visible.sync="showTasks" size="75%">
        <create-checklist-task :selected-checklist="form"></create-checklist-task>
      </el-drawer>

      <el-dialog :fullscreen="false" :modal-append-to-body="false" :visible.sync="dialogVisible">
        <img :src="dialogImageUrl" alt="" width="100%" />
      </el-dialog>
    </el-row>
  </div>
</template>

<script>
import SideHelp from "../../components/SideHelp.vue";
import CreateChecklistTask from "./CreateChecklistTaskModal.vue";

export default {
  components: {
    SideHelp,
    CreateChecklistTask
  },
  name: "SettingsChecklist",
  data() {
    return {
      showModal: false,
      searchSelectedChecklist: "",
      form: {
        tags: [],
        serviceCategoryIds: [],
        serviceIds: [],
        customerIds: [],
        name: ""
      },
      checklists: [],
      rules: {},
      service_categories: [],
      company_services: [],
      customers: [],
      selectedCategory: "All Categories",
      formTasks: [],
      newChecklistTask: "",
      selectedTask: "",
      dialogVisible: false,
      dialogImageUrl: "",
      loading: false,
      showTasks: false
    };
  },
  watch: {
    selectedTask(value) {
      if (value.trim() === "") {
        this.newChecklistTask = "";
        return;
      }

      let task = this.formTasks.find(task => {
        return value === task.id;
      });

      if (task) {
        this.newChecklistTask = task.name;
      }
    }
  },
  created() {
    this.fetchData();
  },
  mounted() {
    this.showModal = true;
    this.$events.addListener("checklist:dialog:edit", this.setSelectedChecklistEvent);
  },

  beforeDestroy() {
    this.$events.removeListener("checklist:dialog:edit", this.setSelectedChecklistEvent);
  },

  methods: {
    setSelectedChecklistEvent(selectedChecklist) {
      if (selectedChecklist.hasOwnProperty("id")) this.form = selectedChecklist;
      else this.resetForm();

      this.loading = false;
    },

    resetForm() {
      this.form = {
        tags: [],
        serviceCategoryIds: [],
        serviceIds: [],
        customerIds: [],
        name: ""
      };
    },

    addNewChecklist() {
      this.form = {
        tags: [],
        serviceCategoryIds: [],
        serviceIds: [],
        customerIds: [],
        name: "New Checklist"
      };
      this.formTasks = [];
      this.newChecklistTask = "";
      this.selectedTask = "";

      this.saveChecklist();
    },
    settingsRedirect() {
      this.$router.push("/dashboard/settings");
    },
    selectChecklist(checklist) {
      this.form = checklist;
      this.formTasks = checklist.tasks;
      this.newChecklistTask = "";
      this.selectedTask = "";
    },

    previewPicture(url) {
      this.dialogImageUrl = url;
      this.dialogVisible = true;
    },
    fetchData() {
      this.form = { tags: [], serviceCategoryIds: [], serviceIds: [], customerIds: [] };

      this.axios.get("/companies/current/checklists", { params: { filter: { include: "tasks" } } }).then(res => {
        this.checklists = res.data;

        if (this.checklists.length > 0) {
          this.form = this.checklists[0];
          this.formTasks = this.form.tasks;
        }
      });

      this.axios.get("/companies/current/serviceCategories").then(res => {
        this.service_categories = res.data;
      });

      this.axios
        .get("/companies/current/services")
        .then(res => {
          this.company_services = res.data;
        })
        .catch(err => {});
    },
    handleSelect(item) {
      this.form = item;
    },

    saveChecklist() {
      if (this.form.hasOwnProperty("id")) {
        this.axios
          .put("/companies/current/checklists/" + this.form.id, this.form)
          .then(res => {
            this.$message.success("Checklist successfully updated");
          })
          .catch(err => {});
      } else {
        this.axios
          .post("/companies/current/checklists", this.form)
          .then(res => {
            this.$message.success("Checklist successfully saved");
          })
          .catch(err => {});
      }
    },
    deleteChecklist() {
      if (this.form.hasOwnProperty("id")) {
        this.axios
          .delete("/companies/current/checklists/" + this.form.id)
          .then(res => {
            this.$message.success("Checklist successfully deleted");
          })
          .catch(err => {});
      }
    },

    querySearchAsync(queryString, cb) {
      this.axios
        .get("/companies/current/checklists", {
          params: { filter: { where: { name: { like: queryString, options: "i" } } } }
        })
        .then(res => {
          cb(res.data);
        })
        .catch(err => {});
    },
    getHeaders() {
      return { Authorization: this.$auth.token() };
    },
    getFileUrl() {
      return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
    },

    handleRemove() {},
    uploadSuccess(res, file) {
      this.form.icon = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
    },

    handlePreview() {},

    getSelectedChecklistTasks() {
      // refetch checklist tasks
      this.axios
        .get("/checklists/" + this.form.id + "/tasks")
        .then(res => {
          this.formTasks = res.data;
        })
        .catch(err => {});
    },

    saveChecklistTask() {
      // first check if there's a selectedTask if not then its new

      if (this.newChecklistTask.trim() === "") {
        return;
      }

      if (this.selectedTask && this.selectedTask.length > 0) {
        // get the id of the form tase
        this.axios
          .patch("/tasks/" + this.selectedTask, { name: this.newChecklistTask })
          .then(res => {
            this.newChecklistTask = "";

            this.getSelectedChecklistTasks();
          })
          .catch(err => {});
      } else {
        // treat as a new checklist and save
        this.axios
          .post("/checklists/" + this.form.id + "/tasks/", {
            name: this.newChecklistTask,
            is_subtask: false
          })
          .then(res => {
            this.formTasks.push(res.data);
            this.newChecklistTask = "";
          })
          .catch(err => {
            console.log(err);
          });
      }
    },
    saveTaskSubtask(task) {
      if (task.new_subtask.trim().length === 0) {
        return;
      }

      this.axios
        .post("/tasks/" + task.id + "/subtasks", { name: task.new_subtask, is_subtask: true })
        .then(res => {
          task.new_subtask = "";
          if (task.subtasks) {
            task.subtasks.push(res.data);
          } else {
            task.subtasks = [res.data];
          }
        })
        .catch(err => {});
    },

    deleteTask(task, index) {
      this.axios
        .delete("/tasks/" + task.id)
        .then(res => {
          this.formTasks.splice(index, 1);
        })
        .catch(err => {});
    },

    duplicateTask(task) {
      // remove id and save
      delete task.id;
      task.name = task.name + " duplicate";

      this.axios
        .post("/checklists/" + this.form.id + "/tasks/", task)
        .then(res => {
          this.getSelectedChecklistTasks();
          this.selectedTask = res.data.id;
          this.newChecklistTask = res.data.name;
        })
        .catch(err => {
          console.log(err);
        });
    },

    deleteSubtask(subtask, task, index) {
      this.axios
        .delete("/tasks/" + task.id + "/subtasks/rel/" + subtask.id)
        .then(res => {
          // reload the task the task  only
          task.subtasks.splice(index, 1);
        })
        .catch(err => {});
    },

    taskPictureHandleExceed() {},
    taskPictureHandleRemove() {},
    taskPictureUploadSuccess(res, file) {
      // get the selected task
      let task = this.formTasks.find(task => {
        return task.id === this.selectedTask;
      });

      if (task) {
        // get pictures
        if (task.pictures) {
          task.pictures.push("https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name);
        } else {
          task.pictures = [];
          task.pictures.push("https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name);
        }
        this.axios
          .patch("/tasks/" + task.id, { pictures: task.pictures })
          .then(res => {
            this.getSelectedChecklistTasks();
          })
          .catch(err => {});
      }
    },
    taskPictureHandlePreview() {}
  }
};
</script>

<style lang="scss">
.app-section {
  &.checklists {
    .add-service {
      padding-top: 10px;
      padding-right: 10px;
      cursor: pointer;
    }

    .el-button-group {
      margin-top: 10px;
      float: right;

      .el-button {
        margin-right: 20px;
        text-decoration: underline;
        font-size: 13px;
      }

      .el-button [class*="el-icon-"] + span {
        margin-left: 0px;
      }

      &.subtask-group {
        float: none;

        .el-button {
          margin-left: 0px;
          margin-right: 20px;
        }
      }
    }

    .sub-title {
      margin: 20px 0px;
      display: block;
      font-size: 15px;
      font-weight: bold;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 100%;
    }

    .el-autocomplete {
      &.search {
        width: 100%;
        padding: 10px;
        box-sizing: border-box;

        input {
          border-radius: 40px;
          @extend .border-shadow;
        }
      }
    }

    .border-right {
      border-right: 1px solid #f3f3f3;
    }

    ul.services-list {
      list-style: none;
      padding: 0;

      li {
        padding: 10px;
        display: block;
        cursor: pointer;
        min-height: 60px;

        .service-image,
        .service-content {
          display: inline-block;
        }

        .service-image {
          img {
            width: 42px;
            height: 42px;
            margin-right: 5px;
            /* border-radius : 50%;*/
          }
        }

        .service-content {
          width: calc(100% - 50px);

          p {
            margin: 0;
            font-size: 12px;
            line-height: 1.5;
            text-overflow: ellipsis;
            overflow: hidden;
            max-height: 35px;
          }
        }

        .service-name {
          font-weight: 500;
          color: black;
          font-size: 12px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          width: 100%;
          display: block;
        }

        .service-price {
          font-weight: bold;
          font-style: normal;
        }

        &.active {
          border-left: 4px solid $launch-primary-color;
          background: $launch-dashboard-bg-color;
        }
      }
    }

    .toggles {
      .el-form-item__label {
        float: none;
      }

      .el-form-item__content {
        border: 1px solid #f3f3f3;
        padding: 10px;
        border-radius: 5px;
      }

      .el-switch__label {
        width: calc(100% - 50px);
        color: black;

        span {
          font-size: 11px;
        }
      }
    }

    .el-collapse-item {
      transition: all 0.2s linear;

      &.is-active {
        background: $launch-dashboard-bg-color;
        padding: 0px 10px;

        * {
          background: none;
        }

        .el-input {
          background: white;
        }
      }
    }

    .el-collapse-item__content {
      padding-bottom: 5px;

      .el-button {
        font-size: 12px;
      }
    }
  }
}
</style>
