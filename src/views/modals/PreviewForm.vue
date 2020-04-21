<template>
    <el-row :gutter="10" class="full-width modal-preview-form">
        <el-col :sm="24" :xs="24" :md="24" class="">

            <el-collapse v-model="current_step" accordion>
                <el-collapse-item name="0">
                    <template slot="title">
                        <span>TELL US ABOUT YOURSELF</span>
                    </template>
                    <div>
                        <el-card shadow="hover">

                            <el-form label-position="top" ref="bookingfrm_step_1" :rules="rules" :model="booking">

                                <el-row :gutter="40">

                                    <el-col :sm="8">
                                        <el-form-item label="Email" prop="email">
                                            <el-input type="text" v-model="booking.email"/>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :sm="8">
                                        <el-form-item label="First Name" prop="first_name">
                                            <el-input type="text" v-model="booking.first_name"/>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :sm="8">
                                        <el-form-item label="Last Name" prop="last_name">
                                            <el-input type="text" v-model="booking.last_name"/>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :sm="8">
                                        <el-form-item label="Company">
                                            <el-input type="text" v-model="booking.company"/>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :sm="8">

                                        <el-form-item label="Where you heard about us">
                                            <el-select v-model="booking.referral_source">
                                                <el-option value="1">Google Search</el-option>
                                                <el-option value="2">Referral</el-option>
                                                <el-option value="3">Our Website</el-option>
                                                <el-option value="4">Other</el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>

                                    <el-col :sm="8">
                                        <el-form-item label="Booking">
                                            <el-radio-group v-model="booking.mode_of_booking">
                                                <el-radio label="phone">Phone</el-radio>
                                                <el-radio label="web">Web</el-radio>
                                                <el-radio label="chat">Chat</el-radio>
                                            </el-radio-group>
                                        </el-form-item>
                                    </el-col>

                                </el-row>

                            </el-form>

                        </el-card>


                        <el-button round type="primary" class="block-center" @click="next('2')">Continue</el-button>
                    </div>

                </el-collapse-item>


                <el-collapse-item name="1" v-if="form_type == 'carpet_cleaning'">
                    <template slot="title">
                        <span>CARPET CLEANING FIELDS</span>
                        <p>Add Carpet Care Related fields</p>
                    </template>
                    <div>
                        <el-button round type="primary" class="block-center" @click="next('2')">Continue</el-button>
                    </div>
                </el-collapse-item>


                <el-collapse-item name="1" v-if="form_type == 'lawncare'">
                    <template slot="title">
                        <span>LAWN CARE</span>
                        <p>Add Lawn Care Related fields</p>
                    </template>
                    <div>
                        <el-button round type="primary" class="block-center" @click="next('2')">Continue</el-button>
                    </div>
                </el-collapse-item>


                <el-collapse-item name="1" v-if="form_type == 'dog_walking'">
                    <template slot="title">
                        <span>DOG WALKING</span>
                    </template>
                    <div>
                        <el-button round type="primary" class="block-center" @click="next('2')">Continue</el-button>
                    </div>
                </el-collapse-item>


                <el-collapse-item name="1" :disabled="current_step < '2'">
                    <template slot="title">
                        <span>BOOKING/TASK LOCATION</span>
                    </template>
                    <div>
                        <el-card shadow="hover">
                            <el-form label-position="top" ref="bookingfrm_step_2" :rules="rules" :model="booking">

                                <el-form-item label="Your Address" prop="auto_address">
                                    <vue-google-autocomplete id="booking_address_auto" classname="el-input__inner"
                                                             placeholder="Start typing"
                                                             v-on:placechanged="getAddressData"></vue-google-autocomplete>
                                    <el-link href="javascript:" style="font-size: 12px;" @click="openMapDialog = true">
                                        {{ booking.coordinates }}
                                    </el-link>

                                    <div class="el-form-item__error"></div>
                                </el-form-item>

                            </el-form>

                            <div v-if="false">
                                <h5>Service Address</h5>

                                <el-form-item label="Address">
                                    <el-input v-model="booking.address.address1"></el-input>
                                </el-form-item>
                                <el-form-item label="Phone">
                                    <el-input v-model="booking.address.phone"></el-input>
                                </el-form-item>

                                <el-row :gutter="10">
                                    <el-col :sm="8" :md="8" :xs="24">
                                        <el-form-item label="City" prop="address">
                                            <el-input v-model="booking.address.city"/>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :sm="8" :md="8" :xs="24">
                                        <el-form-item label="State">
                                            <el-input v-model="booking.address.state"/>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :sm="8" :md="8" :xs="24">
                                        <el-form-item label="Zip">
                                            <el-input v-model="booking.address.zip"/>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </div>
                        </el-card>

                        <el-button round type="primary" class="block-center" @click="next('3')">Continue</el-button>
                    </div>

                </el-collapse-item>

                <el-collapse-item name="3" disabled>

                    <template slot="title">
                        <span>TELL US THE DETAILS OF YOUR TASK</span>
                    </template>

                    <div>

                        <el-form label-position="top" ref="bookingfrm_step_3" :rules="rules" :model="booking">

                            <el-card shadow="hover">
                                <h4>Choose your services</h4>

                                <el-form-item prop="services">
                                    <el-select v-model="booking.services" value-key="id" multiple filterable
                                               collapse-tags>
                                        <el-option v-for="service in company_services" :label="service.name"
                                                   :key="service.id" :value="service"/>
                                    </el-select>
                                </el-form-item>

                                <div shadow="never" v-for="service in booking.services"
                                     v-if="service.pricing_variables.length > 0">
                                    <el-form-item :label="pv.name" v-for="(pv, index) in service.pricing_variables">
                                        <el-select v-model="service.pricing_variables[index].quantity">
                                            <el-option v-for="n in pv.prices[0].max_qty" :label="n + ' ' + pv.name"
                                                       :value="n" v-if="n >= pv.prices[0].min_qty"> {{ n }} {{ pv.name
                                                }}
                                            </el-option>
                                        </el-select>
                                    </el-form-item>

                                    <el-form-item>
                                        <el-select popper-class="custom-select" collapse-tags multiple filterable
                                                   v-model="booking.extras" placeholder="Add Extras">
                                            <el-option v-for="(extra, index) in service.extras" :key="extra.id"
                                                       :label="extra.name" :value="extra.id">
                                                <el-row>
                                                    <el-col :sm="4">
                                                        <el-avatar></el-avatar>
                                                    </el-col>
                                                    <el-col :sm="20">
                                                        <div style="display:block;">
                                                            <span>{{ extra.name }}</span> - <strong>{{ $currency }}{{
                                                            extra.price }}</strong>
                                                        </div>
                                                        <i style="font-size: 12px; font-style:normal;">Min: {{
                                                            extra.minimum_quantity }}</i>
                                                        <el-divider direction="vertical"></el-divider>
                                                        <i style="font-size: 12px; font-style:normal;">Max: {{
                                                            extra.maximum_quantity }}</i>
                                                    </el-col>
                                                </el-row>
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                </div>

                            </el-card>

                        </el-form>


                        <el-button round type="primary" class="block-center" @click="next('4')">Continue</el-button>
                    </div>
                </el-collapse-item>


                <el-collapse-item name="4" disabled>

                    <template slot="title">
                        <span>ASSIGN CHECKLIST AND TEAMS</span>
                    </template>

                    <div>
                        <el-form label-position="top" ref="bookingfrm_step_4" :rules="rules" :model="booking">

                            <el-card shadow="hover">
                                <el-checkbox v-model="booking.assign_team">Assign Checklist</el-checkbox>
                                <div shadow="hover" v-if="booking.assign_team">
                                    <el-form-item label="Team">
                                        <el-select v-model="booking.teamIds" multiple filterable collapse-tags>
                                            <el-option v-for="team in company_teams" :label="team.name" :value="team.id"
                                                       :key="team.id"/>
                                        </el-select>
                                    </el-form-item>
                                </div>

                                <div class="divider"></div>


                                <el-checkbox v-model="booking.add_checklist">Assign Checklist</el-checkbox>
                                <div shadow="hover" v-if="booking.add_checklist">
                                    <el-form-item label="Checklist">
                                        <el-select v-model="booking.checklistIds" multiple filterable collapse-tags>
                                            <el-option v-for="checklist in company_checklists" :label="checklist.name"
                                                       :value="checklist.id" :key="checklist.id"/>
                                        </el-select>
                                    </el-form-item>
                                </div>

                                <div class="divider"></div>

                                <el-form-item label="Duration">
                                    <el-input v-model="booking.duration"></el-input>
                                </el-form-item>

                            </el-card>

                        </el-form>

                        <el-button round type="primary" class="block-center" @click="next('5')">Continue</el-button>
                    </div>

                </el-collapse-item>


                <el-collapse-item name="5" disabled>
                    <template slot="title">
                        <span>FREQUENCY AND DISCOUNT</span>
                    </template>
                    <div>
                        <el-card>
                            <el-form label-position="top" ref="bookingfrm_step_5" :rules="rules" :model="booking">


                                <el-form-item label="frequency">
                                    <el-select v-model="booking.frequencyId" filterable collapse-tags>
                                        <el-option v-for="frequency in company_frequencies" :label="frequency.name"
                                                   :value="frequency.id" :key="frequency.id"/>
                                    </el-select>
                                </el-form-item>

                                <el-row :gutter="10">
                                    <el-col :sm="12" :xs="12" :md="12">
                                        <el-form-item label="Discount Code">
                                            <el-input v-model="booking.discount_code"></el-input>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :sm="12" :xs="12">
                                        <el-form-item label="Tip">
                                            <el-input v-model="booking.tip"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>

                                <el-form-item label="Credit Cards on File">
                                    <el-button type="text" size="mini" class="text-button pull-right"
                                               icon="el-icon-plus">Add New Card
                                    </el-button>
                                </el-form-item>

                            </el-form>
                        </el-card>

                        <el-button round type="primary" class="block-center" @click="next('6')">Continue</el-button>
                    </div>
                </el-collapse-item>

                <el-collapse-item name="6">
                    <template slot="title">
                        <span>CHOOSE A DATE & TIME</span>
                    </template>
                    <div>
                        <el-form label-position="top" ref="bookingfrm_step_6" :rules="rules" :model="booking">

                            <el-form-item label="Service Date & Time">
                                <el-row :gutter="10">
                                    <el-col :sm="12">
                                        <el-date-picker v-model="booking.service_date" type="date"
                                                        placeholder="Select date and time"></el-date-picker>
                                    </el-col>
                                    <el-col :sm="12">
                                        <el-time-select
                                                v-model="booking.service_time"
                                                :picker-options="{
                                  start: '08:30',
                                  step: '00:15',
                                  end: '18:30'
                                }"
                                                placeholder="Select time">
                                        </el-time-select>
                                    </el-col>
                                </el-row>
                            </el-form-item>

                            <el-checkbox v-model="booking.has_end_time" v-if="form_type == 'moving'">Time of Delivery
                            </el-checkbox>

                        </el-form>
                    </div>

                </el-collapse-item>


            </el-collapse>

        </el-col>


        <el-dialog title="Confirm your location" :visible.sync="openMapDialog" append-to-body
                   :close-on-press-escape="false">
            <el-alert :closable="false" type="warning" style="margin-bottom: 10px;">
                Confirm your address location by dragging the pin to the right location.
            </el-alert>

            <div class="location-map-large" style="min-height: 400px; display:block;">
                <MglMap :center="booking.coordinates" :zoom="14" :access-token="getMapBoxAccessToken()"
                        :map-style.sync="mapStyle">
                    <MglGeolocateControl position="top-right"/>
                    <MglMarker :coordinates="booking.coordinates" :draggable="true" @dragend="dragMarker">
                        <el-avatar slot="marker">
                            <i class="el-icon-map-location"></i>
                        </el-avatar>
                    </MglMarker>
                </MglMap>
            </div>

            <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="openMapDialog = false">Confirm</el-button>
      </span>
        </el-dialog>

    </el-row>
