<template>
  <div>
    <el-dialog class="cust-create-cl" :close-on-press-escape="true" :fullscreen="true" :modal="true" appendToBody :visible.sync="showModal" @close="settingsRedirect" custom-class="fullscreen-modal-display" title="Add Checklist">
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
                          <el-input :autosize="false" :rows="4" type="textarea" v-model="form.description" />
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

                      <el-col :md="24" :sm="24" :xs="24">
                        <el-form-item label="Attach to Client">
                          <el-select filterable multiple v-model="form.customerIds">
                            <el-option :key="customer.id" :label="customer.name" :value="customer.id" v-for="customer in customers" />
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <el-col :md="24" :sm="24" :xs="24">
                        <el-form-item label="Checklist Duration">
                          <duration-picker :showLabel="false" v-model="form.duration"></duration-picker>
                        </el-form-item>
                      </el-col>

                      <el-col :md="24" :sm="24" :xs="24" class="cust-check-img">
                        <el-col :md="10" :sm="10" :xs="24">
                          <el-form-item label="Upload icon">
                            <el-upload :action="getFileUrl()" :headers="getHeaders()" :on-success="uploadSuccess" :show-file-list="false" list-type="picture-card">
                              <img :src="form.icon" width="100%" height="100%" v-if="form.icon" />
                              <i class="el-icon-plus avatar-uploader-icon" v-else>
                              </i>
                            </el-upload>
                          </el-form-item>
                        </el-col>

                        <el-col :md="3" :sm="3" :xs="4" style="height: 175px; display: flex; align-items: center;">
                          <span>OR</span>
                        </el-col>

                        <el-col :md="11" :sm="11" :xs="24" style="height: 175px; display: flex; align-items: center;">

                          <el-button style="height: 175px; display: flex; align-items: center;" type="text" @click="iconSelectDialogUp = true">Choose icon from library</el-button>

                          <el-dialog top="0vh" title="Choose icon" :visible.sync="iconSelectDialogUp"
                                     :close-on-press-escape="true" :fullscreen="false" width="60%" append-to-body>
                            <div>
                              <icon-select v-model="choosenIcon"></icon-select>
                            </div>

                            <div slot="footer" class="dialog-footer">
                              <el-button size="mini" @click="iconSelectDialogUp = false" round>Cancel</el-button>
                              <el-button size="mini" type="primary" @click="loadIconFromLibrary" round>Choose</el-button>
                            </div>
                          </el-dialog>
                        </el-col>
                      </el-col>

                    </el-row>
                  </el-col>
                  <el-col :md="24" :sm="24" :xs="24" >
                    <el-divider></el-divider>
                  </el-col>

                  <el-col :md="24" :sm="24" :xs="24">
                    <div style="min-width: 300px; margin: 0 auto; text-align: center">
                      <el-button v-if="false" @click="showTasks = true" type="text">Show tasks</el-button>
                      <el-button @click="saveChecklist()" round size="small" type="primary">
                        Save Checklist
                      </el-button>
                    </div>
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
    </el-dialog>
  </div>
</template>

<script>
import SideHelp from "../../components/SideHelp.vue";
import CreateChecklistTask from "./CreateChecklistTaskModal.vue";
import IconSelect from "../../../components/IconUpload.vue"

export default {
  components: {
    SideHelp,
    CreateChecklistTask,
    IconSelect
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
        name: "",
        icon: ""
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
      showTasks: false,
      iconSelectDialogUp: false,
      choosenIcon: {}
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

    if (this.$route.params.id) {
      this.loading = true;
      this.axios
        .get("/companies/current/checklists/" + this.$route.params.id)
        .then(res => {
          this.selectedChecklist = res.data;
          this.setSelectedChecklistEvent(res.data);
        })
        .catch(err => {
          this.$helpers.errorHandle(err);
        })
        .finally(_ => {
          this.loading = false;
        });
    }
  },

  beforeDestroy() {
    // this.$events.removeListener("checklist:dialog:edit", this.setSelectedChecklistEvent);
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
      this.$router.push("/customer/checklists");
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

      /*this.axios.get("/companies/current/checklists", {params: {filter: {include: "tasks"}}}).then(res => {
                    this.checklists = res.data;

                    if (this.checklists.length > 0) {
                        this.form = this.checklists[0];
                        this.formTasks = this.form.tasks;
                    }
                });*/

      (async () => {
        try {
          this.loading = true;
          this.company_services = await this.getServices(this);
          this.loading = false;
        } catch (err) {
          this.loading = false;
          this.$helpers.errorHandle(err);
        }
      })();
    },
    handleSelect(item) {
      this.form = item;
    },

    getServiceCategories(context) {
      return new Promise((resolve, reject) => {
        context.axios
          .get("/companies/current/serviceCategories")
          .then(res => {
            resolve(res.data);
          })
          .catch(err => {
            reject(err);
          });
      });
    },

    getServices(context) {
      return new Promise((resolve, reject) => {
        context.axios
          .get("/companies/current/services")
          .then(res => {
            resolve(res.data);
          })
          .catch(err => {
            reject(err);
          });
      });
    },

    loadIconFromLibrary(){
        this.form.icon = this.choosenIcon.url;
        this.iconSelectDialogUp = false
    },

    saveChecklist() {
      if (this.form.hasOwnProperty("id")) {
        this.axios
          .put("/accounts/me/checklists" + this.form.id, this.form)
          .then(res => {
            this.$message.success("Checklist successfully updated");
            this.$router.push({ name: "customer_checklists_tasks", params: { id: res.data.id } });
            //immediately proceed to the tasks and subtasks of this checklist
          })
          .catch(err => {});
      } else {
        this.axios
          .post("/accounts/me/checklists", this.form)
          .then(res => {
            this.$message.success("Checklist successfully saved");
            this.$router.push({ name: "customer_checklists_tasks", params: { id: res.data.id } });
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
        return {Authorization: this.$auth.token()};
    },
    getFileUrl() {
        return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
    },

    handleRemove() {
    },
    uploadSuccess(res, file) {
        this.form.icon = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
    },

    handlePreview() {
    },

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

  .cust-create-cl{
    .cust-check-img{

      .el-upload--picture-card{
        height: 100px;

        .avatar-uploader-icon{
          width: 100%;
          line-height: 100px;
        }
      }
    }

  }
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
