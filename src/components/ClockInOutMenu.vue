<template>
    <div v-if="!$can('manage','can_clock') || !$can('manage','plan_shift_clock')"></div>

    <el-button round size="mini" type="default" v-else-if="sendingClock" disabled>
    Loading
    </el-button>
    
    <el-button @click="clockInOut('out')" round size="mini" type="danger" v-else-if="clockedIn">
    {{ convertTime(clockSeconds) }}
    </el-button>

    <el-dropdown split-button type="success" @command="saveDefaultLocation" @click="clockInOut('in')" round size="small" style="margin-right: 10px;" v-else>
    Clock In
    <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="loc in locations" :key="loc.id" :command="loc">
            <b v-if="default_location && default_location.id === loc.id">{{ displayLocationInfo(loc) }}</b>
            <span v-else>{{ displayLocationInfo(loc)  }}</span>
        </el-dropdown-item>
    </el-dropdown-menu>
    </el-dropdown>
</template>
<script>
  export default {
      data() {
          return {
            last_timesheet: null,
            sendingClock: false,
            clockSetting: null,
            clockSeconds:0,
            clockedIn: false,
            showDialog: false,
            sec_interval: '',
            min_interval: '',
            default_location: null,
            locations: []
          };
      },
      created(){
          if(this.$can('manage','can_clock') && this.$can('manage','plan_shift_clock')){
            this.fetchTimesheet();
            this.fetchClockSettings();
            this.fetchLocations();
        }
            
      },
      methods: {
        clockInOut(clock_operation) {
            var data = {};
            switch(clock_operation){
                case 'in':
                    if(!this.default_location){
                        this.$helpers.errorHandle('No Location Selected');
                        return;
                    }

                    data = {
                        accountId: this.$auth.user().id,
                        companyId: this.$auth.user().companyId,
                        locationId: this.default_location.id
                    }
                    break;
                case 'out':
                    if(!this.last_timesheet){
                        this.sendingClock = false;
                        return;
                    }

                    data = this.last_timesheet;
                    break;
                default:
                    return;
            }


            this.sendingClock = true;
            this.axios.post('/clock_timesheets/clock',data)
            .then(res=>{
                if(res.data){
                    this.last_timesheet = res.data;
                    this.clockedIn = clock_operation === 'in' ? true : false;
                    this.startTimer();
                }
                this.sendingClock = false;
            })
            .catch(err=>{
            this.$helpers.errorHandle(err);
            this.sendingClock = false;
            })          
        },
        saveDefaultLocation(location){
            this.axios.patch('/accounts/'+this.$auth.user().id,
            {
                defaultLocationId: location.id
            }).then(loc=>{
                this.default_location = location;
            }).catch(err=>{});
        },
        fetchTimesheet(){
            this.sendingClock = true;
            this.axios.get('companies/current/clockTimesheets',{
            params: {
                filter: {
                where: {
                    accountId: this.$auth.user().id,
                    status: 'in'
                }
                }
            }
            })
            .then(res=>{
            if(res && res.data && res.data.length>0){
                this.last_timesheet = res.data[0];
                this.clockedIn = true;
                this.startTimer();
            }else{
                this.last_timesheet = null;
            }
            this.sendingClock = false;
            })
            .catch(err=>{
            this.last_timesheet = null;
            this.sendingClock = false;
            })
        },
        fetchClockSettings(){
            //fetch the business hour option
            this.axios.get('/companies/current/clockSetting/')
            .then((clockSetting) => {
            if(clockSetting.data){
                this.clockSetting = clockSetting.data;
            }
            })
            .catch((error) => {
            });
        },
        fetchLocations(){
            this.axios.get('/companies/current/locations',
            {
                params: {
                    filter: {
                        where:{
                            active: true
                        }
                    }
                }
            })
            .then((response)=>{
                if(response.data.length>0){
                    this.locations = response.data;
                    if(this.$auth.user().defaultLocationId){
                        this.locations.forEach(location => {
                            if(location.id === this.$auth.user().defaultLocationId){
                                this.default_location = location;
                                return;
                            }
                        });
                    }
                }
            })
            .catch((error)=>{});            
        },
        startTimer(){
            this.clockSeconds = (new Date() - new Date(this.last_timesheet.in))/1000;
            clearInterval(this.sec_interval);
            if(this.clockedIn){
                this.sec_interval = setInterval(() => this.clockSeconds++ , 1000);
            }
        },
        formatDigit(number){
            if(number < 10){
                return "0" + number;
            }
            return number;
        },
        convertTime(seconds){
            var hours = this.formatDigit(Math.floor(seconds / 3600));
            var minutes = this.formatDigit(Math.floor(seconds / 60) % 60);
            var seconds = this.formatDigit(Math.floor(seconds % 60));
            
            return hours+" : "+minutes+" : "+seconds;
        },
        displayLocationInfo(loc){
            if(this.clockSetting && this.clockSetting.restrict_business_hours){
                var booking_spots = loc.booking_spots[this.$moment().day()];
                return loc.name+" "+booking_spots.opening_time+" - "+ booking_spots.closing_time;
            }
            return loc.name;
        }
    }
  };
</script>

<style lang="scss">
  .my-row{
      margin-bottom: 10px;
  }
</style>
