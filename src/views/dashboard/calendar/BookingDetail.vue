<template>
  <el-drawer :before-close="handleClose" :close-on-press-escape="true" :destroy-on-close="true" :modal="false" :visible.sync="drawer" @closed="closed" @opened="opened" custom-class="calendar-booking-details" direction="rtl" size="50%" title="Booking Details">
    <div v-loading="loading">
      <el-card style="min-height: 300px">
        <el-tabs v-if="booking" v-model="active_tab">
          <el-tab-pane label="Details" name="details">
            <el-row>
              <el-col class="customer-recurring">
                <div class="customer-details">
                  <el-avatar :src="booking.account.avatar"></el-avatar>
                  <div class="customer-details-name">
                    <label>{{ booking.account.fullname }}</label>
                    <label>{{ booking.address.full_address }}</label>
                  </div>
                </div>

                <div>
                  <label class="upper-cost" style="display:block;">Cost ${{ booking.charge.total_after_tax }}</label>
                  <el-tag effect="dark" size="small" type="">In Progress</el-tag>
                </div>
              </el-col>

              <el-col>
                <el-divider></el-divider>
                <transition name="fade">
                  <div v-if="!assign_team_drawer">
                    <el-button @click="$router.push({ name: 'dashboard_booking_edit', params: { id: booking.id }})"
                               plain
                               round size="mini" type="primary" v-if="$can('manage', 'manage_appointment')">Edit Booking
                    </el-button>
                    <el-button @click="assign_team_drawer = true"
                               plain round size="mini" type="warning"
                               v-if="$can('manage', 'manage_team')">Assign Team
                    </el-button>


                    <el-button disabled plain round size="mini" type="warning">Assign Checklist</el-button>
                    <el-button disabled plain round size="mini" type="warning">Charge Booking</el-button>

                    <el-button plain round size="mini" type="danger" v-if="$can('manage', 'manage_appointment')">Cancel Booking
                    </el-button>
                  </div>
                </transition>

                <transition name="slide-fade" v-if="$can('manage', 'manage_team')">
                  <assign-team :booking="booking" @closed="handleAssignTeamClose" v-if="assign_team_drawer"></assign-team>
                </transition>

                <div v-if="!assign_team_drawer">
                  <el-divider v-if="booking.team_assignments && booking.team_assignments.length > 0">Teams Assigned</el-divider>

                  <el-row :gutter="10" class="booking-teams-assignment " style="background : #f3f3f3; padding: 10px" v-if="booking.team_assignments && booking.team_assignments.length > 0">
                    <el-col :key="index" :sm="8" v-for="(assigned, index) in [booking.team_assignments]">
                      <el-card class="team-card" shadow="always">
                        <el-avatar :size="48"></el-avatar>
                        <div class="team-content">
                          <span
                          ><strong>{{ getTeamName(assigned.teamId) }}</strong></span
                          >
                          <el-rate  v-model="assigned.rate"></el-rate>
                          <span v-if="assigned.pay_rate_type === 'percent'">Wage: {{ $currency }}{{ assigned.pay_rate + "%" }} </span>
                          <span v-if="assigned.pay_rate_type === 'hourly'">Wage: {{ $currency }}{{ assigned.pay_rate + "/hr" }} </span>
                        </div>
                      </el-card>
                    </el-col>
                  </el-row>

                  <el-divider></el-divider>
                  <booking-summary :booking-model="booking"></booking-summary>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Billing"
                       name="billing" v-if="$can('manage', 'manage_appointment')">
            <account-cards :account.sync="booking.account" v-model="selected_card"></account-cards>
          </el-tab-pane>
          <el-tab-pane label="Photos" name="photos">
            <booking-photos :booking_id="booking.id"></booking-photos>
          </el-tab-pane>
          <el-tab-pane label="Notes" name="notes">
            <label>Customer Notes</label>
            <p>{{ booking.customer_notes || "No notes from the customer" }}</p>
            <label>Staff Notes</label>
            <p>{{ booking.staff_notes }}</p>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </el-drawer>
</template>

<script>
    import AssignTeam from "../../../components/AssignTeam";
    import BookingSummary from "../../../components/BookingSummary";
    import BookingPhotos from "../../../components/BookingPhotos";
    import AccountCards from "../../../components/AccountCards";

    export default {
        props: ["teams"],
        components: {
            BookingSummary,
            AssignTeam,
            BookingPhotos,
            AccountCards
        },
        data() {
            return {
                drawer: false,
                booking: false,
                loading: true,
                active_tab: "details",
                assign_team_drawer: false,
                selected_card: ""
            };
        },
        watch: {
            open_drawer(val) {
            }
        },
        created() {
            //this status
            this.$root.$on("booking:drawer:details", this.openDrawer);
        },
        beforeDestroy() {
        },
        methods: {
            openDrawer(booking_id) {
                this.booking_id = booking_id;
                this.drawer = true;
            },
            handleClose(done) {
                this.booking_id = undefined;
                done();
            },
            handleAssignTeamClose(done) {
                this.assign_team_drawer = false;
                this.opened();
            },
            closed() {
                this.booking = false;
                this.$emit("closed-details");
            },
            opened() {
                this.loading = true;
                this.axios
                    .get("/bookings/" + this.booking_id, {
                        params: {
                            filter: {
                                include: [
                                  'account',
                                  'frequency',
                                  'address',
                                  {"service_details": "pricing_variables"},
                                  'charge',
                                  "workdiary",
                                  {"assigned_checklists": "tasks"},
                                  "team_assignments"
                                ]
                            }
                        }
                    })
                    .then(res => {
                        this.booking = res.data;
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            getTeamName(teamId) {
                let team = this.teams.find(tt => {
                    return tt.id === teamId;
                });
                if (team) return team.name;

                return "";
            },
            getTeamRating(teamId) {
                let team = this.teams.find(tt => {
                    return tt.id === teamId;
                });
                if (team) return team.rate;

                return "";
            }
        }
    };
</script>

<style lang="scss">
  .upper-cost {
    color: #fb837f;
    font-size: 16px;
    font-weight: bold;
  }
</style>
