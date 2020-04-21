<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="false" :visible.sync="showModal" @close="$router.back()" append-to-body custom-class="fullscreen-modal-display">
            <div class="modal-title-container" slot="title">
                <el-row>
                    <el-col :sm="6" :xs="24">
            <span class="modal-title" v-if="!$route.params.id">
              Add a new Frequency
            </span>
                        <span class="modal-title" v-if="$route.params.id">
              Editing Frequency
            </span>
                    </el-col>
                </el-row>
            </div>
            <div class="modal-body">
                <el-row :gutter="20" class="frequencies full-width">
                    <el-col :md="16" :sm="16" :xs="24" class="full-height">
                        <el-card shadow="hover" v-loading="loading">
                            <el-form :model="form" :rules="rules" class="bg-white padding-2x" label-position="top" ref="frequenciesfrm" >
                                <el-row :gutter="40">
                                    <el-col :md="12" :sm="12">
                                        <el-row :gutter="20">
                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item label="Name" prop="name">
                                                    <el-input v-model="form.name"/>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24" v-if="form.rule_id !== 'onetime'">
                                                <el-form-item label="Repeats">
                                                    <el-input-number v-model="form.interval"></el-input-number>
                                                    <el-tag style="margin-left: 10px;">{{form.freq}}</el-tag>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item label="Locations" v-if="company_locations.length > 0">
                                                    <el-select clearable collapse-tags filterable multiple v-model="form.locationIds">
                                                        <el-option :key="location.id" :label="location.name" :value="location.id" v-for="location in company_locations"/>
                                                    </el-select>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item label="Services">
                                                    <el-select collapse-tags filterable multiple v-model="form.serviceIds">
                                                        <el-option :disabled="!service.active" :key="service.id" :label="service.name" :value="service.id" v-for="service in company_services"/>
                                                    </el-select>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="12" :sm="12" :xs="24">
                                                <el-form-item label="Discount Type">
                                                    <el-select placeholder="Discount type" v-model="form.discount_type">
                                                        <el-option label="Percent (%)" value="percent"/>
                                                        <el-option label="Amount" value="amount"/>
                                                    </el-select>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="12" :sm="12" :xs="24">
                                                <el-form-item label="Discount" prop="discount">
                                                    <el-input :max="form.discount_type === 'percent' ? 100 : 10000000" :min="0" type="number" v-model="form.discount">
                                                        <span slot="prepend" v-if="form.discount_type === 'amount'">{{ $currency }}</span>
                                                        <span slot="append" v-if="form.discount_type === 'percent'">%</span>
                                                    </el-input>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </el-col>

                                    <el-col :md="12" :sm="12" style="height: 500px;">
                                        <el-row :gutter="20">
                                            <el-col>
                                                <el-form-item label="How often?" prop="rule_id" style="min-height: 250px;">
                                                    <el-radio-group v-model="form.rule_id" @change="changeFrequencyInterval">
                                                        <el-tooltip placement="left" :content="frequency.description" v-for="frequency in default_frequencies">
                                                            <el-radio :key="frequency.id" :label="frequency.rule_id" :value="frequency.rule_id" style="width: 100%;">{{ frequency.title }}</el-radio>
                                                        </el-tooltip>
                                                    </el-radio-group>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col>
                                                <el-form-item label="Frequency options" v-if="form.rule_id">
                                                    <div>
                                                        <el-tooltip placement="top" content="Percentage based wage rates would be discounted by this discount">
                                                            <el-checkbox v-model="form.discount_team_pay">Discount team pay</el-checkbox>
                                                        </el-tooltip>
                                                    </div>
                                                    <div>
                                                        <el-tooltip placement="top" content="Set to private to prevent Customers from seeing this frequency">
                                                            <el-checkbox v-model="form.private">Make Private</el-checkbox>
                                                        </el-tooltip>
                                                    </div>
                                                    <div>
                                                        <el-tooltip placement="top" content="Default Frequency">
                                                            <el-checkbox v-model="form.default">Set as Default</el-checkbox>
                                                        </el-tooltip>
                                                    </div>
                                                    <el-checkbox v-if="false" v-model="form.interval">Allow user to choose interval of frequency</el-checkbox>
                                                    <el-checkbox v-if="false" v-model="form.byweekday">Allow user choose weekdays</el-checkbox>
                                                    <el-checkbox v-if="form.rule_id == 'monthly' && false" v-model="form.bymonth">Allow user choose months</el-checkbox>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col>
                                        <el-button @click="saveFrequency()" class="block-center text-center divider-1x" round size="small" type="primary">
                                            Save Frequency Discount
                                        </el-button>
                                    </el-col>
                                </el-row>
                            </el-form>
                        </el-card>
                    </el-col>

                    <side-help/>
                </el-row>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import moment from "moment";
    import Cron from "@/components/CronEditor.vue";

    import SideHelp from "../../components/SideHelp.vue";

    // var prettyCron = require("prettycron");

    export default {
        components: {
            SideHelp,
            Cron
        },
        data() {
            return {
                form: {
                    name: "",
                    locationIds: [],
                    rule_id: "onetime",
                    discount: 0,
                    discount_type: "percent",
                    serviceIds: [],
                    custom_cron: "",
                    freq: "",
                    bymonth: false,
                    byweekday: false,
                    interval: 0,
                    discount_team_pay: true,
                    private: false
                },
                frequencies: [],
                moment: moment,
                rules: {
                    discount: [
                        {
                            validator: (rule, value, callback) => {
                                if (this.form.discount_type === "percent" && this.form.discount < 0) return callback(new Error("Discount cannot be less than 0"));
                                if (this.form.discount_type === "percent" && this.form.discount > 100) return callback(new Error("Discount cannot be greater than 100"));
                                if (this.form.discount_type === "amount" && this.form.discount < 0) return callback(new Error("Discount cannot be less than 0"));
                                return callback();
                            }
                        }
                    ],
                    name: [{
                        required: true,
                        message: "Frequency name is required",
                        trigger: "blur"
                    }],
                    rule_id: [{
                        required: true,
                        message: "Recurring pattern is required",
                        trigger: "blur"
                    }]
                },
                cronPopover: false,
                expression: "",
                cronInterpretation: "",
                loading: true,
                company_locations: [],
                company_services: [],
                default_frequencies: [],
                showModal: false
            };
        },
        created() {
        },

        mounted() {

            (async () => {
                try {
                    this.loading = true;
                    this.company_services = (await this.axios.get("/companies/current/services")).data;
                    this.company_locations = (await this.axios.get("/companies/current/locations")).data;
                    this.default_frequencies = (await this.axios.get("/bookings/default-frequencies")).data;

                    if (this.$route.params.id) {
                        this.form = (await this.axios.get('/companies/current/frequencies/' + this.$route.params.id)).data
                    }

                    //set the default interval
                    if (this.form && this.form.rule_id)
                        this.changeFrequencyInterval(this.form.rule_id)

                    this.loading = false;
                } catch (err) {
                    this.loading = false
                }
            })()

            this.showModal = true
        },

        beforeDestroy() {

        },

        methods: {

            resetForm() {
                this.form = {
                    name: "",
                    locationIds: [],
                    rule_id: "onetime",
                    discount: 0,
                    discount_type: "percent",
                    serviceIds: [],
                    custom_cron: "",
                    bymonth: false,
                    byweekday: false,
                    interval: false
                };
            },

            selectFrequency(frequency) {
                this.form = frequency;
            },

            deleteFrequency() {
            },

            duplicateFrequency() {
                if (this.form.hasOwnProperty("id")) {
                    delete this.form.id;
                    this.form.name += " - duplicate";
                    this.saveFrequency();
                }
            },
            changeFrequencyInterval(val) {
                let rule = this.default_frequencies.find((freq) => {
                    return freq.rule_id === val
                })

                if (rule) {
                    this.form.interval = rule.interval
                    this.form.freq = rule.freq
                }
            },

            archiveFrequency() {
            },

            addNewFrequency() {
                this.form = {
                    name: "",
                    locationIds: [],
                    rule_id: "onetime",
                    discount: 0,
                    discount_type: "percent",
                    serviceIds: [],
                    custom_cron: "",
                    bymonth: false,
                    byweekday: false,
                    interval: false
                };
            },
            saveFrequency() {
                this.$refs["frequenciesfrm"].validate(valid => {
                    if (valid) {
                        if (this.form.hasOwnProperty("id")) {
                            delete this.form.services;
                            this.axios
                                .patch("/frequencies/" + this.form.id, this.form)
                                .then(res => {
                                    this.$helpers.successHandle("Frequency successfully updated");
                                    this.$router.back()
                                })
                                .catch(err => {
                                });
                        } else {
                            this.axios
                                .post("/companies/current/frequencies", this.form)
                                .then(res => {
                                    this.$helpers.successHandle("Frequency successfully updated");
                                    this.$router.back();
                                })
                                .catch(err => {
                                });
                        }
                    }
                });
            },
            changeCron(val) {
                this.form.custom_cron = val;
                // this.cronInterpretation = prettyCron.toString(val);
            }
        }
    };
