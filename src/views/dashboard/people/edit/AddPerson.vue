<template>
    <div class="app-section">
        <el-card :body-style="{padding: '15px'}">
            <el-page-header @back="goback()">
                <div slot="content">
          <span class="modal-title" v-if="!$route.params.id">
            Add a new Account
          </span>
                    <span class="modal-title" v-if="$route.params.id">
            Editing Account
          </span>
                </div>
            </el-page-header>
        </el-card>


        <el-row class="add-person-container" :gutter="10">
            <el-col :md="16" :sm="16" v-loading="loading">
                <el-scrollbar wrap-class="list" view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - heightOffset) + 'px', height: (windowHeight - heightOffset) + 'px', overflow: 'hidden'}">

                    <el-form :model="person" :rules="rules" class="full-width" label-position="top" ref="quickaddfrm">
                        <el-card>
                            <el-row :gutter="40">
                                <el-col :md="8" :sm="8" :xs="24">
                                    <el-form-item label="Email" prop="email">
                                        <el-input placeholder="e.g. id@domain.com" type="email" v-model="person.email"/>
                                    </el-form-item>
                                </el-col>
                                <el-col :md="8" :sm="8" :xs="24">
                                    <el-form-item label="Choose Role" v-loading="loading_roles">
                                        <el-select :disabled="!!person.id" placeholder="choose" v-model="person_type">
                                            <el-option :key="roleIndex" :label="role.name" :value="role.code" v-for="(role, roleIndex) in roles">

                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row :gutter="40">
                                <el-col :md="8" :sm="8" :xs="24">
                                    <el-form-item label="First name" prop="first_name">
                                        <el-input placeholder="e.g. John" v-model="person.first_name"/>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="8" :sm="8" :xs="24">
                                    <el-form-item label="Last name" prop="last_name">
                                        <el-input placeholder="e.g. Smith" v-model="person.last_name"/>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="8" :sm="8" :xs="24">
                                    <el-form-item label="Phone" prop="phone">
                                        <el-input placeholder="Phone" type="number" v-model="person.phone">
                                            <span slot="prepend" v-if="$auth.user().company.country"> ({{ $auth.user().company.country.emoji }} +{{ $auth.user().company.country.phone }}) </span>
                                            <span slot="prepend" v-else>(---)</span>
                                        </el-input>
                                    </el-form-item>
                                </el-col>

                            </el-row>


                        </el-card>

                        <el-card style="margin-top: 5px;">
                            <el-row :gutter="10">
                                <el-col :md="12" :sm="12" :xs="24" class="side-card" v-if="false">
                                    <el-card>
                                        <el-row :gutter="20" style="margin-bottom: 10px;" v-for="address in person.addresses">
                                            <el-col :md="10" :sm="10" :xs="24">
                                                <el-form-item label="Country" prop="country" v-show="false">
                                                    <el-select @change="onChange($event, address)" autocomplete="nope" disabled filterable placeholder="Country" size="small" v-model="address.country" value-key="name">
                                                        <el-option :key="country.name" :value="country.name" v-for="country in countries">
                                                            {{ country.emoji }} {{ country.name }} - {{ country.phone }}
                                                        </el-option>
                                                    </el-select>
                                                </el-form-item>
                                            </el-col>

                                            <el-col>
                                                <el-form-item label="Street" prop="street">
                                                    <el-input disabled v-model="address.street"/>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="8" :sm="8" :xs="24">
                                                <el-form-item label="City" prop="address">
                                                    <el-input disabled v-model="address.city"/>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="8" :sm="8" :xs="24">
                                                <country-states :disabled="true" v-model="address.state"/>
                                            </el-col>

                                            <el-col :md="8" :sm="8" :xs="24">
                                                <el-form-item label="Zip">
                                                    <el-input disabled v-model="address.zip"/>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </el-card>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24" class="side-card" v-if="person_type === 'r_customer'">
                                    <el-card>
                                        <el-form-item label="Company">
                                            <el-input v-model="person.company_name"/>
                                        </el-form-item>
                                    </el-card>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24" class="side-card" v-if="person_type === 'r_customer'">
                                    <el-card>
                                        <el-form-item label="Preferred Teams">
                                            <el-select :remote-method="getTeams" collapse-tags filterable multiple remote reserve-keyword v-loading="remote_loading" v-model="person.preferredTeams" value-key="fullname">
                                                <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in teams"/>
                                            </el-select>
                                        </el-form-item>
                                    </el-card>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24" class="side-card" v-if="person_type === 'r_customer'">
                                    <el-card>
                                        <el-form-item label="Marketing Source">
                                            <marketing-sources v-model="person.marketing_source"></marketing-sources>
                                        </el-form-item>
                                    </el-card>
                                </el-col>


                                <el-col :md="12" :sm="12" :xs="24" class="side-card" v-if="person_type === 'r_team'">
                                    <el-card>
                                        <el-row :gutter="10">
                                            <el-col :md="12" :sm="12" :xs="24">
                                                <el-form-item prop="pay_rate_type">
                                                    <span slot="label">Pay Rate <i style="color:red;">*</i></span>
                                                    <el-select v-model="person.pay_rate_type">
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
                                                <el-form-item prop="pay_rate">
                                                    <span slot="label">At <i style="color:red;">*</i></span>
                                                    <el-input type="number" v-model="person.pay_rate">
                                                        <span slot="prepend" v-if="person.pay_rate_type === 'percent'"> % </span>
                                                        <span slot="append" v-if="person.pay_rate_type === 'hourly'">{{ $currency }}/hr</span>
                                                    </el-input>
                                                </el-form-item>
                                            </el-col>
                                            <el-col :md="12" :sm="12" :xs="24">
                                                <el-form-item label="Team Member Color">
                                                    <el-color-picker v-model="person.color"/>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </el-card>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24" class="side-card" v-if="person_type === 'r_team'">
                                    <el-card>
                                        <el-form-item label="Add to new Team" v-if="!person.id">
                                            <el-checkbox v-model="person.team.add_team">
                                                Add new team
                                            </el-checkbox>
                                            <el-input placeholder="Team name" v-if="person.team.add_team" v-model="person.team.name"/>
                                        </el-form-item>
                                        <el-form-item label="Make Team Lead of">
                                            <el-select :remote-method="getTeams" collapse-tags filterable multiple remote reserve-keyword v-loading="remote_loading" v-model="person.teamLead">
                                                <el-option :key="team.id" :label="team.name" :value="team.id" v-for="(team,index) in teams" v-if="notMember(team.leadIds)"/>
                                            </el-select>
                                        </el-form-item>

                                        <small class="teams-list" v-if="account_teams.length > 0">Lead of</small>
                                        <el-tag @close="deleteMembership(team, true)" closable size="small" style="margin-right: 5px;margin-bottom:5px;" type="danger" v-for="team in account_teams" v-if="team.leadIds.find(x => {return x === account.id })">
                                            {{team.name}}
                                        </el-tag>
                                    </el-card>

                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24" class="side-card" v-if="person_type === 'r_team'">
                                    <el-card>
                                        <el-form-item label="Add to Teams">
                                            <el-select :remote-method="getTeams" collapse-tags filterable multiple remote reserve-keyword v-loading="remote_loading" v-model="person.teamMember">
                                                <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in teams" v-if="notMember(team.memberIds)"/>
                                            </el-select>
                                        </el-form-item>
                                        <small class="teams-list" v-if="account_teams.length > 0">Member of</small>
                                        <el-tag @close="deleteMembership(team, false)" closable size="small" style="margin-right: 5px;margin-bottom:5px;" type="warning" v-for="team in account_teams" v-if="team.memberIds.find(x => {return x === account.id })">
                                            {{team.name}}
                                        </el-tag>
                                    </el-card>
                                </el-col>


                            </el-row>

                            <el-button @click="savePerson()" class="block-center" round size="small" style="margin: 20px auto;" type="primary">
                                Save Account
                            </el-button>

                        </el-card>


                        <el-col :md="12" :sm="12" :xs="24">

                            <el-row v-if="person_type == 'r_team' ">

                            </el-row>

                            <el-row style="display: none">
                                <el-col>
                                    <el-card>
                                        <el-form-item class="add-note-box">
                                            <el-input placeholder="Write your notes here" rows="5" type="textarea" v-model="person.notes"/>
                                            <el-button-group>
                                                <el-button class="text-button" icon="el-icon-paperclip" size="mini" type="text"/>
                                                <el-button class="text-button" icon="el-icon-picture-outline" size="mini" type="text"/>
                                                <el-button class="text-button" icon="el-icon-s-custom" size="mini" type="text">
                                                    Add to Booking
                                                </el-button>
                                            </el-button-group>
                                        </el-form-item>
                                    </el-card>
                                </el-col>
                            </el-row>
                        </el-col>


                    </el-form>

                </el-scrollbar>
            </el-col>

            <el-col :md="8" :sm="8" class="permissions-list-section">
                <el-scrollbar wrap-class="list" view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - heightOffset) + 'px', height: (windowHeight - heightOffset) + 'px', overflow: 'hidden'}">

                    <el-card>

                        <el-row v-loading="loading_permissions">
                            <h5>Default Role Permissions</h5>
                            <el-divider/>
                            <el-row>
                                <el-col :key="permissionIndex" class="permissions-checkbox-group" v-for="(permission, permissionIndex) in permissions">
                                    <el-button :disabled="person_type  == 'r_customer' || is_owner" @click="togglePermissionActive(permission)" type="text" v-if="permission.active">
                                        <i class="el-icon-remove-outline"/>
                                    </el-button>
                                    <el-button :disabled="person_type  == 'r_customer' || is_owner" @click="togglePermissionActive(permission)" type="text" v-if="!permission.active">
                                        <i class="el-icon-circle-plus-outline"/>
                                    </el-button>
                                    <el-checkbox :disabled="!permission.active" v-model="permission.access">
                                        {{ permission.human }}
                                    </el-checkbox>
                                </el-col>
                            </el-row>
                        </el-row>
                    </el-card>
                </el-scrollbar>

            </el-col>

        </el-row>

    </div>
