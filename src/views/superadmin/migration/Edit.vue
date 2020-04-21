<template>
  <el-container>
    <el-row class="full-width">
      <el-card class="apps-list-table" shadow="never">
        <el-row>
          <el-col class="bg-white text-center">
            <el-input
              size="small"
              v-model="search"
              placeholder="Search"
              class="search round small"
              @change="filterChanged"
            />
            <div class="pull-right main-filters">
              <div>
                <el-radio-group v-model="region_type" size="medium" @change="filterChanged">
                  <el-radio-button label="all">All</el-radio-button>
                  <el-radio-button label="us">United States</el-radio-button>
                  <el-radio-button label="eu">Europe</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row>
          <el-col>
            <el-divider></el-divider>
            <vcl-table v-if="loading"></vcl-table>
            <el-table :data="companies" style="width: 100%" v-else>
              <el-table-column label="ID" prop="oldVersionId"></el-table-column>
              <el-table-column label="Business Name">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    @click="viewCompanyMigration(scope.row.id)"
                  >{{ scope.row.business_name }}</el-button>
                </template>
              </el-table-column>
              <el-table-column label="Subdomain" prop="subdomain"></el-table-column>
              <el-table-column label="Launch27 Applied" align="center">
                <template slot-scope="scope">
                  <template v-if="edit && editCompanyId === scope.row.id">
                    <el-date-picker
                      v-model="migration.fspay_applied"
                      type="date"
                      placeholder="Pick a day"
                      size="mini"
                      prefix-icon="none-icon"
                      class="migration-dates"
                    ></el-date-picker>
                  </template>
                  <template v-else-if="scope.row.migration && scope.row.migration.fspay_applied">
                    <i class="el-icon-success icon-success"></i>
                    <br />
                    {{$moment(scope.row.migration.fspay_applied).format($date_format)}}
                  </template>
                  <template v-else>
                    <i class="el-icon-error icon-danger"></i>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Launch27 Approved" align="center">
                <template slot-scope="scope">
                  <template v-if="edit && editCompanyId === scope.row.id">
                    <el-date-picker
                      v-model="migration.fspay_approved"
                      type="date"
                      placeholder="Pick a day"
                      size="mini"
                      prefix-icon="none-icon"
                      class="migration-dates"
                    ></el-date-picker>
                  </template>
                  <template v-else-if="scope.row.migration && scope.row.migration.fspay_approved">
                    <i class="el-icon-success icon-success"></i>
                    <br />
                    {{$moment(scope.row.migration.fspay_approved).format($date_format)}}
                  </template>
                  <template v-else>
                    <i class="el-icon-error icon-danger"></i>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Launch27 Credentials Transmitted" align="center">
                <template slot-scope="scope">
                  <template v-if="edit && editCompanyId === scope.row.id">
                    <el-date-picker
                      v-model="migration.fs_credentials_transmitted"
                      type="date"
                      placeholder="Pick a day"
                      size="mini"
                      prefix-icon="none-icon"
                      class="migration-dates"
                    ></el-date-picker>
                  </template>
                  <template
                    v-else-if="scope.row.migration && scope.row.migration.fs_credentials_transmitted"
                  >
                    <i class="el-icon-success icon-success"></i>
                    <br />
                    {{$moment(scope.row.migration.fs_credentials_transmitted).format($date_format)}}
                  </template>
                  <template v-else>
                    <i class="el-icon-error icon-danger"></i>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Token Transfer Requested" align="center">
                <template slot-scope="scope">
                  <template v-if="edit && editCompanyId === scope.row.id">
                    <el-date-picker
                      v-model="migration.token_transfer_requested"
                      type="date"
                      placeholder="Pick a day"
                      size="mini"
                      prefix-icon="none-icon"
                      class="migration-dates"
                    ></el-date-picker>
                  </template>
                  <template
                    v-else-if="scope.row.migration && scope.row.migration.token_transfer_requested"
                  >
                    <i class="el-icon-success icon-success"></i>
                    <br />
                    {{$moment(scope.row.migration.token_transfer_requested).format($date_format)}}
                  </template>
                  <template v-else>
                    <i class="el-icon-error icon-danger"></i>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Token Transferred" align="center">
                <template slot-scope="scope">
                  <template v-if="edit && editCompanyId === scope.row.id">
                    <el-date-picker
                      v-model="migration.token_transfer_started"
                      type="date"
                      placeholder="Pick a day"
                      size="mini"
                      prefix-icon="none-icon"
                      class="migration-dates"
                    ></el-date-picker>
                  </template>
                  <template
                    v-else-if="scope.row.migration && scope.row.migration.token_transfer_started"
                  >
                    <i class="el-icon-success icon-success"></i>
                    <br />
                    {{$moment(scope.row.migration.token_transfer_started).format($date_format)}}
                  </template>
                  <template v-else>
                    <i class="el-icon-error icon-danger"></i>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Token Transfer Completed" align="center">
                <template slot-scope="scope">
                  <template v-if="edit && editCompanyId === scope.row.id">
                    <el-date-picker
                      v-model="migration.token_transfer_completed"
                      type="date"
                      placeholder="Pick a day"
                      size="mini"
                      prefix-icon="none-icon"
                      class="migration-dates"
                    ></el-date-picker>
                  </template>
                  <template
                    v-else-if="scope.row.migration && scope.row.migration.token_transfer_completed"
                  >
                    <i class="el-icon-success icon-success"></i>
                    <br />
                    {{$moment(scope.row.migration.token_transfer_completed).format($date_format)}}
                  </template>
                  <template v-else>
                    <i class="el-icon-error icon-danger"></i>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Migration Dry Run" align="center">
                <template slot-scope="scope">
                  <template v-if="scope.row.migration && scope.row.migration.data_migration_dryrun">
                    <i class="el-icon-success icon-success"></i>
                    <br />
                    {{$moment(scope.row.migration.data_migration_dryrun).format($date_format)}}
                  </template>
                  <template v-else>
                    <i class="el-icon-error icon-danger"></i>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Migration Final" align="center">
                <template slot-scope="scope">
                  <template v-if="scope.row.migration && scope.row.migration.data_migration_final">
                    <i class="el-icon-success icon-success"></i>
                    <br />
                    {{$moment(scope.row.migration.data_migration_final).format($date_format)}}
                  </template>
                  <template v-else>
                    <i class="el-icon-error icon-danger"></i>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="First Login" align="center">
                <template slot-scope="scope">
                  <template v-if="scope.row.migration && scope.row.migration.customer_first_login">
                    <i class="el-icon-success icon-success"></i>
                    <br />
                    {{$moment(scope.row.migration.customer_first_login).format($date_format)}}
                  </template>
                  <template v-else>
                    <i class="el-icon-error icon-danger"></i>
                  </template>
                </template>
              </el-table-column>

              <el-table-column align="right">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    @click="editMigration(scope.row)"
                    :disabled="edit && !(editCompanyId === scope.row.id)"
                    v-if="!(editCompanyId === scope.row.id)"
                  >Edit</el-button>
                  <el-button
                    type="success"
                    size="small"
                    round
                    @click="editSave"
                    v-if="edit && editCompanyId === scope.row.id"
                  >Save</el-button>
                  <el-button
                    class="m-t-5"
                    type="danger"
                    size="small"
                    round
                    @click="editCancel"
                    v-if="edit && editCompanyId === scope.row.id"
                  >Cancel</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-card>
    </el-row>
    <el-col class="pagination-footer">
      <div class="cct">
        <el-pagination
          :current-page.sync="current_page"
          :page-size="page_size"
          :total="total_records"
          @current-change="loadCompanies"
          background
          layout="total, prev, pager, next"
        ></el-pagination>
      </div>
    </el-col>
  </el-container>
