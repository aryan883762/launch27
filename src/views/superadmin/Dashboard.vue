<template>
  <el-row class="superadmin-dashboard">
    <el-col>
      <el-row class="main-row">
        <el-col>
          <bookings-report />
        </el-col>
      </el-row>
      <el-row class="main-row">
        <el-col>
          <!-- <charges-report /> -->
        </el-col>
      </el-row>
      <el-row class="main-row">
        <el-col>
          <subscription-payment-report />
        </el-col>
      </el-row>
      <el-row :gutter="20" class="main-row">
        <el-col :md="16" v-if="!company_loading">
          <plans-report :companiesList="companies" />
        </el-col>
        <el-col :md="8">
          <accounts-report /> 
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
  import BookingsReport from "./components/BookingsReport";
  import AccountsReport from "./components/AccountsReport";
  import ChargesReport from "./components/ChargesReport";
  import PlansReport from "./components/PlansReport";
  import SubscriptionPaymentReport from "./components/SubscriptionPaymentReport";

  export default {
      components: {
          BookingsReport,
          AccountsReport,
          ChargesReport,
          PlansReport,
          SubscriptionPaymentReport
      },
      data() {
          return {
              companies: [],
              company_loading: true
          };
      },
      mounted() {
          this.getCompanies();
      },
      methods: {
          getCompanies() {
              this.axios.get('/companies', {
                  params: {
                      filter: {
                          fields: {id: true, subscriptionId: true, country: true, version: true, data_migrated: true},
                          // where: {or: [{version: {neq: "v1"}}, {and: [{version: "v1"}, {migrated: true}]}]}
                      }
                  }})
                      .then(res => {
                          this.companies = res.data;
                      })
                      .finally(() => {
                          this.company_loading = false;
                      });
          }
      }
  };
</script>

<style lang="scss">
  .superadmin-dashboard {
      h4 {
          margin: 0;

          img {
              width: 18px;
              margin-right: 10px;
          }

          svg {
              width: 18px;
              margin-right: 10px;
          }
      }

      .main-row {
          margin-bottom: 20px;
          &:last-child {
              margin-bottom: 0;
          }
      }
  }  
</style>
