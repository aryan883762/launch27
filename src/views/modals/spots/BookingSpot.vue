<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" :visible.sync="showModal"
                   @close="settingsRedirect" appendToBody custom-class="fullscreen-modal-display" title="Booking Spots">
            <div class="modal-title-container" slot="title">
                <el-row>
                    <el-col :sm="6" :xs="24">
            <span class="modal-title">
              Booking Spots
            </span>
                    </el-col>
                    <el-col :sm="18" :xs="24">
                        <el-button-group class="pull-right">
                            <el-button :class="{ active: 'dashboard_settings_booking_spots_holidays' === $route.name }"
                                       @click="selectTab('dashboard_settings_booking_spots_holidays')" type="text">
                                Holidays
                            </el-button>
                            <el-button :class="{ active: 'dashboard_settings_booking_spots_setup' ===  $route.name }"
                                       @click="selectTab('dashboard_settings_booking_spots_setup')" type="text">
                                Opening Times
                            </el-button>
                            <el-button :class="{ active: 'dashboard_settings_booking_spots_daily' === $route.name}"
                                       @click="selectTab('dashboard_settings_booking_spots_daily')" type="text">
                                Daily Settings
                            </el-button>
                            <el-button
                                    :class="{ active: 'dashboard_settings_booking_spots_availability' === $route.name }"
                                    @click="selectTab('dashboard_settings_booking_spots_availability')" type="text">
                                Availability
                            </el-button>
                        </el-button-group>
                    </el-col>
                </el-row>
            </div>

            <div class="modal-body booking-spot">
                <div>
                    <router-view></router-view>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "SettingsBookingSpot",
        data() {
            return {
                showModal: false,
                company_services: [],
                company_locations: [],
                company_teams: [],
                activeTab: "holidays",
                company_slots: [
                    {
                        from: "",
                        to: "",
                        days: [],
                        services: [],
                        locations: [],
                        teams: []
                    }
                ]
            };
        },
        mounted() {
            this.showModal = true;

            if (this.$route.name === "dashboard_settings_booking_spots_setup") {
                this.activeTab = "setup";
            } else {
                this.activeTab = "holidays";
            }
        },

        created() {
            this.axios
                .get("/companies/current/services")
                .then(res => {
                    this.company_services = res.data;
                })
                .catch(err => {
                });

            this.axios
                .get("/companies/current/locations")
                .then(res => {
                    this.company_locations = res.data;
                })
                .catch(err => {
                });

            this.axios
                .get("/companies/current/teams")
                .then(res => {
                    this.company_teams = res.data;
                })
                .catch(err => {
                });
        },

        methods: {
            settingsRedirect() {
                if (this.$route.query.q) {
                    return this.$router.push({name : this.$route.query.q});
                }

                this.$router.push("/dashboard/settings");
            },

            selectTab(tab) {
                this.activeTab = tab;
                this.$router.push({name: tab});
            },

            addSlot() {
                this.company_slots.push({
                    from: "",
                    to: "",
                    days: [],
                    services: [],
                    locations: [],
                    teams: []
                });
            },

            SaveBookingSpots() {
            }
        }
    };
</script>
<style lang="scss"></style>
