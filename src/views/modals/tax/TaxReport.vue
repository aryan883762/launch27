<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" append-to-body :modal="true" :visible.sync="showModal" @close="$router.back()" custom-class="fullscreen-modal-display" title="Tax Report">
            <div class="modal-body taxes">
                <el-card>
                    <div class="main-filters">
                        <el-row>
                            <el-col :md="6" :sm="6" :xs="24">
                                <el-date-picker @change="getTaxRecords"
                                                end-placeholder="End date"
                                                range-separator="to"
                                                size="small"
                                                start-placeholder="Start date"
                                                type="daterange" v-model="range" value-format="yyyy-MM-dd"/>
                            </el-col>
                        </el-row>
                    </div>
                </el-card>
                <el-table :data="taxes" v-loading="loading">
                    <el-table-column label="Date">
                        <template slot-scope="scope">
                            {{$moment(scope.row.created_at).format($date_format + ' ' + $time_format)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="Customer">
                        <template slot-scope="scope" v-if="scope.row.booking && scope.row.booking.account">
                            <div>
                                <account-avatar body-class="pull-left" :account="scope.row.booking.account"></account-avatar>
                                <div style="margin-left: 10px; display:inline-block">
                                    <el-link @click="selectRow(scope.row.booking.id, scope.row.booking.service_date)">{{scope.row.booking.account.fullname}}</el-link>
                                    <small style="display:block;">{{scope.row.booking.address.full_address}}</small>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="Service" prop="service"></el-table-column>
                    <el-table-column label="Rate (%)" prop="value"></el-table-column>
                    <el-table-column label="Amount">
                        <template slot-scope="scope">
                            {{$currency}}{{scope.row.amount}}
                        </template>
                    </el-table-column>
                </el-table>
                <el-row>
                    <el-col class="pagination-footer">
                        <div class="cct">
                            <el-pagination
                                    :current-page.sync="current_page"
                                    :page-size="page_size"
                                    :total="total_records"
                                    @current-change="getTaxRecords"
                                    background
                                    layout="total, prev, pager, next"
                            />
                        </div>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import AccountAvatar from "../../../components/AccountAvatar";

    export default {
        components: {AccountAvatar},
        data() {
            return {
                showModal: false,
                loading: false,
                total_records: 0,
                page_size: 0,
                current_page: 1,
                taxes: [],
                range: []
            }
        },
        mounted() {
            this.showModal = true
            this.range = [this.$moment().startOf('day').subtract(2, 'weeks').toISOString(), this.$moment().startOf('day').toISOString()]
            this.getTaxRecords()
        },
        methods: {
            getTaxRecords() {
                this.loading = true
                this.axios.get('/taxes/' + this.$route.params.id + '/booking_taxes',
                    {
                        params: {
                            page: this.current_page,
                            filter: {
                                where: {
                                    created_at: {gte: this.range[0], lte: this.range[1]},
                                },
                                include: [
                                    {
                                        relation: "booking",
                                        scope: {
                                            fields: ["accountId", "addressId", "service_date"],
                                            include: [
                                                {
                                                    relation: "account",
                                                    scope: {
                                                        fields: ['id', 'first_name', 'last_name', 'fullname', 'avatar']
                                                    }
                                                },
                                                {
                                                    relation: "address",
                                                    scope: {

                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }

                        }
                    })
                    .then(res => {
                        this.taxes = res.data.data
                        this.total_records = res.data.meta.totalItemCount
                        this.page_size = res.data.meta.itemsPerPage
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .then(() => this.loading = false)
            },
            selectRow(bookingId, service_date) {
                this.$router.push({
                    name: 'dashboard_booking_view',
                    params: {id: bookingId, service_date: service_date}
                })

            },
        }
    }
</script>
