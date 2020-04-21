<template>
  <el-card shadow="none" v-loading="payment_loading" class="apps-list-table">
    <el-row class="divider-3x">
      <el-col :md="12" :sm="12" :xs="24">
        <h4 class="flex-row-center">
          <el-image :src="require('@/assets/svgs/dashboard/stats.svg')"></el-image>
          Subscription Payments Statistics
        </h4>
      </el-col>
    </el-row>


    <el-row>
      <el-col :md="18">
    <!--row for states-->
    <el-row :gutter="40" class="stats-row">
      <!-- <el-col :md="12" :sm="12" :xs="12" class="first">
        <span class="stats-number _first">{{ paymentsStats.count }}</span>
        <label>Payments</label>
      </el-col> -->

      <!-- <el-col :md="7" :sm="7" :xs="12" class="second">
        <span class="stats-number _second">{{ paymentsStats.paid }}</span>
        <label>Paid Payments</label>
        <span class="bar"/>
      </el-col>

      <el-col :md="8" :sm="8" :xs="12" class="third">
        <span class="stats-number _third"> {{ paymentsStats.unpaid }}</span>
        <label>Unpaid Payments</label>
        <span class="bar"/>
      </el-col> -->
    </el-row>
    <!--row for graph-->
        <subscription-payment-chart :payments.sync="payments" />
      </el-col>
      <el-col :md="6">
        <el-card>
          <v-range-selector :end-date.sync="range[1]" :single-month="true" 
              :start-date.sync="range[0]"/>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
  import VRangeSelector from "@/components/vuelendar/components/vl-range-selector";
  import SubscriptionPaymentChart from "../reports/utils/SubscriptionPaymentChart";

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
          SubscriptionPaymentChart,
          VRangeSelector
      },
      data: () => {
          return {
              range: [],
              payments: [],
              payment_loading: false,
              paymentsStats: {count: 0}
          };
      },
      mounted() {
          this.range = [
              this.$moment()
                  .startOf("week")
                  .format("YYYY-MM-DD"),
              this.$moment()
                  .endOf("week")
                  .format("YYYY-MM-DD")
          ];
      },
      watch: {
          range(value) {
              if (value[0] && value[1]) {
                  this.getPayments();
              }
          }
      },
      methods: {
          getPayments() {
              this.payment_loading = true;

              let whereQuery = this.query;
              if (this.range[0] && this.range[1]) {
                  whereQuery.created_at = {between: this.range};
              }
              this.axios.get('/subscription_payments', {
                  params: {
                      filter: {
                          where: whereQuery,
                          fields: ['id', 'currency', 'currency_symbol', 'created_at', 'amount']
                      }
                  }})
                    .then(res => {
                        this.payments = res.data;
                        this.paymentsStats = {count: 0};
                        if (this.payments) {
                            this.paymentsStats.count += this.payments.length;
                        }
                    })
                    .finally(() => {
                        this.payment_loading = false;
                    });
          }
      }
  };
</script>
