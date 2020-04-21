<template>
  <div class="app-section-notes">
    <notes :account-id.sync="this.accountId" v-if="accountId" />
  </div>
</template>

<script>
import Notes from '../../../components/Notes'

export default {
  components: {
    Notes
  },
  data: () => {
    return {
      accountId: false
    }
  },

  created () {
    this.accountId = this.$route.params.id
  },

  beforeDestroy () {
  },

  destroy () {
  },

  methods: {
    personChanged (person) {
      this.accountId = person.account.id
    }
  }
}
</script>
