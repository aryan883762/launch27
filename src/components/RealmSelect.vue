<template>
  <el-form-item prop="realm" v-if="showSelect">
    <el-select v-model="realm" placeholder="Select a company">
      <el-option v-for="company in companies" :key="company.id" :value="company.subdomain" :label="company.business_name"> {{ company.business_name }} </el-option>
    </el-select>
  </el-form-item>
</template>

<script>
export default {
  name: "realm-select",
  props: {
    value: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      showSelect: false,
      companies: [],
      realm: this.value
    };
  },

  computed: {
    validRealm() {
      return this.$subdomain && this.$subdomain.name !== "default";
    }
  },

  watch: {
    email: function(newVal, oldVal) {
      if (!this.validRealm) {
        this.realm = "";
        this.companies = [];
      }
    },
    realm: function(value) {
      this.$emit("input", this.realm);
    }
  },

  created() {
    // if have a valid subdomain we set it as realm
    if (this.validRealm) {
      this.realm = this.$subdomain.name;
    }
  },

  methods: {
    setRealm(cb) {
      // if we don't have a realm we get the email companies
      if (this.realm === "") {
        this.getUserRealms(cb);
      } else {
        cb();
      }
    },

    getUserRealms(cb) {
      // get the realms, if only one is found we set it
      // if many is found we show the select
      // if none is found we set realm to default
      this.axios.get("/accounts/companies-from-email", { params: { email: this.email } }).then(res => {
        if (res.data) {
          if (res.data.length > 1) {
            this.realm = res.data[0].subdomain;
            this.companies = res.data;
            this.showSelect = true;
            return;
          } else if (res.data.length === 1) {
            this.realm = res.data[0].subdomain;
            this.$emit("input", this.realm);
            cb();
            return;
          }
        }
        // else we just try to login d display error message
        this.showSelect = false;
        this.companies = [];
        this.realm = "default";
        this.$emit("input", this.realm);
        cb();
      });
    }
  }
};
</script>
