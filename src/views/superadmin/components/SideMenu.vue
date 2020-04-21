<template>
  <el-card shadow="never" class="side-menu-card">
    <el-aside width="200px" class="component-side-menu">
      <el-menu>
        <el-menu-item index="0">
          <router-link :to="{name: 'superadmin_dashboard'}">
            <img svg-inline src="@/assets/svgs/menu/dashboard.svg" />
            <span>Dashboard</span>
          </router-link>
        </el-menu-item>
        <el-menu-item index="1">
          <router-link :to="{name: 'superadmin_companies'}">
            <img svg-inline src="@/assets/svgs/menu/dashboard.svg" />
            <span>Companies</span>
          </router-link>
        </el-menu-item>
        <el-menu-item index="6">
          <router-link :to="{name: 'superadmin_migration_import'}">
            <img svg-inline src="@/assets/svgs/menu/dashboard.svg" />
            <span>Migration</span>
          </router-link>
        </el-menu-item>
        <el-menu-item index="2">
          <router-link :to="{name: 'superadmin_administrators'}">
            <img svg-inline src="@/assets/svgs/menu/people.svg" />
            <span>Administrators</span>
          </router-link>
        </el-menu-item>
        <el-menu-item index="3">
          <router-link :to="{name: 'superadmin_plans'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>Plans</span>
          </router-link>
        </el-menu-item>
        <el-menu-item index="4">
          <router-link :to="{name: 'superadmin_tutorials'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>Tutorials</span>
          </router-link>
        </el-menu-item>
        <el-menu-item index="5">
          <router-link :to="{name: 'superadmin_reserved'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>Reserved Values</span>
          </router-link>
        </el-menu-item>
        <el-menu-item index="8">
          <router-link :to="{name: 'superadmin_allowed'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>Allowed Values</span>
          </router-link>
        </el-menu-item>
        <el-menu-item index="7">
          <router-link :to="{name: 'superadmin_system_apps'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>System Apps</span>
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

<style lang="scss">
  svg.menu-icon {
      width: 24px;
      height: 24px;
      margin-right: 10px;
      display: inline-block;
  }
  
  .side-menu-card .component-side-menu .el-menu .el-menu-item.sub-menu-item {
      padding-left: 35px !important;
  }
</style>
