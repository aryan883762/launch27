<template>
  <el-dialog :close-on-press-escape="true" :fullscreen="true" append-to-body :modal="false" :visible.sync="showModal" @close="$router.back()" custom-class="fullscreen-modal-display">
    <div class="modal-title-container" slot="title">
      <el-row>
        <el-col :sm="6" :xs="24">
          <span class="modal-title" v-if="sms_page">
            SMS Preferences
          </span>
          <span class="modal-title" v-else>
            Email Preferences
          </span>
        </el-col>
      </el-row>
    </div>
    <div class="modal-body" v-loading="loading">
      <el-row :gutter="20">
        <el-col :md="16" :sm="16" :xs="24">
          <el-card>
            <el-page-header @back="$router.back()" content="Choose which SMS you would like to receive:" v-if="sms_page"/>
            <el-page-header @back="$router.back()" content="Choose which emails you would like to receive:" v-else/>
            <el-checkbox-group v-model="email_preference.subscriptions" v-if="email_preference">
              <p v-for="preference in preferences">
                <el-checkbox :key="preference.id" :label="preference.code">
                  {{ preference.name }}
                </el-checkbox>
                <small style="display:block">{{ preference.description }}</small>
              </p>
            </el-checkbox-group>
            <el-divider />
            <el-button @click="saveChanges()" round type="primary">
              Save Changes
            </el-button>
          </el-card>
        </el-col>
        <side-help />
      </el-row>
    </div>
  </el-dialog>
</template>

<script>
import SideHelp from '../components/SideHelp'

export default {
  components: { SideHelp },
  data () {
    return {
      preferences: [],
      showModal: false,
      email_preference: false,
      loading: false,
      sms_page: false
    }
  },

  mounted () {
    if (this.$route && this.$route.meta && this.$route.meta.sms_preferences) {
      this.sms_page = true
    }

    let type = "email";
    if (this.sms_page){
      type = "sms";
    }

    (async () => {
      try {
        this.showModal = true
        let accountId = this.$route.params.id

        this.loading = true

        let res = await this.axios.get('/email_preferences/list',
                    {
                        params: {
                          accountId: accountId,
                          type: type
                        }
                    })
        this.preferences = res.data

        res = await this.axios.get('/accounts/' + accountId + '/email_preferences')
        this.email_preference = res.data

        this.loading = false
      } catch (err) {
        // error occured so go back
        this.loading = false
        this.$helpers.errorHandle('Preferences not available for this acount')
        this.$router.back()
      }
    })()
  },
  methods: {
    saveChanges () {
      this.loading = true
      this.axios.patch('/email_preferences/' + this.email_preference.id,
        {
          subscriptions: this.email_preference.subscriptions
        })
        .then(res => {
          let message = "Email";
          if (this.sms_page){
            message = "SMS";
          }
          this.$helpers.successHandle(message + ' preferences updated', this)
          this.$router.back()
        })
        .catch(err => {
          this.$helpers.errorHandle(err, this)
        })
        .then(() => {
          this.loading = false
        })
    }
  }
}
</script>
