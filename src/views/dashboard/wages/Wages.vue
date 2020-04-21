<template>

    <div class="app-section wages ">
        <el-card>
            <el-row :gutter="0" class="stats-row">
                <div class="second">
                    <span class="stats-number _second">{{$currency}} {{total_earned | numeralFormat($money_format)}}</span>
                    <label>Earned</label>
                </div>
                <el-divider direction="vertical"></el-divider>
                <div class="second">
                    <span class="stats-number _second">{{$currency}} {{total_dued | numeralFormat($money_format)}}</span>
                    <label>Due</label>
                </div>
                <el-divider direction="vertical"></el-divider>
                <div class="fourth">
                    <span class="stats-number _fourth">{{$currency}}{{total_paid | numeralFormat($money_format)}}</span>
                    <label>Paid</label>
                </div>
                <el-divider direction="vertical"></el-divider>
                <div class="third">
                    <span class="stats-number _third"> {{$currency}}{{total_tips | numeralFormat($money_format)}}</span>
                    <label>Tips</label>
                </div>
                <el-divider direction="vertical"></el-divider>

                <div class="fourth">
                    <span class="stats-number _fourth">{{$currency}}{{total_adjustment | numeralFormat($money_format)}}</span>
                    <label>Adjustments</label>
                </div>
                <el-divider direction="vertical"></el-divider>


                <div class="fourth">
                    <span class="stats-number _fourth"> {{total_hours_worked | duration}}</span>
                    <label>Hours Earned</label>
                </div>
                <el-divider direction="vertical"></el-divider>
                <div class="fourth">
                    <span class="stats-number _fourth"> {{total_hours_scheduled | duration}}</span>
                    <label>Hours Scheduled</label>
                </div>
            </el-row>
        </el-card>

        <el-card style="border:none;margin-bottom: 5px;">
            <el-row>
                <el-col class="bg-white text-center">
                    <div class="pull-left main-filters">
                        <el-date-picker
                                :clearable="false"
                                :format="dt_format"
                                @change="loadWages"
                                end-placeholder="End date"
                                range-separator="to"
                                size="small" start-placeholder="Start date" type="daterange" v-model="range"
                        />
                    </div>

                    <div class="pull-right main-filters">

                        <el-select @change='loadWages(1)' class="filter small pull-right" filterable placeholder="Active" v-model="active_filter">
                            <el-option :value="true" label="Active"></el-option>
                            <el-option :value="false" label="Archived"></el-option>
                        </el-select>

                        <el-select @change='loadWages(1)' class="filter small pull-right" filterable placeholder="Team" style="width: 300px;" v-model="selected_team">
                            <el-option label="All" value="all"></el-option>
                            <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in teams">
                                {{ team.name }}
                            </el-option>
                        </el-select>
                    </div>
                </el-col>
            </el-row>

        </el-card>

        <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 310) + 'px', height: (windowHeight - 310) + 'px', overflow: 'hidden'}">

            <el-table :data="wages" @selection-change="handleSelectionChange" class="bg-white" stripe style="width: 100%" v-loading="loading">
                <el-table-column label="Team member" prop="name" width="250">
                    <template slot-scope="scope">
                        <account-avatar :account="{id : scope.row.accountId, avatar : scope.row.avatar, fullname: scope.row.name}" :size="32" body-class="pull-left"></account-avatar>
                        <div style="margin-left: 10px;display:inline-block;">
                            <el-link @click="viewTimesheet(scope.row.accountId)" style="margin-bottom: 3px;">{{scope.row.name}}</el-link>
                            <el-rate allow-half disabled v-model="scope.row.rating"></el-rate>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Earned">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.earned.toFixed(2)}}
                    </template>
                </el-table-column>
                <el-table-column label="Tips">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.tips}}
                    </template>
                </el-table-column>
                <el-table-column label="Adjustments">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.adjustments}}
                    </template>
                </el-table-column>
                <el-table-column label="Due">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.dued.toFixed(2)}}
                    </template>
                </el-table-column>
                <el-table-column label="Paid">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.paid}}
                    </template>
                </el-table-column>
                <el-table-column label="Hrs Worked">
                    <template slot-scope="scope">
                        {{scope.row.hours_worked | duration}}
                    </template>
                </el-table-column>
                <el-table-column label="Hrs Scheduled">
                    <template slot-scope="scope">
                        {{scope.row.scheduled | duration}}
                    </template>
                </el-table-column>

            </el-table>

            <no-data :show="wages.length === 0 && !loading"></no-data>
        </el-scrollbar>

        <el-col class="pagination-footer">
            <div class="cct">
                <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadWages" background layout="total, prev, pager, next"></el-pagination>
            </div>
        </el-col>
    </div>

