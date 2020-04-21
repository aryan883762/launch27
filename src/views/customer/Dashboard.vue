<template>
  <div class="app-section dashboard customer-dashboard">
    <el-row class="setting-row padding-2x" :gutter="10">
      <el-col :sm="6" :xs="12" :md="6">
        <h3>Welcome, {{curr_user.first_name}}!</h3>
      </el-col>
    </el-row>

    <el-row class="setting-row padding-2x" :gutter="10">
      <el-card class="cd-one-line-card">
        <el-col :sm="7" :xs="12" :md="7">
          <h5 class="flex-row-center top-summary">
            <img svg-inline src="@/assets/svgs/cus-dashboard/next-appointment.svg" />
            Next Appointment: {{ nextBooking }}
          </h5>
        </el-col>
        <el-col :sm="7" :xs="12" :md="7">
          <h5 class="flex-row-center top-summary">
            <img svg-inline src="@/assets/svgs/cus-dashboard/team.svg" />
            Team: {{ nextBookingTeam }}
          </h5>
        </el-col>
        <el-col :sm="5" :xs="12" :md="5">
          <h5 class="flex-row-center top-summary">
            <img svg-inline src="@/assets/svgs/cus-dashboard/credit-balance.svg" />
            Credit Balance: {{ $currency }}{{ wallet }}
          </h5>
        </el-col>
        <el-col :sm="5" :xs="12" :md="5">
          <h5 class="flex-row-center top-summary">
            <img svg-inline src="@/assets/svgs/cus-dashboard/gift-card-balance.svg" />
            Gift Card Balance: {{ $currency }}{{balance}}
          </h5>
        </el-col>
      </el-card>
    </el-row>

    <el-card class="customer-dashboard-row padding-2x divider-3x" style="margin: 15px">
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :sm="6" :xs="12" :md="6">
          <router-link  :to="{name: 'customer_bookings_list'}">
            <el-card disabled class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/booking.svg" />
              <h4>Booking</h4>
              <p>View and manage your bookings</p>
            </el-card>
          </router-link>
        </el-col>

        <el-col :sm="6" :xs="12" :md="6">
          <router-link to="/customer/account/cards">
            <el-card class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/credit-cards.svg" />
              <h4>Credit Cards</h4>
              <p>Update account, payment history and plan history and</p>
            </el-card>
          </router-link>
        </el-col>

        <el-col v-if="false" :sm="6" :xs="12" :md="6">
          <router-link to="">
            <el-card class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/messages.svg" />
              <h4>Messages</h4>
              <p>View and  send messages between teams</p>
            </el-card>
          </router-link>
        </el-col>

        <el-col :sm="6" :xs="12" :md="6">
          <router-link :to="{ name: 'customer_teams' }">
            <el-card class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/teams.svg" />
              <h4>Teams</h4>
              <p>View and manage your preferred teams</p>
            </el-card>
          </router-link>
        </el-col>

        <el-col :sm="6" :xs="12" :md="6">
          <router-link :to="{ name: 'customer_checklists' }">
            <el-card disabled class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/checklist.svg" />
              <h4>Checklists</h4>
              <p>View and manage your checklists</p>
            </el-card>
          </router-link>
        </el-col>

      </el-row>
      <el-row :gutter="20" style="margin-bottom: 20px">

        <el-col :sm="6" :xs="12" :md="6">
          <router-link :to="{ name: 'customer_photos'}">
            <el-card class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/profile.svg" />
              <h4>Photos</h4>
              <p>View and manage your booking photos here</p>
            </el-card>
          </router-link>
        </el-col>

        <el-col :sm="6" :xs="12" :md="6">
          <router-link :to="{ name: 'customer_apps_giftcard_create' }">
            <el-card class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/gift-cards.svg" />
              <h4>Gift Cards</h4>
              <p>View, create and manage gift cards</p>
            </el-card>
          </router-link>
        </el-col>

        <el-col :sm="6" :xs="12" :md="6" v-if="this.$can('manage', 'plan_customer_reward')">
          <router-link :to="{ name: 'customer_apps_referral' }">
            <el-card class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/gift-cards.svg" />
              <h4>Campaigns</h4>
              <p>View, create and manage your campaigns</p>
            </el-card>
          </router-link>
        </el-col>

        <el-col :sm="6" :xs="12" :md="6">
          <router-link :to="{ name: 'customer_profile' }">
            <el-card class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/profile.svg" />
              <h4>Profile</h4>
              <p>Update account, payment history and plan history and</p>
            </el-card>
          </router-link>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-bottom: 20px">

        <el-col v-if="false" :sm="6" :xs="12" :md="6">
          <router-link :to="{ name: 'customer_ratings' }">
            <el-card class="flex-row-center text-center" shadow="always">
              <img svg-inline src="@/assets/svgs/cus-dashboard/profile.svg" />
              <h4>Ratings</h4>
              <p>View and rate teams and services here</p>
            </el-card>
          </router-link>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  components: {},
  data: () => {
    return {
        curr_user:{},
        balance: 0.00,
        wallet: 0.00,
        schedule: [],
        next_team: "None",
    };
  },
  computed: {
    nextBooking() {
      if(this.schedule.length > 0){
        return this.$moment(this.schedule[0].start_event).format(this.$date_format + ', ' + this.$time_format);
      } else {
        return 'None';
      }
    },
    nextBookingTeam(){
        let next_booking_team = '';
        let all_teams = [];
        if(this.schedule.length > 0){
            all_teams = this.schedule[0].team_assignments;

            if(all_teams.length >1){
                all_teams.forEach((team, i, arr) =>{
                    if(i === arr.length - 1){
                        next_booking_team += team.team.name
                    } else {
                        next_booking_team += team.team.name + ', '
                    }
                });
                return next_booking_team;
            }
            return all_teams[0] ? all_teams[0].team.name : "None";
        }
        return 'None';
    }
  },
  created() {
      this.curr_user = this.$auth.user();
  },
  mounted(){
      this.loadGiftCards();
      this.loadSchedules();
      this.loadWallet();
  },
  methods: {
    loadWallet(){
      this.axios.get('/accounts/me/wallet')
      .then(res=>{
        this.wallet = res.data.amount;
      })
      .catch(err => {
        console.log(err);
      })
    },
    loadGiftCards() {
        // looking for the user's giftcard that are for the current company
        this.axios
            .get('/companies/current/giftCards', {params: {filter: {where: {recipientAccountId: this.$auth.user().id}}}})
            .then(res => {
                res.data.forEach(gift_card => {
                    this.balance += gift_card.balance
                });
            })
            .then(() => {
                this.loading = false;
            });
    },
    loadSchedules() {
      let startDate = this.$moment().toISOString();
      let endDate = this.$moment().endOf("month").toISOString();

      this.axios.get("/bookings/schedule", {
        params: {
          from: startDate,
          to: endDate,
          type: 'bookings',
          forecasted: true
        }
      })
      .then(res => {
        this.schedule = res.data;
        this.loadNextTeam();
      });
    },
    loadNextTeam() {
      // /bookings/:id/team_assignment return error 404 if no team is assigned
      if(this.schedule.length > 0 && this.schedule[0].id){
        this.axios.get("/bookings/" + this.schedule[0].id)
        .then(res => {
          if(res.data && res.data.team_assignments && res.data.team_assignments.length > 0 && res.data.team_assignments[0].team){
            this.next_team = res.data.team_assignments[0].team.name;
          }
        });
      }
    }
  }
};
</script>

<style lang="scss">
.customer-dashboard {
  .cd-one-line-card {
    .el-card__body {
      min-height: 40px !important;
    }
  }

  .el-card {
    height: auto !important;
  }

  .customer-dashboard-row {
    background: none;
  }
}
</style>
