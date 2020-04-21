<template>
  <accounts-list />
</template>

<script>
  import {VclTable} from 'vue-content-loading';
  import AccountsList from '../components/AccountsList';

  export default {
      components: {
          VclTable,
          AccountsList
      },
      data: () => {
          return {
          };
      }
  };
</script>
