<template>
    <div>

        <div class="email-templates">
            <div class="modal-title-container email-template" slot="title">
                <el-row :gutter="0" style="margin-bottom: 2px;">
                    <el-col style="text-align:right;">
                        <el-radio-group class="sub-view-links pull-right" v-model="activeTab">
                            <el-radio-button :class="{ active: activeTab === 'emails' }" label="emails" type="text">
                                Emails Templates
                            </el-radio-button>
                            <el-radio-button type="text" :class="{ active: activeTab === 'master' }" label="master">
                                Master Templates
                            </el-radio-button>
                            <el-radio-button type="text" :class="{ active: activeTab === 'logs' }" label="logs">
                                Emails Logs
                            </el-radio-button>
                        </el-radio-group>
                    </el-col>
                </el-row>
            </div>
            <email-templates v-if="activeTab == 'emails'"></email-templates>
            <master-template v-if="activeTab == 'master'"></master-template>
            <email-logs :email="true" v-if="activeTab == 'logs'"></email-logs>
        </div>
    </div>
</template>

<script>
    import MasterTemplate from "./emails/MasterTemplate.vue";
    import EmailTemplates from "./emails/EmailTemplates.vue";
    import EmailLogs from "./emails/EmailLogs.vue";

    export default {
        name: "SettingsEmail",
        components: {
            MasterTemplate,
            EmailTemplates,
            EmailLogs
        },
        data() {
            return {
                showModal: false,
                activeTab: "emails"
            };
        },
        mounted() {
            this.showModal = true;
        },
        methods: {
            settingsRedirect() {
                this.$router.push("/dashboard/settings");
            }
        }
    };
</script>
<style lang="scss">
    .fullscreen-modal-display {
        &.email-templates-modal {
            .modal-body.emails-template {
                background: white;
            }
        }
    }


</style>
