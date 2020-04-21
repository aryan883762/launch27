<template>
    <el-card :body-style="{background: '    background: #f4f8f9;', padding: '0px'}" class="booking-teams-assignment"
             shadow="never"
             style="margin-top: 5px;box-shadow:none;border:none;" v-loading="loading">
        <div class="flex-row" slot="header" v-if="booking">
            <el-tag effect="dark" type="info">
                Duration: {{ this.booking.duration | duration }}
            </el-tag>

        </div>


        <el-tabs v-model="teams_tab" type="border-card" v-if="available_teams.length > 0" style="margin-bottom: 10px;">
            <el-tab-pane label="Available" name="available">
                <el-row :gutter="10">


                    <el-popover
                            title="Details"
                            width="300"
                            trigger="hover"
                            :key="team.id" v-if="team.type === 'team'"
                            v-for="team in available_teams" placement="top">
                        <team-available-content :team="team"></team-available-content>
                        <el-col v-for="shift in team.data" slot="reference" :md="8" :sm="8" :xs="24"
                                style="margin-bottom: 5px;max-width: 280px;"
                                v-if="shift.available">
                            <el-card
                                    :class="{ selected: isSelected(team.profile, true), 'available' : shift.available }"
                                    @click.native="selectTeam(team.profile, true, shift)" class="team-card"
                                    shadow="never">
                                <account-avatar :account="team.profile" body-class="pull-left" :size="18"></account-avatar>
                                <div class="team-content">
                                    <span>{{ team.profile.name }}</span>
                                    <el-rate allow-half disabled v-model="team.profile.rating"></el-rate>
                                    <i class="el-icon-circle-check" v-if="isSelected(team.profile)"/>
                                </div>
                            </el-card>
                        </el-col>

                    </el-popover>

                </el-row>

                <el-row :gutter="10">

                    <el-popover
                            title="Details"
                            width="300"
                            trigger="hover"
                            :key="team.id" v-if="team.type === 'account'"
                            v-for="team in available_teams" placement="top">
                        <team-available-content :team="team"></team-available-content>

                        <el-col v-for="shift in team.data" slot="reference"
                                style="margin-bottom: 5px;max-width: 280px;"
                                :md="8" :sm="8" :xs="24"
                                v-if="shift.available">
                            <el-card

                                    :class="{ selected: isSelected(team.profile, false), 'available' : shift.available }"
                                    @click.native="selectTeam(team.profile, false, shift)"
                                    class="team-card" shadow="never">
                                <account-avatar :account="team.profile" body-class="pull-left" :size="22" style="margin-right: 10px"></account-avatar>
                                <div class="team-content">
                                    <span>{{ team.profile.fullname }}</span>
                                    <el-rate allow-half disabled v-model="team.profile.rating"></el-rate>
                                    <i class="el-icon-circle-check" v-if="isSelected(team.profile)"/>
                                </div>
                            </el-card>
                        </el-col>
                    </el-popover>
                </el-row>

            </el-tab-pane>


            <el-tab-pane label="Unavailable" name="members">
                <el-row :gutter="10">

                    <el-popover
                            title="Details"
                            width="300"
                            trigger="hover"
                            :key="team.id" v-if="team.type === 'team'"
                            v-for="team in available_teams" placement="top">
                        <team-available-content :team="team"></team-available-content>

                        <el-col v-for="shift in team.data"
                                style="margin-bottom: 5px;max-width: 280px;"
                                slot="reference" :md="8" :sm="8" :xs="24"
                                v-if="!shift.available">
                            <el-card
                                    :class="{ selected: isSelected(team.profile, true), 'unavailable' : !shift.available }"
                                    @click.native="selectTeam(team.profile, true, shift)" class="team-card"
                                    shadow="never">
                                <account-avatar :account="team.profile" body-class="pull-left" :size="22" style="margin-right: 10px"></account-avatar>

                                <div class="team-content">
                                    <span>{{ team.profile.name }}</span>
                                    <el-rate allow-half disabled v-model="team.profile.rating"></el-rate>
                                    <i class="el-icon-circle-check" v-if="isSelected(team.profile)"/>
                                </div>
                            </el-card>
                        </el-col>
                    </el-popover>
                </el-row>

                <el-row :gutter="10">

                    <el-popover
                            title="Details"
                            width="300"
                            trigger="hover"
                            :key="team.id" v-if="team.type === 'account'"
                            v-for="team in available_teams" placement="top">
                        <team-available-content :team="team"></team-available-content>

                        <el-col v-for="shift in team.data"
                                style="margin-bottom: 5px;max-width: 280px;"
                                slot="reference" :md="8" :sm="8" :xs="24"
                                v-if="!shift.available">
                            <el-card
                                    :class="{ selected: isSelected(team.profile, false), 'unavailable' : !shift.available }"
                                    @click.native="selectTeam(team.profile, false, shift)"
                                    class="team-card" shadow="never">
                                <account-avatar :account="team.profile" body-class="pull-left" :size="22" style="margin-right: 10px"></account-avatar>

                                <div class="team-content">
                                    <span>{{ team.profile.fullname }}</span>
                                    <el-rate allow-half disabled v-model="team.profile.rating"></el-rate>
                                    <i class="el-icon-circle-check" v-if="isSelected(team.profile)"/>
                                </div>
                            </el-card>
                        </el-col>
                    </el-popover>
                </el-row>

            </el-tab-pane>


        </el-tabs>

        <div class="flex-row-reverse" v-if="booking">

            <el-button style="margin-right: 10px;" @click="confirmDialog=true" round size="small" type="warning" v-if="available_teams.length > 0">Update Team Assignments
            </el-button>

            <el-button style="margin-right:10px;" @click="close" plain round size="small" type="danger">
                Close
            </el-button>
        </div>

        <p v-if="available_teams.length === 0 && false">
            Select a booking spot to view your teams availability
        </p>

        <el-dialog :visible.sync="confirmDialog" append-to-body title="Confirm Assignment" width="50%">
            <div class="modal-body">
                <el-table :data="team_assignment" v-if="team_assignment">
                    <el-table-column label="Team">
                        <template slot-scope="scope">
                            {{ scope.row.name }}
                        </template>
                    </el-table-column>
                    <el-table-column label="Wage">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.pay_rate">
                                <el-select slot="prepend" style="width:100px;" v-model="scope.row.pay_rate_type">
                                    <el-option label="percent" value="percent"/>
                                    <el-option label="hourly" value="hourly"/>
                                </el-select>
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="Earned" width="100">
                        <template slot-scope="scope">
                            {{ $currency }}{{ getEarned(scope.row) }}
                        </template>
                    </el-table-column>

                </el-table>
            </div>
            <div slot="footer" >
                <el-button @click="confirmDialog = false" round size="small">Cancel</el-button>
                <el-button @click="updateSchedule" round size="small" type="primary">Confirm</el-button>
            </div>
        </el-dialog>
    </el-card>
