<template>
  <div>
    <el-card class="calendar-section-list">

      <vcl-table v-if="b_loading"></vcl-table>
      <el-timeline v-if="!b_loading">
        <el-timeline-item :key="index" :timestamp="$moment(booking.service_date).format($date_format + ' ' + $time_format)" placement="top" v-for="(booking, index) in schedule">
          <div class="charge-headline">
            <i class="forecasted" v-if="booking.forecasted">Forecasted recurring - {{booking.frequency.name}}</i>
          </div>
          <el-card :body-style="{padding: '10px'}" :class="{forecasted: booking.forecasted}" class="charge-card" shadow="hover">
            <el-row :gutter="10">
              <el-col :sm="8">
                <el-checkbox :true-label="booking.id" v-if="false" v-model="group_select[index]"></el-checkbox>
                <label
                ><strong>{{ booking.account.first_name }} {{ booking.account.last_name }}</strong></label
                >
                <small>{{ booking.address.street }} {{ booking.address.city }} {{ booking.address.state }} {{ booking.address.zip }}</small>
              </el-col>

              <el-col :sm="4">
                <small>Pending</small>
              </el-col>

              <el-col :sm="8">
                <!--<div v-if="!booking.team_assignment">
                  <small style="color:red">No Worker Assigned</small>
                  <el-button @click="assignTeam(booking)"
                             size="mini" type="text" v-if="$can('manage', 'manage_team')">Assign a team
                  </el-button>
                </div>
                <div v-if="booking.team_assignment">
                  <el-avatar :size="32" :src="booking.account.avatar" class="pull-left" style="margin-right: 5px;"></el-avatar>
                  <small class="team-detail-name">{{ booking.team_assignment.team.name }}</small>
                </div>-->
              </el-col>
              <el-col :sm="4" class="action-box" v-if="booking.charge">
                <small><strong>{{ $currency }} {{ booking.charge.total_after_tax }}</strong></small>

                <span @click="showDetails(booking)" class="action-btn">
                    <i class="el-icon-arrow-right"></i>
                </span>

              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>


    </el-card>
    <el-row>
      <el-col class="pagination-footer">
        <div class="cct">
          <el-pagination
            :current-page.sync="current_page"
            :page-size="page_size"
            :total="total_records"
            @current-change="loadSchedule"
            background
            layout="total, prev, pager, next">
          </el-pagination>
        </div>

      </el-col>
    </el-row>
  </div>
</template>

<script>
    import {VclTable} from 'vue-content-loading'

    export default {
        components: {
            VclTable
        },
        data() {
            return {
                schedule: [],
                temp_rating: 3,
                group_select: [],
                selected_booking: false,
                show_drawer: false,
                b_loading: true,
                range: [],
                total_records: 0,
                page_size: 0,
                current_page: 1
            };
        },

        created() {
            console.log('created')
            this.$root.$on('calendar:range:update', this.dateChanged)
            if (this.$route.query.from && this.$route.query.to) {
                this.dateChanged([this.$route.query.from, this.$route.query.to])
            }
        },
        watch: {
            '$route'(val) {
                this.dateChanged([this.$route.query.from, this.$route.query.to])
            }
        },
        beforeDestroy() {
            this.$root.$off('calendar:range:update', this.dateChanged)
        },
        mounted() {

        },

        methods: {
            dateChanged(range) {

                this.range = range
                this.loadSchedule(this.current_page)

            },
            loadSchedule(current_page) {

                if (!current_page) current_page = this.current_page

                let start_date = this.$moment(this.range[0]).startOf('day').toISOString()
                let end_date = this.$moment((this.range[1] || this.range[0])).endOf('day').toISOString()

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
                        this.schedule = res.data.data;
                        this.total_records = res.data.meta.totalItemCount
                        this.page_size = res.data.meta.itemsPerPage
                    })
                    .catch()
                    .finally(_ => {
                        this.b_loading = false
                    })
            },
            assignTeam(booking) {
                //this.$root.$emit("booking:drawer:details", booking.id);
                let routeName = 'dashboard_booking_view';
                if (this.$can('manage', 'role_team')) {
                    routeName = 'team_bookings_view';
                }
                this.$router.push({name: routeName, params: {id: booking.id, service_date: booking.service_date}, query: {action: 'assign_team'}})

            },
            getDetails(booking) {
                this.$root.$emit("booking:drawer:details", booking.id);
            },

            showDetails(booking) {
                let routeName = 'dashboard_booking_view';
                if (this.$can('manage', 'role_team')) {
                    routeName = 'team_bookings_view';
                } else if (this.$can('manage', 'role_customer')) {
                    routeName = 'customer_bookings_view';
                }
                this.$router.push({name: routeName, params: {id: booking.id, service_date: booking.service_date}})
            }
        }
    };
</script>

<style lang="scss">
  .calendar-section-list {
    .el-timeline {
      padding: 0px;

      .el-timeline-item__tail {
        position: absolute;
        left: 4px;
        height: 100%;
        border-left: 1px dashed $launch-primary-color;
      }

      .team-detail-name {
        height: 35px;
        display: inline-block;
        line-height: 35px;
        font-weight: bold;
      }

      .el-card {
        cursor: pointer;
      }

      .el-timeline-item__node {
        background-color: $launch-primary-color;
      }

      .charge-card {
        small {
          display: block;
        }

        &.forecasted {
          background: #f3f3f3;
        }
      }

      .charge-headline {
        i {
          font-style: normal;
          font-size: 11px;
          font-weight: bold;

          &.paid {
            color: green;
          }

          &.unpaid {
            color: red;
          }


          &.forecasted {
            color: brown;
          }
        }
      }

      .action-box {
        position: relative;

        .action-button {
          position: absolute;
          right: 10px;
          top: 10px;
        }

        .action-btn {
          position: absolute;
          right: -17px;
          top: -20px;
          height: 79px;
          width: 43px;
          background: #f3f3f3;
          line-height: 79px;
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;

          &:active {
            background: gray;
          }
        }
      }
    }

    .el-divider--vertical {
      display: inline-block;
      width: 1px;
      height: 4em;
      margin: 0 8px;
      vertical-align: middle;
      position: relative;

      &.divider-mini {
        height: 1em;
      }
    }

    .el-range-editor--small.el-input__inner {
      border-radius: 25px;
    }

    .el-range-separator {
      width: 20px;
      color: gray;
    }

    .to {
      height: 35px;
      line-height: 35px;
      display: inline-block;
      width: 25px;
      color: gray;
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


    .appointments {
      min-height: 500px;
    }

    .border-left {
      box-shadow: -2px 0px 5px 1px #eeeeee;
    }

    .charge-item {
      span {
        display: block;
        font-size: 11px;
      }
    }

  }
</style>
