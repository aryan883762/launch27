<template>
    <div class="no-padding">
        <div v-if="$auth.impersonating()">
            <div class="flex-row-reverse">
                <account-avatar body-class="pull-right" :account="$auth.user()"></account-avatar>

                <el-button class="last" round size="mini" type="warning" @click="showDialog">
                    Impersonating as {{$auth.user().fullname}}
                </el-button>

            </div>


            <el-dialog title="Impersonating" :visible.sync="dialogVisible" width="40%"
                       :append-to-body=true>
                <el-form label-position="top" class="impersonate-main">
                    <el-divider content-position="left">Your Account</el-divider>
                    <el-row :gutter="20" v-loading="loading">
                        <el-col :md="12">
                            <el-form-item label="Fullname">
                                {{ superAccount.fullname }}
                            </el-form-item>
                        </el-col>
                        <el-col :md="12">
                            <el-form-item label="Role">
                                {{ superAccount.roleName }}
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-divider content-position="left">Impersonated Account</el-divider>
                    <template v-if="$auth.ready()">
                        <el-row :gutter="20">
                            <el-col :md="12">
                                <el-form-item label="Fullname">
                                    {{ $auth.user().fullname }}
                                </el-form-item>
                            </el-col>
                            <el-col :md="12">
                                <el-form-item label="Email">
                                    {{ $auth.user().email }}
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :md="12">
                                <el-form-item label="Company">
                                    {{ $auth.user().company ? $auth.user().company.business_name : '' }}
                                </el-form-item>
                            </el-col>
                            <el-col :md="12">
                                <el-form-item label="Role">
                                    {{ $auth.user().roleName }}
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </template>
                </el-form>
                <span slot="footer" class="dialog-footer">
        <el-button type="danger" round @click="unimpersonate">Stop Impersonation</el-button>
        <el-button round @click="dialogVisible = false">Close</el-button>
      </span>
            </el-dialog>
        </div>
    </div>
</template>
<script>

    import ImpersonateMixin from '@/mixins/ImpersonateMixin';
    import AccountAvatar from "./AccountAvatar";

    export default {
        components: {AccountAvatar},
        mixins: [ImpersonateMixin],
        data() {
            return {
                dialogVisible: false,
                loading: true,
                superAccount: {fullname: "", role: ""}
            };
        },
        mounted() {
        },
        methods: {
            showDialog() {
                this.dialogVisible = true;
                if (this.$auth.impersonating()) {
                    // switch to superadmin token
                    this.$auth.disableImpersonate();
                    this.axios.get('/accounts/me')
                        .then(res => {
                            this.superAccount = res.data;
                        })
                        .finally(() => {
                            this.loading = false;
                            // switch back
                            this.$auth.enableImpersonate();
                        });
                }
            }
        }
    };
</script>

<style lang="scss">
    .no-padding {
        display: inherit;
    }

    .impersonate-main label {
        font-weight: 600;
    }
</style>
