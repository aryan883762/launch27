<template>
    <el-form :model="model" :rules="rules" autocomplete="nope" label-position="top" ref="form" v-loading="loading">

        <el-row :gutter="40">
            <el-col :md="24" :sm="24">
                <el-row>

                    <el-col :sm="24" v-if="accountId && accountId.length > 0">
                        <el-form-item>
                            <span slot="label"> Select an Address <el-button @click="addNewAddress()" size="mini"
                                                                             type="text"> (Add new address)</el-button> </span>
                            <el-select @change="chooseAddress" v-model="addressId">
                                <el-option :key="address.id" :label="address.full_address" :value="address.id"
                                           v-for="address in account_addresses">
                                    <div class="address-item">
                                        <label>{{ address.full_address }}</label>
                                    </div>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :sm="24">
                        <el-form-item prop="address">
                            <el-row :gutter="10">
                                <!--<el-col :sm="24" v-if="is_new">
                                    <el-form-item label="Enter your address" prop="auto_address">
                                        <vue-google-autocomplete :country="[$auth.user().company.country.isoCode]"
                                                                 classname="el-input__inner" id="booking_address_auto"
                                                                 placeholder="Enter new address" ref="locationfrm"
                                                                 types="address"
                                                                 v-on:placechanged="getAddressData"></vue-google-autocomplete>
                                        <div class="el-form-item__error"></div>
                                    </el-form-item>
                                </el-col>-->

                                <el-col>
                                    <el-input placeholder="Phone" type="tel"
                                              v-model="model.address.phone"></el-input>
                                </el-col>
                                <br/>

                                <el-col :sm="18">
                                    <el-input :disabled="!!(model.address.id)" placeholder="Street"
                                              v-model="model.address.street"></el-input>
                                </el-col>
                                <el-col :sm="6">
                                    <el-input :disabled="!!(model.address.id)" placeholder="Unit Number"
                                              v-model="model.address.apartment"></el-input>
                                </el-col>
                                <el-col>
                                    <el-input :disabled="!!(model.address.id)" placeholder="City"
                                              v-model="model.address.city"></el-input>
                                </el-col>
                                <el-col :sm="12">
                                    <country-states :label="false" :disabled="!!(model.address.id)" v-model="model.address.state"></country-states>
                                </el-col>
                                <el-col :sm="12" v-if="$auth.user().company.show_zip">
                                    <el-input :disabled="!!(model.address.id)" placeholder="Zip"
                                              v-model="model.address.zip"></el-input>
                                </el-col>

                            </el-row>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-col>
           <!-- <el-col :md="12" :sm="12">
                <small v-if="is_new"> Drag map ping to confirm your location if different</small>
                <div class="address-map-wrapper" id="address-map" style="height: 250px;">

                </div>
            </el-col>-->

        </el-row>


    </el-form>
</template>

