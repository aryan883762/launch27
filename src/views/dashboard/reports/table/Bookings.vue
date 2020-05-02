<template>
<el-container>
  <el-card shadow="never" class="report-table full-width">

    <!-- Filters -->
    <el-row>
      <el-form :inline="true">
        <el-col :xs="24" :sm="24" :md="24">
          <!-- status -->
          <el-form-item label="Status" class="pull-right">
            <el-select v-model="booking_status" multiple  @change="loadData" collapse-tags>
              <el-option label="Active" value="active"/>
              <el-option label="Completed" value="completed"/>
              <el-option label="Cancelled" value="cancelled"/>
            </el-select>
          </el-form-item>

          <!-- Payment Type -->
          <el-form-item label="Type" class="pull-right">
            <el-select v-model="payment_type" @change="loadData">
              <el-option label="All" value="all"/>
              <el-option label="Card" value="card"/>
              <el-option label="Cash" value="cash"/>
              <el-option label="Check" value="check"/>
            </el-select>
          </el-form-item>

          <!-- location -->
          <el-form-item label="Location" class="pull-left">
            <company-locations :return-object="false" :multiple="true" v-model="booking_location" @change="loadData"></company-locations>
          </el-form-item>

          <!-- team -->
          <el-form-item label="Team" class="pull-left">
            <el-select v-model="booking_team" @change="loadData">
              <el-option label="All" value="all">
                  All
              </el-option>
              <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in teams">
                  {{ team.name }}
              </el-option>
            </el-select>
          </el-form-item>

          <!-- Forecasted -->
          <!-- <el-form-item label="Forecasted" class="pull-left">
            <el-checkbox v-model="forecasted" @change="loadData"/>
          </el-form-item> -->
          
          <!-- Promotion -->
          <el-form-item label="Only Promotion" class="pull-left">
            <el-checkbox v-model="promotion" @change="loadData"/>
          </el-form-item>

          <!-- export button -->
          <el-form-item style="margin-top:5px;" class="pull-right">
            <el-button type="primary" size="mini" round @click="Export()" v-if="!exporting">export</el-button>
            <el-button type="" size="mini" round v-else disabled>exporting</el-button>
          </el-form-item>

          <!-- mode button -->
          <el-form-item style="margin-top:5px;" class="pull-right">
            <el-button type="warning" size="mini" round @click="SwitchMode()">{{mode==='daily_summary'?'summary':'full'}}</el-button>
          </el-form-item>
          
        </el-col>
      </el-form>
    </el-row>

    <!-- Total -->
    <el-row :gutter="0" class="stats-row" style="margin-bottom: 20px;">
        <div class="second">
            <span class="stats-number _second">{{mode==='daily_summary' ? bookings.reduce((total,element)=>{return total+element.count},0): full_bookings.length}}</span>
            <label>Total Bookings</label>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="second">
            <span class="stats-number _second">{{$currency}} {{TotalRevenue()}}</span>
            <label>Total Revenue</label>
        </div>
    </el-row>

    <!-- table -->
    <el-row>
      <el-col>    
        <vcl-table v-if="loading"></vcl-table>

        <el-table :data="bookings" v-else-if="mode==='daily_summary'">
          <el-table-column label="Bookings">
            <template slot-scope="scope">
              <span>{{FormatDate(scope.row.service_date ? scope.row.service_date : scope.row._id)}}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" width="120" prop="count" label="Count"/>
          <el-table-column label="Revenue"  fixed="right" width="120">
            <template slot-scope="scope">
              <span>{{$currency}} {{scope.row.revenue.toFixed(2)}}</span>
            </template>
          </el-table-column>
        </el-table>

        <el-table :data="full_bookings" v-else-if="mode==='full_booking'">
          <el-table-column label="Name" fixed="left">
            <template slot-scope="book">
              <account-avatar :account="{id : book.row.accountId, avatar : book.row.avatar, fullname: book.row.account.first_name+' '+book.row.account.last_name}" :size="32" body-class="pull-left"></account-avatar>
              <div style="margin-left: 10px;display:inline-block;">
                <span>{{book.row.account.first_name+' '+book.row.account.last_name}}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Service Date" fixed="left" width="120">
            <template slot-scope="book">
              <span>{{ FormatDate(book.row.service_date) }}</span>
              </template>
          </el-table-column>
          <el-table-column label="Service Time"  fixed="left" width="120">
            <template slot-scope="book">
              <span>{{ FormatTime(book.row.service_date) }}</span>
              </template>
          </el-table-column>
          <el-table-column  label="Payment Type" fixed="left" width="120" prop="payment_type"/>
          <el-table-column fixed="right" label="Team">
            <template slot-scope="book">
              <span v-for="team_assignment in book.row.team_assignments" :key="team_assignment.id">
                <div style="margin-left: 10px;display:inline-block;">
                  <span>{{team_assignment.team.name+AddComma(book.row.team_assignments,team_assignment) }}</span>
                </div>
              </span>
              </template>
          </el-table-column>
          <el-table-column fixed="right" width="120" label="Status">
            <template slot-scope="book">
              <span>{{ book.row.status }}</span>
              </template>
          </el-table-column>
          <el-table-column fixed="right" width="100" label="Revenue">
            <template slot-scope="book">
              <span>{{$currency}} {{ book.row.status !== 'cancelled' ? book.row.charge.total_after_tax.toFixed(2) : 0}}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <!-- <el-col class="pagination-footer">
          <div class="cct">
              <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadData" background layout="total, prev, pager, next"></el-pagination>
          </div>
      </el-col> -->
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
        full_bookings: [],
        loading: false,
        exporting: false,
        booking_location: false,
        booking_team: 'all',
        booking_status: ['active','completed'], //active completed cancelled
        teams: [],
        include: ['account','charge',{relation: "team_assignments",scope: {include: "team"}}],
        forecasted: false,
        promotion: false,
        payment_type: 'all',
        current_page: 1,
        page_size: 2,
        total_records: 0,
        mode: "full_booking"
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
    },
    methods: {
      SwitchMode(){
        this.mode = this.mode==='daily_summary'? 'full_booking':'daily_summary'
        this.loadData();
      },
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
        (async()=>{
          try{
            this.loading = true;
            let temp_switch = false;

            if(this.booking_team && this.booking_team !== 'all' && this.mode === "daily_summary"){
              this.mode = "full_booking";
              temp_switch = true;
            }

            if(this.mode === "daily_summary"){
              if(!this.forecasted){
                let data =  await this.$root.$aggregate('bookings', this.dateRange[0], this.dateRange[1], 'date', this.GetWhere(false))
                this.bookings = data.results;
              }else{
                let data =  await this.$root.$aggregate('bookings', this.dateRange[0], this.dateRange[1], 'forecast', this.GetWhere(true))
                this.bookings = data;
              }
            }else if(this.mode === "full_booking"){
              let paramsObj = {
                  //filter:{limit: this.page_size,skip:this.current_page},
                  from: this.$moment(this.dateRange[0]).startOf('day').toISOString(),
                  to: this.$moment(this.dateRange[1]).endOf('day').toISOString(),
                  type: 'bookings',
                  forecasted: this.forecasted,
                  where: this.GetWhere(true),
                  include: this.include
              }
          
              if(this.booking_team && this.booking_team !== 'all'){
                paramsObj.targetType = 'team';
                paramsObj.targetTypeId = this.booking_team;
              }
              let result = await this.axios.get('/bookings/schedule', {params: paramsObj});
              if(result && result.data){
                if(this.forecasted)
                  result.data = result.data.filter(x=>x.forecasted);
                if(temp_switch){
                  //aggregate stuff
                  let new_result=[];
                  for(let i=0;i<result.data.length;i++){
                    let booking = result.data[i];
                    let index = new_result.findIndex((summary) => summary.key === this.FormatDate(booking.service_date));
                    console.log(index);
                    
                    if(index !== -1) {
                        new_result[index].count += 1;
                        new_result[index].cash_count += booking.payment_type === 'cash' ? 1 : 0;
                        new_result[index].card_count += booking.payment_type === 'card' ? 1 : 0;
                        new_result[index].check_count += booking.payment_type === 'check' ? 1 : 0;
                        new_result[index].cash_amount += booking.payment_type === 'cash' && booking.status !== 'cancelled' ? Number(booking.charge.total_after_tax) : 0;
                        new_result[index].card_amount += booking.payment_type === 'card' && booking.status !== 'cancelled' ? Number(booking.charge.total_after_tax) : 0;
                        new_result[index].check_amount += booking.payment_type === 'check' && booking.status !== 'cancelled' ? Number(booking.charge.total_after_tax) : 0;
                        new_result[index].revenue += booking.status !== 'cancelled' ? Number(booking.charge.total_after_tax) : 0;
                    }else{
                        new_result.push({
                            key: this.FormatDate(booking.service_date),
                            _id: booking.service_date,
                            count: 1,
                            cash_count: booking.payment_type === 'cash' ? 1 : 0,
                            card_count: booking.payment_type === 'card' ? 1 : 0,
                            check_count: booking.payment_type === 'check' ? 1 : 0,
                            cash_amount: booking.payment_type === 'cash' && booking.status !== 'cancelled' ? Number(booking.charge.total_after_tax) : 0,
                            card_amount: booking.payment_type === 'card' && booking.status !== 'cancelled' ? Number(booking.charge.total_after_tax) : 0,
                            check_amount: booking.payment_type === 'check' && booking.status !== 'cancelled' ? Number(booking.charge.total_after_tax) : 0,
                            revenue: booking.status !== 'cancelled' ? Number(booking.charge.total_after_tax) : 0
                        });
                    }
                  }
                  this.mode = "daily_summary";
                  this.bookings = new_result;
                  return;
                }

                this.full_bookings = result.data;
              }
            }
          }catch(err){
            console.log(err);
          }finally{
            this.loading = false;
          }
        })()
      },
      FormatBookingData(){
        this.bookings = [];
        if(this.bookingData){
          this.bookingData.forEach(element => {
            if(element.charge){
              let added = false;
              for(let i=0;i<this.bookings.length;i++){
                if(this.bookings[i].service_date === this.$moment(element.service_date).startOf('day').format(this.$date_format)){
                  this.bookings[i].count += 1;
                  if(this.bookings[i].status !== 'cancelled'){
                    this.bookings[i].revenue += Number(element.charge.total_after_tax);
                  }
                  this.bookings[i].bookings.push(element);
                  added = true;
                  break;
                }
              }
              if(!added){
                this.bookings.push(
                  {
                    service_date: this.$moment(element.service_date).startOf('day').format(this.$date_format),
                    count: 1,
                    revenue: (element.status !== 'cancelled') ? Number(element.charge.total_after_tax) : 0,
                    currency: element.charge.currency_symbol,
                    bookings: [element]
                  });
              }
            }
          });
        }
      },
      TotalRevenue(){
        let revenue = 0;
        if(this.mode === "daily_summary"){
          this.bookings.forEach(element => {
              revenue+=element.revenue;
          });
        }else{
          this.full_bookings.forEach(element=>{
            if(element.status !== 'cancelled')
              revenue += element.charge.total_after_tax
          });
        }
        
        return revenue.toFixed(2);
      },
      FormatDate(date){
        return this.$moment(date).format(this.$date_format);
      },
      FormatTime(date){
        return this.$moment(date).format(this.$time_format);
      },
      AddComma(ArrayObj,obj){
        if(ArrayObj && ArrayObj.length>0 && obj){
          return ArrayObj[ArrayObj.length-1].id.toString() === obj.id.toString() ? "" : ", ";
        }else{
          return "";
        }
      },
      GetWhere(loopBackQuery){
        let whereQuery = {};
        if(!loopBackQuery){
          whereQuery.status = { $in: this.booking_status };
          
          whereQuery.locationId = { $in: this.booking_location};
          
          if(this.payment_type && this.payment_type !== 'all'){
            whereQuery.payment_type = this.payment_type;
          }
          if(this.promotion){
            whereQuery.discount_code ={ $ne: '' };
          }
        }else{
          whereQuery.status = { inq: this.booking_status };

          if(this.payment_type && this.payment_type !== 'all'){
            whereQuery.payment_type = this.payment_type;
          }

          whereQuery.locationId = {inq: this.booking_location};

          if(this.promotion){
            whereQuery.discount_code ={ neq: '' };
          }
        }
        return whereQuery;
      },
      Export(){
        //send call to company report and  return okay when the result are returned from the function
        this.exporting = true;
        let paramsObj = {
            //filter:{limit: this.page_size,skip:this.current_page},
            from: this.$moment(this.dateRange[0]).startOf('day').toISOString(),
            to: this.$moment(this.dateRange[1]).endOf('day').toISOString(),
            type: 'bookings',
            forecasted: this.forecasted,
            where: this.GetWhere(true),
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