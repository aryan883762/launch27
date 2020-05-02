<template>
    <el-form :model="model" :rules="rules" class="date-section-step" labelPosition="top" ref="form">

        <el-button type="primary" plain @click="showDialog()" style="width:100%; height: 100px;">
            <div v-if="model.service_date" style="color:black">
                <label>Selected Date & Time</label>
                <h3>{{$moment(model.service_date).format($date_format + ", " +
                    $time_format)}}</h3>
            </div>
            <div v-else>
                <h3>Choose date of service</h3>
            </div>
        </el-button>
        <div class="service-date-error" :class="{'el-form-item__error el-form-item is-error':!isValid}">
            Date & Time required
        </div>
        <el-dialog custom-class="date-section-step booking-teams-assignment" width="60%" top="0vh" append-to-body
                   modal-append-to-body
                   :modal="true" :visible.sync="dateDialog">

            <div class="modal-body">
                <h3 style="text-align: center">{{ (model.service_date.length) ? $moment(model.service_date).format($date_format + ' ' + $time_format) : '--'}}</h3>

                <el-divider>Choose date and time below</el-divider>

                <el-row :gutter="20">
                    <el-form label-position="top" style="margin-top: 20px;">
                        <el-col :sm="6">
                            <el-form-item label="Date">
                                <el-date-picker value-format="yyyy-MM-dd"
                                                :picker-options="pickerOptions"
                                                v-model="model.calendar_date"
                                                @change="getSpots"
                                                type="date"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="Choose my own time">
                                <VueCtkDateTimePicker
                                        :no-label=true
                                        output-format="HH:mm"
                                        :minute-interval="5"
                                        :formatted="$time_format" :format="$time_format" :only-time="true"
                                        v-model="manual_time"/>
                            </el-form-item>
                        </el-col>
                        <el-col :sm="18">
                            <el-form-item :label="available_spots.length ? 'Available spots' : '.'">
                                <p v-if="available_spots.length == 0 && !loading && model.calendar_date">
                                    No spots for {{$moment(model.calendar_date).format($date_format)}}
                                </p>

                                <div :key="dayIndex" style="box-shadow:none;" v-for="(day, dayIndex) in available_spots">
                                    <el-row :gutter="10">
                                        <el-col :sm="6" v-for="slot in day.slots">
                                            <el-card :class="{ selected: slot.datetime == model.service_date }"
                                                     @click.native="selectDate(slot.datetime, day.locationId, slot.arrival_window)" class="time-card"
                                                     shadow="hover" style="margin-bottom: 5px;">
                                                <i class="" style="margin-right : 10px;"></i><strong>
                                                {{$moment(slot.datetime).format($time_format)}}{{(slot.arrival_window > 0) ? ' - ' + $moment(slot.datetime).add(slot.arrival_window, 'minutes').format($time_format) : '' }}
                                            </strong>
                                            </el-card>
                                        </el-col>
                                    </el-row>
                                    <el-tag type="danger" v-if="!day.opened">
                                        Closed
                                    </el-tag>
                                </div>
                            </el-form-item>

                        </el-col>
                    </el-form>
                </el-row>


                <!-- <el-row v-if="booking.id && booking.frequency.rule_id !== 'onetime'">
                     <el-col :sm="24">
                         <p>Recurring booking, choose an option below:</p>
                         <el-radio :label="0" size="mini" v-model="model.update_mode">Only this booking</el-radio>
                         <el-radio :label="-1" size="mini" v-model="model.update_mode">This booking and future
                             bookings
                         </el-radio>
                         <el-radio :label="1" size="mini" v-model="model.update_mode">All Bookings</el-radio>
                     </el-col>
                 </el-row>-->

                <assign-team
                        v-if="teamDialog"
                        :location-id.sync="model.locationId"
                        :service_date.sync="model.service_date"
                        :service-ids.sync="services"
                        v-model="model.team_assignment">

                </assign-team>
            </div>
            <div slot="footer">
                <el-button size="small" type="primary" round @click="dateDialog = false"
                           :disabled="!model.service_date || loading">Continue
                </el-button>
            </div>
        </el-dialog>


    </el-form>
</template>

