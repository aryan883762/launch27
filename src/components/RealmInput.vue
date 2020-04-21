<template>
  <el-form-item prop="realm" v-if="showSelect">
    <el-input autocomplete="on" placeholder="Company Subdomain" v-model="realm" />
  </el-form-item>
</template>

<script>
import {getUrlSubdomain} from "@/utils/subdomain_helper.js";

export default {
  name: "realm-input",
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
      }
    },
    realm: function(value) {
      this.$emit("input", this.realm);
    }
  },

  created() {
      let urlSubdomain = getUrlSubdomain();
      // if it is different from the saved one we update it
      if (this.$subdomain && urlSubdomain !== this.$subdomain.name){
          this.$subdomain.name = urlSubdomain;
      }
      // if have a valid subdomain we set it as realm
      if (this.validRealm) {
        this.realm = this.$subdomain.name;
      }
  },

  methods: {
    setRealm(cb) {
      // if we don't have a realm we get the email companies
      if (this.realm === "") {
        this.getUserUniqueRealm(cb);
      } else {
        cb();
      }
    },

    getUserUniqueRealm(cb) {
      // get the realms, if only one is found we set it
      // if many is found we show the select
      // if none is found we set realm to default
      this.axios.get("/accounts/unique-realm", { params: { email: this.email } }).then(res => {
        if (res.data && res.data.realm) {
          this.realm = res.data.realm;
          this.$emit("input", this.realm);
          cb();
        } else {
          this.showSelect = true;
        }
      });
    }
  }
};
</script>
