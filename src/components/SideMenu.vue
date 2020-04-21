<template>
    <el-card shadow="never" class="side-menu-card">
        <el-aside width="100%" class="component-side-menu">
            <el-menu ref="sidemenu" class="el-menu-vertical" :collapse="isCollapse">
                <el-menu-item>
                    <a href="javascript:void(0)" title="Collapse" @click="collapse()" v-bind:class="{ 'collapse-true': isCollapse }">
                        <img svg-inline src="@/assets/left-arrow.svg" >
                        <span>Collapse</span>
                    </a>
                </el-menu-item>
                <el-menu-item :class="{'is-active' : $route.name === 'dashboard'}">
                    <router-link to="/dashboard" title="Dashboard">
                        <img svg-inline src="@/assets/svgs/side-menu/dashboard.svg">
                        <span>Dashboard</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item :class="{'is-active' : $route.name === 'dashboard_workdiary_booking' || $route.name === 'dashboard_workdiary'}">
                    <router-link to="/dashboard/workdiary" title="Work Diary">
                        <img svg-inline src="@/assets/svgs/side-menu/workdiary.svg">
                        <span>Work Diary</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'timesheets')"
                              :class="{'is-active' : $route.name === 'dashboard_timelogs'}">
                    <router-link to="/dashboard/timelogs" title="Time Logs">
                        <img svg-inline src="@/assets/svgs/side-menu/timelogs.svg">
                        <span>Time Logs</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item :class="{'is-active' : $route.name === 'dashboard_people_appointments'}">
                    <router-link to="/dashboard/people" title="People">
                        <img svg-inline src="@/assets/svgs/side-menu/people.svg">
                        <span>People</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_team')"
                              :class="{'is-active' : $route.name === 'dashboard_teams'}">
                    <router-link to="/dashboard/teams" title="Teams">
                        <img svg-inline src="@/assets/svgs/side-menu/teams.svg">

                        <span>Teams</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_appointment')"
                              :class="{'is-active' : $route.name === 'dashboard_calendar_spots'}">
                    <router-link to="/dashboard/scheduler/schedule" title="Scheduler">
                        <img svg-inline src="@/assets/svgs/side-menu/calendar.svg">
                        <span>Scheduler</span>
                    </router-link>
                </el-menu-item>
                <el-menu-item v-if="$can('manage', 'manage_appointment') && false"
                              :class="{'is-active' : $route.name === 'dashboard_inbox'}">
                    <router-link to="/dashboard/inbox" title="Messages">
                        <img svg-inline src="@/assets/svgs/menu/inbox.svg">
                        <span>Messages</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_team_invitation')"
                              :class="{'is-active' : $route.name === 'dashboard_invitations'}">
                    <router-link to="/dashboard/invitations" title="Invitations">
                        <img svg-inline src="@/assets/svgs/side-menu/invite.svg">
                        <span>Invitations</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_team_invitation')"
                              :class="{'is-active' : $route.name === 'dashboard_wages'}">
                    <router-link to="/dashboard/wages" title="Wages">
                        <img svg-inline src="@/assets/svgs/side-menu/wages.svg">
                        <span> Wages</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'charge_customer')"
                              :class="{'is-active' : $route.name === 'dashboard_charges'}">
                    <router-link to="/dashboard/charges" title="Charges">
                        <img svg-inline src="@/assets/svgs/side-menu/charges.svg">
                        <span>Charges</span>
                    </router-link>
                </el-menu-item>

                <!--  <el-menu-item index="6" disabled>
                    <router-link to="#">
                      <img svg-inline src="@/assets/svgs/menu/inbox.svg">
                      <span>Inbox</span>
                    </router-link>
                  </el-menu-item>-->

                <el-menu-item v-if="$can('manage', 'manage_checklist')"
                              :class="{'is-active' : $route.name === 'dashboard_checklists'}">
                    <router-link to="/dashboard/checklists"  title="Checklist">
                        <img svg-inline src="@/assets/svgs/side-menu/checklist.svg">
                        <span>Checklist</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item :class="{'is-active' : $route.name === 'dashboard_reports'}">
                    <router-link to="/dashboard/reports" title="Reports">
                        <img svg-inline src="@/assets/svgs/side-menu/reports.svg">
                        <span>Reports</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item v-if="$can('manage', 'manage_apps')"
                              :class="{'is-active' : $route.name === 'dashboard_apps'}">
                    <router-link to="/dashboard/apps" title="Apps">
                        <img svg-inline src="@/assets/svgs/side-menu/applications.svg">
                        <span>Apps</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item :class="{'is-active' : $route.name === 'dashboard_settings'}">
                    <router-link to="/dashboard/settings" title="Settings">
                        <img svg-inline src="@/assets/svgs/side-menu/settings.svg">
                        <span>Settings</span>
                    </router-link>
                </el-menu-item>

                <el-menu-item @click="showZendesk()" :class="{'is-active' : $route.name === 'dashboard_support'}">
                    <router-link to="#" title="Support">
                        <img svg-inline src="@/assets/svgs/side-menu/support.svg">
                        <span>Support</span>
                    </router-link>
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
              let mainElement = $('.page.dashboard.layout .mega-content-layer');
              if(!this.isCollapse){
                mainElement.animate({'margin-left':'200px'}); 
              }else {
                mainElement.animate({'margin-left':'65px'}); 
              }
            }
        }
    }
