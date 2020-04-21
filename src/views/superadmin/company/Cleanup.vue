<template>
    <div>
        <el-card>
            <el-button type="primary" round size="small" @click="disableDuplicates">Disable Duplicates ({{bookingIds.length}})</el-button>
            <el-button type="primary" round size="small" @click="fixFrequencies">Clean Frequencies ({{bookingIds.length}})</el-button>
        </el-card>
        <el-table
                row-key="id"
                :data="duplicates" v-loading="loading"
                @selection-change="handleSelectionChange">
            <el-table-column
                    type="selection"
                    width="55">
            </el-table-column>
            <el-table-column label="Parent">
                <template slot-scope="scope">
                    <el-popover
                            ref="popover1"
                            placement="bottom-end"
                            width="1200"
                            @show="show_parent = scope.row.parentId"
                            @hide="show_parent = false"
                            trigger="hover">
                        <div v-if="show_parent === scope.row.parentId">
                            <parent-booking :parent="scope.row.parentId"></parent-booking>
                        </div>
                        <label slot="reference">Parent</label>
                    </el-popover>

                </template>
            </el-table-column>
            <el-table-column label="Account">
                <template slot-scope="scope">
                    {{scope.row.account.fullname}}
                    <p><strong>{{scope.row.account.active ? 'Yes' : 'No'}}</strong></p>
                </template>
            </el-table-column>
            <el-table-column label="Service Date">
                <template slot-scope="scope">
                    {{$moment(scope.row.service_date).format('Do-MMM-YY HH:mm')}}
                    <div><strong>{{scope.row.status}}</strong></div>
                </template>
            </el-table-column>
            <el-table-column label="Frequency">
                <template slot-scope="scope">
                    {{scope.row.frequency.name}}
                </template>
            </el-table-column>
            <el-table-column label="Address">
                <template slot-scope="scope">
                    {{scope.row.address.full_address}}
                </template>
            </el-table-column>
            <el-table-column label="Total">
                <template slot-scope="scope">
                    {{scope.row.charge.total_after_tax}}
                </template>
            </el-table-column>
            <el-table-column label="Total Paid">
                <template slot-scope="scope">
                    {{scope.row.charge.total_payments}}
                </template>
            </el-table-column>
            <el-table-column label="Payments">
                <template slot-scope="scope">
                    {{scope.row.charge.payments.length}}
                </template>
            </el-table-column>
            <el-table-column label="Booking Created">
                <template slot-scope="scope">
                    {{$moment(scope.row.created_at).format('Do-MMM HH:mm')}}
                </template>
            </el-table-column>
            <el-table-column label="Booking Update">
                <template slot-scope="scope">
                    {{$moment(scope.row.updated_at).format('Do-MMM HH:mm')}}
                </template>
            </el-table-column>
            <el-table-column label="Charge Created">
                <template slot-scope="scope">
                    {{$moment(scope.row.charge.created_at).format('Do-MMM HH:mm')}}
                </template>
            </el-table-column>
            <el-table-column label="Charge Update">
                <template slot-scope="scope">
                    {{$moment(scope.row.charge.updated_at).format('Do-MMM HH:mm')}}
                </template>
            </el-table-column>
            <el-table-column label="Team Assignment Date">
                <template slot-scope="scope">
                    <label v-for="assignment in scope.row.team_assignments">{{assignment.team.name || assignment.team.fullname}} - {{$moment(assignment.updated_at).format('Do-MMM HH:mm')}}</label>
                </template>
            </el-table-column>
            <el-table-column>
                <template slot-scope="scope">
                    <el-link type="danger" @click="hideRecord(scope.row)">Hide</el-link>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import ParentBooking from "./SubTable";

    export default {
        components: {ParentBooking},
        data() {
            return {
                duplicates: [],
                loading: true,
                bookingIds: [],
                show_parent: false
            }
        },
        mounted() {
            this.axios.get('/bookings/' + this.$route.params.id + '/duplicates')
                .then(res => {
                    this.duplicates = res.data
                })
                .catch(err => {
                })
                .finally(() => {
                    this.loading = false
                })
        },
        methods: {
            hideRecord(record) {
                this.loading = true
                this.axios.post('/bookings/' + this.$route.params.id + '/duplicates/delete',
                    {
                        bookingIds: [record.id]
                    })
                    .then((res) => {
                        console.log(res.data)
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            handleSelectionChange(val) {
                this.bookingIds = val;
            },
            disableDuplicates() {
                this.loading = true
                this.axios.post('/bookings/' + this.$route.params.id + '/duplicates/delete',
                    {
                        bookingIds: this.bookingIds.map(c => c.id)
                    })
                    .then((res) => {
                        this.bookingIds = []
                        this.axios.get('/bookings/' + this.$route.params.id + '/duplicates')
                            .then(res => {
                                this.duplicates = res.data
                            })
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            fixFrequencies() {
                this.loading = true
                this.axios.post('/bookings/' + this.$route.params.id + '/fix-frequencies',
                    {
                        bookingIds: this.bookingIds.map(c => c.id)
                    })
                    .then((res) => {
                        this.bookingIds = []
                        this.axios.get('/bookings/' + this.$route.params.id + '/duplicates')
                            .then(res => {
                                this.$message.success('Completed frequency update')
                                this.duplicates = res.data
                            })
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        }
    }
</script>