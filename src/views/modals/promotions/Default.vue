<template>
  <div>
    <el-dialog :before-close="shouldClose" :close-on-press-escape="true" :fullscreen="true" :modal="true" appendToBody :visible.sync="showModal" @close="settingsRedirect" custom-class="fullscreen-modal-display">
      <div class="modal-title-container" slot="title">
        <el-row>
          <el-col :sm="6" :xs="24">
            <span class="modal-title">
              Discount Codes
            </span>
          </el-col>
        </el-row>
      </div>

      <div class="modal-body">
        <router-view></router-view>
      </div>
    </el-dialog>
  </div>
</template>

<script>


    export default {
        name: 'SettingsPromotions',
        components: {},
        data() {
            return {
                showModal: false,
                activeTab: 'create',
                discount_code: false
            }
        },
        created() {
            this.$events.addListener('edit-code', code => {
                this.activeTab = 'create'
                this.discount_code = code
            })

            this.$events.addListener('duplicate-code', code => {
                this.activeTab = 'create'
                this.discount_code = code
            })
        },
        mounted() {
            this.showModal = true
        },
        methods: {
            settingsRedirect() {
                this.$router.push('/dashboard/settings')
            },
            shouldClose(done) {
                if (this.$route.name === 'dashboard_settings_promotions_list') {
                    return done()
                } else {
                    this.$router.back()
                    return done(false)
                }
            }
        }
    }
</script>
<style lang="scss"></style>
