<template>
    <el-form :model="model" :rules="rules" class="customer-form" label-position="top" ref="form" autocomplete="nope">
        <el-row :gutter="20">
            <el-col :sm="24">
                <el-form-item label="Enter customer's email" prop="email">
                    <el-autocomplete :clearable="true" autocomplete="nope" :debounce="400"
                                     :fetch-suggestions="searchCustomer" :trigger-on-focus="false"
                                     @select="selectCustomer" placeholder="Email address" style="width : 100%"
                                     v-model="model.email" value-key="fullname">
                        <template slot-scope="{ item }">
                            <account-avatar :account="item" body-class="pull-left"
                                            style="margin-right: 10px;"></account-avatar>
                            <div>
                                <span class="link">{{ item.fullname }}</span>
                                <i class="suggestion-email">{{ item.email }}</i>
                            </div>
                        </template>
                    </el-autocomplete>
                </el-form-item>
            </el-col>

            <el-col :sm="12">
                <el-form-item prop="first_name">
                    <el-input autocomplete="nope" :disabled="model.account_id.length > 0" placeholder="First name"
                              type="text" v-model="model.first_name"/>
                </el-form-item>
            </el-col>
            <el-col :sm="12">
                <el-form-item prop="last_name">
                    <el-input autocomplete="nope" :disabled="model.account_id.length > 0" placeholder="Last name"
                              type="text" v-model="model.last_name"/>
                </el-form-item>
            </el-col>

            <el-col :sm="12">
                <el-form-item>
                    <el-input autocomplete="nope" :disabled="model.account_id.length > 0"
                              placeholder="Company name (if organization)" type="text" v-model="model.company"/>
                </el-form-item>
            </el-col>

            <el-col :sm="24">
                <el-row :gutter="20">
                    <el-col :sm="12">
                        <el-form-item label="Where you heard about uss">
                            <marketing-sources v-model="model.referral_source"></marketing-sources>
                        </el-form-item>
                    </el-col>

                    <el-col :sm="12">
                        <el-form-item label="Booking">
                            <el-radio-group v-model="model.mode_of_booking">
                                <el-radio label="phone">
                                    Phone
                                </el-radio>
                                <el-radio label="chat">
                                    Chat
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </el-form>
</template>

<script>
    import MarketingSources from "../../../components/MarketingSources";
    import _ from "lodash"
    import AccountAvatar from "../../../components/AccountAvatar";

    export default {
        components: {AccountAvatar, MarketingSources},
        props: ['booking'],
        data: () => {
            return {
                activeName: 'old',
                customer: '',
                loading: false,
                model: {
                    account_id: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    referral_source: '',
                    mode_of_booking: 'web',
                    company: '',
                    phone : ''
                },
                rules: {
                    first_name: [
                        {
                            required: true,
                            message: 'First name is required'
                        }
                    ],
                    last_name: [
                        {
                            required: true,
                            message: 'Last name is required'
                        }
                    ],
                    email: [
                        {
                            required: true,
                            message: 'Email is required'
                        },
                        {
                            type: 'email',
                            message: 'Invalid email',
                            trigger: 'change'
                        }
                    ]
                }
            }
        },

        watch: {
            booking(val) {
                if (this.booking) {
                    this.model = {
                        account_id: this.booking.account.id,
                        first_name: this.booking.account.first_name,
                        last_name: this.booking.account.last_name,
                        email: this.booking.account.email,
                        mode_of_booking: this.booking.mode_of_booking,
                        phone: this.booking.account.phone
                    }
                }
            }
        },

        created() {
            this.$events.addListener('booking:form:reset', this.resetModel)
        },

        mounted() {
            if (this.$route.query.account_id) {
                this.loading = true
                this.axios
                    .get('/companies/current/accounts/' + this.$route.query.account_id)
                    .then(res => {
                        this.model = {
                            account_id: res.data.id,
                            first_name: res.data.first_name,
                            last_name: res.data.last_name,
                            email: res.data.email,
                            referral_source: res.data.referral_source,
                            mode_of_booking: res.data.mode_of_booking,
                            company: res.data.company,
                            phone: res.data.phone
                        }
                        // trigger a validation to force the updating of the parent model
                        this.$emit('content-updated', true, this.model)
                    })
                    .catch()
                    .finally(_ => {
                        this.loading = false
                    })
            }
        },

        beforeDestroy() {
            this.$events.removeListener('booking:form:reset', this.resetModel)
        },

        methods: {
            resetModel() {
                this.model = {
                    account_id: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    referral_source: '',
                    mode_of_booking: 'web',
                    company: '',
                    phone : ''
                }
            },
            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        this.$emit('on-validate', valid, this.model)
                        resolve(valid)
                    })
                })
            },

            searchCustomer: _.debounce(function (queryString, cb) {
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
                                    mode_of_booking: true,
                                    phone : true
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
                                    role: 'r_customer'
                                }
                            }
                        }
                    })
                    .then(res => {

                        cb(res.data)

                    })
                    .catch(err => {
                        cb([])
                    })
                    .then()
            }, 1000),

            selectCustomer(customer) {
                this.model = {
                    account_id: customer.id,
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                    email: customer.email,
                    referral_source: customer.referral_source,
                    mode_of_booking: customer.mode_of_booking,
                    company: customer.company,
                    phone : customer.phone
                }
                // trigger a validation to force the updating of the parent model
                this.$emit('content-updated', true, this.model)
            }
        }
    }
</script>

<style lang="scss">
    .customer-form {
    }
</style>
