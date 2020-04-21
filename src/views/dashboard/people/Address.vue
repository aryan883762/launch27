<template>
    <div class="component-people-addresses " v-loading="loading">
        <div class="flex-row-reverse" style="margin-bottom: 10px;">
            <el-button @click="addAddress = '1'" icon="el-icon-plus" plain round size="mini" type="success"
                       v-if="!addAddress">
                Add a new Address
            </el-button>
        </div>

        <el-collapse accordion v-model="addAddress">
            <el-collapse-item name="1" v-if="addAddress">
        <span slot="title">
          <h4>New Address</h4>
        </span>

                <el-form :model="model.address" :rules="rules" label-position="top" ref="addressfrm">
                    <el-card>
                        <div slot="header" class="clearfix">
                            <el-form-item label="Search">
                                <form autocomplete="nope" onsubmit="return false">
                                    <vue-google-autocomplete name="locationinput" :country="[$auth.user().company.country.isoCode]"
                                                             classname="el-input__inner" id="booking_address_auto"
                                                             placeholder="Search for the address" ref="locationfrm"
                                                             types="address"
                                                             v-on:placechanged="getAddressData">
                                    </vue-google-autocomplete>
                                </form>
                            </el-form-item>
                        </div>
                        <el-col>
                            <el-row :gutter="20">
                                <el-col :md="24" :sm="24" :xs="24">
                                    <el-row :gutter="10">
                                        <el-col :sm="8">
                                            <el-form-item label="Street" prop="street">
                                                <el-input name="street" placeholder="Street"
                                                          v-model="model.address.street"/>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :sm="8">
                                            <el-form-item label="City" prop="city">
                                                <el-input name="city" placeholder="City" v-model="model.address.city"/>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :sm="8">
                                            <el-form-item label="State / Region" prop="state">
                                                <country-states :label="false" v-model="model.address.state"/>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :sm="8" v-if="$auth.user().company.show_zip">
                                            <el-form-item label="Zip" prop="zip" required>
                                                <el-input name="zip" placeholder="Zip" v-model="model.address.zip"/>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :sm="12">
                                            <el-form-item label="Phone" prop="phone">
                                                <el-input name="phone" type="tel" v-model="model.address.phone">
                                                    <span slot="prepend">{{ $auth.user().country.emoji }} +{{ $auth.user().country.phone }}</span>
                                                </el-input>
                                            </el-form-item>

                                        </el-col>
                                    </el-row>
                                </el-col>
                            </el-row>
                        </el-col>

                        <el-button @click="procConfirmAddress" class="block-center" round size="small" type="primary">
                            Save Address
                        </el-button>
                    </el-card>
                </el-form>


            </el-collapse-item>
        </el-collapse>
        <div v-loading="loading_addresses">
            <div class="border-shadow bg-white address-box" :key="address.id"
                 v-for="(address, index) in accountAddresses">
                <el-row>
                    <el-col :md="24" class="address-box-street-address-wrap">
                        <span class="address-box-content-title"> Street <el-tag class="default-address pull-right"
                                                                                type="success" v-if="address.default">Default Address</el-tag> </span>
                        <span class="address-box-street address-box-content-body">
                    {{ address.street }}
                    </span>
                    </el-col>
                    <el-col :md="8">
                    <span class="address-box-content-title">
                    City
                    </span>
                        <span class="address-box-content-body">
                    {{ address.city }}
                    </span>
                    </el-col>
                    <el-col :md="8">
                    <span class="address-box-content-title">
                    State
                    </span>
                        <span class="address-box-content-body">
                        {{ address.state }}
                    </span>
                    </el-col>
                    <el-col :md="8">
                    <span class="address-box-content-title">
                    ZIP Code
                    </span>
                        <span class="address-box-content-body">
                    {{ address.zip }}
                    </span>
                    </el-col>
                    <el-col v-if="address.coordinates">
                        Point: {{address.coordinates.lat}},{{address.coordinates.lng}}
                    </el-col>
                    <el-col :md="24" :sm="24" :xs="24">
                        <el-button-group>
                            <el-button @click="editAddress(address, index)" icon="el-icon-edit" size="mini"/>
                            <el-button @click="deleteAddress(address)" icon="el-icon-remove" size="mini"/>
                            <el-button @click="setAsDefault(address)" icon="el-icon-check" size="mini"
                                       v-if="!address.default"></el-button>
                        </el-button-group>
                    </el-col>
                </el-row>
            </div>
        </div>

        <el-dialog append-to-body :destroy-on-close="true" :visible.sync="confirmAddress"
                   title="Confirm Address Coordinates" width="50%">

            <el-alert :closable="false" type="warning" style="margin-bottom: 10px;">
                Confirm your address location by dragging the pin to the right location.
            </el-alert>

            <div class="location-map-large" style="min-height: 400px; display:block;">
                <MglMap :center="arrayCoordinates" :zoom="14" :access-token="getMapBoxAccessToken()"
                        :map-style.sync="mapStyle">
                    <MglGeolocateControl position="top-right"/>
                    <MglMarker :coordinates="arrayCoordinates" :draggable="true" @dragend="dragMarker">
                        <el-avatar slot="marker">
                            <i class="el-icon-map-location"></i>
                        </el-avatar>
                    </MglMarker>
                </MglMap>
            </div>

            <div slot="footer">
                <el-button @click="saveAddress()" size="mini">Confirm</el-button>
            </div>

        </el-dialog>
    </div>
</template>

