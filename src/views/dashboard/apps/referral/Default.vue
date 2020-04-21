<template>
  <el-container>
    <el-row class="full-width">
      <div class="title">
        <h4>Reward Campaigns</h4>
        <span>Create customizable reward campaigns for your customers.<br/></span>
        <span>{{ }}</span>
        <el-row>
          <el-col :offset="7" :span="5">
            <span class="card-details"  v-if="$can('manage', 'role_customer')">Referral Code: <b>{{ referralInfo.referral_code }}</b></span>
          </el-col>
          <el-col :span="6">
            <span v-if="$can('manage', 'role_customer') &&  referralInfo.pending_referrals">{{ referralInfo.pending_referrals }} pending referrals<br/></span>
          </el-col>
        </el-row>
        <el-row v-if="$can('manage', 'role_customer')">
          <!-- <el-link @click="$router.push({name: 'booking_with_referral'})" target="_blank">{{ referral_link }}</el-link> -->
          <router-link  :to="{path: relative_referral_link}">
            {{ full_referral_link }}
          </router-link>
          <a class="card-details"><i></i></a>
        </el-row>
      </div>

      <el-card  shadow="never" style="border:none; margin-bottom: 5px;">
        <!-- Filter for admin goals -->
        <el-row v-if="$can('manage', 'role_admin')" class="bg-white row-filter full-width"> 

          <el-button class="pull-right" @click="goalForm('create')" type="primary" size="small" round>
            Create a Campaign
          </el-button>

          <el-button class="pull-right" @click="$router.push({ name: 'dashboard_settings_emails', params: { filter: 'apps' }})" type="text"  style="margin-right: 25px;">
            <u>View Emails</u>
          </el-button> 

          <el-input size="small" v-model="search" placeholder="Search" 
                    class="search round small pull-left" @change="filterChanged"/>


          <el-select class="filter small no-border pull-left" placeholder="All" v-model="filter" @change="filterChanged">
            <el-option key="all" label="All" value="all">All</el-option>
            <el-option key="active" label="Active" value="active">Active</el-option>
            <el-option key="inactive" label="Inactive" value="inactive">Inactive</el-option>
            <el-option v-for="c in campaignTypes" :key="c.title" :label="c.title" :value="c.id">{{ c.title }}</el-option>
          </el-select> 


        </el-row>

        <!-- Filter for customer goals -->
        <el-row v-if="$can('manage', 'role_customer')" class="bg-white row-filter">
          <el-input size="small" v-model="search" placeholder="Search" 
            class="search round small pull-left" @change="filterChanged"/>

          <el-select class="filter small no-border pull-left" placeholder="All" v-model="filter" @change="filterChanged">
            <el-option key="all" label="All" value="all">All</el-option>
            <el-option v-for="c in campaignTypes" :key="c.title" :label="c.title" :value="c.id">{{ c.title }}</el-option>
          </el-select>

        </el-row>
      </el-card>

      <el-card shadow="never" class="app-sections apps">
        <el-row :gutter="40" v-loading="loading">

          <!-- Display the goals available based on filter params -->
          <el-col :sm="8" :md="8" :xs="24" v-for="n in goalsInfos" :key="n.id">
            <el-card v-if="n.referralCampaign && n.referralCampaign.active && !($can('manage', 'role_customer') && !n.active) && hasTags(n)">
              <div class="app-description">
                <span style="font-weight: bold;">Type: {{ n.title }}</span><br/>
                <div class="card-details">{{n.referralCampaign.title +' - '+ n.referralCampaign.description }}</div><br/>
                <el-row>
                  <el-col :span="12">
                    <span class="card-details" style="font-weight: bold;">Objectives:</span><br/>
                    <span class="card-details" v-if="n.time && n.time !== 0">{{ printKPI(n.referralCampaign.unit,n.time)  }}<br/></span>
                    <span class="card-details" v-if="n.money && n.money !== 0">{{ printKPI(n.referralCampaign.unit,n.money)  }}<br/></span>
                    <span class="card-details" v-if="n.count && n.count !== 0">{{ printKPI(n.referralCampaign.unit,n.count)  }}<br/></span>
                  </el-col>
                  <el-col :span="12">
                    <span class="card-details" style="font-weight: bold;">Reward:</span><br/>
                    <span class="card-details">{{$currency +' '+ n.reward_amount }}</span>
                  </el-col>
                </el-row>
                
                <el-row>
                  <div class="card-details"><br/>{{ getMiscDetails(n) }}<br/></div>
                  <span class="card-details" style="font-weight: bold;" v-if="$can('manage', 'role_customer') && n.referralAchievements.length>0">{{ " Current Progress: "+ getKPI(n)}}</span>
                </el-row>
              </div>

              <!-- footer for customer view -->
              <div class= "el-card__footer" v-if="$can('manage', 'role_customer')">
                <el-divider></el-divider>
                <el-row>
                    <el-button class="pull-right"  type="primary" size="mini" @click="record(n.id,'customer_apps_referral_list')" round>View Record</el-button>
                </el-row>
              </div>

              <!-- footer for admin view -->
              <div class= "el-card__footer" v-else>
                <el-row>
                  <el-button class="pull-right" type="text" size="small" @click="record(n.id,'apps_referral_list')"><u>View Customers</u></el-button>
                </el-row>
                <el-divider></el-divider>
                <el-row>
                  <el-button class="pull-right" type="primary" size="small" v-if="n.active" @click="toggle(n.id,false)" round>Active</el-button>
                  <el-button class="pull-right" type="danger" size="small" v-else @click="toggle(n.id,true)" round>Activate</el-button>

                  <el-button class="pull-left" type="text" size="small" v-if="!n.active" @click="settings(n)"><u>Customize</u></el-button>
                  
                  </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
        <!-- Dialog -->

        <el-dialog :title="isNewGoal ? 'New Campaign': 'Edit Campaign'" :visible.sync="showGoalForm" width="30%"  append-to-body center>
          <el-form label-width="120px" label-position="top" size="mini">

            <el-form-item label="Title: ">
              <el-input v-model="new_goal.title"></el-input>
            </el-form-item>
            <el-row>
              <el-col :span="11">
                <el-form-item label="Campaign Type: ">
                  <!-- if no flavor -->
                  <el-select v-if="isNewGoal" v-model="new_goal.referralCampaignId" placeholder="select a campaign type">
                    <el-option v-for="c in campaignTypes" :label="c.title" :value="c.id" :key="c.id">{{ c.title }}</el-option>
                  </el-select>

                  <!-- if flavor -->
                  <el-select v-else v-model="new_goal.referralCampaignId" placeholder="select a campaign type" disabled>
                    <el-option v-for="c in campaignTypes" :label="c.title" :value="c.id" :key="c.id">{{ c.title }}</el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="11" :offset="1" v-if="showKPIField('time') || showKPIField('money') || showKPIField('count')">
                <el-form-item :label="getGoalString(new_goal.referralCampaignId)">
                  <el-input-number  v-if="showKPIField('time')" size="small" v-model="new_goal.time" :min="1">
                  </el-input-number>
                  <el-input-number v-if="showKPIField('money')" size="small" v-model="new_goal.money" :min="1">
                  </el-input-number>
                  <el-input-number v-if="showKPIField('count')" size="small" v-model="new_goal.count" :min="1">
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider></el-divider>

            <el-row>
              <el-col :span="24">
                <el-form-item label="Until Date">
                  <el-date-picker :picker-options="pickerOptions" type="date" placeholder="Pick a date" autocomplete="off" v-model="new_goal.until_date" style="width: 100%;" :min="Date.now()"></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item :label="'Reward ' +$currency">
                  <el-input-number size="small" v-model="new_goal.reward_amount" :min="1"></el-input-number>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="Campaign Period (Days)">
                      <el-input-number size="small" v-model="new_goal.period" :min="0"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="Repeat">
                  <el-switch v-model="new_goal.repeat"></el-switch>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="No of Repeats" v-if="new_goal.repeat">
                  <el-input-number size="small" v-model="new_goal.max_repeat" :min="0"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="Tag">
                  <tags v-model="new_goal.tagIds"></tags>
                </el-form-item>
              </el-col>

              <el-col :span="12" v-if="isNewGoal">
                <el-form-item label="Active">
                  <el-switch v-model="new_goal.active"></el-switch>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item>
              <el-button type="primary" @click="saveGoal()" round>Save</el-button>
              <el-button @click="showGoalForm = false" round>Cancel</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
    </el-row>
  </el-container>
