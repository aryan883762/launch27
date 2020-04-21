<template>
    <div class="app-section-tags-detail">
        <el-card v-loading="loading">

            <el-tabs v-if="selectedTag" v-model="active_tab">
                <el-tab-pane name="people">
                    <span slot="label">
                        People ({{selectedTag.accounts.length}})
                    </span>
                    <el-row>
                        <el-col><h3>Accounts</h3></el-col>
                        <el-row :gutter="10">
                            <el-col :md="6" :sm="6" v-for="account in selectedTag.accounts">
                                <div class="tag-card">
                                    <account-avatar :account="account" body-class="pull-left"></account-avatar>
                                    <div class="account-detail">
                                        <label>{{account.fullname}}</label>
                                        <label> {{account.roleName}}</label>
                                    </div>
                                </div>
                            </el-col>
                        </el-row>

                    </el-row>
                </el-tab-pane>

                <el-tab-pane name="discount_code">
                    <span slot="label">
                        Discount Codes ({{selectedTag.discount_codes.length}})
                    </span>
                    <el-row :gutter="10" v-if="selectedTag.discount_codes">
                        <el-col><h3>Discount Codes</h3></el-col>
                        <el-row :gutter="10">
                            <el-col :md="6" :sm="6" v-for="discount in selectedTag.discount_codes">
                                <div class="tag-card">
                                    <label>{{discount.discount_code}}</label>
                                </div>
                            </el-col>
                        </el-row>
                    </el-row>
                </el-tab-pane>

                <el-tab-pane name="services">
                      <span slot="label">
                       Services ({{selectedTag.services.length}})
                    </span>
                    <el-row :gutter="10" v-if="selectedTag.services">
                        <el-col><h3>Services</h3></el-col>
                        <el-row :gutter="10">
                            <el-col :md="6" :sm="6" v-for="service in selectedTag.services">

                                <div class="tag-card">
                                    <label>{{service.name}}</label>
                                </div>
                            </el-col>
                        </el-row>
                    </el-row>
                </el-tab-pane>

                <el-tab-pane name="checklist">
                      <span slot="label">
                       Checklists ({{selectedTag.checklists.length}})
                        </span>
                    <el-row :gutter="10" v-if="selectedTag.checklist">
                        <el-col><h3>Checklists</h3></el-col>
                        <el-row :gutter="10">
                            <el-col :md="6" :sm="6" v-for="checklist in selectedTag.checklists">
                                <div class="tag-card">
                                    <label>{{checklist.name}}</label>
                                </div>
                            </el-col>
                        </el-row>
                    </el-row>
                </el-tab-pane>
            </el-tabs>

            <p v-if="!$route.params.id">
                You currently have no tags.
            </p>


        </el-card>
    </div>
</template>


<script>
    import AccountAvatar from "../../components/AccountAvatar";

    export default {
        components: {AccountAvatar},
        data() {
            return {
                selectedTag: false,
                active_tab: 'people',
                loading: false
            }
        },
        watch: {
            '$route'(val) {
                this.loadTag(val.params.id)
            }
        },

        mounted() {
            if (this.$route.params.id)
                this.loadTag(this.$route.params.id)
        },
        methods: {
            loadTag(tagId) {
                this.loading = true
                this.axios.get('/tags/' + tagId + '/usage')
                    .then(res => {
                        this.selectedTag = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        }
    }
</script>

<style lang="scss">
    .app-section-tags-detail {
        .tag-card {
            border: 1px solid #f3f3f3;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;

            &:hover {
                background: #f3f3f3;
            }
        }

        .account-detail {
            margin-left: 10px;
            display: inline-block;

            label {
                &:first-child {
                    font-weight: 500;
                    font-size: 13px;
                }

                display: block;
            }
        }
    }
</style>