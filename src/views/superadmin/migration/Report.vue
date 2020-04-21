<template>
  <el-card class="apps-list-table" shadow="never" v-loading="loading" style="min-height: 500px">
    <el-row>
      <el-col class="bg-white text-center">
        <div class="pull-left main-filters stats-row">
          <div class="first">
            <span class="stats-number _first">{{ companies.length }}</span>
            <label>
              Companies
              <br />
            </label>
          </div>
        </div>
        <div class="pull-right main-filters">
          <div>
            <el-radio-group v-model="region_type" size="medium" @change="loadCompanies">
              <el-radio-button label="all">All</el-radio-button>
              <el-radio-button label="us">United States</el-radio-button>
              <el-radio-button label="eu">Europe</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row class="m-t-50" :gutter="50">
      <el-col :md="8" :sm="24" class="migration-progress-col">
        <label>Launch27 Applied ({{ migrations_stats.fspay_applied }}/{{ total_records }})</label>
        <span>
          <el-progress
            :percentage="migrations_percentage.fspay_applied"
            :text-inside="true"
            :stroke-width="30"
            status="success"
          ></el-progress>
        </span>
      </el-col>
      <el-col :md="8" :sm="24" class="migration-progress-col">
        <label>Launch27 Approved ({{ migrations_stats.fspay_approved }}/{{ total_records }})</label>
        <span>
          <el-progress
            :percentage="migrations_percentage.fspay_approved"
            :text-inside="true"
            :stroke-width="30"
            status="success"
          ></el-progress>
        </span>
      </el-col>
      <el-col :md="8" :sm="24" class="migration-progress-col">
        <label>Launch27 Credentials Transmitted ({{ migrations_stats.fs_credentials_transmitted }}/{{ total_records }})</label>
        <span>
          <el-progress
            :percentage="migrations_percentage.fs_credentials_transmitted"
            :text-inside="true"
            :stroke-width="30"
            status="success"
          ></el-progress>
        </span>
      </el-col>
    </el-row>

    <el-row class="m-t-50" :gutter="50">
      <el-col :md="8" :sm="24" class="migration-progress-col">
        <label>Token Transfer Requested ({{ migrations_stats.token_transfer_requested }}/{{ total_records }})</label>
        <span>
          <el-progress
            :percentage="migrations_percentage.token_transfer_requested"
            :text-inside="true"
            :stroke-width="30"
            status="success"
          ></el-progress>
        </span>
      </el-col>
      <el-col :md="8" :sm="24" class="migration-progress-col">
        <label>Token Transferred ({{ migrations_stats.token_transfer_started }}/{{ total_records }})</label>
        <span>
          <el-progress
            :percentage="migrations_percentage.token_transfer_started"
            :text-inside="true"
            :stroke-width="30"
            status="success"
          ></el-progress>
        </span>
      </el-col>
      <el-col :md="8" :sm="24" class="migration-progress-col">
        <label>Token Transfer Completed ({{ migrations_stats.token_transfer_completed }}/{{ total_records }})</label>
        <span>
          <el-progress
            :percentage="migrations_percentage.token_transfer_completed"
            :text-inside="true"
            :stroke-width="30"
            status="success"
          ></el-progress>
        </span>
      </el-col>
    </el-row>

    <el-row class="m-t-50" :gutter="50">
      <el-col :md="8" :sm="24" class="migration-progress-col">
        <label>Migration Dry Run ({{ migrations_stats.data_migration_dryrun }}/{{ total_records }})</label>
        <span>
          <el-progress
            :percentage="migrations_percentage.data_migration_dryrun"
            :text-inside="true"
            :stroke-width="30"
            status="success"
          ></el-progress>
        </span>
      </el-col>
      <el-col :md="8" :sm="24" class="migration-progress-col">
        <label>Migration Final ({{ migrations_stats.data_migration_final }}/{{ total_records }})</label>
        <span>
          <el-progress
            :percentage="migrations_percentage.data_migration_final"
            :text-inside="true"
            :stroke-width="30"
            status="success"
          ></el-progress>
        </span>
      </el-col>
      <el-col :md="8" :sm="24" class="migration-progress-col">
        <label>First Login ({{ migrations_stats.customer_first_login }}/{{ total_records }})</label>
        <span>
          <el-progress
            :percentage="migrations_percentage.customer_first_login"
            :text-inside="true"
            :stroke-width="30"
            status="success"
          ></el-progress>
        </span>
      </el-col>
    </el-row>
  </el-card>
</template>


<script>
export default {
  data() {
    return {
      loading: false,
      companies: [],
      region_type: "us",
      migrations_stats: {
        fspay_applied: 0,
        fspay_approved: 0,
        token_transfer_requested: 0,
        token_transfer_started: 0,
        token_transfer_completed: 0,
        fs_credentials_transmitted: 0,
        data_migration_dryrun: 0,
        data_migration_final: 0,
        customer_first_login: 0
      }
    };
  },

  mounted() {
    this.loadCompanies();
  },

  computed: {
    total_records() {
      return this.companies.length;
    },
    migrations_percentage() {
      let result = {};
      Object.keys(this.migrations_stats).forEach(key => {
        if (this.total_records > 0) {
          result[key] = (this.migrations_stats[key] / this.total_records) * 100;
          result[key] = Math.round(result[key]);
        } else {
          result[key] = 0;
        }
      });
      return result;
    }
  },

  methods: {
    loadCompanies() {
      this.loading = true;
      this.companies = [];

      let whereQuery = {version: "v1"};
      if (this.region_type === "us") {
        whereQuery["country.isoCode"] = "US";
      } else if (this.region_type === "eu") {
        whereQuery["country.continent"] = "EU";
      }

      this.axios
        .get("/companies", {
          params: {
            filter: {
              where: whereQuery,
              fields: ["id"]
            }
          }
        })
        .then(res => {
          if (res.data) {
            this.companies = res.data;
          }
          this.getMigrationStats();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getMigrationStats() {
      this.axios
        .post("/migrations/list-statistics", { where: {companyId: { inq: this.companies.map(c => c.id) } }})
        .then(res => {
          this.migrations_stats = res.data;
        });
    }
  }
};
</script>

<style lang="scss">
.m-t-50 {
  margin-top: 50px;
}
</style>