</template>

<script>
    import {countries} from 'countries-list'
    import CountryStates from '../../../../components/CountryStates'
    import SideHelp from "../../../components/SideHelp";
    import MarketingSources from "../../../../components/MarketingSources";

    export default {
        name: 'AddPerson',
        props: {},
        components: {
            MarketingSources,
            SideHelp,
            CountryStates
        },
        data() {
            return {
                person_type: '',
                account: false,
                person: {
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    country: '',
                    country_code: '',
                    country_full: false,
                    addresses: [
                        {
                            phone: '',
                            street: '',
                            city: '',
                            state: '',
                            zip: '',
                            country: '',
                            country_code: '',
                            country_full: false
                        }
                    ],
                    notes: '',
                    marketing_source: '',
                    teamLead: [],
                    teamMember: [],
                    pay_rate_type: '',
                    pay_rate: '',
                    preferredTeams: [],
                    team: {
                        name: '',
                        add_team: false
                    },
                    company_name: ''
                },
                quickAddButton: true,
                rules: {
                    first_name: [{
                        message: 'First name is required',
                        required: true
                    }],
                    last_name: [{
                        message: 'Last name is required',
                        required: true
                    }],
                    email: [
                        {
                            message: 'Email is required',
                            required: true
                        },
                        {
                            type: 'email',
                            message: 'Please provide a valid email',
                        }],
                    phone: [
                        {
                            message: 'Phone number is required',
                            required: true
                        }
                    ],
                    pay_rate_type: [{
                        validator: (rule, value, callback) => {

                            if (this.person_type !== 'r_team') return callback()

                            if (this.person.pay_rate_type === '') {
                                return callback(new Error(" Rate Type is required"))
                            }
                            return callback()
                        }
                    }],
                    pay_rate: [{
                        validator: (rule, value, callback) => {

                            if (this.person_type !== 'r_team') return callback()

                            if (this.person.pay_rate === '') {
                                return callback(new Error("Rate value is required"))
                            }

                            if (this.person.pay_rate < 0) {
                                return callback(new Error('Pay rate cannot be less than 0'))
                            }
                            if (this.person.pay_rate_type === 'percent' && this.person.pay_rate > 100) {
                                return callback(new Error('Percentage rate cannot be more than 100'))
                            }
                            return callback()
                        }
                    }],
                },

                rules_large: {
                    first_name: [{
                        message: 'First name is required',
                        required: true
                    }],
                    last_name: [{
                        message: 'Lastname name is required',
                        required: true
                    }],
                    email: [{
                        message: 'Email is required',
                        required: true
                    }, {
                        type: 'email',
                        message: 'Please provide a valid email',
                    }],
                    'address.street': [{
                        message: 'Street is required',
                    }],
                    phone: [
                        {
                            message: 'Phone number of address is required',
                            required: true
                        }
                    ],
                    city: [{
                        required: true
                    }],
                    state: [{
                        required: true
                    }],
                    pay_rate_type: [{
                        validator: (rule, value, callback) => {

                            if (this.person_type !== 'r_team') return callback()

                            if (this.person.pay_rate_type === '') {
                                return callback(new Error(" Rate Type is required"))
                            }
                            return callback()
                        }
                    }],
                    pay_rate: [{
                        validator: (rule, value, callback) => {

                            if (this.person_type !== 'r_team') return callback()

                            if (this.person.pay_rate === '') {
                                return callback(new Error("Rate value is required"))
                            }
                            return callback()
                        }
                    }],
                },
                countries: countries,
                teams: [],
                remote_loading: false,
                loading: false,
                roles: [],
                permissions: [],
                loading_roles: false,
                loading_permissions: false,
                showModal: false,
                account_teams: false,
                heightOffset: 170
            }
        },
        watch: {
            person_type(val) {
                if (this.permissions && Array.isArray(this.permissions)) {
                    this.permissions.forEach(permission => {
                        // if permission.access = permission.includes
                        // we set the access based on the user stored value
                        if (!permission.active) {
                            permission.access = permission.defaults.includes(val)
                            permission.active = false
                        }
                    })
                }
            }
        },
        computed: {
            is_owner() {
                return this.$auth.user().company && this.account && this.$auth.user().company.accountId === this.account.id;
            }
        },
        beforeMount() {
            (async () => {
                try {
                    // load roles
                    this.showModal = true
                    this.loading = true


                    if (this.$route.params.id) {
                        res = await this.axios.get('/accounts/' + this.$route.params.id, {params: {filter: {include: ['addresses']}}})
                        this.account = res.data
                        this.person_type = this.account.role
                        this.person = {
                            first_name: this.account.first_name,
                            last_name: this.account.last_name,
                            email: this.account.email,
                            id: this.account.id,
                            phone: this.account.phone,
                            addresses: this.account.addresses,
                            notes: this.account.notes,
                            marketing_source: this.account.marketing_source,
                            teamLead: [],
                            teamMember: [],
                            pay_rate_type: this.account.pay_rate_type,
                            pay_rate: this.account.pay_rate,
                            preferredTeams: this.account.preferredTeams,
                            color: this.account.color,
                            company_name: this.account.company_name
                        }

                        if (this.person.addresses.length === 0) {
                            this.person.addresses = [{
                                phone: '',
                                street: '',
                                city: '',
                                state: '',
                                zip: '',
                                country: '',
                                country_code: '',
                                country_full: false
                            }]
                        }

                        this.getAccountTeams()
                    }

                    if (this.$auth.user().country && this.person.addresses.length > 0) {
                        this.person.addresses[0].country_full = this.$auth.user().country
                        this.person.addresses[0].country = this.$auth.user().country.name
                    }

                    // load teams for a start
                    this.getTeams()

                    this.loading = false


                    this.loading_roles = true
                    let res = await this.axios.get('/permissions/roles')
                    this.roles = res.data
                    this.loading_roles = false

                    // load permissions
                    this.loading_permissions = true
                    res = await this.axios.get('/permissions/list', {params: {personId: this.$route.params.id}})
                    this.permissions = res.data
                    this.setRole()
                    this.loading_permissions = false

                } catch (err) {
                    this.loading_permissions = true
                    this.loading_roles = true
                    // eror occured so go back
                    this.$router.back()
                }
            })()
        },

        beforeDestroy() {
            this.$events.removeListener('add-team-member', this.addTeamMemberEvent)
        },
        methods: {
            goBack() {
                this.$router.replace({name: "dashboard_people_appointments", query: {t: this.$moment().unix()}})
            },
            setRole() {
                if (this.$route.query.hasOwnProperty('customer')) {
                    this.person_type = 'r_customer'
                }

                if (this.$route.query.hasOwnProperty('team')) {
                    this.person_type = 'r_team'
                }

                if (this.$route.query.hasOwnProperty('marketer')) {
                    this.person_type = 'r_marketing'
                }

                if (this.$route.query.hasOwnProperty('accountant')) {
                    this.person_type = 'r_accountant'
                }

                if (this.$route.query.hasOwnProperty('staff')) {
                    this.person_type = 'r_staff'
                }

                if (this.$route.query.hasOwnProperty('developer')) {
                    this.person_type = 'r_developer'
                }

                if (this.$route.query.hasOwnProperty('admin')) {
                    this.person_type = 'r_admin'
                }
            },
            addTeamMemberEvent(person) {
                this.person_type = 'r_team'
            },

            handleChange(status) {
                if (status !== '') {
                    this.quickAddButton = false
                } else {
                    this.quickAddButton = true
                }
            },

            quickAdd(lead) {
                this.$refs['quickaddfrm'].validate(valid => {
                    if (valid) {
                        if (!this.person.hasOwnProperty('id')) {
                            this.axios
                                .post('/accounts', {
                                    first_name: this.person.first_name,
                                    last_name: this.person.last_name,
                                    companyId: this.$auth.user().company.id,
                                    email: this.person.email,
                                    password: this.person.email,
                                    phone: this.person.phone,
                                    role: this.person_type,
                                    is_lead: !!lead
                                })
                                .then(res => {
                                    this.$events.emitEvent('close-add-person')
                                    this.$message.success('Account successfully Added')
                                })
                                .catch(err => {
                                })
                        } else {
                            this.axios
                                .patch('/accounts/' + this.account.id, {
                                    first_name: this.person.first_name,
                                    last_name: this.person.last_name,
                                    email: this.person.email,
                                    phone: this.person.phone,
                                    role: this.person_type,
                                    is_lead: !!lead
                                })
                                .then(res => {
                                    this.$events.emitEvent('close-add-person')
                                    this.$message.success('Account successfully Updated')
                                })
                                .catch(err => {
                                })
                        }
                    }
                })
            },

            addAnotherAddress() {
                if (!this.person.addresses) {
                    this.person.addresses = []
                }

                this.person.addresses.push({
                    phone: '',
                    street: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: '',
                    country_code: '',
                    country_full: false
                })
            },

            savePerson() {
                this.$refs['quickaddfrm'].validate(valid => {
                    if (valid) {
                        // don't send addresses
                        if (!this.person.hasOwnProperty('id')) {
                            this.axios
                                .post('/accounts', {
                                    first_name: this.person.first_name,
                                    last_name: this.person.last_name,
                                    companyId: this.$auth.user().company.id,
                                    email: this.person.email,
                                    password: "eD9A8xg9c^Z~v4#7^qXAZ/",
                                    addresses: this.person.addresses,
                                    phone: this.person.phone,
                                    role: this.person_type,
                                    notes: this.person.notes,
                                    marketing_source: this.person.marketing_source,
                                    pay_rate_type: this.person_type === 'r_team' ? this.person.pay_rate_type : '',
                                    pay_rate: this.person_type === 'r_team' ? this.person.pay_rate : '',
                                    preferredTeams: this.person_type === 'r_customer' ? this.person.preferredTeams : [],
                                    permissionList: this.permissions,
                                    color: this.person.color,
                                    team: this.person.team,
                                    teamLead: this.person.teamLead,
                                    teamMember: this.person.teamMember,
                                    company_name: this.person.company_name
                                })
                                .then(res => {
                                    this.$events.emitEvent('close-add-person')
                                    this.$message.success('Account successfully Added')
                                    this.goback()
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                        } else {
                            this.axios
                                .patch('/accounts/' + this.account.id, {
                                    first_name: this.person.first_name,
                                    last_name: this.person.last_name,
                                    companyId: this.$auth.user().company.id,
                                    email: this.person.email,
                                    addresses: this.person.addresses,
                                    phone: this.person.phone,
                                    role: this.person_type,
                                    notes: this.person.notes,
                                    marketing_source: this.person.marketing_source,
                                    pay_rate_type: this.person_type === 'r_team' ? this.person.pay_rate_type : '',
                                    pay_rate: this.person_type === 'r_team' ? this.person.pay_rate : '',
                                    preferredTeams: this.person_type === 'r_customer' ? this.person.preferredTeams : [],
                                    permissionList: this.permissions,
                                    color: this.person.color,
                                    company_name: this.person.company_name,
                                    teamLead: this.person.teamLead,
                                    teamMember: this.person.teamMember,
                                })
                                .then(res => {
                                    this.$events.emitEvent('close-add-person')
                                    this.$message.success('Account successfully Updated')
                                    this.goback()

                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                        }
                    }
                })
            },
            onChange(event, address) {
                for (let key in this.countries) {
                    let country = this.countries[key]
                    if (country.name === event) {
                        address.country_full = country
                        break
                    }
                }
            },

            deleteMembership(team, islead) {

                let data = {}


                if (islead) {
                    let index = team.leadIds.indexOf(this.account.id);
                    if (index !== -1) team.leadIds.splice(index, 1);
                    data.leadIds = team.leadIds
                } else {
                    let index = team.memberIds.indexOf(this.account.id);
                    if (index !== -1) team.memberIds.splice(index, 1);
                    data.memberIds = team.memberIds
                }

                this.loading = true
                this.axios.patch('/teams/' + team.id, data)
                    .then(res => {
                        this.$message.success('Team membership updated')
                        this.getAccountTeams()
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => this.loading = false)
            },

            getAccountTeams() {
                this.axios.get('/companies/current/teams',
                    {
                        params: {
                            filter: {
                                where: {or: [{leadIds: this.account.id}, {memberIds: this.account.id}]}
                            }
                        }
                    })
                    .then(res => {
                        this.account_teams = res.data
                    })
            },

            getTeams(query) {
                this.remote_loading = true


                this.axios
                    .get('/companies/current/teams', {
                        params: {
                            filter: {
                                where: {active: true}
                            }
                        }
                    })
                    .then(res => {
                        this.teams = res.data
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.remote_loading = false
                    })
            },
            notMember(list) {
                if (this.account && this.account.id)
                    return !(list.find(x => x === this.account.id))

                return true
            },
            togglePermissionActive(permission) {
                permission.active = !permission.active

                if (!permission.active) {
                    permission.access = permission.defaults.includes(this.person_type)
                    permission.active = false
                } else {
                    permission.access = true
                }
            },
            goback() {

                if (this.$route.query.q) {
                    this.$router.push({name: this.$route.query.q})
                } else {
                    this.$router.back()
                }
            }
        }
    }
</script>

<style lang="scss">
    .add-person-container {
        padding-top: 5px;
        // background: white;

        .el-collapse {
            border-top: 1px dashed #e3e3e3;
            margin-top: 20px;
        }

        .additional-options {
            .el-card {
                margin-bottom: 20px;
                border: none;


                .el-dropdown {
                    width: 100%;
                    border: none;

                    .el-dropdown-link {
                        width: 100%;
                        padding: 20px;
                        border: 1px solid #f3f3f3;
                        box-sizing: border-box;

                    }
                }
            }
        }


        .teams-list {
            display: block;
            font-size: 12px;
            margin-bottom: 10px;
            text-decoration: underline;
        }

        .side-card {
            margin-bottom: 5px;

            .el-card {
                height: 220px;
                /* box-shadow:none;*/
            }
        }

        .add-note-box {
            i {
                font-size: 18px;
            }

            span {
                display: inline-block !important;
            }

            .el-button {
                margin-right: 10px !important;
                margin-left: 10px !important;
            }
        }

        .el-checkbox__label {
            font-weight: 400;
        }
    }

</style>