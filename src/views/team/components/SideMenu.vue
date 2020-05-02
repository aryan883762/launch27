<template>
  <el-card shadow="never" class="side-menu-card">
    <el-aside width="100%" class="component-side-menu">
      <el-menu class="el-menu-vertical" :collapse="isCollapse">
        <el-menu-item>
            <a href="javascript:void(0)" @click="collapse()" v-bind:class="{ 'collapse-true': isCollapse }">
                <img svg-inline src="@/assets/left-arrow.svg" >
                <span>Close Collapse</span>
            </a>
            <span slot="title">Open Collapse</span>
        </el-menu-item>
        <el-menu-item index="0">
          <router-link :to="{name: 'team_dashboard'}">
            <img svg-inline src="@/assets/svgs/menu/dashboard.svg" />
            <span>Dashboard</span>
          </router-link>
          <span slot="title">Dashboard</span>
        </el-menu-item>

        <el-menu-item index="7">
          <router-link :to="{name: 'team_workdiary'}">
            <img svg-inline src="@/assets/svgs/menu/workdiary.svg" />
            <span>Work Diary</span>
          </router-link>
          <span slot="title">Work Diary</span>
        </el-menu-item>

        <el-menu-item index="1">
          <router-link :to="{name: 'team_bookings_list'}">
            <img svg-inline src="@/assets/svgs/menu/booking.svg" />
            <span>Booking</span>
          </router-link>
          <span slot="title">Booking</span>
        </el-menu-item>

        <el-menu-item index="2">
          <router-link :to="{name: 'team_timelogs'}">
            <img svg-inline src="@/assets/svgs/menu/timelogs.svg" />
            <span>Time Logs</span>
          </router-link>
          <span slot="title">Time Logs</span>
        </el-menu-item>

        <el-menu-item index="3" v-if="false">
          <router-link  :to="{ name: 'team_messages' }">
            <img svg-inline src="@/assets/svgs/menu/inbox.svg" />
            <span>Messages</span>
          </router-link>
          <span slot="title">Messages</span>
        </el-menu-item>

        <el-menu-item index="4">
          <router-link :to="{name: 'team_invitation'}">
            <img svg-inline src="@/assets/svgs/menu/calendar.svg" />
            <span>Invitations</span>
          </router-link>
          <span slot="title">Invitations</span>
        </el-menu-item>

        <el-menu-item index="5">
          <router-link :to="{name: 'team_availability'}">
            <img svg-inline src="@/assets/svgs/menu/checklist.svg" />
            <span>Availability</span>
          </router-link>
          <span slot="title">Availability</span>
        </el-menu-item>

        <el-menu-item index="6">
          <router-link  :to="{name: 'team_profile'}">
            <img svg-inline src="@/assets/svgs/menu/reports.svg" />
            <span>Account</span>
          </router-link>
          <span slot="title">Account</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
  </el-card>
</template>

<script>
export default {
  name: "Sidemenu",
  data: () => {
    return {
        isCollapse: true
    };
  },
  methods: {
    collapse() {
      this.isCollapse = !this.isCollapse;
      this.$helpers.sideMenuCollapse(this.isCollapse);
    }
  }
};
</script>
<style lang="scss">
 @import "../../../theme/side-menu.scss";
</style>

