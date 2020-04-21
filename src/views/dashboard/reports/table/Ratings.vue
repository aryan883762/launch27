<template>
<el-container>
  <el-card shadow="never" class="report-table full-width">
    <el-row>
      <el-form :inline="true">
        <!-- Filters -->
        <el-col :xs="24" :sm="24" :md="24">

          <!-- export button -->
          <el-form-item class="pull-right">
            <el-button type="primary" size="mini" round @click="Export()" v-if="!exporting">export</el-button>
            <el-button type="" size="mini" round disabled v-else>exporting</el-button>
          </el-form-item>

          <!-- location -->
          <el-form-item label="Location" class="pull-left">
            <company-locations :return-object="false" :multiple="true" v-model="booking_location" @change="loadData"></company-locations>
          </el-form-item>

          <!-- team -->
          <el-form-item label="Team" class="pull-right">
            <el-select v-model="booking_team" @change="loadData">
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

    <!-- table -->
    <el-row>
      <el-col>    
        <vcl-table v-if="loading"></vcl-table>

        <el-table :data="bookings" max-height="500" v-else>
          <el-table-column label="Name">
            <template slot-scope="scope">
              <account-avatar :account="{id : scope.row.accountId, avatar : scope.row.avatar, fullname: scope.row.account.first_name+' '+scope.row.account.last_name}" :size="32" body-class="pull-left"></account-avatar>
              <div style="margin-left: 10px;display:inline-block;">
                <span>{{scope.row.account.first_name+' '+scope.row.account.last_name}}</span>
              </div>              
            </template>
          </el-table-column>
          <el-table-column label="rating" prop="rating"/>
          <el-table-column label="Teams">
            <template slot-scope="scope">
              <span v-for="member in scope.row.teams" :key="member.id">
                <div style="margin-left: 10px;display:inline-block;">
                  <span>{{member.name+AddComma(scope.row.members,member) }}</span>
                </div>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Members">
            <template slot-scope="scope">
              <span v-for="member in scope.row.members" :key="member.id">
                <div style="margin-left: 10px;display:inline-block;">
                  <span>{{member.first_name+' '+member.last_name+AddComma(scope.row.members,member) }}</span>
                </div>
              </span>
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
import CompanyLocations from "../../../../components/CompanyLocations.vue";

  export default {
    props: {
        dateRange: {
            type: Array,
            required: true
        }
    },
    components: {
      VclTable,
      AccountAvatar,
      CompanyLocations
    },
    data() {
      return {
        bookings: [],
        bookingData: [],
        loading: false,
        exporting: false,
        booking_location: false,
        booking_team: 'all',
        locations: [],
        teams: [],
        //include: [{relation: "rating",scope: {include: ["account","members","teams"]}}]
        include: [{rating: ["account","members","teams"]}]
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
        this.axios.get("/companies/current/teams", {
          params: {
                  filter: {
                      order: 'created_at DESC'
                  }
              }
          })
        .then(res => {
            this.teams = res.data;
        });
      },
      loadData() {
        this.loading = true;

        let whereQuery = {};
        
        whereQuery.locationId = {inq: this.booking_location};

        let paramsObj = {
            from: this.$moment(this.dateRange[0]).startOf('day').toISOString(),
            to: this.$moment(this.dateRange[1]).endOf('day').toISOString(),
            type: 'bookings',
            where: whereQuery,
            include: this.include
        }
          
        if(this.booking_team && this.booking_team !== 'all'){
          paramsObj.targetType = 'team';
          paramsObj.targetTypeId = this.booking_team;
        }

        this.axios.get('/bookings/schedule', {
            params: paramsObj
        })
        .then(res => {
            this.bookingData = res.data;
            this.FormatBookingData();
        })
        .finally(() => {
            this.loading = false;
        });
      },
      FormatBookingData(){
        this.bookings = [];
        if(this.bookingData){
          this.bookingData.forEach(element => {
            if(element.rating){
              this.bookings.push(element.rating);
            }
          });
        }
      },
      AddComma(ArrayObj,obj){
        if(ArrayObj && ArrayObj.length>0 && obj){
          return ArrayObj[ArrayObj.length-1].id.toString() === obj.id.toString() ? "" : ", ";
        }else{
          return "";
        }
      },
      Export(){
        this.exporting = true;

        let whereQuery = {};
        
        whereQuery.locationId = {inq: this.booking_location};

        let paramsObj = {
            from: this.$moment(this.dateRange[0]).startOf('day').toISOString(),
            to: this.$moment(this.dateRange[1]).endOf('day').toISOString(),
            type: 'ratings',
            where: whereQuery,
            include: this.include,
            accountId: this.$auth.user().id
        }
          
        if(this.booking_team && this.booking_team !== 'all'){
          paramsObj.targetType = 'team';
          paramsObj.targetTypeId = this.booking_team;
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