<script>
    import VueGoogleAutocomplete from "vue-google-autocomplete";
    import Mapbox from "mapbox-gl";
    import CountryStates from "../../../components/CountryStates";

    var parser = require("parse-google-autocomplete");

    export default {
        props: {
            accountId: {
                type: String
            },
            booking: {
                type: [Object, Boolean]
            },
            phone : {}
        },
        components: {
            CountryStates,
            VueGoogleAutocomplete
        },
        data() {
            return {
                //mapStyle: "mapbox://styles/mapbox/light-v10",
                model: {
                    address: {
                        apartment: "",
                        street: "",
                        city: "",
                        state: "",
                        zip: ""
                    },
                    coordinates: [0, 0]
                },
                addressId: '',
                loading: false,
                auto_address: {},
                addressMap: false,
                account_addresses: [],
                accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
                rules: {
                    address: [
                        {
                            validator: (rule, value, callback) => {

                                if (!value.street) {
                                    return callback(new Error("Street is required"))
                                }

                                if (!value.city){
                                    return callback(new Error('City is required'))
                                }

                                if (this.$auth.user().company.show_zip && !value.zip) {
                                    return callback(new Error("Zip code is required"))
                                }

                                if (!value.phone) {
                                    return callback(new Error("Phone is required"))
                                }



                                return callback();

                            }
                        }
                    ]
                },
                proximity: false,
                //map: false,
                //mapboxgl: false,
                is_new: true

            };
        },

        watch: {
            model: {
                handler(val, oldval) {
                    this.validate();
                },
                deep: true
            },
            accountId(val) {
                //fetch addresses
                if (!val) return;

                if (this.booking)
                    this.getAccountAddresses(val, this.booking.addressId)
                else
                    this.getAccountAddresses(val, false)
            },
            booking(val) {
                this.getAccountAddresses(val.accountId, val.addressId)
            },

        },

        computed: {
            full_address() {
                let full_address = ''
                if (this.model.address.street)
                    full_address += this.model.address.street

                if (this.model.address.city)
                    full_address += ',' + this.model.address.city

                if (this.model.address.zip)
                    full_address += ', ' + this.model.address.zip

                if (this.model.address.state)
                    full_address += ' ' + this.model.address.state

                return full_address
            }
        },


        created() {
            // We need to set mapbox-gl library here in order to use it in template
            //this.mapboxgl = Mapbox;
        },

        mounted() {
            //if the accountId is provided.
            if (this.$auth.user().company.locations.length > 0) {
                this.proximity = this.$auth.user().company.locations[0].coordinates.lng + "," + this.$auth.user().company.locations[0].coordinates.lat
                this.model.coordinates = [this.$auth.user().company.locations[0].coordinates.lng, this.$auth.user().company.locations[0].coordinates.lat]
                this.addressMap = true
            }

            //inititalize map
           /* this.mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;
            this.map = new this.mapboxgl.Map({
                container: 'address-map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: this.model.coordinates,
                zoom: 14
            });

            this.marker = new this.mapboxgl.Marker({
                draggable: true
            })
                .setLngLat(this.model.coordinates)
                .addTo(this.map);


            this.marker.on('dragend', this.onDragEnd);*/


            if (this.accountId) {
                this.getAccountAddresses(this.accountId, this.booking.addressId || false)
            }

        },

        beforeDestroy() {
           /* if (this.map)
                this.map.remove()*/
        },

        methods: {

            addNewAddress() {
                this.is_new = true
                this.addressId = ""
                //this.marker.setDraggable(true);
                this.reset()
                this.validate()
            },

            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        //this.model.coordinates = coordinates;
                        //this.model.address.coordinates = {lat: this.model.coordinates[1], lng: this.model.coordinates[0]};
                        this.model.address.full_address = this.model.address.street + " " + this.model.address.city + " " + this.model.address.state + " " + this.model.address.zip;

                        this.$emit("on-validate", valid, this.model);
                        resolve(valid);
                    });
                });
            },

            onDragEnd() {

                let coordinates = this.marker.getLngLat().toArray();

                this.$refs.locationfrm.updateCoordinates({lat: coordinates[1], lng: coordinates[0]});

                /* this.axios
                     .get("https://api.mapbox.com/geocoding/v5/mapbox.places/" + coordinates[0] + "," + coordinates[1] + ".json?types=poi&access_token=" + this.getMapBoxAccessToken())
                     .then(res => {
                         if (res.data.features && res.data.features.length > 0) {
                             //this.model.address.full_address = res.data.features[0].place_name;
                             //this.$refs.locationfrm.update(res.data.features[0].place_name);
                         }
                     })
                     .catch()
                     .then(() => {
                         this.loading = false;
                     });
 */
                this.model.coordinates = coordinates;
                this.model.address.coordinates = {lat: this.model.coordinates[1], lng: this.model.coordinates[0]};
                this.model.address.full_address = this.model.address.street + " " + this.model.address.city + " " + this.model.address.state + " " + this.model.address.zip;


            },

            onAddressMapOpen() {

            },
            confirmAddressMap() {

            },

            getAccountAddresses(val, addressId) {
                (async () => {
                    try {
                        this.loading = true;

                        let response = await this.axios.get("/companies/current/addresses", {params: {filter: {where: {accountId: val}}}})
                        this.account_addresses = response.data

                        if (!addressId) {
                            if (this.account_addresses.length > 0) {
                                this.model.address = this.account_addresses[0];
                                this.addressId = this.model.address.id;
                                //this.model.coordinates = [this.model.address.coordinates.lng, this.model.address.coordinates.lat];
                                this.model.address.full_address = this.model.address.street + " " + this.model.address.city + " " + this.model.address.state + " " + this.model.address.zip;
                                this.is_new = false

                                if (!this.model.address.phone && this.phone){
                                    //TODO: make sure the address is updated with phone number at the backend too or save on the booking but not priority
                                    this.model.address.phone = this.phone
                                }

                                // this.marker.setDraggable(false);
                                // // update the marker
                                // this.marker.setLngLat(this.model.coordinates)
                                // this.map.flyTo({
                                //     center: this.model.coordinates,
                                //     zoom: 14,
                                //     speed: 1
                                // })
                            } else {
                                this.addNewAddress();
                            }
                        } else {
                            this.is_new = false
                            //this.marker.setDraggable(false);

                            this.chooseAddress(addressId)
                        }
                        this.loading = false
                    } catch (err) {
                        this.loading = false
                    }
                })()
            },

            getAddressData(addressData, placeResultData, id) {
                this.model.address = this.$format_address_components(addressData);
                ///this.model.coordinates = [placeResultData.geometry.location.lng(), placeResultData.geometry.location.lat()]
                //this.model.address.coordinates = {lat: this.model.coordinates[1], lng: this.model.coordinates[0]};
                this.model.address.full_address = this.model.address.street + " " + this.model.address.city + " " + this.model.address.state + " " + this.model.address.zip;

               /* this.marker.setLngLat(this.model.coordinates)
                this.map.flyTo({
                    center: this.model.coordinates,
                    zoom: 14,
                    speed: 1
                })*/
            },

            getMapBoxAccessToken() {
                return process.env.VUE_APP_MAPBOX_TOKEN;
            },

            reset() {
                this.$set(this.model, 'address', {
                        street: "",
                        city: "",
                        state: "",
                        zip: "",
                        full_address: ""
                    }
                )

                this.$set(this.model, 'coordinates', [this.$auth.user().company.locations[0].coordinates.lng, this.$auth.user().company.locations[0].coordinates.lat])

                this.addressId = ""
            },

            chooseAddress(addressId) {
                let selected_address = this.account_addresses.find(address => {
                    return address.id == addressId;
                });

                if (selected_address) {
                    this.addressId = selected_address.id
                    this.model.address = selected_address;
                    //this.model.coordinates = [selected_address.coordinates.lng, selected_address.coordinates.lat];
                    //this.model.address.coordinates = {lat: this.model.coordinates[1], lng: this.model.coordinates[0]};
                    this.model.address.full_address = this.model.address.street + " " + this.model.address.city + " " + this.model.address.state + " " + this.model.address.zip;
                    this.is_new = false

                    if (!this.model.address.phone && this.phone){
                        //TODO: make sure the address is updated with phone number at the backend too or save on the booking but not priority
                        this.model.address.phone = this.phone
                    }
                    /*this.marker.setDraggable(false);

                    // update the marker
                    this.marker.setLngLat(this.model.coordinates)
                    this.map.flyTo({
                        center: this.model.coordinates,
                        zoom: 14,
                        speed: 1
                    })*/
                }
            },


            onMapLoaded(event) {
                // in component
                this.map = event.map;

                this.map.flyTo({
                    center: this.model.coordinates,
                    zoom: 14,
                    speed: 1
                })

            }
        }
    };
</script>
