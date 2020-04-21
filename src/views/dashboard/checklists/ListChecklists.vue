<template>
    <div class="app-section checklist">
        <el-card style="margin-bottom: 5px; border:none;">
            <el-row>
                <el-col>
                    <div class="main-filters pull-left">
                        <el-select @change="loadChecklists()" class="filter small" v-model="filter_active">
                            <el-option :value="true" label="Active"></el-option>
                            <el-option :value="false" label="Archived"></el-option>
                        </el-select>
                    </div>
                    <div class="pull-right main-filters">
                        <el-button @click="addNewChecklist()" icon="el-icon-plus" plain round size="mini" type="success">Add Checklist</el-button>

                    </div>
                </el-col>
            </el-row>

        </el-card>
        <el-row class="full-width">
            <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 210) + 'px', height: (windowHeight - 210) + 'px', overflow: 'hidden'}">

                <el-table :data="checklists">
                    <el-table-column label="icon" width="54">
                        <template slot-scope="scope">
                            <el-image :src="scope.row.icon" shape="square" style="width: 42px; height: 42px" v-if="scope.row.icon"></el-image>
                            <el-image :src="require('@/assets/svgs/checklist-default.svg')" shape="square" style="width: 42px; height: 42px" v-if="!scope.row.icon"></el-image>
                        </template>
                    </el-table-column>
                    <el-table-column label="Name" prop="name"></el-table-column>

                    <el-table-column label="Services" width="100px">
                        <template slot-scope="scope">
                            {{ scope.row.serviceIds.length }}
                        </template>
                    </el-table-column>

                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-row :gutter="10">
                                <el-col :key="taskIndex" :md="6" :sm="6" :xs="24" style="margin-bottom: 5px;" v-for="(task, taskIndex) in scope.row.tasks">
                                    <el-card>
                                        {{ task.name }}
                                    </el-card>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>

                    <el-table-column label="Tasks" prop="tasks" width="100px">
                        <template slot-scope="scope">
                            {{ scope.row.tasks.length }}
                            <el-divider direction="vertical"></el-divider>
                            <el-button @click="editChecklistTasks(scope.row)" class="price-edit" type="text">Edit</el-button>
                        </template>
                    </el-table-column>

                    <el-table-column lable="Options">
                        <template slot-scope="scope">
                            <el-button-group class="table-action-btns">
                                <el-link @click="manageChecklist(scope.row)" type="primary">Edit</el-link>
                                <el-divider direction="vertical"></el-divider>
                                <el-link @click="duplicateChecklist(scope.row)">Duplicate</el-link>
                                <el-divider direction="vertical"></el-divider>
                                <el-link @click="archiveChecklist(scope.row)" v-if="scope.row.active">Archive</el-link>
                                <el-link @click="archiveChecklist(scope.row)" v-if="!scope.row.active">Activate</el-link>
                                <el-divider direction="vertical"></el-divider>
                                <view-changes :id="scope.row.id"></view-changes>

                            </el-button-group>
                        </template>
                    </el-table-column>
                </el-table>
                <no-data :show.sync="checklists.length === 0 && !loading"></no-data>

            </el-scrollbar>
            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadChecklists" background layout="total, prev, pager, next"></el-pagination>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import CreateChecklistTask from "./CreateChecklistTaskModal.vue";
    import NoData from "../../../components/NoData";
    import ViewChanges from "../../../components/ViewChanges";

    export default {
        components: {
            ViewChanges,
            NoData,
            CreateChecklistTask
        },
        data: () => {
            return {
                checklists: [],
                checklistDialog: false,
                selectedChecklist: false,
                tasksDialog: false,
                destination: false,
                total_records: 0,
                page_size: 0,
                current_page: 1,
                filter_active: true,
                loading: false
            };
        },

        mounted() {
            this.loadChecklists(1);

            if (this.$route.query.hasOwnProperty("add")) {
                this.selectedChecklist = false;
                // this.checklistDialog = true
                this.destination = this.$route.query.destination;
            } else {
                this.destination = false;
            }

            this.$events.emitEvent('track-page')
        },

        methods: {
            addNewChecklist() {
                this.$router.push({name: "dashboard_checklists_create"});
            },

            editChecklistTasks(checklist) {
                this.$router.push({
                    name: "dashboard_checklists_tasks",
                    params: {id: checklist.id}
                });
            },

            manageChecklist(checklist) {
                this.$router.push({
                    name: "dashboard_checklists_edit",
                    params: {id: checklist.id}
                });
            },

            archiveChecklist(checklist) {

                let msg = 'Are you sure you want to activate this checklist?';
                let status_msg = 'activated';
                if (checklist.active) {
                    msg = 'Are you sure you want to archive this checklist?';
                    status_msg = 'archived';
                }


                this.$confirm(msg, {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                })
                    .then(() => {
                        this.axios
                            .patch("/checklists/" + checklist.id, {
                                active: !checklist.active
                            })
                            .then(res => {
                                this.$helpers.successHandle("Service successfully " + status_msg);
                                this.loadChecklists()
                            })
                            .catch(err => {
                            });
                    });
            },

            tasksDialogClosed() {
                this.selectedChecklist = false;
                this.loadChecklists(this.current_page);
            },
            tasksDialogOpened() {
            },

            duplicateChecklist(selectedChecklist) {
                this.selectedChecklist = selectedChecklist;
                delete this.selectedChecklist.id;
                this.selectedChecklist.name += " *";
                // now save
                this.saveChecklist();
            },

            closeChecklistDialog() {
                this.checklistDialog = false;
                this.selectedChecklist = false;
            },

            saveChecklist() {
                if (this.selectedChecklist.hasOwnProperty("id")) {
                    this.axios
                        .put("/companies/current/checklists/" + this.selectedChecklist.id, this.selectedChecklist)
                        .then(res => {
                            this.$message.success("Checklist successfully updated");
                            this.closeChecklistDialog();
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.loadChecklists(this.current_page);
                        });
                } else {
                    this.axios
                        .post("/companies/current/checklists", this.selectedChecklist)
                        .then(res => {
                            this.$message.success("Checklist successfully saved");
                            this.closeChecklistDialog();
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.loadChecklists(this.current_page);
                        });
                }
            },

            loadChecklists(current_page) {
                if (!current_page) current_page = this.current_page;
                this.loading = true;
                this.axios
                    .get("/companies/current/checklists", {
                        params: {
                            page: 1,
                            filter: {
                                include: "tasks",
                                where: {
                                    active: this.filter_active
                                }
                            }
                        }
                    })
                    .then(res => {
                        this.checklists = res.data.data;
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch(err => {
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },

            checklistDialogOpened() {
                this.$events.emitEvent("checklist:dialog:edit", [this.selectedChecklist]);
            },

            checklistDialogClosed() {
                this.selectedChecklist = false;
                this.loadChecklists(this.current_page);
                if (this.destination) {
                    this.$router.push(this.destination);
                }
            }
        }
    };
</script>

<style lang="scss">

    .page.dashboard.layout .content-level-1 {
        height: 100%;
        width: 100%;
        overflow: auto;
    }

    .el-table {
        .table-action-btns {
            .el-link {
                font-size: 12px !important;
                margin: 0;
            }
        }
    }
</style>
