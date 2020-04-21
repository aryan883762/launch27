<template>
  <el-container>
    <system-value mode="reserved" :type-list="typeList"/>
  </el-container>
</template>


<script>
import SystemValue from "./components/SystemValue.vue";

export default {
  components: {
    SystemValue
  },
  data() {
    return {
        typeList: [
            {key: 'subdomain', name: 'Subdomain'}
        ]
    };
  }
};
</script>

<style lang="scss">
</style>
