<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="false" :visible.sync="showModal" @close="settingsRedirect" append-to-body custom-class="fullscreen-modal-display" title="Add Checklist">
            <div class="modal-body add-checklist">
                <el-row :gutter="20">
                    <el-col :md="16" :sm="16" :xs="24">
                        <el-card shadow="hover" v-loading="loading">
                            <el-form :model="form" :rules="rules" class="bg-white padding-2x" label-position="top" ref="checklistfrm" style="padding-top: 0px;padding-bottom:0px;" v-model="form">
                                <el-row :gutter="40">
                                    <el-col>
                                        <h4>{{form.name || 'New'}}</h4>
                                    </el-col>
                                    <el-col :md="12" :sm="12">
                                        <el-row :gutter="20">
                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item label="Checklist Name" prop="name">
                                                    <el-input placeholder="e.g. Clean Bathroom" ref="newchecklist" v-model="form.name"/>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item label="Attach to Service">
                                                    <el-select collapse-tags filterable multiple v-model="form.serviceIds">
                                                        <el-option :disabled="!service.active" :key="service.id" :label="service.name" :value="service.id" v-for="service in company_services"/>
                                                    </el-select>
                                                </el-form-item>
                                            </el-col>

                                            <!-- <el-col :md="24" :sm="24" :xs="24">
                                               <el-form-item label="Attach to Service Category">
                                                 <el-select filterable multiple v-model="form.serviceCategoryIds">
                                                   <el-option :key="category.id" :label="category.name" :value="category.id" v-for="category in service_categories"/>
                                                 </el-select>
                                               </el-form-item>
                                             </el-col>-->

                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item label="Checklist Description">
                                                    <el-input :autosize="false" :rows="3" type="textarea" v-model="form.description"/>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </el-col>

                                    <el-col :md="12" :sm="12">
                                        <el-row :gutter="20">


                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item label="Attach to Customer (search with min of 3 characters)">
                                                    <el-select :popper-append-to-body="false" :remote-method="filterCustomers" filterable multiple remote v-model="form.customerIds">
                                                        <el-option :key="customer.id" :label="customer.name" :value="customer.id" v-for="customer in customers"/>
                                                    </el-select>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24" prop="duration">
                                                <duration-picker v-model="form.duration"></duration-picker>
                                            </el-col>


                                        </el-row>
                                    </el-col>

                                    <el-col>
                                        <el-divider>Tags & Checklist icon</el-divider>
                                    </el-col>

                                    <el-col :md="12" :sm="12" :xs="12">
                                        <el-form-item label="Add Tags">
                                            <tags v-model="form.tagIds"></tags>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :md="12" :sm="12" :xs="24">
                                        <el-form-item label="Upload Checklist icon">
                                            <el-upload :action="getFileUrl()"
                                                       :before-upload="beforeUpload" :headers="getHeaders()" :limit="1" :on-preview="handlePreview" :on-error="uploadError" :on-remove="handleRemove" :on-success="uploadSuccess" :show-file-list="false" list-type="picture-card">
                                                <img :src="form.icon" class="avatar" style="width: 100%" v-if="form.icon">
                                                <i class="el-icon-plus avatar-uploader-icon" style="width: 100%" v-else></i>

                                            </el-upload>

                                        </el-form-item>
                                    </el-col>

                                    <el-col>
                                        <el-divider></el-divider>
                                    </el-col>

                                    <el-col class="block-center text-center">
                                        <el-button @click="saveChecklist()" size="small" round type="primary">Save & Continue</el-button>

                                    </el-col>
                                </el-row>
                            </el-form>
                        </el-card>
                    </el-col>

                    <side-help></side-help>

                    <el-dialog :fullscreen="false" :modal-append-to-body="false" :visible.sync="dialogVisible" class="image-zoomer">
                        <img :src="dialogImageUrl" alt="" width="100%"/>
                    </el-dialog>
                </el-row>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import SideHelp from "../../components/SideHelp.vue";
    import CreateChecklistTask from "./CreateChecklistTaskModal.vue";
    import Tags from "../../../components/Tags";

    export default {
        components: {
            SideHelp,
            CreateChecklistTask,
            Tags
        },
        name: "SettingsChecklist",
        data() {
            return {
                showModal: false,
                searchSelectedChecklist: "",
                dialogImageUrl: '',
                dialogVisible: false,
                form: {
                    tagIds: [],
                    serviceCategoryIds: [],
                    serviceIds: [],
                    customerIds: [],
                    name: "",
                    duration: 0
                },
                checklists: [],
                rules: {
                    name: [
                        {
                            message: "Checklist name is required",
                            required: true
                        }
                    ],
                    duration: [
                        {
                            message: "Minimum duration of 10mins is required",
                            required: true,
                            type: "number",
                            min: 10
                        }
                    ]
                },
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
                remote_loading: false,
                fileList: []
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

            this.getCustomers();
        },

        beforeDestroy() {
            // this.$events.removeListener("checklist:dialog:edit", this.setSelectedChecklistEvent);
        },

        methods: {
            showTasks(checklist) {
                this.$router.push({
                    name: "dashboard_checklists_tasks",
                    params: {id: checklist.id}
                });
            },
            setSelectedChecklistEvent(selectedChecklist) {
                if (selectedChecklist.hasOwnProperty("id")) this.form = selectedChecklist;
                else this.resetForm();

                this.loading = false;
            },

            resetForm() {
                this.form = {
                    tagIds: [],
                    serviceCategoryIds: [],
                    serviceIds: [],
                    customerIds: [],
                    name: "",
                    duration: 0
                };
            },

            beforeUpload() {
                this.loading = true
            },

            getFileList() {
                return []
            },

            addNewChecklist() {
                this.resetForm();
                this.formTasks = [];
                this.newChecklistTask = "";
                this.selectedTask = "";

                this.saveChecklist();
            },
            settingsRedirect() {
                this.$router.push({name: "dashboard_checklists"});
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
                this.form = {
                    tagIds: [],
                    serviceCategoryIds: [],
                    serviceIds: [],
                    customerIds: []
                };

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

            getCustomers() {
                this.axios.get('/companies/current/accounts', {
                    params: {
                        filter: {
                            where: {
                                role: 'r_customer'
                            }
                        }
                    }
                })
                    .then((res) => {
                        this.customers = res.data;
                    }).catch((err) => {
                    console.log(err);
                });
            },

            saveChecklist() {
                this.$refs.checklistfrm.validate((valid) => {
                    if (valid) {
                        if (this.form.hasOwnProperty("id")) {
                            this.axios
                                .put("/companies/current/checklists/" + this.form.id, this.form)
                                .then(res => {
                                    this.$message.success("Checklist successfully updated");
                                    this.$router.push({
                                        name: "dashboard_checklists_tasks",
                                        params: {id: res.data.id}
                                    });
                                    //immediately proceed to the tasks and subtasks of this checklist
                                })
                                .catch(err => {
                                });
                        } else {
                            this.axios
                                .post("/companies/current/checklists", this.form)
                                .then(res => {
                                    this.$message.success("Checklist successfully saved");
                                    this.$router.push({
                                        name: "dashboard_checklists_tasks",
                                        params: {id: res.data.id}
                                    });
                                })
                                .catch(err => {
                                });
                        }
                    }
                })

            },

            deleteChecklist() {
                if (this.form.hasOwnProperty("id")) {
                    this.axios
                        .delete("/companies/current/checklists/" + this.form.id)
                        .then(res => {
                            this.$message.success("Checklist successfully deleted");
                        })
                        .catch(err => {
                        });
                }
            },

            filterCustomers(query) {
                if (query !== '' && query.length > 2) {
                    this.remote_loading = true

                    this.axios
                        .get('/companies/current/accounts', {
                            params: {
                                filter: {
                                    where: {
                                        or: [
                                            {
                                                email: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                first_name: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                last_name: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                company: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            }
                                        ],
                                        role: 'r_customer'
                                    }
                                }
                            }
                        })
                        .then(res => {
                            this.customers = res.data
                        })
                        .catch(err => {
                            this.$helpers.err(err, this)
                        })
                        .then(() => {
                            this.remote_loading = false
                        })
                }


            },

            querySearchAsync(queryString, cb) {
                this.axios
                    .get("/companies/current/checklists", {
                        params: {
                            filter: {
                                where: {
                                    name: {
                                        like: queryString,
                                        options: "i"
                                    }
                                }
                            }
                        }
                    })
                    .then(res => {
                        cb(res.data);
                    })
                    .catch(err => {
                    });
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
                this.loading = false
            },

            handlePreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogVisible = true;
            },

            uploadError() {
                this.loading = false
            },

            getSelectedChecklistTasks() {
                // refetch checklist tasks
                this.axios
                    .get("/checklists/" + this.form.id + "/tasks")
                    .then(res => {
                        this.formTasks = res.data;
                    })
                    .catch(err => {
                    });
            },

            saveChecklistTask() {
                // first check if there's a selectedTask if not then its new

                if (this.newChecklistTask.trim() === "") {
                    return;
                }

                if (this.selectedTask && this.selectedTask.length > 0) {
                    // get the id of the form tase
                    this.axios
                        .patch("/tasks/" + this.selectedTask, {name: this.newChecklistTask})
                        .then(res => {
                            this.newChecklistTask = "";

                            this.getSelectedChecklistTasks();
                        })
                        .catch(err => {
                        });
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
                    .post("/tasks/" + task.id + "/subtasks", {
                        name: task.new_subtask,
                        is_subtask: true
                    })
                    .then(res => {
                        task.new_subtask = "";
                        if (task.subtasks) {
                            task.subtasks.push(res.data);
                        } else {
                            task.subtasks = [res.data];
                        }
                    })
                    .catch(err => {
                    });
            },

            deleteTask(task, index) {
                this.axios
                    .delete("/tasks/" + task.id)
                    .then(res => {
                        this.formTasks.splice(index, 1);
                    })
                    .catch(err => {
                    });
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
                    .catch(err => {
                    });
            },

            taskPictureHandleExceed() {
            },
            taskPictureHandleRemove() {
            },
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
    .modal-body {
        &.add-checklist {

            .image-zoomer .el-dialog .el-dialog__header .el-dialog__headerbtn {
                top: 5px;

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
