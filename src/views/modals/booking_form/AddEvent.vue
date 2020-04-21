<template>
    <div>
        <div class="modal-body">
            <el-form :model="eventForm" :rules="event_rules" label-position="top" ref="eventfrm">
                <el-row :gutter="20">
                    <el-col :sm="16">
                        <el-card>
                            <el-row :gutter="20">


                                <el-col :sm="12">
                                    <el-form-item label="Event title" prop="title">
                                        <el-input type="text" v-model="eventForm.title"/>
                                    </el-form-item>

                                    <el-form-item label="Date & Time" prop="start">
                                        <el-date-picker type="datetime" v-model="eventForm.start"/>
                                    </el-form-item>

                                    <el-form-item prop="duration">
                                        <duration-picker v-model="eventForm.duration"/>
                                    </el-form-item>
                                </el-col>
                                <el-col :sm="12">

                                    <el-form-item label="Location">
                                        <el-input v-model="eventForm.address"/>
                                    </el-form-item>

                                    <el-form-item label="Teams">
                                        <el-select :remote-method="searchTeams" collapse-tags filterable multiple remote v-model="eventForm.teamIds">
                                            <el-option :label="team.name" :value="team.id" v-for="team in filtered_teams"></el-option>
                                        </el-select>
                                    </el-form-item>

                                    <el-form-item label="Customer">
                                        <el-select :multiple-limit="1" :remote-method="searchCustomers" collapse-tags filterable multiple remote v-model="eventForm.customerIds">
                                            <el-option :label="customer.name" :value="customer.id" v-for="customer in filtered_customers"></el-option>
                                        </el-select>
                                    </el-form-item>

                                    <el-form-item label="Comment">
                                        <el-input :rows="5" type="textarea" v-model="eventForm.comment"/>
                                    </el-form-item>

                                </el-col>
                                <el-col>
                                    <el-button @click="saveEvent()" class="pull-right" round size="small" type="primary">
                                        Add Event
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-card>
                    </el-col>

                    <side-help></side-help>
                </el-row>


            </el-form>
        </div>


    </div>
</template>


<script>
    import SideHelp from "../../components/SideHelp";

    export default {
        components: {SideHelp},
        data() {
            return {
                eventForm: {
                    title: '',
                    date: '',
                    comment: '',
                    address: '',
                    teamIds: [],
                    duration: "",
                    bookingId: '',
                    customerIds: []
                },
                selected_customer: "",
                filtered_customers: [],
                filtered_teams: [],
                eventDialog: false,
                event_rules: {
                    title: [
                        {
                            message: 'Title is required',
                            required: true
                        }
                    ],
                    start: [
                        {
                            message: 'Date is required',
                            required: true
                        }
                    ],
                    duration: [
                        {
                            message: 'Duration is required',
                            type: 'number',
                            required: true
                        }
                    ]
                },
            }
        },

        mounted() {
            if (this.$route.query.account_id) {
                this.axios.get('/companies/current/accounts/' + this.$route.query.account_id)
                    .then(res => {
                        this.filtered_customers = [res.data]
                        this.eventForm.customerIds = [res.data.id]
                    })
            }
        },

        methods: {
            saveEvent() {
                this.$refs.eventfrm.validate((valid) => {
                    if (valid) {
                        this.axios.post('/companies/current/calendar_events', this.eventForm)
                            .then(res => {
                                this.$helpers.successHandle('Event saved to calendar', this)
                                this.eventDialog = false
                                this.$refs.scheduleCalendar.getApi().refetchEvents()
                            })
                            .catch(err => {

                            })
                            .finally(() => {
                                this.$router.push({name: "dashboard_calendar_spots"})
                            })
                    }
                })
            },

            searchTeams(query) {
                this.searchFilter(query, 'r_team')
            },
            searchCustomers(query) {
                this.searchFilter(query, 'r_customer')
            },
            searchFilter(queryString, role) {
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
                                    referral_source: true,
                                    mode_of_booking: true
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
                                    role: role || 'r_customer'
                                }
                            }
                        }
                    })
                    .then(res => {
                        if (role === 'r_customer')
                            this.filtered_customers = res.data
                        else
                            this.filtered_teams = res.data
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                    })
            },

            selectCustomer(customer) {

            }
        }
    }
</script>
