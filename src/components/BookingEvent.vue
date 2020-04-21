<template>
  <el-card class="booking_event">
    <el-form>
      <el-form-item label="Title">
        <el-input v-model="event_title" />
      </el-form-item>

      <el-form-item label="Date">
        <el-date-picker placeholder="time" type="datetime" v-model="event_date" />
      </el-form-item>

      <el-form-item label="Description">
        <el-input type="textarea" v-model="event_description" />
      </el-form-item>

      <el-form-item label="Customer or Team">
        <el-select v-model="event_target">
          <el-option :label="account.fullname" :value="account.id" v-for="account in accounts" />
        </el-select>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>

import DurationPicker from '../plugins/custom-fields/duration-picker'

export default {
  components: {
    DurationPicker
  },
  data () {
    return {
      event_title: '',
      event_description: '',
      event_date: '',
      event_duration: '',
      event_target: '',
      accounts: []
    }
  }
}
</script>
