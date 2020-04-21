<template>
    <el-dialog title="Print Schedule" :visible.sync="showModal" @close="closedModal" top="0vh"
               :append-to-body="true" :modal="true" :fullscreen="false" :close-on-press-escape="true" v-loading="loading">

        <div id="printTeamSchedule" >
            <div v-for="booking in bookings">
                <div class="booking-line" v-for="assignment in booking.team_assignments">
                    <table class="customers">
                        <tr>
                            <td>Booking Id</td>
                            <td>{{booking.id}}</td>
                        </tr>
                        <tr>
                            <td>Customer Name</td>
                            <td>{{booking.account.fullname}}</td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>{{booking.account.email}}</td>
                        </tr>
                        <tr>
                            <td>Phone number</td>
                            <td>{{booking.account.phone || booking.address.phone  }}</td>
                        </tr>
                        <tr>
                            <td>Address</td>
                            <td>{{booking.address.full_address}}</td>
                        </tr>

                        <tr>
                            <td>Zip Code</td>
                            <td>{{booking.address.zip}}</td>
                        </tr>
                        <tr>
                            <td>Date / Time</td>
                            <td>{{$moment(booking.service_date).format($date_format + ' ' + $time_format)}}</td>
                        </tr>
                        <tr>
                            <td>Payment Method</td>
                            <td>{{booking.payment_type}}</td>
                        </tr>
                        <tr v-if="booking.serviceCategoryId">
                            <td>Service Category</td>
                            <td>{{booking.service_category.name}}</td>
                        </tr>
                        <tr>
                            <td>Type of Service</td>
                            <td> <span v-for="service in booking.service_details">
                              <label>{{ service.name }}</label>
                              <div v-html="getServiceOptions(service, booking)"></div>
                            </span>
                            </td>
                        </tr>
                        <tr>
                            <td>Frequency</td>
                            <td v-if="booking.frequency.discount_type== 'percent'">{{booking.frequency.name}} -
                                ({{booking.frequency.discount}}%)
                            </td>
                            <td v-if="booking.frequency.discount_type== 'amount'">{{booking.frequency.name}} -
                                {{$currency}}{{booking.frequency.discount}}
                            </td>
                        </tr>

                       <!-- <tr>
                            <td>Final Price (after discounts and adjustments)</td>
                            <td>{{$currency}}{{booking.charge.total_before_tax}}</td>
                        </tr>
                        <tr>
                            <td>Sales Tax</td>
                            <td>{{$currency}}{{booking.charge.tax_amount}}</td>
                        </tr>
                        <tr>
                            <td>Final Amount with Tax</td>
                            <td>{{$currency}}{{booking.charge.total_after_tax}}</td>
                        </tr>-->
                        <tr>
                            <td>Duration</td>
                            <td>{{booking.duration | duration}}</td>
                        </tr>
                        <tr v-if="mode==='team'">
                            <td>Pay Rate</td>
                            <td v-if="assignment.pay_rate_type === 'percent'">{{assignment.pay_rate}} %</td>
                            <td v-if="assignment.pay_rate_type !== 'percent'">{{$currency}}{{assignment.pay_rate}}</td>
                        </tr>
                        <tr v-if="mode==='team'">
                            <td>Tip</td>
                            <td>{{$currency}} {{booking.charge.tip || 0}}</td>
                        </tr>
                        <tr>
                            <td>Notes from Customer</td>
                            <td>
                                <p>{{ booking.customer_notes || "No notes from the customer" }}</p>
                            </td>
                        </tr>
                        <tr>
                            <td>Staff notes</td>
                            <td>
                                <p>{{ booking.staff_notes || 'No Staff notes' }}</p>
                            </td>
                        </tr>
                        <tr>
                            <td>Additional Information</td>
                            <td>
                                <div v-if="booking.customFields">
                                    <el-row :gutter="5">
                                        <el-col :sm="6" v-for="(field, index) in booking.customFields" style="margin-bottom: 5px;">
                                            <el-card shadow="hover">
                                                <div slot="header">
                                                    <label> <strong>{{ field.label || field.title }} </strong> </label>
                                                </div>
                                                <p v-if="field.value">{{ field.valueText || field.value }}
                                                <p>
                                                <div v-if="field.values">
                                                    <label style="" v-for="val in field.values">{{val.label}}</label>
                                                </div>
                                            </el-card>

                                        </el-col>
                                    </el-row>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

    </el-dialog>
</template>

<script>
    export default {
        name: "print-schedule",
        props: {
            bookingIds: {
                type: Array,
                default: () => {
                    return []
                }
            },
            mode: {
                type: String,
                default: 'team'
            }
        },
        data() {
            return {
                showModal: false,
                bookings: [],
                loading: false
            }
        },
        created() {
            // Pass the element id here

        },
        mounted() {
            this.showModal = true

            //get the bookings
            //this.loading = true
            this.axios
                .get('/bookings', {
                    params: {
                        filter: {
                            where: {id: {inq: this.bookingIds}},
                            include: ["account", "address", {"team_assignments":"team"}, "charge", {"service_details": "pricing_variables"}, "service_category", "frequency"]
                        }
                    }
                })
                .then(res => {
                    this.bookings = res.data
                    this.startPrint()
                })
                .catch(err => {
                    this.$helpers.errorHandle(err)
                })
                .finally(() => {
                    this.loading = false
                })

        },
        methods: {
            settingsRedirect() {
                this.$router.back()
            },
            closedModal() {
                this.$emit('closed')
            },
            startPrint() {
                this.$nextTick(() => {
                    this.$htmlToPaper('printTeamSchedule',
                        {
                            styles: [
                                //'https://storage.googleapis.com/ux-cdn/print.css'
                                './print.css'
                            ]
                        }, () => {
                            this.showModal = false
                        });
                })
            },
            getServiceOptions(full_service, booking) {
                if (full_service.hourly) {
                    let service = booking.services.find(srv => {
                        return srv.id === full_service.id;
                    });

                    if (service) return "<small>" + service.hourly.teams + " teams for " + service.hourly.hours + " hrs" + "</small>";
                    else return "";
                }

                let content = "";

                if (full_service.pricing_variables && full_service.pricing_variables.length > 0) {
                    for (let x = 0; x < full_service.pricing_variables.length; x++) {
                        let selected_pv;

                        let service = booking.services.find(srv => {
                            return srv.id === full_service.id;
                        });


                        if (service && service.pricing_variables) {
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
        }
    }
</script>

<style>


    /**
 * Print stylesheet for yourwebsite.com
* @version         1.0
* @lastmodified    16.06.2016
*/

    @media print {
    }


    .inner-table {
        width: 100%;
        border-collapse: collapse;
    }

    .inner-table td {
        border: 0px solid #000;
    }

    .booking-line {
        page-break-after: always;
        display: block;
    }


    .customers {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 100px;
    }

    .customers tr td, #customers tr th {
        border: 1px solid #ddd;
        padding: 8px;
        page-break-inside: auto;
    }

    .customers tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    .customers tr:hover {
        background-color: #ddd;
    }

    .customers th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        color: black;
        text-align: center;
    }
</style>