<template>
  <el-alert class="dash-message" @close="closeAction" :title="title" :close-text="close_text" :description="message" type="warning" effect="dark" v-if="show"></el-alert>
</template>

<script>
export default {
  data: () => {
    return {
      show: false,
      title: "",
      message: "",
      close_text: "",
      route: false
    };
  },

  created: function() {
    this.$events.addListener("show-warning", (title, message, close_text, route) => {
      this.title = title;
      this.message = message;
      this.show = true;
      this.close_text = close_text;
      this.route = route ? route : false;
    });
  },
  methods: {
    closeAction() {
      if (this.route) this.$router.push(this.route);
    }
  }
};
</script>

<style lang="scss">
.dash-message {
  margin-bottom: 10px;
  background : $launch-brand-color !important;
}
</style>
