<template>
  <div class="workdiary-timesheets">
    <template v-loading="loading">

      <el-table :data="timesheets">
        <el-table-column label="Team" prop="account.name"></el-table-column>
        <el-table-column label="Onway" width="100px">
          <template slot-scope="scope" v-if="scope.row.onway">
            {{$moment(scope.row.onway).format($time_format)}}
          </template>
        </el-table-column>
        <el-table-column label="Arrival Time" width="100px">
          <template slot-scope="scope" v-if="scope.row.arrived_at">
            {{$moment(scope.row.arrived_at).format($time_format)}}
          </template>
        </el-table-column>
        <el-table-column label="Checkin" width="100px">
          <template slot-scope="scope" v-if="scope.row.checkin">
            {{$moment(scope.row.checkin).format($time_format)}}
          </template>
        </el-table-column>
        <el-table-column label="Checkout" width="100px">
          <template slot-scope="scope" v-if="scope.row.checkout">
            {{$moment(scope.row.checkout).format($time_format)}}
          </template>
        </el-table-column>
        <el-table-column label="Dist." width="100px">
          <template slot-scope="scope">
            {{scope.row.distance_travelled}}
          </template>
        </el-table-column>
        <el-table-column label="Option">
          <template slot-scope="scope">
            <el-link @click="updateTimeSheet('locked', true, scope.row.id)" size="mini" type="danger" v-if="!scope.row.locked">Lock</el-link>
            <el-link @click="updateTimeSheet('locked', false,scope.row.id)" size="mini" v-if="scope.row.locked">Unlock</el-link>
            <el-divider direction="vertical"></el-divider>
            <el-link @click="updateTimeSheet('archived_at',$moment().utc().toISOString(), scope.row.id)" size="mini" v-if="!scope.row.archived_at">Archive</el-link>
            <el-link @click="updateTimeSheet('archived_at',null, scope.row.id)" size="mini" type="warning" v-if="scope.row.archived_at">Un-Archive</el-link>
          </template>
        </el-table-column>
      </el-table>

    </template>
    <p v-if="assignment_members.length == 0 && !loading">
      No teams assigned to this booking
    </p>
  </div>
</template>

<script>
    import {VclCode} from 'vue-content-loading'

    export default {
        components: {
            VclCode
        },
        props: {
            booking: {
                type: [Object, Boolean],
                required: true
            },
            workdiary: {
                type: [Object, Boolean],
                required: true
            }
        },
        data() {
            return {
                timesheets: [],
                loading: true,
                team_assignments: [],
                assignment_members: []
            };
        },

        mounted() {
            this.getTimeSheets()
        },
        methods: {
            updateTimeSheet(property, value, id) {
                let data = {}
                data[property] = value

                this.axios.patch('/timesheets/' + id, data)
                    .then(res => {
                        this.$message.success('update successful')
                        this.getTimeSheets()
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })

            },
            getTimeSheet(teamId, teamName, edit, results) {

                let timesheet = results.find((timesheet) => {
                    return timesheet.accountId === teamId
                })

                /* if (!timesheet) {
                     timesheet = {
                         bookingId: this.booking.id,
                         workdiaryId: this.booking.workdiary.id,
                         accountId: teamId,
                         onway: "",
                         checkin: "",
                         checkout: "",
                         distance_travelled: 0,
                         locked: false,
                         teamName: teamName
                     }
                 }*/


                return timesheet

            },

            getTimeSheets() {
                (async () => {
                    try {
                        this.timesheets = []
                        this.assignment_members = []
                        this.loading = true
                        let results = (await this.axios.get('/companies/current/timesheets', {
                            params: {
                                filter: {
                                    where: {
                                        bookingId: this.booking.id
                                    },
                                    include: [{
                                        relation: "booking",
                                        scope: {
                                            include: "service_details",
                                        }
                                    }, {
                                        relation: "account"
                                    }]
                                }
                            }
                        })).data


                        this.team_assignments = (await this.axios.get('/team_assignments',
                            {
                                params: {
                                    filter: {
                                        include: ['team'],
                                        where: {
                                            bookingId: this.booking.id
                                        }
                                    }
                                }
                            })).data


                        for (let x = 0; x < this.team_assignments.length; x++) {
                            let assigned = this.team_assignments[x]
                            if (assigned.team_model == 'account') {
                                this.assignment_members.push(assigned.team)
                            } else {
                                if (assigned.team.members) {
                                    assigned.team.members.forEach((acct) => {
                                        acct.isLead = assigned.team.leads.findIndex((lead) => lead.id === this.$auth.user().id)
                                        this.assignment_members.push(acct)
                                    })
                                }

                            }
                        }


                        //build timeseehts
                        this.assignment_members.forEach((member) => {
                            // can edit if on timesheet or is admin
                            let edit = false
                            if (this.$can('manage', 'role_admin')) {
                                edit = true
                            } else {
                                if (member.id === this.$auth.user().id || member.isLead >= 0) {
                                    edit = true
                                }
                            }
                            let ts = this.getTimeSheet(member.id, member.fullname, edit, results)
                            if (ts)
                                this.timesheets.push(ts)
                        })


                        this.loading = false

                    } catch (err) {

                    }
                })()
            },

            getTeamName(timesheet) {
                return (timesheet.account) ? timesheet.account.fullname : timesheet.teamName
            },

            saveTimesheet(timesheet) {
                let filteredTimesheet = JSON.parse(JSON.stringify(timesheet));
                // removing unset fields
                if (!filteredTimesheet.checkin) {
                    delete filteredTimesheet.checkin;
                }
                if (!filteredTimesheet.checkout) {
                    delete filteredTimesheet.checkout;
                }
                if (!filteredTimesheet.onway) {
                    delete filteredTimesheet.onway;
                }
                if (filteredTimesheet.id) {
                    this.axios.put('/companies/current/timesheets/' + timesheet.id, filteredTimesheet)
                        .then(res => {
                            this.$message.success("Saved!");
                            this.getTimeSheets();
                        })
                        .catch(err => {

                        })
                        .finally(_ => {
                            this.$events.emitEvent('timesheet-updated', [timesheet.account])
                        })
                } else {
                    this.axios.post('/companies/current/timesheets', filteredTimesheet)
                        .then(res => {
                            this.$message.success("Saved!");
                            this.getTimeSheets();
                        })
                        .catch(err => {
                            this.$message.eror("Failed saving timeheet!");
                        })
                        .finally(_ => {
                            this.$events.emitEvent('timesheet-updated', [timesheet.account])
                        })
                }

            }
        }
    };
</script>

<style lang="scss">
  .workdiary-timesheets {
    .time-cards {
      box-shadow: none !important;
      margin-bottom: 5px;
      background: #f3f3f3;
    }
  }
</style>
