<template>
<el-container>
  <el-card shadow="never" class="report-table full-width">
    <el-row>
      <el-form :inline="true">
        <!-- Filters -->
        <el-col :xs="24" :sm="24" :md="24">


          <!-- account -->
          <el-form-item label="Account" class="pull-left">
            <el-select v-model="charge_accountId" @change="loadData" filterable multiple  collapse-tags>
              <el-option :key="account.id" :label="account.first_name+' '+account.last_name" :value="account.id" v-for="account in accounts">
                  {{ account.first_name+' '+account.last_name }}
              </el-option>
            </el-select>
          </el-form-item>

          <!-- export button -->
          <el-form-item class="pull-right">
            <el-button type="primary" size="mini" round @click="Export()" v-if="!exporting">export</el-button>
            <el-button type="" size="mini" round disabled v-else>exporting</el-button>
          </el-form-item>

          <!-- mode button -->
          <el-form-item class="pull-right">
            <el-button type="warning" size="mini" round @click="SwitchMode()">{{mode==='daily_summary'?'summary':'full'}}</el-button>
          </el-form-item>

          <!-- status -->
          <el-form-item label="Status" class="pull-right">
            <el-select v-model="charge_status" @change="loadData">
              <el-option label="All" value="all"/>
              <el-option label="Paid" value="paid"/>
              <el-option label="Not paid" value="not_paid"/>
            </el-select>
          </el-form-item>

        </el-col>
      </el-form>
    </el-row>

    <!-- Total -->
    <el-row :gutter="0" class="stats-row" style="margin-bottom: 20px;">
      <div class="second">
          <span class="stats-number _second">{{$currency}} {{total.before_tax.toFixed(2)}}</span>
          <label>Before Tax Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="second">
          <span class="stats-number _second">{{$currency}} {{total.after_tax.toFixed(2)}}</span>
          <label>After Tax Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="fourth">
          <span class="stats-number _fourth">{{$currency}}{{total.tax.toFixed(2)}}</span>
          <label>Tax Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="third">
          <span class="stats-number _third"> {{$currency}}{{total.discounts.toFixed(2)}}</span>
          <label>Discounts Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>

      <div class="fourth">
          <span class="stats-number _fourth">{{$currency}}{{total.tips.toFixed(2)}}</span>
          <label>Tips Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="fourth">
          <span class="stats-number _fourth">{{$currency}}{{total.payments.toFixed(2)}}</span>
          <label>Payments Total</label>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="fourth">
          <span class="stats-number _fourth">{{$currency}}{{total.refunds.toFixed(2)}}</span>
          <label>Refunds Total</label>
      </div>
    </el-row>

    <!-- table -->
    <el-row>
      <el-col>    
        <vcl-table v-if="loading"></vcl-table>

        <el-table :data="charges" max-height="500" v-else>
          <el-table-column label="Date" width="150">
            <template slot-scope="scope">
              <span>{{ FormatDate(mode==="full_charge"? scope.row.date : scope.row._id) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Name"  width="250" v-if="mode=='full_charge'">
            <template slot-scope="scope">
              <account-avatar :account="{id : scope.row.accountId, avatar : scope.row.avatar, fullname: scope.row.account.first_name+' '+scope.row.account.last_name}" :size="32" body-class="pull-left"></account-avatar>
              <div style="margin-left: 10px;display:inline-block;">
                <span>{{scope.row.account.first_name+' '+scope.row.account.last_name}}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Before Tax">
            <template slot-scope="scope">
              <span>{{ scope.row.currency_symbol }}{{ scope.row.total_before_tax ? scope.row.total_before_tax : 0}}</span>
            </template>
          </el-table-column>
          <el-table-column label="After Tax">
            <template slot-scope="scope">
              <span>{{ scope.row.currency_symbol }}{{ scope.row.total_after_tax ? scope.row.total_after_tax : 0}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Tax">
            <template slot-scope="scope">
              <span>{{ scope.row.currency_symbol }}{{ scope.row.tax_amount ? scope.row.tax_amount : 0}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Discount">
            <template slot-scope="scope">
              <span>{{ scope.row.currency_symbol }}{{ scope.row.discounts ? scope.row.discounts : 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Tip">
            <template slot-scope="scope">
              <span>{{ scope.row.currency_symbol }}{{ scope.row.tip ? scope.row.tip : 0}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Payments">
            <template slot-scope="scope">
              <span>{{ scope.row.currency_symbol }}{{ scope.row.total_payments ? scope.row.total_payments : 0}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Refunds">
            <template slot-scope="scope">
              <span>{{ scope.row.currency_symbol }}{{ scope.row.total_refunds ? scope.row.total_refunds : 0}}</span>
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
        charges: [],
        loading: false,
        exporting: false,
        charge_accountId: [],
        charge_status: 'all', //all, paid, not paid
        accounts: [], //customers only
        include: ['booking','account'],
        total: {
          before_tax: 0,
          after_tax: 0,
          tax: 0,
          discounts: 0,
          tips: 0,
          payments: 0,
          refunds: 0
        },
        mode: "full_charge",
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
      this.GetAccounts();
    },
    methods: {
      GetAccounts() {
        this.axios.get("/companies/current/accounts", {
          params: {
                  filter: {
                      where: {role: 'r_customer'},
                      order: 'date DESC'
                  }
              }
          })
        .then(res => {
            this.accounts = res.data;
            this.charge_accountId = this.accounts.map(x=>x.id);
            this.loadData();
        });
      },
      loadData() {
        (async()=>{
          try{
            this.loading = true;
            if(this.mode === "full_charge"){
              let results = await this.axios.get('/charges',{params:{filter:{where: this.GetWhere(true),include:this.include}}});
              this.charges = results.data;
            }else if(this.mode ==="daily_summary"){
                let data =  await this.$root.$aggregate('charges', this.dateRange[0], this.dateRange[1], 'date', this.GetWhere(false))
                this.charges = data.results;
            }
            this.total.before_tax = this.charges.reduce((t,i)=>{return t+Number(i.total_before_tax)},0);
            this.total.after_tax = this.charges.reduce((t,i)=>{return t+Number(i.total_after_tax)},0);
            this.total.tax = this.charges.reduce((t,i)=>{return t+Number(i.tax_amount)},0);
            this.total.discounts = this.charges.reduce((t,i)=>{return t+Number(i.discounts)},0);
            this.total.tips = this.charges.reduce((t,i)=>{return t+Number(i.tip)},0);
            this.total.payments = this.charges.reduce((t,i)=>{return t+Number(i.total_payments)},0);
            this.total.refunds = this.charges.reduce((t,i)=>{return t+Number(i.total_refunds)},0);
          }catch(err){
            console.log(err)
          }finally{
            this.loading = false;
          }
        })()
      },
      GetWhere(lbQuery){
        let whereQuery = {};
        if(lbQuery){
          if(this.charge_status && this.charge_status !== 'all'){
            whereQuery.paid = this.charge_status === 'paid';
          }
          
          whereQuery.accountId = {inq: this.charge_accountId};
          

          if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
              whereQuery.date = { between: this.dateRange };
          }
        }else{
          if(this.charge_status && this.charge_status !== 'all'){
            whereQuery.paid = this.charge_status === 'paid';
          }
          
          whereQuery.accountId = {$in: this.charge_accountId};
          
        }
        return whereQuery;
      },
      FormatDate(date){
        return this.$moment(date).format(this.$date_format);
      },
      FormatTime(date){
        return this.$moment(date).format(this.$time_format);
      },
      FormatDateTime(date){
        return this.$moment(date).format(this.$date_format+" "+this.$time_format);
      },
      SwitchMode(){
        this.mode = this.mode==='daily_summary'? 'full_charge':'daily_summary'
        this.loadData();
      },
      Export(){
         
        //send call to company report and  return okay when the result are returned from the function
        this.exporting = true;
        let paramsObj = {
            type: 'charges',
            where: this.GetWhere(true),
            include: this.include,
            from: this.$moment(this.dateRange[0]).startOf('day').toISOString(),
            to: this.$moment(this.dateRange[1]).endOf('day').toISOString(),
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