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
                         size="mini" round @click="newSidehelp">New Tutorial</el-button>

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
            <el-table :data="sidehelps" style="width: 100%" v-if="!loading">
              <el-table-column label="Key" prop="key"></el-table-column>
              <el-table-column label="Video ID" prop="videoId"></el-table-column>
              <el-table-column label="Content" min-width="200">
                <template slot-scope="scope">
                  {{ scope.row.content ? scope.row.content.substring(0, 100) : '' }}
                </template>
              </el-table-column>
              <el-table-column label="Created">
                <template slot-scope="scope">
                  {{$moment(scope.row.created_at).format($date_format + ' ' + $time_format)}}
                </template>
              </el-table-column>
              <el-table-column align="right">
                <template slot-scope="scope">                  
                  <el-button type="text" size="small"
                             @click="viewSidehelp(scope.row)">View</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>

        <el-row class="stats-row" :gutter="0">
          <el-col :sm="4" :md="4" :xs="12" class="first">
            <span class="stats-number _first">{{ sidehelpsStats.count }}</span>
            <label>
              Total Tutorials <br />
            </label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ sidehelpsStats.inactive }}</span>
            <label>
              Inactive Tutorials<br />
            </label>
          </el-col>

          <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
            <span class="stats-number _fourth">{{ sidehelpsStats.active }}</span>
            <label>
              Active Tutorials <br />
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
            @current-change="loadSidehelps"
            background
            layout="total, prev, pager, next">
        </el-pagination>
      </div>
    </el-col>
    <el-dialog :title="modal_title" :visible.sync="show_modal" 
        :close-on-press-escape="true" width="70%" 
        :fullscreen="false" append-to-body>
      <el-form :model="current_sidehelp" :rules="sidehelp_rules"  v-loading="modal_loading"
          class="bg-white padding-2x" label-position="top" ref="sidehelpForm">
        <el-row :gutter="20">
          <el-col :md="14" :sm="14" :xs="24">
            <el-form-item prop="key" label="Key">
              <el-input v-model="current_sidehelp.key" type="text" />
            </el-form-item>
            <el-form-item prop="active" label="Active">
              <el-switch
                  style="display: block" v-model="current_sidehelp.active"
                  active-color="#13ce66" inactive-color="#ff4949"
                  active-text="Active" inactive-text="Inactive">
              </el-switch>
            </el-form-item>
            <el-form-item prop="videoId" label="Video ID">
              <el-input v-model="current_sidehelp.videoId" type="text" />
            </el-form-item>
            <el-form-item prop="content" label="Content (html with basic tags: p, b, etc)">
              <wysiwyg v-model="current_sidehelp.content" />
            </el-form-item>
          </el-col>

          <el-col :sm="10" :md="10" :xs="24" class="sidehelp-display" v-if="show_modal">
            <div class="preview-label">
              <label> Preview</label>
            </div>
            <side-help :col_span="24" :sidehelp.sync="current_sidehelp"/>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="text-center">
            <el-button @click="show_modal = false" round>Close</el-button>
            <el-button type="danger" @click="deleteSidehelp(current_sidehelp.id)" round v-if="current_sidehelp.id">Delete</el-button>
            <el-button type="primary" @click="saveSidehelp" round>Save</el-button>
          </el-col>
        </el-row>
      </el-form> 
    </el-dialog>
  </el-container>
</template>


<script>
  import {VclTable} from 'vue-content-loading';
  import SideHelp from "@/views/components/SideHelp.vue";

  export default {
      components: {
          VclTable,
          SideHelp
      },
      data() {
          return {
              date_range: '',
              filter_status: '',
              search: '',
              loading: false,
              sidehelps: [],
              sidehelpsStats: {count: 0, active: 0, inactive: 0, paused: 0},
              current_sidehelp: {},
              show_modal: false,
              modal_title: '',
              modal_loading: false,
              sidehelp_rules: {
                  key: [{message: "Key is required", required: true, trigger: "blur"}]
              },
              total_records: 0,
              page_size: 0,
              current_page: 1,
              load_stats: true
          };
      },

      mounted() {
          this.loadSidehelps();
      },

      methods: {
          filterChanged() {
              this.current_page = 1;
              // only loading stats if filter has changed
              this.load_stats = true;
              this.loadSidehelps();
          },
          loadSidehelps() {

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
                      {key: pattern},
                      {videoId: pattern},
                      {content: pattern}
                  ];
              }

              this.axios.get('/sidehelps',
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
                              this.sidehelps = res.data.data;
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
                  this.axios.get('/sidehelps/list-statistics',
                          {
                              params: {
                                  where: whereQuery
                              }
                          })
                          .then(res => {
                              this.sidehelpsStats = res.data;
                              this.load_stats = false;
                          });
              }
          },
          viewSidehelp(sidehelp) {
              this.modal_title = "Edit " + sidehelp.key;
              this.current_sidehelp = JSON.parse(JSON.stringify(sidehelp));
              this.show_modal = true;
          },
          newSidehelp() {
              this.modal_title = "New Tutorial";
              this.current_sidehelp = {active: true};
              this.show_modal = true;
          },
          saveSidehelp() {
              this.$refs["sidehelpForm"].validate(valid => {
                  if (valid) {
                      this.modal_loading = true;
                      if (this.current_sidehelp.id) {
                          this.axios.patch("/sidehelps/" + this.current_sidehelp.id,
                                  {
                                      key: this.current_sidehelp.key,
                                      videoId: this.current_sidehelp.videoId,
                                      content: this.current_sidehelp.content,
                                      active: this.current_sidehelp.active
                                  })
                                  .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                  })
                                  .then(res => {
                                      if (res.data) {
                                          this.$message.success("Tutorial Successfully Updated");
                                          this.filterChanged();
                                          this.current_sidehelp = res.data;
                                      }
                                  })
                                  .finally(() => {
                                      this.modal_loading = false;
                                  });
                      } else {
                          this.axios.post("/sidehelps/",
                                  {
                                      key: this.current_sidehelp.key,
                                      videoId: this.current_sidehelp.videoId,
                                      content: this.current_sidehelp.content,
                                      active: this.current_sidehelp.active
                                  })
                                  .then(res => {
                                      if (res.data) {
                                          this.$message.success("Tutorial Successfully Added");
                                          this.filterChanged();
                                          this.current_sidehelp = res.data;
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
          deleteSidehelp(sidehelpId) {
              this.$confirm('Are sure you want to delete this tutorial?',
                      'Confirm Deletion')
                      .then(() => {
                          this.axios.delete("/sidehelps/" + sidehelpId)
                                  .then(res => {
                                      this.current_sidehelp = {};
                                      this.show_modal = false;
                                      this.filterChanged();
                                  });
                      });
          }
      }
  }
</script>


<style lang="scss">
  .sidehelp-display {
      margin-bottom: 20px;

      .preview-label {
          margin-bottom: 10px;
      }
  }
</style>