</script>

<style lang="scss">
  .el-menu-vertical:not(.el-menu--collapse) {
    width: 200px;
  }
    .side-menu-card {
        // min-width: 200px;
        border-radius: 0px !important;

        border-top: none !important;
        border-bottom: none !important;

        .el-card__body {
            padding: 0px;
            height: calc(100%);
        }

        .component-side-menu {
            height: calc(100%);

            .el-menu {
                border: none;

                .el-menu-item {
                    padding: 0 !important;
                    @include rem(height, 45px);

                    vertical-align: -webkit-baseline-middle;

                    a {
                        @include rem(height, 45px);
                        @include rem(line-height, 45px);
                        padding-left: 20px;
                        display: block;
                        color: black;
                        &.collapse-true {
                            svg{
                           transform: rotate(180deg);
                           -ms-transform: rotate(180deg);
                           -moz-transform: rotate(180deg);
                           -webkit-transform: rotate(180deg);
                           -o-transform: rotate(180deg);
                            }
                        }
                    }

                    svg {
                        width: 18px;
                        height: auto;
                        margin-right: 19px;
                        display: inline-block;
                        position: relative;
                        outline: none;
                    }
                    // img.collapse-icon {
                    //     height: 33px;
                    //     display: inline-block;
                    //     position: absolute;
                    //     top: 7px;
                    //     right: 5px;
                    //     transform: rotate(0deg);
                    //     -ms-transform: rotate(0deg);
                    //     -moz-transform: rotate(0deg);
                    //     -webkit-transform: rotate(0deg);
                    //     -o-transform: rotate(0deg);
                    //     &.collapse-true{
                    //         transform: rotate(180deg);
                    //         -ms-transform: rotate(180deg);
                    //         -moz-transform: rotate(180deg);
                    //         -webkit-transform: rotate(180deg);
                    //         -o-transform: rotate(180deg);
                    //     }
                    //     }
                    span {
                        font-weight: 400;
                        @include rem(font-size, 12px);

                    }

                    border-right: 4px solid transparent;

                    >a.router-link-exact-active {

                        background-color: #e9f8ff;
                        border-right: 4px solid #1fb6ff;

                        span {
                            font-weight: 500;
                        }

                        a {
                            color: $launch-primary-color;
                        }

                        svg {
                            path {
                                fill: $launch-primary-color;
                                stroke: #333;
                            }
                        }
                    }
                }
            }
        }
    }


</style>
