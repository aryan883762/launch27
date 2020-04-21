<template>
  <div>
    <el-table :data="taxes" v-loading="loading">

      <el-table-column label="Tax" prop="name"></el-table-column>
      <el-table-column label="Service" prop="service"></el-table-column>
      <el-table-column label="Special Rate">
        <template slot-scope="scope">
          {{scope.row.special_tax ? 'Yes' : 'No'}}
        </template>
      </el-table-column>
      <el-table-column label="Rate (%)" prop="value"></el-table-column>
      <el-table-column label="Amount">
        <template slot-scope="scope">
          {{$currency}}{{scope.row.amount.toFixed(2)}}
        </template>
      </el-table-column>
     <!-- <el-table-column label="Amount">
        <template slot-scope="scope" v-if="scope.row.account">
          <div>
            <account-avatar :account="scope.row.account"></account-avatar>
            <el-link>{{scope.row.account.fullname}}</el-link>
          </div>
        </template>
      </el-table-column>-->
    </el-table>
  </div>
</template>


<script>
    import AccountAvatar from "./AccountAvatar";

    export default {
        components: {AccountAvatar},
        props: {
            bookingId: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                loading: false,
                taxes: []
            }
        },
        mounted() {

            //load booking taxes
            this.getTaxes()

        },
        methods: {
            getTaxes() {
                this.loading = true
                this.axios.get('/bookings/' + this.bookingId + '/taxes',
                    {
                        params: {
                            filter: {
                                include: [
                                    {
                                        relation: "account",
                                        scope: {
                                            fields: ["id", "first_name", "last_name", "fullname"]
                                        }
                                    }
                                ]
                            }
                        }
                    })
                    .then(res => {
                        this.taxes = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        }
    }
</script>
