<template>
  <el-card shadow="never" v-loading="loading">
    <el-row v-if="$can('manage', 'plan_gift_card')">
      <el-col v-if="setupDone">
        <form-gift-card v-if="!loading" :gift-card-type="giftCardType" :gift-card="giftCard" :multi-gift-card="true" :company.sync="company" />
      </el-col>
      <el-col v-else>
        <template v-if="$can('manage', 'role_admin')">
          <el-button type="primary" class="block-center" round size="mini" @click="$router.push({ name: 'apps_giftcard_settings' })">Gift Card Setup</el-button>
        </template>
        <template v-else>
          <h3 class="text-center">You cannot create a Gift card, Please try again later.</h3>
        </template>
      </el-col>
    </el-row>
    <el-row v-else>
      <el-col>
        <p class="text-center plan-error-message">
          Gift Cards Purchase Is Not Available
        </p>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import FormGiftCard from "./components/FormGiftCard.vue";

export default {
  components: { FormGiftCard },

  data: () => {
    return {
      loading: true,
      setupDone: true,
      giftCardType: {},
      giftCard: { description: "", background_image: "" },
      company: {}
    };
  },

  created() {
    this.loadGiftCardType();
    this.loadCompany();
  },

  methods: {
    loadGiftCardType() {
      this.loading = true;
      let url = "/companies/current/giftCardTypes";
      if (this.$can("manage", "role_anonymous")) {
        url = "/companies/" + this.$company.id + "/giftCardTypes";
      }
      this.axios.get(url).then(res => {
        this.setGiftCardType(res);
      });
    },

    setGiftCardType(res) {
      if (res.data && res.data[0]) {
        this.setupDone = true;

        this.giftCardType = res.data[0];
        this.giftCard.giftCardTypeId = this.giftCardType.id;
        this.giftCard.companyId = this.giftCardType.companyId;
        this.giftCard.description = "" + this.giftCardType.description;
        if (this.giftCardType.background_images) {
          this.giftCard.background_image = "" + this.giftCardType.background_images[0];
        }
      } else {
        this.setupDone = false;
      }
      this.loading = false;
    },

    loadCompany() {
      let url = "/companies/current";
      if (this.$can("manage", "role_anonymous")) {
        url = "/companies/" + this.$company.id;
      }
      this.axios.get(url).then(res => {
        this.company = res.data;
      });
    }
  }
};
</script>
