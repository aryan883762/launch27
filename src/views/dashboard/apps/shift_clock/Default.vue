<template>
  <el-container class="apps-tab-navigation">
    <el-col>
      <el-row class="full-width bg-white">
        <el-radio-group v-model="active_tab" class="sub-view-links">
          <el-radio-button label="apps_shift_clock_settings">
            Settings
          </el-radio-button>
          <el-radio-button label="apps_shift_clock_list">
            History
          </el-radio-button>
        </el-radio-group>
      </el-row>
      <div class="divider-1x" />
      <el-row class="full-width bg-white">
        <router-view />
      </el-row>
    </el-col>
  </el-container>
</template>

<script>
  export default {
      data: () => {
          return {
              active_tab: "apps_shift_clock_settings"
          };
      },
      watch: {
          active_tab(val) {
              this.$router.push({name: val});
          },
          '$route'(to, from) {
              this.active_tab = to.name;
          }
      },
      created() {
          this.active_tab = this.$router.currentRoute.name;
      }
  };
</script>
