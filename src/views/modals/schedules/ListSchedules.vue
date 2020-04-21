<template>
    <el-container class="app-section email-templates" v-loading="loading">
        <el-row :gutter="20" class="full-width">
            <el-col :md="24">
                <el-table :data="tasks" style="width: 100%">
                    <el-table-column label="Name" prop="name" width="300"></el-table-column>
                    <el-table-column label="Scheduled for" prop="hours" width="150">
                        <template slot-scope="scope">
                            {{$moment(scope.row.hours + ":" + scope.row.minutes, 'HH:mm').format($time_format)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="Last run">
                        <template slot-scope="scope" v-if="scope.row.last_run">
                            {{$moment(scope.row.last_run).format($date_format + ' ' + $time_format)}}
                        </template>

                    </el-table-column>
                    <el-table-column label="Next run">
                        <template slot-scope="scope" v-if="scope.row.next_run">
                            {{$moment(scope.row.next_run).format($date_format + ' ' + $time_format)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="Status">
                        <template slot-scope="scope">
                            <el-switch active-color="green" size="mini" v-model="scope.row.enabled"></el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column>
                        <template slot-scope="scope">
                            <el-button :disabled="!scope.row.enabled" :loading="running" @click="runNow(scope.row.code)"
                                       size="mini" type="text">Run now
                            </el-button>
                            <el-divider direction="vertical"></el-divider>
                            <el-button :disabled="!scope.row.enabled" @click="editTask(scope.row)" size="mini"
                                       type="text">Edit
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <el-dialog :modal="true" :visible.sync="editDialog" append-to-body title="Edit Task" width="30%">
            <div class="modal-body" v-if="selectedTask">
                <el-form label-position="top">
                    <el-form-item disabled label="Task Name">
                        <el-input v-model="selectedTask.name"></el-input>
                    </el-form-item>
                    <el-form-item label="Run at">
                        <VueCtkDateTimePicker
                                label=""
                                output-format="HH:mm"
                                :minute-interval="10"
                                :formatted="$time_format" :format="$time_format" :only-time="true" v-model="time"/>
                    </el-form-item>
                    <el-form-item v-if="selectedTask.code === 'charge_cards' || selectedTask.code === 'put_on_hold'">
                        <el-row>
                            <el-col :sm="12">
                                <el-input-number v-model="selectedTask.delta" :disabled="delta=== 0"></el-input-number>
                            </el-col>
                            <el-col :sm="12">
                                <el-select v-model="delta" @change="changeDelta">
                                    <el-option :value="0" label="Same day"></el-option>
                                    <el-option :value="-1" label="(days) BEFORE booking"></el-option>
                                    <el-option :value="1" label="(days) AFTER booking"></el-option>
                                </el-select>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer">
                <el-button round size="small" @click="editDialog = false">Close</el-button>
                <el-button round size="small" type="primary" @click="saveTask()">Save Changes</el-button>
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
    import moment from "moment";

    export default {
        data: () => {
            return {
                moment: moment,
                loading: false,
                running: false,
                tasks: [],
                editDialog: false,
                selectedTask: false,
                time: '00:00 am',
                delta: 0
            };
        },

        mounted() {
            this.getTasks()
        },

        methods: {
            getTasks() {
                this.loading = true
                this.axios.get('/companies/current/crons', {
                    params: {
                        filter: {
                            where: {
                                system: false
                            }
                        }
                    }
                })
                    .then(res => {
                        this.tasks = res.data
                    })
                    .catch(err => {

                    })
                    .then(() => {
                        this.loading = false
                    })
            },
            runNow(code) {
                this.running = true
                this.axios.post('/crons/manual',
                    {
                        code: code
                    })
                    .then(res => {
                        this.$helpers.successHandle('Task has been scheduled for execution', this)
                        this.running = false

                    })
                    .catch(err => {
                        this.running = false
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.running = false
                        this.getTasks();
                    })
            },
            editTask(task) {
                this.selectedTask = task

                //confirm delta to time format 00:00
                this.time = this.selectedTask.hours + ":" + this.selectedTask.minutes

                if (this.selectedTask.delta < 0)
                    this.delta = -1
                else if (this.selectedTask.delta > 0)
                    this.delta = 1
                else
                    this.delta = 0

                this.selectedTask.delta = Math.abs(this.selectedTask.delta)

                this.editDialog = true

            },
            saveTask() {

                this.selectedTask.hours = this.time.split(":")[0]
                this.selectedTask.minutes = this.time.split(":")[1]

                let data = JSON.parse(JSON.stringify(this.selectedTask))
                data.delta = this.selectedTask.delta * this.delta

                this.axios.patch('/crons/' + this.selectedTask.id, data)
                    .then(res => {
                        this.$helpers.successHandle("Task successfully updated")
                        this.editDialog = false
                        this.delta = 0
                        this.time = "00:00"
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })

            },
            changeDelta(val) {
                if (val === 0) {
                    this.selectedTask.delta = 0
                }
            }
        }
    };
</script>
