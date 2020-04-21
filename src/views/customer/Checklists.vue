<template>
  <div>
    <el-dialog custom-class="fullscreen-modal-display" title="Checklists" append-to-body :visible.sync="showModal" :modal="false" :fullscreen="true" :close-on-press-escape="true" @close="settingsRedirect">
      <div class="modal-body checklists">
        <el-container>
          <el-row :gutter="20">
            <el-col :sm="16" :md="16" :xs="24" class="full-height">
              <el-row class="full-height border-shadow">
                <el-col :sm="8" :md="8" :xs="24" class="bg-white full-height border-right">
                  <div class="padding-1x">
                    <span class="sub-title" style="padding-left : 10px; display:inline-block; width : auto;">
                      <el-dropdown>
                        <span class="el-dropdown-link"> {{ selectedCategory }}<i class="el-icon-arrow-down el-icon--right" /> </span>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item v-for="category in service_categories" @click="selectedCategory = category.name">
                            {{ category.name }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </span>
                    <a class="pull-right add-service" @click="addNewChecklist()">
                      <img svg-inline src="@/assets/svgs/add-button.svg" />
                    </a>
                  </div>
                  <el-row>
                    <ul class="services-list">
                      <li :class="{ active: checklist.id == selectedChecklist.id }" v-for="checklist in checklists" @click="selectChecklist(checklist)">
                        <div class="service-image pull-left">
                          <img v-if="checklist.icon" :src="checklist.icon" />
                          <img v-else src="@/assets/svgs/checklist-default.svg" />
                        </div>
                        <div class="service-content">
                          <span>
                            <label class="service-name">
                              {{ checklist.name }}
                            </label>

                            <label class="service-price pull-right">
                              {{ checklist.base_price }}
                            </label>
                          </span>
                          <p>{{ checklist.description || "No description" }}</p>
                        </div>
                      </li>
                    </ul>
                  </el-row>
                </el-col>

                <el-col :sm="16" :md="16" :xs="24">
                  <el-row class="bg-white padding-2x" style="padding-top: 10px;">
                    <el-col :sm="12" :md="12" :xs="24" v-if="selectedChecklist">
                      <label class="sub-title">
                        {{ selectedChecklist.name || "Add Name" }}
                      </label>
                    </el-col>
                    <el-col :sm="12" :md="12" :xs="24" style=" text-align: right; padding-top: 10px;">
                      <el-button
                        type="text"
                        class="text-button"
                        icon="el-icon-plus"
                        @click="
                          $refs['newchecklist'].focus();
                          addNewChecklist();
                        "
                      >
                        Create a new Checklist
                      </el-button>
                    </el-col>
                  </el-row>
                  <el-form label-position="top" class="bg-white padding-2x" style="padding-top: 0px;padding-bottom:0px;" v-model="selectedChecklist" :rules="rules">
                    <el-row :gutter="10">
                      <el-col :sm="24" :md="24" :xs="24">
                        <el-form-item label="Checklist Name">
                          <el-input ref="newchecklist" placeholder="e.g. Clean Bathroom" v-model="selectedChecklist.name" />
                        </el-form-item>
                      </el-col>

                      <el-col :sm="12" :md="12" :xs="24">
                        <el-form-item label="Attach to Service Category">
                          <el-select filterable multiple v-model="selectedChecklist.serviceCategoryIds">
                            <el-option v-for="category in service_categories" :key="category.id" :label="category.name" :value="category.id" />
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <el-col :sm="12" :md="12" :xs="24">
                        <el-form-item label="Attach to Service">
                          <el-select filterable multiple collapse-tags v-model="selectedChecklist.serviceIds">
                            <el-option v-for="service in company_services" :key="service.id" :label="service.name" :value="service.id" />
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <el-col :sm="24" :md="24" :xs="24">
                        <el-form-item label="Checklist Description">
                          <el-input v-model="selectedChecklist.description" type="textarea" :rows="3" :autosize="false" />
                        </el-form-item>
                      </el-col>

                      <el-col :sm="24" :md="24" :xs="24">
                        <el-form-item label="Add Tags">
                          <el-select allow-create default-first-option v-model="selectedChecklist.tags" filterable clearable multiple>
                            <el-option v-for="tag in selectedChecklist.tags" :key="tag.name" :label="tag.name" :value="tag.name" />
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <el-col :sm="12" :md="12" :xs="24">
                        <el-form-item label="Attach to Client">
                          <el-select filterable multiple v-model="selectedChecklist.customerIds">
                            <el-option v-for="customer in customers" :key="customer.id" :label="customer.name" :value="customer.id" />
                          </el-select>
                        </el-form-item>
                      </el-col>

                      <el-col :sm="12" :md="12" :xs="24">
                        <el-form-item label="Checklist Duration">
                          <el-time-select
                            :editable="false"
                            value-format="timestamp"
                            v-model="selectedChecklist.duration"
                            :picker-options="{
                              start: '00:30',
                              step: '00:15',
                              end: '24:00'
                            }"
                            placeholder="Duration"
                          />
                        </el-form-item>
                      </el-col>

                      <el-col :sm="24" :md="24" :xs="24">
                        <el-form-item label="Upload Checklist icon">
                          <el-upload class="avatar-uploader" :headers="getHeaders()" :action="getFileUrl()" :on-success="uploadSuccess" :limit="1" :on-preview="handlePreview" :on-remove="handleRemove" :show-file-list="true">
                            <img v-if="selectedChecklist.icon" :src="selectedChecklist.icon" class="business-logo" />
                            <i v-else class="avatar-uploader-icon">
                              <img svg-inline src="@/assets/svgs/onboarding/upload.svg" />
                            </i>
                          </el-upload>
                        </el-form-item>
                      </el-col>

                      <el-col :sm="12" :md="12" :xs="24" class="divider-3x pull-left">
                        <el-button-group style="float:none;margin:0px;">
                          <el-button type="text" icon="el-icon-plus" @click="deleteChecklist()">
                            Delete
                          </el-button>
                          <el-button type="text" icon="el-icon-plus" @click="duplicateChecklist()">
                            Duplicate
                          </el-button>
                          <el-button type="text" icon="el-icon-plus" @click="archiveChecklist()">
                            Archive
                          </el-button>
                        </el-button-group>
                      </el-col>

                      <el-col :sm="12" :md="12" :xs="24" class="divider-3x pull-right">
                        <el-button @click="saveChecklist()" type="primary" class="text-center block-center">
                          Save Checklist
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-form>
                </el-col>
              </el-row>
            </el-col>

            <el-col :sm="8" :md="8" :xs="24" class="full-height ">
              <div class="bg-white padding-2x side-help border-shadow" style="padding-top: 10px;">
                <el-form>
                  <el-col :sm="24" :md="24" :xs="24">
                    <span class="sub-title"> {{ selectedChecklist.name }} - Tasks </span>

                    <el-form-item style="margin-bottom:1px;" v-if="selectedChecklist.id">
                      <el-button type="text" class="text-button" icon="el-icon-plus" @click="$refs['newtask'].focus()">
                        Create another task
                      </el-button>
                      <el-input ref="newtask" size="small" v-model="newChecklistTask" placeholder="Name of task" @keyup.enter.native="saveChecklistTask()">
                        <el-button size="small" slot="append" @click="saveChecklistTask()">
                          Save
                        </el-button>
                      </el-input>
                    </el-form-item>

                    <span class="block-center" style="padding-top : 25px;">
                      Available Tasks on Checklist
                    </span>
                  </el-col>

                  <el-col :sm="24" :md="24" :xs="24">
                    <el-collapse accordion v-model="selectedTask">
                      <el-collapse-item :name="task.id" v-for="(task, index) in selectedChecklistTasks">
                        <span slot="title"> {{ task.name }} ({{ task && task.subtasks ? task.subtasks.length : 0 }}) </span>
                        <el-input v-model="task.new_subtask" placeholder="Add subtask" size="mini" @keyup.enter.native="saveTaskSubtask(task)">
                          <el-button slot="append" type="info" size="mini" @click="saveTaskSubtask(task)">
                            Save
                          </el-button>
                        </el-input>
                        <ul class="subtasks-list">
                          <li v-for="(subtask, subindex) in task.subtasks">{{ subtask.name }} <i @click="deleteSubtask(subtask, task, subindex)" class="el-icon-delete" /></li>
                        </ul>
                        <div class="pictures" style="margin-left: 23px;">
                          <img @click="previewPicture(picture)" style="margin-right: 10px; cursor: pointer;" width="48" height="48" class="border-shadow" :src="picture" v-for="picture in task.pictures" />
                        </div>
                        <el-button-group class="full-width subtask-group">
                          <!--  <el-button type="text">Add Subtask</el-button>-->

                          <el-upload class="" style="display:inline-block; float:left;" :on-preview="taskPictureHandlePreview" :on-remove="taskPictureHandleRemove" :headers="getHeaders()" :action="getFileUrl()" :on-success="taskPictureUploadSuccess" multiple :limit="5" :on-exceed="taskPictureHandleExceed">
                            <el-button type="text" icon="el-icon-plus">
                              Add Picture
                            </el-button>
                          </el-upload>
                          <el-button type="text" icon="el-icon-plus" @click="deleteTask(task, index)">
                            Delete
                          </el-button>
                          <el-button type="text" icon="el-icon-plus" @click="duplicateTask(task)">
                            Duplicate
                          </el-button>
                        </el-button-group>
                      </el-collapse-item>
                    </el-collapse>
                  </el-col>
                </el-form>
              </div>
            </el-col>
          </el-row>
        </el-container>
      </div>
    </el-dialog>
    <el-dialog :modal-append-to-body="false" :fullscreen="false" :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  name: "SettingsChecklist",
  data() {
    return {
      showModal: false,
      searchSelectedChecklist: "",
      selectedChecklist: {
        tags: [],
        serviceCategoryIds: [],
        serviceIds: [],
        customerIds: [],
        name: "New Checklist"
      },
      checklists: [],
      rules: {},
      service_categories: [],
      company_services: [],
      customers: [],
      selectedCategory: "All Categories",
      selectedChecklistTasks: [],
      newChecklistTask: "",
      selectedTask: "",
      dialogVisible: false,
      dialogImageUrl: "",
      loading: false
    };
  },
  watch: {
    selectedTask(value) {
      if (value.trim() === "") {
        this.newChecklistTask = "";
        return;
      }

      let task = this.selectedChecklistTasks.find(task => {
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

    console.log(this.$route.params);
  },
  methods: {
    addNewChecklist() {
      this.selectedChecklist = {
        tags: [],
        serviceCategoryIds: [],
        serviceIds: [],
        customerIds: [],
        name: "New Checklist"
      };
      this.selectedChecklistTasks = [];
      this.newChecklistTask = "";
      this.selectedTask = "";

      this.saveChecklist();
    },
    settingsRedirect() {
      this.$router.push("/dashboard/settings");
    },
    selectChecklist(checklist) {
      this.selectedChecklist = checklist;
      this.selectedChecklistTasks = checklist.tasks;
      this.newChecklistTask = "";
      this.selectedTask = "";
    },

    previewPicture(url) {
      this.dialogImageUrl = url;
      this.dialogVisible = true;
    },
    fetchData() {
      this.selectedChecklist = { tags: [], serviceCategoryIds: [], serviceIds: [], customerIds: [] };

      this.axios.get("/companies/current/checklists", { params: { filter: { include: "tasks" } } }).then(res => {
        this.checklists = res.data;

        if (this.checklists.length > 0) {
          this.selectedChecklist = this.checklists[0];
          this.selectedChecklistTasks = this.selectedChecklist.tasks;
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
      this.selectedChecklist = item;
    },

    saveChecklist() {
      if (this.selectedChecklist.hasOwnProperty("id")) {
        this.axios
          .put("/companies/current/checklists/" + this.selectedChecklist.id, this.selectedChecklist)
          .then(res => {
            this.$message.success("Checklist successfully updated");
            this.fetchData();
          })
          .catch(err => {});
      } else {
        this.axios
          .post("/companies/current/checklists", this.selectedChecklist)
          .then(res => {
            this.$message.success("Checklist successfully saved");
            this.fetchData();
          })
          .catch(err => {});
      }
    },
    deleteChecklist() {
      if (this.selectedChecklist.hasOwnProperty("id")) {
        this.axios
          .delete("/companies/current/checklists/" + this.selectedChecklist.id)
          .then(res => {
            this.$message.success("Checklist successfully deleted");
            this.fetchData();
          })
          .catch(err => {});
      }
    },

    archiveChecklist() {},

    duplicateChecklist() {
      delete this.selectedChecklist.id;
      this.selectedChecklist.name = "Duplicate - " + this.selectedChecklist.name;
      // now save
      this.saveChecklist();
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
      this.selectedChecklist.icon = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
    },

    handlePreview() {},

    getSelectedChecklistTasks() {
      // refetch checklist tasks
      this.axios
        .get("/checklists/" + this.selectedChecklist.id + "/tasks")
        .then(res => {
          this.selectedChecklistTasks = res.data;
        })
        .catch(err => {});
    },

    saveChecklistTask() {
      // first check if there's a selectedTask if not then its new

      if (this.newChecklistTask.trim() === "") {
        return;
      }

      if (this.selectedTask && this.selectedTask.length > 0) {
        // get the id of the selectedChecklist tase
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
          .post("/checklists/" + this.selectedChecklist.id + "/tasks/", {
            name: this.newChecklistTask,
            is_subtask: false
          })
          .then(res => {
            this.selectedChecklistTasks.push(res.data);
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
          this.selectedChecklistTasks.splice(index, 1);
        })
        .catch(err => {});
    },

    duplicateTask(task) {
      // remove id and save
      delete task.id;
      task.name = task.name + " duplicate";

      this.axios
        .post("/checklists/" + this.selectedChecklist.id + "/tasks/", task)
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
      let task = this.selectedChecklistTasks.find(task => {
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
.modal-body {
  &.checklists {
    max-width: 1400px !important;

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
