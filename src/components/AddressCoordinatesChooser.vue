<template>
    <div>
        <vue-google-autocomplete classname="el-input__inner" id="booking_address_auto" placeholder="Start typing" ref="coordinatefrm" v-if="false" v-on:placechanged="getAddressData"></vue-google-autocomplete>
        <label>{{addressStr}}</label>
        <p>Drag location pin to confirm address coordinates</p>
        <div class="location-map-large" style="min-height: 400px; display:block;" v-if="show">
            <MglMap :access-token="getMapBoxAccessToken()" :center="getMarkerCoordinates()" :map-style.sync="mapStyle" :zoom="15" @load="onMapLoaded" ref="map">
                <MglMarker :coordinates="getMarkerCoordinates()" :draggable="true" @dragend="dragMarker"></MglMarker>
            </MglMap>
        </div>
    </div>
</template>


<script>
    import VueGoogleAutocomplete from "vue-google-autocomplete";
    import {MglMap, MglMarker, MglAttributionControl, MglNavigationControl, MglGeolocateControl, MglFullscreenControl, MglScaleControl} from "vue-mapbox";
    import axios from 'axios'

    export default {
        props: {
            value: {
                required: true,
            },
            address: {
                required: true,
                type: Object
            },
            show: {
                type: Boolean,
                default: false
            }
        },
        components: {
            VueGoogleAutocomplete,
            MglMap,
            MglMarker,
            MglGeolocateControl,
            MglScaleControl
        },
        computed: {
            computedShowModal: {
                // getter
                get: function () {
                    return this.showModal
                },
                // setter
                set: function (newValue) {
                    return false
                }
            }
        },
        data() {
            return {
                mapStyle: "mapbox://styles/mapbox/streets-v10",
                coordinates: {lng: 0, lat: 0},
                addressStr: '',
                map: false,

            }
        },
        watch: {},
        mounted() {
            //console.log('being mouned')
        },
        beforeDestroy() {
            if (this.map) {
                this.map.remove()
                this.map = false
            }

        },
        methods: {

            getAddressData(addressData, placeResultData, id) {
                //this.coordinates = {lng: placeResultData.geometry.location.lng(), lat: placeResultData.geometry.location.lat()};
            },

            getMapBoxAccessToken() {
                return process.env.VUE_APP_MAPBOX_TOKEN;
            },

            dragMarker($event) {

                let coordinates = $event.marker.getLngLat();

                axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/' + coordinates.lng + ',' + coordinates.lat + '.json?types=poi&access_token=' + this.getMapBoxAccessToken())
                    .then(
                        res => {
                            if (res.data.features && res.data.features.length > 0) {
                                //this.booking.auto_address.place_name = res.data.features[0].place_name
                                //this.$refs.coordinatefrm.update(res.data.features[0].place_name)
                            }
                        }
                    )
                    .catch()
                    .then(
                        () => {
                            this.loading = false
                        }
                    )

                this.$emit('input', {lng: coordinates.lng, lat: coordinates.lat});

            },
            openedModal() {
                this.coordinates = this.value
                this.addressStr = this.addressToString(this.address)
            },
            getMarkerCoordinates() {
                return [this.coordinates.lng, this.coordinates.lat]
            },
            closedModal() {
                this.$emit('closed')
            },
            addressToString(o) {
                return o.street + ',' + o.city + ',' + o.state + ' ' + o.zip
            },
            async onMapLoaded(event) {
                // in component
                try {
                    this.map = event.map;

                    //add country
                    this.addressStr = this.addressStr + ' ' + this.$auth.user().company.country.isoCode

                    // Here we cathing 'load' map event
                    const asyncActions = event.component.actions


                    let res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                        params: {
                            address: this.addressStr,
                            key: process.env.VUE_APP_GOOGLE_API
                        }
                    })


                    if (res.data.results && res.data.status === 'OK') {
                        this.coordinates = {lng: res.data.results[0].geometry.location.lng, lat: res.data.results[0].geometry.location.lat}

                        await asyncActions.flyTo({
                            center: [res.data.results[0].geometry.location.lng, res.data.results[0].geometry.location.lat],
                            zoom: 9,
                            speed: 1
                        })

                        this.$emit('input', this.coordinates);

                        // this.$refs.coordinatefrm.update(this.addressStr)
                    }

                } catch (err) {

                }


            }
        }
    }
</script>
