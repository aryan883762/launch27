<template>
  <el-container>
    <el-row class="full-width">
      <el-card shadow="never" class="apps-list-table">
        <el-row v-if="isCustomer" class="view-select text-center">
          <el-col>
            <div>
              <el-radio-group v-model="listType" size="medium" @change="filterChanged">
                <el-radio-button label="gifted">Gifted</el-radio-button>
                <el-radio-button label="received">Received</el-radio-button>
              </el-radio-group>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="bg-white text-center">
            <div class="pull-left main-filters">
              <el-date-picker end-placeholder="End date" range-separator="to" 
                              size="small" start-placeholder="Start date" 
                              type="daterange" v-model="dateRange" class="pull-left"
                              :default-time="['00:00:00', '23:59:59']"
                              @change="filterChanged" />

            </div>
            <div class="pull-left main-filters">
              <el-input size="small" v-model="search" placeholder="Search" 
                        class="search round small" @change="filterChanged"/>              
            </div>

            <div class="pull-right  main-filters">

              <el-select class="filter small no-border pull-right" placeholder="Status" 
                         v-model="filterStatus" @change="filterChanged">
                <el-option label="All" value="all">All</el-option>
                <el-option label="Pending" value="pending">Pending</el-option>
                <el-option label="Active" value="active">Active</el-option>
                <el-option label="Used" value="used">Used</el-option>

              </el-select>              
            </div>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row>
          <el-col>    
            <vcl-table v-if="loading"></vcl-table> 
            <el-table :data="giftcards" :default-sort="sort" @sort-change="sortChanged" v-if="!loading">
              <el-table-column prop="gifter_email" label="Gifter's Email" sortable="custom" />
              <el-table-column prop="recipient_name" label="Name" sortable="custom" />
              <el-table-column prop="recipient_email" label="Email" sortable="custom" />
              <el-table-column prop="amount" label="Amount" sortable="custom">
                <template slot-scope="scope">
                  {{ $currency }}{{ scope.row.amount }}
                </template>
              </el-table-column>
              <el-table-column prop="balance" label="Balance" sortable="custom">
                <template slot-scope="scope">
                  {{ $currency }}{{ scope.row.balance }}
                </template>
              </el-table-column>
              <el-table-column prop="code" label="Code" />
              <el-table-column prop="created_at" label="Date Purchased" :formatter="dateFormatter" sortable="custom" />
              <el-table-column prop="used_date" label="Date Used" :formatter="dateFormatter" sortable="custom" />
              <el-table-column prop="status" label="Status"  sortable="custom"/>
              <el-table-column v-if="$can('manage', 'manage_apps') || listType === 'gifted'">
                <template slot-scope="scope">
                  <el-dropdown trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                      <el-link type="primary"> Options<i class="el-icon-arrow-down el-icon--right"></i> </el-link>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item :command="{type: 'edit', giftCard: scope.row}">
                        Edit
                      </el-dropdown-item>
                      <el-dropdown-item :command="{type: 'topup', giftCard: scope.row}">
                        Add to Balance
                      </el-dropdown-item>
                      <el-dropdown-item :command="{type: 'recipient_resend', giftCard: scope.row}">
                        Resend Recipient Email
                      </el-dropdown-item>
                      <el-dropdown-item :command="{type: 'gifter_resend', giftCard: scope.row}">
                        Resend Gifter Email
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <el-row class="stats-row" :gutter="0">
          <el-col :sm="4" :md="4" :xs="12" class="first">
            <span class="stats-number _first">{{ giftCardStats.count }}</span>
            <label
              >Total Gift Cards <br />
              Purchased</label
            >
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ $currency }}{{ giftCardStats.balance }}</span>
            <label
              >Total Gift Card <br />
              Balance</label
            >
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ $currency }}{{ giftCardStats.spent }}</span>
            <label
              >Total Gift Card <br />
              Spent</label
            >
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ $currency }}{{ giftCardStats.purchased }}</span>
            <label
              >Total Amount <br />
              Purchased</label
            >
          </el-col>
        </el-row>

        <el-dialog :title="'Editing Gift Card > ' + selectedGiftCard.recipient_name" :visible.sync="editGiftCardDialog" :close-on-press-escape="true" width="70%" :fullscreen="false" @closed="handleGiftCardDialogClose" append-to-body top="0">
          <form-gift-card :giftCardType.sync="selectedGiftCardType" :giftCard.sync="selectedGiftCard" v-on:done-edit-gift-card-dialog="handleEditingSuccess" />
        </el-dialog>

        <el-dialog :title="'Gift Card > ' + selectedGiftCard.recipient_name" :visible.sync="addBalanceGiftCardDialog" :close-on-press-escape="true" width="50%" :fullscreen="false" @closed="handleGiftCardDialogClose" append-to-body top="0">
          <form-gift-card-balance :giftCardType.sync="selectedGiftCardType" :giftCard.sync="selectedGiftCard" v-on:done-edit-gift-card-dialog="handleEditingSuccess" />
        </el-dialog>
      </el-card>
    </el-row>
    <el-col class="pagination-footer">
      <div class="cct">
        <el-pagination
          :current-page.sync="current_page"
          :page-size="page_size"
          :total="total_records"
          @current-change="loadGiftCards"
          background
          layout="total, prev, pager, next">
        </el-pagination>
      </div>
    </el-col>
  </el-container>
