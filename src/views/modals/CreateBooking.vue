<template>
<!--
    <el-dialog :append-to-body="true" :close-on-press-escape="true" id="create_booking_page" :fullscreen="true" :modal="true" :visible.sync="showModal" @close="goBack" custom-class="fullscreen-modal-display">
-->
        <!--Choose who booking is for-->

    <div>
        <!--<div class="modal-title-container" slot="title">
            <el-row>
                <el-col :sm="6" :xs="24">
            <span class="modal-title">
              Book Your Appointment
                &lt;!&ndash; or Event &ndash;&gt;
            </span>
                </el-col>
                <el-col :sm="18" :xs="24">
                    <el-button-group class="pull-right">
                        &lt;!&ndash; <el-button :class="{ active: $route.name === 'dashboard_booking_new' }" @click="navigate('dashboard_booking_new')" type="text">
                            Add Appointment
                        </el-button> &ndash;&gt;
                        &lt;!&ndash; <el-button :class="{ active: $route.name === 'dashboard_booking_event'}" @click="navigate('dashboard_booking_event')" type="text">
                             Add Event
                         </el-button>&ndash;&gt;
                    </el-button-group>
                </el-col>
            </el-row>
        </div>
-->
        <div class="modal-body create-booking">
            <router-view/>
        </div>
    </div>


<!--
    </el-dialog>
-->
</template>


<script>
    export default {
        data() {
            return {
                activeTab: "dashboard_booking_new",
                showModal: false,
                back: false
            }
        },

        watch: {},
        mounted() {
            this.showModal = true;
            if (this.$route.params && this.$route.params.id) {
                this.back = true
            }
        },
        created() {
            this.activeTab = this.$route.name
        },
        methods: {
            goBack() {
                this.$router.push({name: "dashboard_calendar_schedule"});
            },
            navigate(val) {
                this.$router.push({name: val, query: {account_id: this.$route.query.account_id}})
            }
        }
    }
</script>
