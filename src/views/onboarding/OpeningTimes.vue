<template>
  <el-form class="" ref="opening_times">
    <div class="divider-1x">
      <h2>Welcome {{ $auth.user().first_name }}</h2>
    </div>

    <p>You are only a few minutes away from building bigger business with Launch27 <br/>Next, lets set your services (don’t worry if you are not ready you can skip it and come back to it)</p>

    <el-row :gutter="40" :key="$index" v-for="(time, $index) in location.opening_times">
      <el-col :md="8" :sm="8">
        <el-form-item>
          <el-select multiple placeholder="Mon - Sun" v-model="time.days">
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

      <el-col :md="5" :sm="5">
        <el-form-item>
          <el-time-select
            :picker-options="{
              start: '08:30',
              step: '00:15',
              end: '18:30'
            }"
            placeholder="From"
            v-model="time.from"
          />
        </el-form-item>
      </el-col>
      <el-col :md="5" :sm="5">
        <el-form-item>
          <el-time-select
            :picker-options="{
              start: '08:30',
              step: '00:15',
              end: '18:30'
            }"
            placeholder="From"
            v-model="time.to"
          />
        </el-form-item>
      </el-col>
      <el-col :md="4" :sm="4">
        <el-button @click="deleteTime($index)" class="remove" size="mini" type="text">
          <img src="@/assets/svgs/onboarding/remove.svg" svg-inline/>
        </el-button>
      </el-col>
    </el-row>

    <div class="divider"/>
    <el-row>
      <el-col :md="12" :sm="12" :xs="24" class="button-container">
        <el-button @click="prev" plain type="text">
          Back
        </el-button>
      </el-col>
      <el-col :md="12" :sm="12" :xs="24" class="button-container">
        <el-button :loading="loading" @click="next" class="pull-right" round type="primary">
          Next
        </el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
    export default {
        data: () => {
            return {
                booking_spots: [],
                location: false,
                rules: {},
                loading: false
            };
        },
        created() {
        },

        mounted() {

            this.axios.get('/companies/current/locations')
                .then(res => {
                    console.log(res)
                    this.location = res.data
                })
                .catch()
                .then()

            this.$events.emitEvent("illustration", ["opening", 3]);
        },

        methods: {
            next() {
                // save location
                this.loading = true
                this.axios
                    .patch("/locations", {id: this.location.id, booking_spots: this.location.booking_spots})
                    .then(res => {
                        this.$events.emitEvent("onboarding-next");
                    })
                    .catch(err => {
                        console.log(err);
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },

            deleteTime(index) {
                this.location.opening_times.splice(index, 1);
            },

            prev() {
                this.$events.emitEvent("onboarding-prev");
            }
        }
    };
</script>
