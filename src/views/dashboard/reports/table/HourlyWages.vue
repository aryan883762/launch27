<template>
<el-container>
  <el-card shadow="never" class="report-table full-width">
    <!-- Filters -->
    <el-row>
      <el-form :inline="true">
        <el-col :xs="24" :sm="24" :md="24">

          <!-- export button -->
          <el-form-item class="pull-right">
            <el-button type="primary" size="mini" round @click="Export()" v-if="!exporting">export</el-button>
            <el-button type="" size="mini" round disabled v-else>exporting</el-button>
          </el-form-item>
          
          <!-- status -->
          <el-form-item label="Status" class="pull-right">
            <el-select v-model="wage_status" @change="loadData">
              <el-option :value="true" label="Active"></el-option>
              <el-option :value="false" label="Archived"></el-option>
            </el-select>
          </el-form-item>

          <!-- Pay Rate Type -->
          <el-form-item label="Pay Rate Type" class="pull-right">
            <el-select v-model="wage_pay_rate_type" @change="loadData">
              <el-option value="all" label="All"></el-option>
              <el-option value="hourly" label="Hourly"></el-option>
              <el-option value="percent" label="Percent"></el-option>
            </el-select>
          </el-form-item>

          <!-- team -->
          <el-form-item label="Team" class="pull-left">
            <el-select v-model="wage_teamId" @change="loadData" filterable>
              <el-option label="All" value="all">
                  All
              </el-option>
              <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in teams">
                  {{ team.name }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>

    <!-- Total -->
    <el-row :gutter="0" class="stats-row" style="margin-bottom: 20px;">
      <div class="second">
          <span class="stats-number _second">{{$currency}} {{total.earned.toFixed(2)}}</span>
          <label>Earned Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="second">
          <span class="stats-number _second">{{$currency}} {{total.tips.toFixed(2)}}</span>
          <label>Tips Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="fourth">
          <span class="stats-number _fourth">{{$currency}}{{total.adjustments.toFixed(2)}}</span>
          <label>Adjustments Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="third">
          <span class="stats-number _third"> {{$currency}}{{total.due.toFixed(2)}}</span>
          <label>Due Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>

      <div class="fourth">
          <span class="stats-number _fourth">{{$currency}}{{total.paid.toFixed(2)}}</span>
          <label>Paid Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="fourth">
          <span class="stats-number _fourth"> {{total.hours_earned | duration}}</span>
          <label>Hours Earned</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="fourth">
          <span class="stats-number _fourth"> {{total.hours_scheduled | duration}}</span>
          <label>Hours Scheduled</label>
      </div>
    </el-row>

    <!-- table -->
    <el-row>
      <el-col>    
        <vcl-table v-if="loading"></vcl-table>

        <el-table :data="wages" max-height="500" v-else>
            <el-table-column label="Team member" width="200">
              <template slot-scope="scope">
                <account-avatar :account="{id : scope.row.accountId, avatar : scope.row.avatar, fullname: scope.row.name}" :size="32" body-class="pull-left"></account-avatar>
                <div style="margin-left: 10px;display:inline-block;">
                  <span>{{scope.row.name}}</span>
                </div>

              </template>
            </el-table-column>
            <el-table-column label="Earned" width="150">
                <template slot-scope="scope">
                    {{$currency}} {{scope.row.earned ? scope.row.earned.toFixed(2) : 0}}
                </template>
            </el-table-column>
            <el-table-column label="Tips">
                <template slot-scope="scope">
                    {{$currency}} {{scope.row.tips ? scope.row.tips.toFixed(2) : 0}}
                </template>
            </el-table-column>
            <el-table-column label="Adjustments">
                <template slot-scope="scope">
                    {{$currency}} {{scope.row.adjustments ? scope.row.adjustments.toFixed(2) : 0}}
                </template>
            </el-table-column>
            <el-table-column label="Pay Rate">
                <template slot-scope="scope">
                    <span v-if="scope.row.pay_rate_type === 'hourly'">
                         {{ $currency }} {{ scope.row.pay_rate ? scope.row.pay_rate.toFixed(2) : 0}}
                    </span>
                    <span v-else>
                         {{ scope.row.pay_rate ? scope.row.pay_rate : 0 }} % 
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="Due" width="150">
                <template slot-scope="scope">
                    {{$currency}} {{scope.row.dued ? scope.row.dued.toFixed(2) : 0}}
                </template>
            </el-table-column>
            <el-table-column label="Paid">
                <template slot-scope="scope">
                    {{$currency}} {{scope.row.paid ? scope.row.paid.toFixed(2)  : 0}}
                </template>
            </el-table-column>
            <el-table-column label="Hrs Worked">
                <template slot-scope="scope">
                    {{scope.row.hours_worked | duration}}
                </template>
            </el-table-column>
            <el-table-column label="Hrs Scheduled">
                <template slot-scope="scope">
                    {{scope.row.scheduled | duration}}
                </template>
            </el-table-column>
        </el-table>
      </el-col>
    </el-row>

  </el-card>
  </el-container>
</template>
<script>
import {VclTable} from 'vue-content-loading';
import AccountAvatar from "../../../../components/AccountAvatar";

  export default {
    props: {
        dateRange: {
            type: Array,
            required: true
        }
    },
    components: {
      VclTable,
      AccountAvatar
    },
    data() {
      return {
        wages: [],
        loading: false,
        exporting: false,
        wage_teamId: 'all',
        wage_status: true,
        wage_pay_rate_type: 'all',
        teams: [], //teams only
        total: {
          earned: 0,
          tips: 0,
          adjustments: 0,
          due: 0,
          paid: 0,
          hours_earned: 0,
          hours_scheduled: 0
        }
      };
    },
    watch:{
      dateRange(value) {
        if (value[0] && value[1]) {
            this.loadData();
        }
      },
    },
    mounted() {
      this.GetTeams();
      this.loadData();
    },
    methods: {
      GetTeams() {
        this.axios.get("/companies/current/accounts", {
          params: {
                  filter: {
                      where: {role: 'r_team'},
                      order: 'created_at DESC'
                  }
              }
          })
        .then(res => {
            this.teams = res.data;
        });
      },
      loadData() {
        this.loading = true
        this.axios.get('/timesheets/wages', {
            params: {
                page: this.current_page,
                from: this.dateRange[0],
                to: this.dateRange[1],
                status: this.wage_status,
                selected_team: this.wage_teamId,
                pay_rate_type: (this.wage_pay_rate_type === 'all' ? null : this.wage_pay_rate_type)
            }
        })
            .then(res => {
                this.wages = res.data;
                this.total = {
                  earned: 0,
                  tips: 0,
                  adjustments: 0,
                  due: 0,
                  paid: 0,
                  hours_earned: 0,
                  hours_scheduled: 0
                }
                this.wages.forEach(element =>{
                  this.total.earned += Number(element.earned);
                  this.total.tips += Number(element.tips);
                  this.total.adjustments += Number(element.adjustments);
                  this.total.due += Number(element.dued);
                  this.total.paid += Number(element.paid);
                  this.total.hours_earned += Number(element.hours_worked);
                  this.total.hours_scheduled += Number(element.scheduled);
                });
            })
            .catch(err => {

            })
            .finally(() => {
                this.loading = false
            })
      },
      Export(){
        this.exporting = true;
        let paramsObj = {
          page: this.current_page,
          from: this.dateRange[0],
          to: this.dateRange[1],
          status: this.wage_status,
          type: 'wages',
          selected_team: this.wage_teamId,
          pay_rate_type: (this.wage_pay_rate_type === 'all' ? null : this.wage_pay_rate_type),
          accountId: this.$auth.user().id
        }
        this.axios.post('company_reports/export',{params: paramsObj}).then(result=>{
          this.$helpers.successHandle("Report sent to email",this);
          this.exporting = false;
        }).catch(err=>{
          this.$helpers.errorHandle(err,this);
          this.exporting = false;
        })
      }
    }
  };
</script>