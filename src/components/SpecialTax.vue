<template>
  <div>
    <el-link :underline="false" @click="showModal = true" size="mini" type="danger" v-if="linkType !== 'button'">Special Sales Tax</el-link>
    <el-link @click="showModal = true" size="mini" style="margin:0px 10px; float:right;" type="warning" v-if="linkType == 'button'">Special Sales Tax</el-link>

    <el-dialog :append-to-body="true" :destroy-on-close="true" :visible.sync="showModal" @closed="closedModal" @opened="openedModal" title="Special Sales Tax" width="30%">
      <div class="modal-body" v-loading="loading">

        <p>Add a special sales tax for this customer if they are exempt from the normal sales tax</p>

        <el-form label-position="top" v-if="account.special_tax">
          <el-form-item label="Enable Special Tax">
            <el-switch v-model="account.special_tax.active"></el-switch>
          </el-form-item>

          <el-form-item label="Tax rate" >
            <el-input type="number" v-model="account.special_tax.rate" :disabled="!account.special_tax.active">
              <span slot="append">%</span>
            </el-input>
          </el-form-item>

          <el-form-item label="Description" >
            <el-input type="textarea" v-model="account.special_tax.description" :disabled="!account.special_tax.active">

            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="showModal = false" round size="small">Close</el-button>
        <el-button @click="saveAccount()" round size="small" type="primary">Save</el-button>
      </div>
    </el-dialog>
  </div>
</template>


<script>
    export default {
        props: {
            account: {
                type: Object,
                required: true
            },
            linkType: {
                type: String,
                default: () => {
                    return 'inline'
                }
            }
        },
        data() {
            return {
                loading: false,
                showModal: false
            }
        },

        mounted() {
            if (this.account.role !== 'r_customer') {
                this.$helpers.errorHandle('Special tax can only be set for customers')
                this.showModal = false
            }
        },

        methods: {
            openedModal() {
                this.loading = false


            },
            closedModal() {

            },

            saveAccount() {
                this.loading = true
                this.axios.patch('/accounts/' + this.account.id, {
                    special_tax: this.account.special_tax
                })
                    .then(
                        res => {
                            this.$message.success('Account updated')
                            this.showModal = false
                        }
                    )
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false
                    })
            }
        }
    }
</script>
