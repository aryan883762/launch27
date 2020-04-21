<template>
  <el-form label-position="top">
    <el-card v-loading="charge_loading">
      <h4>Charge Booking</h4>

      <strong>Billing Note</strong>
      <p>{{charge.billing_note || 'n/a'}}</p>

      <account-cards :account.sync="booking.account" :add-button="true" v-model="selected_card"></account-cards>


      <el-row>
        <el-col :md="12" :sm="12">
          <el-form-item label="Amount to Charge">
            <el-input :disabled="disabled" type="number" v-model="confirm_amount">
              <span slot="prepend">{{ $currency }}</span>
            </el-input>
          </el-form-item>
          <div class="flex-row-reverse">
            <el-button :disabled="disabled" @click="chargeCard(true)" round size="small" type="primary" >Charge</el-button>

            <el-button :disabled="disabled" @click="chargeCard(false)" round size="small" style="margin-right: 20px;" type="warning">Put on Hold</el-button>
          </div>
        </el-col>
        <el-col :md="12" :sm="12"></el-col>
      </el-row>
    </el-card>
  </el-form>
</template>

<script>
    import AccountCards from "./AccountCards";

    export default {
        props: ["charge", "booking"],
        components: {
            AccountCards
        },
        data() {
            return {
                selected_card: '',
                charge_loading: false,
                confirm_amount: '',
                disabled: false
            }
        },
        mounted() {
            if (this.booking.charge.total_payments >= this.booking.charge.total_after_tax) {
                this.$alert("This booking is already paid up.");
                this.disabled = true
            }

            this.confirm_amount = Number((this.charge.total_after_tax - this.charge.total_payments).toFixed(2));

        },
        methods: {
            getCharge() {

            },
            chargeCard(capture) {

                    if (!this.charge.card && this.selected_card.length == 0) {
                    this.$helpers.errorHandle('No card was selected for this booking, select a card to proceed')
                    return;
                }

                if (this.confirm_amount > this.charge.total_after_tax - this.charge.total_payments) {
                    this.$alert("You can't charge more than is outstanding: " + this.$currency + (this.charge.total_after_tax - this.charge.total_payments));
                    return;
                }

                this.$confirm("Are you sure you want to " + (capture ? "charge " : "put on hold ") + this.$currency + this.confirm_amount, "Charging Default Card")
                    .then(() => {
                        this.charge_loading = true;
                        this.axios
                            .post("/charges/process-card", {
                                chargeId: this.charge.id,
                                amount: parseFloat(this.confirm_amount),
                                capture: capture
                            })
                            .then(res => {
                                if (res.data.status == "succeeded") {
                                    this.$message.success("Charge successfully completed");
                                } else if (res.data.status == "requires_capture") {
                                    this.$message.success("Charge succesfully put on hold");
                                }

                                this.confirm_amount = 0;
                                this.$emit('charge-completed')
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(_ => {
                                this.charge_loading = false;
                            });
                    })
                    .catch(() => {
                    });
            },
        }
    }
</script>


<style lang="scss">

</style>
