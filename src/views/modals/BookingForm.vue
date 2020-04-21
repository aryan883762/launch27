<template>
  <div>
    <el-dialog custom-class="booking-form-editor-modal" :visible.sync="showModal" :append-to-body="true" :modal="true" :fullscreen="true" :close-on-press-escape="false" :close-on-click-modal="false" :show-close="false" @close="settingsRedirect">
      <div class="modal-body account booking-form-setup">
        <booking-form-editor />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BookingFormEditor from "@/components/BookingFormEditor/component.vue";
export default {
  name: "SettingsBookingForm",
  components: {
    BookingFormEditor
  },
  data() {
    return {
      showModal: false,
      selected_form: "",
      form_width: "100",
      form_height: "1200",
      industries: [],
      form_snippet: '<iframe id="booking-V2-widget-iframe" src="URL" style="border:none;width:100%;min-height:2739px;overflow:hidden" scrolling="no"></iframe>'
    };
  },
  created() {
    this.$events.addListener("BookingFormEditor:cancel", () => {
      this.showModal = false;
    });
  },
  mounted() {
    this.showModal = true;

    // this.axios.get("/companies/current").then(res => {
    //   this.selected_form = res.data.industry;
    // });

    // this.axios.get("/industries").then(res => {
    //   this.industries = res.data;
    // });
  },
  methods: {
    settingsRedirect() {
      this.$router.push("/dashboard/settings");
    }
  }
};
</script>
<style lang="scss">
.booking-form-editor-modal {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0;
  }
}
</style>
