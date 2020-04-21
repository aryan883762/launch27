<template>
  <el-container class="apps-tab-navigation">
    <el-col>
      <el-row class="full-width bg-white">
        <el-radio-group v-model="active_tab" class="sub-view-links">
          <el-radio-button label="apps_giftcard_create">
            Purchase
          </el-radio-button>
          <el-radio-button label="apps_giftcard_list">
            Gift Card List
          </el-radio-button>
          <el-radio-button label="apps_giftcard_settings">
            Gift Card setup
          </el-radio-button>
          <el-radio-button label="apps_giftcard_widget">
            Form Widget
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
              active_tab: "apps_giftcard_create"
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
