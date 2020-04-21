<template>

    <div class="app-section checklist-task-subtasks">

        <el-card :body-style="{padding: '10px'}" style="margin-bottom : 5px;">
            <el-page-header @back="$router.back()" :content="selectedChecklist.name"></el-page-header>
        </el-card>

        <el-row :gutter="10">
            <el-col>
                <el-row :gutter="0">
                    <el-col :md="6" :sm="6" class="bg-white border-right">
                        <el-card>
                            Tasks on this checklist
                        </el-card>
                        <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 220) + 'px', height: (windowHeight - 220) + 'px', overflow: 'hidden'}">
                            <ul class="task-list">
                                <draggable v-model="selectedChecklistTasks" group="tasks" @start="drag=true" @end="drag=false" @change="taskReorder(false)">
                                    <li :key="task.id" v-for="task in selectedChecklistTasks" :class="{ active: selectedTask.id === task.id }" @click="selectTask(task)">
                                        <div class="task-card">
                                            <p>{{ task.name }}</p>
                                        </div>
                                    </li>
                                </draggable>
                            </ul>

                        </el-scrollbar>
                    </el-col>
                    <el-col :md="18" :sm="18" class="bg-white">
                        <el-row>
                            <el-col>
                                <el-card style="border:none; margin-bottom: 5px;">
                                    <div class="flex-row">
                                        <div class="main-filters pull-left">
                                            <div v-if="!editTask && !addChecklist">
                                                <el-link @click="addChecklist = true" icon="el-icon-plus" size="mini" type="success">Add new task</el-link>

                                                <el-divider direction="vertical"></el-divider>

                                                <label style="font-size: 14px;">{{ selectedTask.name }} ({{ selectedTask.subtasks ? selectedTask.subtasks.length : 0 }})
                                                    <el-link type="danger" @click="editTask = true" size="mini"><i style="font-size: 16px; cursor:pointer;" class="el-icon-edit">(edit)</i></el-link>
                                                </label>
                                            </div>


                                            <div v-if="addChecklist" style="min-width: 300px;">
                                                <label style="margin-bottom: 5px;">Add new task</label>
                                                <div style="margin: 10px 0px;">
                                                    <i>Press enter key to add new task. Click `Done` to close this form</i>
                                                </div>
                                                <el-input v-if="addChecklist" placeholder="Name of task" ref="newtask" size="small"
                                                          style="max-width: 320px; margin-bottom: 5px;"
                                                          v-model="newChecklistTask" v-on:keyup.enter.native="saveChecklistTask"></el-input>
                                                <el-button @click="addChecklist = false" plain size="mini" style="margin-left: 10px;" type="primary">Done</el-button>

                                            </div>


                                            <div v-if="editTask" style="min-width: 300px;">
                                                <label style="margin-bottom: 5px;">Edit task:</label>
                                                <div style="margin: 10px 0px;">
                                                    <i>This would change your task name/description. Click update task to save and exit</i>
                                                </div>
                                                <el-input size="mini" style="max-width: 320px; margin-bottom: 5px;" v-model="selectedTask.name"></el-input>
                                                <el-button @click="updateSelectedTask()" v-loading="updating_name" plain size="mini" style="margin-left: 10px;" type="primary">Update task</el-button>
                                            </div>
                                        </div>
                                        <div class="main-filters pull-right">

                                            <el-link @click="deleteTask(selectedTask)" plain type="warning">
                                                Delete
                                            </el-link>
                                            <el-divider direction="vertical"></el-divider>

                                            <el-link @click="duplicateTask(selectedTask)" plain type="warning">
                                                Duplicate
                                            </el-link>
                                            <el-divider direction="vertical"></el-divider>


                                        </div>
                                    </div>
                                </el-card>
                            </el-col>
                        </el-row>
                        <el-card style="width: calc(100% - 10px)">
                            <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 300) + 'px', height: (windowHeight - 300) + 'px', overflow: 'hidden'}">
                                <h4>You can add additional subtasks and pictures to this task below: </h4>
                                <div v-if="selectedTask" v-loading="subtask_loading">
                                    <el-col :md="24" :sm="24" :xs="24" class="bg-white">
                                        <el-row>
                                            <draggable v-model="selectedTask.subtasks" group="subtasks" @start="drag=true" @end="drag=false" @change="taskReorder(true)">

                                                <el-col v-for="(subtask, subindex) in selectedTask.subtasks" :key="subtask.id" style="margin-bottom: 5px;">
                                                    <label style="cursor:pointer" class="subtask-card">({{subindex + 1}}) {{ subtask.name }} <i @click="deleteSubtask(subtask, selectedTask, subindex)" style="color:red;cursor: pointer" class="el-icon-close"/></label>
                                                </el-col>

                                                <div slot="header" style="margin-bottom: 10px;">
                                                    <el-input placeholder="Add your subtasks" style="max-width: 50%" @blur="saveTaskSubtask(selectedTask)" @keyup.enter.native="saveTaskSubtask(selectedTask)" class="input-new-tag" ref="saveTagInput" size="mini" v-if="inputVisible" v-model="selectedTask.new_subtask"></el-input>
                                                    <el-button @click="showInput" class="button-new-tag" plain size="mini" style="padding:5px;" type="warning" v-else>+ Add Subtask</el-button>
                                                    <el-divider></el-divider>
                                                </div>
                                            </draggable>
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


                            </el-scrollbar>
                        </el-card>

                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>

