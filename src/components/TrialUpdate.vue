<template>
    <el-card v-if="show_trial" :body-style="{ padding: '5px' }" style="background: #FFE0B2">
        <div class="flex-row" style="align-items:center;padding: 0px 10px;">
            <div>
                <p style="color:black;">You are currently in a trial mode with <strong>{{days_left}}</strong> days left </p>
            </div>
            <div>
                <el-button type="primary" size="mini" @click="$router.push({path: '/dashboard/settings/account?tab=plan'})">Upgrade Now</el-button>
            </div>
        </div>
    </el-card>
</template>


<script>
    export default {
        name: 'trial-update',

        data() {
            return {
                show_trial: false,
                days_left: 0
            }
        },
        mounted() {
            if (this.$auth.user().company && (this.$auth.user().company.subscription.plan_id === 'free')) {
                //show choose aplan dialong

                this.axios.get('/subscriptions/days_left')
                    .then(res => {
                        this.days_left = res.data
                        this.show_trial = true
                    })
                    .catch((err) => {
                    })
            }
        },
        methods: {}
    }
</script>