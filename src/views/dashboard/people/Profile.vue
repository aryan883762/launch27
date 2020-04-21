<template>
    <div class="app-section people">
        <el-card>
            <el-page-header @back="$router.back()">
                <div slot="content" v-if="selectedAccount" v-loading="selected_loading">
                     <span style="">{{selectedAccount.fullname}}</span>

                    <el-button style="max-width: 250px; margin-left: 25px;"  class="customer-appointment-btn" @click="$router.push({ name: 'dashboard_booking_new', query:{account_id : selectedAccount.id} })" type="primary" plain round size="mini" v-if="selectedAccount.role === 'r_customer'">
                        Book an Appointment
                    </el-button>
                </div>
            </el-page-header>
        </el-card>

        <el-row class="full-width">
            <el-col>
                <el-radio-group @change="changeTab" class="sub-view-links" v-model="active_tab">
                    <el-radio-button :disabled="!selectedAccount" label="dashboard_profile_appointments">
                        Appointments
                    </el-radio-button>
                    <el-radio-button :disabled="!selectedAccount" label="profile_teams">
                        Teams
                    </el-radio-button>
                    <el-radio-button :disabled="!selectedAccount" label="profile_address">
                        Addresses
                    </el-radio-button>
                    <el-radio-button :disabled="!selectedAccount" label="profile_notes">
                        Notes
                    </el-radio-button>
                    <!-- <el-radio-button label="people_messages">
                       Messages
                     </el-radio-button>-->
                    <el-radio-button :disabled="!selectedAccount" label="profile_stats">
                        Stats
                    </el-radio-button>
                </el-radio-group>

                <el-row style="margin-top : 10px; margin-left : 0px;" v-loading="selected_loading">

                    <el-col :md="6" :sm="6" :xs="24">
                        <person-details :person-details.sync="selectedAccount"/>
                    </el-col>

                    <el-col :md="18" :sm="18" :xs="24">
                        <el-card class="people-content-container" style="min-height: 700px;" v-if="selectedAccount">
                            <router-view/>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import PersonDetails from './ProfileDetails.vue'
    import Avatar from 'vue-avatar'
    import {VclFacebook, VclBulletList} from 'vue-content-loading'

    import SideHelp from '../../components/SideHelp'
    import AccountAvatar from "../../../components/AccountAvatar";

    export default {
        components: {
            AccountAvatar,
            PersonDetails,
            Avatar,
            VclBulletList,
            VclFacebook,
            SideHelp
        },
        data: () => {
            return {
                accounts: [],
                selectedAccount: false,
                loading: true,
                active_tab: 'dashboard_profile_appointments',
                selected_loading: false,
                current_page: 1,
                total_records: 0,
                page_size: 0,
                people_filter: 'r_customer',
                active_filter: 'active',
                searchQuery: ''
            }
        },
        watch: {
            '$route'(val) {
                this.loadAccountProfile(val.params.id)
            },
            people_filter(val) {
                this.loadPeopleList()
            },
            active_filter(val) {
                this.loadPeopleList()
            },
            searchQuery(val) {
                this.loadPeopleList(1, true, val)
            }
        },
        created() {
            this.loading = true

            // EVENTS
            this.$events.addListener('account-updated', this.personChangedEvent)
        },
        mounted() {
            this.loadAccountProfile(this.$route.params.id);
        },

        beforeDestroy() {
            this.$events.removeListener('account-updated', this.personChangedEvent)
        },

        methods: {
            loadAccountProfile(id){
                // auto mattically go to the appointments section
                this.axios
                    .get('/accounts/' + id, {params: {filter: {include: ['teams_preferred', 'addresses', 'company']}}})
                    .then(res => {
                        this.selectedAccount = res.data
                        this.selected_loading = false
                        this.active_tab = 'dashboard_profile_appointments'
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.selected_loading = false
                    })
            },
            changeTab(val) {
                this.$router.push({
                    name: val,
                    params: {
                        id: this.selectedAccount.id
                    }
                })
            },
            personChangedEvent(id) {
                this.selectAccount(id)
                //this.loadPeopleList(this.current_page, true)
            },

            loadPeopleList(current_page, list, query = '') {
                this.loading = true

                if (!current_page) current_page = this.current_page

                let filter = {
                    where: {role: this.people_filter},
                    fields: {
                        id: true,
                        email: true,
                        fullname: true,
                        first_name: true,
                        last_name: true,
                        role: true,
                        roleName: true,
                        created_at: true,
                        updated_at: true,
                        active: true,
                        phone: true,
                        blocked: true,
                        tagIds: true,
                        special_tax: true
                    },
                    include: ['teams_preferred', 'addresses', 'company']
                }

                if (query.length > 0) {
                    filter.where.or = [
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
                            phone: {
                                like: query,
                                options: 'i'
                            }
                        },
                    ]
                }

                if (this.active_filter !== 'blocked') {
                    filter.where.active = !!(this.active_filter === 'active')
                    filter.where.blocked = false
                } else {
                    filter.where.blocked = true
                }

                this.axios
                    .get('/companies/current/accounts', {
                        params: {
                            page: this.current_page,
                            filter: filter
                        }
                    })
                    .then(res => {
                        // assign list of people
                        this.accounts = res.data.data

                        this.total_records = res.data.meta.totalItemCount
                        this.page_size = res.data.meta.itemsPerPage

                        if (!list) {
                            if (this.accounts.length > 0) {
                                this.selectedAccount = this.accounts[0]
                                this.$events.emitEvent('account-changed', [this.selectedAccount])
                            } else {
                                this.selectedAccount = false
                            }
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
                    .then(() => {
                        this.loading = false
                    })
            },
            selectAccount(id) {
                this.selected_loading = true

                this.axios
                    .get('/accounts/' + id, {params: {filter: {include: ['teams_preferred', 'addresses', 'company']}}})
                    .then(res => {
                        this.selectedAccount = res.data
                        this.selected_loading = false
                        this.active_tab = 'dashboard_profile_appointments'
                        this.$router.push({
                            name: 'dashboard_profile_appointments',
                            params: {id: id}
                        })
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.selected_loading = false
                    })
            },
            addNewPerson() {
                this.$router.push({name: 'dashboard_profile_add'}).then().catch()
            },
            getRole(role) {
                switch (role) {
                    case 'r_team':
                        return 'Team Member'
                        break

                    case 'r_customer':
                        return 'Customer'
                        break

                    case 'r_admin':
                        return 'Administrator'
                        break

                    case ' r_staff':
                        return 'Staff'
                        break

                    case 'r_accountant':
                        return 'Accountant'
                        break
                }
            },
            querySearchAsync(queryString, cb) {
                if (queryString.trim().length === 0) {
                    this.axios
                        .get('/companies/current/accounts', {params: {filter: {include: ['teams_preferred']}}})
                        .then(res => {
                            cb(res.data)
                        })
                        .catch(err => {
                        })
                } else {
                    this.axios
                        .get('/companies/current/accounts', {
                            params: {
                                filter: {
                                    where: {
                                        'first_name': {
                                            like: queryString,
                                            options: 'i'
                                        }
                                    }
                                }
                            }
                        })
                        .then(res => {
                            cb(res.data)
                        })
                        .catch(err => {
                        })
                }
            },

            handleSearchSelect(item) {
                console.log(item)
            },
            handleDropDown(obj) {
                this.$router.push(obj)
            }
        }
    }
</script>

<style lang="scss">
    @import "./styles/People.scss";

    .app-section.people {
        .el-link {
            font-weight: normal;
        }


        .el-page-header__title {
            line-height: 28px;
        }

        .header-search {
            width: calc(100% - 7px);
            border-radius: 25px;
            box-sizing: content-box;
        }

        .no-users {
            a {
                font-size: 13px;
                color: $launch-primary-color;
            }
        }

        .people-divider {
            margin: 5px 0px;
        }

        .people-page-header {

            .el-card__body {

            }

            .el-radio-group {
                &.options {
                    .el-radio-button {
                        .el-radio-button__inner {
                            border: none;
                            font-size: 12px;
                            padding: 20px 30px;
                            text-transform: uppercase;
                            border-radius: 0px;
                            border-bottom: 2px solid white;
                        }

                        &.is-active {
                            .el-radio-button__inner {
                                background: white;
                                color: $launch-primary-color;
                                box-shadow: none;
                                border-bottom: 2px solid $launch-primary-color;
                            }
                        }
                    }
                }
            }
        }
    }

</style>
