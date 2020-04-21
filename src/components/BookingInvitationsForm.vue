<template>
  <el-dialog :append-to-body="true" :modal="true" :visible="dialogShow" 
      :before-close="dialogClosed" title="Team Invitation">
    <div class="modal-body">
      <el-form label-position="top" v-if="selectedInvitation">
        <el-row :gutter="20">
          <el-col :md="12" v-if="selectedInvitation.team">
            <el-form-item label="Team">
              {{ selectedInvitation.team.name }}
            </el-form-item>
          </el-col>
          <el-col :md="12">
            <el-form-item label="Status">
              {{ selectedInvitation.status }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :md="12" :sm="12" :xs="24">
            <el-form-item label="Pay Rate">
              <el-select v-model="selectedInvitation.pay_rate_type"
                         :disabled="payEditDisabled(selectedInvitation)">
                <el-option label="Percent" value="percent">
                  Percent
                </el-option>
                <el-option label="Hourly" value="hourly">
                  Hourly
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="12" :sm="12" :xs="24">
            <el-form-item label="At">
              <el-input type="number" v-model="selectedInvitation.pay_rate" 
                        :disabled="payEditDisabled(selectedInvitation)">
                <span slot="prepend" v-if="selectedInvitation.pay_rate_type === 'percent'"> % </span>
                <span slot="append" v-if="selectedInvitation.pay_rate_type === 'hourly'">{{ $currency }}/hr</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Comment">
              <el-input type="textarea" v-model="selectedInvitation.comment"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>


    <div slot="footer">
      <template v-if="$can('manage', 'role_admin') && $can('manage', 'manage_team_invitation')">
        <el-button @click="update('rejected', false)" size="small" type="danger"
                    v-if="selectedInvitation.status !== 'rejected'">
          Reject</el-button>
        <el-button @click="update('accepted', false)" size="small" type="success"
                    v-if="selectedInvitation.status !== 'accepted'">
          Accept & replace</el-button>
        <el-button @click="update('accepted', false, true)" size="small" type="success"
                    v-if="selectedInvitation.status !== 'accepted'">
          Accept & add</el-button>
        <el-button @click="update('', true)" size="small" type="default">Update</el-button>
      </template>
      <template v-else>
        <el-button @click="update('rejected', false)" size="small" type="danger"
                    v-if="selectedInvitation.status !== 'rejected'">
          Reject</el-button>
        <el-button @click="update('bid', true)" size="small" type="success"
                    v-if="selectedInvitation.bid_open">
          Bid</el-button>
        <el-button @click="update('accepted', false)" size="small" type="success"
                    v-else>
          Accept</el-button>
      </template>
    </div>

  </el-dialog>

</template>

<script>

  export default {
      props: {
          selectedInvitation: {
              type: Object
          },
          dialogShow: {
              type: Boolean,
              required: true
          },
          saveDone: {
              type: Function
          }
      },
      data() {
          return {
          }
      },

      methods: {
          dialogClosed(){
              this.$emit("update-visible")
          },

          payEditDisabled(invitation) {
              // admin can always edit
              // other can only edit if bid_open
              if (this.$can('manage', 'role_admin') && this.$can('manage', 'manage_team_invitation')) {
                  return invitation.status === 'accepted';
              } else {
                  return !invitation.bid_open;
              }
          },

          update(status, editPay, addTeam) {
              if (status === 'accepted') {
                  let message = 'This booking will be assigned to your team, do you want to proceed?';
                  if (this.$can('manage', 'role_admin')) {
                      if (addTeam) {
                          message = 'This would add to any currently existing team assignments, do you want to proceed?';
                      } else {
                          message = 'This would replace any currently existing team assignments, do you want to proceed?';
                      }
                  }
                  this.$confirm(message).then(() => {
                      this.updateInvitation(status, editPay, addTeam);
                  });
              } else {
                  this.updateInvitation(status, editPay, addTeam);
              }
          },

          updateInvitation(status, editPay, addTeam) {
              // if it is and admin we skip validation check, to allow them to
              // modify accepted and close invitations
              // skipUpdateCheck is not a property, it is used in the automatic 
              // invitation logic
              let skipUpdateCheck = this.$can('manage', 'role_admin') && this.$can('manage', 'manage_team_invitation');
              let data = {
                  comment: this.selectedInvitation.comment,
                  skipUpdateCheck: skipUpdateCheck
              };
              // if addTeam, we add the team assignement else we replace
              if (addTeam) {
                  data.addTeamAssignement = true;
              }
              if (status !== '') {
                  data.status = status;
              }
              if (editPay) {
                  data.pay_rate = this.selectedInvitation.pay_rate;
                  data.pay_rate_type = this.selectedInvitation.pay_rate_type;
              }
              this.axios.patch('/booking_invitations/' + this.selectedInvitation.id, data)
                      .then(res => {
                          this.$message.success('Invitation updated');
                          if (typeof this.saveDone === "function") {
                              this.saveDone();
                          }
                      });
          }
      }
  }
</script>


<style lang="scss">

</style>
