<template>
    <div class="twilio-setup">

        <el-row :gutter="20">
            <el-col :md="16" :sm="16">
                <el-card>
                    <el-col>
                        <h3>Use your own Twilio number to send text message reminders from Launch27.</h3>

                        <el-divider></el-divider>

                        <ul>
                            <li>
                                Step 1: Copy the Account SID, Auth Token and Phone Number from your Twilio account
                                <div>
                                    <strong><i>Note: If you do not already have a Twilio number, you must first purchase one before you can integrate Twilio with Launch27.</i></strong>

                                </div>
                            </li>
                            <br/><br/>
                            <li>
                                Log in to your Twilio account

                            </li>
                            <li>Copy the Account SID and Auth Token by going to the <a href="https://www.twilio.com/console/sms/dashboard" target="_blank">SMS dashboard of your Twilio account </a> and clicking Show API Credentials</li>
                            <li>Copy your Phone Number by going to the <a href="https://www.twilio.com/console/phone-numbers/incoming" target="_blank">Phone Numbers list</a> , clicking on your Phone Number and copying it</li>

                        </ul>


                    </el-col>
                    <el-col>

                        <el-divider></el-divider>


                        <el-row :gutter="40">
                            <el-col :md="12" :sm="12">
                                <h4> Step 2: Enter the Account SID, Auth Token and Phone Number</h4>

                                <p> Paste the Account SID, Auth Token and Phone Number you copied into the settings below:</p>
                                <el-form :model="twilio" :rules="rules" ref="twiliofrm" style="max-width:  400px;" v-loading="loading">
                                    <el-form-item label="Account SID" prop="sid">
                                        <el-input name="sid" required type="text" v-model="twilio.sid"></el-input>
                                    </el-form-item>

                                    <el-form-item label="Auth Token" prop="token">
                                        <el-input name="token" required show-password type="password" v-model="twilio.token"></el-input>
                                    </el-form-item>

                                    <el-form-item label="Phone Number" prop="phone_number">
                                        <el-input name="phone_number" required type="text" v-model="twilio.phone_number"></el-input>
                                    </el-form-item>
                                </el-form>
                            </el-col>

                            <el-col :md="12" :sm="12">
                                <p>Test sending of SMS</p>
                                <el-form>
                                    <el-form-item label="">
                                        <el-input placeholder="Send Message to: +122322323" v-model="test_number"></el-input>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-input :rows="5" placeholder="Test SMS Message" type="textarea" v-model="test_message"></el-input>
                                    </el-form-item>
                                    <el-button :loading="test_loading" @click="sendTestMessage()" class="pull-right" round size="mini" type="danger">Send Test Message</el-button>
                                </el-form>
                            </el-col>

                        </el-row>


                    </el-col>

                    <el-col style="margin-bottom: 20px;">
                        <div class="pull-right">
                            <el-button @click="saveSettings" round size="small" type="primary">Save Settings</el-button>
                        </div>
                    </el-col>
                </el-card>

            </el-col>

            <side-help></side-help>
        </el-row>

    </div>
</template>


<script>
    import SideHelp from "../../components/SideHelp";

    export default {
        components: {SideHelp},
        data() {
            return {
                twilio: {
                    sid: "",
                    token: "",
                    phone_number: ""
                },
                rules: {
                    sid: [{message: 'Sid is required', required: true}],
                    token: [{message: 'Auth Token is required', required: true}],
                    phone_number: [{message: 'Phone Number is required', required: true}]
                },
                loading: false,
                twilio: {},
                test_number: "",
                test_message: '',
                test_loading: false
            }

        },
        mounted() {
            this.getSettings()
        },
        methods: {
            saveSettings() {
                this.$refs.twiliofrm.validate((valid) => {
                    if (valid) {
                        this.loading = true
                        this.axios.patch('/company_settings/' + this.$auth.user().company.settings.id,
                            {
                                twilio: this.twilio
                            })
                            .then(res => {
                                this.$message.success("Settings saved")
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(() => {
                                this.loading = false
                            })
                    }
                })
            },
            sendTestMessage() {
                if (!(this.test_message && this.test_number)) return this.$helpers.errorHandle("Number and message is required")

                this.test_loading = true
                this.axios.post('/integrations/test-twilio-setup', {
                    number: this.test_number,
                    message: this.test_message
                })
                    .then(res => {
                        console.log(res.data)
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.test_loading = false
                    })
            },
            getSettings() {
                this.loading = true
                this.axios.get('/companies/current/settings')
                    .then(res => {
                        if (res.data.twilio) {
                            this.twilio = res.data.twilio
                        } else {
                            this.twilio = {
                                sid: '',
                                token: '',
                                phone_number: ''
                            }
                        }
                    })
                    .catch(err => {
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        }

    }
</script>