<script>

    import VDaySelector from '../../../components/vuelendar/components/vl-day-selector';
    import {
        MglMap,
        MglMarker,
        MglAttributionControl,
        MglNavigationControl,
        MglGeolocateControl,
        MglFullscreenControl,
        MglScaleControl
    } from "vue-mapbox";
    import AssignTeam from "../../../components/AssignTeam";

    export default {
        components: {
            AssignTeam,
            VDaySelector,
            MglMap,
            MglMarker,
            MglGeolocateControl,
            MglScaleControl
        },
        props: {
            coordinates: {
                type: [Object],
                default: () => {
                    return {};
                }
            },
            booking: {
                required: false
            },
            newBooking: {
                type: Object
            },
            team_assignment: []
        },
        data: () => {
            return {
                available_spots: [],
                mapStyle: "mapbox://styles/mapbox/streets-v10",
                loading: false,
                isValid: true,
                model: {
                    calendar_date: "",
                    service_date: "",
                    locationId: "",
                    coordinates: [0, 0],
                    team_assignment: [],
                    arrival_window: 0
                },
                manual_time: "",
                recurring_dates: [],
                rules: {
                    service_date: [{message: "Date & Time required", required: true, trigger: "blur"}]
                },
                dateDialog: false,
                active_tab: "tab_spots",
                services: [],
                pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() < Date.now();
                    }
                },
                teamDialog: false
            };
        },
        watch: {
            coordinates(val) {
            },
            model: {
                handler(val, oldval) {
                    this.validate();
                },
                deep: true
            },
            booking(val) {
                this.model.locationId = this.booking.locationId
                this.model.service_date = this.booking.service_date.replace(/\.[0-9]{3}/, '')
                this.model.calendar_date = this.$moment(this.booking.service_date).format('YYYY-MM-DD');
                this.services = this.booking.services
            },
            newBooking(val) {
                this.services = val.services
            },
            manual_time(val) {
                this.setManualDatetime(val)
            }
        },
        mounted() {
            // this.getSpots(this.$moment().format('YYYY-MM-DD'),this.$moment().format('YYYY-MM-DD'))
            //get confirmation options

            if (this.$route.query.service_date && !this.booking) {
                this.model.service_date = this.$route.query.service_date
                this.model.calendar_date = this.$moment(this.$route.query.service_date).format('YYYY-MM-DD')
                this.model.locationId = this.$route.query.locationId
            }

            if (this.booking && this.booking.service_date) {
                this.model.service_date = this.booking.service_date
                this.model.arrival_window = this.booking.arrival_window || 0
                this.model.calendar_date = this.$moment(this.booking.service_date).format('YYYY-MM-DD')
                this.model.team_assignment = this.booking.team_assignments || []
                this.services = this.booking.services
            }

            if (this.booking) {
                this.getSpots(
                    this.$moment(this.booking.service_date)
                        .utc()
                        .format("YYYY-MM-DD"),
                    this.$moment(this.booking.service_date)
                        .utc()
                        .format("YYYY-MM-DD")
                )
            }


            this.getRecurringDates()
        },
        methods: {
            onAddressMapOpen() {

            },

            confirmAddressMap() {

            },
            getMapBoxAccessToken() {
                return process.env.VUE_APP_MAPBOX_TOKEN;
            },

            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        if(this.model.service_date){
                            this.isValid = true;
                            this.$emit("on-validate", true, this.model);
                            resolve(true); 
                        }else{
                            this.isValid = false;
                            this.$emit("on-validate", false, this.model);
                            resolve(false);    
                        }
                    });
                });
            },

            getRecurringDates() {
                if (this.booking.id)
                    this.axios.get('/bookings/' + this.booking.id + '/forecasted/details', {
                        params: {
                            service_date: this.model.service_date || this.booking.service_date
                        }
                    })
                        .then(res => {
                            this.recurring_dates = res.data.delta
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        })
            },

            showDialog() {
                this.dateDialog = true
            },

            getSpots(start, end) {
                this.loading = true;

                this.manual_time = ""

                //remove whatever date has been previously selected
                //this.$set(this.model, 'service_date', "")
                this.validate()

                let coordinates = this.coordinates
                if (!coordinates.lat && this.booking) {
                    coordinates = this.booking.address.coordinates
                }

                let zip = ""
                if (this.newBooking && this.newBooking.address) {
                    zip = this.newBooking.address.zip
                } else if (this.booking && this.booking.zip) {
                    zip = this.booking.address.zip
                }

                if (!this.booking)
                    this.model.service_date = ""

                this.teamDialog = false

                this.axios
                    .get("/booking_spots/available_spots", {
                        params: {
                            from: start,
                            to: end,
                            coordinates: coordinates,
                            locationId: this.model.locationId,
                            zip: zip
                        }
                    })
                    .then(res => {
                        this.available_spots = res.data;

                        //show team dialot
                        this.teamDialog = true

                        if (this.booking) {
                            this.model.locationId = this.booking.locationId
                            //this.model.service_date = this.booking.service_date.replace(/\.[0-9]{3}/, '')
                            // this.model.calendar_date = this.$moment(this.booking.service_date).format('YYYY-MM-DD')
                            this.getRecurringDates()
                            //this.dateDialog = true
                        } else {

                        }
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                        this.available_spots = []
                        this.model.calendar_date = ""
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },

            selectDate(datetime, locationId, arrival_window) {
                this.model.service_date = datetime;
                this.model.locationId = locationId
                this.model.arrival_window = arrival_window
                this.getRecurringDates()
                this.manual_time = this.$moment(datetime).format("H:mm")
            },

            dragMarker($event) {
                let coordinates = $event.marker.getLngLat().toArray();

                this.axios
                    .get("https://api.mapbox.com/geocoding/v5/mapbox.places/" + coordinates[0] + "," + coordinates[1] + ".json?types=poi&access_token=" + this.getMapBoxAccessToken())
                    .then(res => {
                        if (res.data.features && res.data.features.length > 0) {
                            //this.model.address.full_address = res.data.features[0].place_name;
                            this.$refs.locationfrm.update(res.data.features[0].place_name);
                        }
                    })
                    .catch()
                    .finally(() => {
                        this.loading = false;
                    });

                this.model.coordinates = coordinates;
            },
            dateChanged(val) {
                this.getSpots(
                    this.$moment(val)
                        .utc()
                        .format("YYYY-MM-DD"),
                    this.$moment(val)
                        .utc()
                        .format("YYYY-MM-DD")
                );
            },
            setManualDatetime(val) {
                this.getLocationOnly(
                    this.$moment(this.model.calendar_date).utc().format("YYYY-MM-DD"),
                    this.$moment(this.model.calendar_date).utc().format("YYYY-MM-DD"), () => {

                        console.log(this.$moment.utc(this.model.calendar_date + " " + val).format('HH:mm'), this.$moment(this.model.service_date).format("HH:mm"))

                        if (this.$moment.utc(this.model.calendar_date + " " + val).format('HH:mm') !== this.$moment(this.model.service_date).format('HH:mm'))
                            this.model.service_date = this.$moment(this.model.calendar_date + " " + val).toISOString()
                    })
            },
            getLocationOnly(start, end, cb) {
                this.loading = true;

                let coordinates = this.coordinates
                if (!coordinates.lat && this.booking) {
                    coordinates = this.booking.address.coordinates
                }

                let zip = ""
                if (this.newBooking && this.newBooking.address) {
                    zip = this.newBooking.address.zip
                } else if (this.booking && this.booking.zip) {
                    zip = this.booking.address.zip
                }

                this.axios
                    .get("/booking_spots/available_spots", {
                        params: {
                            from: start,
                            to: end,
                            coordinates: coordinates,
                            locationOnly: true,
                            zip: zip
                        }
                    })
                    .then(res => {
                        this.model.locationId = res.data.locationId
                        cb()
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            disabledDate(date) {

            }
        }
    };
</script>

<style lang="scss">
    .date-section-step {
        .el-divider {
            margin: 5px 0px !important;
        }
        .service-date-error {
            display: none;
            position: relative!important;
        }
        .service-date-error.el-form-item__error {
            display: block;
        }
        .current-date-time {
            font-weight: 500;
            font-size: 15px;
            padding: 5px 10px;
            margin-bottom: 13px;
            display: block;
        }

        .admin-booking-date-select {
            .vl-calendar__arrow--back {
                left: 9px;
            }

            .vl-calendar__arrow--forward {
                right: 19px;
            }

            .vl-calendar-month.vl-calendar__month .vl-calendar-month__title {
                line-height: 1.8;

            }
        }

        .time-card {
            cursor: pointer;
            line-height: initial;

            &.selected {
                background: green;
                color: white;
            }

            .el-card__body {
                padding: 5px;
            }
        }

        .el-radio {
            width: 100%;
            display: block;

            .el-radio__label {
                margin-left: 10px;
            }
        }

        .next-date {
            background: #E3F2FD;
            padding: 0px;
            text-align: center;

            h3 {
                margin: 0px;

            }
        }

    }

    .booking-teams-assignment {
        .nocontent-tabs {
            .el-tabs__content {
                padding: 0;
            }
        }

        .date-time-picker {
            .field-input {
                height: 30px;
                min-height: 30px;
            }
        }
    }
</style>
