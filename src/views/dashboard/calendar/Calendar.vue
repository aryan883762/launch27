<template>
  <div class="app-section calendar" shadow="never" style="background :none;">
    <el-row class="full-width bg-white" style="margin-bottom: 10px;">
      <template v-if="$can('manage', 'role_admin')">
        <el-radio-group class="options" v-model="active_tab">
          <el-radio-button label="dashboard_calendar_spots">
            Booking Spot
          </el-radio-button>
          <el-radio-button label="dashboard_calendar_customers">
            Customer
          </el-radio-button>
          <el-radio-button label="dashboard_calendar_teams">
            Teams
          </el-radio-button>
          <el-radio-button label="dashboard_calendar_list">
            List
          </el-radio-button>
        </el-radio-group>
      </template>
      <template v-if="$can('manage', 'role_team')">
        <el-radio-group class="options" v-model="active_tab">
          <el-radio-button label="team_bookings_spot">
            Booking Spot
          </el-radio-button>
          <el-radio-button label="team_bookings_list">
            List
          </el-radio-button>
        </el-radio-group>
      </template>
      <template v-if="$can('manage', 'role_customer')">
        <el-radio-group class="options" v-model="active_tab">
          <el-radio-button label="customer_bookings_spot">
            Booking Spot
          </el-radio-button>
          <el-radio-button label="customer_bookings_list">
            List
          </el-radio-button>
        </el-radio-group>
      </template>
    </el-row>

    <el-card class="calendar-card" style="border:none; margin-bottom: 10px;">
      <div class="flex-row calendar-options-bar">
        <div class="main-filters" v-if="false">
          <el-select class="filter small no-border pull-right" placeholder="Service" v-model="filter">
            <el-option value="test">
              Test
            </el-option>
          </el-select>

          <el-select class="filter small no-border pull-right" placeholder="Location" v-model="filter">
            <el-option value="test">
              Test
            </el-option>
          </el-select>

          <el-select class="filter small no-border pull-right" placeholder="Teams" v-model="filter">
            <el-option value="test">
              Test
            </el-option>
          </el-select>
        </div>


        <div class="main-filters">
          <el-date-picker @change="calendarChange"
                          end-placeholder="End date"
                          range-separator="to"
                          size="small"
                          start-placeholder="Start date"
                          type="daterange" v-model="range" value-format="yyyy-MM-dd"/>
        </div>

        <div class="main-filters">
          <el-radio-group size="mini" v-model="calendar_view">
            <el-radio-button @click.native="changeView('month')" label="month">
              Month
            </el-radio-button>
            <el-radio-button @click.native="changeView('week')" label="week">
              Week
            </el-radio-button>
            <el-radio-button @click.native="changeView('day')" label="day">
              Day
            </el-radio-button>
          </el-radio-group>
        </div>

        <div v-if="$can('manage', 'manage_appointment')">
          <el-button @click="$router.push({ name: booking_new_route_name })" icon="el-icon-plus" round size="mini" type="primary">Add Appointment</el-button>
          <el-button @click="$router.push({path: '/dashboard/settings/services'})"
                      icon="el-icon-plus" size="mini" type="text" v-if="$can('manage', 'manage_services')">Add Service</el-button>
          <el-button disabled icon="el-icon-edit" size="mini" type="text">Edit</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="10">
      <el-col :md="18" :sm="18" style="position:relative;">
        <el-alert title="Drag an appointment fro right to this calendar" type="warning" v-if="false"/>

        <router-view></router-view>

        <el-row class="calendar-footer">
          <el-col :md="6" :sm="6" :xs="12" class="first">
            <span class="stats-number _first">{{ bookings.length }}</span>
            <label>Total Bookings</label>
          </el-col>

          <el-col :md="6" :sm="6" :xs="12" class="second">
            <span class="stats-number _second">0</span>
            <label>Total Hours</label>
          </el-col>

          <el-col :md="6" :sm="6" :xs="12" class="third">
            <span class="stats-number _third">0</span>
            <label>Total Availability</label>
          </el-col>

          <el-col :md="6" :sm="6" :xs="12" class="fourth">
            <span class="stats-number _fourth">0</span>
            <label>Total Revenue</label>
          </el-col>
        </el-row>
      </el-col>

      <el-col :md="6" :sm="6">
        <el-card class="booking-list" shadow="hover" style="padding: 0px 0px;border:none;">
          <el-card style="margin-bottom:10px;">
            <div class="flex-row" style="padding: 10px 10px 0 10px;">
              <h5>Appointments ({{bookings.length}})</h5>
              <el-select size="mini" style="width: 100px;" v-model="filter">
                <el-option value="active">Active</el-option>
                <el-option value="cancelled">Cancelled</el-option>
                <el-option value="completed">Completed</el-option>
              </el-select>
            </div>
          </el-card>

          <el-row class="" style="min-height: 691px" v-loading="b_loading">
            <el-col @click.native="showDetails(booking)" v-for="(booking, bookingIndex) in bookings" :key="bookingIndex">
              <el-avatar :size="32" v-if="booking.account.avatar" :src="booking.account.avatar" class="pull-left"></el-avatar>
              <avatar v-if="!booking.account.avatar" :size="32" :username="booking.account.fullname" color="white" class="pull-left" style="margin-right: 5px;"></avatar>

              <div class="booking-details">
                <label class="customer">{{ booking.account.fullname }}</label>
                <span class="service-name"> {{ booking.service_details && booking.service_details.length > 0 ? booking.service_details[0].name : "--" }} </span>
                <small class="address">{{ booking.address.street }} {{ booking.address.city }} {{ booking.address.state }} {{ booking.address.zip }}</small>
                <p class="forecasted" v-if="booking.forecasted">forecasted</p>
              </div>
            </el-col>

          </el-row>
          <el-pagination
                  :current-page.sync="current_page"
            :page-size="page_size"
            :total="total_records"
            @current-change="dateChanged"
            background
            layout="total, prev, pager, next">
          </el-pagination>
        </el-card>
      </el-col>
    </el-row>


  </div>
