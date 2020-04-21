<template>
    <div>
        <div :key="dayIndex" style="box-shadow:none;" v-for="(day, dayIndex) in available_spots">

            <el-row :gutter="10">
                <el-col :sm="4" v-for="slot in day.slots">
                    <el-card :class="{ selected: slot.datetime == model.service_date }"
                             @click.native="selectDate(slot.datetime, day.locationId)" class="time-card"
                             shadow="hover" style="margin-bottom: 5px;">
                        <i class="el-icon-alarm-clock" style="margin-right : 10px;"></i><strong>{{
                        $moment(slot.datetime).format($time_format) }}</strong>
                    </el-card>
                </el-col>
            </el-row>
            <el-tag type="danger" v-if="!day.opened">
                Closed
            </el-tag>
        </div>

    </div>
</template>


<script>
    export default {
        props: {
            date: {},
            locationId: {},
            coordinates: {},
            value: {}
        },
        data() {
            return {
                available_spots: [],
                model: {
                    calendar_date: "",
                    service_date: "",
                    locationId: "",
                    coordinates: [0, 0],
                    update_mode: 0,
                    team_assignment: []
                },
            }
        },
        mounted() {
            this.getAvailableSpots()
        },
        methods: {
            getAvailableSpots() {
                this.axios
                    .get("/booking_spots/available_spots", {
                        params: {
                            from: this.date,
                            to: this.date,
                            coordinates: this.coordinates,
                            locationId: this.locationId || false
                        }
                    })
                    .then(res => {
                        this.available_spots = res.data;
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                        this.available_spots = []
                    })
                    .finally(() => {
                    });
            },
            selectDate(datetime, locationId) {
                this.model.service_date = datetime;
                this.model.locationId = locationId
                this.$emit('input', this.model)
            },
        }
    }
</script>

<style lang="scss">
    .time-card {
        cursor: pointer;
        line-height: initial;

        &.selected {
            background: green;
            color: white;
        }

        .el-card__body {
            padding: 10px;
        }
    }
</style>