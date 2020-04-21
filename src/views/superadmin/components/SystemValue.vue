<template>
  <el-container>
    <el-row class="full-width">
      <el-card class="apps-list-table" shadow="never">
        <el-row>
          <el-col class="bg-white text-center">
            <div class="pull-left main-filters">
              <el-date-picker end-placeholder="End date" range-separator="to"
                              size="small" start-placeholder="Start date"
                              type="daterange" v-model="date_range"
                              :default-time="['00:00:00', '23:59:59']"
                              @change="filterChanged" />
            </div>
            <div class="pull-left main-filters">
              <el-input size="small" v-model="search" placeholder="Search" 
                        class="search round small" @change="filterChanged"/>              
            </div>
            <div class="pull-right  main-filters">

              <el-button class="pull-right" type="primary" icon="el-icon-plus" 
                         size="mini" round @click="newValue">New {{ modeName }} Value</el-button>

              <el-select class="filter small pull-right" placeholder="Status"
                         v-model="filter_status" @change="filterChanged">
                <el-option label="All" value="all">All</el-option>
                <el-option label="Active" value="true">Active</el-option>
                <el-option label="Inactive" value="false">Inactive</el-option>

              </el-select>

            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-divider></el-divider>
            <vcl-table v-if="loading"></vcl-table>
            <el-table :data="valueList" style="width: 100%" v-else>
              <el-table-column label="type" prop="type"></el-table-column>
              <el-table-column label="Value" prop="value"></el-table-column>
              <el-table-column label="Created">
                <template slot-scope="scope">
                  {{$moment(scope.row.created_at).format($date_format + ' ' + $time_format)}}
                </template>
              </el-table-column>
              <el-table-column label="Active" min-width="30">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.active ? 'success' : 'danger'">
                    {{ scope.row.active ? 'Yes' : 'No' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column align="right">
                <template slot-scope="scope">                  
                  <el-button type="text" size="small"
                             @click="viewValue(scope.row)">View</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>

        <el-row class="stats-row" :gutter="0">
          <el-col :sm="4" :md="4" :xs="12" class="first">
            <span class="stats-number _first">{{ valueListStats.count }}</span>
            <label>
              Total {{ modeName }} Values <br />
            </label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ valueListStats.inactive }}</span>
            <label>
              Inactive {{ modeName }} Values<br />
            </label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ valueListStats.active }}</span>
            <label>
              Active {{ modeName }} Values <br />
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
            @current-change="loadvalueList"
            background
            layout="total, prev, pager, next">
        </el-pagination>
      </div>
    </el-col>
    <el-dialog :title="modal_title" :visible.sync="show_modal" 
        :close-on-press-escape="true" width="50%" 
        :fullscreen="false" append-to-body>
      <el-form :model="current_value" :rules="value_rules"  v-loading="modal_loading"
          class="bg-white padding-2x" label-position="top" ref="valueForm">
        <el-row :gutter="20">
          <el-col>
            <el-form-item prop="active" label="Active">
              <el-switch
                  style="display: block" v-model="current_value.active"
                  active-color="#13ce66" inactive-color="#ff4949"
                  active-text="Active" inactive-text="Inactive">
              </el-switch>
            </el-form-item>
            <el-form-item prop="type" label="Type">
              <el-select placeholder="Type" v-model="current_value.type">
                <el-option :key="type.key" :label="type.name" :value="type.key" v-for="type in typeList"/>
              </el-select>
            </el-form-item>
            <el-form-item prop="value" label="Value">
              <el-input v-model="current_value.value" type="text" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="text-center">
            <el-button @click="show_modal = false" round>Close</el-button>
            <el-button type="danger" @click="deleteValue(current_value.id)" round v-if="current_value.id">Delete</el-button>
            <el-button type="primary" @click="saveValue" round>Save</el-button>
          </el-col>
        </el-row>
      </el-form> 
    </el-dialog>
  </el-container>
</template>