</template>


<script>
    import VueGoogleAutocomplete from "vue-google-autocomplete";
    import Mapbox from "mapbox-gl";
    import {
        MglMap,
        MglMarker,
        MglAttributionControl,
        MglNavigationControl,
        MglGeolocateControl,
        MglFullscreenControl,
        MglScaleControl
    } from "vue-mapbox";

    export default {
        components: {
            VueGoogleAutocomplete,
            MglMap,
            MglMarker,
            MglGeolocateControl,
            MglScaleControl
        },

        props: {
            form_type: {
                type: String
            }
        },
        data: () => {
            return {

                showModal: false,
                mapStyle: "mapbox://styles/mapbox/streets-v10",
                booking: {
                    first_name: "",
                    last_name: "",
                    email: "",
                    company: "",
                    referral_source: "",
                    mode_of_booking: "phone",
                    serviceIds: [],
                    services: [],
                    duration: 0,
                    teamIds: [],
                    discount_code: "",
                    frequencyId: "",
                    tip: 0,
                    address: {},
                    checklistIds: [],
                    auto_address: "",
                    teams: [],
                    service_date: "",
                    service_time: "",
                    has_end_time: false,
                    add_checklist: false,
                    assign_team: false,
                    coordinates: [0, 0],
                    custom_coordinates: [0, 0],
                    extras: []
                },
                company_services: [],
                company_frequencies: [],
                company_checklists: [],
                company_teams: [],
                total_price: 0,
                rules: {
                    first_name: [{message: "First name required", required: true, trigger: "blur"}],
                    last_name: [{message: "last name required", required: true, trigger: "blur"}],
                    email: [
                        {type: 'email', trigger: "blur", message: "A valid email must be provided"},
                        {required: true, trigger: "blur"}],
                    auto_address: [{message: "Your Location is required", required: true, trigger: "blur"}],
                    services: [{required: true, trigger: "blur"}]
                },
                openMapDialog: false,
                current_step: "6",
            };
        },

        computed: {
            form_types() {
                let arr = []
                if (this.industries)
                    this.industries.forEach((industry) => {
                        arr.push(industry.industry_code)
                    })
                return arr
            }
        },

        beforeMount() {
            this.axios
                .get("/companies/current/services", {
                    params: {
                        filter: {
                            include: [{"pricing_variables": "prices"}, "extras"]
                        }
                    }
                })
                .then(res => {
                    this.company_services = res.data;
                })
                .catch(err => {
                });

            this.axios
                .get("/companies/current/frequencies")
                .then(res => {
                    this.company_frequencies = res.data;
                })
                .catch(err => {
                });

            this.axios
                .get("/companies/current/checklists")
                .then(res => {
                    this.company_checklists = res.data;
                })
                .catch(err => {
                });

            this.axios
                .get("/companies/current/teams")
                .then(res => {
                    this.company_teams = res.data;
                })
                .catch(err => {
                });
        },

        methods: {
            next(level) {

                switch (level) {
                    case '2':

                        this.$refs.bookingfrm_step_1.validate(
                            (valid) => {
                                if (valid) {
                                    //move to the next step
                                    this.current_step = '2'
                                }
                            }
                        )

                        break;

                    case '3':

                        this.$refs.bookingfrm_step_2.validate(
                            (valid) => {
                                if (valid) {
                                    //move to the next step
                                    this.current_step = '3'
                                }
                            }
                        )

                        break;


                    case '4':

                        this.$refs.bookingfrm_step_3.validate(
                            (valid) => {
                                if (valid) {
                                    //move to the next step
                                    this.current_step = '4'
                                }
                            }
                        )

                        break;


                    default :
                        this.current_step = level
                        //todo: validate state before moving to the next next
                        break;
                }
            },
            createBooking() {
                //add total_price
                //todo: Total Price should be calculated at the server

                this.$refs.bookingfrm.validate(valid => {
                    if (valid) {
                        this.booking.total_price = this.total_price;

                        this.axios
                            .post("/companies/current/bookings", this.booking)
                            .then(res => {
                                this.$message.success("Booking successfully placed");
                                this.showModal = false;
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this);
                                ;
                            })
                            .then(() => {
                            });
                    }
                });
            },
            hasPricingVariables(service_id) {
                let has_pv = false;
                this.company_services.some(service => {
                    if (service.id === service_id) {
                        has_pv = true;
                        return true;
                    }
                });

                return has_pv;
            },
            getEstimatedDuration() {
            },

            getTotalPrice() {
                let total = 0;
            },

            getAddressData(addressData, placeResultData, id) {
                this.booking.auto_address = addressData;
                this.booking.coordinates = [placeResultData.geometry.location.lng(), placeResultData.geometry.location.lat()];
                this.openMapDialog = true;
            },

            getMapBoxAccessToken() {
                return process.env.VUE_APP_MAPBOX_TOKEN;
            },

            dragMarker($event) {
                this.booking.coordinates = $event.marker.getLngLat().toArray();
            },
        }
    }
</script>


<style lang="scss">
    .modal-preview-form {
        .modal-body.booking-form-setup {


            .location-map {
                width: calc(100%);
                height: 200px;
            }

            .no-padding {
                .el-card__body {
                    padding: 0px;
                }
            }

            .el-select-dropdown__item {
                height: 50px !important;
            }

            .el-button {
                margin-top: 10px;
            }

            .el-collapse-item {
                margin-bottom: 20px;
                border: 1px solid #f3f3f3;
                padding: 20px;
                background: white;

                p {
                    display: block
                }

                .el-collapse-item__wrap {
                    border-bottom: none;
                }
            }

            .el-date-editor {
                input {
                    max-width: 100%;
                }
            }
        }
    }

</style>
