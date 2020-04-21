<template>
  <div class="app-section checklist-task-subtasks">

    <el-card :body-style="{padding: '10px'}" style="margin-bottom : 5px;">
      <el-page-header @back="$router.push('/customer/checklists')" content="Add tasks to Checklist"></el-page-header>
    </el-card>

    <el-row>
      <el-col>
        <el-row :gutter="10">
          <el-col :md="8" :sm="8">
            <el-card :body-style="{ padding: '0px' }" style="margin-bottom: 5px;">
              <el-form style="padding: 10px;" v-if="selectedChecklist" v-loading="loading">
                <el-form-item v-if="selectedChecklist.id">
                  <h4 slot="label">Add a new Task</h4>
                  <el-input placeholder="Name of task" ref="newtask" size="small" v-model="newChecklistTask" v-on:keyup.enter.native="saveChecklistTask">
                      <span slot="append">
                        <el-button @click="saveChecklistTask()" class="pull-right" round size="mini" type="primary">Save task</el-button>
                      </span>
                  </el-input>
                  <el-input v-show="false"></el-input>
                </el-form-item>
              </el-form>
            </el-card>

            <el-card :body-style="{ padding: '0px' }" style="width: 100%">
              <div class="task-list">
                <el-row :key="task.id" v-for="task in selectedChecklistTasks">
                  <el-col :class="{ active: selectedTask.id === task.id }">
                    <div @click="selectTask(task)">
                      <p>{{ task.name }}</p>
                      <small>Subtasks ({{ task.subtasks.length }})</small>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <el-col class="pagination-footer">
                <div class="cct">
                  <!--<el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadSelectedChecklistTasks" background layout="total, prev, pager, next"></el-pagination>-->
                </div>
              </el-col>
            </el-card>
          </el-col>
          <el-col :md="16" :sm="16">

            <vcl-list height="200" v-if="task_loading"></vcl-list>

            <div v-if="!task_loading">
              <el-card style="margin-bottom: 5px;" v-if="selectedTask">
                <div class="flex-row">
                  <h4>{{ selectedTask.name }} ({{ selectedTask.subtasks ? selectedTask.subtasks.length : 0 }})</h4>

                  <div style="padding: 0px 0px; text-align:right;">
                    <el-link @click="deleteTask(selectedTask)" plain type="warning">
                      Delete
                  </el-link>
                    <el-divider direction="vertical"></el-divider>
                    <el-link @click="duplicateTask(selectedTask)" plain type="warning">
                      Duplicate
                  </el-link>
                  </div>
                </div>

                <el-form label-position="top">
                  <el-form-item label="Name of task" style="margin-bottom: 0px;">
                    <el-input size="mini" style="max-width: 320px" v-model="selectedTask.name">
                      <el-button @click="updateSelectedTask()" slot="append" v-loading="updating_name">Update task</el-button>
                    </el-input>
                  </el-form-item>
                </el-form>
              </el-card>

              <div v-if="selectedTask" v-loading="subtask_loading">
                <el-col :md="24" :sm="24" :xs="24" class="bg-white" style="padding: 10px;">
                  <el-row :gutter="10">
                    <el-col :key="subindex" :md="8" :sm="8" style="margin-bottom: 5px;" v-for="(subtask, subindex) in selectedTask.subtasks">
                      <p style="margin:0px; color:black; padding: 0 10px;" class="subtask-card">({{subindex + 1}}) {{ subtask.name }} <i @click="deleteSubtask(subtask, selectedTask, subindex)" style="color:red;cursor: pointer" class="el-icon-close"/></p>
                    </el-col>
                    <el-col :md="8" :sm="8">
                      <el-input @blur="saveTaskSubtask(selectedTask)" @keyup.enter.native="saveTaskSubtask(selectedTask)" class="input-new-tag" ref="saveTagInput" size="mini" v-if="inputVisible" v-model="selectedTask.new_subtask"></el-input>
                      <el-button @click="showInput" class="button-new-tag" plain size="mini" style="padding:5px;" type="warning" v-else>+ Add Subtask</el-button>
                    </el-col>
                  </el-row>

                  <el-divider>Pictures</el-divider>

                  <el-upload :action="getFileUrl()" :file-list="photos" :headers="getHeaders()" :limit="5" :on-exceed="taskPictureHandleExceed" :on-preview="taskPictureHandlePreview" :on-remove="taskPictureHandleRemove" :on-success="taskPictureUploadSuccess" list-type="picture-card" multiple>
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </el-col>
              </div>
              <el-card v-else>
                Add a Task to view additional options
            </el-card>


            </div>

          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
    import {VclList} from 'vue-content-loading'


    export default {
        components: {
            VclList
        },
        data: () => {
            return {
                selectedChecklistTasks: [],
                newChecklistTask: "",
                selectedTask: "",
                loading: false,
                updating_name: false,
                showModal: false,
                selectedChecklist: false,
                inputVisible: false,
                photos: [],
                current_page: 1,
                total_records: 0,
                page_size: 0,
                task_loading: false,
                subtask_loading: false
            };
        },

        created() {
            this.$events.addListener("checklist:task:dialog:edit", this.setTaskDialogEvent);
        },

        beforeDestroy() {
            this.$events.removeListener("checklist:task:dialog:edit", this.setTaskDialogEvent);
        },

        mounted() {
            if (this.$route.params.id) {
                this.loading = true;
                this.axios
                    .get("/companies/current/checklists/" + this.$route.params.id)
                    .then(res => {
                        this.selectedChecklist = res.data;
                        this.loadSelectedChecklistTasks();
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err);
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            }

            this.showModal = true;
        },

        methods: {
            showInput() {
                this.inputVisible = true;
            },

            settingsRedirect() {
                this.showModal = false
                this.$router.push({name: "dashboard_checklists"});
            },

            selectTask(task) {
                this.photos = [];
                this.selectedTask = task;
                if (this.selectedTask && this.selectedTask.pictures)
                    this.selectedTask.pictures.forEach(url => {
                        this.photos.push({url: url});
                    });
            },

            previewPicture(url) {
                this.dialogImageUrl = url;
                this.dialogVisible = true;
            },

            updateSelectedTask() {
                this.updating_name = true;
                this.axios
                    .patch("/tasks/" + this.selectedTask.id, {name: this.selectedTask.name})
                    .then(res => {
                        this.$message.success("Task updated");
                    })
                    .catch()
                    .then(() => {
                        this.updating_name = false;
                    });
            },

            setTaskDialogEvent(selectedChecklist) {
                this.newChecklistTask = "";
                if (selectedChecklist) {
                    this.selectedChecklist = selectedChecklist;
                    this.loadSelectedChecklistTasks();
                } else {
                    this.loading = false;
                }
            },

            loadSelectedChecklistTasks() {
                this.newChecklistTask = "";

                this.task_loading = true;
                this.axios
                    .get("/checklists/" + this.selectedChecklist.id + "/tasks", {
                        params: {
//                            page: this.current_page,
                            filter: {
                                include: ['subtasks']
                            }
                        }
                    })
                    .then(res => {
                        this.selectedChecklistTasks = res.data;
//                        this.page_size = res.data.meta.itemsPerPage;
//                        this.total_records = res.data.meta.totalItemCount;
                        if (this.selectedChecklistTasks.length > 0) {
                            this.selectedTask = this.selectedChecklistTasks[0];
                        }
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.task_loading = false;
                    });
            },

            getHeaders() {
                return {Authorization: this.$auth.token()};
            },
            getFileUrl() {
                return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
            },

            saveChecklistTask() {
                // first check if there's a selectedTask if not then its new

                this.photos = [];

                if (this.newChecklistTask.trim() === "") {
                    return;
                }

                this.loading = true;


                // treat as a new checklist and save
                this.axios
                    .post("/checklists/" + this.selectedChecklist.id + "/tasks/", {
                        name: this.newChecklistTask,
                        is_subtask: false
                    })
                    .then(res => {
                        this.loadSelectedChecklistTasks();
                      /*  this.selectedChecklistTasks.push(res.data);
                       this.selectedTask = res.data;*/
                        this.newChecklistTask = "";
                    })
                    .catch(err => {
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            saveTaskSubtask(task) {

                if (!task.new_subtask || task.new_subtask.trim().length === 0) {
                    return;
                }

                if (this.subtask_loading) return

                this.inputVisible = false;
                this.subtask_loading = true


                this.axios
                    .post("/tasks/" + task.id + "/subtasks", {name: task.new_subtask, is_subtask: true})
                    .then(res => {
                        task.new_subtask = "";
                        if (task.subtasks) {
                            task.subtasks.push(res.data);
                        } else {
                            task.subtasks = [res.data];
                        }

                        this.inputVisible = true

                        this.$nextTick(() => {
                            this.$refs.saveTagInput.focus()
                        })
                    })
                    .catch(err => {
                        //this.inputVisible = true;
                    })
                    .finally(() => {
                        this.subtask_loading = false
                    });
            },

            deleteTask(task, index) {
                this.$confirm('Are you sure you want to delete this task?')
                    .then(() => {
                        this.axios
                            .delete("/tasks/" + task.id)
                            .then(res => {
                                this.selectedChecklistTasks.splice(index, 1);
                                this.selectedTask = false;
                            })
                            .catch(err => {
                            })
                            .finally(() => {
                                this.loadSelectedChecklistTasks();
                            });
                    })

            },

            duplicateTask(task) {
                // remove id and save
                delete task.id;
                task.name = task.name + " *";

                this.axios
                    .post("/checklists/" + this.selectedChecklist.id + "/tasks/", task)
                    .then(res => {
                        this.selectedTask = res.data.id;
                        this.newChecklistTask = res.data.name;
                    })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(() => {
                        this.loadSelectedChecklistTasks();
                    });
            },

            deleteSubtask(subtask, task, index) {
                this.$confirm('Are you sure you want to delete this subtask?')
                    .then(() => {
                        this.axios
                            .delete("/tasks/" + task.id + "/subtasks/rel/" + subtask.id)
                            .then(res => {
                                // reload the task the task  only
                                task.subtasks.splice(index, 1);
                            })
                            .catch(err => {
                            });
                    })

            },

            taskPictureHandleExceed() {
            },
            taskPictureHandleRemove() {
            },
            taskPictureUploadSuccess(res, file) {
                // get the selected task

                let task = this.selectedChecklistTasks.find(task => {
                    return task.id === this.selectedTask.id;
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
                        .patch("/tasks/" + task.id, {pictures: task.pictures})
                        .then(res => {
                            this.getSelectedChecklistTasks();
                        })
                        .catch(err => {
                        });
                }
            },
            taskPictureHandlePreview() {
            }
        }
    };
</script>

<style lang="scss">
  .checklist-task-subtasks {
    .add-subtask-card {
      .el-card__body {
        text-align: center;

        box-sizing: border-box;
        padding: 10px;
      }
    }

    .subtask-card {
      .el-card__body {
        font-size: 13px;
        height: 50px;
      }
    }

    .task-list {
      .el-col {
        padding: 5px 10px;
        cursor: pointer;

        &:hover {
          background: $launch-dashboard-bg-color;
        }

        &.active {
          background: $launch-dashboard-bg-color;
        }

        p {
          margin: 0px;
          padding: 0px;
        }
      }
    }

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
