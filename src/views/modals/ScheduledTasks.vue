<template>
  <div>
    <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" appendToBody :visible.sync="showModal" @close="settingsRedirect" custom-class="fullscreen-modal-display">
      <div class="modal-title-container" slot="title">
        <el-row>
          <el-col :sm="6" :xs="24">
            <span class="modal-title">
              Schedule Automatic Tasks
            </span>
          </el-col>
        </el-row>
      </div>
      <div class="modal-body email-templates bg-white">
        <schedule v-if="activeTab == 'taskList'"></schedule>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import Schedule from "./schedules/ListSchedules.vue";

    export default {
        name:       "ScheduleTask",
        components: {
            Schedule
        },
        data() {
            return {
                showModal: false,
                activeTab: "taskList"
            };
        },
        mounted() {
            this.showModal = true;
        },
        methods:    {
            settingsRedirect() {
                this.$router.back()
            }
        }
    };
</script>
<style lang="scss">
  .modal-body.emails-template {
    background: white;
  }
</style>
