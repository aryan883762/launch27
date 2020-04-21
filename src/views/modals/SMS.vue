<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" :visible.sync="showModal" @close="settingsRedirect" appendToBody custom-class="fullscreen-modal-display email-templates-modal">
            <div class="modal-title-container email-template" slot="title">
                <el-row :gutter="20">
                    <el-col :sm="6" :xs="24">
            <span class="modal-title">
              SMS Setup
            </span>
                    </el-col>
                    <el-col :sm="18" :xs="24">
                        <el-button-group class="pull-right">
                            <el-button :class="{ active: activeTab === 'sms' }" @click="activeTab = 'sms'" type="text">
                                SMS Templates
                            </el-button>
                            <el-button :class="{ active: activeTab === 'twilio' }" @click="activeTab = 'twilio'" type="text">
                                Twilio Setup
                            </el-button>
                            <el-button :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'" type="text">
                                SMS Logs
                            </el-button>
                        </el-button-group>
                    </el-col>
                </el-row>
            </div>
            <div class="modal-body email-templates">
                <sms-templates v-if="activeTab == 'sms'"></sms-templates>
                <twilio-setup v-if="activeTab == 'twilio'"></twilio-setup>
                <email-logs :email="false" v-if="activeTab == 'logs'"></email-logs>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import SmsTemplates from "./emails/SMSTemplates.vue";
    import TwilioSetup from './emails/TwilioSetup';
    import EmailLogs from "./emails/EmailLogs.vue";

    export default {
        name: "SettingsEmail",
        components: {
            SmsTemplates,
            TwilioSetup,
            EmailLogs
        },
        data() {
            return {
                showModal: false,
                activeTab: "sms"
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
