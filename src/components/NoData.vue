<template>
    <div class="empty-page-alert" v-if="show">
        <el-image :src="require('@/assets/svgs/no_data.svg')" style=""></el-image>
        <p>No records found</p>
    </div>
</template>


<script>
    export default {
        props: {
            show: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {}
        }
    }
</script>

<style lang="scss">
    .empty-page-alert {
        background: white;
        padding: 30px;


        .el-image {
            margin: 0 auto;
            display: block;
            width: 200px;
        }

        p {
            text-align: center;
        }
    }
</style>