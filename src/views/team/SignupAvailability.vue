<template>
  <el-row class="working-days">
    <el-col :md="12" class="svg-section">
      <img class="svg-logo" svg-inline src="@/assets/svgs/logo.svg" />
      <img class="main-illus" svg-inline src="@/assets/svgs/signup/Signup_team_step2.svg" />
    </el-col>
    <el-col :md="12" class="form-section" v-loading="loading">
      <div class="form-section-wrapper">
        <h2>Welcome {{  $auth.user().first_name }}!</h2>
        <p class="frm-message">Great, last thing.. when are you available for work?</p>
        <el-row :gutter="40" v-for="(avail, key) in newAvailability" v-bind:key="key">
          <el-col :md="6">
            <p>
              <strong>
                {{ key.charAt(0).toUpperCase() + key.slice(1)}}
              </strong>
            </p>
          </el-col>
          <el-col :md="8">
            <p>
            <el-time-select v-model="avail.from" :picker-options="pickerOption(key, true)"
                            placeholder="From" @change="markEdited(key)" :disabled="!avail.opened">
          </el-time-select>
          </p>
        </el-col>
        <el-col :md="8">
          <p>
          <el-time-select v-model="avail.to" :picker-options="pickerOption(key, false)"
                          placeholder="To" @change="markEdited(key)" :disabled="!avail.opened">
        </el-time-select>
        </p>
      </el-col>
    </el-row>
    <el-row class="button-area">
      <el-button size="small" class="center" type="primary"
                 @click="saveAvailability" round  v-loading="pLoading">
        Open your app
      </el-button>
    </el-row>
  </div>
</el-col>
</el-row>
</template>

<script>
  export default {
    data: () => {
      return {
        loading: true,
        pLoading: true,
        newAvailability: {
          monday: {from: null, to: null, edit: false,
            opened: false, opening: "0:00", closing: "23:59"},
          tuesday: {from: null, to: null, edit: false,
            opened: false, opening: "0:00", closing: "23:59"},
          wednesday: {from: null, to: null, edit: false,
            opened: false, opening: "0:00", closing: "23:59"},
          thursday: {from: null, to: null, edit: false,
            opened: false, opening: "0:00", closing: "23:59"},
          friday: {from: null, to: null, edit: false,
            opened: false, opening: "0:00", closing: "23:59"},
          saturday: {from: null, to: null, edit: false,
            opened: false, opening: "0:00", closing: "23:59"},
          sunday: {from: null, to: null, edit: false,
            opened: false, opening: "0:00", closing: "23:59"}
        },
        accountId: ""
      };
    },

    created() {
      this.loadProfile();
    },

    methods: {
      pickerOption(weekday, start) {
        let options = {from: "0:0", step: "00:15", to: "23:59"};

        if (start) {
          if (this.$moment(this.newAvailability[weekday].closing) < this.$moment(this.newAvailability[weekday].to)) {
            options.maxTime = this.newAvailability[weekday].closing;
          } else {
            options.maxTime = this.newAvailability[weekday].to;
          }
        } else {
          if (this.$moment(this.newAvailability[weekday].opening) > this.$moment(this.newAvailability[weekday].from)) {
            options.minTime = this.newAvailability[weekday].opening;
          } else {
            options.minTime = this.newAvailability[weekday].from;
          }
        }

        return options;
      },

      markEdited(key) {
        this.newAvailability[key].edit = true;
      },

      loadProfile() {
        this.pLoading = true;
        this.axios
          .get("/accounts/me")
          .then(res => {
            if (res.data) {
              this.accountId = res.data.id;
              if (res.data.team_onboarding) {
                this.$router.push({name: 'team_dashboard'});
              } else {
                this.loadDefaultAvailability();
              }
            }
          })
          .then(() => {
            this.pLoading = false;
          });
      },

      loadDefaultAvailability() {
        this.axios.get("/availability/team-member-default", {
          params: {accountId: this.$auth.user().id}
        })
          .then(res => {
            if (res.data && res.data.length > 0) {
              res.data.forEach((avs) => {
                this.newAvailability[avs.weekday].from = avs.from;
                this.newAvailability[avs.weekday].to = avs.to;
                this.newAvailability[avs.weekday].id = avs.id;
                this.newAvailability[avs.weekday].ownerType = avs.ownerType;
              });
            }
          })
          .then(() => {
            this.loadOpeningHours();
          });
      },

      saveAvailability() {
        this.loading = true;
        // creating data to post
        let companyId = this.$auth.user().companyId;
        let data = [];
        let deleteIds = [];

        for (var prop in this.newAvailability) {
          // only add edit availability
          if (this.newAvailability.hasOwnProperty(prop) &&
            this.newAvailability[prop].edit) {
            let aval = this.newAvailability[prop];
            let item = {
              weekday: prop,
              type: 'default',
              from: aval.from,
              to: aval.to,
              companyId: companyId,
              ownerType: 'account',
              ownerId: this.accountId
            };

            // if ownerType is account then we add the id to update the record
            if (aval.ownerType === 'account') {
              item.id = aval.id;
            }

            // if the it is no a valid record with and id, wew add it to the deletelist
            if (aval.from && aval.to) {
              data.push(item);
            } else if (item.id) {
              deleteIds.push(item.id);
            }
          }
        }

        this.axios.post("/availability/create-update",
          {updateData: data, deleteIds: deleteIds})
          .then(res => {
            if (res.data && res.data.success) {
              // update profile and redirect
              this.axios.patch("/accounts/" + this.accountId, {team_onboarding: true})
                .then(res => {
                  this.$router.push({name: 'team_dashboard'});
                });
            }
          })
          .then(() => {
            this.loading = false;
          });
      },

      loadOpeningHours() {
        this.axios.get("/availability/opening-days")
          .then(res => {
            if (res.data) {
              for (var prop in res.data) {
                if (res.data.hasOwnProperty(prop) &&
                  this.newAvailability[prop]) {
                  this.newAvailability[prop].opened = res.data[prop].opened;
                  this.newAvailability[prop].opening = res.data[prop].opening;
                  this.newAvailability[prop].closing = res.data[prop].closing;
                  if (!res.data[prop].opened) {
                    this.newAvailability[prop].from = null;
                    this.newAvailability[prop].to = null;
                  }
                }
              }
            }
          })
          .then(() => {
            this.loading = false;
          });
      }
    }
  };
</script>

<style lang="scss" src="./styles/SignupAvailability.scss" />
