<template>
  <div class="calendar-map-view">

    <el-card  style="border:none; margin-bottom: 5px;">
      <el-row>
        <el-col class=" text-center flex-row">
          <div class="pull-left main-filters">
            <el-date-picker
              :clearable="false"
              :format="dt_format"
              end-placeholder="End date"
              range-separator="to"
              size="small" start-placeholder="Start date" type="daterange" v-model="date_range"
            />
          </div>

          <div class="main-filters">
            <el-select class="filter small" @change="loadSchedule"  v-if="selectedLocation" v-model="selectedLocation" value-key="id">
              <el-option :label="location.name" :value="location" v-for="location in $auth.user().company.locations"/>
            </el-select>
          </div>

        </el-col>
      </el-row>
    </el-card>


    <el-row :gutter="10">
      <el-col :md="18" :sm="18">
        <el-card :body-style="{padding: '0px'}">
          <div id="schedule-map" style="height:600px;">

          </div>
        </el-card>

        <el-row class="calendar-footer">
          <el-col :md="6" :sm="6" :xs="12" class="first">
            <span class="stats-number _first">{{total_bookings}}</span>
            <label>Total Bookings</label>
          </el-col>

          <el-col :md="6" :sm="6" :xs="12" class="second">
            <span class="stats-number _second">{{total_hours | duration}}</span>
            <label>Total Hours</label>
          </el-col>

          <el-col :md="6" :sm="6" :xs="12" class="third">
            <span class="stats-number _third">{{total_availability}}</span>
            <label>Total Availability</label>
          </el-col>

          <el-col :md="6" :sm="6" :xs="12" class="fourth">
            <span class="stats-number _fourth"> {{$currency}} {{total_revenue}}</span>
            <label>Total Revenue</label>
          </el-col>
        </el-row>
      </el-col>
      <el-col :md="6" :sm="6">

        <p>Booking Details</p>
        <div v-loading="booking_loading">
          <el-card class="popover-content" v-if="selectedBooking">
            <div class="booking-item">
              <account-avatar :account="{fullname:selectedBooking.account.fullname, avatar : selectedBooking.account.avatar}" :size="32" body-class="pull-left"></account-avatar>
              <div class="booking-details">
                <label>{{selectedBooking.account.fullname}}</label>
                <small style="font-weight: 500">{{selectedBooking.service_details[0].name}}</small>
                <small>{{selectedBooking.address.full_address}}</small>
              </div>
            </div>

            <el-divider></el-divider>

            <div class="summary-row" v-if="selectedBooking.services && selectedBooking.services.length > 0">
              <strong style="font-weight: 500;">{{$moment(selectedBooking.service_date).format($date_format + ' @ ' + $time_format)}}</strong>
              <div class="services-rows">
                      <span v-for="service in selectedBooking.service_details">
                        <label><i class="el-icon-caret-right"></i> {{ service.name }}</label>
                        <small v-for="extra in selectedBooking.extras" v-if="extra.service_id === service.id"> {{ extra.quantity }}x {{ extra.name }} </small>
                      </span>
              </div>
            </div>

            <el-divider></el-divider>

            <div class="total-card" style="margin-top: 5px;" v-if="selectedBooking.charge">

              <div class="text item">
                Sub total
                <i>{{ $currency }}{{ selectedBooking.charge.total_before_tax || 0 }}</i>
              </div>
              <div class="text item">
                Taxes
                <i>{{ $currency }}{{ selectedBooking.charge.taxes_total || 0 }}</i>
              </div>

              <div class="text item">
                Total
                <i>{{ $currency }}{{ selectedBooking.charge.total_after_tax || 0 }}</i>
              </div>
            </div>

            <el-divider></el-divider>
            <div class="assigned-teams" v-loading="loading.teams">
              <label>Assigned Teams</label>
              <div v-for="assigned in booking_assigned_teams">
                <account-avatar :account="{fullname: assigned.team.fullname || assigned.team.name, avatar:assigned.team.avatar}" body-class="pull-left"></account-avatar>
                <div class="popover-team">
                  <span>{{assigned.team.fullname || assigned.team.name}}</span>
                  <span>Wage: {{(assigned.pay_rate_type === 'percent') ? (assigned.pay_rate + '%') : ($currency + assigned.pay_rate) }}</span>
                </div>
              </div>
            </div>
            <el-divider></el-divider>
            <el-row>
              <el-col>
                <el-button @click="viewBooking(selectedBooking.id, selectedBooking.service_date)" class="pull-right" size="mini" type="danger">View Booking</el-button>
              </el-col>
            </el-row>

          </el-card>
        </div>

      </el-col>
    </el-row>


  </div>
</template>