</template>

<script>
  import {VclTable} from 'vue-content-loading';
  import FormGiftCard from "./components/FormGiftCard.vue";
  import FormGiftCardBalance from "./components/FormGiftCardBalance.vue";

  export default {
    components: {
      FormGiftCard,
      FormGiftCardBalance,
      VclTable
    },

    data: () => {
      return {
        loading: true,
        giftcards: [],
        selectedGiftCard: {},
        selectedGiftCardType: {},
        editGiftCardDialog: false,
        addBalanceGiftCardDialog: false,
        search: "",
        dateRange: '',
        filterStatus: '',
        sort: {},
        isCustomer: false,
        listType: "gifted", // gifted or received
        giftCardStats: {
          count: 0,
          purchased: 0,
          spent: 0,
          balance: 0
        },
        total_records: 0,
        page_size: 0,
        current_page: 1,
        load_stats: true
      };
    },

    created() {
      this.loadGiftCards();
      this.isCustomer = this.$can("manage", "role_customer");
    },

    methods: {
      filterChanged() {
        this.current_page = 1;
        // only loading stats if filter has changed
        this.load_stats = true;
        this.loadGiftCards();
      },

      loadGiftCards() {
        this.loading = true;
        let whereQuery = {};
        let orderQuery = '';

        if (!this.$can("manage", "manage_apps")) {
          if (this.listType === "received") {
            whereQuery.recipientAccountId = this.$auth.user().id;
          } else {
            whereQuery.gifterAccountId = this.$auth.user().id;
          }
        }
        if (this.filterStatus !== '' && this.filterStatus !== 'all') {
          whereQuery.status = this.filterStatus;
        }
        if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
          whereQuery.created_at = {between: this.dateRange};
        }
        if (this.search !== "") {
          let pattern = {like: '.*' + this.search + '.*', options: "i"};
          whereQuery.or = [
            {gifter_email: pattern},
            {recipient_name: pattern},
            {recipient_email: pattern}
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
        this.axios
          .get('/companies/current/giftCards',
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
              this.giftcards = res.data.data;
              if (res.data.meta) {
                this.page_size = res.data.meta.itemsPerPage;
                this.total_records = res.data.meta.totalItemCount;
              }
            }
            this.getStats(whereQuery);
          })
          .then(() => {
            this.loading = false;
          });
      },

      getStats(whereQuery) {
        if (this.load_stats) {  
          this.axios.get('/gift_cards/list-statistics',
            {
              params: {
                where: whereQuery
              }
            })
            .then(res => {
              this.giftCardStats = res.data;
              this.load_stats = false;
            });
        }
      },

      loadSelectedGiftCardType(done) {
        this.axios
          .get("/companies/current/giftCardTypes/" + this.selectedGiftCard.giftCardTypeId)
          .then(res => {
            this.selectedGiftCardType = res.data;
            done();
          })
          .catch(err => {
            this.axios.get("/companies/current/giftCardTypes").then(res => {
              if (res.data && res.data[0]) {
                this.selectedGiftCardType = res.data[0];
                this.selectedGiftCard.giftCardTypeId = this.selectedGiftCardType.id;
              }
            });
          });
      },

      handleCommand(command) {
        switch (command.type) {
          case 'edit':
            this.handleEdit(command.giftCard);
            break;
          case 'topup':
            this.handleTopUp(command.giftCard);
            break;
          case 'recipient_resend':
            this.handleEmailRecipientResend(command.giftCard);            
            break;
          case 'gifter_resend':
            this.handleEmailGifterResend(command.giftCard);
            break;
        }
      },

      handleTopUp(giftCard) {
        this.selectedGiftCard = giftCard;
        this.loadSelectedGiftCardType(() => {
          this.addBalanceGiftCardDialog = true;
        });
      },

      handleEdit(giftCard) {
        this.selectedGiftCard = giftCard;
        this.loadSelectedGiftCardType(() => {
          this.editGiftCardDialog = true;
        });
      },

      handleEmailRecipientResend(giftCard) {
        this.selectedGiftCard = giftCard;
        this.$confirm("The gift card will be sent to " + giftCard.recipient_email + ". Continue?", "Resend Email", {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning"
        })
          .then(() => {
            this.axios
              .get("/gift_cards/resend-recipient-email/" + giftCard.id)
              .then(res => {
                if (res.data && res.data.success) {
                  this.$message.success("Email sent to " + giftCard.recipient_email);
                }
              })
              .catch(() => {
                this.$helpers.errorHandle("Email sending failed");
              });
          })
          .catch(() => {
          });
      },

      handleEmailGifterResend(giftCard) {
        this.selectedGiftCard = giftCard;
        this.$confirm("The gift card will be sent to " + giftCard.gifter_email + ". Continue?", "Resend Email", {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning"
        })
          .then(() => {
            this.axios
              .get("/gift_cards/resend-gifter-email/" + giftCard.id)
              .then(res => {
                if (res.data && res.data.success) {
                  this.$message.success("Email sent to " + giftCard.gifter_email);
                }
              })
              .catch(() => {
                this.$helpers.errorHandle("Email sending failed");
              });
          })
          .catch(() => {
          });
      },

      handleGiftCardDialogClose() {
        this.selectedGiftCard = {recipient_name: ""};
        this.selectedGiftCardType = {};
        this.editGiftCardDialog = false;
        this.addBalanceGiftCardDialog = false;
      },

      handleEditingSuccess() {
        this.editGiftCardDialog = false;
        this.addBalanceGiftCardDialog = false;
        this.load_stats = true;
        this.loadGiftCards();
      },

      dateFormatter(row, column, cellValue, index) {
        if (cellValue) {
          return this.$moment(cellValue).format(this.$date_format);
        } else {
          return "-";
        }
      },
      sortChanged( { column, prop, order }){
        this.sort = {prop: prop, order: order};
        this.current_page = 1;
        this.loadGiftCards();
      }
    }
  };
</script>

<style>
  .el-message-box__btns .el-button.el-button--primary {
    min-width: auto;
  }

  .view-select {
    margin-bottom: 10px;
  }

  @media only screen and (max-width: 768px) {
    .search-filter {
      float: none !important;
      margin-top: 10px;
    }
    .search-filter .search {
      margin-left: 0px !important;
    }
  }
</style>