</script>

<style lang="scss">
    .modal-body {
        .frequencies {
            .pricing-box {
                border: 1px solid #f3f3f3;
                border-radius: 5px;
                margin: 0px !important;
            }

            ul.frequencies-list {
                list-style: none;
                padding: 0;

                li {
                    padding: 10px;
                    display: block;
                    cursor: pointer;
                    min-height: 40px;

                    .service-image,
                    .service-content {
                        display: inline-block;
                    }

                    .service-image {
                        img {
                            width: 32px;
                            height: 32px;
                            margin-right: 5px;
                            /* border-radius : 50%;*/
                        }
                    }

                    .service-content {
                        width: calc(100% - 40px);

                        p {
                            margin: 0;
                            font-size: 12px;
                            line-height: 1.5;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            max-height: 35px;
                        }
                    }

                    .service-name {
                        font-weight: 500;
                        color: black;
                        font-size: 12px;
                    }

                    .service-price {
                        font-weight: bold;
                        font-style: normal;
                    }

                    &.active {
                        border-left: 4px solid $launch-primary-color;
                        background: $launch-dashboard-bg-color;
                    }
                }
            }

            .pricing-item {
                padding: 15px;
                background: $launch-dashboard-bg-color;
                border: 1px dashed #f3f3f3;
                border-radius: 5px;
                font-weight: 500;
                font-size: 13px;
                margin-bottom: 10px;
            }

            .el-collapse {
                border: none;
            }

            .el-collapse-item__content {
                background: $launch-dashboard-bg-color;
                padding: 10px;
                margin-bottom: 10px;
            }

            .el-form-item {
                height: 75px;
            }
        }
    }
</style>
