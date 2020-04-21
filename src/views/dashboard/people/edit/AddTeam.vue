<template>
    <div class="app-section add-teams">
        <el-card :body-style="{padding: '15px'}">
            <el-page-header @back="$router.back()">
                <div slot="content">
         <span class="modal-title" v-if="!$route.params.id">
            Add a new Team
          </span>
                    <span class="modal-title" v-if="$route.params.id">
            Editing Team
          </span>
                </div>
            </el-page-header>
        </el-card>

        <div class="modal-body add-teams">
            <el-row :gutter="20" class="full-height  " v-loading="loading">
                <el-col :md="16" :sm="16" :xs="24">
                    <el-card>
                        <el-row class="full-width padding-2x bg-white">
                            <el-col>

                                <el-form :model="selectedTeam" :rules="rules" class="full-width" label-position="top" ref="teamFrm">
                                    <el-row :gutter="40">
                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item label="Team Name" prop="name">
                                                <el-input v-model="selectedTeam.name"/>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="12" :sm="12" :xs="24">
                                            <el-form-item label="Team Lead">
                                                <team-select :members-only="true" v-model="selectedTeam.leadIds"></team-select>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="12" :sm="12" :xs="24">
                                            <el-form-item label="Team Members" prop="memberIds">
                                                <team-select :members-only="true" v-model="selectedTeam.memberIds"></team-select>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="12" :sm="12" :xs="24">
                                            <el-form-item label="Team Locations">
                                                <el-select filterable multiple v-model="selectedTeam.locationIds">
                                                    <el-option :key="location.id" :label="location.name" :value="location.id" v-for="location in company_locations"/>
                                                </el-select>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="12" :sm="12" :xs="24">
                                            <el-form-item label="Team Services">
                                                <el-select filterable multiple v-model="selectedTeam.serviceIds">
                                                    <el-option v-if="service.active" :key="service.id" :label="service.name" :value="service.id" v-for="service in company_services"/>
                                                </el-select>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="12" :sm="12" :xs="24">
                                            <el-row :gutter="10">
                                                <el-col :md="12" :sm="12" :xs="24">
                                                    <el-form-item label="Pay Rate" prop="pay_rate_type">
                                                        <el-select v-model="selectedTeam.pay_rate_type">
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
                                                    <el-form-item label="At" prop="pay_rate" required>
                                                        <el-input type="number" v-model="selectedTeam.pay_rate">
                                                            <div slot="prepend">
                                                                {{ selectedTeam.pay_rate_type === "percent" ? "%" : $currency + "/hr" }}
                                                            </div>
                                                        </el-input>
                                                    </el-form-item>
                                                </el-col>
                                            </el-row>
                                        </el-col>

                                        <el-col>
                                            <el-divider>Additional Options</el-divider>
                                        </el-col>

                                        <el-col :md="12" :sm="12" :xs="24">
                                            <el-form-item label="Pay rate priority">
                                                <el-checkbox v-model="selectedTeam.use_team_rate">
                                                    Use team rate for pay calculation
                                                </el-checkbox>
                                            </el-form-item>
                                            <el-form-item label="Team Color">
                                                <el-color-picker v-model="selectedTeam.color"/>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="12" :sm="12" :xs="24">
                                            <el-form-item label="Team Lead">
                                                <p>
                                                    <el-checkbox v-model="selectedTeam.lead_assign_booking">
                                                        can assign booking
                                                    </el-checkbox>
                                                </p>
                                                <p>
                                                    <el-checkbox v-model="selectedTeam.lead_manage_member">
                                                        can add members
                                                    </el-checkbox>
                                                </p>
                                            </el-form-item>

                                        </el-col>

                                    </el-row>

                                    <el-button @click="saveTeam()" size="small" class="block-center" round type="primary">
                                        Save Team
                                    </el-button>
                                </el-form>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>
                <side-help/>
            </el-row>
        </div>
    </div>
</template>