<script>
    import VueGoogleAutocomplete from 'vue-google-autocomplete'
    import CountryStates from '../../../components/CountryStates'
    import Mapbox from "mapbox-gl"
    import {
        MglMap,
        MglMarker,
        MglAttributionControl,
        MglNavigationControl,
        MglGeolocateControl,
        MglFullscreenControl,
        MglScaleControl
    } from "vue-mapbox"

    export default {
        components: {
            VueGoogleAutocomplete,
            CountryStates,
            MglMap,
            MglMarker,
            MglGeolocateControl,
            MglScaleControl
        },
        data: function () {
            return {
                accountAddresses: [],
                addAddress: '',
                model: {
                    address: {
                        street: '',
                        phone: '',
                        city: '',
                        state: '',
                        zip: '',
                        accountId: '',
                        companyId: '',
                        coordinates: this.$auth.user().company.coordinates,
                    }
                },
                confirmAddress: false,
                loading: false,
                accountId: '',
                companyId: '',
                rules: {
                    street: [{message: "Street is required", required: true}],
                    state: [{message: "State is required", required: true}],
                    phone: [{message: "Phone is required", required: true}],
                    city: [{message: "city is required", required: true}],
                    zip: [
                        {
                            validator: (value, rule, callback) => {
                                if(this.$auth.user().company.show_zip && !this.model.address.zip){
                                    return callback(new Error('zip is required'));
                                }

                                return callback();
                            }
                        },
                    ],
                },
                loading_addresses: false,
                mapStyle: "mapbox://styles/mapbox/streets-v10"
            }
        },
        computed: {
            arrayCoordinates() {
                return [this.model.address.coordinates.lng, this.model.address.coordinates.lat];
            }
        },
        created() {
            // load initial data if it via a route change

            // add component
            this.$events.addListener('account-changed', this.personChangedEvent)

            if (this.$route.params.id) {
                this.loading = true
                this.axios
                    .get('/accounts/' + this.$route.params.id + '/addresses')
                    .then(res => {
                        this.addAddress = ''
                        this.accountAddresses = res.data
                    })
                    .catch(err => {
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        },

        watch: {
            addAddress(val) {
                if (val) {
                    // this.resetForm();
                }
            },
            $route(val) {

            }
        },

        beforeDestroy() {
            // remove all events added by the component
            this.$events.removeListener('account-changed', this.personChangedEvent)
        },

        methods: {
            getAddressData(addressData, placeResultData, id) {
                let format_address = this.$format_address_components(addressData)
                this.model.address.street = format_address.street
                this.model.address.city = format_address.city
                this.model.address.state = format_address.state
                this.model.address.zip = format_address.zip
                this.model.address.coordinates = {
                    lat: placeResultData.geometry.location.lat(),
                    lng: placeResultData.geometry.location.lng()
                }
            },

            // EVENTS
            personChangedEvent(account) {

            },

            resetForm() {
                this.model = {
                    address: {
                        street: '',
                        phone: '',
                        city: '',
                        state: '',
                        zip: '',
                        coordinates: this.$auth.user().company.coordinates,
                        accountId: this.$auth.user().id
                    }
                }

                this.addAddress = ''
            },
            editAddress(address) {
                this.model.address = address
                this.addAddress = '1'
            },
            deleteAddress(address, index) {
                this.accountAddresses.splice(index, 1)
                this.axios.delete('/accounts/' + this.$route.params.id + '/addresses/' + address.id).then(res => {
                    this.$message.success('Address Deleted')
                    this.reloadAddresses()
                })
            },
            setAsDefault(address) {
                this.axios.patch('/addresses/' + address.id, {default: true}).then(res => {
                    this.$message.success('Address set as default')
                    this.reloadAddresses()
                })
            },
            reloadAddresses() {
                this.resetForm()
                this.loading_addresses = true
                this.axios.get('/accounts/' + this.$route.params.id + '/addresses')
                    .then(res => {
                        this.addAddress = ''
                        this.accountAddresses = res.data
                    })
                    .catch((err) => {
                    })
                    .finally(() => {
                        this.loading_addresses = false
                    })
            },
            saveAddress(address) {
                // make sure accoutId & companyId are attached to all requests
                // this.model.address.accountId = this.$auth.user().id

                this.confirmAddress = false

                this.$refs.addressfrm.validate(valid => {
                    if (valid) {
                        if (this.model.address.hasOwnProperty('id')) {
                            let data = JSON.parse(JSON.stringify(this.model.address))
                            delete data.id
                            this.axios.patch('/addresses/' + this.model.address.id, data).then(res => {
                                this.$message.success('Address successfully updated')
                                this.addAddress = '1'
                                this.reloadAddresses()
                            })
                        } else {
                            this.axios.post('/accounts/' + this.$route.params.id + '/addresses', this.model.address).then(res => {
                                this.$message.success('Address successfully added')
                                this.addAddress = '1'
                                this.reloadAddresses()
                            })
                        }
                    }
                })
            },
            procConfirmAddress() {
                this.$refs.addressfrm.validate(valid => {
                    if (valid)
                        this.confirmAddress = true
                })
            },
            getMapBoxAccessToken() {
                return process.env.VUE_APP_MAPBOX_TOKEN;
            },
            dragMarker($event) {

                let coordinates = $event.marker.getLngLat().toArray();
                this.model.address.coordinates = {
                    lat: coordinates[1],
                    lng: coordinates[0]
                };
            },


        }
    }
</script>

<style lang="scss" src="./styles/Address.scss"/>
