<template>
    <el-form :model="form" :rules="rules" class="bg-white" label-position="top" ref="create_discount_form"
             v-loading="loading">
        <el-row :gutter="20" class="padding-2x">
            <el-col>
                <el-page-header @back="$router.back()" content="Create a new discount code"/>
                <el-divider></el-divider>
            </el-col>
            <el-col>
                <el-row :gutter="40">
                    <el-col :sm="8">
                        <el-form-item label="Discount Code" prop="discount_code">
                            <el-input placeholder="Enter discount code" v-model="form.discount_code"/>
                            <el-link @click="randomString()" type="primary">
                                Generate
                            </el-link>
                        </el-form-item>
                    </el-col>

                    <el-col :sm="8">
                        <el-form-item label="Discount Type" prop="discount_type">
                            <el-select v-model="form.discount_type">
                                <el-option label="Percentage" value="percent"/>
                                <el-option label="Amount" value="amount"/>
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :sm="8">
                        <el-form-item label="Discount Value" prop="discount_value">
                            <el-input :placeholder="form.discount_type === 'amount' ? $currency + '5' : '%10'" 
                            type="number" v-model="form.discount_value" :min="0" :max="form.discount_type === 'amount' ? Infinity : '100' ">
                                <span slot="prepend">{{ form.discount_type === "amount" ? $currency : "%" }}</span>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-divider/>

                <el-row :gutter="40">
                    <el-col :sm="7">
                        <el-form-item label="Applies to">
                            <el-radio-group v-model="form.applies_to">
                                <el-radio :label="1" style="width: 100%;">
                                    Entire Booking
                                </el-radio>
                                <el-radio :label="2" style="width: 100%;">
                                    Specific Services
                                </el-radio>
                                <el-select multiple v-if="form.applies_to == 2" v-model="form.applies_to_services">
                                    <el-option  v-show="service.active" :key="service.id" :label="service.name" :value="service.id"
                                               v-for="service in allServices"/>
                                </el-select>
                                <el-radio :label="3" style="width: 100%;">
                                    Specific Extras
                                </el-radio>
                                <el-select multiple v-if="form.applies_to == 3" v-model="form.applies_to_extras">
                                    <el-option  v-show="extra.active" :key="extra.id" :label="extra.name" :value="extra.id"
                                               v-for="extra in allExtras"/>
                                </el-select>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>

                    <el-col :sm="7">
                        <el-form-item label="Customer Eligibility">
                            <el-radio-group v-model="form.target_customers">
                                <el-radio :label="1" style="width: 100%;">
                                    Everyone
                                </el-radio>
                                <el-radio :label="2" style="width: 100%;">Customer Tags</el-radio>
                                <el-form-item v-if="form.target_customers === 2" label="Customer Tags" class="customer-tags-form-item">
                                    <tags :value="form.tagIds"/>
                                </el-form-item>
                                <el-radio :label="3" style="width: 100%;">
                                    Specific Customer
                                </el-radio>

                                <el-select :loading="remote_loading" :remote-method="filterCustomers" filterable
                                           collapse-tags multiple remote v-if="form.target_customers == 3"
                                           v-model="form.target_customer_list">
                                    <el-option :key="customer.id" :label="customer.fullname" :value="customer.id"
                                               v-for="customer in allCustomers"></el-option>
                                </el-select>

                            </el-radio-group>
                        </el-form-item>
                    </el-col>

                    <el-col :sm="10">
                        <el-form-item>
                            <label>Active Dates</label>
                            <el-row :gutter="10">
                                <el-col :sm="12" :xs="12">
                                    <el-form-item label="Start Date">
                                        <el-date-picker :format="dt_format" placeholder="Pick a day" type="date" v-model="form.start_date"/>
                                    </el-form-item>
                                </el-col>
                                <el-col :sm="12" :xs="12">
                                    <el-form-item label="Start time">
                                        <time-select v-model="form.start_time"></time-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-checkbox v-model="form.has_end_date">
                                Set end date
                            </el-checkbox>
                            <el-row :gutter="10" v-if="form.has_end_date">
                                <el-col :sm="12">
                                    <el-form-item label="End Date">
                                        <el-date-picker :format="dt_format" placeholder="Pick a day" type="date" v-model="form.end_date"/>
                                    </el-form-item>
                                </el-col>
                                <el-col :sm="12">
                                    <el-form-item label="End time">
                                        <time-select v-model="form.end_time"></time-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-divider/>

                <el-row :gutter="40">
                    <el-col :sm="8">
                        <el-form-item label="Options">
                            <el-checkbox v-model="form.apply_per_booking">
                                Only apply discount once per booking
                            </el-checkbox>
                            <el-checkbox v-model="form.discount_team_pay">
                                Team payment is discounted with code
                            </el-checkbox>
                            <el-checkbox v-model="form.allow_combined">
                                Coupon code can be combined with other offers
                            </el-checkbox>
                        </el-form-item>
                    </el-col>

                    <el-col :sm="8">
                        <el-form-item label="Usage Limits">
                            <el-checkbox v-model="form.enable_total_usage_limit">
                                Limit number of times this discount can be used in total
                            </el-checkbox>
                            <br/>
                            <el-input-number v-if="form.enable_total_usage_limit" v-model="form.total_usage_limit"/>
                            <br>
                            <el-checkbox v-model="form.enable_customer_usage_limit">
                                Limit number of uses per customer
                            </el-checkbox>
                            <br/>
                            <el-input-number style="display:block;" v-if="form.enable_customer_usage_limit"
                                             v-model="form.customer_usage_limit"/>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col style="margin-bottom: 40px;">
                        <el-button @click="createDiscountCode()" class="pull-right" round size="small" type="primary">
                            Save Discount Code
                        </el-button>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </el-form>
