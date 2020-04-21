<template>
  <el-card
    class="app-section-rating"
    style="min-height: 500px; box-shadow:none;"
    v-loading="loading && settingsLoading">
    <template v-if="!ratingData && ratingDatePassed">
        <h2 class="text" style="margin-top: 50px;">
        This booking can't be rated anymore
        </h2>
    </template>
  <template v-else-if="bookingData && bookingData.team_assignments && bookingData.team_assignments.length">
    <h1>Thank you!</h1>
    <h2 class="text">
      Your service on {{moment(bookingData.service_date).format("Do, MMM hh:mm a")}} was completed
      <br />by
      <ul style="list-style: none;">
        <li style="font-size: 16px;" v-for="assignment in bookingData.team_assignments">
          <span v-if="assignment.team_model === 'team'">{{assignment.team.name}},</span>
          <span v-if="assignment.team_model === 'account'">{{assignment.team.fullname}},</span>
        </li>
      </ul>
    </h2>

    <template v-if="ratingData && !$auth.check()">
      <div style="margin: 50px;">
        <p>Your Feedback Was Submitted!</p>
      </div>
    </template>
    <template v-else-if="ratingData && $auth.check()">
      <div style="margin: 50px;">
        <p>Your Feedback Was Submitted!</p>
      </div>

      <el-rate disabled allow-half v-model="ratingData.rating"></el-rate>
      <div>
        <small>{{ ratingData.feedback }}</small>
      </div>
      
    </template>
    <template v-else>
      <div style="margin: 50px;">
        <p>Your Feedback Is Important to Us</p>
        <small>Let us know how we did!</small>
      </div>

      <el-rate allow-half v-model="rating"></el-rate>

      <el-input
        :rows="7"
        placeholder="We would appreciate your feedback"
        type="textarea"
        v-model="feedback"
      ></el-input>

      <el-row>
        <el-col style="margin: 40px auto;">
          <el-button
            @click="saveRating"
            round
            style="padding: 20px; width: 300px; border-radius: 40px/50px; font-size: 20px;"
            type="success"
          >Submit your feedback</el-button>
        </el-col>
      </el-row>
    </template>
  </template>
  <template v-else>
    <h2 class="text" style="margin-top: 50px;">
      This booking can't be rated at this time
    </h2>
  </template>
  <el-dialog title="Company Review" :visible.sync="showRedirectDialog" width="30%"  append-to-body center>
        <span style="font-size:1.5em;">Kindly leave us a review</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="small" @click="loadExternalReview()" round>Ok</el-button>
        </span>
      </el-dialog>
  </el-card>
</template>
<script>
import moment from "moment";

export default {
  name: "rating-form",
  props: {
    bookingId: {
      type: String
    },
    booking: {
      type: Object
    }
  },

  data() {
    return {
      moment: moment,
      loading: false,
      settingsLoading: false,
      rating: 0,
      feedback: "",
      bookingData: false,
      ratingData: false,
      reviewData: false,
      showRedirectDialog: false,
      ratingDateLimit: false
    };
  },

  watch: {
    booking(val) {
      this.setupBooking();
    },
    bookingId(val) {
      this.setupBooking();
    }
  },

  mounted() {
    this.setupBooking();
    this.loadCompanySettings();
  },

  computed:{
      ratingDatePassed() {
          if (this.ratingDateLimit && this.bookingData) {
              let serviceDate = this.$moment(this.bookingData.service_date).startOf('day');
              return this.ratingDateLimit.isSameOrAfter(serviceDate);
          }
          return false;
      }
  },

  methods: {
    setupBooking() {
      if (this.bookingId) {
        this.getBooking();
      } else if (this.booking) {
        this.bookingData = this.booking;
        this.fetchReview();
        if (this.bookingData.rating) {
          this.ratingData = this.bookingData.rating;
        } else {
          this.ratingData = false;
        }
      }

      this.rating = 0;
      this.feedback = "";
    },
    getBooking() {
      this.loading = true;
      this.axios
        .get("/bookings/" + this.bookingId, {
          params: {
            filter: {
              include: [
                 {team_assignments: "team"},
                 "rating"
              ]
            }
          }
        })
        .then(res => {
          this.bookingData = res.data;
          this.fetchReview();
          if (this.bookingData.rating) {
            this.ratingData = this.bookingData.rating;
          }
        })
        .catch(err => {
          this.$helpers.errorHandle(err, this);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    saveRating() {
      this.submit_loading = true;
      this.axios
        .post("/bookings/" + this.bookingData.id + "/rating", {
          rating: this.rating,
          feedback: this.feedback
        })
        .then(res => {
          this.ratingData = res.data;
          
        })
        .catch(err => {
          this.$helpers.errorHandle(err, this);
        })
        .finally(() => {
          this.submit_loading = false;
          this.showDialog();
        });
    },
    fetchReview(){
      
      if(!this.bookingData.locationId){
        return;
      }
      
      this.axios.get("companies/current/externalReviews", {
        params: {
          filter: {
            where: {
              locationId: this.bookingData.locationId
            }
          }
        }
      }).then(res => {
          if(res.data && res.data.length > 0){
            this.reviewData = res.data[0];
          }
      }).catch(err => {});
    },
    showDialog(){
      //TODO: ADD CAN VIEW REVIEW APP
      if(this.reviewData && this.reviewData.rating_threshold && this.reviewData.redirect_link && this.$can('manage','plan_review_redirect')){
        if(this.rating >= this.reviewData.rating_threshold && this.reviewData.redirect_link !== ""){
          this.showRedirectDialog = true;
        }
      }
    },
    loadExternalReview(){
      this.showRedirectDialog = false;
      window.open(this.reviewData.redirect_link);
    },
    loadCompanySettings(){
        this.axios
        .get("/company_settings/settings-with-default", {
          params: {
              defaultValue: false
          }
        })
        .then(res => {
          if (res.data && res.data.rating){
            this.ratingDateLimit = this.$moment().startOf('day').subtract(res.data.rating.expiration_period, res.data.rating.expiration_length_type);
          }
        })
        .finally(() => {
          this.settingsLoading = false;
        });
    }
  }
};
</script>


<style lang="scss">
.app-section-rating {
  text-align: center;

  h1 {
    font-size: 35px;
  }

  .text {
    font-size: 35px;
    font-weight: 500;
  }

  p {
    margin-bottom: 0px;
    color: black;
    font-weight: 500;
    font-size: 15px;
  }

  small {
  }

  .el-textarea {
    width: 30%;
    margin: 0px auto;
  }

  .el-rate {
    height: 100px;

    .el-rate__icon {
      font-size: 50px !important;
    }
  }
}
</style>
