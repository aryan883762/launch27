<template>
  <el-container class="apps-tab-navigation">
    <el-col>
      <el-card shadow="never" :body-style="{ padding: '0px' }">
               <el-row class="full-width bg-white">
          <el-col>
            <el-radio-group v-model="active_tab" class="sub-view-links">
              <el-radio-button label="superadmin_migration_report">
                Report
              </el-radio-button>
              <el-radio-button label="superadmin_migration_edit">
                Edit
              </el-radio-button>
              <el-radio-button label="superadmin_migration_import">
                Import
              </el-radio-button>
              <el-radio-button label="superadmin_migration_tokens">
                Tokens Transfer
              </el-radio-button>
            </el-radio-group>
          </el-col>
        </el-row>
      </el-card>
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
              active_tab: "superadmin_migration_report",
              company: {}
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

<style lang="scss">
</style>
