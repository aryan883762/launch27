<template>
  <el-card shadow="none" v-loading="account_loading" class="apps-list-table">
    <el-row class="divider-3x">
      <el-col :md="12" :sm="12" :xs="24">
        <h4 class="flex-row-center">
          <el-image :src="require('@/assets/svgs/dashboard/stats.svg')"></el-image>
          Users Statistics
        </h4>
      </el-col>
    </el-row>

    <!--row for states-->
    <el-row :gutter="40" class="stats-row">
      <el-col :md="5" :sm="5" :xs="12" class="first">
        <span class="stats-number _first">{{ accounts.length }}</span>
        <label>Users</label>
      </el-col>
    </el-row>
    <!--row for graph-->

    <el-row>
      <el-col>
        <account-chart :accounts.sync="accounts" />
      </el-col>
    </el-row>
  </el-card> 
</template>

<script>
  import {superAdminRoles} from '@/utils/auth/ability.js';
  import AccountChart from "../reports/utils/AccountChart";

  export default {
      props: {
          query: {
              type: Object,
              default: () => {
                  return {};
              }
          }
      },
      components: {
          AccountChart
      },
      data: () => {
          return {
              accounts: [],
              account_loading: false
          };
      },

      mounted() {
          this.getAccounts();
      },

      methods: {
          getAccounts() {
              this.account_loading = true;

              let whereQuery = this.query;
              whereQuery.role = {nin: superAdminRoles};
              this.axios.get('/accounts', {
                  params: {
                      filter: {
                          where: whereQuery,
                          fields: {id: true, role: true, roleName: true}
                      }
                  }})
                      .then(res => {
                          this.accounts = res.data;
                      })
                      .finally(() => {
                          this.account_loading = false;
                      });
          }
      }
  };
</script>
