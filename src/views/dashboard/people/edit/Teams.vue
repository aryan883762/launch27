<template>
    <div class="list-teams">

        <el-card :body-style="{display:'flex', 'justify-content':'space-between', width: '100%'}" class="flex-row" shadow="never" style="border:none; margin-bottom: 5px;">
            <el-select @change="getTeams()" class="filter small" v-model="filter_active">
                <el-option :value="true" label="Active"></el-option>
                <el-option :value="false" label="Archived"></el-option>
            </el-select>
            <div>
                <el-button @click="$router.push({name: 'dashboard_people_addteam'})" icon="el-icon-plus" plain round size="mini" type="success">Add New Team</el-button>
                <el-button @click="$router.push({'path': '/dashboard/settings/booking_spot/availability', query: {q: 'dashboard_teams'}})" size="mini" round type="primary" plain>Manage Availabilities</el-button>

            </div>
        </el-card>


        <el-scrollbar wrap-class="list" view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 200) + 'px', height: (windowHeight - 200) + 'px', overflow: 'hidden'}">

            <el-table :data="teams" v-if="!new_team" v-loading="loading">
                <el-table-column label="Date Created" prop="date">
                    <template slot-scope="scope">
                        {{ $moment(scope.row.created_at).format("DD/MM/YY") }}
                    </template>
                </el-table-column>
                <el-table-column label="team" prop="name" width="200">
                    <template slot-scope="scope">
                        <avatar :background-color="scope.row.color" :size="32" :username="scope.row.name" color="white" style="float:left"/>
                        <div class="name-container">
                            <label>{{ scope.row.name }}</label>
                            <el-rate disabled v-model="scope.row.rating"/>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="members" width="200">
                    <template slot="header" slot-scope="scope">
                        <el-tooltip placement="top" effect="dark">
                            <div slot="content">
                                These are the avatars of the members that belong in this team.<br/>
                                To quickly add another member, click the plus button.
                            </div>
                            <span>Team Members <i class="el-icon-info"></i></span>
                        </el-tooltip>
                    </template>
                    <template slot-scope="scope">
                        <ul class="overlapping">
                            <li v-for="(member, index) in scope.row.members" v-if="index < 3">
                                <el-tooltip :content="member.fullname" class="item" effect="dark" placement="top-start">
                                    <account-avatar :account="member" :size="32" body-class="pull-left"></account-avatar>
                                </el-tooltip>
                            </li>
                            <li v-if="scope.row.members.length > 3">
                                <el-avatar :size="32" color="#1fb6ff" style="background-color:#795548;">
                                    +{{ getMembersCount(scope.row.members.length) }}
                                </el-avatar>
                            </li>
                            <li style="margin-left : 0px;">
                                <el-popover
                                        placement="top"
                                        ref="member_popover"
                                        trigger="click"
                                        width="300">
                                    <div class="" style="text-align:left;">
                                        <small>Enter name or email of team member</small>
                                        <el-select :remote-method="searchAccounts" collapse-tags filterable multiple placeholder="" remote size="small" style="width: calc(100% - 65px);margin-right: 5px;" v-loading="remote_loading" v-model="newTeamIds">
                                            <el-option :key="team.id" :label="team.name" :value="team.id" v-for="(team,index) in search_teams"/>
                                            <el-button slot="append"></el-button>
                                        </el-select>

                                        <el-button @click="addTeamMember(scope.row)" size="mini" type="primary">Save</el-button>


                                    </div>
                                    <el-button circle icon="el-icon-plus" slot="reference" style="width: 32px;height: 32px;line-height: 32px;padding: 0;" type="warning"></el-button>
                                </el-popover>

                            </li>
                        </ul>
                    </template>
                </el-table-column>
                <el-table-column width="200">
                    <template slot="header" slot-scope="scope">
                        <el-tooltip placement="top" effect="dark">
                            <div slot="content">
                                When this says “yes” team lead has the ability to assign jobs to team members. <br/>
                                Set team leads on the edit team page
                            </div>
                            <span>Team Lead Can Assign Jobs <i class="el-icon-info"></i></span>
                        </el-tooltip>
                    </template>
                    <template slot-scope="scope">
                        {{(scope.row.lead_assign_booking) ? 'Yes' : 'No'}}
                    </template>
                </el-table-column>
                <el-table-column prop="addmembers" width="200">
                    <template slot="header" slot-scope="scope">
                        <el-tooltip placement="top" effect="dark">
                            <div slot="content">
                                When this says “yes” team lead has the ability to add team members to the platform. <br/>
                                Set team leads on the edit team page.
                            </div>
                            <span>Team Lead Can Add Members <i class="el-icon-info"></i></span>
                        </el-tooltip>
                    </template>
                    <template slot-scope="scope">
                        {{(scope.row.lead_manage_member) ? 'Yes' : 'No'}}
                    </template>
                </el-table-column>
                <el-table-column label="Status" prop="status">
                    <template slot-scope="scope">
                        <el-switch :active-value="true" :inactive-value="false" @change="setStatus($event, scope.row)" v-model="scope.row.active"/>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="scope">
                        <view-changes :id="scope.row.id"></view-changes>
                        <el-divider direction="vertical"></el-divider>
                        <el-link @click="editTeam(scope.row)" size="mini" type="primary">Edit</el-link>
                        <el-divider direction="vertical"></el-divider>
                        <el-link @click="$router.push({name: 'dashboard_settings_booking_spots_availability', query:{type:'team', 'id': scope.row.id, q : 'dashboard_teams'}})">Availabilities</el-link>
                    </template>
                </el-table-column>
            </el-table>

            <no-data :show.sync="teams.length === 0 && !loading"></no-data>
        </el-scrollbar>

        <el-col class="pagination-footer">
            <div class="cct">
                <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="getTeams" background layout="total, prev, pager, next"/>
            </div>
        </el-col>
    </div>
