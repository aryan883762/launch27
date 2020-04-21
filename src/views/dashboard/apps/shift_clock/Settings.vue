<template>
  <el-container>
    <el-row class="full-width">
      <!-- filter -->
      <el-card  shadow="never" style="border:none; margin-bottom: 5px;">
        <el-row class="bg-white text-center">
            <div class="pull-left main-filters">
              <el-input size="small" v-model="search" placeholder="Search" 
                    class="search round small pull-left" @change="filterChanged"/>

            </div>

            <div class="pull-left main-filters" style="margin: 6px 0px 0px 15px">
              <el-checkbox v-model="clockSetting.restrict_business_hours" @change="saveClockSettings"> 
                Restrict to Business Hours
              </el-checkbox>
            </div>
            
            <div>
              <el-select class="filter small no-border pull-right" placeholder="Status" 
                         v-model="filterRole" @change="filterChanged">
                  <el-option label="All" value=""/>
                  <el-option label="Accountant" value="r_accountant"/>
                  <el-option label="Administrators" value="r_admin"/>
                  <el-option label="Developer" value="r_developer"/>
                  <el-option label="Marketer" value="r_marketer"/>
                  <el-option label="Staff" value="r_staff"/>
                  <el-option label="Team Member" value="r_team"/>
              </el-select>
            </div>
        </el-row>
      </el-card>

      <el-card shadow="never" class="apps-list-table">
        <!-- table -->
        <el-row>
          <el-col>    
            <vcl-table v-if="loadingAccounts"></vcl-table>

            <el-table :data="accounts" :default-sort="sort" @sort-change="sortChanged"  v-else>
              <el-table-column prop="fullname" label="Name" width="250" sortable="custom"/>
              <el-table-column prop="roleName" label="Role"  sortable="custom"/>
              <el-table-column fixed="right" label="Clockable" width="120">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.hasClock" @change="setClockable(scope.row)"></el-switch>
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
          @current-change="loadAccounts"
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
        loadingAccounts: false,
        accounts: [],
        search: "",
        selectAll: false,
        filterRole: '',
        sort: {},
        total_records: 0,
        page_size: 0,
        current_page: 1,
        clockSetting: {
          restrict_business_hours: false
        },
        clockPermission: {},
        hasClock: []
      };
    },
    created() {
      this.loadClockPermission();
      this.loadClockSettings();
    },
    methods: {
      filterChanged() {
        this.current_page = 1;
        this.loadAccounts();
      },
      loadAccounts() {
        this.loadingAccounts = true;

        //add filter query here
        let whereQuery = {active: true};
        let orderQuery = '';

        if(this.filterRole !== ''){
          whereQuery.role = this.filterRole;
        }else{
          whereQuery.role = { neq: 'r_customer' };
        }

        if(this.search !== ''){
          let pattern = {like: '.*' + this.search + '.*', options: "i"};
          whereQuery.or = [
            {first_name: pattern},
            {last_name: pattern}
          ];
        }


        if (this.sort.prop && this.sort.order) {
          orderQuery = this.sort.prop;
          if (this.sort.order === 'ascending') {
            orderQuery += ' ASC';
          } else {
            orderQuery += ' DESC';
          }
        }else{
          orderQuery = "created_at ASC"
        }

        this.axios.get('/companies/current/accounts/',
        { params:
            { 
              page: this.current_page,
              filter: 
                { 
                  where: whereQuery,
                  order: orderQuery
                }
            }
          }
        )
        .then((accounts) => {
          accounts.data.data.forEach(account => {
            account.hasClock = this.getClockable(account.permissionList);
          });
          this.accounts = accounts.data.data;
          this.loadingAccounts = false;

          if (accounts.data.meta) {
            this.page_size = accounts.data.meta.itemsPerPage;
            this.total_records = accounts.data.meta.totalItemCount;
          }
        })
        .catch((error) => {
          this.loadingAccounts = false;
        });
      },
      loadClockPermission(){
        this.axios.get('/permissions/list')
        .then((permissions) => {
          if(permissions.data && permissions.data.length > 0){
            permissions.data.forEach(element => {
              if(element.resource === 'can_clock'){
                element.active = true;
                element.access = true;
                this.clockPermission = element;
              }
            });
            this.loadAccounts();
          }
        })
        .catch((error) => {
        });
      },
      loadClockSettings(){
        //fetch the business hour option
        this.axios.get('/companies/current/clockSetting/')
        .then((clockSetting) => {
          if(clockSetting.data){
            this.clockSetting = clockSetting.data;
          }
        })
        .catch((error) => {
        });
      },
      saveClockSettings(){
        if(this.clockSetting.id){
          this.axios.patch('/clock_settings/'+this.clockSetting.id,
            {restrict_business_hours: this.clockSetting.restrict_business_hours})
            .then(clockSetting => {

            })
            .catch(error =>{

            });
        }else{
          this.axios.post('companies/current/clockSetting/',this.clockSetting)
            .then(clockSetting => {
              this.clockSetting = clockSetting.data;
            })
            .catch(error =>{

            });
        }
      },
      hasClockPermission(list){
        var resource = this.clockPermission.resource;
        return list.filter(function(value, index, arr){
            return value.resource === resource;
          }).length > 0;
      },
      setClockable(account){
        var isClockable = false;
        if(!this.hasClockPermission(account.permissionList)){
          account.permissionList.push(this.clockPermission);
        }else{
          isClockable = this.getClockable(account.permissionList);
        }

        account.permissionList = account.permissionList.filter((value, index, arr) => {
          if(value.resource === this.clockPermission.resource){
              value.active = !isClockable;
              value.access = !isClockable;
          }
          return true;
        });
        //save it
        this.axios.patch('/accounts/'+ account.id,{
          permissionList: account.permissionList
        })
        .then(response => {
          //this.loadAccounts();
        })
        .catch(error=>{

        });
      },
      getClockable(list){
        var resource = this.clockPermission.resource;
        return list.filter(function(value, index, arr){
            return value.resource === resource && value.access && value.active;
          }).length > 0;
      },
      sortChanged( { column, prop, order }){
        this.sort = {prop: prop, order: order};
        this.current_page = 1;
        this.loadAccounts();
      }
    }
  };
</script>

<style scoped lang="scss">
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
