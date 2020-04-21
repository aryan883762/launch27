<template>
  <el-card shadow="never" class="side-menu-card">
    <el-aside width="200px" class="component-side-menu">
      <el-menu ref="sidemenu">
        <el-menu-item :class="{'is-active' : $route.name === 'customer_dashboard'}">
          <router-link to="/customer/dashboard">
            <img svg-inline src="@/assets/svgs/menu/dashboard.svg" />
            <span>Dashboard</span>
          </router-link>
        </el-menu-item>

        <el-menu-item :class="{'is-active' : $route.name === 'customer_bookings_list'}">
          <router-link  to="/customer/bookings">
            <img svg-inline src="@/assets/svgs/menu/booking.svg" />
            <span>Booking</span>
          </router-link>
        </el-menu-item>

        <el-menu-item :class="{'is-active' : $route.name === 'customer_account_cards'}">
          <router-link :to="{name: 'customer_account_cards'}">
            <img svg-inline src="@/assets/svgs/menu/timelogs.svg" />
            <span>Credit Cards</span>
          </router-link>
        </el-menu-item>

        <el-menu-item :class="{'is-active' : $route.name === 'customer_messages'}">
          <router-link :to="{name: 'customer_messages'}">
            <img svg-inline src="@/assets/svgs/menu/inbox.svg" />
            <span>Messages</span>
          </router-link>
        </el-menu-item>

        <el-menu-item :class="{'is-active' : $route.name === 'customer_teams'}">
          <router-link :to="{ name: 'customer_teams' }">
            <img svg-inline src="@/assets/svgs/menu/calendar.svg" />
            <span>Teams</span>
          </router-link>
        </el-menu-item>

        <el-menu-item :class="{'is-active' : $route.name === 'customer_checklists'}">
          <router-link :to="{name: 'customer_checklists'}">
            <img svg-inline src="@/assets/svgs/menu/checklist.svg" />
            <span>Checklists</span>
          </router-link>
        </el-menu-item>

        <el-menu-item :class="{'is-active' : $route.name === 'customer_photos'}">
          <router-link :to="{name: 'customer_photos'}">
            <img svg-inline src="@/assets/svgs/menu/reports.svg" />
            <span>Photos</span>
          </router-link>
        </el-menu-item>

        <el-menu-item v-if="false" :class="{'is-active' : $route.name === 'customer_ratings'}">
          <router-link :to="{ name: 'customer_ratings' }">
            <img svg-inline src="@/assets/svgs/menu/checklist.svg" />
            <span>Ratings</span>
          </router-link>
        </el-menu-item>

        <el-menu-item :class="{'is-active' : $route.name === 'customer_apps_giftcard_create'}">
          <router-link :to="{name: 'customer_apps_giftcard_create'}">
            <img svg-inline src="@/assets/svgs/menu/apps.svg" />
            <span>Gift Cards</span>
          </router-link>
        </el-menu-item>

        <el-menu-item v-if="this.$can('manage', 'plan_customer_reward')" :class="{'is-active' : $route.name === 'customer_apps_referral'}">
          <router-link :to="{ name: 'customer_apps_referral' }">
            <img svg-inline src="@/assets/svgs/menu/apps.svg" />
            <span>Campaigns</span>
          </router-link>
        </el-menu-item>

        <el-menu-item :class="{'is-active' : $route.name === 'customer_profile'}">
          <router-link :to="{ name: 'customer_profile' }">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>Profile</span>
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
