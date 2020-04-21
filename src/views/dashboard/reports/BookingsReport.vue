<template>
  <el-card>
    <el-row class="l27-report-graphs">

      <el-tabs v-model="active_tab">
        <el-tab-pane label="Overview" name="report_overview"></el-tab-pane>
        <el-tab-pane label="Reports" name="report_table"></el-tab-pane>
        <!-- <el-tab-pane label="Customers" name="report_customers" :disabled="true"></el-tab-pane>
        <el-tab-pane label="Time Tracking" name="report_time_tracking" :disabled="true"></el-tab-pane>
        <el-tab-pane label="Employees" name="report_employees" :disabled="true"></el-tab-pane>
        <el-tab-pane label="Website" name="report_website" :disabled="true"></el-tab-pane> -->
      </el-tabs>
      
      <OverviewTab v-if="active_tab === 'report_overview'"/>

      <TableTab v-if="active_tab === 'report_table'"/>

      <!-- <MoneyTab v-if="active_tab === 'report_money'"/>
      <el-row v-if="active_tab === 'report_customers'">
        <el-row>
          <el-form :inline="true">
            <el-col :xs="24" :sm="12" :md="12">
              <el-form-item label="Filter">
                <el-select v-model="money_chart_type">
                  <el-option value="totalsales" label="Total Sales"/>
                  <el-option value="totalsalesbybookingtype" label="Total sales by booking type"/>
                  <el-option value="totalsalesbyservice" label="Total sales by services"/>
                  <el-option value="totalsalesbyteams" label="Total sales by teams"/>
                  <el-option value="totalsalesbysource" label="Total sales by source"/>
                  <el-option value="recurrringsales" label="Recurring sales"/>
                  <el-option value="newsales" label="New sales"/>
                  <el-option value="giftcardsales" label="Gift card sales"/>
                  <el-option value="promotionsales" label="Promotion sales"/>
                  <el-option value="promotiondiscountused" label="Promotion discounts used"/>
                  <el-option value="failedpayments" label="Failed payments"/>
                  <el-option value="averagesale" label="Average sale"/>
                  <el-option value="totalcancellations" label="Total cancellations"/>
                  <el-option value="bookingsvswagesprofit" label="Profit (bookings vs wages)"/>
                </el-select>
              </el-form-item>
            </el-col>


            <el-col :xs="24" :sm="12" :md="12">
              <el-form-item label="Dates">
                <div class="block">
                  <el-date-picker
                          v-model="date_range"
                          type="daterange"
                          align="right"
                          start-placeholder="Start Date"
                          end-placeholder="End Date"
                          default-value="2010-10-01">
                  </el-date-picker>
                </div>
              </el-form-item>
            </el-col>

          </el-form>
        </el-row>
        <el-row>
          <booking-types v-if="booking_chart_type === 'booking_type'"></booking-types>
          <new-bookings v-if="booking_chart_type === 'newbooking'"></new-bookings>
          <recurring-bookings v-if="booking_chart_type === 'recurring'"></recurring-bookings>
        </el-row>
      </el-row>
      <el-row v-if="active_tab === 'report_time_tracking'">
        <el-row>
          <el-form :inline="true">
            <el-col :xs="24" :sm="12" :md="12">
              <el-form-item label="Filter">
                <el-select v-model="money_chart_type">
                  <el-option value="totalsales" label="Total Sales"/>
                  <el-option value="totalsalesbybookingtype" label="Total sales by booking type"/>
                  <el-option value="totalsalesbyservice" label="Total sales by services"/>
                  <el-option value="totalsalesbyteams" label="Total sales by teams"/>
                  <el-option value="totalsalesbysource" label="Total sales by source"/>
                  <el-option value="recurrringsales" label="Recurring sales"/>
                  <el-option value="newsales" label="New sales"/>
                  <el-option value="giftcardsales" label="Gift card sales"/>
                  <el-option value="promotionsales" label="Promotion sales"/>
                  <el-option value="promotiondiscountused" label="Promotion discounts used"/>
                  <el-option value="failedpayments" label="Failed payments"/>
                  <el-option value="averagesale" label="Average sale"/>
                  <el-option value="totalcancellations" label="Total cancellations"/>
                  <el-option value="bookingsvswagesprofit" label="Profit (bookings vs wages)"/>
                </el-select>
              </el-form-item>
            </el-col>


            <el-col :xs="24" :sm="12" :md="12">
              <el-form-item label="Dates">
                <div class="block">
                  <el-date-picker
                          v-model="date_range"
                          type="daterange"
                          align="right"
                          start-placeholder="Start Date"
                          end-placeholder="End Date"
                          default-value="2010-10-01">
                  </el-date-picker>
                </div>
              </el-form-item>
            </el-col>

          </el-form>
        </el-row>
        <el-row>
          <booking-types v-if="booking_chart_type === 'booking_type'"></booking-types>
          <new-bookings v-if="booking_chart_type === 'newbooking'"></new-bookings>
          <recurring-bookings v-if="booking_chart_type === 'recurring'"></recurring-bookings>
        </el-row>
      </el-row>
      <el-row v-if="active_tab === 'report_employees'">
        <el-row>
          <el-form :inline="true">
            <el-col :xs="24" :sm="12" :md="12">
              <el-form-item label="Filter">
                <el-select v-model="money_chart_type">
                  <el-option value="totalsales" label="Total Sales"/>
                  <el-option value="totalsalesbybookingtype" label="Total sales by booking type"/>
                  <el-option value="totalsalesbyservice" label="Total sales by services"/>
                  <el-option value="totalsalesbyteams" label="Total sales by teams"/>
                  <el-option value="totalsalesbysource" label="Total sales by source"/>
                  <el-option value="recurrringsales" label="Recurring sales"/>
                  <el-option value="newsales" label="New sales"/>
                  <el-option value="giftcardsales" label="Gift card sales"/>
                  <el-option value="promotionsales" label="Promotion sales"/>
                  <el-option value="promotiondiscountused" label="Promotion discounts used"/>
                  <el-option value="failedpayments" label="Failed payments"/>
                  <el-option value="averagesale" label="Average sale"/>
                  <el-option value="totalcancellations" label="Total cancellations"/>
                  <el-option value="bookingsvswagesprofit" label="Profit (bookings vs wages)"/>
                </el-select>
              </el-form-item>
            </el-col>


            <el-col :xs="24" :sm="12" :md="12">
              <el-form-item label="Dates">
                <div class="block">
                  <el-date-picker
                          v-model="date_range"
                          type="daterange"
                          align="right"
                          start-placeholder="Start Date"
                          end-placeholder="End Date"
                          default-value="2010-10-01">
                  </el-date-picker>
                </div>
              </el-form-item>
            </el-col>

          </el-form>
        </el-row>
        <el-row>
          <booking-types v-if="booking_chart_type === 'booking_type'"></booking-types>
          <new-bookings v-if="booking_chart_type === 'newbooking'"></new-bookings>
          <recurring-bookings v-if="booking_chart_type === 'recurring'"></recurring-bookings>
        </el-row>
      </el-row>
      <el-row v-if="active_tab === 'report_website'">
        <el-row>
          <el-form :inline="true">
            <el-col :xs="24" :sm="12" :md="12">
              <el-form-item label="Filter">
                <el-select v-model="money_chart_type">
                  <el-option value="totalsales" label="Total Sales"/>
                  <el-option value="totalsalesbybookingtype" label="Total sales by booking type"/>
                  <el-option value="totalsalesbyservice" label="Total sales by services"/>
                  <el-option value="totalsalesbyteams" label="Total sales by teams"/>
                  <el-option value="totalsalesbysource" label="Total sales by source"/>
                  <el-option value="recurrringsales" label="Recurring sales"/>
                  <el-option value="newsales" label="New sales"/>
                  <el-option value="giftcardsales" label="Gift card sales"/>
                  <el-option value="promotionsales" label="Promotion sales"/>
                  <el-option value="promotiondiscountused" label="Promotion discounts used"/>
                  <el-option value="failedpayments" label="Failed payments"/>
                  <el-option value="averagesale" label="Average sale"/>
                  <el-option value="totalcancellations" label="Total cancellations"/>
                  <el-option value="bookingsvswagesprofit" label="Profit (bookings vs wages)"/>
                </el-select>
              </el-form-item>
            </el-col>


            <el-col :xs="24" :sm="12" :md="12">
              <el-form-item label="Dates">
                <div class="block">
                  <el-date-picker
                          v-model="date_range"
                          type="daterange"
                          align="right"
                          start-placeholder="Start Date"
                          end-placeholder="End Date"
                          default-value="2010-10-01">
                  </el-date-picker>
                </div>
              </el-form-item>
            </el-col>

          </el-form>
        </el-row>
        <el-row>
          <booking-types v-if="booking_chart_type === 'booking_type'"></booking-types>
          <total-sales-by-booking-type v-if="money_chart_type === 'totalsalesbybookingtype'"></total-sales-by-booking-type>


        </el-row>
      </el-row> -->

    </el-row>
  </el-card>
</template>

<script>
import  OverviewTab from './overview/OverviewTab.vue'
import  TableTab from './table/TableTab.vue'

export default {
  components: {
    OverviewTab,
    TableTab,
  },
  data() {
    return {
        active_tab: "report_overview",
    };
  }
};
</script>

<style lang="scss">

  .l27-report-graphs{
    .result-count{
      color: #6380F8;
      font-size: 45px;
      font-weight: bolder;
      line-height: 1;
      margin: 20px;
    }
  }
  .el-form--inline{
    .el-form-item__label{
      padding: 14px;
    }
  }

</style>
