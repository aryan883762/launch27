<template>
  <div>
    <el-dialog custom-class="fullscreen-modal-display" title="Invite People(Customers & Teams)" :visible.sync="showModal" :modal="false" :fullscreen="true" :close-on-press-escape="true" @close="settingsRedirect"> </el-dialog>
  </div>
</template>

<script>
export default {
  name: "SettingsService",
  data() {
    return {
      showModal: false
    };
  },
  mounted() {
    this.showModal = true;
  },
  methods: {
    settingsRedirect() {
      this.$router.push("/dashboard/settings");
    }
  }
};
</script>
<style lang="scss"></style>
