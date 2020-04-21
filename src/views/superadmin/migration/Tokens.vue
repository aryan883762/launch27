<template>
  <el-container>
    <el-row class="full-width">
      <el-card class="apps-list-table" shadow="never">
        <el-row>
          <el-col class="bg-white text-center">
            <div class="pull-left main-filters">
              <el-date-picker
                end-placeholder="End date"
                range-separator="to"
                size="small"
                start-placeholder="Start date"
                type="date_range"
                v-model="date_range"
                :default-time="['00:00:00', '23:59:59']"
                @change="filterChanged"
              />
            </div>
            <div class="pull-left main-filters">
              <el-input
                size="small"
                v-model="search"
                placeholder="Search"
                class="search round small"
                @change="filterChanged"
              />
            </div>
            
            <el-button
              class="pull-right m-l-10"
              type="success"
              icon="el-icon-refresh"
              size="small"
              round
              :disabled="transfer_running"
              @click="startTokenTransfer()"
            >
              Fullsteam Transfer
              <b>({{multiple_selection.length > 0 ? multiple_selection.length : 'ALL'}})</b>
            </el-button>
            
            <el-button
              class="pull-right m-l-10"
              type="primary"
              icon="el-icon-refresh"
              size="small"
              round
              :disabled="transfer_running"
              @click="startTokenFromStorage()"
            >
            Storage Transfer
              <b>({{multiple_selection.length > 0 ? multiple_selection.length : 'ALL'}})</b>
            </el-button>
            
            <el-button
              class="pull-right m-l-10"
              type="warning"
              icon="el-icon-refresh"
              size="small"
              round
              :disabled="transfer_running || multiple_selection.length < 1"
              @click="sendEmails()"
            >
            Send Emails
              <b>({{multiple_selection.length}})</b>
            </el-button>
            
            
            <el-button
              class="pull-right m-l-10"
              type="info"
              icon="el-icon-refresh"
              size="small"
              round
              :disabled="transfer_running"
              @click="startTokenTransferUpdate()"
            >
              Update Tokens
            </el-button>

            <div class="pull-right main-filters">
              <div>
                <el-radio-group v-model="region_type" size="small" @change="filterChanged">
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
            <el-table
              :default-sort="sort"
              @sort-change="sortChanged"
              :data="companies"
              style="width: 100%"
              :empty-text="loading ? 'Loading...' : ''"
              ref="multipleTable"
              @selection-change="handleSelectionChange"
              row-key="id"
            >
              <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
              <el-table-column label="ID" width="60" prop="oldVersionId" sortable="custom"></el-table-column>
              <el-table-column label="Business Name" prop="business_name" sortable="custom"></el-table-column>
              <el-table-column label="Country" prop="country.name" sortable="custom"></el-table-column>
              <el-table-column label="Stripe Account ID">
                <template slot-scope="scope">
                  <template v-if="edit && editCompanyId === scope.row.id">
                    <el-input placeholder="Please input" v-model="payment_method.stripe_user_id"></el-input>
                  </template>
                  <template v-else>
                    {{ scope.row.payment_methods && scope.row.payment_methods.stripe_user_id ? scope.row.payment_methods.stripe_user_id : ' - ' }}
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Fullsteam Merchant ID">
                <template slot-scope="scope">
                  <template v-if="edit && editCompanyId === scope.row.id">
                    <el-input placeholder="Please input" v-model="payment_method.fspay_credentials.merchantId"></el-input>
                  </template>
                  <template v-else>
                    {{ scope.row.payment_methods && scope.row.payment_methods.fspay_credentials && scope.row.payment_methods.fspay_credentials.merchantId ? scope.row.payment_methods.fspay_credentials.merchantId : ' - ' }}
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Token Migrated" prop="token_migrated" sortable="custom">
                <template slot-scope="scope">
                  <el-tag
                    :type="scope.row.token_migrated ? 'success' : 'danger'"
                  >{{ scope.row.token_migrated ? 'Yes' : 'No' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Status">
                <template slot-scope="scope">
                  <el-tag
                    :type="getTokenMigrationStatus(scope.row).type"
                  >{{ getTokenMigrationStatus(scope.row).status }}</el-tag>
                  <template v-if="getTokenMigrationStatus(scope.row).date">
                    <br />
                    {{ getTokenMigrationStatus(scope.row).date  }}
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="Cards Count" width="80">
                <template slot-scope="scope">
                  {{ scope.row.migration ? scope.row.migration.card_count : ''}}
                </template>
              </el-table-column>
              <el-table-column label="Convert Count" width="80">
                <template slot-scope="scope">
                  {{ scope.row.migration ? scope.row.migration.convert_count : ''}}
                </template>
              </el-table-column>
              <el-table-column label="Emails Sent">
                <template slot-scope="scope">
                  <el-tag
                    :type="scope.row.migration.emails_sent ? 'success' : (scope.row.token_migrated && scope.row.migrated ? 'danger' : 'info')"
                  >{{ scope.row.migration.emails_sent ? 'Yes' : 'No' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="right">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    @click="editMerchantId(scope.row)"
                    :disabled="scope.row.token_migrated || (edit && !(editCompanyId === scope.row.id))"
                    v-if="scope.row.payment_methods && scope.row.payment_methods.fspay_credentials && !(editCompanyId === scope.row.id)"
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

        <el-row class="stats-row" :gutter="0">
          <el-col :sm="4" :md="4" :xs="12" class="first">
            <span class="stats-number _first">{{ companies_stats.count }}</span>
            <label>
              Total Companies
              <br />
            </label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ companies_stats.token_migrated }}</span>
            <label>
              Token Migrated
              <br />
            </label>
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

export default {
  data() {
    return {
      date_range: "",
      filter_country: "",
      region_type: "us",
      search: "",
      loading: false,
      companies: [],
      companies_stats: {
        count: 0,
        migrated: 0,
        data_migrated: 0,
        token_migrated: 0
      },
      total_records: 0,
      page_size: 0,
      current_page: 1,
      load_stats: true,
      multiple_selection: [],
      sort: {prop: 'oldVersionId', order: 'ASC'},
      edit: false,
      editCompanyId: "",
      payment_method: { id: null, fspay_credentials: null, stripe_user_id: null },
      transfer_running: false
    };
  },

  mounted() {
    this.loadCompanies();
  },

  methods: {
    filterChanged() {
      this.current_page = 1;
      // only loading stats if filter has changed
      this.load_stats = true;
      this.loadCompanies();
    },
    loadCompanies() {
      this.loading = true;
      this.companies = [];

      let whereQuery = { version: "v1", data_migrated: true };
      let orderQuery = '';

      if (this.date_range && this.date_range[0] && this.date_range[1]) {
        whereQuery.founded_at = { between: this.date_range };
      }
      if (this.search !== "") {
        let pattern = { like: ".*" + this.search + ".*", options: "i" };
        let idArray = this.search.split(',').map(i => parseInt(i));
        whereQuery.or = [{ business_name: pattern }, {oldVersionId: {inq: idArray}}];
      }
      if (this.filter_country !== "" && this.filter_country !== "all") {
        whereQuery["country.name"] = this.filter_country;
      }
      if (this.region_type === "us") {
        whereQuery["country.isoCode"] = "US";
      } else if (this.region_type === "eu") {
        whereQuery["country.continent"] = "EU";
      }

      if (this.sort.prop && this.sort.order) {
          orderQuery = this.sort.prop;
          if (this.sort.order === 'ascending') {
              orderQuery += ' ASC';
          } else {
              orderQuery += ' DESC';
          }
      }
      this.axios
        .get("/companies", {
          params: {
            page: this.current_page,
            filter: {
              where: whereQuery,
              order: orderQuery,
              include: 'migration'
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
          this.getStats(whereQuery);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getStats(whereQuery) {
      if (this.load_stats) {
        this.axios
          .get("/companies/list-statistics", {
            params: {
              where: whereQuery
            }
          })
          .then(res => {
            this.companies_stats = res.data;
            this.load_stats = false;
          });
      }
    },
    sortChanged( { column, prop, order }){
        this.sort = {prop: prop, order: order};
        this.current_page = 1;
        this.loadCompanies();
    },
    handleSelectionChange(val) {
      this.multiple_selection = val;
    },
    editMerchantId(company) {
      this.editCompanyId = company.id;
      if (company.payment_methods) {
        this.payment_method.id = company.payment_methods.id;
        this.payment_method.fspay_credentials = Object.assign({}, company.payment_methods.fspay_credentials);
        this.payment_method.stripe_user_id = company.payment_methods.stripe_user_id;
      } else {
        this.payment_method = { id: null, fspay_credentials: null, stripe_user_id: null };
      }
      this.edit = true;
    },
    editSave() {
      if (this.payment_method.id && this.payment_method.fspay_credentials) {
        this.axios
          .post("/payment_gateways/change-fspay-credentials", this.payment_method)
          .then(res => {
            this.$message.success("Merchant ID updated");
            this.loadCompanies();
          })
          .catch(err => {
            this.$helpers.errorHandle("Merchant ID not updated");
          })
          .finally(() => {
            this.editCancel();
          });
      } else {
        this.$helpers.errorHandle("Nothing to Update");
        this.editCancel();
      }
    },
    editCancel() {
      this.editCompanyId = "";
      this.payment_method = { id: null, fspay_credentials: null, stripe_user_id: null };
      this.edit = false;
    },
    startTokenTransfer(){
      this.$confirm(
          "Are sure you want to Start Token Transfer?",
          "Confirm Start Token Transfer"
      ).then(() => {
        this.transfer_running = true;
        let type = this.multiple_selection.length > 0 ? "" : "all";
        this.axios
          .post("migrations/batch-token-transfer-start", {
              ids: this.multiple_selection.map(c => c.id),
              type: type
          })
          .then(res => {
            this.loadCompanies();
          })
          .catch(err => {
            this.$helpers.errorHandle(err, this);
          })
          .finally(() => {
            this.transfer_running = false;
          });
      });
    },
    startTokenTransferUpdate(){
      this.$confirm(
          "Are sure you want to check fspay for token transfer results?",
          "Confirm Token Check"
      ).then(() => {
        this.transfer_running = true;
        // TODO: remove
        this.axios
          .get("migrations/batch-token-transfer-update", {
            params: {auth: 'GIH8OFqanQbH8BIVhcazs9VrgAnwBqTE14o3eRqQjJECCpHQIpmIvCayPM93sXNV'}
          })
          .then(res => {
            this.loadCompanies();
          })
          .catch(err => {
            this.$helpers.errorHandle(err, this);
          })
          .finally(() => {
            this.transfer_running = false;
          });
      });
    },
    getTokenMigrationStatus(company) {
      // TODO: find a way to call it once per loop
      let result = {
        type: 'info',
        status: 'pending',
        date: null
      };

      if(company.migration){
        let migration = company.migration;
        if (migration.token_transfer_started) {
          result.type = 'warning';
          result.status = 'Started';
          result.date = this.$moment(migration.token_transfer_started).format(this.$date_format);
        }
        if (migration.token_transfer_completed) {
          result.type = 'success';
          result.status = 'Completed';
          result.date = this.$moment(migration.token_transfer_completed).format(this.$date_format);
        }
      }

      return result;
    },
    startTokenFromStorage(){
      this.$confirm(
          "Are sure you want to transfer token from storage?",
          "Confirm Storage Token Transfer"
      ).then(() => {
        this.transfer_running = true;
        let type = this.multiple_selection.length > 0 ? "" : "all";
        this.axios
          .post("migrations/batch-token-set-from-storage", {
              ids: this.multiple_selection.map(c => c.id),
              type: type
          })
          .then(res => {
            this.loadCompanies();
          })
          .catch(err => {
            this.$helpers.errorHandle(err, this);
          })
          .finally(() => {
            this.transfer_running = false;
          });
      });
    },
    sendEmails(){
      this.$confirm(
          "Are sure you want to Send Emails to customers about failed token transfer?",
          "Confirm Send Emails"
      ).then(() => {
        this.transfer_running = true;
        this.axios
          .post("migrations/send-conversion-failure-emails", {
              ids: this.multiple_selection.map(c => c.id)
          })
          .then(res => {
            this.loadCompanies();
          })
          .catch(err => {
            this.$helpers.errorHandle(err, this);
          })
          .finally(() => {
            this.transfer_running = false;
          });
      });
    }
  }
};
</script>


<style lang="scss">
.m-l-10 {
  margin-left: 10px !important;
  margin-top: 2px !important;
}
</style>
