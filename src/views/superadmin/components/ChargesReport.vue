<template>
  <el-card shadow="none" v-loading="charge_loading" class="apps-list-table">
    <el-row class="divider-3x">
      <el-col :md="12" :sm="12" :xs="24">
        <h4 class="flex-row-center">
          <el-image :src="require('@/assets/svgs/dashboard/stats.svg')"></el-image>
          Charges Statistics
        </h4>
      </el-col>
    </el-row>


    <el-row>
      <el-col :md="18">
    <!--row for states-->
    <el-row :gutter="40" class="stats-row">
      <el-col :md="5" :sm="5" :xs="12" class="first">
        <span class="stats-number _first">{{ chargesStats.count }}</span>
        <label>Charges</label>
      </el-col>

      <el-col :md="7" :sm="7" :xs="12" class="second">
        <span class="stats-number _second">{{ chargesStats.paid }}</span>
        <label>Paid Charges</label>
        <span class="bar"/>
      </el-col>

      <el-col :md="8" :sm="8" :xs="12" class="third">
        <span class="stats-number _third"> {{ chargesStats.unpaid }}</span>
        <label>Unpaid Charges</label>
        <span class="bar"/>
      </el-col>
    </el-row>
    <!--row for graph-->
        <charge-chart :charges.sync="charges" />
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
  import ChargeChart from "../reports/utils/ChargeChart";

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
          ChargeChart,
          VRangeSelector
      },
      data: () => {
          return {
              range: [],
              charges: [],
              charge_loading: false,
              chargesStats: {count: 0, paid: 0, unpaid: 0}
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
                  this.getCharges();
              }
          }
      },
      methods: {
          getCharges() {
              this.charge_loading = true;

              let whereQuery = this.query;
              if (this.range[0] && this.range[1]) {
                  whereQuery.date = {between: this.range};
              }
              this.axios.get('/charges', {
                  params: {
                      filter: {
                          where: whereQuery,
                          fields: ['id', 'currency', 'currency_symbol', 'created_at', 'total_after_tax', 'date', 'paid']
                      }
                  }})
                    .then(res => {
                        this.charges = res.data;
                        this.chargesStats = {count: 0, paid: 0, unpaid: 0};
                        if (this.charges) {
                            this.chargesStats.count += this.charges.length;
                            this.charges.forEach((charge) => {
                                if (charge.paid) {
                                    this.chargesStats.paid += 1;
                                } else {
                                    this.chargesStats.unpaid += 1;
                                }
                            });
                        }
                    })
                    .finally(() => {
                        this.charge_loading = false;
                    });
          }
      }
  };
</script>
