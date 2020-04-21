<template>
  <el-card :body-style="{padding: '20px'}" class="app-section quotes">
    <el-page-header @back="$router.back()" content="Quote Enquiries"></el-page-header>
    <el-divider></el-divider>
    <el-row>
      <el-col class="flex-row">
        <div class="filter">
          <el-date-picker @change="getQuotes"
                          end-placeholder="End date"
                          range-separator="to"
                          size="small"
                          start-placeholder="Start date"
                          type="daterange" v-model="range" value-format="yyyy-MM-dd"/>
        </div>

        <el-button @click="showModal=true" icon="el-icon-s-tools" plain round size="small" type="primary">Expiration Policy</el-button>
      </el-col>
    </el-row>

    <el-divider>Active Quote Enquiries</el-divider>

    <el-table :data="quotes" v-loading="loading">
      <el-table-column label="Name">
        <template slot-scope="scope">
          {{scope.row.first_name}} {{scope.row.last_name}}
        </template>
      </el-table-column>
      <el-table-column label="Email" prop="email"></el-table-column>
      <el-table-column label="Phone" prop="phone"></el-table-column>
      <el-table-column label="Referral Source" prop="referral_source"></el-table-column>
      <el-table-column label="Expires in">
        <template slot-scope="scope">
          <span v-if="scope.row.expires_on">
            {{$moment(scope.row.expires_on).fromNow()}}
          </span>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <el-link @click="deleteQuote(scope.row.id)" size="small" type="danger">Delete</el-link>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="showModal" append-to-body modal title="What are Quotes?" width="400px">
      <div class="modal-body">

        <p>

          Quotes let you give customers a price quote for a booking
        </p>

        <el-divider>Expiration Policy</el-divider>
        <p>
          You can set your quotes to expire after a certain amount of time.
        </p>
        <el-card>
          <el-form :model="quote" :rules="rules" label-position="top">
            <el-row>
              <el-col>
                <el-form-item label="Quotes expire after" prop="expiration_period" style="margin-bottom:0px;">
                  <el-input size="small" type="number" v-model="quote.expiration_period"></el-input>
                </el-form-item>
              </el-col>
              <el-col>
                <el-form-item>
                  <el-radio-group v-model="quote.expiration_length_type">
                    <el-radio label="days"></el-radio>
                    <el-radio label="hours"></el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>


          </el-form>
        </el-card>

      </div>
      <div slot="footer">
        <el-button @click="showModal = false" round size="small">Cancel</el-button>
        <el-button :loading="loading" @click="saveSetting" round size="small" type="primary">Update Settings</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
    export default {
        data() {
            return {
                quotes: [],
                loading: true,
                range: [],
                showModal: false,
                quote: {
                    expiration_period: 30,
                    expiration_length_type: 'days'
                },
                rules: {
                    expiration_period: [{message: 'Expiration period required', required: true}],
                }

            }
        },
        mounted() {
            this.range = [this.$moment().subtract(2, 'weeks').toISOString(), this.$moment().toISOString()]
            if (this.$auth.user().company.settings.quote)
                this.quote = this.$auth.user().company.settings.quote
            this.getQuotes()
        },
        methods: {
            getQuotes() {
                this.loading = true
                this.axios.get('/companies/current/quotes',
                    {
                        params: {
                            filter: {
                                where: {
                                    created_at: {gte: this.range[0], lte: this.range[1]},
                                }
                            }
                        }
                    })
                    .then(res => {
                        this.quotes = res.data
                    })
                    .catch(err => {

                    })
                    .then(() => {
                        this.loading = false
                    })
            },
            deleteQuote(id) {
                this.$confirm("Are you sure you want to delete this quote?")
                    .then(res => {
                        this.axios.delete('/quotes/' + id)
                            .then(res => {
                                this.$helpers.successHandle('Successfully deleted')
                            })
                    })

            },
            saveSetting() {
                this.loading = true
                this.axios.put('/companies/current/settings', {quote: this.quote})
                    .then(res => {
                        this.$helpers.successHandle('Settings saved', this)
                        this.showModal = false
                    })
                    .catch((err) => {
                        this.$helpers.errorHandle(err, this)

                    })
                    .then(() => {
                        this.loading = false
                    })
            }
        }
    }
</script>

<style lang="scss">
  .app-section.quotes {
    .people-divider {
      margin: 5px 0;
    }

    .people-page-header {

      .el-card__body {
        padding: 0px;
      }

      .el-radio-group {
        &.options {
          .el-radio-button {
            .el-radio-button__inner {
              border: none;
              font-size: 12px;
              padding: 20px 30px;
              text-transform: uppercase;
              border-radius: 0px;
              border-bottom: 2px solid white;
            }

            &.is-active {
              .el-radio-button__inner {
                background: white;
                color: $launch-primary-color;
                box-shadow: none;
                border-bottom: 2px solid $launch-primary-color;
              }
            }
          }
        }
      }
    }
  }

</style>
