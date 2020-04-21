<template>
  <div>
    <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" appendToBody :visible.sync="showModal" @close="settingsRedirect" custom-class="fullscreen-modal-display" title="Company Settings & Policies">

      <div class="modal-body">

        <el-card style="box-shadow: 0 7px 14px 0 rgba(60,66,87, 0.12), 0 3px 6px 0 rgba(0,0,0, 0.12);">

        </el-card>


        <el-row :gutter="10" style="margin-bottom: 20px">
          <el-col :md="24" :sm="24" :xs="24">
            <el-card shadow="none">

              <el-row class="divider-3x">
                <el-col :md="24" :sm="24" :xs="24">
                  <h4 class="flex-row-center">
                     <span>Tips</span>
                    <i></i>
                  </h4>
                </el-col>
                <el-col :md="24" :sm="24" :xs="24">
                  <el-col :md="4" :sm="4">
                    <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.tips.enabled">Enable tips</el-checkbox>
                  </el-col>

                  <el-col :md="4" :sm="4">
                    <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.tips.allow_customer">Allow customer</el-checkbox>
                  </el-col>
                </el-col>
              </el-row>
              <el-row class="divider-3x">
                <el-col :md="12" :sm="12" :xs="24">
                  <h4 class="flex-row-center">
                     <span  >Location</span>
                  </h4>
                </el-col>
                <el-col :md="24" :sm="24" :xs="24">
                  <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.location.strict_location">Use strict locations</el-checkbox>
                </el-col>
              </el-row>

              <el-row class="divider-3x">
                <el-col :md="12" :sm="12" :xs="24">
                  <h4 class="flex-row-center">
                    <span>Frequency</span>
                  </h4>
                </el-col>
                <el-col :md="24" :sm="24" :xs="24">
                  <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.frequency.enabled">Enable frequencies</el-checkbox>
                  <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.frequency.recurring.exclude_first_booking">Exclude first booking in recurring frequencies</el-checkbox>
                </el-col>
              </el-row>

              <el-row class="divider-3x">
                <el-col :md="12" :sm="12" :xs="24">
                  <h4 class="flex-row-center">
                    <span>Booking</span>
                  </h4>
                </el-col>
              </el-row>

              <el-row style="margin-bottom: 20px">
                <el-col :md="4" :sm="4" :xs="24">
                  <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.booking.enable_fspay">Enable fspay</el-checkbox>
                </el-col>

                <el-col :md="4" :sm="4" :xs="24">
                  <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.booking.services.allow_multiple">Allow multiple services</el-checkbox>
                </el-col>

              </el-row>



              <el-row style="margin-bottom: 20px">
                <el-col :md="3" :sm="3" :xs="24">
                  <h4>Booking Duration</h4>
                  <el-radio-group v-model="curr_user.company.settings.booking.duration.enabled">
                    <el-radio :label="false">Disabled</el-radio>
                    <el-radio :label="true">Enabled</el-radio>
                  </el-radio-group>

                  <div v-if="curr_user.company.settings.booking.duration.enabled">
                    <el-col :md="24" :sm="24" :xs="24">
                      <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.booking.duration.update_availability_for_overlapped_booking"><span>Update my Availability when a Booking's duration overlaps into the next available spot</span></el-checkbox>
                      <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.booking.duration.prevent_closed_hrs"><span>Prevent a Booking from being created/rescheduled into a spot if it requires more time than is available for the spot, or if it will extend past business' closing time.</span></el-checkbox>
                    </el-col>
                  </div>
                </el-col>


                <el-col :md="24" :sm="24" :xs="24">
                  <el-col :md="4" :sm="4" :xs="24">
                    <h4>Late Booking Changes</h4>
                    <el-radio-group v-model="curr_user.company.settings.booking.policies.cancel_booking.enforce_period.hours">
                      <el-radio :label="24">Change by 5pm the day before the Booking</el-radio>
                      <el-radio :label="0">Set custom time</el-radio>
                    </el-radio-group>

                    <div v-if="curr_user.company.settings.booking.policies.cancel_booking.enforce_period.hours !== 24">
                      <el-input placeholder="24" type="number" v-model="curr_user.company.settings.booking.policies.cancel_booking.enforce_period.hours">
                        <span slot="append">hr(s)</span>
                      </el-input>
                    </div>
                  </el-col>
                </el-col>

              </el-row>


              <el-row style="margin-bottom: 20px">
                <el-col :md="12" :sm="12" :xs="24">
                  <h4>Bookings Outside of Normal Availability</h4>
                  <el-radio-group v-model="curr_user.company.settings.booking.outside_availability.count_against_availability">
                    <el-radio :label="true">Count them against my Availability (i.e. 9:15AM will count against your 8:00AM availability)</el-radio>
                    <el-radio :label="false">Don't count them against my Availability</el-radio>
                  </el-radio-group>
                </el-col>
              </el-row>


              <el-row style="margin-bottom: 20px">
                <el-col :md="12" :sm="12" :xs="24">
                  <h4>Invite Teams to a Booking</h4>

                  <el-col :md="2" :sm="2" :xs="24">
                    <el-radio-group v-model="curr_user.company.settings.booking.team_invite_to_booking.enabled">
                      <el-radio :label="false">Disabled</el-radio>
                      <el-radio :label="true">Enabled</el-radio>
                    </el-radio-group>

                    <div v-if="curr_user.company.settings.booking.team_invite_to_booking.enabled">
                      <el-col :md="24" :sm="24" :xs="24">
                        <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.booking.team_invite_to_booking.invite_available_teams">Automatically Invite all available teams when booking is created</el-checkbox>
                        <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.booking.team_invite_to_booking.automatically_approve_reject">Automatically send approved/rejected alerts to teams that replied to the invitation after teams are assigned to the Booking</el-checkbox>
                        <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.booking.team_invite_to_booking.prevent_from_replying">Prevent teams from replying to invitations AFTER the booking is already assigned</el-checkbox>
                        <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.booking.team_invite_to_booking.allow_to_add_bid">Allow Teams to add a Bid amount to their reply</el-checkbox>
                        <el-checkbox style="margin-bottom: 10px" v-model="curr_user.company.settings.booking.team_invite_to_booking.allow_to_add_comment">Allow Teams to add a Comment to their reply</el-checkbox>
                      </el-col>
                    </div>
                  </el-col>
                </el-col>
              </el-row>


              <el-row style="margin-bottom: 20px">
                <el-col :md="12" :sm="12" :xs="24">
                  <h4>Schedule Availability Mode</h4>

                  <el-col :md="4" :sm="4" :xs="24">
                    <el-radio-group v-model="curr_user.company.settings.booking.schedule_availability_mode.manual">
                      <el-radio :label="true">Manual</el-radio>
                      <el-radio :label="false">Based on Team Availability</el-radio>
                    </el-radio-group>

                    <div v-if="!curr_user.company.settings.booking.schedule_availability_mode.manual">
                      <el-col :md="24" :sm="24" :xs="24">
                        <el-checkbox-group v-model="curr_user.company.settings.booking.schedule_availability_mode.based_on_team_availability.who_can_change_team_availability">
                          <el-checkbox label="team">Only Team can change a team's availability</el-checkbox>
                          <el-checkbox label="staff">Only Staff can change a team's availability</el-checkbox>
                        </el-checkbox-group>
                      </el-col>
                    </div>
                  </el-col>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>


        <el-row :gutter="10" style="margin-bottom: 20px">
          <el-col :md="24" :sm="24" :xs="24">
            <el-card shadow="none">
              <el-row class="divider-3x">
                <el-col :md="12" :sm="12" :xs="24">
                  <h4 class="flex-row-center">
                    <el-image :src="require('@/assets/svgs/settings/Emails.svg')" style="width: 25px;"></el-image>
                    <span style="padding-left: 10px">Email</span>
                  </h4>
                </el-col>
                <el-col :md="24" :sm="24" :xs="24">

                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>

        <el-row>
          <el-button @click="saveSettings()" class="giftcard-submit-btn" pull-right round style="max-width: 200px" type="primary">
            <span>
              Save
            </span>
          </el-button>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    export default {
        name: "SettingsService",
        data() {
            return {
                showModal: false,
                curr_user: {},
                loading: false
            };
        },
        mounted() {
            this.showModal = true;
        },
        created() {
            this.loadSettings();
        },
        methods: {
            settingsRedirect() {
                this.$router.back()
            },

            loadSettings() {
                this.curr_user = this.$auth.user();
            },
            saveSettings() {
                this.loading = true;
                this.axios
                    .put("/companies/current/settings", this.curr_user.company.settings)
                    .then(res => {
                        this.$message.success("Policies successfully updated");
//                        this.$auth.fetch({
//                            success: () => {
//                            }
//                        });
                    })
                    .catch(err => {
                        this.$helpers.errorHandle("Oops! an error occurred while saving policies.");
                    })
                    .then(() => {
                        this.loading = false;
                    });


            }
        }
    };
</script>
<style lang="scss"></style>