<script>
  import {VclTable} from 'vue-content-loading';

  export default {
      props: {
          mode: {
              type: String,
              required: true
          },
          typeList: {
              type: Array,
              required: true
          }
      },
      components: {
          VclTable
      },
      data() {
          return {
              date_range: '',
              filter_status: '',
              search: '',
              loading: false,
              valueList: [],
              valueListStats: {count: 0, active: 0, inactive: 0},
              current_value: {},
              show_modal: false,
              modal_title: '',
              modal_loading: false,
              value_rules: {
                  type: [{message: "Type is required", required: true, trigger: "blur"}],
                  value: [{message: "Value is required", required: true, trigger: "blur"}]
              },
              total_records: 0,
              page_size: 0,
              current_page: 1,
              load_stats: true
          };
      },

      computed: {
          modeName() {
              let name = "";
              switch (this.mode) {
                  case 'reserved':
                      name = 'Reserved';
                      break;
                  case 'allowed':
                      name = 'Allowed';
                      break;              
                  default:
                      break;
              }
              return name;
          },
          url() {
              let name = "";
              switch (this.mode) {
                  case 'reserved':
                      name = '/reserved_values';
                      break;
                  case 'allowed':
                      name = '/allowed_values';
                      break;              
                  default:
                      break;
              }
              return name;
          }
      },

      mounted() {
          this.loadvalueList();
      },

      methods: {
          filterChanged() {
              this.current_page = 1;
              // only loading stats if filter has changed
              this.load_stats = true;
              this.loadvalueList();
          },
          loadvalueList() {

              this.loading = true;

              let whereQuery = {};
              if (this.filter_status !== '' && this.filter_status !== 'all') {
                  whereQuery.active = this.filter_status;
              }
              if (this.date_range && this.date_range[0] && this.date_range[1]) {
                  whereQuery.created_at = {between: this.date_range};
              }
              if (this.search !== "") {
                  let pattern = {like: '.*' + this.search + '.*', options: "i"};
                  whereQuery.or = [
                      {type: pattern},
                      {value: pattern}
                  ];
              }

              this.axios.get(this.url,
                      {
                          params: {
                              page: this.current_page,
                              filter: {
                                  where: whereQuery
                              }
                          }
                      })
                      .then(res => {
                          if (res.data) {
                              this.valueList = res.data.data;
                              if (res.data.meta) {
                                  this.page_size = res.data.meta.itemsPerPage;
                                  this.total_records = res.data.meta.totalItemCount;
                              }
                          }
                          this.getStats(whereQuery);
                      })
                      .catch()
                      .then(() => {
                          this.loading = false;
                      });
          },
          getStats(whereQuery) {
              if (this.load_stats) {
                  this.axios.get(this.url + '/list-statistics',
                          {
                              params: {
                                  where: whereQuery
                              }
                          })
                          .then(res => {
                              this.valueListStats = res.data;
                              this.load_stats = false;
                          });
              }
          },
          viewValue(value) {
              this.modal_title = "Edit " + value.value;
              this.current_value = JSON.parse(JSON.stringify(value));
              this.show_modal = true;
          },
          newValue() {
              this.modal_title = "New " + this.modeName + " Value";
              this.current_value = {active: true};
              this.show_modal = true;
          },
          saveValue() {
              this.$refs["valueForm"].validate(valid => {
                  if (valid) {
                      this.modal_loading = true;
                      if (this.current_value.id) {
                          this.axios.patch(this.url + "/" + this.current_value.id,
                                  {
                                      type: this.current_value.type,
                                      value: this.current_value.value,
                                      active: this.current_value.active
                                  })
                                  .then(res => {
                                      if (res.data) {
                                          this.$message.success(this.modeName + " Value Successfully Updated");
                                          this.filterChanged();
                                          this.current_value = res.data;
                                      }
                                  })
                                  .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                  })
                                  .finally(() => {
                                      this.modal_loading = false;
                                  });
                      } else {
                          this.axios.post(this.url,
                                  {
                                      type: this.current_value.type,
                                      value: this.current_value.value,
                                      active: this.current_value.active
                                  })
                                  .then(res => {
                                      if (res.data) {
                                          this.$message.success(this.modeName + " Value Successfully Added");
                                          this.filterChanged();
                                          this.current_value = res.data;
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
          deleteValue(valueId) {
              this.$confirm('Are sure you want to delete this ' + this.modeName + ' value?',
                      'Confirm Deletion')
                      .then(() => {
                          this.axios.delete(this.url + "/" + valueId)
                                  .then(res => {
                                      this.current_value = {};
                                      this.show_modal = false;
                                      this.filterChanged();
                                  });
                      });
          }
      }
  }
</script>

<style lang="scss">
</style>
