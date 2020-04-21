<template>
  <el-card shadow="never" v-loading="loading" :body-style="{minHeight: '300px'}" 
           class="company-view-card-main">
    <template v-if="!company.id">
      <el-row>
        <h3 class="text-center" v-if="!loading">Company not found</h3>
      </el-row>
    </template>                                                                                                                                 
    <template v-else>
      <el-row v-if="company.account">
        <el-col>
          <account-plan :profile.sync="company.account" />
        </el-col>
      </el-row>
    </template>
  </el-card>
</template>

<script>
  import AccountPlan from "@/views/components/AccountPlan.vue";
  import currencyData from 'currency-data';

  export default {
      components: {
          AccountPlan
      },
      data: () => {
          return {
              loading: true,
              company: {},
          };
      },
      computed: {
          companyCurrency() {
              if (this.company && this.company.currency) {
                  return this.company.currency.symbol
              } else if (this.company && this.company.country) {
                  let primaryCurrencyISOCode = this.company.country.currency.split(',')[0];
                  return currencyData.getCurrencyByCurrencyISOCode(primaryCurrencyISOCode).symbol;
              } else {
                  return '';
              }
          }
      },
      mounted() {
          this.loadCompany();
      },
      methods: {
          loadCompany() {
              this.axios.get('/companies/' + this.$route.params.id,
                      {
                          params: {
                              filter: {
                                  include: ['account']
                              }
                          }
                      })
                      .then(res => {
                          if (res.data) {
                              this.company = res.data;
                          }
                      })
                      .finally(() => {
                          this.loading = false;
                      });
          }
      }
  };
</script>

<style lang="scss">
  .subscription-card{
      margin-bottom: 20px;
  }
</style>
