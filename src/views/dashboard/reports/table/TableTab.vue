<template>
    <el-row>
        <el-row>
          <!-- Table type drop down select -->
          <el-form :inline="true">
            <el-col :xs="24" :sm="12" :md="12">
              <el-form-item label="Filter">
                <el-select v-model="table_type">
                  <el-option value="bookings" label="Bookings"/>
                  <el-option value="charges" label="Charges"/>
                  <el-option value="ratings" label="Ratings"/>
                  <el-option value="hourlywages" label="Wages"/>
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
                        end-placeholder="End Date">
                </el-date-picker>
              </div>
             </el-form-item>
            </el-col>
          </el-form>
        </el-row>

        <!-- Table -->
        <el-row>
          <Bookings v-if="table_type === 'bookings'" :date-range.sync="date_range"/>
        </el-row>
        <el-row>
          <Charges v-if="table_type === 'charges'" :date-range.sync="date_range"/>
        </el-row>
        <el-row>
          <Ratings v-if="table_type === 'ratings'" :date-range.sync="date_range"/>
        </el-row>
        <el-row>
          <HourlyWages v-if="table_type === 'hourlywages'" :date-range.sync="date_range"/>
        </el-row>
      </el-row>
</template>

<script>
    import Bookings from './Bookings.vue'
    import Charges from './Charges.vue'
    import Ratings from './Ratings.vue'
    import HourlyWages from './HourlyWages.vue'

    export default {
         components: {
            Bookings,
            Charges,
            Ratings,
            HourlyWages
        },
        data() {
            return {
                table_type: 'bookings',
                date_range: [
                    this.$moment().startOf("month").format("YYYY-MM-DD"),
                    this.$moment().endOf("month").format("YYYY-MM-DD")
                ]
            }
        }
    }
</script>