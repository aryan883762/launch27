<template>
  <div>
    <el-dialog custom-class="fullscreen-modal-display" title="Template" :visible.sync="showModal" :modal-append-to-body="false" :modal="true" :fullscreen="true" :close-on-press-escape="true" @close="settingsRedirect">
      body
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "SettingsEmail",
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