<script>
    import moment from 'moment'
    import SideHelp from '../../../components/SideHelp'
    import TeamSelect from "../../../../components/TeamSelect";

    export default {
        name: 'Teams',
        components: {TeamSelect, SideHelp},
        props: {},
        data() {
            return {
                teams: [],
                selectedTeam: {
                    name: '',
                    leadIds: [],
                    memberIds: [],
                    serviceIds: [],
                    locationIds: [],
                    use_team_rate: false,
                    lead_assign_booking: true,
                    lead_manage_member: true,
                    pay_rate: 0,
                    pay_rate_type: 'percent',
                },
                company_locations: [],
                company_services: [],
                accounts: [],
                openForm: '1',
                remote_loading: false,
                moment: moment,
                loading: false,
                rules: {
                    name: [{
                        message: 'Name is required',
                        required: true
                    }],
                    pay_rate: [
                        {
                            validator: (value, rule, callback) => {

                                if (this.selectedTeam.pay_rate === '') {
                                    return callback(new Error("Pay rate is required"))
                                }

                                if (this.selectedTeam.pay_rate < 0) {
                                    return callback(new Error('Pay rate cannot be less than 0'))
                                }
                                if (this.selectedTeam.pay_rate_type === 'percent' && this.selectedTeam.pay_rate > 100) {
                                    return callback(new Error('Percentage rate cannot be more than 100'))
                                }
                                return callback()
                            }
                        }
                    ],
                    pay_rate_type: [{
                        message: 'Type of rate is required',
                        required: true
                    }],
                    memberIds: [{
                        message: 'At least one member is required',
                        required: true
                    }]
                },
                showModal: true
            }
        },
        created() {
            this.axios
                .get('/companies/current/locations')
                .then(res => {
                    this.company_locations = res.data
                })
                .catch(err => {
                })

            this.axios
                .get('/companies/current/services',
                    {
                        params: {
                            filter: {
                                where: {active: true}
                            }
                        }
                    })
                .then(res => {
                    this.company_services = res.data
                })
                .catch(err => {
                })

            this.getAccounts('start')
            this.reloadTeams()
        },
        mounted() {
            if (this.$route.params.id) {
                this.axios.get('/companies/current/teams/' + this.$route.params.id).then(res => {
                    this.selectedTeam = res.data
                })
            }
            this.showModal = true
        },
        methods: {
            resetForm() {
                this.selectedTeam = {
                    name: '',
                    leadIds: [],
                    memberIds: [],
                    serviceIds: [],
                    locationIds: [],
                    use_team_rate: false,
                    lead_assign_booking: true,
                    lead_manage_member: true,
                    pay_rate: 0,
                    pay_rate_type: 'percent',
                }
            },
            reloadTeams() {
                this.loading = true
                this.axios
                    .get('/companies/current/teams')
                    .then(res => {
                        this.teams = res.data
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false
                    })
            },
            saveTeam() {
                this.$refs.teamFrm.validate(valid => {
                    if (valid) {
                        if (this.selectedTeam.hasOwnProperty('id')) {
                            this.axios
                                .patch('/teams/' + this.selectedTeam.id, this.selectedTeam)
                                .then(res => {
                                    this.$router.back()
                                    // this.resetForm();
                                    // this.reloadTeams();
                                })
                                .catch(err => {
                                })
                                .then(() => {
                                    this.$events.emitEvent('reload-teams')
                                })
                        } else {
                            this.axios
                                .post('/companies/current/teams', this.selectedTeam)
                                .then(res => {
                                    this.$router.back()
                                })
                                .catch(err => {
                                })
                                .then(() => {
                                    this.$events.emitEvent('reload-teams')
                                })
                        }
                    }
                })
            },
            getAccounts(query) {
                if (query !== '') {
                    this.remote_loading = true
                    this.axios
                        .get('/companies/current/accounts', {
                            params:
                                {
                                    filter: {
                                        include: ['addresses'],
                                        where: {
                                            active: true
                                        }
                                    }
                                }
                        })
                        .then(res => {
                            this.accounts = res.data
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.remote_loading = false
                        })
                } else {
                    this.accounts = []
                }
            },
            removeFromTeamMembers(lead) {
                this.accounts.forEach((user, index) => {
                    if (user.id === lead[0]) {
                        console.log("sdhgskjgflsghdsf");
                        this.$remove(user)
                    }

                })


            }
        }
    }
</script>

<style lang="scss" src="./styles/Teams.scss"></style>