</template>

<script>
    import {VclList} from 'vue-content-loading'
    import draggable from 'vuedraggable'

    export default {
        components: {
            VclList,
            draggable,
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
                subtask_loading: false,
                drag: true,
                editTask: false,
                addChecklist: false
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
                        this.editTask = false
                    })
                    .catch()
                    .finally(() => {
                        this.updating_name = false;
                    });
            },

            addNewChecklist() {

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
                                order: "ordering ASC",
                                include: [{
                                    relation: "subtasks",
                                    scope: {
                                        order: "ordering ASC"
                                    }
                                }]
                            }
                        }
                    })
                    .then(res => {
                        this.selectedChecklistTasks = res.data;
                        //this.page_size = res.data.meta.itemsPerPage;
                        //this.total_records = res.data.meta.totalItemCount;
                        if (this.selectedChecklistTasks.length > 0) {
                            this.selectedTask = this.selectedChecklistTasks[0];

                            //sort by value
                            this.selectedTask.subtasks.sort(function (a, b) {
                                return a.ordering - b.ordering;
                            });
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
                        ordering: 0,
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
                    .post("/tasks/" + task.id + "/subtasks", {name: task.new_subtask, ordering: 0, is_subtask: true})
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
                        this.$helpers.errorHandle(err)
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
            },

            taskReorder(is_subtasks) {

                this.subtask_loading = true
                this.axios.patch('/tasks/reorder-tasks',
                    {
                        tasks: is_subtasks ? this.selectedTask.subtasks : this.selectedChecklistTasks,
                        is_subtasks: is_subtasks
                    })
                    .then(res => {

                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.subtask_loading = false

                    })

            }
        }
    };
</script>

<style lang="scss">
    .checklist-task-subtasks {
        background: #f4f8f9 !important;

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

        ul.task-list {
            padding: 0px;
            display: block;
            cursor: pointer;

            li {
                display: block;
                padding: 15px 10px;
                box-sizing: border-box;
                border-left: 4px solid white;
                cursor: pointer;

                &:hover {
                    background: #f3f3f3;
                    border-left: 4px solid #f3f3f3;
                }

                .profile-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    float: left;
                    margin-right: 5px;
                }

                small {
                    display: block;
                    color: $launch-text-color;
                    font-size: 11px;
                }


                &.active {
                    border-left: 4px solid $launch-primary-color;
                    background: $launch-dashboard-bg-color;
                }

                p {
                    margin: 0px;
                    padding: 0px;
                    line-height: 1;
                    color: black;
                }
            }
        }

        /*.task-list {
            .task-card {
                display:flex;
            }

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
        }*/

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
