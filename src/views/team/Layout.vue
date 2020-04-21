<template>
  <el-container class="page dashboard layout" disabled>
    <el-container class="main-app-holder">
      <el-card class="header">
        <el-row class="flex-row-center full-height">
          <el-col :md="12" :sm="12" :xs="24">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="170px" height="24px">
              <image
                x="0px"
                y="0px"
                width="100px"
                height="24px"
                xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAYCAMAAADnCR6uAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAYFBMVEUAAAD/hgT/hgT/hgT/hgT/hgT/hgRyc3X/hgT/hgT/hgT/hgT/hgT/hgT/hgRyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3X/hgRyc3X/hgT///8q9MMLAAAAHXRSTlMAM4i77kQiu2YR3cx3qpkiiO5md8zdEaozVZlEVYVmdPkAAAABYktHRB8FDRC9AAAAB3RJTUUH4wIbFAcyPWWMmQAAAklJREFUSMfFlu2WgiAQhjEqNG0LUfIjuv/LXGAGBUSrPZ12fuwiDDMPr8MkIR82pW05m+3o4/HY011mHw+PyI6EJfd9luNI54w0S3EcvsGR7YOc+T/pUZxsqpLSEpJmCw5KvsBRmUzno0Xa2bG/eobX8gUO6qe2UN7iEeX4AscPpTRzDwUef1p0zx7H5aofOKttMBaGRDdmF4T+11wvU7CLYFy1rJaOQ4pGqfZWJzhDjkmOmUPeFFrTbXJ0LfphGnl1G9sONvUcJ5iMMQ5wOxZyTByyUZM1Wxx89qvjja0kKrBbhJGbK7xPyDFxWDWGkciewVHWOAynENadm+OCGg3TKnHUQwOhh+qwLO7VWZcJ3NIqlOPuJxg9oYcnHMJMjBxGF0thamVkHdYHeHTG42qP/eM3i7IIivYUJBjcHmPtJgdqLWBo5Gi8MrCywrCGMFE/pRMGXOJ8kaBz62KTA92MEC3M9CTkQA8JAYoZo6TVXKOwcAoTBNd+3OTwM8JfGXGEY9tDy9wDSMjxEQ6yyVHGrTwlh4vcJt6LmXPNiq9x8Kd6RB00LYd/0MHNYZ0yV/lAluZg8z17jyOUw0UWiXtr5vhoZmq+yiFcH9F1+RZHFbYSjCz5so9J17SwYyY57Eauf1pkzYdVjvjrS5v5KtkXMYe97L4xJxI2yDUO30kN8mWOPJRjjuzFcw1omuO1WOWA14h+48sckRxe5BFeiGpGcwksh/4UaPSXgJBkg4P07geYdS+/l1iOwGQvRN2R960XjN3EX3Y6+wVNBooECZNeKAAAAABJRU5ErkJggg=="
              />
            </svg>

            <el-input class="hidden-sm-and-down header-search round" placeholder="Search" size="small" />
          </el-col>

          <el-col :md="12" :sm="12" :xs="24" class="avatar-holder hidden-sm-and-down">
            <ClockInOutMenu style="margin-right: 10px"/>
            <impersonator-menu />
            <el-dropdown @command="handleCommand" class="pull-right hover-pointer"  v-if="!$auth.impersonating()">
              <span class="el-dropdown-link flex-row-center">
                <el-avatar :size="32" v-if="$auth.user().avatar" :src="$auth.user().avatar" class="profile-avatar"></el-avatar>
                <avatar :size="32" v-if="!$auth.user().avatar" :username="$auth.user().fullname" class="profile-avatar" color="white"></avatar>
                <span>{{ $auth.user().first_name }}</span>
                <i class="el-icon-arrow-down el-icon--right" v-if="!$auth.impersonating()"/>
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
        <side-menu class="hidden-sm-and-down side-menu-container" v-if="$can('manage', 'plan_team_portal')"/>
        <el-main :class="{content:true, 'mega-content-layer': true, 'main-content-noplan': !$can('manage', 'plan_team_portal')}">
          <!-- <warning-message></warning-message>-->

          <div class="content-level-1">
            <div class="content-level-2" id="content_level_2">
              <el-card class="breadcrumb-container" shadow="never" v-if="breadcrumbs">
                <el-breadcrumb separator-class="el-icon-arrow-right">
                  <el-breadcrumb-item :key="index" :to="{ name: crumb.link }" v-for="(crumb, index) in breadcrumbs">{{ crumb.name }}</el-breadcrumb-item>
                </el-breadcrumb>
              </el-card>
              <router-view v-if="$can('manage', 'plan_team_portal')"/>
              <el-card shadow="never" v-else>
                <p class="text-center plan-error-message">
                  Team Portal Is Not Available
                </p>
              </el-card>
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
import SideMenu from "./components/SideMenu.vue";
import { deleteDefaultCookie } from "@/utils/subdomain_helper.js";
import Avatar from 'vue-avatar';
import ImpersonatorMenu from "@/components/ImpersonatorMenu.vue";
import ClockInOutMenu from "@/components/ClockInOutMenu.vue";

export default {
  components: {
    SideMenu,
    Avatar,
    ImpersonatorMenu,
    ClockInOutMenu
  },

  data: () => {
    return {
      breadcrumbs: [{name: "Dashboard", link: ''}]
    };
  },

  watch: {
    $route(val) {
      this.breadcrumbs = this.$route.meta.breadcrumbs
    }
  },
  
  created() {
    this.breadcrumbs = this.$route.meta.breadcrumbs;
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
        success: function() {
          deleteDefaultCookie(this.$auth.options.tokenDefaultName);
        },
        error: function() {},
        redirect: "/login"
        // etc...
      });
    }
  }
};
</script>

<style lang="scss">
@import "../dashboard/theme/DashboardLayout";
</style>
