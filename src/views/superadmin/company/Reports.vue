<template>
  <el-row>
    <el-col>
      <template v-if="!$route.params.id">
        <el-row>
          <h3 class="text-center" v-if="!loading">Company not found</h3>
        </el-row>
      </template>                                                                                                                                 
      <template v-else>
        <el-row class="main-row">
          <el-col>
            <bookings-report :query="{companyId: $route.params.id}"/>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="main-row">
          <el-col :md="16">
            <charges-report :query="{companyId: $route.params.id}"/>
          </el-col>
          <el-col :md="8">
            <accounts-report :query="{companyId: $route.params.id}"/> 
          </el-col>
        </el-row>
      </template>
    </el-col>
  </el-row>
</template>

<script>
  import BookingsReport from "../components/BookingsReport";
  import AccountsReport from "../components/AccountsReport";
  import ChargesReport from "../components/ChargesReport";

  export default {
      components: {
          BookingsReport,
          AccountsReport,
          ChargesReport
      },
      data: () => {
          return {};
      },
  };
</script>

<style lang="scss">

  .main-row {
      margin-bottom: 20px;
      &:last-child {
          margin-bottom: 0;
      }
  }
</style>
