<template>
    <div class="bookings-calendar">

        <el-row :gutter="20">
            <el-col :md="24" :sm="24">
                <router-view/>
            </el-col>
        </el-row>

    </div>
</template>

<script>

    import CalendarMenu from './CalendarMenu'
    import AccountAvatar from "../../../components/AccountAvatar";

    export default {
        components: {
            AccountAvatar,
            CalendarMenu
        },
        data() {
            return {}
        },

        computed: {},

        created() {

        },
        mounted() {

        },


    }
</script>

<style lang='scss'>


</style>
