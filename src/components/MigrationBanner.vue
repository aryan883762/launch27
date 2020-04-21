<template>
    <el-card v-if="show_banner" :body-style="{ padding: '5px' }" style="background: #FFE0B2">
        <div class="flex-row" style="align-items:center;padding: 0px 10px;">
            <div>
                <p style="color:black;margin:5px;">This is a snapshot of your data in <strong>READ ONLY MODE</strong>. Any changes you make here will not affect your Version 1 account nor will it charge or message your customers or teams. We are planning full migration to our live server in the next week. Please keep an eye out on your email inbox for more details </p>
            </div>
        </div>
    </el-card>
</template>


<script>
    export default {
        name: 'migration-banner',

        data() {
            return {
                show_banner: false,
                days_left: 0
            }
        },
        mounted() {
            if (this.$auth.user().company && (this.$auth.user().company.subscription.plan_id === 'migrate')) {
                //show choose aplan dialong
                this.show_banner = false
            }
        },
        methods: {}
    }
</script>