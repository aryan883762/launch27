<template>
  <div class="block-center text-center">
    <el-autocomplete size="smaill" v-model="searchValue" :fetch-suggestions="querySearchAsync" :value-key="valueKey" :debounce="500" placeholder="Please input" @select="handleSelect" class="search" />
  </div>
</template>

<script>
export default {
  props: {
    querySearchAsync: {
      type: Function,
      required: true
    },
    handleSelect: {
      type: Function,
      required: true
    },
    valueKey: {
      type: String,
      required: true
    }
  },
  name: "Search",
  data: () => {
    return {
      searchValue: ""
    };
  },
  created() {}
};
</script>
