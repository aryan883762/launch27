<template>
    <el-row class="padding-2x slots-setup bg-white">
        <el-col>
            Set your opening/operating hours.
            <div class="divider"></div>
        </el-col>

        <el-col>
            <el-form labelPosition="top">
                <el-row :gutter="40">
                    <el-col :md="8" :sm="8" :xs="24">
                        <el-form-item label="Location">
                            <el-select class="filter" style="width: 300px;" v-model="selectedLocation" value-key="id">
                                <el-option :key="location.id" :label="location.name" :value="location"
                                           v-for="location in locations"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :md="16" :sm="16" :xs="24">
                        <el-form-item label="Display Mode">
                            <el-radio-group v-model="selectedLocation.spots_mode" @change="saveLocationUpdates('Display mode has been changed and booking spots updated')">
                                <el-radio label="time"> Specific Times Only</el-radio>
                                <el-radio label="arrival"> Arrival Windows Only</el-radio>
                                <el-radio label="time_arrival"> Combination of Specific Times and Arrival Windows
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </el-col>

        <el-col style="margin-bottom: 20px">
            <el-divider> Configure Opening Days and Spots - {{ selectedLocation.name }}</el-divider>
        </el-col>

        <el-col>
            <el-collapse accordion v-loading="loading" v-model="activeDay">
                <el-collapse-item :key="index" :name="index" v-for="(day, index) in selectedLocation.booking_spots">
                    <div class="full-width" slot="title">
                        <el-row>
                            <el-col>
                                <h4 style="display:inline-block; width : 100px;">{{ day.day }}</h4>
                                <small>
                                    <el-tag>{{ $moment(day.opening_time,'HH:mm').format($time_format) }} - {{ $moment(day.closing_time,'HH:mm').format($time_format) }}</el-tag>
                                </small>

                                <el-divider direction="vertical"></el-divider>
                                <el-tag type="danger" v-if="!day.opened">Closed</el-tag>
                                <el-button class="configure-button" plain round size="mini" type="info">Configure
                                </el-button>
                            </el-col>
                        </el-row>
                    </div>
                    <el-card shadow="never" style="margin-bottom: 10px; box-shadow: none;">
                        <el-form labelPosition="top">
                            <el-row :gutter="20">
                                <el-col :sm="6">
                                    <h3>{{ day.day }}</h3>
                                </el-col>
                                <el-col :sm="4">
                                    <el-form-item label="Opens at">
                                        <time-picker v-model="day.opening_time" @change="saveLocationUpdates()"></time-picker>
                                    </el-form-item>
                                </el-col>
                                <el-col :sm="4">
                                    <el-form-item label="Closes at">
                                        <time-picker v-model="day.closing_time" @change="saveLocationUpdates()"></time-picker>
                                    </el-form-item>
                                </el-col>

                                <el-col :sm="6">
                                    <el-form-item label="Open?">
                                        <el-switch active-color="green" @change="saveLocationUpdates()" active-text="Yes" inactive-color="red"
                                                   inactive-text="No" v-model="day.opened"></el-switch>
                                    </el-form-item>
                                </el-col>

                                <el-col :sm="4">
                                    <label>Total Slots</label>
                                    <h2>{{ totalDaySlots(day) }}</h2>
                                </el-col>
                            </el-row>
                        </el-form>

                        <el-divider></el-divider>
                        <el-row>
                            <el-col style="margin-bottom:10px;">
                                <el-button :disabled="!day.opened" @click="addNewSlot(day)" class="pull-right" round size="mini" type="primary" v-if="!addtime">Add Time
                                </el-button>

                                <el-popover
                                        ref="group_override"
                                        popper-class="spots-group-apply"
                                        title="Select days to apply"
                                        trigger="click"
                                        width="200"
                                        @hide="group_apply_to = []">
                                    <div class="group-apply">
                                        <el-checkbox-group class="group-apply-days" v-model="group_apply_to">
                                            <el-checkbox :label="0">Sunday</el-checkbox>
                                            <el-checkbox :label="1">Monday</el-checkbox>
                                            <el-checkbox :label="2">Tuesday</el-checkbox>
                                            <el-checkbox :label="3">Wednesday</el-checkbox>
                                            <el-checkbox :label="4">Thursday</el-checkbox>
                                            <el-checkbox :label="5">Friday</el-checkbox>
                                            <el-checkbox :label="6">Saturday</el-checkbox>
                                        </el-checkbox-group>

                                        <el-button type="primary" size="mini" round @click="groupOverride(day)"
                                                   style="margin-top:10px;">Apply
                                        </el-button>
                                    </div>
                                    <el-button slot="reference" size="mini" class="pull-right"
                                               style="margin-right: 10px;" round type="warning">
                                        Apply to
                                    </el-button>
                                </el-popover>

                            </el-col>

                        </el-row>

                        <el-row :gutter="10">
                            <el-card>
                                <el-table
                                        :data="day.spots"
                                        stripe
                                        :row-class-name="getRowClass">
                                    <el-table-column label="Time">
                                        <template slot-scope="scope">
                                            <div v-if="!scope.row.edit">
                                                <span v-if="!scope.row.flexible">{{$moment(scope.row.time, 'H:mm').format($time_format)}}</span>
                                                <span v-if="scope.row.flexible">{{$moment(scope.row.time, 'H:mm').format($time_format)}} - {{$moment(scope.row.time, 'H:mm').add(scope.row.arrival_window,'minutes').format($time_format)}}</span>
                                            </div>
                                            <div v-if="scope.row.edit">
                                                <time-picker :step="15" v-model="scope.row.time"></time-picker>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="Jobs Max.">
                                        <template slot-scope="scope">
                                            <div v-if="!scope.row.edit">
                                                <el-tag type="info" effect="dark">{{scope.row.max}}</el-tag>
                                                <el-divider direction="vertical"></el-divider>
                                                <i class="action-btn el-icon-plus" @click="scope.row.max += 1"></i>
                                                <el-divider direction="vertical"></el-divider>
                                                <i class="action-btn el-icon-minus" @click="scope.row.max > 0 ? scope.row.max -= 1 : scope.row.max = 0"></i>
                                            </div>
                                            <div v-if="scope.row.edit">
                                                <el-input-number v-model="scope.row.max"></el-input-number>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="flexible" label="Is Arrival Window">
                                        <template slot-scope="scope">
                                            <div v-if="!scope.row.edit">
                                                <span v-if="!scope.row.flexible">No</span>
                                                <span v-if="scope.row.flexible">Yes - <strong>({{scope.row.arrival_window | duration}}) </strong></span>

                                            </div>

                                            <div v-if="scope.row.edit">
                                                <el-checkbox v-model="scope.row.flexible">Arrival Window</el-checkbox>
                                                <duration-picker v-if="scope.row.flexible" :show-label="false" v-model="scope.row.arrival_window"></duration-picker>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="Option">
                                        <template slot-scope="scope">
                                            <div v-if="!scope.row.edit">
                                                <i class="action-btn el-icon-delete" @click="deleteSpot(day, scope.$index)"></i>
                                            </div>
                                            <div v-if="scope.row.edit">
                                                <el-button size="mini" @click="addSlot(day, scope.row)">Save</el-button>
                                                <el-button size="mini" @click="cancelSlot(day, scope.$index)">Cancel</el-button>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-card>

                            <el-col>
                                <el-button @click="saveLocationUpdates()" class="block-center" round size="small"
                                           style="margin-top:10px;" type="primary">Save Changes
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-collapse-item>
            </el-collapse>
        </el-col>
    </el-row>