</template>

<script>
    import moment from 'moment'
    import Tags from '../../../components/Tags'
    import TimeSelect from '../../../components/TimePicker.vue'

    export default {
        components: {
            Tags,
            TimeSelect
        },
        props: {},
        data(){
            return {
                form: {
                    discount_code: '',
                    discount_type: 'percent',
                    discount_value: 0,
                    applies_to: 1,
                    applies_to_services: [],
                    applies_to_extras: [],
                    target_customers: 1,
                    target_customer_groups: [],
                    target_customer_list: [],
                    start_date: moment().toISOString(),
                    start_time: moment()
                        .startOf('day')
                        .format(this.$time_format),
                    has_end_date: false,
                    end_date: moment()
                        .add('week', 1)
                        .toISOString(),
                    end_time: moment()
                        .endOf('day')
                        .format(this.$time_format),
                    apply_per_booking: true,
                    discount_team_pay: false,
                    allow_combined: true,
                    total_usage_limit: 0,
                    customer_usage_limit: 0,
                    enable_total_usage_limit: false,
                    enable_customer_usage_limit: false,
                    tagIds: [],
                    loading: true,
                },
                rules: {
                    discount_code: [{
                        message: 'Code is required',
                        required: true
                    }],
                    discount_type: [{
                        message: 'Type is required',
                        required: true
                    }],
                    discount_value: [
                        {
                            validator: (value, rule, callback) => {
                                if (this.form.discount_value && this.form.discount_value < 0) {
                                    return callback(new Error("Value cannot be less than 0"))
                                } else if (this.form.discount_type !== 'amount' && this.form.discount_value > 100) {
                                    return callback(new Error("Value cannot be more than 100"))
                                }
                                return callback()
                            }
                        },
                        {
                            message: 'Value is required',
                            required: true
                        },
                    ]
                },
                loading: false,
                allExtras: [],
                allServices: [],
                allCustomers: [],
                remote_loading: false,
                dt_format:''
            }
        },
        watch: {
            'discount_code'(val) {

            }
        },
        created() {
            this.dt_format = this.$helpers.toElFormat(this.$date_format)
        },

        mounted() {

            if (this.$route.params.id) {
                this.loading = true
                this.axios.get('/discount_codes/' + this.$route.params.id,
                    {
                        params: {
                            filter: {
                                include: {
                                    relation: 'target_accounts',
                                    scope: {
                                        fields: ["id", "first_name", "last_name", "email"]
                                    }
                                }
                            }
                        }
                    })
                    .then(res => {
                        this.form = res.data
                        this.allCustomers = res.data.target_accounts
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .then(() => {
                        this.loading = false
                    })
            } else {
                this.loading = false
            }

            this.loadServices()
            this.loadExtras()
        },

        methods: {
            reset() {
                this.form = {
                    discount_code: '',
                    discount_type: '',
                    discount_value: 0,
                    applies_to: 1,
                    applies_to_services: [],
                    applies_to_extras: [],
                    target_customers: '',
                    target_customer_groups: [],
                    target_customer_list: [],
                    start_date: moment().toISOString(),
                    start_time: moment()
                        .startOf('day')
                        .format('hh:mm a'),
                    has_end_date: false,
                    end_date: moment()
                        .add('week', 1)
                        .toISOString(),
                    end_time: moment()
                        .endOf('day')
                        .format('hh:mm a'),
                    apply_per_booking: true,
                    discount_team_pay: false,
                    allow_combined: false,
                    total_usage_limit: 0,
                    customer_usage_limit: 0,
                    enable_total_usage_limit: false,
                    enable_customer_usage_limit: false
                }
            },
            createDiscountCode() {
                this.$refs['create_discount_form'].validate(valid => {
                    if (valid) {
                        this.loading = true

                        // check if its a update or save

                        if (this.form.hasOwnProperty('id')) {
                            // this of put
                            if (!this.form.has_end_date) {
                                delete this.form.end_date
                                delete this.form.end_time
                            }

                            this.axios
                                .put('/discount_codes/' + this.form.id, this.form)
                                .then(response => {
                                    this.$message.success('Discount code saved')
                                    this.$router.back()
                                })
                                .catch(err => {
                                })
                                .then(() => {
                                    this.loading = false
                                })
                        } else {
                            // this for post
                            if (!this.form.has_end_date) {
                                delete this.form.end_date
                                delete this.form.end_time
                            }

                            this.axios
                                .post('/companies/current/discount_codes', this.form)
                                .then(response => {
                                    this.$message.success('Discount code saved')
                                    this.$router.back()
                                })
                                .catch(err => {
                                })
                                .then(() => {
                                    this.loading = false
                                })
                        }
                    }
                })
            },

            loadServices() {
                this.loading = true
                this.axios
                    .get('/companies/current/services')
                    .then(res => {
                        this.allServices = res.data
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false
                    })
            },
            loadExtras() {
                this.loading = true
                this.axios
                    .get('/companies/current/extras')
                    .then(res => {
                        this.allExtras = res.data
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false
                    })
            },
            filterCustomers(query) {
                if (query !== '' && query.length > 1) {
                    this.remote_loading = true

                    this.axios
                        .get('/companies/current/accounts', {
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
                                            }
                                        ],
                                        role: 'r_customer'
                                    }
                                }
                            }
                        })
                        .then(res => {
                            this.allCustomers = res.data
                        })
                        .catch(err => {
                            this.$helpers.err(err, this)
                        })
                        .then(() => {
                            this.remote_loading = false
                        })
                }


            },

            randomString() {
                var randomstring = require('randomstring')
                this.form.discount_code = randomstring.generate(7)
            }
        }
    }
</script>

<style lang="scss">
    .customer-tags-form-item{
        margin: 10px 0 0 30px;
        .el-form-item__label{
            padding-bottom: 0;
        }
    }
</style>
