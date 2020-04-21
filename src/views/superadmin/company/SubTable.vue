<template>
    <el-table :data="data">
        <el-table-column label="Account">
            <template slot-scope="scope">
                {{scope.row.account.fullname}}
                <div><strong>{{scope.row.account.active ? 'Yes' : 'No'}}</strong></div>
            </template>
        </el-table-column>
        <el-table-column label="Service Date">
            <template slot-scope="scope">
                {{$moment(scope.row.service_date).format('Do-MMM-YYYY HH:mm')}}
            </template>
        </el-table-column>
        <el-table-column label="Frequency">
            <template slot-scope="scope">
                {{scope.row.frequency.name}}
                <div><strong>{{scope.row.status}}</strong></div>
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
</template>

<script>
    export default {
        name: 'parent-booking',
        props: {
            parent: {
                type: String
            }
        },
        data(){
          return {
              data : []
          }
        },
        mounted(){
            this.axios.get('/bookings/' + this.parent, {
                params : {
                    filter : {
                        include: [
                            {"charge" : "payments"},
                            {"team_assignments" : "team"},
                            "address",
                            "frequency",
                            "account"
                        ]
                    }
                }
            })
            .then(res => {
                this.data = [res.data]
            })
        }
    }
</script>