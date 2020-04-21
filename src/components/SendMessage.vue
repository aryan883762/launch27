<template>
    <div>
        <el-form label-position="top" v-loading="loading">
            <el-form-item label="Type">
                <el-select v-model="message.code" @change="getTemplate">
                    <el-option label="Booking Confirmation (Manual)" value="customer/booking_manual_confirmation"></el-option>
                    <el-option label="Booking 1 Day Reminder" value="customer/booking_1_day_reminder"></el-option>
                    <el-option label="Booking 3 Days Reminder" value="customer/booking_3_days_reminder"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="Subject">
                <el-input placeholder="Subject" v-model="message.subject">
                </el-input>
            </el-form-item>

            <el-form-item label="Message">
                <wysiwyg v-model="message.content"/>
            </el-form-item>

            <el-form-item label="To">
                <el-input type="text" v-model="toEmail"></el-input>
            </el-form-item>
        </el-form>

        <div class="flex-row-reverse">
            <el-button @click="sendEmail()" size="mini" round type="primary">Send Email</el-button>
            <el-button @click="cancelDialog" size="mini" round style="margin-right: 10px;">Cancel</el-button>
        </div>
    </div>
</template>

<script>

    export default {
        name: "send-message",
        props: {
            booking: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                message: {
                    code: "customer/booking_manual_confirmation"
                },
                toEmail: "",
                loading: ""
            }
        },
        mounted() {
            this.toEmail = this.booking.account.email
            this.loading = true
            this.axios.get('/bookings/' + this.booking.id + '/confirm',
                {
                    params: {
                        code: "customer/booking_manual_confirmation"
                    }
                })
                .then(res => {
                    this.message = res.data
                })
                .catch(err => {

                })
                .finally(() => {
                    this.loading = false
                })
        },
        methods: {
            cancelDialog() {
                this.$emit('close')
            },
            getTemplate(val){
                this.loading = true
                this.axios.get('/bookings/' + this.booking.id + '/confirm',
                    {
                        params: {
                            code: val
                        }
                    })
                    .then(res => {
                        this.message = res.data
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            sendEmail() {
                ///trigger the sending of the actual email
                this.loading = true
                this.axios.post('/bookings/send-email', {
                    content: this.message.content,
                    email: this.toEmail,
                    subject: this.message.subject,
                    code : this.message.code
                })
                    .then(res => {
                        this.$message.success('Message successfully sent')
                        this.$emit('close')
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        }
    }

</script>


<style>

</style>