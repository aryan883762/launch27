<template>
  <el-container>
    <el-row class="full-width">
      <el-card shadow="never"  :body-style="{minHeight: '300px'}" 
               class="company-view-card-main apps-list-table">
        <el-row>
          <el-col class="bg-white text-center">
            <div class="pull-left main-filters">
              <el-date-picker end-placeholder="End date" range-separator="to" 
                              size="small" start-placeholder="Start date" 
                              type="daterange" v-model="dateRange"
                              :default-time="['00:00:00', '23:59:59']"
                              @change="filterChanged" />

            </div>
            <div class="pull-left main-filters">
              <el-input size="small" v-model="search" placeholder="Search" 
                        class="search round small" @change="filterChanged"/>              
            </div>

            <div class="pull-right  main-filters">

              <el-button class="pull-right" type="primary" icon="el-icon-plus" 
                         size="mini" round @click="newAccount">New User</el-button>

              <el-select class="filter small no-border pull-right" placeholder="Role" 
                         v-model="filterRole" @change="filterChanged">
                <el-option label="All" value="all">All</el-option>
                <template v-if="superadmins">
                  <el-option label="Super Admin" value="super_admin">Super Admin</el-option>
                </template>
                <template v-else>
                  <el-option :label="role.name" :value="role.code" :key="role.id" 
                      v-for="role in roles">{{ role.name }}</el-option>
                </template>

              </el-select>  

              <el-select class="filter small no-border pull-right" placeholder="Status" 
                         v-model="filterStatus" @change="filterChanged">
                <el-option label="All" value="all">All</el-option>
                <el-option label="Confirmed" value="confirmed">Confirmed</el-option>
                <el-option label="Unconfirmed" value="unconfirmed">Unconfirmed</el-option>

              </el-select>              
            </div>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row>
          <el-col>    
            <vcl-table v-if="loading"></vcl-table> 
            <el-table :default-sort="sort" :data="accounts" @sort-change="sortChanged"	v-if="!loading">
              <el-table-column prop="first_name" label="firstname" sortable="custom"/>
              <el-table-column prop="last_name" label="lastname" sortable="custom"/>
              <el-table-column prop="email" label="Email" sortable="custom"/>
              <el-table-column prop="phone" label="Phone" sortable="custom"/>
              <el-table-column prop="roleName" label="Role" sortable="custom"/>
              <el-table-column prop="confirmed" label="Confirmed">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.confirmed ? 'success' : 'danger'">
                    {{ scope.row.confirmed ? 'Yes' : 'No' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="Date Added"  sortable="custom">
                <template slot-scope="scope">
                  {{ $moment(scope.row.created_at).format($date_format) }}
                </template>
              </el-table-column>
              <el-table-column>
                <template slot-scope="scope">   
                  <el-button type="text" size="small"
                             @click="impersonate(scope.row.id)" v-if="!superadmins">Impersonate</el-button>
                  <el-button type="danger" size="mini" icon="el-icon-delete" 
                             circle v-if="superadmins" @click="deleteAccount(scope.row.id)"></el-button>               
                  <el-button type="text" size="small"
                             @click="editAccount(scope.row)">View</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <el-row class="stats-row" :gutter="0">
          <el-col :sm="4" :md="4" :xs="12" class="first">
            <span class="stats-number _first">{{ accountStats.count }}</span>
            <label>Total User</label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth" v-if="!superadmins">
            <span class="stats-number _fourth">{{ accountStats.customers }}</span>
            <label>Total Customers</label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth" v-if="!superadmins">
            <span class="stats-number _fourth">{{ accountStats.teams }}</span>
            <label>Total Team Members</label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth" v-if="!superadmins">
            <span class="stats-number _fourth">{{ accountStats.administrators }}</span>
            <label>Total Administrators</label>
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
            @current-change="loadAccounts"
            background
            layout="total, prev, pager, next">
        </el-pagination>
      </div>
    </el-col>
    <el-dialog :title="modal_title" :visible.sync="show_modal" 
        :close-on-press-escape="true" width="70%" 
        :fullscreen="false" append-to-body>
      <el-form :model="currentAccount" :rules="account_rules"  v-loading="modal_loading"
          class="bg-white padding-2x" label-position="top" ref="accountForm">
        <el-row>
          <el-col>
            <el-upload :action="getFileUrl()" :before-upload="beforeUpload" 
                :headers="getHeaders()" :on-error="uploadError" 
                :on-success="uploadSuccess" :show-file-list="false" 
                class="avatar-uploader">
              <el-avatar :size="178" :src="currentAccount.avatar" fit="contain">
                <i class="el-icon-plus avatar-uploader-icon" v-if="!currentAccount.avatar"></i>
              </el-avatar>
              <small style="display: block;">Click to change</small>
            </el-upload>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :md="12" :sm="12" :xs="24">
            <el-form-item prop="first_name" label="First Name">
              <el-input v-model="currentAccount.first_name" type="text" />
            </el-form-item>
            <el-form-item prop="phone" label="Phone number">
              <el-input v-model="currentAccount.phone" type="tel"/>
            </el-form-item>
            <el-form-item label="Role" prop="role">
              <el-select v-model="currentAccount.role">
                <el-option value="super_admin" label="Super Admin" v-if="superadmins">
                  Super Admin
                </el-option>
                <el-option v-for="role in roles" :value="role.code" 
                           :key="role.code" :label="role.name" v-else>
                  {{ role.name }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :sm="12" :md="12" :xs="24">
            <el-form-item prop="last_name" label="Last Name">
              <el-input v-model="currentAccount.last_name" type="text" />
            </el-form-item>

            <el-form-item prop="email" label="Email">
              <el-input  type="email" v-model="currentAccount.email" />
            </el-form-item>

            <el-form-item prop="stripe_customer_id" label="Stripe Customer ID">
              <el-input  type="stripe_customer_id" readonly disabled v-model="currentAccount.stripe_customer_id" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="text-center">
            <el-button @click="show_modal = false" round>Close</el-button>
            <el-button type="primary" @click="saveAccount" round>Save</el-button>
          </el-col>
        </el-row>
      </el-form> 
    </el-dialog>
  </el-container>
</template>

<script>
  import {VclTable} from 'vue-content-loading';
  import ImpersonateMixin from '@/mixins/ImpersonateMixin';

  export default {
      props: {
          superadmins: {
              type: Boolean,
              default: false
          }
      },
      mixins: [ImpersonateMixin],
      components: {
          VclTable
      },
      data: () => {
          return {
              loading: true,
              roles: [],
              accounts: [],
              search: "",
              dateRange: '',
              filterStatus: '',
              filterRole: '',
              sort: {},
              accountStats: {
                  count: 0,
                  administrators: 0,
                  teams: 0,
                  customers: 0
              },
              total_records: 0,
              page_size: 0,
              current_page: 1,
              load_stats: true,
              show_modal: false,
              currentAccount: {},
              modal_title: '',
              modal_loading: false,
              account_rules: {
                  first_name: [{message: "First name is required", required: true, trigger: "blur"}],
                  last_name: [{message: "Last name is required", required: true, trigger: "blur"}],
                  email: [
                      {message: "Email is required", required: true, trigger: "blur"},
                      {type: "email", message: "Please provide a valid email", trigger: "blur"}
                  ],
                  phone: [{message: "Phone number is required", required: true, trigger: "blur"}],
              }
          };
      },

      computed: {
          companyId() {
              // setting url based on the page that 
              if (this.superadmins && this.$auth.user()) {
                  return this.$auth.user().companyId;
              } else {
                  return this.$route.params.id;
              }
          }
      },

      mounted() {
          this.loadRoles();
          this.loadAccounts();
      },

      methods: {
          filterChanged() {
              this.current_page = 1;
              // only loading stats if filter has changed
              this.load_stats = true;
              this.loadAccounts();
          },
          loadAccounts() {
              this.loading = true;
              let whereQuery = {};
              let orderQuery = '';

              if (this.filterStatus !== '' && this.filterStatus !== 'all') {
                  whereQuery.confirmed = (this.filterStatus === 'confirmed');
              }

              if (this.filterRole !== '' && this.filterRole !== 'all') {
                  whereQuery.role = this.filterRole;
              } else if (this.superadmins) {
                  // only superadmins roles
                  whereQuery.role = {inq: ['super_admin']};
              }
              if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
                  whereQuery.created_at = {between: this.dateRange};
              }
              if (this.search !== "") {
                  let pattern = {like: '.*' + this.search + '.*', options: "i"};
                  whereQuery.or = [{email: pattern}, {fullname: pattern}, {phone: pattern},
                      {roleName: pattern}, {phone: pattern}
                  ];
              }

              if (this.sort.prop && this.sort.order) {
                  orderQuery = this.sort.prop;
                  if (this.sort.order === 'ascending') {
                      orderQuery += ' ASC';
                  } else {
                      orderQuery += ' DESC';
                  }
              }

              this.axios.get('/companies/' + this.companyId + '/accounts',
                      {
                          params: {
                              page: this.current_page,
                              filter: {
                                  where: whereQuery,
                                  order: orderQuery
                              }
                          }
                      })
                      .then(res => {
                          if (res.data) {
                              this.accounts = res.data.data;
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
              whereQuery.companyId = this.companyId;

              if (this.load_stats) {
                  this.axios.get('/accounts/list-statistics',
                          {
                              params: {
                                  where: whereQuery
                              }
                          })
                          .then(res => {
                              this.accountStats = res.data;
                              this.load_stats = false;
                          });
              }
          },
          loadRoles() {
              this.axios.get("/permissions/roles")
                      .then(res => {
                          this.roles = res.data;
                      });
          },
          sortChanged( { column, prop, order }){
              this.sort = {prop: prop, order: order};
              this.current_page = 1;
              this.loadAccounts();
          },
          editAccount(account) {
              this.modal_title = "Edit " + account.fullname;
              this.currentAccount = JSON.parse(JSON.stringify(account));
              this.show_modal = true;
          },
          newAccount() {
              this.modal_title = "New Account";
              this.currentAccount = {};
              this.show_modal = true;
          },
          getHeaders() {
              return {Authorization: this.$auth.token()};
          },
          getFileUrl() {
              return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
          },
          uploadSuccess(res, file) {
              this.currentAccount.avatar = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
              this.modal_loading = false;
          },
          uploadError() {
              this.modal_loading = false;
          },
          beforeUpload() {
              this.modal_loading = true;
              return true;
          },
          saveAccount() {
              this.$refs["accountForm"].validate(valid => {
                  if (valid) {
                      this.modal_loading = true;
                      if (this.currentAccount.id) {
                          this.axios.patch("/accounts/" + this.currentAccount.id,
                                  {
                                      first_name: this.currentAccount.first_name,
                                      last_name: this.currentAccount.last_name,
                                      email: this.currentAccount.email,
                                      phone: this.currentAccount.phone,
                                      role: this.currentAccount.role
                                  })
                                  .then(res => {
                                      if (res.data) {
                                          this.$message.success("Account Successfully Updated");
                                          this.filterChanged();
                                          this.currentAccount = res.data;
                                      }
                                  })
                                  .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                  })
                                  .finally(() => {
                                      this.modal_loading = false;
                                  });
                      } else {
                          this.axios.post("/accounts/",
                                  {
                                      companyId: this.companyId,
                                      first_name: this.currentAccount.first_name,
                                      last_name: this.currentAccount.last_name,
                                      email: this.currentAccount.email,
                                      phone: this.currentAccount.phone,
                                      role: this.currentAccount.role
                                  })
                                  .then(res => {
                                      if (res.data) {
                                          this.$message.success("Account Successfully Added");
                                          this.filterChanged();
                                          this.currentAccount = res.data;
                                      }
                                  })
                                  .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                  })
                                  .finally(() => {
                                      this.modal_loading = false;
                                  });
                      }
                  } else {
                      return false;
                  }
              });
          },
          deleteAccount(accountId) {
              this.$confirm('Are sure you want to delete this account?',
                      'Confirm Deletion')
                      .then(() => {
                          this.axios.delete("/accounts/" + accountId)
                                  .then(res => {
                                      this.filterChanged();
                                  });
                      });
          }
      }
  };
</script>
