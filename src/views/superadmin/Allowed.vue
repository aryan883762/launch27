<template>
  <el-container>
    <system-value mode="allowed" :type-list="typeList" />
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
            {key: 'owner_email', name: 'Owner Email'}
        ]};
  }
};
</script>

<style lang="scss">
</style>
