<template>
    <el-select v-model="time" @change="selectTime">
        <el-option :value="time.time" v-for="time in timeList" :label="time.display"></el-option>
    </el-select>
</template>

<script>
    export default {
        name: 'time-picker',
        props: {
            step: {
                type: Number,
                default: 15
            },
            value: {
                required: true
            }
        },
        data() {
            return {
                time: "",
                timeList: [],
                end: 1440
            }
        },
        created() {
            this.generateData()
            this.time = this.value
        },
        methods: {
            generateData() {
                for (let x = 0; x < 1440; x += this.step) {
                    this.timeList.push({
                        time: this.$moment.utc(this.$moment.duration(x, "minutes").asMilliseconds()).format("H:mm"),
                        display: this.$moment.utc(this.$moment.duration(x, "minutes").asMilliseconds()).format(this.$time_format),
                        minutes: x
                    })
                }
            },
            selectTime(val) {
                this.$emit('input', val)
                this.$emit('change', val)
            }
        }
    }
</script>