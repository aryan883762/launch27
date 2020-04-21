<template>
  <el-container v-loading="loadingGoal && loadingAchievement">
    <el-row class="full-width">
      
      <!-- Header -->
      <div class="title">
        <h4>{{ goal.title }}</h4>
        <span>{{ goal.referralCampaign.description }}</span><br/>
        <span>{{"Completion Reward: "+$currency +" "+ goal.reward_amount}}</span>
      </div>

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

              <el-select class="filter small no-border pull-right" placeholder="Status" 
                         v-model="filterStatus" @change="filterChanged">
                <el-option label="All" value="all">All</el-option>
                <el-option label="Active" value="active">Active</el-option>
                <el-option label="Inactive" value="inactive">Inactive</el-option>
                <el-option label="Paid" value="paid">Paid</el-option>
                <el-option label="Completed" value="completed">Completed</el-option>
                <el-option label="Failed" value="failed">Failed</el-option>

              </el-select> 

               <el-select class="filter small no-border pull-right" placeholder="Name" 
                         v-model="filterName" @change="filterChanged" filterable>
                <el-option label="All" value="all">All</el-option>
                <el-option v-for="account in accounts" :label="account.fullname" :value="account.id" :key="account.id"/>
              </el-select> 
        </el-row>
      </el-card>

      <el-card shadow="never" class="apps-list-table">
        <!-- table -->
        <el-row>
          <el-col>    
            <vcl-table v-if="loadingAchievementOnly"></vcl-table> 
            <el-table :data="achievements" :default-sort="sort" @sort-change="sortChanged"  v-else>
              <el-table-column label="Name" >
                <template slot-scope="scope">
                  <span>{{scope.row.referralInfo.accountname}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="Status" sortable="custom" />
              <el-table-column prop="count" :label="getUnit(goal.referralCampaign.unit)" sortable="custom" v-if="goal.referralCampaign.count_active">
                <template slot-scope="scope">
                  <span>{{RoundKpi(scope.row).count}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="time"  :label="getUnit(goal.referralCampaign.unit)" sortable="custom" v-if="goal.referralCampaign.time_active">
                <template slot-scope="scope">
                  <span>{{RoundKpi(scope.row).time}}</span>
                </template>
              </el-table-column>
              <el-table-column  prop="money"  :label="getUnit(goal.referralCampaign.unit)"  sortable="custom" v-if="goal.referralCampaign.money_active">
                <template slot-scope="scope">
                  <span>{{RoundKpi(scope.row).money}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="reward_amount" :label="'Reward '+$currency" sortable="custom"/>
              <el-table-column prop="start_date" label="Start Date" :formatter="dateFormatter" sortable="custom"/>
              <el-table-column prop="end_date" label="End Date" :formatter="dateFormatter" sortable="custom"/>
            </el-table>
          </el-col>
        </el-row>

        <el-row class="stats-row" :gutter="0">
          <el-col :sm="4" :md="4" :xs="12" class="first">
            <span class="stats-number _first">{{ achievementStats.total }}</span>
            <label>Total Achievements</label>
          </el-col>
          <!--
            <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth" v-if="goal.referralCampaign.money_active">
              <span class="stats-number _fourth">{{ $currency }}{{ achievementStats.money }}</span>
              <label>Total Amount</label>
            </el-col>

            <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth" v-if="goal.referralCampaign.count_active">
              <span class="stats-number _fourth">{{ achievementStats.count }}</span>
              <label>Total Counts</label>
            </el-col>

            <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth" v-if="goal.referralCampaign.time_active">
              <span class="stats-number _fourth">{{ achievementStats.time }}</span>
              <label>Total Days</label>
            </el-col>
          -->
        </el-row>
      </el-card>
    </el-row>

    <el-col class="pagination-footer">
      <div class="cct">
        <el-pagination
          :current-page.sync="current_page"
          :page-size="page_size"
          :total="total_records"
          @current-change="loadAchievements"
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
        loadingGoal: false,
        loadingAchievement: false,
        loadingAchievementOnly: false,
        goal:{
          title: "",
          referralCampaign: {
            title: "",
            description: ""
          }
        },
        achievements: [],
        search: "",
        dateRange: '',
        filterStatus: '',
        filterName: '',
        showCount: false,
        showMoney: false,
        showTime: false,
        sort: {},
        achievementStats: {
          count: 0,
          time: 0,
          total: 0,
          money: 0
        },
        total_records: 0,
        page_size: 0,
        current_page: 1,
        load_stats: true,
        accounts: []
      };
    },
    created() {
      this.goal_id = this.$route.params.id;
      this.loadGoal(this.goal_id);
      this.loadingAchievement = true;
      this.loadAchievements();
      this.loadAccounts();
    },
    methods: {
      filterChanged() {
        this.current_page = 1;
        // only loading stats if filter has changed
        this.load_stats = true;
        this.loadAchievements();
      },
      loadGoal(id) {
        this.loadingGoal = true;

        this.axios.get('/referral_goals/'+id,
          { params: 
            { filter: 
              { include: ["referralCampaign"] }
            }
          }
        )
        .then((goal_res) => {
          this.goal = goal_res.data;
          this.loadingGoal = false;
        })
        .catch((error) => {
          this.loadingGoal = false;
        });
      },
      RoundKpi(data){
        data.time = Math.floor(data.time);
        data.count = Math.floor(data.count);
        data.money = Math.floor(data.money);

        return data;
      },
      loadAccounts(){

          this.accounts = [];
          this.axios.get('/accounts',{
            params: {
                filter:{
                    where: {
                        active: true,
                        role: 'r_customer'
                        }
                }
            }
          })
          .then(result => {
              this.accounts = result.data;
          })
          .catch(err => {

          });
      },
      loadAchievements(){
        this.loadingAchievementOnly = true;

          //add filter query here
          let whereQuery = {};
          let orderQuery = '';
          whereQuery.referralGoalId = this.goal_id;
          

          if(this.$can('manage', 'role_customer')){
            whereQuery.accountId = this.$auth.user().id;
          }

          if(this.filterStatus !== '' && this.filterStatus !== 'all'){
            whereQuery.status = this.filterStatus;
          }

           if(this.filterName !== '' && this.filterName !== 'all'){
            whereQuery.accountId = this.filterName;
          }

          if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
            whereQuery.start_date = {between: this.dateRange};
          }

          if (this.sort.prop && this.sort.order) {
            orderQuery = this.sort.prop;
            if (this.sort.order === 'ascending') {
              orderQuery += ' ASC';
            } else {
              orderQuery += ' DESC';
            }
          }

          this.axios.get('/companies/current/referralAchievements',
          { params:
            { 
              page: this.current_page,
              filter: 
              { include: ["referralGoal","referralInfo"],
                where: whereQuery,
                order: orderQuery
              }
            }
          })
          .then((achievement_res) => {
            if (achievement_res.data) {
              this.achievements = achievement_res.data.data;

              if (achievement_res.data.meta) {
                this.page_size = achievement_res.data.meta.itemsPerPage;
                this.total_records = achievement_res.data.meta.totalItemCount;
                this.achievementStats.total = achievement_res.data.meta.totalItemCount;
              }
            }
            this.loadingAchievement = false;
            this.loadingAchievementOnly = false;
          })
          .catch((error) =>{
            this.loadingAchievement = false;
            this.loadingAchievementOnly = false;
          });
      },
      getUnit(unit){
        if(unit === "$currency"){
          return this.$currency;
        }else{
          return unit;
        }
      },
      dateFormatter(row, column, cellValue, index) {
        if (cellValue) {
          return this.$moment(cellValue).format("DD / MM / YY");
        } else {
          return "-";
        }
      },
      sortChanged( { column, prop, order }){
        this.sort = {prop: prop, order: order};
        this.current_page = 1;
        this.loadAchievements();
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
