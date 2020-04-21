<template>
  <el-row>
    <el-row>
      <!-- Table type drop down select -->
      
      <el-form :inline="true">
        <el-col :xs="24" :sm="12" :md="12">
          <el-form-item label="Location" class="pull-left">
            <company-locations :return-object="false" :multiple="true" v-model="location_ids" @change="loadBooking"></company-locations>
          </el-form-item>

          <el-form-item label="Status" class="pull-left">
            <el-select
              v-model="status"
              @change="loadBooking"
              multiple
              collapse-tags >
              <el-option key="active" value="active" label="Active"/>
              <el-option key="completed" value="completed" label="Completed"/>
              <el-option key="cancelled" value="cancelled" label="Cancelled"/>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="12">
          <!-- date filter -->
          <el-form-item label="Dates" class="pull-right">
            <div class="block">
              <el-date-picker
                v-model="date_range"
                type="daterange"
                align="right"
                size="small"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                @change="loadBooking"
              ></el-date-picker>
            </div>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>

    <!-- Charts -->
    <el-row>
        <BookingTab :bookings.sync="bookings" :loading.sync="loading" :forecast_bookings.sync="forecasted_bookings"/>
    </el-row>
    <el-row>
        <MoneyTab :bookings.sync="bookings" :loading.sync="loading"/>
    </el-row>
  </el-row>
</template>

<script>
import MoneyTab from "../money/MoneyTab.vue";
import BookingTab from "../booking/BookingTab.vue";
import CompanyLocations from "../../../../components/CompanyLocations.vue";

export default {
  components: {
    BookingTab,
    MoneyTab,
    CompanyLocations

  },
  data() {
    return {
      date_range: [],
      location_ids: false,
      bookings: {},
      status: ["active","completed","cancelled"],
      forecasted_bookings: [],
      loading: false
    };
  },
  mounted() {
    this.date_range = [
      this.$moment()
        .startOf("month")
        .format("YYYY-MM-DD"),
      this.$moment()
        .endOf("month")
        .format("YYYY-MM-DD")
    ];

    //this.loadBooking();
  },
  methods: {
    loadBooking(){
        (async()=>{
            try{
                this.loading = true;
                this.bookings = {};
                this.forecasted_bookings = [];
                let data =  await this.$root.$aggregate('bookings', this.date_range[0], this.date_range[1], 'date', this.getWhereQuery(false))
                if(data){this.bookings = data;}
                this.loading = false;
                let forecasted_data = await this.$root.$aggregate('bookings', this.date_range[0], this.date_range[1], 'forecast', this.getWhereQuery(true))
                if(forecasted_data){this.forecasted_bookings = forecasted_data;}
            }catch(err){
              console.log(err);
            }finally{
                this.loading = false;
            }
        })()
    },
    getWhereQuery(lbQuery){
      let whereQuery = {};
      if(!lbQuery){
        whereQuery.status =  {$in: this.status};
        whereQuery.locationId = {$in: this.location_ids};
      }else{
        whereQuery.status =  {inq: this.status};
        whereQuery.locationId = {inq: this.location_ids};
      }
      return whereQuery;
    }
  }
};
</script>