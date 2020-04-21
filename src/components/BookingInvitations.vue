<template>
  <div class="booking-invitations">
    <el-alert type="info" v-if="$can('manage', 'manage_team')">To invite teams go to Assigning a team</el-alert>


    <el-row :gutter="10">
      <el-col>
        <el-divider content-position="left" v-if="t_assignment.length > 0">
          Teams Assigned
        </el-divider>
      </el-col>
      <el-col :key="assignedIndex" style="max-width: 280px;" v-for="(assigned, assignedIndex) in t_assignment">
        <el-card class="team-card" :body-style="{padding: '5px'}" shadow="always" style="margin-bottom: 5px;">
          <avatar :background-color="assigned.team.color" :size="42" :username="assigned.team.name" color="white" style="float:left; margin-right: 5px"/>

          <div class="team-content">
            <span><strong>{{ assigned.team.name }}</strong></span>
            <el-rate :texts="['oops', 'disappointed', 'normal', 'good', 'great']" v-model="assigned.rate"/>
            <span v-if="assigned.pay_rate_type === 'percent'">Wage: {{ $currency }}{{ assigned.pay_rate + "%" }} </span>
            <span v-if="assigned.pay_rate_type === 'hourly'">Wage: {{ $currency }}{{ assigned.pay_rate + "/hr" }} </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-divider>Invitations</el-divider>

    <el-table :data="invitations" v-loading="loading">
      <el-table-column label="Date">
        <template slot-scope="scope">
          {{$moment(scope.row.created_at).format($date_format + ' ' + $time_format)}}
        </template>
      </el-table-column>

      <el-table-column label="Team" prop="team.name">
      </el-table-column>
      <el-table-column label="Rate">
        <template slot-scope="scope">
          <span v-if="scope.row.pay_rate_type === 'percent'">Wage: {{ scope.row.pay_rate + "%" }} </span>
          <span v-if="scope.row.pay_rate_type === 'hourly'">Wage: {{ $currency }}{{ scope.row.pay_rate + "/hr" }} </span>
        </template>
      </el-table-column>
      <el-table-column label="Comment" prop="comment"></el-table-column>
      <el-table-column label="Status" prop="status"></el-table-column>
      <el-table-column label="Action">
        <template slot-scope="scope">
          <el-button @click="manageInvitation(scope.row)" size="mini"
                     type="warning" v-if="canEditInvitation(scope.row)">
            {{ $can('manage', 'role_admin') ? 'Update' : 'Interested'}}
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <invitation-form :dialogShow="dialog"
                     :saveDone="updateDone" :selectedInvitation.sync="selectedInvitation"
                     @update-visible="dialog = false"/>
  </div>

</template>

<script>
    import Avatar from 'vue-avatar'
    import invitationForm from "./BookingInvitationsForm";

    export default {
        props: {
            booking_id: {
                type: String,
                required: true
            },
            team_assignment: {}
        },
        components: {
            Avatar,
            invitationForm
        },
        data() {
            return {
                invitations: [],
                loading: false,
                selectedInvitation: {},
                dialog: false,
                teams: [],
                editableTeams: [],
                t_assignment: []
            }
        },

        mounted() {
            this.loadTeams();
            this.getTeamAssignement()
        },

        methods: {
            canEditInvitation(invitation) {
                // only admin can edit accepted or closed invitations
                // admin can edit all invitations
                if (this.$can('manage', 'role_admin') && this.$can('manage', 'manage_team_invitation')) {
                    return true;
                } else {
                    return invitation.status !== 'accepted' && invitation.status !== 'closed'
                        && this.editableTeams.includes(invitation.teamId);
                }
            },
            manageInvitation(invitation) {
                this.selectedInvitation = invitation;
                this.dialog = true
            },
            loadTeams() {
                // if user is not an admin we limit it to the account's teams
                let url = '/teams/my-teams/' + this.$auth.user().id;

                if (this.$can('manage', 'role_admin')) {
                    url = "/companies/current/teams";
                }
                this.loading = true;

                this.axios.get(url)
                    .then(res => {
                        this.teams = res.data;

                        // setting editable teams
                        this.teams.forEach((t) => {
                            if (t.isTeamLead) {
                                this.editableTeams.push(t.id);
                            }
                        });
                    })
                    .then(() => {
                        this.getInvitations();
                    });
            },
            getInvitations() {
                this.loading = true
                this.axios.get('/bookings/' + this.booking_id + '/invitations',
                    {
                        params: {
                            filter: {
                                where: {teamId: {inq: this.teams.map((i) => i.id)}},
                                include: ['team']
                            }
                        }
                    })
                    .then(res => {
                        this.invitations = res.data
                    })
                    .catch()
                    .then(() => {
                        this.loading = false
                    })
            },
            getTeamAssignement() {
                // no team_assignment cause error if there is no relation
                this.axios.get('/team_assignments',
                    {
                        params: {
                            filter: {
                                include: ["team"],
                                where: {
                                    bookingId: this.booking_id
                                }
                            }
                        }
                    })
                    .then(res => {
                        this.t_assignment = res.data
                    })
            },
            updateDone() {
                this.dialog = false;
                this.selectedInvitation = {};
                this.getInvitations();
                this.getTeamAssignement();
            },
        }
    }
</script>


<style lang="scss">

</style>
