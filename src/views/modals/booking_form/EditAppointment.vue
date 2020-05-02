<template>
    <div class="edit-appointment-forms" v-loading="loading">
        <!--first edit address-->
        <el-row :gutter="20" v-if="booking">
            <el-col :sm="16">
                <el-card :body-style="{ padding: '0px;' }" class=" create-booking-card" shadow="never" style="box-shadow:none;">
                    <location :account-id.sync="booking.accountId" :booking="booking" @on-validate="onStepValidate" ref="locationRef" v-if="mode === 'location'"></location>

                    <template v-if="mode === 'date' || mode === 'frequency'">
                        <date :booking.sync="booking" :coordinates="booking.address.coordinates" @on-validate="onStepValidate" ref="dateRef"></date>
                        <el-divider>Frequency</el-divider>
                        <frequency :booking.sync="booking" :selected-services="booking.serviceIds" @on-validate="onStepValidate" ref="frequencyRef"></frequency>
                    </template>

                    <div v-if="mode === 'services'">
                        <services :booking="booking" @on-validate="onStepValidate" ref="serviceRef"></services>
                        <extras :booking="booking" :selected-services.sync="fullSelectedServices" @on-validate="onStepValidate" ref="extraRef"></extras>
                    </div>

                    <additions :account-id="booking.accountId" :booking.sync="booking" :duration.sync="booking.duration" @on-validate="onStepValidate" ref="additionRef" v-if="mode === 'additions'"></additions>

                    <custom-fields @on-validate="onStepValidate" ref="customFieldRef" v-if="mode === 'custom_fields'"></custom-fields>

                    <payment :booking.sync="booking" :root-model="booking" @on-validate="onStepValidate" ref="paymentRef" v-if="mode === 'payment'"></payment>

                    <el-row>
                        <el-col>
                            <el-divider></el-divider>
                        </el-col>
                        <el-col style="display:flex;  flex-direction: row-reverse">
                            <el-button :loading="loading" @click="processUpdate" round size="small" type="primary"> Save Changes</el-button>
                            <el-button @click="$emit('close')" plain round size="small" style="margin-right: 10px;" type="danger">Cancel</el-button>

                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :sm="8" id="price_sidebar2">
                <el-card class="total-card" style="margin-top: 5px;">
                    <div slot="header">
                        Total
                    </div>
                    <div class="text item">
                        Services
                        <i>{{ $currency }}{{ summary.services || 0 }}</i>
                    </div>
                    <div class="text item">
                        Extras
                        <i>{{ $currency }}{{ summary.extras || 0 }}</i>
                    </div>
                    <div class="text item">
                        Discount
                        <i>({{ $currency }}{{ summary.discount || 0 }})</i>
                    </div>
                    <div class="text item">
                        Promo/Discount Code
                        <i>({{ $currency }}{{ summary.discount_code_total || 0 }})</i>
                    </div>
                    <div>
                        <i v-if="summary.discount_code_error" style="color:red; font-size: 10px;">{{summary.discount_code_error}}</i>
                    </div>
                    <div class="text item" v-if="summary.giftcard_total > 0">
                        Gift Card
                        <i>{{ $currency }}{{ summary.giftcard_total || 0 }}</i>
                    </div>
                    <div class="text item" v-if="!!summary.adjustment">
                        Adjustment
                        <i v-if="summary.adjustment > 0">{{ $currency }}{{ summary.adjustment || 0 }}</i>
                        <i v-if="summary.adjustment < 0">({{ $currency }}{{ Math.abs(summary.adjustment) || 0 }})</i>

                    </div>

                    <div class="text item">
                        Amount (before taxes)
                        <i>{{ $currency }}{{ summary.subtotal || 0 }}</i>
                    </div>
                    <div class="text item">
                        Taxes
                        <i>{{ $currency }}{{ summary.taxes_total || 0 }}</i>
                    </div>
                    <div class="text item">
                        Tip
                        <i>{{ $currency }}{{ summary.tip || 0 }}</i>
                    </div>
                    <el-divider></el-divider>
                    <div class="text item" style="">
                        TOTAL
                        <i>{{ $currency }}{{ summary.total || 0 }}</i>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-dialog top="0vh" title="Details" :visible.sync="confirmRecurring" append-to-body :modal="true">
            <div class="modal-body">
                <recurring-details @close="confirmRecurring = false" @confirm-change="confirmUpdate" :booking.sync="booking" :booking-update.sync="dataModel" v-if="confirmRecurring"></recurring-details>
            </div>
        </el-dialog>

    </div>
