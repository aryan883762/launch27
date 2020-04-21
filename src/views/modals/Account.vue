<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" appendToBody :visible.sync="showModal" @close="settingsRedirect" custom-class="fullscreen-modal-display" title="Account">
            <div class="modal-title-container" slot="title">
                <el-row>
                    <el-col :sm="6" :xs="24">
                    <span class="modal-title">
                      Account
                    </span>
                    </el-col>
                    <el-col :sm="18" :xs="24">
                        <el-button-group class="pull-right">
                            <el-button :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'" type="text">
                                Account Settings
                            </el-button>
                            <el-button :class="{ active: activeTab === 'plan' }" @click="activeTab = 'plan'" type="text">
                                Plan Info
                            </el-button>
                            <el-button :class="{ active: activeTab === 'payment' }" @click="activeTab = 'payment'" type="text">
                                Payment History
                            </el-button>
                            <el-button :class="{ active: activeTab === 'notification' }" @click="activeTab = 'notification'" type="text" v-if="false">
                                Notification
                            </el-button>
                        </el-button-group>
                    </el-col>
                </el-row>
            </div>

            <div class="modal-body account">
                <trial-update></trial-update>
                <div v-loading="loading">
                    <account-settings :profile.sync="profile" @reload-profile="loadProfile" v-if="activeTab === 'settings'"/>
                    <account-plan :profile.sync="profile" v-if="activeTab === 'plan'"/>
                    <account-payment v-if="activeTab === 'payment'"/>
                </div>

            </div>

        </el-dialog>
    </div>
</template>

<script>
    import AccountSettings from "../components/AccountSettings.vue";
    import AccountPayment from "../components/AccountPayment.vue";
    import AccountPlan from "../components/AccountPlan.vue";
    import AccountNotification from "../components/AccountNotification.vue";
    import TrialUpdate from "../../components/TrialUpdate";

    export default {
        components: {
            TrialUpdate,
            AccountSettings,
            AccountPayment,
            AccountPlan,
            AccountNotification
        },
        data() {
            return {
                showModal: false,
                activeTab: "settings",
                profile: {
                    first_name: "",
                    last_name: "",
                    phone: "",
                    email: ""
                },
                referalCode: "",
                loading: false,
                security: {}
            };
        },
        watch: {
            $route(val) {
                this.activeTab = val.query.tab;
            }
        },
        created() {
            this.showModal = true;

            if (this.$route.query.hasOwnProperty("tab")) this.activeTab = this.$route.query.tab;

            this.loadProfile()

            this.$events.addListener("account:profile:change-tab", this.changeTab);
        },
        beforeDestroy() {
            this.$events.removeListener("account:profile:change-tab", this.changeTab);
        },
        methods: {
            settingsRedirect() {
                this.$router.back();
            },
            changeTab(tab) {
                this.activeTab = tab;
            },
            loadProfile() {
                this.loading = true;

                this.$auth.fetch({
                    success: response => {
                        this.loading = false;
                        this.profile = response.data;
                    },
                    error: response => {
                        this.loading = false;
                    }
                });
            }
        }
    };
</script>
<style lang="scss">
    .fullscreen-modal-display {
        .modal-body {


            &.account {
                .container {
                    background: white;
                }
            }
        }
    }
</style>