</template>

<script>
    import Avatar from 'vue-avatar'
    import ViewChanges from "../../../../components/ViewChanges";
    import AccountAvatar from "../../../../components/AccountAvatar";
    import NoData from "../../../../components/NoData";

    export default {
        components: {
            NoData,
            AccountAvatar,
            ViewChanges,
            Avatar
        },
        data: () => {
            return {
                teams: [],
                loading: true,
                filter_active: true,
                new_team: false,
                selectedTeam: {},
                current_page: 1,
                total_records: 0,
                page_size: 0,
                remote_loading: '',
                newTeamIds: [],
                search_teams: []
            }
        },
        watch: {
            teamStatus(val) {
                if (typeof val === 'boolean') {
                    this.getTeams()
                }
            },
            new_team(val) {
                /* if (val) {
                                         this.teamStatus = "";
                                       } else {
                                         this.teamStatus = true;
                                       } */
            }
        },
        beforeMount() {
            this.getTeams(1)
            /*  this.axios.get('/companies/current/accounts',
                  {
                      params: {
                          filter: {
                              where: {active: true, role: 'r_team'},
                              limit: 50
                          }
                      }
                  })
                  .then(res => {
                      this.search_teams = res.data
                  })
                  .catch(err => {
                  })*/
        },
        mounted() {
            this.$events.addListener('reload-teams', () => {
                this.new_team = false
                this.getTeams(1)
            })
        },
        created() {
        },
        methods: {
            addTeamMember(team) {
                // this is for adding a member to the team.
                // best to show a popup with members then they can add
                let data = team.memberIds.concat(this.newTeamIds)

                //unique elements
                data = [...new Set(data)];

                this.loading = true
                this.axios.patch('/teams/' + team.id,
                    {
                        memberIds: data
                    })
                    .then(res => {
                        this.newTeamIds = []
                        this.getTeams()
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                        this.loading = false
                    })
                    .finally(() => {

                    })

            },
            closePopover() {


            },
            editTeam(team) {
                this.$router.push({
                    name: 'dashboard_people_edit_team',
                    params: {id: team.id}
                })
            },
            getTeams() {
                this.loading = true

                this.axios
                    .get('/companies/current/teams', {
                        params: {
                            page: this.current_page,
                            filter: {
                                where: {active: this.filter_active},
                                include: 'members'
                            }
                        }
                    })
                    .then(res => {
                        this.teams = res.data.data
                        this.total_records = res.data.meta.totalItemCount
                        this.page_size = res.data.meta.itemsPerPage
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false
                    })
            },
            searchAccounts(query) {
                if (query !== '' && query.length > 1) {
                    this.remote_loading = true

                    this.axios.get('/companies/current/accounts',
                        {
                            params: {
                                filter: {
                                    where: {
                                        or: [
                                            {
                                                email: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                first_name: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                last_name: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                company: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                fullname: {
                                                    like: query,
                                                    options: "i"
                                                }
                                            }
                                        ],
                                        role: 'r_team',
                                        active: true
                                    }
                                }
                            }
                        })
                        .then(res => {
                            this.search_teams = res.data
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        })
                        .finally(() => {
                            this.remote_loading = false
                        })

                } else {
                    this.search_teams = []
                }
            },

            setStatus(status, team) {
                //

                this.loading = true
                this.axios
                    .put('/companies/current/teams/' + team.id, {
                        active: status
                    })
                    .then(res => {
                        this.getTeams()
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false
                    })
            },
            getMembersCount(count) {
                return (count - 3).toString()
            }
        }
    }
</script>

<style lang="scss">
    .list-teams {
        .el-radio-button__inner {
            border: none !important;
            border-bottom: 4px solid white !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            text-transform: uppercase;
            padding: 20px;
        }

        .name-container {
            float: right;
            width: calc(100% - 50px);

            label {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }

            .el-button {
                display: block;
                padding: 0;
                margin: 0;
                line-height: 1;
            }
        }

        .divider-line {
            height: 15px;
            background: #f4f8f9;
        }

        .el-radio-button {
            &.is-active {
                .el-radio-button__orig-radio:checked + .el-radio-button__inner {
                    background: white;
                    border: none !important;
                    border-bottom: 4px solid $launch-primary-color !important;
                    color: $launch-text-color;
                }
            }
        }

        .overlapping {
            list-style-type: none;
            margin: 0;
            padding: 0;

            &:hover {
                li:nth-child(n + 2) {
                    /*margin-left: -20px;*/
                }
            }

            li {
                display: inline-block;
                position: relative;
                width: 45px;
                height: 45px;
                -webkit-transition: 0.2s ease;
                transition: 0.2s ease;
                vertical-align: bottom;

                .el-avatar {
                    border: 2px solid white;
                    line-height: 38px;
                }

                /* width: 60px;
                         height: 60px;
                         border-radius: 50%;
                         border: 2px solid white;
                         display: inline-block;
                         position: relative;
                         box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2);
                         -webkit-transition: .2s ease;
                         transition: .2s ease;*/
            }

            li:nth-child(1) {
            }

            li:nth-child(2) {
            }

            li:nth-child(3) {
            }

            li:nth-child(4) {
            }

            li:nth-child(n + 2) {
                margin-left: -20px;
            }
        }
    }
</style>
