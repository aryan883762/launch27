<template>
    <div class="team-select-container">
        <el-select placeholder="All Teams" style="width: 100%;" size="small" :loading="loading" :remote-method="selectRemoteMethod" @change="selectTeam" :class="additionalClass"
                   automatic-dropdown :filterable="filterable" loading-text="querying teams" :multiple="multiple" :collapse-tags="collapseTags"
                   popper-class="team-select-popup"
                   remote v-model="teamIds">
            <el-option-group
                    :key="getKey()"
                    :label="group.label"
                    v-for="group in group_options">
                <el-option
                        :key="getKey()"
                        :label="team.name || team.fullname"
                        :value="team.id"
                        v-for="team in group.options">
                    <account-avatar :account="team" body-class="pull-left" :size="20"></account-avatar>
                    <div class="select-content">
                        <span>{{team.name || team.fullname}}</span>
                        <el-rate disabled v-model="team.rating"></el-rate>
                    </div>
                </el-option>
            </el-option-group>
        </el-select>
        <div class="action-links" v-if="showAddTeams">
            <el-link @click="newAccount()" size="mini" type="primary">Add new Team Account</el-link>
        </div>

    </div>
</template>

<script>
    import AccountAvatar from "./AccountAvatar";

    const uuidv1 = require('uuid/v1');

    export default {
        components: {AccountAvatar},
        props: {
            value: {
                required: true
            },
            membersOnly: {
                type: Boolean,
                default: false
            },
            showPreferred: {
                type: Boolean,
                default: false
            },
            accountId: String,
            multiple: {
                type: Boolean,
                default: true
            },
            keyPrefix: {
                type: String
            },
            additionalClass: {
                type: String
            },
            collapseTags: {
                type: Boolean,
                default: false
            },
            showAddTeams: {
                type: Boolean,
                default: true
            },
            filterable: {
                type: Boolean,
                default: true
            }
        },
        watch: {
            'accountId'(val) {
                this.initLoadTeams()
            },
            'value'(val) {
                this.$nextTick(() => {
                    this.teamIds = val
                })
            }
        },
        data() {
            return {
                teams: [],
                teamAccounts: [],
                teamsPreferred: [],
                teamIds: [],
                group_options: [],
                loading: false
            }
        },

        created() {
            this.initLoadTeams()
        },

        methods: {
            initLoadTeams(search, query) {
                (async () => {
                    try {
                        this.loading = true

                        this.teams = []
                        this.teamAccounts = []
                        this.teamsPreferred = []

                        this.group_options = []

                        if (!search) {
                            if (!this.membersOnly)
                                this.teams = await this.getTeams()


                            this.teamAccounts = await this.getTeamAccounts()
                        } else {
                            if (!this.membersOnly)
                                this.teams = await this.searchTeams(query)


                            this.teamAccounts = await this.searchTeamAccounts(query)
                        }

                        if (this.showPreferred) {
                            this.teamsPreferred = await this.getPreferredTeams()
                        }

                        if (this.teamsPreferred.length > 0) {
                            this.group_options.push({
                                label: "Preferred Teams",
                                options: this.teamsPreferred
                            })
                        }


                        if (this.teams.length > 0) {
                            this.group_options.push({
                                label: "Teams",
                                options: this.teams
                            })
                        }

                        if (this.teamAccounts.length > 0) {
                            this.group_options.push({
                                label: "Team Members",
                                options: this.teamAccounts
                            })
                        }

                        this.$nextTick(() => {
                            this.teamIds = this.value
                        })

                        this.loading = false

                    } catch (err) {
                        this.loading = false
                    }
                })()
            },
            getTeams() {
                return new Promise((resolve, reject) => {
                    this.axios.get('/companies/current/teams',
                        {
                            params: {
                                filter: {
                                    where: {
                                        active: true
                                    }
                                }
                            }
                        })
                        .then(res => {
                            resolve(res.data)
                        })
                        .catch((err) => {
                            reject(err)
                        })
                        .finally(() => {
                        })
                })

            },


            getTeamAccounts() {
                return new Promise((resolve, reject) => {
                    this.axios.get('/companies/current/accounts',
                        {
                            params: {
                                filter: {
                                    where: {
                                        active: true,
                                        role: 'r_team'
                                    }
                                }
                            }
                        })
                        .then(res => {
                            resolve(res.data)
                        })
                        .catch((err) => {
                            reject(err)
                        })
                        .finally(() => {
                        })
                })

            },

            getPreferredTeams() {
                return new Promise((resolve, reject) => {
                    if (this.accountId) {
                        this.axios.get('/accounts/' + this.accountId + '/teams_preferred',
                            {
                                params: {
                                    filter: {
                                        where: {
                                            active: true,
                                        }
                                    }
                                }
                            })
                            .then(res => {
                                resolve(res.data)
                            })
                            .catch((err) => {
                                reject(err)
                            })
                            .finally(() => {
                            })
                    } else {
                        resolve([])
                    }
                })
            },

            selectTeam(val) {
                this.$emit('input', val)
                this.$emit('change', val)
            },

            selectRemoteMethod(queryString) {
                this.initLoadTeams(true, queryString)
            },
            searchTeamAccounts(queryString) {
                return new Promise((resolve, reject) => {
                    this.axios
                        .get('/accounts', {
                            params: {
                                filter: {
                                    fields: {
                                        email: true,
                                        id: true,
                                        first_name: true,
                                        last_name: true,
                                        fullname: true,
                                        company: true,
                                        rating: true,
                                        avatar: true
                                    },
                                    limit: 10,
                                    where: {
                                        or: [
                                            {
                                                email: {
                                                    like: queryString,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                first_name: {
                                                    like: queryString,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                last_name: {
                                                    like: queryString,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                company: {
                                                    like: queryString,
                                                    options: 'i'
                                                }
                                            }
                                        ],
                                        role: 'r_team'
                                    }
                                }
                            }
                        })
                        .then(res => {
                            resolve(res.data)
                        })
                        .catch(err => {
                            reject(err)
                        })
                        .finally(() => {
                        })
                })

            },
            searchTeams(queryString) {
                return new Promise((resolve, reject) => {
                    this.axios
                        .get('/companies/current/teams', {
                            params: {
                                filter: {
                                    fields: {
                                        id: true,
                                        name: true,
                                        rating: true,
                                        color: true
                                    },
                                    limit: 10,
                                    where: {
                                        or: [
                                            {
                                                name: {
                                                    like: queryString,
                                                    options: 'i'
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        })
                        .then(res => {
                            resolve(res.data)
                        })
                        .catch(err => {
                            reject(err)
                        })
                        .finally(() => {
                        })
                })

            },
            newAccount() {
                this.$router.push(
                    {path: '/dashboard/accounts/add', query: {team: true}}
                )
            },
            getKey(id) {
                return uuidv1()
            }
        }
    }
</script>


<style lang="scss">
    .team-select-container {
        display: inline-block;

        .el-link {
            line-height: initial;
            font-size: 11px !important;
        }

        .action-links {
            position: relative;
            top: -10px;
        }
    }

    .team-select-popup {

        .el-select-group__title {
            color: black;
            font-weight: 500;
        }

        .el-select-group .el-select-dropdown__item {
            height: 35px;
            padding: 5px 20px;
        }

        .select-content {
            width: calc(100% - 32px);
            margin-left: 10px;
            display: inline-block;
            line-height: 1;

            span {
                font-size: 12px;
            }
        }
    }
</style>