<script>
    import Mapbox from "mapbox-gl";
    import AccountAvatar from "../../../components/AccountAvatar";

    export default {
        components: {AccountAvatar},
        data() {
            return {
                map: false,
                locations: [],
                filter_location: '',
                date_range: [],
                bookings_filter: '',
                loading: {
                    teams: false,
                    bookings: false,
                    locations: false
                },
                booking_assigned_teams: [],
                bookings: [],
                markers: [],
                selectedBooking: false,
                booking_loading: false,
                selectedLocation: '',
                dt_format: ''
            }
        },
        watch: {
            'date_range'(val) {
                this.loadSchedule()
            }
        },
        created() {
            // We need to set mapbox-gl library here in order to use it in template
            this.mapboxgl = Mapbox;
            this.date_range = [this.$moment().startOf('month').format('YYYY-MM-DD'), this.$moment().endOf('month').format('YYYY-MM-DD')]
            this.selectedLocation = this.$auth.user().company.locations[0]
            this.dt_format = this.$helpers.toElFormat(this.$date_format)
        },
        computed: {
            total_bookings() {
                return this.bookings.length
            },

            calendar_date() {
                return this.$moment(this.date_range[0]).format(this.$date_format) + ' - ' + this.$moment(this.date_range[1]).format(this.$date_format)
            },

            total_revenue() {
                let total = 0;
                this.bookings.forEach((booking) => {
                    if (booking.charge)
                        total += booking.charge.total_after_tax
                })
                return total.toFixed(2)
            },
            total_hours() {
                let total = 0;
                this.bookings.forEach((booking) => {
                    if (booking.duration)
                        total += booking.duration
                })
                return total
            },
            total_availability() {
                let total = 0;

                return total
            }
        },
        mounted() {
            //inititalize map
            this.mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;
            this.map = new this.mapboxgl.Map({
                container: 'schedule-map',
                style: 'mapbox://styles/mapbox/light-v10',
                center: this.$auth.user().company.locations[0].coordinates,
                zoom: 14
            });


            //this.marker.on('dragend', this.onDragEnd);

        },
        beforeDestroy() {
            if (this.map)
                this.map.remove()
        },
        methods: {

            viewBooking() {

            },
            loadSchedule() {

                let start_date = this.$moment(this.date_range[0]).utc().toISOString()
                let end_date = this.$moment((this.date_range[1] || this.date_range[0])).utc().toISOString()

                // this.b_loading = true
                this.axios
                    .get('/bookings/schedule', {
                        params: {
                            from: start_date,
                            to: end_date,
                            type: 'bookings',
                            forecasted: true,
                            status: 'active',
                            exclude_original: false,
                            include: ["charge"],
                            where: {locationId: this.selectedLocation.id}
                        }
                    })
                    .then(res => {
                        this.bookings = res.data

                        //first remove old markes
                        this.markers.forEach((marker) => {
                            marker.remove()
                        })

                        this.bookings.forEach((booking) => {
                            let coordinates = [booking.address.coordinates.lng, booking.address.coordinates.lat]

                            var popup = new this.mapboxgl.Popup({offset: 25, className: 'my-class'})
                                .setHTML(booking.account.fullname)
                                .setMaxWidth("300px")

                            // create DOM element for the marker
                            var el = document.createElement('i');
                            el.className = 'el-icon-location';
                            el.style.height = '20px';
                            el.style.width = '20px';
                            el.style.fontSize = '40px';
                            el.dataset.id = booking.id

                            el.addEventListener('mouseover', (event) => {
                                event.stopPropagation();
                                this.loadBooking(event.currentTarget.dataset.id)
                            })

                            el.addEventListener('click', (event) => {
                                event.stopPropagation();
                                this.loadBooking(event.currentTarget.dataset.id)
                            });

                            let marker = new this.mapboxgl.Marker({element: el, draggable: true}).setLngLat([booking.address.coordinates.lng, booking.address.coordinates.lat])
                                .setPopup(popup)
                                .addTo(this.map);

                            this.markers.push(marker)
                        })

                    })
                    .catch()
                    .finally(_ => {
                        //this.b_loading = false
                    })
            },
            loadBooking(bookingId) {
                this.booking_loading = true
                this.axios
                    .get('/bookings/' + bookingId, {
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
                                  {"team_assignments":"team"}
                                    ]
                            }
                        }
                    })
                    .then(res => {
                        this.selectedBooking = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(_ => {
                        this.booking_loading = false
                    })
            },
        }
    }
</script>

<style lang="scss">
  .calendar-map-view {
    .bookings-list {
      display: block;
      max-height: 593px;
      overflow: auto;
      min-height: 592px;

      .booking-item {
        display: block;
        height: 70px;
        padding: 10px 0px 0px 10px;
        cursor: pointer;

        .el-popover__reference {
          position: relative;

          .el-tag {
            position: absolute;
            top: 4px;
            right: 8px;
            font-size: 10px;
            border-radius: 0;
          }
        }

        &:hover {
          background: #f3f3f3;
        }

        .booking-details {
          width: calc(100% - 60px);
          display: inline-block;
          margin-left: 20px;

          label, small {
            display: block;
          }
        }
      }


    }
  }
</style>
