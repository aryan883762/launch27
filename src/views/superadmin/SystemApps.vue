<template>
  <el-container>
    <el-row class="full-width">
      <el-card class="apps-list-table" shadow="never">
        <el-row>
          <el-col class="bg-white text-center">
           
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-divider></el-divider>
            <vcl-table v-if="loading"></vcl-table>
            <el-table :data="systemAppsList" style="width: 100%" v-else>
              <el-table-column label="Name" prop="name"></el-table-column>
              <el-table-column label="Plan Key" prop="plan_key"></el-table-column>
              <el-table-column label="Active">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.active ? 'success' : 'danger'">
                    {{ scope.row.active ? 'Yes' : 'No' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Price">
                <template slot-scope="scope">
                  $ {{scope.row.price}}
                </template>
              </el-table-column>
              <el-table-column align="right">
                <template slot-scope="scope">                  
                  <el-button type="text" size="small"
                             @click="viewSystemApp(scope.row)">View</el-button>
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
            @current-change="loadSystemApps"
            background
            layout="total, prev, pager, next">
        </el-pagination>
      </div>
    </el-col>
    <el-dialog :title="modal_title" :visible.sync="show_modal" 
        :close-on-press-escape="true" width="50%" 
        :fullscreen="false" append-to-body>
      <el-form :model="current_system_app" :rules="system_app_rules"  v-loading="modal_loading"
          class="bg-white padding-2x" label-position="top" ref="systemAppForm">
        <el-row :gutter="20">
          <el-col>
            <el-form-item prop="name" label="Name">
              <el-input v-model="current_system_app.name" type="text" />
            </el-form-item>
            <el-form-item prop="description" label="Description">
              <el-input v-model="current_system_app.description" type="text" />
            </el-form-item>
            <el-form-item prop="active" label="Active">
              <el-switch
                  style="display: block" v-model="current_system_app.active"
                  active-color="#13ce66" inactive-color="#ff4949"
                  active-text="Active" inactive-text="Inactive">
              </el-switch>
            </el-form-item>
            <el-form-item prop="price" label="Price">
              <el-input-number v-model="current_system_app.price" :min="1"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="text-center">
            <el-button @click="show_modal = false" round>Close</el-button>
            <el-button type="primary" @click="saveSystemApp" round>Save</el-button>
          </el-col>
        </el-row>
      </el-form> 
    </el-dialog>
  </el-container>
</template>


<script>
  import {VclTable} from 'vue-content-loading';

  export default {
      components: {
          VclTable
      },
      data() {
          return {
              filter_status: '',
              search: '',
              loading: false,
              systemAppsList: [],
              current_system_app: {},
              show_modal: false,
              modal_title: '',
              modal_loading: false,
              system_app_rules: {
                  name: [{message: "Name is required", required: true, trigger: "blur"}],
                  description: [{message: "Description is required", required: true, trigger: "blur"}],
                  price: [{message: "Price is required", required: true, trigger: "blur"}]
              },
              total_records: 0,
              page_size: 0,
              current_page: 1
          };
      },

      mounted() {
          this.loadSystemApps();
      },

      methods: {
          loadSystemApps() {
              this.loading = true;

              this.axios.get('/system_applications/list')
                      .then(response => {
                          if(response.data){
                            this.systemAppsList = response.data;
                          }
                      })
                      .catch()
                      .then(() => {
                          this.loading = false;
                      });
          },
          viewSystemApp(systemApp) {
              this.modal_title = "Editing " + systemApp.name;
              this.current_system_app = systemApp
              this.show_modal = true;
          },
          saveSystemApp() {
              this.$refs["systemAppForm"].validate(valid => {
                  if (valid) {
                      this.modal_loading = true;
                      if (this.current_system_app.id) {
                          this.axios.patch("/system_applications/" + this.current_system_app.id,
                                  {
                                      name: this.current_system_app.name,
                                      description: this.current_system_app.description,
                                      active: this.current_system_app.active,
                                      price: this.current_system_app.price
                                  })
                                  .then(res => {
                                      if (res.data) {
                                          this.$helpers.successHandle("System Application Successfully Updated");
                                          this.loadSystemApps();
                                          this.current_system_app = res.data;
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
          }
      }
  }
</script>

<style lang="scss">
</style>
