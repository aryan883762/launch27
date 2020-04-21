<template>
  <el-card shadow="never" v-loading="loading" :body-style="{minHeight: '300px'}" 
           class="company-view-card-main">
    <template v-if="!company.id">
      <el-row>
        <h3 class="text-center" v-if="!loading">Company not found</h3>
      </el-row>
    </template>                                                                                                                                 
    <template v-else>
      <el-row v-if="company.account">
        <el-col>
          <account-settings :account.sync="company.account" :default-button="true" 
              :delete-button="true" v-model="selected_card">          
          </account-settings>
        </el-col>
      </el-row>
    </template>
  </el-card>
</template>

<script>
  import AccountSettings from "@/components/AccountCards.vue";

  export default {
      components: {
          AccountSettings
      },
      data() {
          return {
              loading: true,
              company: {},
              selected_card: ''
          };
      },
      mounted() {
          this.loadCompany();
      },
      methods: {
          loadCompany() {
              this.axios.get('/companies/' + this.$route.params.id,
                      {
                          params: {
                              filter: {
                                  include: ['account']
                              }
                          }
                      })
                      .then(res => {
                          if (res.data) {
                              this.company = res.data;
                          }
                      })
                      .finally(() => {
                          this.loading = false;
                      });
          }
      }
  };
</script>

