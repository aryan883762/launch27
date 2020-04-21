<template>
  <div v-loading="loading">
    <card :class="{ complete }" :options="stripeOptions" :stripe="stripe_publishable_key" @change="complete = $event.complete" class="stripe-card" />
    <div>
      <el-button @click="setupCard" round size="mini" type="primary">Confirm Card</el-button>
    </div>
  </div>
</template>

<script>
import { Card, createPaymentMethod } from "vue-stripe-elements-plus";

export default {
  name: "stripe-anonymous-card-form",
  props: {
    onPaymentMethodReceived: Function,
    holderName: {
      type: String
    },
    holderEmail: {
      type: String
    }
  },

  components: {
    Card
  },

  data() {
    return {
      loading: false,
      complete: false,
      stripe_publishable_key: process.env.VUE_APP_STRIPE_PK,
      stripeOptions: {
        base: {
          iconColor: "#666EE8",
          color: "#31325F",
          lineHeight: "40px",
          fontWeight: 300,
          fontFamily: "Helvetica Neue",
          fontSize: "15px",

          "::placeholder": {
            color: "#CFD7E0"
          }
        }
      }
    };
  },

  methods: {
    setupCard() {
      this.loading = true;
      createPaymentMethod("card", {
        billing_details: {
          name: this.holderName,
          email: this.holderEmail
        }
      }).then(res => {
        this.loading = false;
        if (res.paymentMethod) {
          if (typeof this.onPaymentMethodReceived == "function") {
            this.onPaymentMethodReceived(res.paymentMethod);
          }
        } else if (res.error) {
          this.$helpers.errorHandle(res.error.message);
        } else {
          this.$helpers.errorHandle("Please try again later");
        }
      });
    }
  }
};
</script>
