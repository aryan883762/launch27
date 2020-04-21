<template>
  <el-container>
    <el-row class="full-width">
      <el-card class="apps-list-table" shadow="never">
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

            <div>
              <el-button round disabled size="mini" type="primary" class="pull-right" style="margin-right:10px;" v-if="indexing">
                Indexing
              </el-button>
              <el-button @click="runIndex()" round size="mini" type="primary" class="pull-right" style="margin-right:10px;" v-else>
                Index Everything
              </el-button>
            </div>

            <div class="pull-right  main-filters">
              <el-select autocomplete="nope" filterable placeholder="Country" class="filter small"
                         v-model="filterCountry" value-key="name"  @change="filterChanged">
                <el-option label="All" value="all">All</el-option>
                <el-option-group :key="group.label" :label="group.label" v-for="group in [{ label: 'Popular', countries: [countries['AU'], countries['CA'], countries['NZ'], countries['ZA'], countries['US'], countries['GB']] }, { label: 'Countries', countries: countries }]">
                  <el-option :value="country.name" v-for="country in group.countries" :key="country.name" :label="country.name"> {{ country.emoji }} {{ country.name }}</el-option>
                </el-option-group>
              </el-select>
            </div>
            <div class="pull-right  main-filters">

              <el-select class="filter small pull-right" placeholder="Status"
                          v-model="filterStatus" @change="filterChanged">
                <el-option label="All" value="all">All</el-option>
                <el-option label="Active" value="active">Active</el-option>
                <el-option label="Paused" value="paused">Paused</el-option>
                <el-option label="Frozen" value="frozen">Frozen</el-option>
                <el-option label="Canceled" value="canceled">Canceled</el-option>

              </el-select>

            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-divider></el-divider>
            <vcl-table v-if="loading"></vcl-table>
            <el-table :data="companies" style="width: 100%" v-if="!loading">
              <el-table-column label="Business Name" prop="business_name"></el-table-column>
              <!--              <el-table-column label="Name" prop="account.fullname"></el-table-column>
                            <el-table-column label="Email" prop="account.email"></el-table-column>-->
              <el-table-column label="Subdomain" prop="subdomain"></el-table-column>
              <el-table-column label="Country" prop="country.name"></el-table-column>
              <el-table-column label="Founded">
                <template slot-scope="scope">
                  {{$moment(scope.row.founded_at).format($date_format + ' ' + $time_format)}}
                </template>
              </el-table-column>
              <el-table-column label="Status">
                <template slot-scope="scope">
                  <el-tag :type="statusTagType(scope.row.status)">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column align="right">
                <template slot-scope="scope">      
                  <el-button type="text" size="small"
                             @click="impersonate(scope.row.accountId)">Impersonate</el-button>            
                  <el-button type="text" size="small"
                             @click="viewCompany(scope.row.id)">View</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>

        <el-row class="stats-row" :gutter="0">
          <el-col :sm="4" :md="4" :xs="12" class="first">
            <span class="stats-number _first">{{ companiesStats.count }}</span>
            <label>
              Total Companies <br />
            </label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ companiesStats.canceled }}</span>
            <label>
              Canceled<br />
            </label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ companiesStats.frozen }}</span>
            <label>
              Frozen<br />
            </label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ companiesStats.paused }}</span>
            <label>
              Paused <br />
            </label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ companiesStats.active }}</span>
            <label>
              Active <br />
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
            layout="total, prev, pager, next">
        </el-pagination>
      </div>
    </el-col>
  </el-container>
</template>


<script>
  import {VclTable} from 'vue-content-loading';
  import { countries } from "countries-list";
  import ImpersonateMixin from '@/mixins/ImpersonateMixin';

  export default {
      components: {
          VclTable
      },

      mixins: [ImpersonateMixin],

      data() {
          return {
              dateRange: '',
              filterStatus: '',
              filterCountry: '',
              search: '',
              loading: false,
              companies: [],
              companiesStats: {count: 0, active: 0, paused: 0, frozen: 0, canceled: 0},
              total_records: 0,
              page_size: 0,
              current_page: 1,
              load_stats: true,
              countries: countries,
              indexing: false
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

              let whereQuery = {};

              // making sure we show only the companies that are fully ready
              whereQuery.and =[{or: [{version: {neq: "v1"}}, {and: [{version: "v1"}, {migrated: true}]}]}] ;

              if (this.filterStatus !== '' && this.filterStatus !== 'all') {
                  whereQuery.status = this.filterStatus;
              }
              if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
                  whereQuery.founded_at = {between: this.dateRange};
              }
              if (this.search !== "") {
                  let pattern = {like: '.*' + this.search + '.*', options: "i"};
                  whereQuery.and.push({or: [
                      {business_name: pattern},
                      {subdomain: pattern}
                  ]});
              }
              if (this.filterCountry !== '' && this.filterCountry !== 'all') {
                  whereQuery['country.name'] = this.filterCountry;
              }

              this.axios.get('/companies',
                      {
                          params: {
                              page: this.current_page,
                              filter: {
                                  where: whereQuery,
                                  // include: ['account']
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
                  this.axios.get('/companies/list-statistics',
                          {
                              params: {
                                  where: whereQuery
                              }
                          })
                          .then(res => {
                              this.companiesStats = res.data;
                              this.load_stats = false;
                          });
              }
          },

          viewCompany(id) {
              this.$router.push({name: 'superadmin_companies_general', params: {id: id}});
          },

          statusTagType(status) {
              if (status === 'active') {
                  return 'success';
              } else if (status === 'paused') {
                  return 'warning';
              } else {
                  return 'danger';
              }
          },

          runIndex(){
            this.indexing = true;

            this.axios.post('/crons/manualAll',
            {
                code: "reindex_search"
            })
            .then(res => {
                this.$helpers.successHandle('Indexing All Companies records Queued', this)
            })
            .catch(err => {
                this.$helpers.errorHandle(err, this)
            })
            .finally(() => {
                this.indexing = false
            })
          }
      }
  }
</script>


<style lang="scss">

</style>