</template>


<script>
import { VclTable } from "vue-content-loading";

export default {
  components: {
    VclTable
  },
  data() {
    return {
      search: "",
      region_type: "us",
      loading: false,
      companies: [],
      total_records: 0,
      page_size: 0,
      current_page: 1,
      edit: false,
      editCompanyId: "",
      migration: ""
    };
  },

  mounted() {
    this.loadCompanies();
  },

  methods: {
    filterChanged() {
      this.current_page = 1;
      this.loadCompanies();
    },
    loadCompanies() {
      this.loading = true;
      this.editCancel();

      let whereQuery = {version: "v1"};
      if (this.search !== "") {
        let pattern = { like: ".*" + this.search + ".*", options: "i" };
        let idArray = this.search.split(',').map(i => parseInt(i));
        whereQuery.or = [{ business_name: pattern }, { subdomain: pattern }, {oldVersionId: {inq: idArray}}];
      }
      if (this.region_type === "us") {
        whereQuery["country.isoCode"] = "US";
      } else if (this.region_type === "eu") {
        whereQuery["country.continent"] = "EU";
      }

      this.axios
        .get("/companies", {
          params: {
            page: this.current_page,
            filter: {
              where: whereQuery,
              include: ["migration"]
            }
          }
        })
        .then(res => {
          if (res.data) {
            this.companies = res.data.data;
            if (res.data.meta) {
              this.page_size = res.data.meta.itemsPerPage;
              this.total_records = res.data.meta.totalItemCount;
            }
          }
        })
        .catch()
        .then(() => {
          this.loading = false;
        });
    },
    editMigration(company) {
      this.editCompanyId = company.id;
      if (company.migration) {
        this.migration = Object.assign({}, company.migration);
      } else {
        this.migration = {};
      }
      this.edit = true;
    },
    editSave() {
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
            this.loadCompanies();
          })
          .catch(err => {
            this.$helpers.errorHandle("Migration not updated");
          })
          .finally(() => {
            this.editCompanyId = "";
            this.migration = {};
            this.edit = false;
          });
      } else {
        data.companyId = this.editCompanyId;
        // create
        this.axios
          .post("/migrations", data)
          .then(res => {
            this.$message.success("Migration updated");
            this.loadCompanies();
          })
          .catch(err => {
            this.$helpers.errorHandle("Migration not updated");
          })
          .finally(() => {
            this.editCompanyId = "";
            this.migration = {};
            this.edit = false;
          });
      }
    },
    editCancel() {
      this.editCompanyId = "";
      this.migration = {};
      this.edit = false;
    },
    viewCompanyMigration(id) {
      this.$router.push({
        name: "superadmin_companies_migration",
        params: { id: id }
      });
    }
  }
};
</script>

<style lang="scss">
.m-t-20 {
  margin-top: 20px;
}
.icon-danger {
  color: #f56c6c;
}
.icon-success {
  color: #67c23a;
}
.migration-dates input.el-input__inner {
  padding-left: 10px;
}
.m-t-5 {
  margin-top: 5px !important;
}
</style>
