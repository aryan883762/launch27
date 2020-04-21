<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="16" :sm="16" :xs="24">
        <el-card>
          <el-page-header @back="$router.back()" content="Choose email settings" />
          <!--<el-checkbox-group v-model="checked_pref">-->
            <p>
              <el-checkbox v-model="prefs.availability_for_specific_date_changed">Availability for Specific Date changed</el-checkbox>
              <small style="display:block">Receive notification anytime availability is changed</small>
            </p>
            <p>
              <el-checkbox v-model="prefs.default_availability_added">Default Availability added</el-checkbox>
              <small style="display:block">Receive notification when default availability is added</small>
            </p>
            <p>
              <el-checkbox v-model="prefs.default_availability_changed">Default Availability changed</el-checkbox>
              <small style="display:block">Receive notification when default availability is changed</small>
            </p>
            <p>
              <el-checkbox v-model="prefs.request_for_time_off_submitted">Request for Time Off submitted</el-checkbox>
              <small style="display:block">Receive notification when a time off request is submitted</small>
            </p>
            <p>
              <el-checkbox v-model="prefs.team_daily_schedule">Team Daily Schedule </el-checkbox>
              <small style="display:block">Receive daily schedules of teams</small>
            </p>
          <!--</el-checkbox-group>-->
          <el-divider />
          <el-button @click="saveChanges()" round type="primary">
            Save Changes
          </el-button>
        </el-card>
      </el-col>
      <side-help />
    </el-row>
  </div>
</template>
<script>
    import SideHelp from '../components/SideHelp'

    export default {
        components: { SideHelp },
        data () {
            return {
                prefs: {
                    availability_for_specific_date_changed: true,
                    default_availability_added: true,
                    default_availability_changed: true,
                    request_for_time_off_submitted: true,
                    team_daily_schedule: true,
                },

                showModal: false,
                email_preference: false,
                loading: false
            }
        },

        mounted () {
        },
        methods: {
            saveChanges () {
                this.loading = true
            }
        }
    }
</script>