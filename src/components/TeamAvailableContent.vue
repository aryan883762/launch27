<template>
    <div class="team-available-content">
        <el-row>
            <el-col>
                <label>
                    Dates:
                </label>
                <div v-for="t in team.data">
                    <strong>{{$moment(t.date).format($date_format)}}</strong>
                    <small v-if="!t.available">Reason:</small>
                    <i>{{t.reason}}</i>
                    <small v-if="t.availableTime.length > 0">Available Times:</small>
                    <i v-for="at in t.availableTime" >{{$moment(at.start).format($time_format)}} -
                        {{$moment(at.end).format($time_format)}}</i>
                    <small v-if="t.unavailableTime.length > 0">Unavailable Times:</small>
                    <i v-for="at in t.unavailableTime" >{{$moment(at.start).format($time_format)}} -
                        {{$moment(at.end).format($time_format)}}</i>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        props: {
            team: {
                type: Object
            }
        },
        data() {
            return {}
        },
        mounted(){
           // console.log(this.team)
        }
    }
</script>

<style lang="scss">
    .team-available-content {
        label, small, i {
            display: block;
            line-height: 1.3
        }
    }
</style>