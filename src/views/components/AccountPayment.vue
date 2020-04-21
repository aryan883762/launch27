<template>
    <div style="background:white; padding: 20px;">
        <el-row class="container account-plans" :gutter="40">
            <el-col>
                <el-table :data="payments" v-loading="loading" style="width: 100%">
                    <el-table-column label="Date of Payment">
                        <template slot-scope="scope">
                            {{ $moment(scope.row.created_at).format($date_format) }} - {{ $moment(scope.row.created_at).format($time_format) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="Amount Paid">
                        <template slot-scope="scope">
                            ${{ scope.row.amount }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="transactionId" label="Transaction Id"></el-table-column>
                    <el-table-column prop="description" label="Description"></el-table-column>
                    <el-table-column prop="recurring" label="Recurring"></el-table-column>
                    <el-table-column prop="subscriptionId" label="SubID"></el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        data: () => {
            return {
                loading: true,
                payments: [],
                subscription: false
            };
        },

        mounted() {
            //get the payments of the subscription
            this.loading = true;

            this.axios
                .get("/companies/current/subscription_payments")
                .then(res => {
                     this.payments = res.data;
                })
                .catch(err => {
                    this.$helpers.errorHandle(err, this)
                })
                .finally(() => {
                    this.loading = false
                })
        },

        methods: {}
    };
</script>