</template>

<script>
    import TimePicker from "../../../components/TimePicker";

    export default {
        components: {TimePicker},
        data: () => {
            return {
                addtime: false,
                loading: true,
                activeDay: "0",
                locations: [],
                selectedLocation: "",
                addtime_form: {
                    time: "",
                    flexible: "",
                    arrival_window: 0,
                    max: 1
                },
                rules: {
                    time: [{message: "Time is required", required: true, trigger: "blur"}]
                },
                group_apply_to: []
            };
        },

        watch: {
            activeDay(val) {
                this.group_apply_to = []
            }
        },

        created() {
            this.loadLocations();
            this.$events.emitEvent('track-page')
        },

        mounted() {
        },

        methods: {
            loadLocations() {
                this.loading = true;
                this.axios
                    .get("/companies/current/locations", {
                        params: {
                            filter: {
                                where: {active: true}
                            }
                        }
                    })
                    .then(res => {
                        this.locations = res.data;
                        if (this.locations.length > 0 && this.selectedLocation === "") this.selectedLocation = this.locations[0];
                    })
                    .catch()
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            totalDaySlots(day) {
                var total = 0;
                day.spots.forEach(spot => {
                    total += spot.max;
                });

                return total;
            },

            deleteSpot(day, index) {
                day.spots.splice(index, 1)
            },

            cancelSlot(day, index) {
                day.spots.splice(index, 1)
            },

            saveLocationUpdates(msg) {

                //make sure you not sending edit slots
                let dirty = false
                let dirty_day = false
                this.selectedLocation.booking_spots.forEach((day) => {
                    day.spots.forEach((spot) => {
                        if (spot.edit) {
                            dirty = true
                            dirty_day = day
                        }
                    })
                })

                if (dirty) {
                    this.$helpers.errorHandle('Slots in editting mode must be saved first, Check ' + dirty_day.day)
                    return;
                }

                this.loading = true;
                this.axios
                    .put("/companies/current/locations/" + this.selectedLocation.id, this.selectedLocation)
                    .then(res => {
                        this.selectedLocation = res.data;
                        if (msg) return this.$message.success(msg)
                        this.$message.success("Booking spots successfully updated");
                    })
                    .catch(err => {
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },

            resetForm() {
                this.addtime_form = {
                    time: "",
                    flexible: "",
                    arrival_window: 0,
                    max: 1
                };
            },


            groupOverride(overriding_day) {
                for (let x = 0; x < this.selectedLocation.booking_spots.length; x++) {
                    if (this.group_apply_to.includes(this.selectedLocation.booking_spots[x].day_id)) {
                        let day = this.selectedLocation.booking_spots[x]
                        day.opening_time = overriding_day.opening_time
                        day.closing_time = overriding_day.closing_time
                        day.spots = overriding_day.spots
                        day.opened = overriding_day.opened
                    }
                }

                //after that saayve
                this.group_apply_to = []

                this.saveLocationUpdates()
            },

            addSlot(day, slot) {

                if (slot.flexible) {
                    if (!slot.arrival_window) {
                        this.$helpers.successHandle('Invalid Arrival Window')
                        return;
                    }
                }

                let exists = day.spots.find(spot => {
                    return this.$moment(spot.time, 'H:mm').format('H:mm') === this.$moment(slot.time, 'H:mm').format('H:mm') && !spot.edit;
                });

                if (exists) {
                    this.$helpers.errorHandle("This time slot is already added");
                    return;
                }

                //safe to delete edit
                this.$delete(slot, 'edit')

                //check if time already exits

                //now sort the time ordering before sending
                let sorted = day.spots.sort((a, b) => {
                    if (this.$moment(a.time, "hh:mm").unix() < this.$moment(b.time, "hh:mm").unix()) return -1;
                });


                //triger a save of slot

                this.saveLocationUpdates()

            },
            addNewSlot(day) {
                day.spots.unshift({
                    edit: true,
                    time: "08:00",
                    flexible: false,
                    arrival_window: 0,
                    max: 1
                })
            },
            getRowClass(row_data) {
                if (row_data.row.edit) return ''

                if (this.selectedLocation.spots_mode === 'time_arrival')
                    return ''
                else if (this.selectedLocation.spots_mode === 'time') {
                    if (row_data.row.flexible)
                        return 'hide-row'
                } else if (this.selectedLocation.spots_mode === 'arrival') {
                    if (!row_data.row.flexible)
                        return 'hide-row'
                }
            }
        }
    };
</script>

<style lang="scss">
    .slots-setup {
        .el-collapse-item {
            border-top: 1px solid #f3f3f3;
            position: relative;

            .configure-button {
                position: absolute;
                right: 20px;
                top: 20px;
            }

            &.is-active {
                .el-collapse-item__content {
                    background: #f3f3f3;
                }
            }

            .action-btn {
                cursor: pointer;
                border: 1px solid #E0E0E0;
                padding: 5px;
                border-radius: 5px;
            }

            .hide-row {
                display: none;
            }
        }

        .date-time-picker {

        }

    }

    .spots-group-apply {
        .el-checkbox {
            display: block;
        }
    }
</style>