</template>

<script>
    import AccountAvatar from "../../../components/AccountAvatar";
    import NoData from "../../../components/NoData";

    export default {
        name: "SettingsService",
        components: {NoData, AccountAvatar},
        data() {
            return {
                showModal: false,
                wages: [],
                loading: false,
                current_page: 1,
                total_records: 0,
                page_size: 0,
                teams: [],
                active_filter: true,
                range: [],
                selected_team: 'all',
                dt_format: ''
            };
        },
        computed: {
            total_earned() {
                let total = 0
                this.wages.forEach((pay) => {
                    total += (Number(pay.earned) + Number(pay.adjustments))
                })
                return total.toFixed(2)
            },
            total_adjustment() {
                let total = 0
                this.wages.forEach((pay) => {
                    total += Number(pay.adjustments)
                })
                return total.toFixed(2)
            },
            total_hours_scheduled() {
                let total = 0
                this.wages.forEach((pay) => {
                    total += Number(pay.scheduled)
                })
                return total.toFixed(2)
            },
            total_hours_worked() {
                let total = 0
                this.wages.forEach((pay) => {
                    total += Number(pay.hours_worked)
                })
                return total.toFixed(2)
            },
            total_tips() {
                let total = 0
                this.wages.forEach((pay) => {
                    total += Number(pay.tips)
                })
                return total.toFixed(2)
            },
            total_dued() {
                let total = 0
                this.wages.forEach((pay) => {
                    total += Number(pay.dued)
                })
                return total.toFixed(2)
            },
            total_paid() {
                let total = 0
                this.wages.forEach((pay) => {
                    total += Number(pay.paid)
                })
                return total.toFixed(2)
            }
        },

        beforeMount() {
            //load people teams
            this.range = [this.$moment().startOf('week').toDate(), this.$moment().endOf('week').toDate()]
            this.loadWages(1);
            this.getTeams()
        },

        mounted() {
            this.dt_format = this.$helpers.toElFormat(this.$date_format)

        },
        methods: {
            settingsRedirect() {
                this.$router.back();
            },
            handleSelectionChange() {
            },
            getTeams() {
                this.axios.get('/companies/current/accounts',
                    {
                        params: {
                            filter: {
                                where: {
                                    active: this.active_filter,
                                    role: 'r_team'
                                }
                            }
                        }
                    })
                    .then(res => {
                        this.teams = res.data
                    })
            },
            loadWages(current_page) {
                this.loading = true
                this.axios.get('/timesheets/wages', {
                    params: {
                        page: this.current_page,
                        from: this.range[0],
                        to: this.range[1],
                        status: this.active_filter,
                        selected_team: this.selected_team
                    }
                })
                    .then(res => {
                        this.wages = res.data
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            viewTimesheet(accountId) {
                this.$router.push({name: "dashboard_wages_team", params: {id: accountId}})
            }
        }
    };
</script>
<style lang="scss">
    .app-section.wages {
        .el-divider--vertical {
            height: auto;
        }

        .el-avatar {
            float: left;
            margin-right: 5px;
        }

        .el-select + .el-select {
            margin-left: 10px;
            margin-right: 10px;
        }

    }
</style>
