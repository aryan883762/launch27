<template>
    <div class="app-section people">

        <el-card style="border:none;margin-bottom: 5px;">
            <el-row>
                <el-col class="bg-white text-center">
                    <div class="pull-left main-filters">
                        <el-input autocomplete="nope" class="filter small  header-search" name="customer-search"
                                  placeholder="Search by name, email, phone" style="width: 300px;"
                                  v-model="searchQuery"></el-input>
                    </div>

                    <div class="pull-right main-filters">

                        <el-dropdown @click="importAccounts()" @command="handleImport" plain round size="mini"
                                     split-button style="margin-right: 10px;" type="primary">
                            Import
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item
                                        :command="{ path: '/dashboard/accounts/import', query: { customer: true } }">
                                    Customers
                                </el-dropdown-item>
                                <el-dropdown-item
                                        :command="{ path: '/dashboard/accounts/import', query: { team: true } }">
                                    Team Members
                                </el-dropdown-item>
                                <el-dropdown-item
                                        :command="{ path: '/dashboard/accounts/import', query: { staff: true } }">
                                    Staff
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>

                        <el-dropdown @click="addNewPerson()" @command="handleDropDown" plain round size="mini"
                                     split-button style="margin-right: 10px;" type="warning">
                            Add New
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item
                                        :command="{ path: '/dashboard/accounts/add', query: { customer: true } }">
                                    Customer
                                </el-dropdown-item>
                                <el-dropdown-item :command="{ path: '/dashboard/accounts/add', query: { team: true } }">
                                    Team Member
                                </el-dropdown-item>
                                <el-dropdown-item
                                        :command="{ path: '/dashboard/accounts/add', query: { staff: true } }">
                                    Staff
                                </el-dropdown-item>
                                <el-dropdown-item
                                        :command="{ path: '/dashboard/accounts/add', query: { accountant: true } }">
                                    Accountant
                                </el-dropdown-item>
                                <el-dropdown-item
                                        :command="{ path: '/dashboard/accounts/add', query: { marketer: true } }">
                                    Marketer
                                </el-dropdown-item>
                                <el-dropdown-item
                                        :command="{ path: '/dashboard/accounts/add', query: { developer: true } }">
                                    Developer
                                </el-dropdown-item>
                                <el-dropdown-item :command="{ path: '/dashboard/accounts/add_team' }">
                                    Team
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>


                        <el-button @click="$router.push({name : 'dashboard_people_leads'})" plain round size="mini"
                                   style="margin-left: 10px" type="warning">View Leads & Quote Enquiries
                        </el-button>


                    </div>
                </el-col>
            </el-row>

        </el-card>


        <el-row class="full-width">
            <el-col :md="5" :sm="6" :xs="24" class="border-shadow">
                <div class="flew-row" style="padding: 10px 10px 5px;">
                    <el-row>
                        <el-col :sm="12">
                            <el-select class="small filter" style="width:auto;" @change="saveFilter" v-model="people_filter">
                                <el-option label="Accountant" value="r_accountant"/>
                                <el-option label="Administrators" value="r_admin"/>
                                <el-option label="Customers" value="r_customer"/>
                                <el-option label="Developer" value="r_developer"/>
                                <el-option label="Marketer" value="r_marketer"/>
                                <el-option label="Staff" value="r_staff"/>
                                <el-option label="Team Member" value="r_team"/>
                            </el-select>
                        </el-col>
                        <el-col :sm="12">
                            <el-select class="small filter" style="margin-left: 10px;width:auto;" v-model="active_filter">
                                <el-option label="Active" value="active"/>
                                <el-option label="Archived" value="archived"/>
                                <el-option label="Blocked" value="blocked"/>
                            </el-select>
                        </el-col>
                    </el-row>
                </div>


                <ul class="people-list" v-loading="loading">
                    <el-scrollbar wrap-class="list" view-class="view-box" :native="false" :style="{ maxHeight: (windowHeight - 280) + 'px', height: (windowHeight - 280) + 'px', overflow: 'hidden'}">
                        <li :class="{ active: account.id == selectedAccount.id }" @click="selectAccount(account.id)"
                            v-for="account in accounts">
                            <el-avatar :size="32" :src="account.avatar" class="profile-avatar" fit="contain"
                                       v-if="account.avatar"/>
                            <avatar :size="32" :username="account.fullname" class="pull-left profile-avatar" color="white"
                                    v-if="!account.avatar"/>
                            <div style="    width: calc(100% - 50px); display: inline-block;">
                                <span>{{ account.fullname }}</span>
                                <small style="color:black;" v-if="account.phone">(<i class="el-icon-phone"></i>
                                    {{account.phone}})</small>
                                <small style="letter-spacing: -0.5px !important;">{{ account.roleName }} {{
                                    $moment(account.created_at).fromNow() }}</small>

                                <small v-if="!account.active">
                                    <el-tag effect="dark" size="mini" type="info">archived</el-tag>
                                </small>
                                <small v-if="account.blocked">
                                    <el-tag effect="dark" size="mini" type="danger">blocked</el-tag>
                                </small>


                            </div>
                        </li>
                        <li class="padding-2x text-center" v-if="!loading && accounts.length == 0">
                            No records found
                        </li>
                    </el-scrollbar>
                </ul>

            </el-col>

            <el-col :md="19" :sm="18" :xs="24">
                <el-scrollbar wrap-class="list" view-class="view-box" :native="false" :style="{ maxHeight: (windowHeight - 220) + 'px', height: (windowHeight - 220) + 'px', overflow: 'hidden'}">

                    <el-radio-group @change="changeTab" class="sub-view-links" style="text-align:right;"
                                    v-if="selectedAccount" v-model="active_tab">
                        <el-radio-button :disabled="!selectedAccount" label="dashboard_people_appointments">
                            Appointments
                        </el-radio-button>
                        <el-radio-button :disabled="!selectedAccount" label="people_teams"
                                         v-if="selectedAccount.role === 'r_customer'">
                            Teams
                        </el-radio-button>
                        <el-radio-button :disabled="!selectedAccount" label="people_address">
                            Addresses
                        </el-radio-button>
                        <el-radio-button :disabled="!selectedAccount" label="people_notes">
                            Notes
                        </el-radio-button>
                        <!-- <el-radio-button label="people_messages">
                           Messages
                         </el-radio-button>-->
                        <el-radio-button label="people_stats">
                            Stats
                        </el-radio-button>
                    </el-radio-group>

                    <el-row style="margin-top : 10px; margin-left : 0px;" v-loading="selected_loading">

                        <no-data :show="!selectedAccount && !selected_loading"></no-data>

                        <el-col :md="6" :sm="6" :xs="24">
                            <person-details :person-details.sync="selectedAccount"/>
                        </el-col>

                        <el-col :md="18" :sm="18" :xs="24">
                            <el-card class="people-content-container" style="min-height: 700px;" v-if="selectedAccount">
                                <router-view/>
                            </el-card>
                        </el-col>
                    </el-row>
                </el-scrollbar>
            </el-col>

            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records"
                                   @current-change="loadPeopleList" background layout="total, prev, pager, next"/>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import PersonDetails from './Details.vue'
    import Avatar from 'vue-avatar'
    import {VclFacebook, VclBulletList} from 'vue-content-loading'

    import SideHelp from '../../components/SideHelp'
    import NoData from "../../../components/NoData";

    export default {
        components: {
            NoData,
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
                active_tab: 'dashboard_people_appointments',
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

            this.$events.emitEvent('track-page')
            // EVENTS
            this.$events.addListener('account-updated', this.personChangedEvent)
        },
        beforeMount() {
            //pre-load
            if (this.$storage.getItem('people_people_filter')) {
                this.people_filter = this.$storage.getItem('people_people_filter')
                this.active_filter = this.$storage.getItem('people_active_filter')
            }

        },
        beforeDestroy() {
            //set fitlers to storage
            this.$storage.setItem('people_people_filter', this.people_filter)
            this.$storage.setItem('people_active_filter', this.active_filter)
            this.$events.removeListener('account-updated', this.personChangedEvent)

        },
        mounted() {
            // auto mattically go to the appointments section
            this.active_tab = this.$route.name

            this.loadPeopleList()
        },

        methods: {
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
                this.loadPeopleList(this.current_page, true)

                //if id is not in the list then change selected account
            },

            loadPeopleList(current_page, list, query = '') {
                this.loading = true

                let filter = {
                    where: {role: this.people_filter},
                    include: ['teams_preferred', 'addresses', 'company'],
                    order: 'created_at DESC',
                    limit: 10
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


                        let found = this.accounts.find((x) => {
                            return x.id === this.selectedAccount.id
                        })

                        if (!list || !found) {
                            if (this.accounts.length > 0) {
                                this.selectedAccount = this.accounts[0]
                                this.$events.emitEvent('account-changed', [this.selectedAccount])
                                this.$router.push({
                                    name: 'dashboard_people_appointments_update',
                                    params: {id: this.selectedAccount.id}
                                })

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
                        this.active_tab = 'dashboard_people_appointments'
                        this.$router.push({
                            name: 'dashboard_people_appointments_update',
                            params: {id: id}
                        })

                        this.$emit('account-changed')
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.selected_loading = false
                    })
            },
            addNewPerson() {
                //{ path: '/dashboard/accounts/add', query: { customer: true } }
                let query = {}
                query[this.people_filter.substring(2)] = true
                this.$router.push({path: '/dashboard/accounts/add', query: query}).then().catch()
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
                                    },
                                    order: 'created_at DESC'
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
            },
            importAccounts() {

                return this.$message('Disabled in Early Look Preview')

                let query = {}
                query[this.people_filter.substring(2)] = true
                this.$router.push({path: '/dashboard/accounts/import', query: query}).then().catch()
            },
            handleImport(obj) {
                this.$router.push(obj)
            },
            saveFilter() {
                this.$storage.setItem('people_people_filter', this.people_filter)
                this.$storage.setItem('people_active_filter', this.active_filter)
            }
        }
    }
</script>

<style lang="scss">
    @import "./styles/People.scss";

    .app-section.people {

        margin-bottom: 0px;
        height: initial;

        .el-link {
            font-weight: normal;
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
