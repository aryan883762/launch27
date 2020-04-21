<template>
  <el-card shadow="never" v-loading="loading">
    <div class="flex-row-reverse">
      <el-button @click="removeAll" plain round size="mini" type="danger">Remove all</el-button>
    </div>
    <el-divider>Select Your Preferred Teams</el-divider>
    <el-row :gutter="20" v-loading="loading"  class="account-cards">
      <el-col :md="6" :sm="6" :xs="24" style="margin-bottom: 10px;" v-for="team in teams" :key="team.id">
        <el-card :class="{selected : selected_teams.includes(team.id)}" @click.native="selectTeam(team.id)" shadow="hover">
          <div>
            <b>{{team.name}}</b>
          </div>
          <div class="charge-item-card-details">
            <small>Leads: {{team.leads.length}}, Members {{team.members.length}}</small>
          </div>
          <i class="el-icon-circle-check" v-if="selected_teams.includes(team.id)"></i>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>
<script>

  export default {
      data() {
          return {
              teams: [],
              selected_teams: [],
              profile: {},
              loading: true
          };
      },

      created() {
          this.loadTeams();
          this.loadProfile();
      },

      methods: {
          selectTeam(teamId) {
              if (!this.selected_teams.includes(teamId)) {
                  this.selected_teams.push(teamId);
              } else {
                  let index = this.selected_teams.findIndex((id) => id == teamId);
                  if (index > -1) {
                      this.selected_teams.splice(index, 1);
                  }
              }
              this.updateProfile();
          },
          removeAll() {
              this.selected_teams = [];
              this.updateProfile();
          },
          loadTeams() {
              this.loading = true;

              this.axios.get('/companies/current/teams', {
                        params: {
                            filter: {
                                include: ["leads", "members"]
                            }
                        }
                    })
                      .then(res => {
                          this.teams = res.data;
                      })
                      .then(() => {
                          this.loading = false;
                      });
          },
          loadProfile() {
              this.axios.get('/accounts/me')
                      .then(res => {
                          this.profile = res.data;
                          if (res.data && res.data.preferredTeams) {
                              this.selected_teams = res.data.preferredTeams;
                          }
                      });
          },
          updateProfile() {
              if (this.profile.id) {
                  this.axios.patch('/accounts/' + this.profile.id, {preferredTeams: this.selected_teams})
                          .then(res => {
                              this.$message.success('Saved');
                          });
              }
          }
      }
  }
</script>


<style lang="scss">

  .account-cards {

    .el-card {
      cursor: pointer;
    }

    .selected {
      background: #F9FBE7;
      position: relative;

      .el-icon-circle-check {
        font-size: 25px;
        position: absolute;
        bottom: 10px;
        right: 10px;
      }
    }
  }
</style>
