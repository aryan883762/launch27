<template>
    <el-row :gutter="10">
        <el-col :sm="16" :md="16">
            <el-card v-loading="loading">
                <h3>Step 1. Make sure you have Google Analytics installed on your site.</h3>

                <h4>No, I have not installed Google Analytics.</h4>
                <p>If you have not installed Google Analytics on your site, please follow these instructions on how to
                    do
                    it:</p>
                <a href="https://support.google.com/analytics/answer/2817075?hl=en" target="_blank">How to Setup Google
                    Analytics (Universal)</a>

                <h4>Yes, I have installed Google Analytics.</h4>
                <p>
                    Awesome! Please make sure you're using Universal Analytics. If you're not, please follow these
                    instructions
                    on how to upgrade to Universal Analytics: How to Upgrade to Universal Analytics.
                </p>

                <h4>Step 2: Enter your Google Analytics Tracking ID</h4>


                <el-form label-position="top" style="width: 200px;">
                    <el-form-item>
                        <el-input placeholder="UA-XXXXXXXX-X" v-model.trim="trackingId"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button round size="small" type="primary" @click="saveTrackingId()">Save and Enable
                        </el-button>
                    </el-form-item>
                </el-form>


                <h4>Tip: Track Conversions to Measure ROI</h4>
                <p>
                    <a href="https://analytics.google.com/analytics/web/template?uid=RiTyNKTpT7Oj7fy1kr8fqg"
                       target="_blank">Click here to add Conversion Goals to your Google Analytics account without
                        having to set them up manually.</a><br/>
                    Or,
                    <a target="_blank"
                       href="http://docs.launch27.com/knwbase/how-to-create-google-analytics-conversion-goals-for-your-booking-form">read
                        the documentation</a> for more info on tracking Booking conversion data and creating goals in
                    Google
                    Analytics
                </p>
            </el-card>
        </el-col>
        <side-help></side-help>
    </el-row>

</template>


<script>
    import SideHelp from "../../../components/SideHelp";

    export default {
        components: {SideHelp},
        data() {
            return {
                trackingId: "",
                loading: false
            }
        },
        mounted() {
            this.trackingId = this.$auth.user().company.ga_tracking_id || ""
        },
        methods: {
            saveTrackingId() {

                if (this.trackingId.length === 0) {
                    this.$message.error('TrackingID is required')
                    return;
                }

                this.loading = true

                this.axios.patch('/companies/current', {ga_tracking_id: this.trackingId})
                    .then(res => {
                        this.$auth.fetch()
                        this.$helpers.successHandle('Tracking code successfully saved')
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


<style lang="scss">

</style>