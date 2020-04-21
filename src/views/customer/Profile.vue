<template>
  <div>
    <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" appendToBody :visible.sync="showModal" @close="settingsRedirect" custom-class="fullscreen-modal-display" title="Account">
      <div class="modal-title-container" slot="title">
        <el-row>
          <el-col :sm="6" :xs="24">
            <span class="modal-title">
              Account
            </span>
          </el-col>
        </el-row>
      </div>

      <div class="modal-body account">
        <div v-loading="loading">
          <el-card>
            <account-settings :profile.sync="profile" v-if="activeTab === 'settings'" />
          </el-card>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AccountSettings from "./components/AccountSettings.vue";

export default {
  components: {
    AccountSettings
  },
  data() {
    return {
      showModal: false,
      activeTab: "settings",
      profile: {
        first_name: "",
        last_name: "",
        phone: "",
        email: ""
      },
      referalCode: "",
      loading: false,
      security: {}
    };
  },
  watch: {
    $route(val) {
      this.activeTab = val.query.tab;
    }
  },
  created() {
    this.showModal = true;

    //            if (this.$route.query.hasOwnProperty("tab")) this.activeTab = this.$route.query.tab;

    this.loading = true;
    this.$auth.fetch({
      success: response => {
        this.loading = false;
        this.profile = response.data;
      },
      error: response => {
        this.loading = false;
      }
    });

    this.$events.addListener("account:profile:change-tab", this.changeTab);
  },
  beforeDestroy() {
    this.$events.removeListener("account:profile:change-tab", this.changeTab);
  },
  methods: {
    settingsRedirect() {
      this.$router.push("/customer/dashboard");
    },
    changeTab(tab) {
      this.activeTab = tab;
    }
  }
};
</script>
<style lang="scss">
.fullscreen-modal-display {
  .modal-body {
    &.account {
      .container {
        background: white;
      }
    }
  }
}
</style>
