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

            <div class="pull-right  main-filters">

              <el-select class="filter small no-border pull-right" placeholder="Status" 
                         v-model="filterStatus" @change="filterChanged">
                <el-option label="All" value="all">All</el-option>
                <el-option label="Paid" value="paid">Paid</el-option>
                <el-option label="Unpaid" value="unpaid">Unpaid</el-option>

              </el-select>              
            </div>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row>
          <el-col>    
            <vcl-table v-if="loading"></vcl-table> 
            <el-table :default-sort="sort" :data="charges" @sort-change="sortChanged"	v-if="!loading">
              <el-table-column prop="date" label="Date"  sortable="custom">
                <template slot-scope="scope">
                  {{ $moment(scope.row.date).format($date_format) }}
                </template>
              </el-table-column>    
              <el-table-column prop="total_before_tax" label="Total Before Tax" sortable="custom"/>          
              <el-table-column prop="total_after_tax" label="Total After Tax" sortable="custom">
                <template slot-scope="scope">
                  <el-tag type="info">
                    {{ scope.row.total_after_tax }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="tax_amount" label="Tax" sortable="custom"/>
              <el-table-column prop="discounts" label="Discounts" sortable="custom"/>
              <el-table-column prop="total_payments" label="Total Payments" sortable="custom">
                <template slot-scope="scope">
                  <el-tag type="info">
                    {{ scope.row.total_payments }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="total_refunds" label="Total Refunds" sortable="custom"/>
              <el-table-column prop="paid" label="Paid">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.paid ? 'success' : 'danger'">
                    {{ scope.row.paid ? 'Yes' : 'No' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <el-row class="stats-row" :gutter="0">
          <el-col :sm="4" :md="4" :xs="12" class="first">
            <span class="stats-number _first">{{ chargeStats.count }}</span>
            <label>Total Charges</label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ chargeStats.total }}</span>
            <label>Total</label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ chargeStats.discount }}</span>
            <label>Total Discount</label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ chargeStats.tax }}</span>
            <label>Total Tax</label>
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
            @current-change="loadCharges"
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
              loading: true,
              charges: [],
              dateRange: '',
              filterStatus: '',
              sort: {},
              chargeStats: {
                  count: 0,
                  total: 0,
                  discount: 0,
                  tax: 0
              },
              total_records: 0,
              page_size: 0,
              current_page: 1,
              load_stats: true
          };
      },
      
      computed: {
          companyCurrency() {
              if (this.company && this.company.currency) {
                  return this.company.currency.symbol
              } else if (this.company && this.company.country) {
                  let primaryCurrencyISOCode = this.company.country.currency.split(',')[0];
                  return currencyData.getCurrencyByCurrencyISOCode(primaryCurrencyISOCode).symbol;
              } else {
                  return '';
              }
          }
      },

      mounted() {
          this.loadCharges();
      },

      methods: {
          filterChanged() {
              this.current_page = 1;
              // only loading stats if filter has changed
              this.load_stats = true;
              this.loadCharges();
          },
          loadCharges() {
              this.loading = true;
              let whereQuery = {};
              let orderQuery = '';

              if (this.filterStatus !== '' && this.filterStatus !== 'all') {
                  whereQuery.paid = (this.filterStatus === 'paid');
              }
              if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
                  whereQuery.date = {between: this.dateRange};
              }

              if (this.sort.prop && this.sort.order) {
                  orderQuery = this.sort.prop;
                  if (this.sort.order === 'ascending') {
                      orderQuery += ' ASC';
                  } else {
                      orderQuery += ' DESC';
                  }
              }

              this.axios.get('/companies/' + this.$route.params.id + '/charges',
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
                              this.charges = res.data.data;
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
              whereQuery.companyId = this.$route.params.id;
              if (this.load_stats) {
                  this.axios.get('/charges/list-statistics',
                          {
                              params: {
                                  where: whereQuery
                              }
                          })
                          .then(res => {
                              this.chargeStats = res.data;
                              this.load_stats = false;
                          });
              }
          },
          sortChanged( { column, prop, order }){
              this.sort = {prop: prop, order: order};
              this.current_page = 1;
              this.loadCharges();
          }
      }
  };
</script>