</template>

<script>
    import Avatar from "vue-avatar";
    import BookingDetail from "./BookingDetail";

    export default {
        components: {
            Avatar,
            BookingDetail
        },
        data: () => {
            return {
                filter: "active",
                calendar_view: "month",
                filter_date: "",
                active_tab: "",
                bookings: [],
                selectedBookingId: "",
                open_drawer: false,
                teams: [],
                range: [],
                b_loading: false,
                total_records: 0,
                page_size: 0,
                current_page: 1
            };
        },
        watch: {
            active_tab(val) {
                this.$router.push({name: val, query: {from: this.range[0], to: this.range[1]}});
            },
            calendar_view(val) {
            },
            range: {
                deep: true,
                handler(val) {
                    //this.$root.$emit("calendar:range:update", 1)
                    this.$router.push({name: this.active_tab, query: {from: val[0], to: val[1]}});
                }
            },
            '$route'(to, from) {
                this.active_tab = to.name;
                this.$root.$emit("calendar:range:update", 1)
            }
        },

        computed: {
          booking_new_route_name() {
              if(this.$can('manage', 'role_admin')){
                return 'dashboard_booking_new';
              } else {
                return 'customer_bookings_new';
              }
          }
        },

        created() {
            // this.$router.push({ path: "/dashboard/getting-started" });
            this.$events.addListener("calender-changed-view", this.calendarChangedView);
            this.$root.$on('calendar:range:update', this.dateChanged)
            this.$root.$on('calendar:view:update', this.viewChanged)

            if (this.$can('manage', 'manage_team')) {
                this.axios.get("/companies/current/teams").then(res => {
                    this.teams = res.data;
                });
            }

            if (this.$route.query && this.$route.query.from && this.$route.query.to)
                this.range = [this.$moment(this.$route.query.from).format('YYYY-MM-DD'), this.$moment(this.$route.query.to).add(1, 'months').format('YYYY-MM-DD')]
            else
                this.range = [this.$moment().format('YYYY-MM-DD'), this.$moment().add(1, 'months').format('YYYY-MM-DD')];

            this.$root.$emit("calendar:range:update", 1)
        },
        beforeDestroy() {
            this.$events.removeListener("calendar-changed-view", this.calendarChangedView);
            this.$root.$off('calendar:range:update', this.dateChanged)
            this.$root.$off('calendar:view:update', this.viewChanged)
        },
        mounted() {

        },

        methods: {
            viewChanged(start, end) {
                console.log(start, end)
                /* this.range = [this.$moment(start).utc().format('YYYY-MM-DD'),
                     this.$moment(end).utc().format('YYYY-MM-DD')
                 ]*/
            },

            calendarChange(val) {
                this.$root.$emit('calendar:range:update-manual', val)
            },

            dateChanged(current_page) {

                let start_date = this.$moment(this.range[0]).startOf('day').toISOString()
                let end_date = this.$moment((this.range[1] || this.range[0])).endOf('day').toISOString()

                this.$router.replace({name: this.active_tab, query: {from: this.range[0], to: this.range[1]}});

                this.b_loading = true
                this.axios
                    .get("/bookings/schedule", {
                        params: {
                            from: start_date,
                            to: end_date,
                            type: 'bookings',
                            page: current_page
                        }
                    })
                    .then(res => {
                        this.bookings = res.data.data;
                        this.total_records = res.data.meta.totalItemCount
                        this.page_size = res.data.meta.itemsPerPage
                    })
                    .catch()
                    .finally(_ => {
                        this.b_loading = false
                    })
            },

            addAppointment() {
            },

            calendarChangedView(view) {
                this.calendar_view = view;
            },

            changeView(view) {
                this.$events.emitEvent("calendar-view-change", [view]);
            },

            showDetails(booking) {
                let routeName = 'dashboard_booking_view';
                if (this.$can('manage', 'role_team')) {
                    routeName = 'team_bookings_view';
                } else if (this.$can('manage', 'role_customer')) {
                    routeName = 'customer_bookings_view';
                }
                this.$router.push({name: routeName, params: {id: booking.id, service_date: booking.service_date}})
            },
            detailsClosed() {
                this.open_drawer = false;
            }
        }
    };
