<template>
    <el-container class="apps-tab-navigation">
        <el-col>
            <el-card shadow="never" :body-style="{ padding: '0px' }">
                <el-row class="full-width bg-white">
                    <el-col :md="16">
                        <el-radio-group v-model="active_tab" class="sub-view-links">
                            <el-radio-button label="superadmin_companies_general">
                                General
                            </el-radio-button>
                            <el-radio-button label="superadmin_companies_cards">
                                Cards
                            </el-radio-button>
                            <el-radio-button label="superadmin_companies_accounts">
                                Users
                            </el-radio-button>
                       <!--     <el-radio-button label="superadmin_companies_charges">
                                Charges
                            </el-radio-button>-->
                            <el-radio-button label="superadmin_companies_subscriptions">
                                Subscriptions
                            </el-radio-button>
                     <!--       <el-radio-button label="superadmin_companies_reports">
                                Reports
                            </el-radio-button>-->
                            <el-radio-button label="superadmin_companies_migration" :disabled="!company.id || company.version !== 'v1'">
                                Migration
                            </el-radio-button>
                            <el-radio-button label="superadmin_companies_data_migration" :disabled="!company.id || company.version !== 'v1'">
                                Data Migration
                            </el-radio-button>
                            <el-radio-button label="superadmin_companies_data_duplicates">
                                Clean Duplicates
                            </el-radio-button>
                        </el-radio-group>
                    </el-col>
                    <el-col :md="8">
                        <div class="company-name">
                            {{ company.business_name }}
                            <el-tag size="small" :type="statusTagType(company.status)">
                                {{ company.status }}
                            </el-tag>
                        </div>
                    </el-col>
                </el-row>
            </el-card>
            <el-row class="full-width bg-white">
                <router-view/>
            </el-row>
        </el-col>
    </el-container>
</template>

<script>
    export default {
        data: () => {
            return {
                active_tab: "superadmin_companies_general",
                company: {}
            };
        },
        watch: {
            active_tab(val) {
                this.$router.push({name: val});
            },
            '$route'(to, from) {
                this.active_tab = to.name;
            }
        },

        created() {
            this.active_tab = this.$router.currentRoute.name;
            this.loadCompany();
        },
        methods: {
            loadCompany() {
                this.axios.get('/companies/' + this.$route.params.id)
                    .then(res => {
                        if (res.data) {
                            this.company = res.data;
                        }
                    });
            },
            statusTagType(status) {
                if (status === 'active') {
                    return 'success';
                } else if (status === 'paused') {
                    return 'warning';
                } else {
                    return 'danger';
                }
            }
        }
    };
</script>

<style lang="scss">
    .company-name {
        padding: 10px 30px;
        line-height: 1;
        font-size: 12px;
        float: right;
        font-weight: bold;
    }
</style>
