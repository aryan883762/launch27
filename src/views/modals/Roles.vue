<template>
  <div>
    <el-dialog custom-class="fullscreen-modal-display" title="Create a role" :visible.sync="showModal" :modal="true" appendToBody :fullscreen="true" :close-on-press-escape="true" @close="settingsRedirect">
      <div slot="title" class="modal-title-container">
        <el-row>
          <el-col :sm="6" :xs="24">
            <span class="modal-title">
              User Roles
            </span>
          </el-col>
          <el-col :sm="18" :xs="24">
            <el-button-group class="pull-right">
              <el-button type="text" :class="{ active: activeTab === 'create' }" @click="activeTab = 'create'">
                Create
              </el-button>
              <el-button type="text" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
                Custom Roles
              </el-button>
            </el-button-group>
          </el-col>
        </el-row>
      </div>
      <div class="modal-body services">
        <fade-transition>
          <create-role :role.sync="role" v-if="activeTab == 'create'"></create-role>
        </fade-transition>
        <fade-transition>
          <list v-if="activeTab == 'list'"></list>
        </fade-transition>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CreateRole from "./roles/Create.vue";
import List from "./roles/List.vue";

export default {
  components: {
    CreateRole,
    List
  },
  data: () => {
    return {
      activeTab: "create",
      showModal: false,
      role: false
    };
  },

  created() {
    this.$events.addListener("edit-role", code => {
      this.activeTab = "create";
      this.role = code;
    });

    this.$events.addListener("duplicate-role", code => {
      this.activeTab = "create";
      this.role = code;
    });
  },

  mounted() {
    this.showModal = true;
  },
  methods: {
    settingsRedirect() {
      this.$router.back();
    }
  }
};
</script>

<style lang="scss">
.modal-body.roles {
  .el-checkbox__label {
    font-weight: 400;
  }

  .default-roles {
    p {
      font-size: 12px;
      margin: 0px;
    }
  }
}
</style>
