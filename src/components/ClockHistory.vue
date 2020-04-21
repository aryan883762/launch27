<template>
    <el-container>
    <el-row class="full-width">
      <!-- filter -->
      <el-card  shadow="never" style="border:none; margin-bottom: 5px;">
        <el-row class="bg-white text-center">
            <div class="pull-left main-filters">
              <el-date-picker end-placeholder="End date" range-separator="to" 
                              size="small" start-placeholder="Start date" 
                              type="daterange" v-model="dateRange" class="pull-left"
                              :default-time="['00:00:00', '23:59:59']"
                              @change="filterChanged" />

            </div>

            <div>
              <el-select class="filter small no-border pull-right"
                         v-model="filterAccount" @change="filterChanged" filterable>
                  <el-option label="In" value="in"/>
                  <el-option label="Out" value="out"/>
                  <el-option label="All" value=""/>
                  <el-divider></el-divider>
                  <el-option v-for="account in accounts" :label="account.fullname" :value="account.id" :key="account.id"/>
              </el-select>
            </div>
        </el-row>
      </el-card>

      <el-card shadow="never" class="apps-list-table">
        <!-- table -->
        <el-row>
          <el-col>    
            <vcl-table v-if="loadingTimesheets"></vcl-table>

            <el-table :data="timesheets" :default-sort="sort" @sort-change="sortChanged"  v-else>
              <el-table-column label="Name">
                <template slot-scope="scope">
                  <span>{{ scope.row.account.fullname }}</span>
                  </template>
              </el-table-column>
              <el-table-column label="Role">
                <template slot-scope="scope">
                  <span>{{ scope.row.account.roleName }}</span>
                  </template>
              </el-table-column>
              <el-table-column label="Location">
                <template slot-scope="scope">
                  <span>{{ scope.row.location.name }}</span>
                  </template>
              </el-table-column>
              <el-table-column prop="in" label="In" :formatter="dateFormatter"  sortable="custom"/>
              <el-table-column prop="out" label="Out" :formatter="dateFormatter"  sortable="custom"/>
              <el-table-column prop="status" label="Status" sortable="custom"/>
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
          @current-change="loadTimesheets"
          background
          layout="total, prev, pager, next">
        </el-pagination>
      </div>
    </el-col>
  </el-container>
</template>
<script>
  import {VclTable} from 'vue-content-loading';

  export default {
    components: {
      VclTable
    },
    data: () => {
      return {
        loadingTimesheets: false,
        timesheets: [],
        accounts: [],
        search: "",
        sort: {},
        filterAccount: '',
        dateRange: '',
        total_records: 0,
        page_size: 0,
        current_page: 1
      };
    },
    created() {
        this.loadAccounts();
        this.loadTimesheets();
    },
    methods: {
      filterChanged() {
        this.current_page = 1;
        this.loadTimesheets();
      },
      loadAccounts(){
          this.axios.get('/accounts',{
            params: {
                filter:{
                    where: {
                        active: true,
                        role: {neq: 'r_customer'}
                        }
                }
            }
          })
          .then(accounts => {
              this.accounts = accounts.data;
          })
          .catch(err => {

          });
      },
      loadTimesheets() {
        this.loadingTimesheets = true;

        //add filter query here
        let whereQuery = {};
        let orderQuery = '';

        switch(this.filterAccount){
            case '':
                break;
            case 'in':
                whereQuery.status = 'in';
                break;
            case 'out':
                whereQuery.status = 'out';
                break;
            default:
                whereQuery.accountId = this.filterAccount;
                break;

        }

        if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
            whereQuery.in = {between: this.dateRange};
        }

        if (this.sort.prop && this.sort.order) {
          orderQuery = this.sort.prop;
          if (this.sort.order === 'ascending') {
            orderQuery += ' ASC';
          } else {
            orderQuery += ' DESC';
          }
        }

        this.axios.get('/clock_timesheets',
        { params:
            { 
              page: this.current_page,
              filter: 
                { 
                  include: ['account','location'],
                  where: whereQuery,
                  order: orderQuery
                }
            }
          }
        )
        .then((timesheets) => {
          this.timesheets = timesheets.data.data;
          this.loadingTimesheets = false;

          if (timesheets.data.meta) {
            this.page_size = timesheets.data.meta.itemsPerPage;
            this.total_records = timesheets.data.meta.totalItemCount;
          }
        })
        .catch((error) => {
          this.loadingTimesheets = false;
        });
      },
      dateFormatter(row, column, cellValue, index) {
        if (cellValue) {
          return this.$moment(cellValue).format(this.$date_format +" "+this.$time_format);
        } else {
          return "-";
        }
      },
      sortChanged( { column, prop, order }){
        this.sort = {prop: prop, order: order};
        this.current_page = 1;
        this.loadTimesheets();
      }
    }
  };
</script>

<style lang="scss">
.title {
    text-align: center;
    margin-bottom: 20px;

    span {
      font-size: 12px;
    }

    p, h4 {
      margin: 0px;
    }
  }
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
