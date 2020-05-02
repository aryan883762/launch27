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
          <router-link :to="{name: 'superadmin_dashboard'}">
            <img svg-inline src="@/assets/svgs/menu/dashboard.svg" />
            <span>Dashboard</span>
          </router-link>
          <span slot="title">Dashboard</span>
        </el-menu-item>
        <el-menu-item index="1">
          <router-link :to="{name: 'superadmin_companies'}">
            <img svg-inline src="@/assets/svgs/menu/dashboard.svg" />
            <span>Companies</span>
          </router-link>
          <span slot="title">Companies</span>
        </el-menu-item>
        <el-menu-item index="6">
          <router-link :to="{name: 'superadmin_migration_import'}">
            <img svg-inline src="@/assets/svgs/menu/dashboard.svg" />
            <span>Migration</span>
          </router-link>
          <span slot="title">Migration</span>
        </el-menu-item>
        <el-menu-item index="2">
          <router-link :to="{name: 'superadmin_administrators'}">
            <img svg-inline src="@/assets/svgs/menu/people.svg" />
            <span>Administrators</span>
          </router-link>
          <span slot="title">Administrators</span>
        </el-menu-item>
        <el-menu-item index="3">
          <router-link :to="{name: 'superadmin_plans'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>Plans</span>
          </router-link>
          <span slot="title">Plans</span>
        </el-menu-item>
        <el-menu-item index="4">
          <router-link :to="{name: 'superadmin_tutorials'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>Tutorials</span>
          </router-link>
          <span slot="title">Tutorials</span>
        </el-menu-item>
        <el-menu-item index="5">
          <router-link :to="{name: 'superadmin_reserved'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>Reserved Values</span>
          </router-link>
          <span slot="title">Reserved Values</span>
        </el-menu-item>
        <el-menu-item index="8">
          <router-link :to="{name: 'superadmin_allowed'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>Allowed Values</span>
          </router-link>
          <span slot="title">Allowed Values</span>
        </el-menu-item>
        <el-menu-item index="7">
          <router-link :to="{name: 'superadmin_system_apps'}">
            <img svg-inline src="@/assets/svgs/menu/settings.svg" />
            <span>System Apps</span>
          </router-link>
          <span slot="title">System Apps</span>
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
<!--
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
-->
<style lang="scss">
 @import "../../../theme/side-menu.scss";
</style>
