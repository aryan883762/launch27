<template>
    <el-container class="page dashboard layout" disabled>
        <el-container class="main-app-holder">
            <el-card class="header">
                <el-row class="flex-row-center full-height">
                    <el-col :md="12" :sm="12" :xs="24">
                        <svg height="24px" width="170px" xmlns="http://www.w3.org/2000/svg"
                             xmlns:xlink="http://www.w3.org/1999/xlink">
                            <image height="24px" width="100px" x="0px"
                                   xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAYCAMAAADnCR6uAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAYFBMVEUAAAD/hgT/hgT/hgT/hgT/hgT/hgRyc3X/hgT/hgT/hgT/hgT/hgT/hgT/hgRyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3X/hgRyc3X/hgT///8q9MMLAAAAHXRSTlMAM4i77kQiu2YR3cx3qpkiiO5md8zdEaozVZlEVYVmdPkAAAABYktHRB8FDRC9AAAAB3RJTUUH4wIbFAcyPWWMmQAAAklJREFUSMfFlu2WgiAQhjEqNG0LUfIjuv/LXGAGBUSrPZ12fuwiDDMPr8MkIR82pW05m+3o4/HY011mHw+PyI6EJfd9luNI54w0S3EcvsGR7YOc+T/pUZxsqpLSEpJmCw5KvsBRmUzno0Xa2bG/eobX8gUO6qe2UN7iEeX4AscPpTRzDwUef1p0zx7H5aofOKttMBaGRDdmF4T+11wvU7CLYFy1rJaOQ4pGqfZWJzhDjkmOmUPeFFrTbXJ0LfphGnl1G9sONvUcJ5iMMQ5wOxZyTByyUZM1Wxx89qvjja0kKrBbhJGbK7xPyDFxWDWGkciewVHWOAynENadm+OCGg3TKnHUQwOhh+qwLO7VWZcJ3NIqlOPuJxg9oYcnHMJMjBxGF0thamVkHdYHeHTG42qP/eM3i7IIivYUJBjcHmPtJgdqLWBo5Gi8MrCywrCGMFE/pRMGXOJ8kaBz62KTA92MEC3M9CTkQA8JAYoZo6TVXKOwcAoTBNd+3OTwM8JfGXGEY9tDy9wDSMjxEQ6yyVHGrTwlh4vcJt6LmXPNiq9x8Kd6RB00LYd/0MHNYZ0yV/lAluZg8z17jyOUw0UWiXtr5vhoZmq+yiFcH9F1+RZHFbYSjCz5so9J17SwYyY57Eauf1pkzYdVjvjrS5v5KtkXMYe97L4xJxI2yDUO30kN8mWOPJRjjuzFcw1omuO1WOWA14h+48sckRxe5BFeiGpGcwksh/4UaPSXgJBkg4P07geYdS+/l1iOwGQvRN2R960XjN3EX3Y6+wVNBooECZNeKAAAAABJRU5ErkJggg=="
                                   y="0px"/>
                        </svg>

                        <GlobalSearch/>

                    </el-col>

                    <el-col :md="12" :sm="12" :xs="24" class="avatar-holder hidden-sm-and-down">
                        <ClockInOutMenu/>

                        <el-button @click="$router.push({ name: 'dashboard_booking_new' })" round size="mini"
                                   type="primary">
                            Book Now
                        </el-button>
                        <!-- 
                        <el-button @click="$router.push({ name: 'dashboard_getting_started' })" class="last" round
                                   size="mini" type="primary">
                            Get Started
                        </el-button> -->
                        <a type="button" class="last el-button--mini" @click="$router.push({ name: 'dashboard_getting_started' })">
                           <span style="border-bottom: 1px solid #cccccd87; color: #afb0b2;">
                               Get Started</span>
                        </a>
                        <!-- <el-popover
                           placement="bottom-end"
                           trigger="hover"
                           width="300">
                           <div>
                             Messages
                           </div>
                           <span class="notification-container" slot="reference">
                               <el-image :src="require('@/assets/messages.svg')"></el-image>
                              </span>
                         </el-popover>


                         <el-popover
                           placement="bottom-end"
                           trigger="hover"
                           width="300">
                           <div>
                             Notifications
                           </div>
                           <span class="notification-container" slot="reference">
                               <el-image :src="require('@/assets/notifications.svg')"></el-image>
                              </span>
                         </el-popover>
             -->

                        <impersonator-menu/>
                        <el-dropdown @command="handleCommand" class="pull-right hover-pointer" v-if="!$auth.impersonating()">
                                    <span class="el-dropdown-link flex-row-center">
                                        <el-avatar :size="32" :src="$auth.user().avatar" class="profile-avatar" v-if="$auth.user().avatar"></el-avatar>
                                        <avatar :size="32" :username="$auth.user().fullname" class="profile-avatar" color="white" v-if="!$auth.user().avatar"></avatar>

                                        <span>{{ $auth.user().first_name }}</span>
                                         <i class="el-icon-arrow-down el-icon--right"/>
                                    </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="logout">
                                    Logout
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </el-col>
                </el-row>
            </el-card>

            <el-container>
                <side-menu class="side-menu-container"/>
                <el-main class="content mega-content-layer">
                    <!-- <warning-message></warning-message>-->

                    <div class="content-level-1">
                        <div class="content-level-2" id="content_level_2">

                            <el-card class="breadcrumb-container" shadow="never" v-if="breadcrumbs">
                                <el-breadcrumb separator-class="el-icon-arrow-right">
                                    <el-breadcrumb-item :key="index" :to="{ name: crumb.link }"
                                                        v-for="(crumb, index) in breadcrumbs">{{ crumb.name }}
                                    </el-breadcrumb-item>
                                </el-breadcrumb>
                            </el-card>


                            <trial-update></trial-update>
                            <migration-banner></migration-banner>

                            <router-view/>


                        </div>
                    </div>

                    <!--  <div class="content-footer" v-if="show_schedule_cta">
                      <p>
                        Need help getting started? Schedule 1-on-1 with a team member
                        <el-button type="primary" size="small" round>
                          SCHEDULE NOW
                        </el-button>
                      </p>
                    </div>-->

                </el-main>
            </el-container>
        </el-container>
    </el-container>