</template>

<script>
    import Avatar from 'vue-avatar'
    import TeamAvailableContent from "./TeamAvailableContent";
    import AccountAvatar from "./AccountAvatar";

    export default {
        props: {
            booking: {},
            locationId: {
                type: String
            },
            service_date: {
                type: String
            },
            serviceIds: {
                type: Array
            },
            value: {}
        },
        components: {
            AccountAvatar,
            Avatar,
            TeamAvailableContent
        },
        data() {
            return {
                teams_tab: 'available',
                teams: [],
                team_members: [],
                loading: false,
                team_assignment: [],
                selected_members: [],
                confirmDialog: false,
                new_booking: false,
                available_teams: []
            }
        },
        watch: {
            'serviceIds'(val) {
                this.getTeamsOutlook()
            },
            'service_date'(val) {
                this.getTeamsOutlook()
            },
            'locationId'(val) {
                this.getTeamsOutlook()
            },
            'team_assignment'(val) {
                this.$emit('input', val)
            }
        },
        mounted() {
            (async () => {
                try {

                    if (this.booking) {

                        this.loading = true
                        this.teams = await this.loadTeams()
                        this.team_members = await this.loadTeamMembers()

                        //always load from remote
                        this.results = (await this.axios.get('/team_assignments', {
                            params: {
                                filter: {
                                    include: ["team"],
                                    where: {bookingId: this.booking.id}
                                }
                            }
                        })).data

                        this.results.forEach((team_assignment) => {
                            this.team_assignment.push({
                                teamId: team_assignment.teamId,
                                pay_rate: team_assignment.pay_rate,
                                pay_rate_type: team_assignment.pay_rate_type,
                                name: team_assignment.team.name,
                                team_model: team_assignment.team_model,
                                rate: team_assignment.team.rate,
                                bookingId: team_assignment.bookingId,
                                companyId: team_assignment.companyId
                            })
                        })

                        this.getTeamsOutlook(this.booking.locationId, this.booking.service_date, this.booking.serviceIds)

                        this.loading = false
                    } else {
                        //this is where there's no booking so using date
                        this.loading = true
                        this.teams = await this.loadTeams()
                        this.team_members = await this.loadTeamMembers()
                        this.loading = false

                        this.team_assignment = this.value
                        if (this.locationId && this.service_date && this.serviceIds)
                            this.getTeamsOutlook(this.locationId, this.service_date, this.serviceIds)

                    }

                } catch (err) {
                    this.loading = false
                }
            })()
        },
        methods: {
            close() {
                this.$emit('closed')
            },
            loadTeams() {
                return new Promise((resolve, reject) => {
                    this.axios
                        .get('/companies/current/teams')
                        .then(res => {
                            resolve(res.data)
                        })
                        .catch(err => {
                            reject(err)
                        })
                        .then()
                })
            },
            loadTeamMembers() {
                return new Promise((resolve, reject) => {
                    this.axios
                        .get('/companies/current/accounts',
                            {
                                params: {
                                    filter: {
                                        where: {
                                            role: 'r_team'
                                        }
                                    }
                                }
                            }
                        )
                        .then(res => {
                            resolve(res.data)
                        })
                        .catch(err => {
                            reject(err)
                        })
                        .then()
                })
            },

            isSelected(team, is_team) {
                let member = this.team_assignment.find((mbr) => {
                    return mbr.teamId == team.id
                })
                return !!member
            },
            selectTeam(team, is_team, shift) {


                if (this.isSelected(team)) {
                    // remove
                    let index = false
                    for (let x = 0; x < this.team_assignment.length; x++) {
                        if (this.team_assignment[x].teamId === team.id) {
                            index = x
                        }
                    }

                    if (index !== false) {
                        this.team_assignment.splice(index, 1)
                    }
                } else {
                    this.team_assignment.push({
                        teamId: team.id,
                        pay_rate: team.pay_rate,
                        pay_rate_type: team.pay_rate_type,
                        name: (is_team) ? team.name : team.fullname,
                        team_model: (is_team) ? 'team' : 'account',
                        rate: team.rate,
                        bookingId: this.booking ? this.booking.id : false,
                        companyId: this.booking ? this.booking.companyId : false
                    })
                }


            },

            getEarned(team) {
                if (team.pay_rate_type === 'percent') return parseFloat((this.booking.charge.total_before_tax * (team.pay_rate / 100)).toFixed(2))
                else if (team.pay_rate_type === 'hourly') {
                    return parseFloat((team.pay_rate * (this.booking.duration / 60)).toFixed(2))
                }
            },

            deleteRow(index, team_assignment, assignment_id) {
                // if it has no assignment id it means it hasn't been commited to server yet. So just remove from the list

                // existence of assignment id means that this was from db so should be confirmed prior to deletion
                this.$confirm('Do you want to unassign this team?', 'Warning', {
                    confirmButtonText: 'Yes, Remove Team',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    this.team_assignment = false
                    this.axios
                        .delete('/companies/current/team_assignments/' + assignment_id)
                        .then()
                        .catch()
                        .then()
                })
            },
            updateSchedule() {



                this.axios
                    .post('/bookings/assign-teams', {
                        bookingId: this.booking.id,
                        assignments: this.team_assignment
                    })
                    .then(res => {
                        this.$emit('updated')
                        this.$emit('closed')
                    })
                    .catch(err => {
                        this.loading = false
                    })
                    .finally(_ => {
                        this.loading = false
                    })
            },
            getTeamName(teamId) {
                let team = this.teams.find(team => {
                    return team.id === teamId
                })
                if (team) return team.name
                else return ''
            },
            getTeamsOutlook(locationId, service_date, serviceIds) {

                if (!this.service_date && !service_date) return

                this.loading = true
                this.axios.get('/bookings/teams-availability',
                    {
                        params: {
                            locationId: this.locationId || locationId,
                            service_date: this.service_date || service_date,
                            serviceIds: this.serviceIds || serviceIds,
                            bookingId: this.booking ? this.booking.id : false
                        }
                    })
                    .then(res => {
                        this.available_teams = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => this.loading = false)
            },

            getTooltip(team) {
                //

                let str = "Reasons <br/>"
                team.data.forEach((item) => {
                    str += item.date + ": " + item.reason
                })

                return str
            }

        }
    }
</script>

<style lang="scss">
    .booking-teams-assignment {


        .el-card__header {
            padding: 20px 0px;
            border-bottom: 1px solid #EBEEF5;
        }

        .team-card {
            position: relative;
            cursor: pointer;


            &.selected {
                background: #fff8e1;
            }

            .team-wage {
                font-size: 10px;
            }

            i.el-icon-circle-check {
                position: absolute;
                right: 10px;
                bottom: 10px;
                font-size: 24px;
            }

            .el-card__body {
                padding: 10px;
                height: 35px;

                .el-avatar {
                    float: left;
                    margin-right: 5px;
                }

                .team-content {
                    width: calc(100% - 58px);
                    display: inline-block;

                    span:not(.el-rate__item) {
                        display: block;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                }
            }
        }

        .el-tab-pane {
            min-height: auto !important;;
        }

        .el-table .cell {
            font-size: 13px !important;
            font-weight: 600;
        }

        .el-input-group__prepend {
            .el-select {
                width: 100px;
            }
        }

        /* .el-input__suffix {
               right: 0;
               top: 0;
               left: 14px;
             }*/
    }
</style>
