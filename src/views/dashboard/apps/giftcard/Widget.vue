<template>
  <el-card shadow="never" class="text-center giftcard-widget-form">
    <el-row>
      <el-col :md="{span: 12, offset: 6}" :xs="24">
        <el-row>
          <el-col>
            <h1>Add your Gift Card Form to your Site</h1>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <h4>Paste the Gift Card Form into your site:</h4>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-input type="textarea" :rows="5" v-model="iframecode"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <h4>or, Share a Link to it:</h4>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-input v-model="widgeturl"></el-input>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  data: () => {
    return {
      iframecode: "",
      widgeturl: ""
    };
  },

  created() {
      let minHeight = "820";
      if(this.$auth.user().company && this.$auth.user().company.payment_methods && this.$auth.user().company.payment_methods.card_processor === "fspay"){
        minHeight = "1160"
      }
      this.widgeturl = window.location.origin + this.$router.resolve({name: 'anonymous_giftcard'}).href;
      this.iframecode = '<iframe id="giftcard-widget-iframe" src="' + 
      this.widgeturl + 
      '"style="border:none;width:100%;min-height:' + minHeight + 'px;"></iframe>';
  },

  methods: {}
};
</script>

<style lang="scss">
.giftcard-widget-form {
  padding: 20px;

  h1,
  h4 {
    font-weight: normal;
  }
}
</style>
