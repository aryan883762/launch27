<template>
    <div>
        <el-row>
            <el-col>
                <div class="flex-row">
                  <div>
                    <strong style="margin-right: 10px;">
                      Teams
                    </strong>
                    <div class="flex-row" style="display:none;">
                      <label>Avg Rating of Team </label>
                      <el-rate disabled v-model="average_rating"/>
                    </div>
                  </div>



                    <div>
                        <el-popover
                                placement="left"
                                ref="member_popover"
                                trigger="click"
                                width="400">
                            <div class="" style="text-align:left;">
                                <el-select :remote-method="getTeams" @change="updatePreferredTeams" size="mini" style="width: 100%" collapse-tags filterable multiple remote v-loading="remote_loading" v-model="preferredTeamIds">
                                    <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in preferredTeamObjs"/>
                                </el-select>
                            </div>
                            <el-button round size="mini" slot="reference" type="warning"> Manage Preferred Team</el-button>
                        </el-popover>
                    </div>
                </div>
            </el-col>
        </el-row>

        <el-divider/>

        <el-row>
            <el-col>
                <el-table :data="tablePreferredTeamObjs" style="width: 100%">
                    <el-table-column label="Team" width="200">
                        <template slot-scope="scope">
                            <strong>{{ scope.row.name }}</strong>
                        </template>
                    </el-table-column>
                    <el-table-column label="Avg Rating" prop="avg_rating">
                        <template slot-scope="scope">
                            <el-rate disabled allow-half v-model="scope.row.rating"/>
                        </template>
                    </el-table-column>
                    <el-table-column label="Appointments" prop="customer">
                        <template slot-scope="scope">
                            --
                        </template>
                    </el-table-column>
                    <el-table-column label="Status" prop="active">
                        <template slot-scope="scope">
                            {{ scope.row.active ? "Active" : "" }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        data: () => {
            return {
                teams_count: 0,
                preferredTeamIds: [],
                account: false,
                average_rating: 1,
                remote_loading: false,
                all_teams: [],
                preferredTeamObjs: [],
                tablePreferredTeamObjs: []
            }
        },

        watch: {
            $route(val) {

            }
        },

        mounted() {
        },

        created() {
            this.initialize(false);

            /* this.$events.addListener("account-changed", account => {
             this.account = account;
             this.preferredTeams = this.account.teams_preferred;
             }); */
        },

        methods: {

            initialize(onchange) {
                if (this.$route.params.id) {
                    this.loading = true
                    this.axios
                        .get('/accounts/' + this.$route.params.id + '/teams_preferred')
                        .then(res => {
                            this.preferredTeamObjs = res.data;
                            this.tablePreferredTeamObjs = res.data;
                            if (!onchange) {
                                res.data.forEach((curr, index, object) => {
                                    this.preferredTeamIds.push(curr.id);
                                });
                            }
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.loading = false
                        })
                }
            },
            getTeams(query) {
                this.remote_loading = true
                this.axios
                    .get('/companies/current/teams')
                    .then(res => {
                        this.preferredTeamObjs = res.data
                        console.log(res.data);
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.remote_loading = false
                    })
            },
            updatePreferredTeams() {
                this.remote_loading = true;
                this.axios
                    .patch('/accounts/' + this.$route.params.id, {
                        preferredTeams: this.preferredTeamIds,
                    })
                    .then(res => {
                        this.remote_loading = false
                        this.initalize(true);
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
            }
        }
    }
</script>
<style lang="scss">
    .quick-team-select {
        .el-input__inner {
            border-radius: 50px;
        }

        .el-select__tags {
            padding: 0 10px;
        }
    }
</style>