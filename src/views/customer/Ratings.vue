<template>
  <div class="app-section workdiary">
    <el-row :gutter="10">

      <el-col :md="6" :sm="6" class="full-height for-wd" style="min-height: 700px; background:white;    border-right: 1px solid #f3f3f3;">

        <el-card shadow="never" style="box-shadow: none; border:none">
          <el-row class="tracklist people-list-section">
            <el-card style="padding: 10px;">
              <el-date-picker @change="" end-placeholder="End date" range-separator="to" size="small" start-placeholder="Start date" type="daterange" v-model="range"/>
            </el-card>

            <div class="padding-2x" v-if="b_loading">
              <vcl-bullet-list></vcl-bullet-list>
            </div>
            <ul class="" style="min-height: 200px;" v-if="!b_loading">
              <li :class="{ active: selectedBooking && isSelected(booking) }" @click="selectBooking(booking)" v-for="(booking,index) in bookings">
                <div class="booking-item">
                  <span class="wd-service-name-a">{{ getServiceNames(booking) }}</span>
                  <span class="wd-service-date-a">{{ $moment(booking.service_date).format($date_format + " " + $time_format) }}</span>
                  <span class="wd-service-address-a">{{ booking.address.full_address }}</span>
                  <span style="color:red;" v-if="booking.forecasted"><el-tag class="forecasted-tag" type="primary">forecasted</el-tag></span>

                </div>
              </li>
            </ul>
          </el-row>
        </el-card>
      </el-col>

      <el-col :md="18" :sm="18" v-if="selectedBooking">
        <rating-form :booking.sync="selectedBooking" />
      </el-col>


    </el-row>
    <el-row>
      <el-col class="pagination-footer">
        <div class="cct">
          <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadBookings" background layout="total, prev, pager, next"></el-pagination>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
    import {VclBulletList, VclFacebook} from 'vue-content-loading';
    import RatingForm from "@/components/RatingForm";

    export default {
        components: {
            VclBulletList,
            VclFacebook,
            RatingForm
        },
        data: () => {
            return {
                selectedBooking: false,
                range: [],
                total_records: 0,
                page_size: 0,
                current_page: 0,
                bookings: [],
                b_loading: true,
                loading: true
            };
        },
        watch: {
            range(val) {
                this.loadBookings(1);
            }
        },
        created() {

        },
        mounted() {
            this.range = [
                this.$moment().format("YYYY-MM-DD"),
                this.$moment()
                    .add(1, "weeks")
                    .format("YYYY-MM-DD")
            ];
        },
        methods: {
            isSelected(booking) {
                return this.selectedBooking.id === booking.id;
            },
            selectBooking(booking) {
                this.selectedBooking = booking;
            },
            loadBookings(current_page) {
                this.selectedBooking = false;

                if (!current_page) current_page = this.current_page;

                let start_date = this.$moment(this.range[0])
                    .startOf("day")
                    .toISOString();
                let end_date = this.$moment(this.range[1] || this.range[0])
                    .endOf("day")
                    .toISOString();

                this.b_loading = true;
                this.loading = true;
                this.axios
                    .get("/bookings/schedule", {
                        params: {
                            from: start_date,
                            to: end_date,
                            type: "bookings",
                            page: current_page,
                            forecasted: false,
                            status: 'completed',
                            include: ['rating', 'team_assignments', 'account', 'service_details', 'address']
                        }
                    })
                    .then(res => {
                        this.bookings = res.data.data;
                        if (this.bookings.length > 0) {
                            this.selectedBooking = this.bookings[0];
                        }

                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .finally(_ => {
                        this.b_loading = false;
                        this.loading = false;
                    });
            },
            getServiceNames(booking) {
                let services = "";
                booking.service_details.forEach(srv => {
                    if (services == "") return (services += srv.name);
                    else return (services += "; " + srv.name);
                });

                return services;
            },
        }
    };
</script>

<style lang="scss">
</style>