</template>

<script>
    import AppSwitcher from "@/components/AppSwitcher.vue";
    import SideMenu from "@/components/SideMenu.vue";
    import WarningMessage from "@/components/WarningMessage.vue";
    import {deleteDefaultCookie} from "@/utils/subdomain_helper.js";
    import Avatar from 'vue-avatar';
    import ImpersonatorMenu from "@/components/ImpersonatorMenu.vue";
    import ClockInOutMenu from "@/components/ClockInOutMenu.vue";
    import GlobalSearch from "@/components/GlobalSearch.vue";

    import {setOptions, bootstrap} from 'vue-gtag'
    import {Notification} from 'element-ui'
    import MigrationBanner from "../../components/MigrationBanner";
    import TrialUpdate from "../../components/TrialUpdate";

    export default {
        components: {
            TrialUpdate,
            MigrationBanner,
            SideMenu,
            WarningMessage,
            AppSwitcher,
            Avatar,
            ImpersonatorMenu,
            ClockInOutMenu,
            GlobalSearch
        },

        data: () => {
            return {
                show_schedule_cta: false,
                breadcrumbs: [{
                    name: "Dashboard",
                    link: ""
                }],
                notification_count: 5
            };
        },

        created() {

            // console.log(this.$auth.user().company.subscription)
            if (process.env.NODE_ENV === 'production') {
                if (this.$auth.user().company && this.$auth.user().company.version === 'v1' && !this.$auth.user().company.migrated) {
                    Notification.warning({
                        position: "top-left",
                        title: "Migration Verification",
                        message: "This is your migrated Launch27 Version 2 account. Please take a look around and set up your settings and other items to prepare your business to go live.  You will not be able to charge cards, send emails or add bookings in your Version 2 account until your Version 1 account is deactivated.  However, all bookings from Version 1, will sync to your Version 2 account.  Please reach out to support if you have any questions."
                    });
                }


                if (this.$auth.user().company && this.$auth.user().company.version === 'v1' && this.$auth.user().company.subscription.plan_id === 'migrate') {
                    if (!process.env.VUE_APP_EARLY_LOOK){
                        this.$router.push({name: 'dashboard_settings_plan_popup'})
                    }
                }

            }

            this.breadcrumbs = this.$route.meta.breadcrumbs;

            if (this.$auth.user().company) {


                let company = this.$auth.user().company;
                if (!company.onboarding.complete) {
                    if (!company.onboarding.company) {
                        this.$router.push({path: "/onboarding/company"});
                    } else if (!company.onboarding.services) {
                        this.$router.push({path: "/onboarding/services"});
                    } else if (!company.onboarding.opening) {
                        this.$router.push({path: "/onboarding/opening-times"});
                    } else if (!company.onboarding.teams) {
                        this.$router.push({path: "/onboarding/teams"});
                    } else {
                        this.$router.push({path: "/onboarding/getting-started"});
                    }
                }

                //google analytics
                if (this.$gaId) {
                    setOptions({
                        config: {id: this.$gaId}
                    })
                }

                bootstrap().then((gtag) => {
                    // all done!
                    this.$gtag.set({
                        'currency': this.$currency,
                        'country': this.$auth.user().country.isoCode
                    })
                })

            }

            if (this.$route.name === "dashboard_getting_started") {
                this.show_schedule_cta = true;
            }
        },

        mounted() {
            if (this.$auth.user().company && (!this.$auth.user().company.subscription || this.$auth.user().company.subscription.plan_id === "free")) this.$events.emitEvent("show-warning", ["Upgrade Now", "CTA for user to upgrade to a paid plan", "Upgrade Now", {
                name: "dashboard_settings_account",
                query: {tab: "plan"}
            }]);


        },

        watch: {
            $route(val) {
                if (val.name === "dashboard_getting_started") {
                    this.show_schedule_cta = true;
                } else {
                    this.show_schedule_cta = false;
                }

                this.breadcrumbs = this.$route.meta.breadcrumbs;
            }
        },

        methods: {
            handleCommand(command) {
                if (command === "logout") {
                    this.logout();
                }
            },
            logout() {
                this.$auth.logout({
                    makeRequest: true,
                    params: {}, // data: {} in axios
                    success: function () {
                        deleteDefaultCookie(this.$auth.options.tokenDefaultName);
                        //set log out in zendesk as well
                        zE('webWidget', 'logout');
                        window.localStorage.clear()
                    },
                    error: function () {
                    },
                    redirect: "/login"
                    // etc...
                });
            }
        }
    };
</script>

<style lang="scss">
    @import "theme/DashboardLayout";

    .notification-container {
        text-align: center;
        display: block;
        width: 44px;
        height: 31px;

        img {
            position: relative;
            top: -3px;
        }
    }
</style>
