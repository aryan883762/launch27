<template>
    <el-row :gutter="20">
        <el-col :sm="16" class="">


            <el-card :body-style="{ padding: '0px;' }" class=" create-booking-card" shadow="never"
                     style="box-shadow:none;">

                <!--   <div class="flex-row-reverse">
                       <el-button @click="resetForm" plain round size="mini" type="danger"> Reset Form</el-button>
                   </div>-->

                <customer-step :booking.sync="booking" @content-updated="onStepValidate" @on-validate="onStepValidate"
                               ref="customerStep"></customer-step>

                <el-divider content-position="left">Contact</el-divider>
                <location-step :account-id.sync="bookingModel.account_id || booking.accountId" :phone="bookingModel.phone" :booking.sync="booking"
                               @on-validate="onStepValidate" ref="locationRef"></location-step>

                <el-divider content-position="left">Services</el-divider>
                <service-step :booking.sync="booking" @changed="getEstimatedPrice" @content-updated="onStepValidate"
                              @on-validate="onStepValidate" ref="serviceRef"></service-step>


                <el-divider content-position="left">Date</el-divider>
                <date-step :booking.sync="booking" :new-booking.sync="bookingModel"
                           :coordinates.sync="bookingModel.address.coordinates"
                           @content-updated="onStepValidate" @on-validate="onStepValidate" ref="dateRef"></date-step>


                <el-divider content-position="left">Frequency</el-divider>
                <frequency-step :booking.sync="booking" :selectedServices.sync="bookingModel.services"
                                @changed="getEstimatedPrice" @content-updated="onStepValidate"
                                @on-validate="onStepValidate" ref="frequencyRef"></frequency-step>

                <extras-step :booking.sync="booking" :selectedServices.sync="fullSelectedServices"
                             @changed="getEstimatedPrice" @content-updated="onStepValidate"
                             @on-validate="onStepValidate" ref="extraRef"></extras-step>

                <el-divider content-position="left">Additions</el-divider>
                <additional-step :account-id.sync="bookingModel.account_id || booking.accountId" :booking.sync="booking"
                                 :duration.sync="finalBookingModel.estimated_duration" @changed="getEstimatedPrice"
                                 @content-updated="onStepValidate" @on-validate="onStepValidate"
                                 ref="additionRef"></additional-step>

                <el-divider content-position="left"> Payment Options</el-divider>
                <payment-step :booking.sync="booking" :root-model.sync="bookingModel" @content-updated="onStepValidate"
                              @on-validate="onStepValidate" ref="paymentRef"></payment-step>

                <custom-fields @on-validate="onStepValidate" ref="customFieldRef"></custom-fields>


                <label id="scroll_bottom" style="padding-top: 100px;display:block;"></label>
            </el-card>
        </el-col>

        <el-col :sm="8" id="price_sidebar">
            <el-card v-if="false">
                <div slot="header">
                    <h3>Summary</h3>

                    <el-tooltip class="item" effect="dark"
                                :content="scroll_locked ? 'Scroll with summary' :'Lock price summary'" placement="left">
                        <i class="el-icon-lock pull-right booking-scroll-lock scroll-lock-icon"
                           @click="toogleSummaryScroll" v-if="scroll_locked"></i>
                        <i class="el-icon-unlock pull-right booking-scroll-lock" @click="toogleSummaryScroll"
                           v-else></i>
                    </el-tooltip>
                </div>
                <el-row class="bg-white summary-row" v-if="false">
                    <el-col :sm="24" v-if="bookingModel.services && bookingModel.services.length > 0">
                        <i class="el-icon-shopping-bag-1"></i>
                        <div class="services-rows">
                          <span v-for="service in bookingModel.services">
                            <label>{{ getServiceName(service) }}</label>
                            <div v-html="getServiceOptions(service)"></div>
                            <small v-for="extra in bookingModel.extras" v-if="extra.service_id === service">Extra:  {{ extra.quantity }}x {{ extra.name }} </small>

                          </span>
                        </div>
                    </el-col>

                    <el-col :sm="24" v-if="bookingModel.service_date">
                        <i class="el-icon-alarm-clock"></i>
                        <p style="line-height: 2.5">
                            {{ $moment(bookingModel.service_date).format("hh:mm a, Do-MM-YYYY")}}
                        </p>
                    </el-col>

                    <el-col :sm="24" v-if="bookingModel.frequency">
                        <i class="el-icon-s-shop"></i>
                        <p style="line-height: 2.5">{{ bookingModel.frequency.name }}</p>
                    </el-col>

                </el-row>
            </el-card>


            <el-card class="total-card" style="margin-top: 5px;">
                <h3 slot="header" style="margin:0;">Summary</h3>
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
                <div class="text item" v-if="summary.next_booking_total > 0">
                    NEXT BOOKING TOTAL
                    <i>{{$currency}} {{summary.next_booking_total || 0}}</i>
                </div>
            </el-card>


            <el-card style="margin-top: 5px;">
                <el-button @click="proceed" class="block-center" round style="width: 200px;" type="primary"> Book
                    Appointment
                </el-button>
            </el-card>

        </el-col>
    </el-row>
