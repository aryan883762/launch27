<template>
  <el-card
    shadow="never"
    v-loading="company_loading || migration_loading"
    :body-style="{minHeight: '300px'}"
    class="company-view-card-main"
  >
    <el-row>
      <el-col class="spaced-row">
        <el-row>
          <el-col class="apps-list-table bg-white text-center m-b-10">
            <div class="main-filters">
              <div>
                <el-radio-group v-model="mode" size="small">
                  <el-radio-button label="simple">Simple</el-radio-button>
                  <el-radio-button label="details">Details</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row v-if="mode === 'details'">
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
                        <el-step title="Import"></el-step>
                        <el-step title="Owner"></el-step>
                        <el-step
                          :title="step.label"
                          :key="step.key"
                          v-for="step in migration_steps"
                        ></el-step>
                      </el-steps>
                    </el-col>
                  </el-row>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :md="12">
                <el-card :body-style="{minHeight: '300px'}" :class="{'card-header-done': true}">
                  <div slot="header" class="clearfix">
                    <span class="card-header-text">1. Import</span>
                  </div>
                  <el-row v-if="company">
                    <el-col>
                      <div class="details-item">
                        <div class="details-item-title">Version 1 ID</div>
                        <div class="details-item-body">{{ company.oldVersionId }}</div>
                      </div>
                      <div class="details-item">
                        <div class="details-item-title">Business Name</div>
                        <div class="details-item-body">{{ company.business_name }}</div>
                      </div>
                      <div class="details-item">
                        <div class="details-item-title">Subdomain</div>
                        <div class="details-item-body">{{ company.subdomain }}</div>
                      </div>
                      <div class="details-item">
                        <div class="details-item-title">Country</div>
                        <div class="details-item-body">{{ company.country.name }}</div>
                      </div>
                      <div class="details-item">
                        <div class="details-item-title">Support Email</div>
                        <div class="details-item-body">{{ company.support_email }}</div>
                      </div>
                      <div class="details-item">
                        <div class="details-item-title">Phone</div>
                        <div class="details-item-body">{{ company.phone }}</div>
                      </div>
                    </el-col>
                  </el-row>
                </el-card>
              </el-col>
              <el-col :md="12">
                <el-card
                  :body-style="{minHeight: '300px'}"
                  :class="{'card-header-done': owner, 'card-header-current': !stepStatus('staffs', 'done') }"
                >
                  <div slot="header" class="clearfix">
                    <span class="card-header-text">2. Owner</span>
                  </div>
                  <el-row v-if="owner">
                    <el-col>
                      <div class="details-item">
                        <div class="details-item-title">Description</div>
                        <div class="details-item-body">Migrate company owner and general details.</div>
                      </div>
                      <div class="details-item">
                        <div class="details-item-title">Full Name</div>
                        <div class="details-item-body">{{ owner.fullname }}</div>
                      </div>
                      <div class="details-item">
                        <div class="details-item-title">Email</div>
                        <div class="details-item-body">{{ owner.email }}</div>
                      </div>
                      <div class="details-item">
                        <div class="details-item-title">Phone</div>
                        <div class="details-item-body">{{ owner.phone }}</div>
                      </div>
                      <div class="details-item" v-if="owner_migration">
                        <div class="details-item-title">
                          Errors
                          <el-button
                            type="text"
                            size="small"
                            v-if="owner_migration.error_info && owner_migration.error_info.list.length > 0"
                          >View</el-button>
                        </div>
                        <div
                          class="details-item-body"
                          v-if="owner_migration.error_info && owner_migration.error_info.list.length > 0"
                        >
                          {{ owner_migration.error_info.list[0].message }}
                          <span
                            v-if="owner_migration.error_info.list.length > 1"
                          >, +{{ owner_migration.error_info.list.length - 1 }} more</span>
                        </div>
                        <div class="details-item-body" v-else>None</div>
                      </div>
                    </el-col>
                  </el-row>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :md="8" :key="step.key" v-for="(step, index) in migration_steps">
                <el-card
                  class="m-b-10"
                  :body-style="{minHeight: '350px'}"
                  :class="{'card-header-done': stepStatus(step.key, 'done'), 'card-header-current': stepCanMigrate(step.key, index), 'card-header-next': (!stepStatus(step.key, 'done') && !stepCanMigrate(step.key, index)) }"
                >
                  <div slot="header" class="clearfix">
                    <span class="card-header-text">{{ index + 3}}. {{ step.label }}</span>
                  </div>
                  <el-row>
                    <el-col>
                      <div class="details-item">
                        <div class="details-item-title">Description</div>
                        <div class="details-item-body">{{ step.description }}</div>
                      </div>
                      <template v-if="step.record">
                        <div class="details-item">
                          <div class="details-item-title">V1 Records</div>
                          <div class="details-item-body">{{ step.record.records }}</div>
                        </div>
                        <div class="details-item">
                          <div class="details-item-title">Migrated Records/Operations</div>
                          <div class="details-item-body">{{ step.record.migrated_records }}</div>
                        </div>
                        <div class="details-item">
                          <div class="details-item-title">
                            Errors
                            <el-button
                              type="text"
                              size="small"
                              v-if="step.record.error_info && step.record.error_info.list.length > 0"
                              @click="viewErrors(step.record.error_info.list)"
                            >View</el-button>
                          </div>
                          <div
                            class="details-item-body"
                            v-if="step.record.error_info && step.record.error_info.list.length > 0"
                          >
                            {{ step.record.error_info.list[0].message }}
                            <span
                              v-if="step.record.error_info.list.length > 1"
                            >, +{{ step.record.error_info.list.length - 1 }} more</span>
                          </div>
                          <div class="details-item-body" v-else>None</div>
                        </div>
                      </template>
                    </el-col>
                  </el-row>
                  <el-row class="migrate-btn-row">
                    <el-col class="text-center">
                      <el-button
                        type="danger"
                        round
                        size="mini"
                        v-if="stepStatus(step.key, 'started') && (!migration_steps[index+1] || !stepStatus(migration_steps[index+1].key, 'started'))"
                        @click="migrateStepUndo(step.key)"
                      >Undo</el-button>
                      <el-button
                        type="success"
                        round
                        size="mini"
                        v-if="stepCanMigrate(step.key, index)"
                        @click="migrateStep(step.key)"
                      >Migrate</el-button>
                    </el-col>
                  </el-row>
                </el-card>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <template v-else>
          <el-row type="flex" justify="space-around">
            <el-col :md="8">
              <el-card shadow="hover" class="text-center">
                <div>
                  <el-progress
                    :percentage="migrationProgressPercent"
                    :text-inside="true"
                    :stroke-width="20"
                    status="success"
                  ></el-progress>
                </div>
                <p>Migrate all the data for this business, it will take some time please don't refresh the browser.</p>
                <p>
                  <el-button
                    type="success"
                    round
                    size="large"
                    :disabled="stepStatus('settings', 'started')"
                    @click="migrateStepAll"
                  >Migrate</el-button>
                </p>
              </el-card>
            </el-col>
            <el-col :md="8">
              <el-card shadow="hover" class="text-center">
                <p>Undo Migration, all the data that has been migrated will be deleted.</p>
                <p>
                  <el-button
                    type="danger"
                    round
                    size="large"
                    :disabled="!stepStatus('settings', 'started')"
                    @click="migrateStepUndoAll"
                  >Undo</el-button>
                </p>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              class="m-b-10"
              :md="6"
              :key="step.key"
              v-for="(step, index) in migration_steps.filter(m => m.record)"
            >
              <el-card shadow="always">
                <b>{{index + 1}}) {{step.label}}:</b>
                <span class="migration-info">{{step.record.migrated_records}}</span> of
                <span class="migration-info migration-info-blue">{{step.record.records}}</span> with
                <span
                  :class="{'migration-info': true, 'migration-info-red': step.record.error_info.list.length > 0, 'migration-info-green': step.record.error_info.list.length < 1}"
                >{{step.record.error_info.list.length}}</span> errors
              </el-card>
            </el-col>
          </el-row>
        </template>
        <el-dialog
          title="Errors"
          :visible.sync="show_errors_modal"
          :fullscreen="false"
          :close-on-press-escape="true"
          :close-on-click-modal="true"
          :show-close="true"
          top="0"
          width="90%"
          append-to-body
        >
          <el-row>
            <el-col>
              <ul>
                <li :key="index" v-for="(error, index) in error_records">{{error}}</li>
              </ul>
            </el-col>
          </el-row>

          <el-row>
            <el-col class="text-center">
              <el-button @click="show_errors_modal = false" round>Close</el-button>
            </el-col>
          </el-row>
        </el-dialog>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  data: () => {
    return {
      company_loading: true,
      migration_loading: true,
      company: false,
      data_migrations: [],
      owner: false,
      mode: "simple",
      show_errors_modal: false,
      error_records: [],
      migration_steps: [
        {
          key: "default",
          label: "V2 default records",
          description:
            "Create required V2 default records (Emails template, Subscription, Company settings, Onboarding, Payment method, Cron).",
          record: false
        },
        {
          key: "settings",
          label: "Settings",
          description: "Migrate business details and configurations.",
          record: false
        },
        {
          key: "staffs",
          label: "Staffs",
          description: "Migrate staff accounts (Office Staff).",
          record: false
        },
        {
          key: "locations",
          label: "Locations",
          description: "Migrate company locations (Locations, Booking Spots).",
          record: false
        },
        {
          key: "operations",
          label: "Operation records",
          description:
            "Migrate the company related records (Taxes, Holidays, Tags, Email templates, Master Email templates, Service Categories)",
          record: false
        },
        {
          key: "customers",
          label: "Customers",
          description: "Migrate  customer accounts (Customers).",
          record: false
        },
        {
          key: "teams",
          label: "Teams",
          description:
            "Migrate team accounts, their availabilities and rates (Teams, Availability, Team Shares, ).",
          record: false
        },
        {
          key: "addresses",
          label: "Addresses",
          description: "Migrate  customer staff an teams address (address).",
          record: false
        },
        {
          key: "cards",
          label: "Cards",
          description: "Migrate cards records(Cards)",
          record: false
        },
        {
          key: "booking_config",
          label: "Booking Configurations",
          description:
            "Migrate booking settings records (Frequencies, Extras, Pricing Parameters, Services).",
          record: false
        },
        {
          key: "promotions",
          label: "Promotions",
          description: "Migrate promotions records (Discount codes, Gift Cards)",
          record: false
        },
        {
          key: "bookings",
          label: "Bookings",
          description:
            "Migrate bookings records and related records (Bookings Comments, Charges, Images, TimeSsheets)",
          record: false
        },
        { key: "wages", 
          label: "Wages",
          description: "Migrate Wages related records (Pay team , Wages)", 
          record: false 
        }
        // { key: "quotes", label: "Quotes", description: "Migrate quotes records (Quotes)", record: false },
        // { key: "scheduled_tasks", label: "Scheduled tasks", description: "Migrate scheduled tasks records (Scheduled tasks)", record: false },
        // { key: "emails", label: "Emails", description: "Migrate emails related records (Emails, Messages, Undeliverable emails)", record: false }
      ]
    };
  },
  computed: {
    migrationProgress() {
      let currentStep = 1;
      // if (this.stepStatus('owner', 'done')) {
      if (this.owner) {
        currentStep += 1;

        for (let i = 0; i < this.migration_steps.length; i++) {
          if (this.stepStatus(this.migration_steps[i].key, "done")) {
            currentStep += 1;
          } else {
            break;
          }
        }
      }
      return currentStep;
    },
    migrationProgressPercent() {
      let current = 1;
      let total = this.migration_steps.length + 2;
      // if (this.stepStatus('owner', 'done')) {
      if (this.owner) {
        current += 1;
      }

      for (let i = 0; i < this.migration_steps.length; i++) {
        if (this.stepStatus(this.migration_steps[i].key, "done")) {
          current += 1;
        }
      }
      return Math.round((current / total) * 100);
    }
  },
  mounted() {
    this.loadCompany();
    this.loadDataMigrations();
  },
  methods: {
    loadCompany() {
      this.company = false;
      this.owner = false;
      this.axios
        .get("/companies/" + this.$route.params.id, {
          params: {
            filter: {
              include: ["account"]
            }
          }
        })
        .then(res => {
          if (res.data) {
            this.company = res.data;
            if (this.company.account) {
              this.owner = this.company.account;
            }
          }
        })
        .finally(() => {
          this.company_loading = false;
        });
    },
    loadDataMigrations() {
      this.migration_loading = true;
      this.migration_steps.forEach(ds => (ds.record = false));
      this.owner_migration = false;
      this.axios
        .get("/companies/" + this.$route.params.id + "/data_migrations")
        .then(res => {
          if (res.data) {
            this.data_migrations = res.data;
            this.data_migrations.forEach(dm => {
              if (dm.key === "owner") {
                this.owner_migration = dm;
              } else {
                let index = this.migration_steps.findIndex(
                  ms => ms.key === dm.key
                );
                if (index >= 0) {
                  this.migration_steps[index].record = dm;
                }
              }
            });
          }
        })
        .finally(() => {
          this.migration_loading = false;
        });
    },
    stepStatus(step, type) {
      let status = { started: false, done: false };
      let found = this.data_migrations.find(dm => dm.key === step);
      if (found) {
        status.started = found.status === "started" || found.status === "done";
        status.done = found.status === "done";
      }
      return status[type];
    },
    stepCanMigrate(key, index) {
      return (
        !this.stepStatus(key, "done") &&
        (!this.migration_steps[index - 1] ||
          this.stepStatus(this.migration_steps[index - 1].key, "done"))
      );
    },
    migrateStep(step) {
      this.company_loading = true;
      this.axios
        .post(
          "/data_migrations/migrate-company-step/" + this.$route.params.id,
          {
            key: step
          }
        )
        .then(res => {})
        .catch(err => {
          this.$helpers.errorHandle(err, this);
        })
        .finally(() => {
          this.company_loading = false;
          this.loadCompany();
          this.loadDataMigrations();
        });
    },
    migrateStepUndo(step) {
      this.$confirm(
        "Are sure you want to delete this migrated step?",
        "Confirm Deletion"
      ).then(() => {
        this.company_loading = true;
        this.axios
          .get(
            "/data_migrations/migrate-company-step-undo/" +
              this.$route.params.id,
            {
              params: {
                key: step
              }
            }
          )
          .then(res => {})
          .catch(err => {
            this.$helpers.errorHandle(err, this);
          })
          .finally(() => {
            this.company_loading = false;
            this.loadCompany();
            this.loadDataMigrations();
          });
      });
    },
    migrateStepAll() {
      this.company_loading = true;
      this.axios
        .post("/data_migrations/migrate-company-all", {
          ids: [this.$route.params.id]
        })
        .then(res => {})
        .catch(err => {
          this.$helpers.errorHandle(err, this);
        })
        .finally(() => {
          this.company_loading = false;
          this.loadCompany();
          this.loadDataMigrations();
        });
    },
    migrateStepUndoAll() {
      this.$confirm(
        "Are sure you want to delete this business migrated data?",
        "Confirm Deletion"
      ).then(() => {
        this.company_loading = true;
        this.axios
          .get("/data_migrations/migrate-company-all-undo", {
            params: {
              ids: [this.$route.params.id]
            }
          })
          .then(res => {})
          .catch(err => {
            this.$helpers.errorHandle(err, this);
          })
          .finally(() => {
            this.company_loading = false;
            this.loadCompany();
            this.loadDataMigrations();
          });
      });
    },
    viewErrors(errors) {
      this.error_records = errors;
      this.show_errors_modal = true;
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

.migrate-btn-row {
  min-height: 30px;
}

.m-b-10 {
  margin-bottom: 10px;
}

.card-header-text {
  font-weight: bold;
  color: white;
}

.card-header-done .el-card__header {
  background-color: $launch-success-color;
}

.card-header-current .el-card__header {
  background-color: $launch-primary-color;
}

.card-header-next .el-card__header {
  background-color: $launch-info-color;
}

.el-card .big-migration-do {
  background-color: $launch-success-color;
  color: white;
}

.el-card .big-migration-undo {
  background-color: $launch-danger-color;
  color: white;
}

.migration-info-green {
  color: $launch-success-color;
}

.migration-info {
  font-weight: bold;
}

.migration-info-red {
  color: $launch-danger-color;
}
</style>
