<template>
  <div class="apps-list-table email-logs">
    <el-card style="border:none; margin-bottom: 5px;" :body-style="{ padding: '20px' }">
      <el-row>
        <el-col class="text-center">
          <div class="pull-left main-filters">
            <el-date-picker
              :default-time="['00:00:00', '23:59:59']"
              @change="filterChanged"
              end-placeholder="End date"
              range-separator="to"
              size="small"
              start-placeholder="Start date"
              type="daterange"
              v-model="dateRange"
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
          <div class="pull-right main-filters">
            <el-select
              class="filter small pull-right"
              filterable
              placeholder="Account"
              v-model="filter_account"
              @change="filterChanged"
              :remote-method="getAccounts"
              remote
              reserve-keyword 
            >
              <el-option label="All" value="all">All</el-option>
              <el-option
                :label="account.fullname"
                :value="account.id"
                v-for="account in accounts"
                v-bind:key="account.id"
              >{{account.fullname}} ({{account.email}})</el-option>
            </el-select>

            <el-select
              class="filter small pull-right"
              placeholder="Delivered"
              v-model="filter_delivered"
              @change="filterChanged"
            >
              <el-option label="All" value="all">All</el-option>
              <el-option label="Delivered: Yes" :value="true">Delivered: Yes</el-option>
              <el-option label="Delivered: No" :value="false">Delivered: No</el-option>
            </el-select>
            <el-select
              class="filter small pull-right"
              placeholder="Sent"
              v-model="filter_sent"
              @change="filterChanged"
            >
              <el-option label="All" value="all">All</el-option>
              <el-option label="Sent: Yes" :value="true">Sent:Yes</el-option>
              <el-option label="Sent: No" :value="false">Sent: No</el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-row :gutter="10">
        <el-col>
          <el-table :data="email_logs" style="width: 100%" v-loading="loading">
            <el-table-column label="Date">
              <template
                slot-scope="scope"
              >{{ $moment(scope.row.created_at).format($date_format + ' ' + $time_format) }}</template>
            </el-table-column>
            <el-table-column label="To" prop="to" v-if="email" />
            <el-table-column label="From" prop="from" v-if="email" />
            <el-table-column label="Phone" prop="phone" v-if="!email" />
            <el-table-column label="Title" prop="title" />
            <el-table-column label="Subject" prop="subject" v-if="email" />
            <el-table-column label="Status">
              <template slot-scope="scope">
                <el-tag type="success" v-if="scope.row.company_enabled">Company Enabled</el-tag>
                <el-tag type="danger" v-else>Company Disabled</el-tag>
                <el-tag type="success" v-if="scope.row.account_enabled">User Enabled</el-tag>
                <el-tag type="danger" v-else>User Disabled</el-tag>
                <el-tag type="success" v-if="scope.row.sent">Sent</el-tag>
                <el-tag type="danger" v-else>Not Sent</el-tag>
                <el-tag type="success" v-if="scope.row.delivered">Delivered</el-tag>
                <el-tag type="danger" v-else>Not Delivered</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="right">
              <template slot-scope="scope">
                <el-button @click="viewEmailLogs(scope.row)" type="text">View</el-button>
              </template>
            </el-table-column>
          </el-table>

          <no-data :show.sync="email_logs.length === 0 && !loading"></no-data>
        </el-col>
      </el-row>

      <el-row :gutter="0" class="stats-row">
        <el-col :md="4" :sm="4" :xs="12" class="first">
          <span class="stats-number _first">{{ emails_logs_stats.total }}</span>
          <label>
            Total Emails
            <br />
          </label>
        </el-col>

        <el-col :md="4" :sm="4" :xs="12" class="pull-right fourth">
          <span class="stats-number _fourth">{{ emails_logs_stats.sent }}</span>
          <label>
            Sent Emails
            <br />
          </label>
        </el-col>

        <el-col :md="4" :sm="4" :xs="12" class="pull-right fourth">
          <span class="stats-number _fourth">{{ emails_logs_stats.delivered }}</span>
          <label>
            Delivered Emails
            <br />
          </label>
        </el-col>
      </el-row>
    </el-card>

    <el-row>
      <el-col class="pagination-footer">
        <div class="cct">
          <el-pagination
            :current-page.sync="current_page"
            :page-size="page_size"
            :total="total_records"
            @current-change="getEmailLogs"
            background
            layout="total, prev, pager, next"
          ></el-pagination>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      title="View Email"
      :visible.sync="show_modal"
      :close-on-press-escape="true"
      :fullscreen="false"
      width="70%"
      append-to-body
      top="0"
      @close="selected_email = {}"
    >
      <el-form class="email-view-form">
        <el-row :gutter="20" v-if="selected_email.type === 'email'">
          <el-col :md="12">
            <el-form-item label="To">
              <p>{{selected_email.to}}</p>
            </el-form-item>
          </el-col>
          <el-col :md="12">
            <el-form-item label="From">
              <p>{{selected_email.from}}</p>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-else>
          <el-col>
            <el-form-item label="Phone">
              <p>{{selected_email.phone}}</p>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col>
            <el-form-item label="Status">
              <el-tag type="success" v-if="selected_email.company_enabled">Company Enabled</el-tag>
              <el-tag type="danger" v-else>Company Disabled</el-tag>
              <el-tag type="success" v-if="selected_email">User Enabled</el-tag>
              <el-tag type="danger" v-else>User Disabled</el-tag>
              <el-tag type="success" v-if="selected_email.sent">Sent</el-tag>
              <el-tag type="danger" v-else>Not Sent</el-tag>
              <el-tag type="success" v-if="selected_email.delivered">Delivered</el-tag>
              <el-tag type="danger" v-else>Not Delivered</el-tag>
            </el-form-item>
            <el-form-item label="Reason" v-if="!selected_email.delivered">
              <p>{{selected_email.reason}}</p>
            </el-form-item>
            <el-form-item label="Title">
              <p>{{selected_email.title}}</p>
            </el-form-item>
            <el-form-item label="Subject">
              <p>{{selected_email.subject}}</p>
            </el-form-item>
            <el-form-item label="Content">
              <div v-html="selected_email.content" style="word-break: normal"></div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";
