<template>
  <el-card shadow="none" v-loading="company_loading" class="apps-list-table">
    <el-row class="divider-3x">
      <el-col :md="18" :sm="18" :xs="24">
        <h4 class="flex-row-center">
          <el-image :src="require('@/assets/svgs/dashboard/stats.svg')"></el-image>
          Company Subscription Statistics
        </h4>
      </el-col>
    </el-row>

    <!--row for states-->
    <el-row :gutter="40" class="stats-row">
      <el-col :md="24" :sm="24" :xs="24">
        <el-row>
          <el-col :md="8" :sm="8" :xs="12" class="first">
            <span class="stats-number _first">{{ companies.length }}</span>
            <label>Companies</label>
          </el-col>

          <el-col :md="8" :sm="8" :xs="12" class="first">
            <span class="stats-number _first">{{ companiesStats.new }}</span>
            <label>New</label>
          </el-col>

          <el-col :md="8" :sm="8" :xs="12" class="first">
            <span class="stats-number _first">{{ companiesStats.dataMigrated }}</span>
            <label>Data Migrated</label>
          </el-col>
        </el-row>
      </el-col>

      <el-col :md="10" :sm="10" :xs="24">
        <el-row>
          <el-col :md="12" :sm="12" :xs="12" class="second">
            <span class="stats-number _second">{{ companiesStats.free }}</span>
            <label>Free Plan</label>
            <span class="bar"/>
          </el-col>

          <el-col :md="12" :sm="12" :xs="12" class="third">
            <span class="stats-number _third"> {{ companiesStats.paid }}</span>
            <label>Paid Plan</label>
            <span class="bar"/>
          </el-col>
        </el-row>
      </el-col>    

    </el-row>
    <!--row for graph-->

    <el-row>
      <el-col :md="18">
        <plan-chart :companies.sync="companies" />
      </el-col>
      <el-col :md="6">
        <plan-type-chart :companies.sync="companies" />
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
  import PlanChart from "../reports/utils/PlanChart";
  import PlanTypeChart from "../reports/utils/PlanTypeChart";

  export default {
      props: {
          query: {
              type: Object,
              default: () => {
                  return {};
              }
          },
          companiesList: {
              type: Array
          }
      },
      components: {
          PlanChart,
          PlanTypeChart
      },
      data: () => {
          return {
              companies: [],
              company_loading: false
          };
      },
      mounted() {
          if (this.companiesList) {
              this.companies = this.companiesList;
          } else {
              this.getCompanies();
          }
      },
      computed: {
          companiesStats() {
              let free = this.companies
                      .filter((c) => (c.subscription && c.subscription.plan_id === 'free'))
                      .length;
              let paid = this.companies.length - free;
              let newV2 = this.companies.filter(c => c.version !== 'v1').length;
              let dataMigrated = this.companies.filter(c => c.data_migrated ).length;
              return {free: free, paid: paid, new: newV2, dataMigrated: dataMigrated};
          }
      },
      methods: {
          getCompanies() {
              this.company_loading = true;

              let whereQuery = this.query;
              this.axios.get('/companies', {
                  params: {
                      filter: {
                          where: whereQuery,
                          fields: {id: true, subscriptionId: true, version: true, data_migrated: true}
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