</script>

<style lang="scss">
  .app-section.calendar {
    padding: 0px;
    border: none;

    .el-range-editor--small.el-input__inner {
      border-radius: 25px;
    }


    .calendar-options-bar {
      padding: 20px 15px;
    }

    .el-radio-group {
      &.options {
        .el-radio-button {
          .el-radio-button__inner {
            border: none;
            font-size: 12px;
            padding: 20px 30px;
            text-transform: uppercase;
            border-radius: 0px;
            border-bottom: 2px solid white;
          }

          &.is-active {
            .el-radio-button__inner {
              background: white;
              color: $launch-primary-color;
              box-shadow: none;
              border-bottom: 2px solid $launch-primary-color;
            }
          }
        }
      }
    }

    .el-alert--warning.is-light {
      background-color: #fdf6ec;
      color: #e6a23c;
      border: 1px dashed black;
      padding: 10px;
      box-sizing: border-box;
      display: block;
      margin: 10px auto;
    }

    .booking-list {
      margin-bottom: 20px;
      display: block;
      padding: 0px;
      overflow-y: auto;
      min-height: 695px;

      p.forecasted {
        margin: 0px;
        padding: 0px;
        color: red;
        font-size: 10px;
        line-height: 1;
      }

      .el-col {
        margin-bottom: 0px;
        padding: 5px 10px;

        &:hover {
          background: #f3f3f3;
          cursor: pointer;
        }

        span {
          display: block;
        }

        .el-avatar {
          float: left;
          margin-right: 10px;
        }

        .booking-details {
          width: calc(100% - 80px);
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .customer {
          font-weight: bold;
        }

        .address {
          font-size: 11px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .main-filters {
      .el-radio-group {
        border: none;
        padding: 2px;
        //border-radius: 25px;

        .el-radio-button {
          font-size: 12px;

          .el-radio-button__inner {
            border: none;
          }

          &.is-active {
            .el-radio-button__inner {
              //border-radius: 25px !important;
            }
          }
        }
      }

      .el-radio-button:first-child .el-radio-button__inner {
        //border-radius: 25px 0 0 25px;
      }

      .el-radio-button:last-child .el-radio-button__inner {
        //border-radius: 0 25px 25px 0;
      }

      .filter {
        margin-right: 10px;
      }
    }

    .appointments {
      min-height: 500px;
    }

    .border-left {
      box-shadow: -2px 0px 5px 1px #eeeeee;
    }

    .el-card.calendar-card,
    .el-card.booking-list {
      border: none;

      .el-card__body {
        padding: 0px;
        border: none;
      }
    }

    .calendar-footer {
      padding: 20px;
      background: white;
      box-shadow: 0px -2px 2px -1px #f3f3f3;
      /* position: absolute;
               bottom: 0;
               right: 0;
               left: 0;*/

      span,
      label {
        display: block;
      }

      span {
        font-size: 26px;
        font-weight: 500;

        &.stats-number {
          &._first {
            color: #22c3a4;
          }

          &._second {
            color: #0fc8ff;
          }

          &._third {
            color: #ff3f73;
          }

          &._fourth {
            color: #ffd514;
          }
        }
      }

      label {
        font-weight: 300;
      }

      .el-col {
        position: relative;

        &.first,
        &.second,
        &.third {
          &:after {
            content: "";
            height: 100%;
            position: absolute;
            top: 0;
            bottom: 0px;
            width: 1px;
            border-right: 1px solid #f3f3f3;
            right: 16px;
          }
        }
      }
    }
  }
</style>
