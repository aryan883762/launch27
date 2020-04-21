<template>
    <div>
        <el-button :disabled="!day.opened" @click="addNewSlot(day)" class="pull-right" round size="mini" type="primary" v-if="!addtime">Add Time</el-button>

        <el-table
                :data="day_spots"
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
                        <i class="action-btn el-icon-delete" @click="deleteSpot(day, scope.rowIndex)"></i>
                    </div>
                    <div v-if="scope.row.edit">
                        <el-button size="mini" @click="addSlot(day, scope.row)">Save</el-button>
                        <el-button size="mini" @click="cancelSlot(day, scope.rowIndex)">Cancel</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

    </div>

</template>


<script>
    export default {
        name: 'manage-day-slots',
        props: {
            selectedLocation: {},
            selectedDay: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                day_spots: [],
                day: {}
            }
        },
        mounted() {
            this.day = this.selectedDay
            this.day_spots = this.day.spots
        },
        methods: {
            addNewSlot(day) {
                this.day_spots.unshift({
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
            },
            addSlot(day, slot) {

                if (slot.flexible) {
                    if (!slot.arrival_window) {
                        this.$helpers.successHandle('Invalid Arrival Window')
                        return;
                    }
                }

                let exists = this.day_spots.find(spot => {
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
                let sorted = this.day_spots.sort((a, b) => {
                    if (this.$moment(a.time, "hh:mm").unix() < this.$moment(b.time, "hh:mm").unix()) return -1;
                });


                //triger a save of slot

                this.$emit('save-location')

            },

            deleteSpot(day, index) {
                this.day.splice(index, 1)
            },

            cancelSlot(day, index) {
                day.splice(index, 1)
            },

        }
    }
</script>