<template>
  <el-card
    shadow="never"
    v-loading="loading"
    :body-style="{minHeight: '300px'}"
    class="company-view-card-main"
  >
    <el-row>
      <el-col class="spaced-row">
        <el-row :gutter="20">
          <el-col>
            <el-card>
              <div slot="header" class="clearfix">
                <div>
                  Progress
                  <el-progress
                    class="card-btn migration-progress"
                    :percentage="migrationProgressPercent"
                    :text-inside="true"
                    :stroke-width="20"
                    status="success"
                  ></el-progress>
                </div>
              </div>
              <el-row>
                <el-col>
                  <el-steps :active="migrationProgress" finish-status="success">
                    <el-step description="Launch27 Applied" :title="dateFormatted('fspay_applied')"></el-step>
                    <el-step
                      description="Launch27 Approved"
                      :title="dateFormatted('fspay_approved')"
                    ></el-step>
                    <el-step
                      description="Launch27 Credentials Transmitted"
                      :title="dateFormatted('fs_credentials_transmitted')"
                    ></el-step>
                    <el-step
                      description="Token Transfer Requested"
                      :title="dateFormatted('token_transfer_requested')"
                    ></el-step>
                    <el-step
                      description="Token Transferred"
                      :title="dateFormatted('token_transfer_started')"
                    ></el-step>
                    <el-step
                      description="Token Transfer Completed"
                      :title="dateFormatted('token_transfer_completed')"
                    ></el-step>
                    <el-step
                      description="Migration Dry Run"
                      :title="dateFormatted('data_migration_dryrun')"
                    ></el-step>
                    <el-step
                      description="Migration Final"
                      :title="dateFormatted('data_migration_final')"
                    ></el-step>
                    <el-step
                      description="First Login"
                      :title="dateFormatted('customer_first_login')"
                    ></el-step>
                  </el-steps>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col>
            <el-card class="disabled-dark-text">
              <div slot="header" class="clearfix">
                <span>Migration Details</span>
                <el-button
                  class="card-btn"
                  type="primary"
                  round
                  size="mini"
                  v-if="migration_disabled"
                  @click="migration_disabled = false"
                >Edit</el-button>
                <el-button
                  class="card-btn"
                  type="success"
                  round
                  size="mini"
                  v-if="!migration_disabled"
                  @click="saveMigration"
                >Save</el-button>
                <el-button
                  class="card-btn cancel-btn"
                  type="danger"
                  round
                  size="mini"
                  v-if="!migration_disabled"
                  @click="cancelEdit"
                >Cancel</el-button>
              </div>
              <el-row :gutter="20">
                <el-form
                  :model="migration"
                  class="bg-white padding-2x"
                  label-position="top"
                  ref="migrationForm"
                >
                  <el-row :gutter="20">
                    <el-col :md="8" :sm="8" :xs="24">
                      <el-form-item label="Launch27 Applied" prop="fspay_applied">
                        <el-date-picker
                          v-model="migration.fspay_applied"
                          type="date"
                          placeholder="Pick a day"
                          :disabled="migration_disabled"
                        ></el-date-picker>
                      </el-form-item>
                      <el-form-item
                        label="Token Transfer Requested"
                        prop="token_transfer_requested"
                      >
                        <el-date-picker
                          v-model="migration.token_transfer_requested"
                          type="date"
                          placeholder="Pick a day"
                          :disabled="migration_disabled"
                        ></el-date-picker>
                      </el-form-item>
                      <el-form-item label="Migration Dry Run" prop="data_migration_dryrun">
                        <el-date-picker
                          v-model="migration.data_migration_dryrun"
                          type="date"
                          placeholder="Pick a day"
                          :disabled="migration_disabled"
                        ></el-date-picker>
                      </el-form-item>
                    </el-col>

                    <el-col :md="8" :sm="8" :xs="24">
                      <el-form-item label="Launch27 Approved" prop="fspay_approved">
                        <el-date-picker
                          v-model="migration.fspay_approved"
                          type="date"
                          placeholder="Pick a day"
                          :disabled="migration_disabled"
                        ></el-date-picker>
                      </el-form-item>
                      <el-form-item label="Token Transferred" prop="token_transfer_started">
                        <el-date-picker
                          v-model="migration.token_transfer_started"
                          type="date"
                          placeholder="Pick a day"
                          :disabled="migration_disabled"
                        ></el-date-picker>
                      </el-form-item>
                      <el-form-item label="Migration Final" prop="data_migration_final">
                        <el-date-picker
                          v-model="migration.data_migration_final"
                          type="date"
                          placeholder="Pick a day"
                          :disabled="migration_disabled"
                        ></el-date-picker>
                      </el-form-item>
                    </el-col>

                    <el-col :md="8" :sm="8" :xs="24">
                      <el-form-item
                        label="Launch27 Credentials Transmitted"
                        prop="fs_credentials_transmitted"
                      >
                        <el-date-picker
                          v-model="migration.fs_credentials_transmitted"
                          type="date"
                          placeholder="Pick a day"
                          :disabled="migration_disabled"
                        ></el-date-picker>
                      </el-form-item>
                      <el-form-item
                        label="Token Transfer Completed"
                        prop="token_transfer_completed"
                      >
                        <el-date-picker
                          v-model="migration.token_transfer_completed"
                          type="date"
                          placeholder="Pick a day"
                          :disabled="migration_disabled"
                        ></el-date-picker>
                      </el-form-item>
                      <el-form-item label="First Login" prop="customer_first_login">
                        <el-date-picker
                          v-model="migration.customer_first_login"
                          type="date"
                          placeholder="Pick a day"
                          :disabled="migration_disabled"
                        ></el-date-picker>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col class="text-center">
                      <el-button
                        type="success"
                        round
                        v-if="!migration_disabled"
                        @click="saveMigration"
                      >Save</el-button>
                    </el-col>
                  </el-row>
                </el-form>
              </el-row>
            </el-card>
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
      loading: true,
      migration: {},
      migration_disabled: true
    };
  },
  mounted() {
    this.loadMigration();
  },
  computed: {
    migrationProgress() {
      let currentStep = 0;
      let mirgationSteps = [
        "fspay_applied",
        "fspay_approved",
        "fs_credentials_transmitted",
        "token_transfer_requested",
        "token_transfer_started",
        "token_transfer_completed",
        "data_migration_dryrun",
        "data_migration_final",
        "customer_first_login"
      ];
      for (let i = 0; i < mirgationSteps.length; i++) {
        if (this.migration[mirgationSteps[i]]) {
          currentStep += 1;
        } else {
          break;
        }
      }
      return currentStep;
    },
    migrationProgressPercent() {
      let current = 0;
      let mirgationSteps = [
        "fspay_applied",
        "fspay_approved",
        "fs_credentials_transmitted",
        "token_transfer_requested",
        "token_transfer_started",
        "token_transfer_completed",
        "data_migration_dryrun",
        "data_migration_final",
        "customer_first_login"
      ];
      for (let i = 0; i < mirgationSteps.length; i++) {
        if (this.migration[mirgationSteps[i]]) {
          current += 1;
        }
      }
      return Math.round((current / mirgationSteps.length) * 100);
    }
  },
  methods: {
    loadMigration() {
      this.axios
        .get("/companies/" + this.$route.params.id + "/migration")
        .then(res => {
          if (res.data) {
            this.migration = res.data;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    saveMigration() {
      this.$refs["migrationForm"].validate(valid => {
        if (valid) {
          this.loading = true;
          let data = {};
          if (this.migration.fspay_applied) {
            data.fspay_applied = this.migration.fspay_applied;
          }
          if (this.migration.fspay_approved) {
            data.fspay_approved = this.migration.fspay_approved;
          }
          if (this.migration.fs_credentials_transmitted) {
            data.fs_credentials_transmitted = this.migration.fs_credentials_transmitted;
          }
          if (this.migration.token_transfer_requested) {
            data.token_transfer_requested = this.migration.token_transfer_requested;
          }
          if (this.migration.token_transfer_started) {
            data.token_transfer_started = this.migration.token_transfer_started;
          }
          if (this.migration.token_transfer_completed) {
            data.token_transfer_completed = this.migration.token_transfer_completed;
          }
          if (this.migration.id) {
            // update
            this.axios
              .patch("/migrations/" + this.migration.id, data)
              .then(res => {
                this.$message.success("Migration updated");
                this.loadMigration();
                this.migration_disabled = true;
              })
              .catch(err => {
                this.$helpers.errorHandle("Migration not updated");
              })
              .finally(() => {
                this.loading = false;
              });
          } else {
            data.companyId = this.$route.params.id;
            // create
            this.axios
              .post("/migrations", data)
              .then(res => {
                this.$message.success("Migration updated");
                this.loadMigration();
                this.migration_disabled = true;
              })
              .catch(err => {
                this.$helpers.errorHandle("Migration not updated");
              })
              .finally(() => {
                this.loading = false;
              });
          }
        } else {
          return false;
        }
      });
    },
    dateFormatted(key) {
      if (this.migration[key]) {
        return this.$moment(this.migration[key]).format(this.$date_format);
      } else {
        return " - ";
      }
    },
    cancelEdit() {
      this.loadMigration();
      this.migration_disabled = true;
    }
  }
};
</script>

<style lang="scss">
.el-card .cancel-btn {
  margin-right: 5px;
}
.migration-progress {
  width: 300px;
}
</style>
