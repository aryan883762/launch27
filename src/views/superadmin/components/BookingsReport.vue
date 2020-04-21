<template>
  <el-card shadow="none" v-loading="booking_loading" class="apps-list-table">
    <el-row class="divider-3x">
      <el-col>
        <h4 class="flex-row-center">
          <el-image :src="require('@/assets/svgs/dashboard/stats.svg')"></el-image>
          Bookings Statistics
        </h4>
      </el-col>
    </el-row>    

    <el-row :gutter="20">
      <el-col :md="18">
        <!--row for states-->
        <el-row :gutter="40" class="stats-row">
          <el-col :md="4" :sm="4" :xs="12" class="first">
            <span class="stats-number _first">{{ bookingsStats.count }}</span>
            <label>Bookings</label>
          </el-col>

          <el-col :md="4" :sm="4" :xs="12" class="second">
            <span class="stats-number _second">{{ bookingsStats.onetime }}</span>
            <label>One Time</label>
            <span class="bar"/>
          </el-col>

          <el-col :md="4" :sm="4" :xs="12" class="third">
            <span class="stats-number _third"> {{ bookingsStats.repeat }}</span>
            <label>Repeating</label>
            <span class="bar"/>
          </el-col>
          <el-col :md="4" :sm="4" :xs="12" class="first">
            <span class="stats-number _first">{{ bookingsStats.active }}</span>
            <label>Active</label>
          </el-col>

          <el-col :md="4" :sm="4" :xs="12" class="second">
            <span class="stats-number _second">{{ bookingsStats.completed }}</span>
            <label>Completed</label>
            <span class="bar"/>
          </el-col>

          <el-col :md="4" :sm="4" :xs="12" class="third">
            <span class="stats-number _third"> {{ bookingsStats.cancelled }}</span>
            <label>Cancelled</label>
            <span class="bar"/>
          </el-col>
        </el-row>
        <!--row for graph-->
        <booking-chart :bookings.sync="bookings" />
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
  import BookingChart from "../reports/utils/BookingChart";

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
          BookingChart,
          VRangeSelector
      },
      data: () => {
          return {
              range: [],
              bookings: [],
              booking_loading: false,
              bookingsStats: {
                count: 0,
                onetime: 0, 
                repeat: 0,
                active: 0,
                completed: 0,
                cancelled: 0,
                }
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
                  this.getBookings();
              }
          }
      },
      methods: {
          getBookings() {
              this.booking_loading = true;
              let whereQuery = this.query;
              whereQuery.status = 'active';
              if (this.range[0] && this.range[1]) {
                  whereQuery.service_date = {between: this.range};
              }

              this.axios.get('/bookings', {
                  params: {
                      filter: {
                          where: whereQuery,
                          fields: ['id', 'service_date', 'frequencyId', 'status']
                      }
                  }})
                  .then(res => {
                      this.bookingsStats = {
                          count: 0,
                          onetime: 0, 
                          repeat: 0,
                          active: 0,
                          completed: 0,
                          cancelled: 0,
                          }
                      this.bookings = res.data;
                      if (this.bookings) {
                          this.bookingsStats.count = this.bookings.length;
                          this.bookings.forEach((booking) =>{
                              if (booking.frequency && booking.frequency.rule_id === 'onetime') {
                                this.bookingsStats.onetime += 1;
                              } else {
                                this.bookingsStats.repeat += 1;
                              }
                              if (booking.status === 'active') {
                                this.bookingsStats.active += 1;
                              } else if (booking.status === 'cancelled') {
                                this.bookingsStats.cancelled += 1;
                              } else if (booking.status === 'completed') {
                                this.bookingsStats.completed += 1;
                              }
                          });
                      }
                  })
                  .finally(() => {
                      this.booking_loading = false;
                  });
          },
      }
  };
</script>
