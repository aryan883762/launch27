<template>
    <el-card shadow="never" class="side-menu-card">
        <el-aside width="100%" class="component-side-menu">
            <el-menu ref="sidemenu" class="el-menu-vertical" :collapse="isCollapse">
                <el-menu-item>
                    <a href="javascript:void(0)"  @click="collapse()" v-bind:class="{ 'collapse-true': isCollapse }">
                        <img svg-inline src="@/assets/left-arrow.svg" >
                        <span>Close Collapse</span>
                    </a>
                    <span slot="title">Open Collapse</span>
                </el-menu-item>
                <el-menu-item :class="{'is-active' : $route.name === 'dashboard'}">
                    <router-link to="/dashboard">
                        <img svg-inline src="@/assets/svgs/side-menu/dashboard.svg">
                        <span>Dashboard</span>
                    </router-link>
                    <span slot="title">Dashboard</span>
                </el-menu-item>

                <el-menu-item :class="{'is-active' : $route.name === 'dashboard_workdiary_booking' || $route.name === 'dashboard_workdiary'}">
                    <router-link to="/dashboard/workdiary">
                        <img svg-inline src="@/assets/svgs/side-menu/workdiary.svg">
                        <span>Work Diary</span>
                    </router-link>
                    <span slot="title">Work Diary</span>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'timesheets')"
                              :class="{'is-active' : $route.name === 'dashboard_timelogs'}">
                    <router-link to="/dashboard/timelogs">
                        <img svg-inline src="@/assets/svgs/side-menu/timelogs.svg">
                        <span>Time Logs</span>
                    </router-link>
                    <span slot="title">Time Logs</span>
                </el-menu-item>

                <el-menu-item :class="{'is-active' : $route.name === 'dashboard_people_appointments'}">
                    <router-link to="/dashboard/people">
                        <img svg-inline src="@/assets/svgs/side-menu/people.svg">
                        <span>People</span>
                    </router-link>
                    <span slot="title">People</span>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_team')"
                              :class="{'is-active' : $route.name === 'dashboard_teams'}">
                    <router-link to="/dashboard/teams">
                        <img svg-inline src="@/assets/svgs/side-menu/teams.svg">
                        <span>Teams</span>
                    </router-link>
                    <span slot="title">Teams</span>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_appointment')"
                              :class="{'is-active' : $route.name === 'dashboard_calendar_spots'}">
                    <router-link to="/dashboard/scheduler/schedule">
                        <img svg-inline src="@/assets/svgs/side-menu/calendar.svg">
                        <span>Scheduler</span>
                    </router-link>
                    <span slot="title">Scheduler</span>
                </el-menu-item>
                <el-menu-item v-if="$can('manage', 'manage_appointment') && false"
                              :class="{'is-active' : $route.name === 'dashboard_inbox'}">
                    <router-link to="/dashboard/inbox">
                        <img svg-inline src="@/assets/svgs/menu/inbox.svg">
                        <span>Messages</span>
                    </router-link>
                    <span slot="title">Messages</span>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_team_invitation')"
                              :class="{'is-active' : $route.name === 'dashboard_invitations'}">
                    <router-link to="/dashboard/invitations">
                        <img svg-inline src="@/assets/svgs/side-menu/invite.svg">
                        <span>Invitations</span>
                    </router-link>
                    <span slot="title">Invitations</span>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_team_invitation')"
                              :class="{'is-active' : $route.name === 'dashboard_wages'}">
                    <router-link to="/dashboard/wages">
                        <img svg-inline src="@/assets/svgs/side-menu/wages.svg">
                        <span>Wages</span>
                    </router-link>
                    <span slot="title">Wages</span>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'charge_customer')"
                              :class="{'is-active' : $route.name === 'dashboard_charges'}">
                    <router-link to="/dashboard/charges">
                        <img svg-inline src="@/assets/svgs/side-menu/charges.svg">
                        <span>Charges</span>
                    </router-link>
                    <span slot="title">Charges</span>
                </el-menu-item>

                <!--  <el-menu-item index="6" disabled>
                    <router-link to="#">
                      <img svg-inline src="@/assets/svgs/menu/inbox.svg">
                      <span>Inbox</span>
                    </router-link>
                  </el-menu-item>-->

                <el-menu-item v-if="$can('manage', 'manage_checklist')"
                              :class="{'is-active' : $route.name === 'dashboard_checklists'}">
                    <router-link to="/dashboard/checklists">
                        <img svg-inline src="@/assets/svgs/side-menu/checklist.svg">
                        <span>Checklist</span>
                    </router-link>
                    <span slot="title">Checklist</span>
                </el-menu-item>

                <el-menu-item :class="{'is-active' : $route.name === 'dashboard_reports'}">
                    <router-link to="/dashboard/reports">
                        <img svg-inline src="@/assets/svgs/side-menu/reports.svg">
                        <span>Reports</span>
                    </router-link>
                    <span slot="title">Reports</span>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_apps')"
                              :class="{'is-active' : $route.name === 'dashboard_apps'}">
                    <router-link to="/dashboard/apps">
                        <img svg-inline src="@/assets/svgs/side-menu/applications.svg">
                        <span>Apps</span>
                    </router-link>
                    <span slot="title">Apps</span>
                </el-menu-item>

                <el-menu-item :class="{'is-active' : $route.name === 'dashboard_settings'}">
                    <router-link to="/dashboard/settings">
                        <img svg-inline src="@/assets/svgs/side-menu/settings.svg">
                        <span>Settings</span>
                    </router-link>
                    <span slot="title">Settings</span>
                </el-menu-item>

                <el-menu-item @click="showZendesk()" :class="{'is-active' : $route.name === 'dashboard_support'}">
                    <router-link to="#">
                        <img svg-inline src="@/assets/svgs/side-menu/support.svg">
                        <span>Support</span>
                    </router-link>
                    <span slot="title">Support</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
    </el-card>
</template>

<script>
    export default {
        name: 'Sidemenu',
        data: () => {
            return {
              isCollapse: true
            }
        },
        mounted() {
        },
        methods: {
            showZendesk() {
                zE.showIPMWidget()
            },
            collapse() {
              this.isCollapse = !this.isCollapse;
              this.$helpers.sideMenuCollapse(this.isCollapse);
            }
        }
    }
</script>

<style lang="scss">
 @import "../theme/side-menu.scss";
</style>