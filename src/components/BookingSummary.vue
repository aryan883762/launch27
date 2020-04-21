<template>
    <div class="component-booking-summary">
        <el-row :gutter="40">
            <el-col :md="8" :sm="8" :xs="24" class="service-row">
                <el-row class="summary-row">

                    <el-card style="margin-bottom: 20px;">
                        <el-col><h4 class="cbs-make-light" style="margin: 0">Frequency</h4></el-col>
                        <el-col>
                            {{bookingModel.frequency.name}}
                        </el-col>
                        <el-col>
                            Is team pay discounted? : <strong>{{bookingModel.frequency.discount_team_pay? 'YES' :
                            'NO'}}</strong>
                        </el-col>

                    </el-card>

                    <el-card style="margin-bottom: 20px;">


                        <el-col><h4 class="cbs-make-light" style="margin: 0">Booking Summary</h4></el-col>
                        <el-col :sm="24" v-if="bookingModel.address">
                            <label class="header cbs-make-deep">Address:</label>
                            <p class="cbs-make-light">{{ bookingModel.address.full_address }}</p>
                        </el-col>

                        <el-col :sm="24" v-if="bookingModel.service_date">
                            <strong>Date & Time</strong>
                            <p class="" style="margin-left:10px;" v-if="!bookingModel.forecasted">
                                {{$moment(bookingModel.service_date).format($date_format + ' ' + $time_format) }}</p>
                            <p style="margin-left:10px;" v-if="bookingModel.forecasted">
                                <strong style="color:red;">{{$moment(bookingModel.forecasted_service_date).format($date_format + ' ' + $time_format) }}</strong></p>
                        </el-col>


                        <el-col :sm="24" v-if="bookingModel.service_date">
                            <strong>Duration</strong>
                            <el-tag style="margin-left: 10px" size="small" type="danger" effect="dark">{{bookingModel.duration | duration }}
                            </el-tag>
                        </el-col>

                    </el-card>


                    <el-card  v-if="$can('manage', 'view_booking_totals')">


                        <el-col><h4 class="cbs-make-light" style="margin: 0">Service Summary</h4></el-col>
                        <el-col :sm="24" v-if="bookingModel.services && bookingModel.services.length > 0">
                            <div class="services-rows">
                            <span v-for="service in bookingModel.service_details" :key="service.id">
                              <label>{{ service.name }}</label>
                              <div v-html="getServiceOptions(service)"></div>
                            </span>
                            </div>
                        </el-col>

                        <el-col :sm="24" v-if="bookingModel.services && bookingModel.services.length > 0">
                            <div class="services-rows">
                                <label>Extras</label>

                                <span v-for="service in bookingModel.services.filter(se => se.extras)" :key="service.id">
                              <small v-for="extra in service.extras.filter(ex => ex.service_id === service.id )"  :key="extra.id"> {{ extra.quantity }}x {{ extra.name }} </small>
                            </span>
                            </div>
                        </el-col>

                    </el-card>
                </el-row>
            </el-col>
            <el-col :md="16" :sm="16" :xs="24" v-if="bookingModel.status === 'cancelled' && $can('manage', 'view_booking_totals')" class="total-row"
                    style="background: #FFE0B2; margin-bottom: 5px;">
                <div>
                    <span class="cbs-label"> Date Cancelled </span> <span class="cbs-data">{{$moment(bookingModel.cancelled_at).format($date_format + " " + $time_format)}}</span>
                </div>
                <div>
                    <span class="cbs-label">Cancellation fee</span> <span class="cbs-data">{{ $currency }}{{ bookingModel.charge.cancelled_fee || 0 }}</span>
                </div>
                <div>
                    <span class="cbs-label">Reason: </span> <span class="cbs-data"> {{ bookingModel.cancellation_reason }}</span>
                </div>
                <div v-if="bookingModel.cancellation_comment">
                    <span class="cbs-label">Comment: </span> <span class="cbs-data"> {{ bookingModel.cancellation_comment }}</span>
                </div>
            </el-col>
            <el-col :md="16" :sm="16" :xs="24" class="total-row"  v-if="$can('manage', 'view_booking_totals')">
                <div>
                    <span class="cbs-label">Services</span> <span class="cbs-data">{{ $currency }}{{ bookingModel.charge.services }}</span>
                </div>
                <div>
                    <span class="cbs-label">Extra </span> <span class="cbs-data">{{ $currency }}{{ bookingModel.charge.extras }}</span>
                </div>
                <div>
                    <span class="cbs-label">Discount </span> <span class="cbs-data">({{ $currency }}{{ bookingModel.charge.discounts || 0}})</span>
                </div>
                <div>
                    <span class="cbs-label">Promo/Discount Code </span> <span class="cbs-data">({{ $currency }}{{ bookingModel.charge.discount_code_total || 0}})</span>
                </div>
                <!--<div>-->
                <!--<span class="cbs-label">Promo/Gift Card </span> <span class="cbs-data">({{ $currency }}{{ bookingModel.charge.giftcard_total || 0}})</span>-->
                <!--</div>-->
                <div>
                    <span class="cbs-label">Adjustment </span> <span class="cbs-data">{{ $currency }}{{ bookingModel.charge.adjustment || 0 }}</span>
                </div>
                <div>
                    <span class="cbs-label">Amount (before taxes) </span> <span class="cbs-data">{{ $currency }}{{ bookingModel.charge.total_before_tax }}</span>
                </div>
                <div>
                    <span class="cbs-label">Taxes </span> <span class="cbs-data">{{ $currency }}{{ bookingModel.charge.tax_amount }}</span>
                </div>
                <div>
                    <span class="cbs-label">Amount (after taxes) </span> <span class="cbs-data">{{ $currency }}{{ bookingModel.charge.total_after_tax }}</span>
                </div>
                <div>
                    <span class="cbs-label">Tip </span> <span class="cbs-data">{{ $currency }}{{ bookingModel.charge.tip || 0 }}</span>
                </div>
                <el-divider></el-divider>
                <div>
                    <span class="cbs-total-label">Final Amount</span> <span class="cbs-total-data">{{ $currency }} {{ bookingModel.charge.total_after_tax ? (bookingModel.charge.total_after_tax).toFixed(2) : 0 }}</span>
                    <span class="cbs-total-label">Total Payments Made</span> <span class="cbs-total-data">{{ $currency }} {{ bookingModel.charge.total_payments.toFixed(2) }}</span>
                    <span class="cbs-total-label">Total Refunds</span> <span class="cbs-total-data">{{ $currency }} {{ bookingModel.charge.total_refunds.toFixed(2) }}</span>
                </div>
            </el-col>
            <el-col :md="16" :sm="16" :xs="24"  class="service-row" v-else>
                <el-card class="summary-row">

                        <el-col><h4 class="cbs-make-light" style="margin: 0">Service Summary</h4></el-col>
                        <el-col :sm="24" v-if="bookingModel.services && bookingModel.services.length > 0">
                            <div class="services-rows">
                            <span v-for="service in bookingModel.service_details" :key="service.id">
                              <label>{{ service.name }}</label>
                              <div v-html="getServiceOptions(service)"></div>
                            </span>
                            </div>
                        </el-col>

                        <el-col :sm="24" v-if="bookingModel.services && bookingModel.services.length > 0">
                            <div class="services-rows">
                                <label>Extras</label>

                                <span v-for="service in bookingModel.services.filter(se => se.extras)" :key="service.id">
                              <small v-for="extra in service.extras.filter(ex => ex.service_id === service.id )"  :key="extra.id"> {{ extra.quantity }}x {{ extra.name }} </small>
                            </span>
                            </div>
                        </el-col>

                    </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        props: ["bookingModel"],
        data() {
            return {};
        },
        mounted() {
        },
        methods: {
            getServiceName(srv) {
                let service = this.bookingModel.service_details.find(service => {
                    return srv.id === service.id;
                });

                if (service) return service.name;
            },

            getServiceOptions(full_service) {
                if (full_service.hourly && this.bookingModel.services) {
                    let service = this.bookingModel.services.find(srv => {
                        return srv.id === full_service.id;
                    });

                    if (service) return "<small>" + service.hourly.teams + " teams for " + service.hourly.hours + " hrs" + "</small>";
                    else return "";
                }

                let content = "";

                if (full_service.pricing_variables && full_service.pricing_variables.length > 0) {
                    for (let x = 0; x < full_service.pricing_variables.length; x++) {
                        let selected_pv;

                        let service = this.bookingModel.services.find(srv => {
                            return srv.id === full_service.id;
                        });


                        if (service && service.pricing_variables){
                            let pvv = service.pricing_variables.find(pv => {
                                return pv.id === full_service.pricing_variables[x].id;
                            });

                            if (pvv) {
                                if (pvv.quantity) content += "<small>" + pvv.quantity + "x " + full_service.pricing_variables[x].name + "</small>";
                                else {
                                    if (full_service.pricing_variables[x].prices) {
                                        let price = full_service.pricing_variables[x].prices.find(price => {
                                            return price.id === pvv.price_id;
                                        });

                                        if (price)
                                            content += "<small>" + full_service.pricing_variables[x].name + " : " + (price.label || price.max_qty + " - " + price.min_qty) + "</small>";
                                        else
                                            content += "<small>" + full_service.pricing_variables[x].name
                                    } else {
                                        content += "<small>" + full_service.pricing_variables[x].name
                                    }

                                }
                            }
                        }


                        /* if (selected_pv.not_ranged) {
                                           let full_pv = full_service.pricing_variables.find(pv => {
                                               return pv.id == x;
                                           });

                                           content += "<small>" + selected_pv.not_ranged + "x " + full_pv.name + "</small>";
                                       }

                                       if (selected_pv.ranged) {
                                           content += "<small>" + selected_pv.ranged.label || "Range (" + selected_pv.ranged.min_qty + " - " + selected_pv.ranged.max_qty + ")" + "</small>";
                                       }*/
                    }
                }

                return content;
            },

            getServiceExtras(service) {
                if (this.bookingModel.extras && this.bookingModel.extras.length > 0)
                    this.bookingModel.extras.forEach(extra => {
                        //let full_extra = this.service_extras
                    });
                return "";
            }
        }
    };
