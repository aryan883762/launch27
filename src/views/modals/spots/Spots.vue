<template>
  <div class="">
    <el-form class="bg-white padding-2x" label-position="top" v-for="slot in company_slots">
      <el-row :gutter="20">
        <el-col :sm="12" :md="12" :xs="24">
          <el-form-item label="Days of Week">
            <el-select v-model="slot.days" multiple placeholder="Mon - Sun">
              <el-option :key="0" :label="'Mon'" :value="0">
                Monday
              </el-option>
              <el-option :key="1" :label="'Tues'" :value="1">
                Tuesday
              </el-option>
              <el-option :key="2" :label="'Wed'" :value="2">
                Wednesday
              </el-option>
              <el-option :key="3" :label="'Thu'" :value="3">
                Thursday
              </el-option>
              <el-option :key="4" :label="'Fri'" :value="4">
                Friday
              </el-option>
              <el-option :key="5" :label="'Sat'" :value="5">
                Saturday
              </el-option>
              <el-option :key="6" :label="'Sun'" :value="6">
                Sunday
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :sm="6" :md="6" :xs="24">
          <el-form-item label="From">
            <el-time-select
              v-model="slot.from"
              :picker-options="{
                      start: '08:30',
                      step: '00:15',
                      end: '18:30'
                    }"
              placeholder="Select time">
            </el-time-select>

          </el-form-item>
        </el-col>

        <el-col :sm="6" :md="6" :xs="24">
          <el-form-item label="To">
            <el-time-select
              v-model="slot.to"
              :picker-options="{
                      start: '08:30',
                      step: '00:15',
                      end: '18:30'
                    }"
              placeholder="Select time"
            >
            </el-time-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :sm="6" :md="6" :xs="24">
          <el-form-item label="# of Appointments you can take">
            <el-input-number v-model="slot.available_slots"></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :sm="6" :md="6" :xs="24">
          <el-form-item label="Location">
            <el-select v-model="slot.locations" multiple collapse-tags>
              <el-option v-for="location in company_locations" :value="location.id" :label="location.name"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :sm="6" :md="6" :xs="24">
          <el-form-item label="Team">
            <el-select v-model="slot.teams" multiple collapse-tags>
              <el-option v-for="team in company_teams" :value="team.id" :label="team.name"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :sm="6" :md="6" :xs="24">
          <el-form-item label="Service">
            <el-select v-model="slot.services" multiple collapse-tags>
              <el-option v-for="service in company_services" :value="service.id" :label="service.name"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-row>
      <el-col>
        <el-button-group class="pull-right">
          <el-button style="margin-bottom: 20px; margin-right: 20px;" type="text" icon="el-icon-plus" @click="addSlot()">Add Another Time-Slot</el-button>
        </el-button-group>
      </el-col>

      <el-col>
        <el-button type="primary" class="text-center block-center" style="margin-bottom: 20px;" round @click="SaveBookingSpots"> Save Booking Spots</el-button>
      </el-col>
    </el-row>
  </div>
</template>


<script>
  export default {
    data() {
      return {
        showModal: false,
        company_services: [],
        company_locations: [],
        company_teams: [],
        activeTab: "spots",
        company_slots: [
          {
            from: "",
            to: "",
            days: [],
            services: [],
            locations: [],
            teams: []
          }
        ]
      };
    },



    methods: {
      addSlot() {
        this.company_slots.push({
          from: "",
          to: "",
          days: [],
          services: [],
          locations: [],
          teams: []
        });
      },

      SaveBookingSpots() {
      }
    }
  }
</script>


<style lang="scss">

</style>