</template>


<script>

    import Location from "./Location";
    import Date from "./Date";
    import Frequency from "./Frequency";
    import Services from "./Services";
    import Extras from "./Extras";
    import Additions from "./Additions";
    import CustomFields from "./CustomFields";
    import Payment from "./Payment";
    import helper from "./helper";
    import RecurringDetails from "../../../components/RecurringBookings";


    export default {
        components: {RecurringDetails, Payment, CustomFields, Additions, Extras, Services, Frequency, Date, Location},
        props: {
            bookingId: {
                type: String,
                required: true
            },
            mode: {}
        },
        data() {
            return {
                dataModel: {},
                canSave: false,
                loading: false,
                company_services: [],
                summary: {},
                booking: false,
                confirmRecurring: false,
                update_mode : false
            }
        },
        computed: {
            fullSelectedServices() {
                let data = [];
                if (this.booking && this.booking.services && this.company_services.length > 0) {
                    this.booking.serviceIds.forEach(srv_id => {
                        if (this.company_services.length > 0) {
                            let service = this.company_services.find(service => {
                                return service.id === srv_id;
                            });
                            if (service) data.push(service);
                        }
                    });
                }
                return data;
            }
        },


        mounted() {
            (async () => {
                try {
                    this.loading = true
                    this.booking = (await this.axios.get('/bookings/' + this.bookingId, {
                        params: {
                            filter: {
                                include: [
                                    'account',
                                    'frequency',
                                    'address',
                                    {"service_details": "pricing_variables"},
                                    'charge',
                                    "workdiary",
                                    {"assigned_checklists": "tasks"},
                                    {"team_assignments": "team"}
                                ]
                            }
                        }
                    })).data

                    this.summary = this.booking.charge

                    this.company_services = (await this.axios.get('/companies/current/services', {
                        params: {
                            filter: {
                                where: {active: true},
                                include: [
                                    {
                                        relation: "pricing_variables",
                                        scope: {
                                            where: {active: true}
                                        }
                                    },
                                    {
                                        "relation": "extras",
                                        "scope": {
                                            where: {active: true}
                                        }
                                    }]
                            }
                        }
                    })).data

                    this.loading = false

                } catch (err) {
                    this.loading = false
                }
            })()

        },
        methods: {
            onStepValidate(validated, model) {
                if (validated) {
                    this.dataModel = {...this.dataModel, ...model};
                    this.canSave = true
                    this.getEstimatedPrice()
                } else {
                    this.canSave = false
                }
            },
            getEstimatedPrice() {

                let data = JSON.parse(JSON.stringify(this.finalDataModal()))

                if (!data.service_options) {
                    data.service_options = this.booking.meta.service_options
                }

                if (!data.extras) {
                    data.extras = this.booking.meta.extras
                }

                if (!data.tip && data.tip !== 0) {
                    data.tip = this.booking.charge.tip
                }

                if (!data.adjustment && data.adjustment !== 0) {
                    data.adjustment = this.booking.charge.adjustment
                }

                if (data.services.length == 0) {
                    data.services = this.booking.services
                }

                data.customer = {
                    email: this.booking.account.email
                }

                this.axios
                    .post("/bookings/estimate_price", data)
                    .then(res => {
                        this.summary = res.data;
                    })
                    .catch()
                    .finally(_ => {
                    });
            },
            processUpdate() {
                if (this.booking.frequency.rule_id === 'onetime') {
                    this.confirmUpdate()
                } else {
                    this.confirmRecurring = true;
                }
            },
            confirmUpdate(update_mode) {
                if (update_mode)
                    this.update_mode = update_mode

                if (this.canSave) {
                    switch (this.mode) {
                        case 'location':
                            this.updateAddress()
                            break;

                        case 'date':
                            this.updateServiceDate()
                            break;


                        /*case 'additions':
                            this.updateDiscounts()
                            break;*/
                        case 'payment':
                            this.updatePayment()
                            break;

                        default:
                            this.updateBooking()
                            break;
                    }

                }
            },
            updatePayment() {
                (async () => {
                    try {
                        this.loading = true

                        if (this.dataModel.cardId) {
                            await this.axios.patch('/charges/' + this.booking.charge.id, {
                                cardId: this.dataModel.cardId
                            })
                        }

                        //also update the booking paymentmethod
                        this.updateBooking()
                    } catch (err) {
                        this.$helpers.errorHandle(err)
                        this.loading = false
                    }
                })()

            },
            updateAddress() {
                //first check that the address is allowed before saving
                this.loading = true
                this.axios.post('/bookings/' + this.booking.id + '/update-address', {
                    address: this.dataModel.address,
                    update_mode : this.update_mode
                })
                    .then(res => {
                        this.$message.success('Address updated')
                        this.$emit('close')
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },

            updateServiceDate() {
                this.loading = true
                this.axios.post('/bookings/' + this.booking.id + '/update-service-date',
                    {
                        service_date: this.dataModel.service_date,
                        update_mode: this.update_mode,
                        frequencyId : this.dataModel.frequency.id
                    })
                    .then(res => {
                        this.$message.success('Update successful')
                        this.$emit('close')
                        this.$router.push({name: 'dashboard_booking_view', params: {id: res.data.id, service_date: res.data.service_date}})
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },

            updateDiscounts() {
                this.loading = true
                this.axios.post('/bookings/' + this.booking.id + '/update-additions',
                    {
                        service_date: this.dataModel.service_date,
                        update_mode: this.dataModel.update_mode,
                        old_service_date: this.booking.service_date,
                        staff_notes_access: this.dataModel.staff_notes_access,
                        customer_notes: this.dataModel.customer_notes,
                        staff_notes: this.dataModel.staff_notes,
                        discount_code: this.dataModel.discount_code,
                        referral_code: this.dataModel.referral_code,
                        tip: this.dataModel.tip,
                        duration: this.dataModel.duration,
                        assigned_teams: this.dataModel.assigned_teams,
                        adjustment_reason: this.dataModel.adjustment_reason,
                        adjustment: this.dataModel.adjustment,
                        team_with_key: this.dataModel.team_with_key,
                        team_requested: this.dataModel.team_requested
                    })
                    .then(res => {
                        this.$message.success('Update successful')
                        this.$emit('close')
                        this.$router.push({name: 'dashboard_booking_view', params: {id: res.data.id, service_date: res.data.service_date}})
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },

            updateBooking(cb) {
                // merge booking data && this.dataModel
                let data = this.finalDataModal()

                if (!data.service_options) {
                    data.service_options = this.booking.meta.service_options
                }

                if (!data.extras) {
                    data.extras = this.booking.meta.extras
                }

                if (!data.tip && data.tip !== 0) {
                    data.tip = this.booking.charge.tip
                }

                if (!data.adjustment && data.adjustment !== 0) {
                    data.adjustment = this.booking.charge.adjustment
                }


                if (data.services.length == 0) {
                    data.services = this.booking.services
                }

                if (this.update_mode){
                    data.update_mode = this.update_mode
                }

                this.loading = true
                this.axios.patch('/bookings/' + this.booking.id, data)
                    .then(res => {
                        this.$message.success("Booking updated successfully")
                        this.$router.push({name: 'dashboard_booking_view', params: {id: res.data.id, service_date: res.data.service_date}})
                        this.$emit('close')
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },

            finalDataModal() {

                let data = {...this.booking, ...this.dataModel};

                if (!data.service_options) {
                    data.service_options = this.booking.meta.service_options
                }

                if (!data.extras) {
                    data.extras = this.booking.meta.extras
                }

                if (!data.tip && data.tip !== 0) {
                    data.tip = this.booking.charge.tip
                }

                if (!data.adjustment && data.adjustment !== 0) {
                    data.adjustment = this.booking.charge.adjustment
                }

                //convert data to booking format
                return helper.prepareBookingData(data, this.company_services);
            }
        }
    }
</script>