import NoData from "@/components/NoData";

export default {
  components: {
    NoData
  },
  props: {
    email: {
      type: Boolean,
      required: true
    }
  },
  data: () => {
    return {
      moment: moment,
      accounts_loading: false,
      loading: true,
      selected_email: false,
      current_page: 1,
      page_size: 0,
      total_records: 0,
      show_modal: false,
      filter_sent: "",
      filter_delivered: "",
      filter_account: null,
      dateRange: "",
      search: "",
      accounts: [],
      email_logs: [],
      emails_logs_stats: { total: 0, sent: 0, delivered: 0 },
      load_stats: true
    };
  },
  mounted() {
    this.getEmailLogs();
  },

  methods: {
    getEmailLogs() {
      this.loading = true;

      let whereQuery = {};
      if (this.email) {
        whereQuery.type = "email";
      } else {
        whereQuery.type = "sms";
      }
      if (this.filter_sent !== "" && this.filter_sent !== "all") {
        whereQuery.sent = this.filter_sent;
      }
      if (this.filter_delivered !== "" && this.filter_delivered !== "all") {
        whereQuery.delivered = this.filter_delivered;
      }
      if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
        whereQuery.created_at = { between: this.dateRange };
      }
      if (this.filter_account && this.filter_account !== "all") {
        whereQuery.accountId = this.filter_account;
      }
      if (this.search !== "") {
        let pattern = { like: ".*" + this.search + ".*", options: "i" };
        if (this.email) {
          whereQuery.or = [
            { from: pattern },
            { to: pattern },
            { title: pattern },
            { subject: pattern }
          ];
        } else {
          whereQuery.or = [
            { phone: pattern },
            { title: pattern },
            { subject: pattern }
          ];
        }
      }

      this.axios
        .get("/companies/current/email_logs", {
          params: {
            page: this.current_page,
            filter: {
              order: "created_at DESC",
              where: whereQuery
            }
          }
        })
        .then(res => {
          if (res.data) {
            this.email_logs = res.data.data;
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
          .get("/email_logs/list-statistics", {
            params: {
              where: whereQuery
            }
          })
          .then(res => {
            this.emails_logs_stats = res.data;
            this.load_stats = false;
          });
      }
    },
    getAccounts(query) {
      if (query !== "") {
        this.accounts_loading = true;
        let whereQuery = {};
        let pattern = {like: '.*' + query + '.*', options: "i"};
        whereQuery.or = [
            {first_name: pattern},
            {last_name: pattern},
            {email: pattern}
        ];
        this.axios
          .get("/companies/current/accounts", {
            params: {
              filter: {
                where: whereQuery,
                fields: ["id", "first_name", "last_name", "fullname", "email"]
              }
            }
          })
          .then(res => {
            this.accounts = res.data;
          })
          .finally(() => {
            this.accounts_loading = false;
          });
      }
    },
    filterChanged() {
      this.current_page = 1;
      // only loading stats if filter has changed
      this.load_stats = true;
      this.getEmailLogs();
    },
    viewEmailLogs(email_log) {
      this.selected_email = email_log;
      this.show_modal = true;
    }
  }
};
</script>

<style lang="scss">
.email-view-form label {
  float: none !important;
}
</style>
