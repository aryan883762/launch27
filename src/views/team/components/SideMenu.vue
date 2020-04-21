<template>
  <el-card shadow="never" class="side-menu-card">
    <el-aside width="200px" class="component-side-menu">
      <el-menu>
        <el-menu-item index="0">
          <router-link :to="{name: 'team_dashboard'}">
            <img svg-inline src="@/assets/svgs/menu/dashboard.svg" />
            <span>Dashboard</span>
          </router-link>
        </el-menu-item>

        <el-menu-item index="7">
          <router-link :to="{name: 'team_workdiary'}">
            <img svg-inline src="@/assets/svgs/menu/workdiary.svg" />
            <span>Work Diary</span>
          </router-link>
        </el-menu-item>

        <el-menu-item index="1">
          <router-link :to="{name: 'team_bookings_list'}">
            <img svg-inline src="@/assets/svgs/menu/booking.svg" />
            <span>Booking</span>
          </router-link>
        </el-menu-item>

        <el-menu-item index="2">
          <router-link :to="{name: 'team_timelogs'}">
            <img svg-inline src="@/assets/svgs/menu/timelogs.svg" />
            <span>Time Logs</span>
          </router-link>
        </el-menu-item>

        <el-menu-item index="3" v-if="false">
          <router-link  :to="{ name: 'team_messages' }">
            <img svg-inline src="@/assets/svgs/menu/inbox.svg" />
            <span>Messages</span>
          </router-link>
        </el-menu-item>

        <el-menu-item index="4">
          <router-link :to="{name: 'team_invitation'}">
            <img svg-inline src="@/assets/svgs/menu/calendar.svg" />
            <span>Invitations</span>
          </router-link>
        </el-menu-item>

        <el-menu-item index="5">
          <router-link :to="{name: 'team_availability'}">
            <img svg-inline src="@/assets/svgs/menu/checklist.svg" />
            <span>Availability</span>
          </router-link>
        </el-menu-item>

        <el-menu-item index="6">
          <router-link  :to="{name: 'team_profile'}">
            <img svg-inline src="@/assets/svgs/menu/reports.svg" />
            <span>Account</span>
          </router-link>
        </el-menu-item>
      </el-menu>
    </el-aside>
  </el-card>
</template>

<script>
export default {
  name: "Sidemenu",
  data: () => {
    return {};
  }
};
</script>
