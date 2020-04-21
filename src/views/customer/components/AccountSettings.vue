<template>
  <div v-loading="!profile.id">
    <el-row class="account-settings">
      <el-col>
        <el-row :gutter="20">
          <el-col class="acc-container" :offset="4" :sm="16" :md="16" :xs="24">
            <el-form ref="accountSettingsFrm" :model="profile" :rules="rules">
              <el-row :gutter="40">
                <el-col :sm="24">
                  <el-upload class="avatar-uploader" :show-file-list="false" :headers="getHeaders()" :action="getFileUrl()" :on-success="uploadSuccess">
                    <el-avatar :size="128" fit="contain" :src="profile.avatar">
                      <i v-if="!profile.avatar" class="el-icon-plus avatar-uploader-icon"></i>
                    </el-avatar>
                    <small style="display: block;">Click to change</small>
                  </el-upload>
                </el-col>

                <el-col :sm="12" :md="12" :xs="24">
                  <el-form-item prop="first_name" label="First Name">
                    <el-input v-model="profile.first_name" type="text" />
                  </el-form-item>
                </el-col>

                <el-col :sm="12" :md="12" :xs="24">
                  <el-form-item prop="last_name" label="Last Name">
                    <el-input v-model="profile.last_name" type="text" />
                  </el-form-item>
                </el-col>

                <el-col :sm="12" :md="12" :xs="24">
                  <el-form-item prop="phone" label="Phone number">
                    <el-input v-model="profile.phone" />
                  </el-form-item>
                </el-col>

                <el-col :sm="12" :md="12" :xs="24">
                  <el-form-item prop="email" label="Email (request change)">
                    <el-input readonly disabled type="email" v-model="profile.email" />
                  </el-form-item>
                </el-col>

                <el-col :sm="12" :md="12" :xs="24">
                  <el-form-item prop="password" label="New Password">
                    <el-input type="password" v-model="profile.password" />
                  </el-form-item>
                </el-col>

                <el-col :sm="12" :md="12" :xs="24">
                  <el-form-item prop="confirm_password" label="Confirm Password">
                    <el-input type="password" v-model="profile.confirm_password" />
                  </el-form-item>
                </el-col>

                <el-button type="primary" class="block-center" round size="mini" @click="saveChanges()">
                  Save Changes
                </el-button>
              </el-row>
            </el-form>

            <el-form v-if="false">
              <strong>Want $110 off your next bill? Refer a company</strong>
              <el-row>
                <el-col :sm="18" :md="18" :xs="18">
                  <el-form-item label="Referral Code">
                    <el-input type="text" v-model="referalCode"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :sm="6" :md="6" :xs="6" style="height : 99px;margin-bottom :0px;">
                  <el-button type="primary" round class="pull-right" size="small" style="position:absolute; right : 0; bottom:22px; width: 115px;">Copy</el-button>
                </el-col>
              </el-row>
            </el-form>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  components: {
    "full-steam-pay-checkout": require("@/components/FullSteamPayCheckout").default
  },
  props: {
    profile: {
      type: Object,
      required: true
    }
  },
  data: () => {
    return {
      referalCode: "",
      rules: {},
      plan: false,
      loading: {
        subscription: false,
        card: false
      },
      subscription: false,
      fspayInstance: null,
      cards: []
    };
  },

  watch: {},

  mounted() {
    this.fetchSubscription();
  },

  methods: {
    fetchSubscription() {
      //get company susbscription
      this.loading.subscription = true;
      this.axios
        .get("/companies/current", { params: { filter: { include: "subscription" } } })
        .then(res => {
          this.subscription = res.data.subscription;
          this.plan = {
            date: this.$moment(res.data.subscription.created_at).format("MM-YYYY"),
            plan: res.data.subscription.plan_name
          };
        })
        .catch()
        .finally(_ => {
          this.loading.subscription = false;
        });
    },
    saveChanges() {
      // only show prompt if new password form has been field.
      if (this.profile.password && this.profile.password !== this.profile.confirm_password) {
        this.$helpers.errorHandle("New password mismatch");
        return;
      }

      this.$prompt("Enter you current password to proceed", "Security", {
        confirmButtonText: "OK",
        inputType: "password",
        cancelButtonText: "Cancel"
      })
        .then(({ value }) => {
          this.profile.old_password = value;
          delete this.profile.confirm_password;
          this.axios
            .patch("/accounts/me", this.profile)
            .then(res => {
              this.$message.success("Profile successfully updated");
              // reload user
              this.$auth.fetch({
                success: profile => {
                  // this.profile = profile
                  this.profile.password = "";
                  this.profile.old_password = "";
                  this.profile.confirm_password = "";
                }
              });
            })
            .catch(err => {
              if (err.response.data) {
                this.$helpers.errorHandle(err, this);;
              }
            });
        })
        .catch(() => {});
    },

    getHeaders() {
      return { Authorization: this.$auth.token() };
    },
    getFileUrl() {
      return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
    },

    uploadSuccess(res, file) {
      this.profile.avatar = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
    },

    changePlan() {
      this.$events.emitEvent("account:profile:change-tab", ["plan"]);
    },
    onNewCardClick() {
      if (this.profile.company && this.profile.company.settings.booking.enable_fspay === true && this.fspayInstance) {
        this.fspayInstance.showModal();
      }
    },
    onFullSteamPayMounted(instance) {
      this.fspayInstance = instance;
    },
    onFullSteamPayTokenReceived(card) {
      this.loading.card = true;

      var params = {
        gateway: "fspay",
        gatewayId: card.token,
        last4digits: card.accountDetails.paymentAccountLast4,
        expiryMonth: card.accountDetails.expirationMonth,
        expiryYear: card.accountDetails.expirationYear,
        cardType: card.cardType
      };

      this.axios({
        method: "POST",
        url: "/accounts/" + this.$auth.user().id + "/cards",
        data: params
      })
        .then(response => {
          if (response.data) {
            this.cards.push(response.data);
          }
        })
        .catch(error => {})
        .then(_ => (this.loading.card = false));
    }
  }
};
</script>

<style lang="scss">
.account-settings {
  .acc-container {
    background: white;
    padding: 30px 10px;
  }
  .plan-text {
    display: block;
    font-style: normal;
    font-size: 12px;
    margin-top: 5px;
  }

  .upgrade-button {
    margin-left: 20px;
  }

  .avatar-uploader .el-upload {
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    margin: 0 auto 40px;
    display: block;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 128px;
    height: 128px;
    line-height: 128px;
    text-align: center;
  }

  .el-avatar {
    img {
      width: 100%;
    }
  }

  .avatar {
    width: 128px;
    height: 128px;
    display: block;
  }

  .payment_methods {
    ul {
      list-style: none;
      padding: 0px;
      font-size: 12px;

      .el-avatar {
        float: left;
        margin-right: 10px;
      }

      .el-row {
        display: inline-block;
      }
    }
  }
}
</style>
