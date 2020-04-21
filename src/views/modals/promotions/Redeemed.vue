<template>
  <el-card class="dc-redeemed">
    <el-row :gutter="20" class="padding-2x">
      <el-col>
        <el-page-header @back="$router.back()" content="Bookings on thsi"/>
        <el-divider></el-divider>
      </el-col>

      <el-table :data="redeemed.charges"

                v-if="redeemed && redeemed.charges">
        <el-table-column label="Customer Name">
          <template slot-scope="scope">
            <account-avatar v-if="scope.row.account" :account="scope.row.account"></account-avatar>
            <div v-if="scope.row.account">
              <el-link @click="viewAccount(scope.row.accountId)">{{scope.row.account.fullname}}</el-link>
              <small style="display:block;font-size: 12px;">(<i class="el-icon-phone"></i>){{scope.row.account.phone}}</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Discount Redeemed">
          <template slot-scope="scope">
            <strong>{{$currency}} {{scope.row.discount_code_total || 0}}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Total Before Tax">
          <template slot-scope="scope">
            {{$currency}} {{scope.row.total_before_tax || 0}}
          </template>
        </el-table-column>
        <el-table-column label="Total After Tax">
          <template slot-scope="scope">
            {{$currency}} {{scope.row.total_after_tax || 0}}
          </template>
        </el-table-column>
      </el-table>

    </el-row>
    <el-row :gutter="0" class="stats-row">
      <div class="first">
        <span class="stats-number _first">{{$currency}} {{ totalSpent }}</span>
        <label>Total Spent</label>
      </div>
      <div class="second">
        <span class="stats-number _second">{{$currency}} {{ totalRedeemed }}</span>
        <label>Total Claimed</label>
      </div>

    </el-row>
  </el-card>

</template>


<script>
    import AccountAvatar from "../../../components/AccountAvatar";

    //TODO: add pagination to this page.

    export default {
        components: {AccountAvatar},
        data() {
            return {
                redeemed: false
            }
        },

        computed: {
            totalSpent() {
                let total = 0
                if (this.redeemed && this.redeemed.charges)
                    this.redeemed.charges.forEach((charge) => {
                        total += charge.total_before_tax
                    })
                return Number(total.toFixed(2));
            },
            totalRedeemed() {
                let total = 0
                if (this.redeemed && this.redeemed.charges)
                    this.redeemed.charges.forEach((charge) => {
                        if (charge.discount_code_total)
                            total += charge.discount_code_total
                    })
                return Number(total.toFixed(2));
            }
        },

        mounted() {
            this.loadRedeemed()
        },

        methods: {
            loadRedeemed() {
                this.axios.get('/companies/current/discount_codes/',
                    {
                        params: {
                            filter: {
                                where: {id: this.$route.params.id},
                                include: [
                                    {
                                        relation: 'charges',
                                        scope: {
                                            fields: ["accountId", "total_after_tax", "discount_code_total", "total_before_tax"],
                                            include: [
                                                {
                                                    relation: "account",
                                                    scope: {
                                                        fields: ["phone", "first_name", "last_name", "id", "fullname"]
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
                        if (res.data.length > 0)
                            this.redeemed = res.data[0]
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
            },
            viewAccount(accountId) {
                this.$router.push({name: "accounts_appointments_id", id: accountId})
            }
        }
    }
</script>

<style lang="scss">
  .dc-redeemed {

  }
</style>