</script>

<style lang="scss">
    .component-booking-summary {
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

                .header {
                    display: block;
                }

                .services-rows {
                    display: inline-block;
                    width: calc(100% - 60px);

                    span {
                        display: block;
                        font-size: 15px;
                        font-weight: bold;

                        small {
                            display: block;
                            margin-left: 10px;
                            font-size: 14px;
                            font-weight: 400;
                        }
                    }
                }
            }
        }

        .service-row {
            .cbs-make-light {
                color: #9b9dad !important;
            }

            .cbs-make-deep {
                color: black;
            }
        }


        .total-row {
            padding: 20px 40px;
            background-color: #E1F5FE;

            span {
                width: 70%;
                font-size: 14px;
                display: inline-block;
            }

            .cbs-label {
                /*    color: #69ccfd;
                    text-transform: uppercase;*/
                font-weight: 500;
                font-size: 12px;
                margin-bottom: 4px;
            }

            .cbs-data {
                /* color: #69ccfd;
                 text-transform: uppercase;*/
                font-size: 12px;
                width: 30%;
                margin-bottom: 4px;
            }

            .cbs-total-label {
                width: 70%;
                margin: 0px 0;
            }

            .cbs-total-data {
                font-weight: bold;
                width: 30%;
                margin: 0px 0;
            }
        }
    }
</style>
