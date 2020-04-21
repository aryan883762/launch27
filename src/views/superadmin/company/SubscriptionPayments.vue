<template>
    <el-card shadow="never" v-loading="loading" :body-style="{minHeight: '300px'}"
             class="company-view-card-main">
        <template>
            <div class="flex-row">

                <div class="pull-left">

                </div>

                <div class="pull-right">
                    <el-button type="warning" round size="mini" @click="changeSubscription()" style="margin-right: 20px;">Change subscription</el-button>
<!--
                    <el-button v-if="" type="danger" round size="mini" @click="cancelSubscription()" style="margin-right: 20px;">Cancel subscription</el-button>
-->

                    <el-select style="min-width: 250px;" class="filter small" v-model="filter_refunded" @change="getCompanySubscriptionPayments">
                        <el-option :value="false" label="Payments not refunded"></el-option>
                        <el-option :value="true" label="Payments refunded"></el-option>
                    </el-select>
                </div>
            </div>

            <el-divider></el-divider>
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
                <el-table-column label="Refunded">
                    <template slot-scope="scope">
                        {{scope.row.refunded? 'Yes' : "No"}}
                    </template>
                </el-table-column>
                <el-table-column label="Options">
                    <template slot-scope="scope">
                        <el-button v-if="!scope.row.refunded" type="danger" size="mini" @click="refund(scope.row)">Refund</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </el-card>
</template>

<script>
    import AccountPlan from "@/views/components/AccountPlan.vue";
    import currencyData from 'currency-data';

    export default {
        components: {},
        data: () => {
            return {
                loading: true,
                company: {},
                payments: [],
                filter_refunded: false
            };
        },
        computed: {
            companyCurrency() {
                if (this.company && this.company.currency) {
                    return this.company.currency.symbol
                } else if (this.company && this.company.country) {
                    let primaryCurrencyISOCode = this.company.country.currency.split(',')[0];
                    return currencyData.getCurrencyByCurrencyISOCode(primaryCurrencyISOCode).symbol;
                } else {
                    return '';
                }
            }
        },
        mounted() {
            this.getCompanySubscriptionPayments();
        },
        methods: {

            getCompanySubscriptionPayments() {
                this.loading = true
                this.axios.get('/companies/' + this.$route.params.id + '/subscription_payments', {
                    params: {
                        filter: {
                            where: {
                                refunded: this.filter_refunded
                            }
                        }
                    }
                })
                    .then(res => {
                        this.payments = res.data
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            refund(payment) {
                this.$confirm("Are you sure you want to refund this payment?")
                    .then(() => {
                        this.axios.post('/subscriptions/refund', {
                            paymentId: payment.id
                        })
                            .then(res => {

                            })
                            .catch(err => {

                            })
                            .finally(() => {
                                this.loading = false
                            })
                    })
                    .catch(() => {
                    })
            },
            changeSubscription() {
                this.$router.push({
                    name: "superadmin_companies_subscriptions_change",
                    params: {
                        id: this.$route.params.id
                    }
                })
            },
            cancelSubscription() {
                this.$confirm("Are you sure you want to cancel this companies subscription?")
                    .then(res => {
                        this.loading = true
                        this.axios.patch('/companies/' + this.$route.params.id,
                            {
                                status: 'cancelled'
                            })
                            .then(res => {
                                window.location.reload()
                                this.$message.success("Subscription cancelled")
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err)
                            })
                            .finally(() => {
                                this.loading = false
                            })
                    })
            }
        }
    };
</script>

<style lang="scss">
    .subscription-card {
        margin-bottom: 20px;
    }
</style>