</template>

<script>

  import Tags from "../../../../components/Tags";

  export default {
    name: 'Home',
    components: {
        Tags
    },
    data() {
      return {
        goalsInfos: [],
        goalsAchievements:[],
        campaignTypes: [],
        search: "",
        filter: "",
        isNewGoal: false,
        loading: true,
        showGoalForm: false,
        pending_referral: 0,
        full_referral_link: "",
        relative_referral_link: "",
        referralInfo: {},
        new_goal:{
          tagIds: []
        },
        former_goal:{},
        pickerOptions: {
          disabledDate(date){
            return date<new Date();
          }
        }
      };
    },
    created() {
      this.loadCampaigns();
      this.loadGoals();
      if(this.$can('manage', 'role_customer')){
        this.getReferralInfo();
      }
    },
    methods: {
      referralLink(){
        var basePath = window.location.href.replace(window.location.pathname,'');
        this.relative_referral_link = "/booking-with-referral?referral_code="+this.referralInfo.referral_code;
        this.full_referral_link = basePath + this.relative_referral_link;  
      },
      loadCampaigns(){
        this.axios.get('/referral_campaigns/active-campaigns')
          .then((response) => {
            this.campaignTypes = response.data;
          })
          .catch(function (error) {
            
          });
      },
      //Dialog loading with the correct goal information i.e. blank or editting goal
      goalForm(show){
        switch(show){
          case 'create':
            this.isNewGoal = true;
            this.new_goal = {
              title: "",
              referralCampaignId: "",
              time: 0,
              money: 0,
              count: 0,
              period: 0,
              reward_amount: 0,
              repeat: false,
              max_repeat: 0,
              until_date: null,
              tagIds:[],
              active: false
            }
            break;
          case 'edit':
            this.former_goal = this.new_goal;
            this.isNewGoal = false;
            break;
        }
        this.showGoalForm = true;
      },
      //Return the goal string to display for the form
      getGoalString(id){
        return this.campaignTypes.find((value, index, array) => {
                            return value.id === id;
                          }).unit;
      },
      //display the time, count and/or money fields in the goal form
      showKPIField(type){
        if(!this.new_goal.referralCampaignId || this.new_goal.referralCampaignId===""){
          return false;
        }else{
          var campaign = this.campaignTypes.find((value, index, array) => {
                            return value.id === this.new_goal.referralCampaignId;
                          });
          return campaign.type === type;
        }
      },
      //display the progress of a customer
      getKPI(goal){
         if(goal.referralAchievements[0]){
          var kpi_pretty = "";
          kpi_pretty = goal.referralCampaign.time_active ? this.RoundKpi(goal.referralAchievements[0]).time +" "+goal.referralCampaign.unit+" " : "";
          kpi_pretty += goal.referralCampaign.money_active ? this.$currency +" " + this.RoundKpi(goal.referralAchievements[0]).money +" " : "";
          kpi_pretty += goal.referralCampaign.count_active ? this.RoundKpi(goal.referralAchievements[0]).count +" "+ goal.referralCampaign.unit : "";
          return kpi_pretty;
         }
      },
      saveGoal(){
        if(this.isNewGoal){
          this.createGoal((message,type)=>{
              this.$message({
                          type: type,
                          message: message
                        });
            });
        }else{
          this.EditGoal((message,type)=>{
            this.$message({
                        type: type,
                        message: message
                      });
          });
        }
      },
      createGoal(alert) {
        this.axios.post('/companies/current/referralGoals',this.new_goal)
        .then((response)=>{
          this.loadGoals();
          this.showGoalForm = false;
          alert('Saved','success');
        })
        .catch((error)=>{
          this.showGoalForm = false;
          alert('Failed','error');
        });
      },
      EditGoal(alert){
        var edited_goal = {
          title: this.new_goal.title,
          time: this.new_goal.time,
          money: this.new_goal.money,
          count: this.new_goal.count,
          referralCampaignId: this.new_goal.referralCampaignId,
          until_date: this.new_goal.until_date,
          repeat: this.new_goal.repeat,
          period: this.new_goal.period,
          reward_amount: this.new_goal.reward_amount,
          tagIds: this.new_goal.tagIds
        }

        if(edited_goal.repeat){
          edited_goal.max_repeat = this.new_goal.max_repeat;
        }else{
          edited_goal.max_repeat = 0;
        }

        this.axios.patch('/referral_goals/'+this.new_goal.id,edited_goal)
        .then((response) => {
          this.loadGoals();
          this.showGoalForm = false;
          alert('Saved','success');
        })
        .catch((error) => {
          this.showGoalForm = false;
          alert('Failed','error');
        })
      },      
      settings(goal){
          this.new_goal = goal;
          this.goalForm('edit');
      },
      loadGoals(){
        let whereQuery = {};
        this.loading = true;

        if (this.search !== "") {
          let pattern = {like: '.*' + this.search + '.*', options: "i"};
          whereQuery.title = pattern;
        }
        if(this.filter !== "" && this.filter !== "all"){
          switch(this.filter){
            case "active":
              whereQuery.active = true;
              break;
            case "inactive":
              whereQuery.active = false;
              break;
            default:
              whereQuery.referralCampaignId = this.filter;
              break;
          }
        }

        this.axios.get('/companies/current/referralGoals',
          { params: 
            { filter: 
              { include: ["referralCampaign",
                        { relation: "referralAchievements",
                          scope:   {
                            where: {status: "active",accountId: this.$auth.user().id },
                            order: "DESC",
                            limit: 1
                          }
                        }],
                where: whereQuery
              }
            }
          }
        )
        .then((response)=>{
          this.goalsInfos = response.data;
          this.loading = false;
        })
        .catch((error)=>{
          this.goalsInfos = [];
          this.loading = false;
        });
      },
      RoundKpi(data){
        data.time = Math.floor(data.time);
        data.count = Math.floor(data.count);
        data.money = Math.floor(data.money);

        return data;
      },
      filterChanged() {
        this.loadGoals();
      },
      record(id,list_name){
        this.$router.push({name: list_name, params: {id: id}})
      },
      printKPI(unit,kpi){
        if(unit === "$currency"){
          return this.$currency+" "+kpi;
        }else{
          return kpi+" "+unit;
        }
      },
      hasTags(goal){
        if(goal.tagIds.length === 0 || this.$can('manage', 'role_admin')){
          return true;
        }
        let tagmatches = goal.tagIds.filter(x => this.$auth.user().tagIds.includes(x.toString()));
        if(tagmatches.length === 0){
          return false;
        }else{
          return true;
        }
      },
      toggle(id,toggleTo){
        if(!toggleTo){
          this.$confirm('Deactivating a campaign will permenantly interrupt any customer progress. Continue?', 'Warning', {
            confirmButtonText: 'Proceed',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
          this.axios.post('/referral_goals/toggle-active/'+id)
            .then((response) => {
              this.loadGoals();
            })
            .catch((error) => {
              this.loadGoals();
            })
          }).catch((err) => {
          });
        }else{
          this.$confirm('Activating a campaign will disable customization. Continue?', 'Warning', {
            confirmButtonText: 'Proceed',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
          this.axios.post('/referral_goals/toggle-active/'+id)
            .then((response) => {
              this.loadGoals();
            })
            .catch((error) => {
              this.loadGoals();
            })
          }).catch((err) => {
          });
        }
      },
      getReferralInfo(){
          this.axios.get('/accounts/me/referralInfo')
            .then(res => {
              this.referralInfo = res.data;
              this.referralLink();
            })
            .catch()
      },
      getMiscDetails(goal){
        let misc_details = "";
        if(goal.period>0){
          misc_details += "Within a "+goal.period+" days period.";
        }
        if(goal.until_date){
          misc_details += " Expires on "+ this.$moment( goal.until_date ).format("Do MMMM, YYYY")+".";
        }
        if(goal.repeat){
          misc_details += goal.max_repeat > 0 ? " Repeats "+ goal.max_repeat +" times." : " Always Repeats.";
        }

        return misc_details;
      }
    }
  };
</script>

<style  scoped lang="scss">
  .el-dialog{
    .el-form label {
        margin-top: 13px;
        font-size: 10px;
    }
  }

  .search {
    width: 200px;
    margin-right: 10px;
  }

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

  .app-sections.apps{
    .app-description{
      font-size:15px;
      margin-bottom:10px;
      height: 220px;
      width: 350px;
      text-align: left;

      .card-details{
        font-size: 12px;
        width: 300px;
      }
    }

    .el-card__footer {
      bottom: 0;

      .pull-center{
        margin-left: 40px; 
      }
    }
  }
</style>
