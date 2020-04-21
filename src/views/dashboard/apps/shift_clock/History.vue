<template>
  <ClockHistory/>
</template>

<script>
import ClockHistory from "@/components/ClockHistory.vue"

    export default {
        components: {
            ClockHistory
        },
    data: () => {
      return {}
    },
    created() {
    },
    methods: {}
  };
</script>

<style scoped lang="scss">
  .title {
    text-align: center;
    margin-bottom: 20px;

    span {
      font-size: 12px;
    }

    p, h4 {
      margin: 0px;
    }
  }
  .el-message-box__btns .el-button.el-button--primary {
    min-width: auto;
  }

  .view-select {
    margin-bottom: 10px;
  }



  @media only screen and (max-width: 768px) {
    .search-filter {
      float: none !important;
      margin-top: 10px;
    }
    .search-filter .search {
      margin-left: 0px !important;
    }
  }
</style>
