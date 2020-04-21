<template>
  <el-card shadow="never">
    <el-row>
      <el-col>
        <account-settings :account.sync="profile" :default-button="true" :delete-button="true" v-model="selected_card">          
        </account-settings>  
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import AccountSettings from "../../components/AccountCards.vue";

export default {
  components: {
    AccountSettings
  },
  data() {
    return {
      loading: false,
      selected_card: '',
      profile: {}
    };
  },
  computed: {
    authUser() {
      return this.$auth.user();
    }
  },
  created() {
    this.profile = this.$auth.user();
  },
  mounted() {},
  methods: {}
};
</script>

<style lang="scss">
.account-cards {
  small {
    display: block;
  }

  .el-card {
    cursor: pointer;
  }

  .charge-item-card {
    width: 40px;
    float: left;
    margin-right: 10px;
  }

  .selected {
    background: #f9fbe7;
    position: relative;

    .el-icon-circle-check {
      font-size: 25px;
      position: absolute;
      bottom: 10px;
      right: 10px;
    }
  }

  .charge-item-card-details {
    width: calc(100% - 70px);
    display: inline-block;

    .el-button {
      color: #333;
    }
  }

  .charge-item {
    span {
      display: block;
      font-size: 11px;
    }
  }
}
</style>
