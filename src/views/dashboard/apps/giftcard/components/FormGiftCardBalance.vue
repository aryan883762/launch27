<template>
  <el-row>
    <el-form ref="form" :model="form" class="padding-2x" :rules="rules" v-loading="loading">
      <el-col>
        <el-alert type="success" :closable="false" class="text-word-break">
          You will be billed for the new amount and it will be added to the gift card.
        </el-alert>
        <el-form-item label="Balance to add" prop="amount">
          <template v-if="amountOptions">
            <el-select v-model="form.amount" placeholder="Select an amount">
              <el-option v-for="amount in giftCardType.amounts" :key="amount" :value="amount"> {{ $currency }}{{ amount }} </el-option>
            </el-select>
          </template>
          <template v-else>
            <el-input type="number" v-model.number="form.amount" min="1">
              <span slot="prepend">{{ $currency }}</span>
            </el-input>
          </template>
        </el-form-item>
        <el-form-item v-if="currentAccount">
          <account-cards :account.sync="currentAccount" v-model="form.cardId"></account-cards>
        </el-form-item>

        <el-form-item>
          <el-button size="small" type="primary" @click="addToBalance" round>
            Add to Balance
          </el-button>
        </el-form-item>
      </el-col>
    </el-form>
  </el-row>
</template>

<script>
import AccountCards from "../../../../../components/AccountCards";

export default {
  name: "form-gift-card-balance",
  props: {
    giftCardType: {
      type: Object
    },
    giftCard: {
      type: Object
    }
  },

  components: {
    AccountCards
  },

  data: () => {
    return {
      loading: false,
      amountOptions: true,
      form: {
        amount: null,
        cardId: ""
      },
      rules: {
        amount: [{ required: true, message: "Please enter a value", trigger: "blur" }]
      }
    };
  },

  created() {
    this.amountOptions = this.giftCardType.amounts && this.giftCardType.amounts.length > 0;
  },

  computed: {
    currentAccount() {
      if (this.$can("manage", "role_anonymous")) {
        return null;
      } else {
        return this.$auth.user();
      }
    }
  },

  methods: {
    addToBalance() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.loading = true;
          this.axios
            .patch("/gift_cards/topup/" + this.giftCard.id, this.form)
            .then(res => {
              this.$message.success("Added to balance");
              this.$refs["form"].resetFields();
              this.$emit("done-edit-gift-card-dialog");
            })
            .catch(err => {
              if (err.response.data) {
                this.$helpers.errorHandle(err, this);;
              }
            })
            .then(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    }
  }
};
</script>
