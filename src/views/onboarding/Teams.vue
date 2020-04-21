<template>
  <el-form class="" :model="teams_form" ref="teams_form" :rules="rules">
    <div class="divider-1x">
      <h2>Welcome {{ $auth.user().first_name }}</h2>
    </div>

    <p>You are only a few minutes away from building bigger business with Launch27 <br />Next, lets invite some team members (you can also do this step later)</p>

    <el-row :gutter="20">
      <el-col :sm="6" :md="6">
        <el-form-item prop="full_name">
          <el-input v-model="teams_form.full_name" placeholder="Full Name" />
        </el-form-item>
      </el-col>

      <el-col :sm="6" :md="6">
        <el-form-item prop="email">
          <el-input v-model="teams_form.email" placeholder="Email" />
        </el-form-item>
      </el-col>

      <el-col :sm="6" :md="6">
        <el-form-item prop="role">
          <el-select v-model="teams_form.role" placeholder="Role">
            <el-option value="business_staff" label="Staff">
              Staff
            </el-option>
            <el-option value="business_team_lead" label="Team">
              Team Lead
            </el-option>
            <el-option value="business_team_member" label="Team">
              Team Member
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :sm="6" :md="6">
        <el-form-item>
          <el-button size="mini" round @click.prevent.stop="saveInvite()">
            Add Invite
          </el-button>
        </el-form-item>
      </el-col>
    </el-row>

    <h4>Invitations ({{ invitations.length }})</h4>
    <small>(Invitations are sent after your onboarding is complete)</small>

    <el-row v-for="(invitation, invitationIndex) in invitations" :key="invitationIndex" :gutter="20">
      <el-col :sm="6" :md="6">
        <el-form-item>
          <el-input v-model="invitation.full_name" placeholder="Full Name" />
        </el-form-item>
      </el-col>

      <el-col :sm="6" :md="6">
        <el-form-item>
          <el-input v-model="invitation.email" placeholder="Email" />
        </el-form-item>
      </el-col>

      <el-col :sm="6" :md="6">
        <el-form-item>
          <el-select v-model="invitation.role" placeholder="Role">
            <el-option value="business_staff" label="Staff">
              Staff
            </el-option>
            <el-option value="business_team_lead" label="Team">
              Team Lead
            </el-option>
            <el-option value="business_team_member" label="Team">
              Team Member
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :sm="6" :md="6">
        <el-form-item>
          <el-button type="mini" icon="el-icon-delete" round @click="deleteInvite(invitation)" />
        </el-form-item>
      </el-col>
    </el-row>

    <div class="divider" />
    <el-row>
      <el-col :sm="6" :md="6" :xs="24">
        <el-button type="text" plain @click="prev">
          Back
        </el-button>
      </el-col>
      <el-col :sm="18" :md="18" :xs="24">
        <div class="pull-right">

          <el-button type="primary" round @click="next">
            Next
          </el-button>
          <el-button type="primary" round @click="skip">
            Skip
          </el-button>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
export default {
  data: () => {
    return {
      teams_form: {
        full_name: "",
        email: "",
        role: ""
      },
      invitations: [],
      admins: [],
      activeCompany: false,
      rules: {
        full_name: [{ message: "Full name is required", required: true, trigger: "blur" }],
        email: [{ required: true, trigger: "blur" }, { type: "email", trigger: "blur" }],
        role: [{ message: "Role is required", required: true, trigger: "blur" }]
      }
    };
  },
  created() {
    this.activeCompany = this.$auth.user().company;
    this.admins.push({
      full_name: this.$auth.user().first_name,
      email: this.$auth.user().email,
      role: "Business Owner"
    });
  },
  mounted() {
    this.$events.emitEvent("illustration", ["teams", 4]);
    this.axios
      .get("/companies/" + this.activeCompany.id + "/invitations")
      .then(res => {
        this.invitations = res.data;
      })
      .catch(err => {
        console.log(err);
      });
  },
  methods: {
    reloadInvitations() {
      this.axios
        .get("/companies/" + this.activeCompany.id + "/invitations")
        .then(res => {
          this.invitations = res.data;
        })
        .catch(err => {
          console.log(err);
        });
    },
    next() {
      this.$events.emitEvent("onboarding-next");
    },
    skip() {
      this.$events.emitEvent("onboarding-next");
    },

    prev() {
      this.$events.emitEvent("onboarding-prev");
    },
    saveInvite() {
      this.$refs["teams_form"].validate(valid => {
        if (valid) {
          // send invitation
          this.axios
            .post("/invitations", {
              full_name: this.teams_form.full_name,
              email: this.teams_form.email,
              role: this.teams_form.role,
              companyId: this.activeCompany.id
            })
            .then(res => {
              this.reloadInvitations();
              this.teams_form = {
                full_name: "",
                email: "",
                role: ""
              };
            })
            .catch(res => {
              console.log(res);
            });
        }
      });
    },

    deleteInvite(invitation) {
      this.axios.delete("/invitations/" + invitation.id).then(res => {
        this.reloadInvitations();
      });
    }
  }
};
</script>
