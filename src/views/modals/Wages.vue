<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" :visible.sync="showModal" @close="settingsRedirect" appendToBody custom-class="fullscreen-modal-display" title="Wages">
            <div class="modal-body wages ">
                <el-card class="flex-row-reverse" shadow="never">
                    <el-button @click="$router.push({ name: 'dashboard_people_edit',query: { team: true } })" icon="el-icon-plus" plain round size="mini" type="success">Add People</el-button>
                </el-card>

                <el-divider></el-divider>

                <el-table :data="teams" class="bg-white" style="width: 100%" v-loading="loading">

                    <!--  <el-table-column label="Date Wage Set" prop="created_at" width="150">
                          <template slot-scope="scope">
                              {{ $moment(scope.row.created_at).format("DD/MM/YY") }}
                          </template>
                      </el-table-column>-->

                    <el-table-column label="Team Member">
                        <template slot-scope="scope">
                            <account-avatar :account="scope.row" :size="32" body-class="pull-left"></account-avatar>
                            <div style="widith: calc(100% - 40px);display:inline-block;margin-left: 10px;">
                                <label style="line-height:normal; text-transform: capitalize;">{{ scope.row.fullname }}</label>
                                <el-rate allow-half disabled v-model="scope.row.rating"></el-rate>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="Pay Type">
                        <template slot-scope="scope">
                            <el-select disabled v-model="scope.row.pay_rate_type">
                                <el-option label="Hourly" value="hourly"></el-option>
                                <el-option label="Percent" value="percent"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>

                    <el-table-column label="Pay" prop="address">
                        <template slot-scope="scope">
                            <el-input disabled type="number" v-model="scope.row.pay_rate">
                                      <span slot="append" v-if="scope.row.pay_rate_type === 'percent'">
                                        %
                                      </span>
                                <span slot="prepend" v-else>
                                        {{ $currency }}
                                      </span>
                            </el-input>
                        </template>
                    </el-table-column>

                    <el-table-column label="Status">
                        <template slot-scope="scope">
                            <el-link @click="gotoProfile(scope.row.id)" type="warning">Edit</el-link>
                        </template>
                    </el-table-column>
                </el-table>

                <el-col class="pagination-footer">
                    <div class="cct">
                        <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadWages" background layout="total, prev, pager, next"></el-pagination>
                    </div>
                </el-col>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import AccountAvatar from "../../components/AccountAvatar";

    export default {
        name: "SettingsService",
        components: {AccountAvatar},
        data() {
            return {
                showModal: false,
                teams: [],
                loading: true,
                current_page: 1,
                total_records: 0,
                page_size: 0
            };
        },


        beforeMount() {
            //load people teams
            this.loadWages(1);
        },

        mounted() {
            this.showModal = true;
        },
        methods: {
            settingsRedirect() {
                this.$router.push({name: "dashboard_settings"});
            },
            handleSelectionChange() {
            },
            loadWages(current_page) {
                if (!current_page) current_page = this.current_page;
                this.loading = true;
                this.axios
                    .get("/companies/current/accounts", {
                        params: {
                            page: current_page,
                            filter: {where: {role: "r_team"}, limit: 10}
                        }
                    })
                    .then(res => {
                        this.teams = res.data.data;
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch(err => {
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            gotoProfile(id) {
                this.$router.push({
                    name: 'dashboard_people_edit',
                    params: {id: id},
                    query: {
                        q: "dashboard_settings_wages"
                    }
                })
            }
        }
    };
</script>
<style lang="scss">
    .modal-body.wages {
        .el-avatar {
            float: left;
            margin-right: 5px;
        }
    }
</style>