</template>

<script>
    import CustomerStep from "./Customer.vue";
    import LocationStep from "./Location.vue";
    import ServiceStep from "./Services.vue";
    import DateStep from "./Date.vue";
    import AdditionalStep from "./Additions.vue";
    import FrequencyStep from "./Frequency.vue";
    import ExtrasStep from "./Extras.vue";
    import PaymentStep from "./Payment.vue";
    import CustomFields from "./CustomFields.vue";
    import _ from 'lodash'


    import helper from "./helper";

    import {handleCardSetup} from "vue-stripe-elements-plus";

    export default {
        components: {
            CustomerStep,
            LocationStep,
            ServiceStep,
            DateStep,
            FrequencyStep,
            AdditionalStep,
            ExtrasStep,
            PaymentStep,
            CustomFields
        },
        data: () => {
            return {
                activeTabIndex: 0,
                bookingModel: {
                    address: {}
                },
                showModal: false,
                booking: false,
                total_price: 0,
                currentStep: 0,
                stepRefs: ["customerStep", "locationRef", "serviceRef", "dateRef", "frequencyRef", "extraRef", "additionRef", "paymentRef", "customFieldRef"],
                customerValid: false,
                locationValid: false,
                dateValid: false,
                frequencyValid: false,
                company_services: [],
                summary: {},
                company: false,
                jQsidebar: false,
                offset: 0,
                loading: false,
                back: false,
                scroll_locked: false,

            };
        },

        computed: {
            finalBookingModel() {
                if (this.bookingModel && this.company_services.length > 0) {
                    let results = helper.prepareBookingData(this.bookingModel, this.company_services);
                    return results;
                }

                return {};
            },


            fullSelectedServices() {
                let data = [];
                if (this.bookingModel && this.bookingModel.services && this.company_services.length > 0) {
                    this.bookingModel.services.forEach(srv_id => {
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

        created() {
            this.$events.addListener("booking:data:services", this.updateServices);
            this.$events.addListener("booking:update:totals", this.updateModel)
            this.$root.$on('booking-estimate', this.getEstimatedPrice)
        },


        mounted() {
            this.showModal = true;

            // window.addEventListener('scroll', this.scrollSidebar, true)

            if (this.$route.query.action === 'rebook' && this.$route.query.bookingId) {
                this.loading = true
                this.back = true
                this.axios
                    .get("/bookings/" + this.$route.query.bookingId,
                        {
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
                        }
                    )
                    .then(res => {
                        //delete the booking date
                        this.booking = res.data;
                        this.booking.service_date = this.$moment().toISOString()
                        this.current_step = 1;
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.loading = false
                    });
            }

            if (this.$route.params && this.$route.params.id) {
                this.back = true
                this.axios
                    .get("/companies/current/bookings/" + this.$route.params.id)
                    .then(res => {
                        this.booking = res.data;
                        this.current_step = 1;
                    })
                    .catch()
                    .finally();
            }

        },

        beforeDestroy() {
            this.$events.removeListener("booking:data:services", this.updateServices);
            this.$events.removeListener("final:model:update", this.updateModel)
            this.$root.$off('booking-estimate', this.getEstimatedPrice)
        },


        methods: {

            goBack() {
                if (this.back) {
                    this.$router.back();
                } else {
                    // taking the user to the correct dashoard
                    this.$router.replace({name: 'landing_page'});
                }
            },

            settingsRedirect() {
                let routeName = 'dashboard_calendar_list';
                if (this.$can('manage', 'role_customer')) {
                    routeName = 'customer_bookings_list';
                }
                this.$router.push({name: routeName});
            },

            scrollSidebar(event) {
                //for sidebar animation
                if (event.target.scrollTop > this.offset.top) {
                    this.jQsidebar.stop().animate({
                        marginTop: event.target.scrollTop - this.offset.top + 40
                    });
                } else {
                    this.jQsidebar.stop().animate({
                        marginTop: 0
                    });
                }
            },

            validate(ref) {
                return this.$refs[ref].validate();
            },

            updateModel() {
                //update an arbitrary property to force a reactive update
                this.bookingModel.timestamp = Math.random()
                let rand = this.finalBookingModel
            },

            proceed() {

                (async () => {
                    try {
                        let valid
                        for (let x = 0; x < this.stepRefs.length; x++) {
                            valid = await this.validate(this.stepRefs[x])
                            if (!valid) {
                                this.$nextTick(() => {
                                    $('.fullscreen-modal-display:first').animate({
                                        scrollTop: $(".el-form-item.is-error:first").offset().top
                                    }, 2000);
                                })
                                break;
                            }
                        }

                        if (valid) {
                            //at this point confirm  & pay
                            if (this.bookingModel.payment_type === "card") {

                                if (!this.bookingModel.stripe_payment_method_id && !this.bookingModel.cardId && !this.bookingModel.cardToken) {
                                    console.log('no card or token')
                                    if (this.$auth.user().company.payment_methods.card_processor === 'fspay') {
                                        this.$refs.paymentRef.submitFullSteam((model) => {
                                            this.bookingModel = {...this.bookingModel, ...model}
                                            this.submitBooking()
                                        })
                                    } else {
                                        this.$refs.paymentRef.getPaymentMethod((result) => {
                                            if (result && result.payment_method_id) {
                                                this.bookingModel.stripe_payment_method_id = result.payment_method_id;
                                                this.submitBooking();
                                            } else {
                                                this.model.payment_type = ''
                                                this.$message.error("Your card could not be verified.")
                                            }
                                        })
                                    }
                                } else {
                                    //card or token already added proceed to book
                                    console.log('card already selected or token generated')
                                    this.submitBooking()
                                }
                            } else {
                                this.submitBooking();
                            }
                        }

                    } catch (err) {

                    }
                })()


            },

            submitBooking() {
                //Payment Method ID can be used to create the stripe customer
                //submitt data to server to create the booking now
                //this.loading = true;

                if (this.finalBookingModel.payment_type === 'card' && (!this.finalBookingModel.stripe_payment_method_id && !this.finalBookingModel.cardId && !this.finalBookingModel.cardToken)) {
                    this.$alert("You can't submit Card Payment booking without a valid card")
                    return;
                }

                const loading = this.$loading({
                    lock: true,
                    text: 'Please wait whilst your booking is processed',
                    spinner: 'el-icon-loading',
                    background: 'rgba(255, 255, 255, 0.5)'
                });

                this.axios
                    .post("/companies/current/bookings", this.finalBookingModel)
                    .then(res => {

                        //google analytics tracking

                        if (this.$can('manage', 'google_analytics') && this.$trackingId) {
                            this.$gtag.pageview({
                                page_path: '/virtual-pageview/booking/staff-form/success.htm',
                                page_title: "Booking - Complete (Staff Form)"
                            })

                            this.$gtag.event('Complete', {
                                'event_category': 'Booking',
                                'event_label': 'Staff Form'
                            })

                        }


                        this.$message.success("Booking successfully placed");
                        this.$router.push({name: "dashboard_calendar_schedule"});
                    })
                    .catch((err) => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        loading.close();
                    });
            },

            updateCustomer(customer) {
                this.bookingModel.customer = customer;
            },

            updateServices(services) {
                this.company_services = services;
            },

            updateDate(date) {
                this.bookingModel.service_date = date;
            },

            getServiceName(srv) {
                let service = this.company_services.find(service => {
                    return srv === service.id;
                });

                if (service) return service.name;
            },

            getServiceOptions(service) {
                let full_service = this.company_services.find(srv => {
                    return service === srv.id;
                });

                if (!full_service) return;

                if (this.bookingModel.service_options[service]) {
                    if (this.bookingModel.service_options[service].hourly) {
                        return "<small>" + this.bookingModel.service_options[service].hourly.teams + " teams for " + this.bookingModel.service_options[service].hourly.hours + " hrs" + "</small>";
                    }

                    let content = "";

                    if (this.bookingModel.service_options[service].pricing_variables) {
                        for (var x in this.bookingModel.service_options[service].pricing_variables) {
                            let selected_pv = this.bookingModel.service_options[service].pricing_variables[x];

                            if (selected_pv.not_ranged) {
                                let full_pv = full_service.pricing_variables.find(pv => {
                                    return pv.id == x;
                                });

                                content += "<small>" + selected_pv.not_ranged + "x " + full_pv.name + "</small>";
                            }

                            if (selected_pv.ranged) {
                                content += "<small>" + selected_pv.ranged.label || "Range (" + selected_pv.ranged.min_qty + " - " + selected_pv.ranged.max_qty + ")" + "</small>";
                            }
                        }
                    }

                    return content;
                }
            },

            getServiceExtras(service) {
                if (this.bookingModel.extras && this.bookingModel.extras.length > 0)
                    this.bookingModel.extras.forEach(extra => {
                        //let full_extra = this.service_extras
                    });
                return "";
            },

            onStepValidate(validated, model) {
                if (validated) {
                    this.bookingModel = {...this.bookingModel, ...model};
                    if (this.bookingModel.services && this.bookingModel.services.length > 0) {

                    }
                    //this.getEstimatedPrice();
                }
            },

            getEstimatedPrice: _.debounce(function () {
                if (this.finalBookingModel.services && this.finalBookingModel.services.length > 0) {
                    this.axios
                        .post("/bookings/estimate_price", this.finalBookingModel)
                        .then(res => {
                            this.summary = res.data;
                        })
                        .catch()
                        .finally(_ => {
                        });
                } else {
                    this.summary = {};
                }
            }, 1000),

            setupCard(callback) {
                this.axios
                    .post("/payment_gateways/setup_intent", {})
                    .then(res => {
                        this.bookingModel.stripe_event.instance.handleCardSetup(res.data.client_secret,
                            this.bookingModel.stripe_event.card,
                            {
                                payment_method_data: {
                                    billing_details: {
                                        name: this.bookingModel.first_name + " " + this.bookingModel.last_name
                                    }
                                }
                            }).then(response => {
                            if (response.setupIntent.status === "succeeded") {
                                callback(response.setupIntent.payment_method);
                            } else {
                                callback(false);
                            }
                        });
                    })
                    .catch(err => {
                        callback(false);
                    })
                    .finally(_ => {
                    });
            },

            resetForm() {
                this.bookingModel = {}
                this.currentStep = 0
                this.$events.emitEvent('booking:form:reset')
            },

            toogleSummaryScroll() {
                this.scroll_locked = !this.scroll_locked
                if (this.scroll_locked) {
                    $('div.el-dialog.is-fullscreen.fullscreen-modal-display').off('scroll');
                } else {
                    $('div.el-dialog.is-fullscreen.fullscreen-modal-display').scroll(this.scrollSidebar)
                }
            }
        },

        beforeRouteEnter(to, from, next) {
            // finding out if it was the first url to handle back
            next(vm => {
                vm.back = !(from.fullPath === '/' && from.matched.length == 0 && from.name == null)
            })
        },
    };
</script>

<style lang="scss">
    .modal-body {


        &.create-booking {
            padding: 10px;

            .el-divider {
                margin: 44px 0px;
            }

            #price_sidebar {
                position: fixed;
                right: 0;
                width: 30%;
            }

            .summary-row {
                .el-col {
                    margin-bottom: 10px;

                    i {
                        font-size: 36px;
                        float: left;
                        margin-right: 10px;
                    }

                    p {
                        display: inline-block;
                        width: calc(100% - 100px);
                        padding: 0;
                        margin: 0;
                        line-height: 1.3;
                        color: black;
                    }

                    .services-rows {
                        display: inline-block;
                        width: calc(100% - 60px);

                        span {
                            display: block;

                            small {
                                display: block;
                                margin-left: 10px;
                            }
                        }
                    }
                }
            }

            .total-card {

                .el-divider {
                    margin: 10px 0px;
                }

                .text.item {
                    position: relative;
                    font-size: 15px;

                    i {
                        font-size: 15px;
                        font-style: normal;
                        position: absolute;
                        right: 10px;
                        font-weight: bold;
                    }
                }
            }

            .create-booking-card.el-card__body {
                padding: 0px;
            }
        }

        .booking-scroll-lock {
            margin-top: 3px;
            cursor: pointer;
        }

        .scroll-lock-icon {
            color: $launch-primary-color;
        }
    }
</style>
