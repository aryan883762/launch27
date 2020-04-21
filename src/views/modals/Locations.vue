<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" :visible.sync="showModal"
                   @close="settingsRedirect" appendToBody custom-class="fullscreen-modal-display" title="Set Locations">
            <div class="modal-body locations">

                <el-container>
                    <el-row :gutter="20">
                        <el-col :md="16" :sm="16" :xs="24">
                            <el-card style="margin-bottom: 5px;">

                                <div class="flex-row">
                                    <div>
                                        <el-select @change="changeLocation" class="filter" style="width:320px;"
                                                   v-model="selectedLocation" value-key="id">
                                            <el-option :key="location.id" :label="location.name"
                                                       :value="location"
                                                       v-for="location in locations" value-key="id"></el-option>
                                        </el-select>

                                        <el-select @change="getLocations()" class="filter"
                                                   style="margin-left:10px;"
                                                   v-model="active_filter">
                                            <el-option :value="true" label="Active"></el-option>
                                            <el-option :value="false" label="Archived"></el-option>
                                        </el-select>
                                    </div>

                                    <div class="pull-right">
                                        <el-button @click="addNewLocation()" icon="el-icon-plus"
                                                   plain round size="mini" type="success">Add another location
                                        </el-button>


                                        <el-button type="warning" size="mini" round style="margin-left: 10px"
                                                   @click="makeDefault()"
                                                   v-if="!selectedLocation.default && active_filter">Set as
                                            default
                                        </el-button>


                                        <el-button size="mini" round @click="showSettings()">Settings</el-button>

                                    </div>


                                </div>


                            </el-card>
                            <div class="bg-white" v-loading="loading">


                                <div class="location-map">
                                    <!--<MglMap :access-token="getMapBoxAccessToken()" :center="[selectedLocation.coordinates.lng, selectedLocation.coordinates.lat]" :map-style.sync="mapStyle" @load="onMapLoaded" :zoom="14" ref="location_map">
                                        <MglMarker :coordinates="[selectedLocation.coordinates.lng, selectedLocation.coordinates.lat]" :draggable="true" @dragend="dragMarker"></MglMarker>
                                    </MglMap>-->
                                    <div class="location-map-wrapper" id="location-map" style="height: 250px;"/>

                                </div>

                                <el-row>
                                    <el-card class="location-box" shadow="never" style="box-shadow:none;"
                                             v-if="typeof selectedLocation == 'object'">
                                        <el-row :gutter="40" class="">
                                            <el-col :sm="24">
                                                <h3>{{ selectedLocation.name }}
                                                    <el-tag type="warning" size="mini" v-if="selectedLocation.default"
                                                            effect="dark">
                                                        Default
                                                    </el-tag>
                                                </h3>
                                                <br/> <br/>
                                            </el-col>
                                        </el-row>

                                        <el-form :model="selectedLocation" :rules="rules" label-position="top"
                                                 ref="locationfrm" v-if="selectedLocation" @submit.native.prevent>
                                            <el-row :gutter="40" class="">
                                                <el-col :md="12" :sm="16">
                                                    <el-form-item label="Location name" prop="name">
                                                        <vue-google-autocomplete :country="[isocode]"
                                                                                 autocomplete="false"
                                                                                 classname="el-input__inner"
                                                                                 id="location" placeholder="Address"
                                                                                 ref="location_place"
                                                                                 v-on:placechanged="getAddressData"></vue-google-autocomplete>
                                                    </el-form-item>
                                                </el-col>

                                                <el-col :md="12" :sm="12" v-if="false">
                                                    <el-form-item>
                                                        <span slot="label">Operating Radius <strong>{{ selectedLocation.operating_radius }} miles</strong></span>
                                                        <el-slider :format-tooltip="formatTooltip"
                                                                   @change="changeRadius"
                                                                   v-model="selectedLocation.operating_radius"></el-slider>
                                                    </el-form-item>
                                                </el-col>

                                                <el-col>
                                                    <el-form-item label="Allowed Zip Codes">
                                                        <el-select multiple remote filterable
                                                                   style="width: 100%"
                                                                   popper-class="zip-select"
                                                                   reserve-keyword
                                                                   placeholder="Enter 3 characters of your zipcodes"
                                                                   v-model="selectedLocation.zipCodeIds"
                                                                   :loading="zip_loading"
                                                                   loading-text="Query zipcodes"
                                                                   :remote-method="queryZipcodes">
                                                            <el-option v-for="zip in zipcodes" :value="zip.id"
                                                                       :label="zip.state_code + ' - ' + zip.postal_code"
                                                                       :key="zip.id">
                                                                <div>
                                                                    <span style="display:block;"><strong>{{zip.postal_code}}</strong></span>
                                                                    <span style="display:block;">{{zip.place_name}}</span>
                                                                    <span style="display:block;">State : {{zip.state_code}} </span>
                                                                </div>
                                                            </el-option>
                                                        </el-select>
                                                    </el-form-item>

                                                </el-col>

                                                <el-col>
                                                    <el-tooltip
                                                            content="Enable to make active or inactive this location"
                                                            placement="right">
                                                        <el-checkbox :disabled="!selectedLocation.id"
                                                                     @change="changeStatus"
                                                                     v-model="selectedLocation.active">Use this location
                                                        </el-checkbox>
                                                    </el-tooltip>
                                                </el-col>

                                            </el-row>


                                            <el-row :gutter="40" class=" ">
                                                <el-col>
                                                    <el-divider></el-divider>
                                                </el-col>
                                                <el-col :md="24" :sm="24" :xs="24">
                                                    <el-button @click="SaveLocation" class="block-center" round
                                                               size="small" type="primary">
                                                        Save Your Locations
                                                    </el-button>
                                                </el-col>
                                            </el-row>
                                        </el-form>
                                    </el-card>
                                    <p style="text-align:center; padding: 10px;" v-else>
                                        No locations found
                                    </p>
                                </el-row>
                            </div>
                        </el-col>
                        <side-help :show_border="false" sidehelp-key="dashboard_settings_locations"></side-help>
                    </el-row>
                </el-container>
            </div>
        </el-dialog>

        <el-dialog top="0vh" title="Advance Location Settings" :visible.sync="settingsDialog" :modal="true"
                   append-to-body>
            <div class="modal-body">
                <h3>Postal/Zip Code Matching Criteria</h3>

                <el-card>
                    <el-form label-position="top">
                        <el-row :gutter="20">
                            <el-col :sm="16">
                                <el-form-item label="Match Criteria">
                                    <el-select style="width: 100%" size="mini" v-model="settings.match_criteria">
                                        <el-option value="exact"
                                                   label="Exactly match the location's postal/zip code"></el-option>
                                        <el-option value="match"
                                                   label="Match the nth character(s) of the location's postal/zip code"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :sm="8">
                                <el-form-item v-if="settings.match_criteria === 'match'"
                                              label="Number of characters to match">
                                    <el-input-number :min="0" v-model="settings.match_characters"></el-input-number>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>

                    <el-alert v-if="settings.match_criteria === 'exact'" type="warning">
                        i.e. If Location's postal code is '12345', the Customer must enter '12345' to match that
                        Location
                    </el-alert>

                    <el-alert v-if="settings.match_criteria === 'match'" type="warning">
                        For best results, make sure the postal codes in your Locations are at least
                        {{settings.match_characters}} characters long and are not added to more than one Location at a
                        time.

                    </el-alert>
                </el-card>


                <el-divider></el-divider>
                <h3>Action to take if Customers address is out of Location</h3>

                <el-card>
                    <el-form label-position="top">
                        <el-form-item>
                            <el-select v-model="settings.no_match_action">
                                <el-option value="assign_default" label="Assign to Default Location"></el-option>
                                <el-option value="prevent_booking" label="Prevent them from booking"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item v-if="settings.no_match_action === 'prevent_booking'"
                                      label="Message to show to Customer if prevented from booking">
                            <el-input type="textarea" rows="4"
                                      v-model="settings.prevent_booking_message"
                                      placeholder="Sorry we do not service your area. Please call or email us for more details"></el-input>
                        </el-form-item>
                    </el-form>
                </el-card>

            </div>
            <div slot="footer">
                <el-button size="mini" type="default" @click="settingsDialog = false" round>Cancel</el-button>
                <el-button size="mini" type="primary" @click="saveSettings()" :loading="loading" round>Save Settings</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Mapbox from "mapbox-gl";
    import {
        MglMap,
        MglMarker,
        MglAttributionControl,
        MglNavigationControl,
        MglGeojsonLayer,
        MglGeolocateControl,
        MglFullscreenControl,
        MglScaleControl
    } from "vue-mapbox";
    import VueGoogleAutocomplete from "vue-google-autocomplete";
    import SideHelp from "../components/SideHelp";
    import VueMapboxFeature from 'vue-mapbox-feature'
    import * as turf from '@turf/turf'
    import _ from "lodash";

    export default {
        components: {
            SideHelp,
            MglMap,
            MglMarker,
            MglGeojsonLayer,
            VueGoogleAutocomplete,
            VueMapboxFeature
        },
        name: "SettingsLocations",
        data() {
            return {
                showModal: false,
                locations: [],
                selectedLocation: "",
                mapStyle: "mapbox://styles/mapbox/streets-v10",
                address: "",
                autocomplete: "",
                zipcodes: [],
                loading_zipcodes: false,
                available_teams: [],
                available_services: [],
                available_frequencies: [],
                loading: true,
                circleLayer: {
                    type: "circle",
                    paint: {
                        "circle-radius": 50,
                        "circle-color": "#3BBB87",
                        "circle-opacity": 0.3
                    },
                    source: {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [-74.00236919999998, 40.7265019]
                            }
                        }
                    }
                },
                circleSource: {},
                rules: {
                    name: [{message: "Location name is required", required: true}]
                },
                isocode: this.$auth.user().company.country.isoCode,
                active_filter: true,
                circlePaint: {
                    "fill-color": "blue",
                    "fill-opacity": 0.6
                },
                map: false,
                mapboxgl: false,
                map_loaded: false,
                zip_loading: false,
                zipcodes: [],
                settingsDialog: false,
                settings: {}
            };
        },
        watch: {},
        computed: {
            pointGeom() {
                // NOTE: you can use turf.js to dynamically generate geojson as computed properties
                let point = turf.point([this.selectedLocation.coordinates.lng, this.selectedLocation.coordinates.lat]);
                return point
            },
            createPolygons() {

                if (typeof this.selectedLocation === 'string') return [];

                let center = [this.selectedLocation.coordinates.lng, this.selectedLocation.coordinates.lat]
                let radiusInKm = this.selectedLocation.operating_radius * 1.609
                let points = 64

                if (!points) points = 64;

                var coords = {
                    latitude: center[1],
                    longitude: center[0]
                };

                var km = radiusInKm;

                var ret = [];
                var distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
                var distanceY = km / 110.574;

                var theta, x, y;
                for (var i = 0; i < points; i++) {
                    theta = (i / points) * (2 * Math.PI);
                    x = distanceX * Math.cos(theta);
                    y = distanceY * Math.sin(theta);

                    ret.push([coords.longitude + x, coords.latitude + y]);
                }
                ret.push(ret[0]);

                return ret

            },
            fillLayer() {
                return turf.polygon([this.createPolygons], {name: 'location_polygon'})
            }
        },
        created() {
            this.$events.emitEvent('track-page')

            // We need to set mapbox-gl library here in order to use it in template
            this.mapboxgl = Mapbox;
        },

        mounted() {
            this.showModal = true;
            // get locations
            this.isocode = this.$auth.user().company.country.isoCode.toLowerCase()

            //load setting
            this.settings = this.$auth.user().company.settings.location

            this.getLocations();
        },
        methods: {
            initMap(coordinates) {
                this.mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;
                this.map = new this.mapboxgl.Map({
                    container: 'location-map',
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: coordinates,
                    zoom: 6
                });

                this.map.on('load', () => {
                    this.map_loaded = true
                })

                this.map.on('sourcedata', (e) => {
                    if (e.sourceId !== 'location_polygon' || !e.isSourceLoaded) return
                    var f = this.map.querySourceFeatures('location_polygon')
                    if (f.length === 0) return
                    let bbox = turf.bbox({
                        type: 'FeatureCollection',
                        features: f
                    });

                    this.$nextTick(() => {
                        this.map.fitBounds(bbox, {padding: 20});
                    })

                })

                this.marker = new this.mapboxgl.Marker({
                    draggable: false
                })
                    .setLngLat(coordinates)
                    .addTo(this.map);

            },
            onMapLoaded(event) {
                // in component
                this.map = event.map;
                this.map_loaded = true
            },
            changeLocation(val) {

                this.zipcodes = val.zipcodes


                this.marker.setLngLat([this.selectedLocation.coordinates.lng, this.selectedLocation.coordinates.lat])

                this.$nextTick(() => {
                    this.map.flyTo({
                        center: [this.selectedLocation.coordinates.lng, this.selectedLocation.coordinates.lat],
                        speed: 1
                    })

                    if (this.$refs.location_place) {
                        this.$refs.location_place.update(val.name);
                    }
                })

            },
            settingsRedirect() {
                if (this.$route.query.q === "dashboard_getting_started") {
                    return this.$router.push("/dashboard/getting-started");
                }

                this.$router.push("/dashboard/settings");
            },
            getMapBoxAccessToken() {
                return process.env.VUE_APP_MAPBOX_TOKEN;
            },
            /**
             * When the location found
             * @param {Object} addressData Data of the found location
             * @param {Object} placeResultData PlaceResult object
             * @param {String} id Input container ID
             */
            getAddressData: function (addressData, placeResultData, id) {
                this.selectedLocation.coordinates = {
                    lat: placeResultData.geometry.location.lat(),
                    lng: placeResultData.geometry.location.lng()
                };
                this.selectedLocation.name = placeResultData.formatted_address;
                this.circleLayer.source.data.geometry.coordinates = [placeResultData.geometry.location.lng(), placeResultData.geometry.location.lat()];
            },
            changeRadius(val) {

                this.map_loaded = false
                this.$nextTick(() => {
                    this.map_loaded = true
                })

            },
            metersToPixelsAtMaxZoom(meters, latitude) {
                return meters / 0.075 / Math.cos(latitude * Math.PI / 180)
            },
            lookupZipCode(query) {
                if (query !== "") {
                    this.axios
                        .get("/zipcodes/lookup", {params: {query: query}})
                        .then(res => {
                            this.zipcodes = res.data;
                        })
                        .catch(err => {
                            console.log(err);
                        })
                        .finally(() => {

                        })
                }
            },

            getLocations() {
                this.loading = true;

                this.axios
                    .get("/companies/current/locations", {
                        params: {
                            filter: {
                                include: ["zipcodes"],
                                where: {active: this.active_filter}
                            }
                        }
                    })
                    .then(res => {
                        this.locations = res.data;
                        if (res.data.length > 0) {
                            this.selectedLocation = res.data[0];
                            this.zipcodes = this.selectedLocation.zipcodes

                            if (!this.map)
                                this.initMap([this.selectedLocation.coordinates.lng, this.selectedLocation.coordinates.lat])

                            this.$nextTick(() => {
                                this.$refs.location_place.update(this.selectedLocation.name);
                            });

                        } else {
                            this.selectedLocation = ""
                        }


                    })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },

            addNewLocation() {
                this.selectedLocation = {
                    name: "",
                    coordinates: {lat: 0, lng: 0},
                    operating_radius: 10,
                    zipCodeIds: []
                };

                this.$refs.location_place.clear();
                this.$refs.location_place.focus();
            },

            formatTooltip(val) {
                return val + " miles";
            },

            dragMarker($event) {
                let coordinates = $event.marker.getLngLat().toArray();

                this.$refs.location_place.updateCoordinates({lat: coordinates[1], lng: coordinates[0]});

                this.axios
                    .get("https://api.mapbox.com/geocoding/v5/mapbox.places/" + coordinates[0] + "," + coordinates[1] + ".json?types=poi&access_token=" + this.getMapBoxAccessToken())
                    .then(res => {
                        if (res.data.features && res.data.features.length > 0) {
                            this.selectedLocation.name = res.data.features[0].place_name;
                            this.$refs.location_place.update(res.data.features[0].place_name);
                        }
                    })
                    .catch()
                    .then(() => {
                        this.loading = false;
                    });

                this.selectedLocation.coordinates = {lat: coordinates[1], lng: coordinates[0]};
            },
            SaveLocation() {
                this.$refs.locationfrm.validate(
                    (valid) => {
                        if (valid) {
                            this.loading = true;
                            if (this.selectedLocation.hasOwnProperty("id")) {
                                this.axios
                                    .put("/companies/current/locations/" + this.selectedLocation.id, this.selectedLocation)
                                    .then(res => {
                                        this.map_loaded = false
                                        this.selectedLocation = res.data;
                                        this.$message.success("Location updated");
                                        this.getLocations()
                                    })
                                    .catch(err => {
                                        this.$helpers.errorHandle(err, this)
                                    })
                                    .finally(_ => {
                                        this.loading = false;
                                    });
                            } else {
                                this.axios
                                    .post("/companies/current/locations", this.selectedLocation)
                                    .then(res => {
                                        this.map_loaded = false
                                        this.selectedLocation = res.data;
                                        this.$message.success("Location updated");
                                        this.getLocations()
                                    })
                                    .catch(err => {
                                        this.$helpers.errorHandle(err, this)
                                    })
                                    .finally(_ => {
                                        this.loading = false;
                                    });
                            }
                        }
                    })

            },
            changeStatus(val) {
                if (this.locations.length === 1 && this.active_filter === true) {
                    this.$alert('This location cannot be archived, at least one location must be active')
                    if (!val) this.selectedLocation.active = true
                    return false
                }

            },

            makeDefault() {
                this.loading = true
                this.axios.patch('/locations/' + this.selectedLocation.id + '/make-default')
                    .then(res => {
                        this.$helpers.successHandle("Location set as default")
                        this.getLocations()
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },

            queryZipcodes: _.debounce(function (query) {
                ///if sthere state
                this.zip_loading = true
                this.axios.get('/zip_codes/' + this.$auth.user().company.country.isoCode + '/lookup',
                    {
                        params: {
                            query: query
                        }
                    })
                    .then(res => {
                        this.zipcodes = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.zip_loading = false
                    })
            }, 1000),

            showSettings() {
                this.settingsDialog = true
            },
            saveSettings() {
                this.loading = true
                this.axios.patch('/company_settings/' + this.$auth.user().company.settings.id, {
                    location: this.settings
                })
                    .then(res => {
                        this.$helpers.successHandle('Setting successfully updated')
                        this.settingsDialog = false
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        }
    };
</script>
<style lang="scss">
    .modal-body.locations {
        .location-map {
            width: calc(100%);
        }

        .location-box {
            border: 1px solid #f5f5f5;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    }

    .zip-select {
        .el-select-dropdown__item {
            height: 80px;
            padding: 10px;

            span {
                line-height: 1.5
            }
        }
    }
</style>
