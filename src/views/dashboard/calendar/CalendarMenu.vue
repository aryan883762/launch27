<template>
    <el-row class="full-width calendar-menu bg-white" style="margin-bottom: 2px;">
        <template v-if="$can('manage', 'role_admin')">
            <el-radio-group class="options" v-model="active_tab">
                <el-radio-button label="dashboard_calendar_schedule">
                    Schedule
                </el-radio-button>
                <el-radio-button label="dashboard_calendar_spots">
                    Booking Spot
                </el-radio-button>
                <el-radio-button label="dashboard_calendar_list">
                    List
                </el-radio-button>
                <el-radio-button label="dashboard_calendar_map">
                    Map
                </el-radio-button>
            </el-radio-group>
        </template>
        <template v-if="$can('manage', 'role_team')">
            <el-radio-group class="options" v-model="active_tab">
                <el-radio-button label="team_bookings_spot">
                    Booking Spot
                </el-radio-button>
                <el-radio-button label="team_bookings_list">
                    List
                </el-radio-button>
            </el-radio-group>
        </template>
        <template v-if="$can('manage', 'role_customer')">
            <el-radio-group class="options" v-model="active_tab">
                <el-radio-button label="customer_bookings_spot">
                    Booking Spot
                </el-radio-button>
                <el-radio-button label="customer_bookings_list">
                    List
                </el-radio-button>
            </el-radio-group>
        </template>
    </el-row>
</template>

<script>
    export default {
        data() {
            return {
                active_tab: 'dashboard_calendar_spots'
            }
        },
        watch: {
            active_tab(val) {
                this.$router.push({name: val})
            }
        },
        mounted() {
            this.active_tab = this.$route.name
        }
    }
</script>

<style lang="scss">
    .calendar-menu {
        .el-radio-group {
            &.options {
                .el-radio-button {
                    .el-radio-button__inner {
                        border: none;
                        font-size: 12px;
/*
                        padding: 20px 30px;
*/
                        text-transform: uppercase;
                        border-radius: 0px;
                        border-bottom: 2px solid white;
                    }

                    &.is-active {
                        .el-radio-button__inner {
                            background: #f4f8f9;
                            color: $launch-primary-color;
                            box-shadow: none;
                            border-bottom: 2px solid $launch-primary-color;
                        }
                    }
                }
            }
        }

    }
</style>
