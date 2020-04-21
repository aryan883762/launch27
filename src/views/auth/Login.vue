<template>
    <div class="signin-page unauth flex-row-center">
        <el-row class="flex-row-center block-center" style="max-width: 640px;">
            <el-col :md="24" :sm="24" :xs="24">
                <el-row :gutter="20">
                    <div style="text-align: center; ">
                        <svg height="48px" width="240px" xmlns="http://www.w3.org/2000/svg"
                             xmlns:xlink="http://www.w3.org/1999/xlink"
                        >
                            <image
                                    height="18px"
                                    width="200px"
                                    x="0px"
                                    xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAYCAMAAADnCR6uAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAYFBMVEUAAAD/hgT/hgT/hgT/hgT/hgT/hgRyc3X/hgT/hgT/hgT/hgT/hgT/hgT/hgRyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3X/hgRyc3X/hgT///8q9MMLAAAAHXRSTlMAM4i77kQiu2YR3cx3qpkiiO5md8zdEaozVZlEVYVmdPkAAAABYktHRB8FDRC9AAAAB3RJTUUH4wIbFAcyPWWMmQAAAklJREFUSMfFlu2WgiAQhjEqNG0LUfIjuv/LXGAGBUSrPZ12fuwiDDMPr8MkIR82pW05m+3o4/HY011mHw+PyI6EJfd9luNI54w0S3EcvsGR7YOc+T/pUZxsqpLSEpJmCw5KvsBRmUzno0Xa2bG/eobX8gUO6qe2UN7iEeX4AscPpTRzDwUef1p0zx7H5aofOKttMBaGRDdmF4T+11wvU7CLYFy1rJaOQ4pGqfZWJzhDjkmOmUPeFFrTbXJ0LfphGnl1G9sONvUcJ5iMMQ5wOxZyTByyUZM1Wxx89qvjja0kKrBbhJGbK7xPyDFxWDWGkciewVHWOAynENadm+OCGg3TKnHUQwOhh+qwLO7VWZcJ3NIqlOPuJxg9oYcnHMJMjBxGF0thamVkHdYHeHTG42qP/eM3i7IIivYUJBjcHmPtJgdqLWBo5Gi8MrCywrCGMFE/pRMGXOJ8kaBz62KTA92MEC3M9CTkQA8JAYoZo6TVXKOwcAoTBNd+3OTwM8JfGXGEY9tDy9wDSMjxEQ6yyVHGrTwlh4vcJt6LmXPNiq9x8Kd6RB00LYd/0MHNYZ0yV/lAluZg8z17jyOUw0UWiXtr5vhoZmq+yiFcH9F1+RZHFbYSjCz5so9J17SwYyY57Eauf1pkzYdVjvjrS5v5KtkXMYe97L4xJxI2yDUO30kN8mWOPJRjjuzFcw1omuO1WOWA14h+48sckRxe5BFeiGpGcwksh/4UaPSXgJBkg4P07geYdS+/l1iOwGQvRN2R960XjN3EX3Y6+wVNBooECZNeKAAAAABJRU5ErkJggg=="
                                    y="0px"
                            />
                        </svg>
                    </div>

                    <el-card shadow="always">
                        <el-alert :closable="false" effect="dark" type="error" v-if="false">
                            Alert: Update in Progress
                        </el-alert>

                        <p class="text-center" style="font-size: 17px; text-transform:uppercase;">
                            Welcome back! Sign in below to get started
                        </p>

                        <el-form :model="login_form" :rules="rules" class="sub-container block-center" ref="login_form">
                            <realm-input :email="login_form.email" ref="realm_input" v-model="login_form.realm"/>

                            <el-form-item label=" " prop="email">
                                <el-input autocomplete="on" placeholder="Email e.g. john@smith.com" type="email"
                                          v-model="login_form.email"
                                />
                            </el-form-item>

                            <el-form-item label=" " prop="password">
                                <el-input autocomplete="off" placeholder="Password" v-on:keyup.enter.native="recaptcha()" show-password type="password"
                                          v-model="login_form.password"
                                />
                            </el-form-item>

                            <el-form-item style="text-align: center">
                                <div class="padding-2x  block-center"/>
                                <el-button :loading="loading" @click="recaptcha" class="block-center button-large"
                                           round style="width : 240px;" type="primary"
                                >
                                    Login
                                </el-button>
                                <router-link style="width: auto; display: inline" to="/reset">
                                    Forgot Password
                                </router-link>
                            </el-form-item>

                            <el-form-item>
                                <router-link class="text-center block-center full-width signup-link" to="/signup">
                                    Don't have an account?, Register Now!
                                </router-link>
                            </el-form-item>
                        </el-form>
                    </el-card>
                </el-row>
            </el-col>
        </el-row>
        <el-dialog :visible.sync="request2FA" @closed="closed2FA" append-to-body v-loading="code_loading" width="400px">
            <div class="modal-body">
                <h4>Enter your 2FA Code from Google Authenticator</h4>
                <el-input class="ota-input" maxlength="6" placeholder="******" type="text"
                          v-model="login_form.code"
                />
            </div>
            <div slot="footer">
                <el-button @click="request2FA = false" round size="small">
                    Cancel
                </el-button>
                <el-button @click="handleLogin()" round size="small" type="primary">
                    Verify Secure Code
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import RealmInput from '@/components/RealmInput'
    import {redirectWithSubdomain, deleteDefaultCookie} from '@/utils/subdomain_helper.js'

    export default {
        components: {
            RealmInput
        },

        data: () => {
            return {
                login_form: {
                    email: '',
                    password: '',
                    realm: '',
                    code: ''
                },
                rules: {
                    email: [{required: true, message: 'Valid email is required', type: 'email'}],
                    password: [{required: true, message: "Password can't be blank"}],
                    realm: [{required: true}]
                },
                request2FA: false,
                loading: false,
                code_loading: false,
                recaptcha_token: ""
            }
        },

        mounted() {
            // if user is logged in redirecting to dashboard to bypass vue-auth 404 page
            if (this.$auth.check()) {
                this.redirectUser()
            } else {
                // clearing any default subdomain cookie
                deleteDefaultCookie(this.$auth.options.tokenDefaultName)
            }

        },

        methods: {
            async recaptcha() {
                // (optional) Wait until recaptcha has been loaded.
                try {
                    this.loading = true
                    this.recaptcha_token = ""

                    await this.$recaptchaLoaded()

                    // Execute reCAPTCHA with action "login".
                    this.recaptcha_token = await this.$recaptcha('login')
                    this.handleLogin()
                } catch (err) {
                    this.loading = false
                }
            },

            handleLogin() {
                this.$refs['login_form'].validate(valid => {
                    if (valid) {
                        this.$refs['realm_input'].setRealm(this.login)
                        this.loading = false
                    } else {
                        this.loading = false
                    }
                })
            },

            closed2FA() {
                this.code_loading = false
                this.loading = false
                this.login_form.code = ''
            },

            login() {
                let self = this


                if (this.request2FA) {
                    this.code_loading = true
                }

                this.$auth.login({
                    data: {
                        realm: this.login_form.realm,
                        email: this.login_form.email,
                        password: this.login_form.password,
                        code: this.login_form.code,
                        token: this.recaptcha_token
                    }, // data: {} in Axios
                    success: res => {
                        this.$auth.fetch({
                            params: {},
                            success: function (data) {
                                this.request2FA = false

                                // if user company is valid we redirect, else we
                                // redirect to onboarding
                                if (this.$auth.user().companyId || this.$auth.user().company) {
                                    this.redirectUser()
                                } else if (this.$auth.user().role === 'r_admin') {
                                    this.$router.push({name: 'onboarding_company'})
                                }
                                if (this.$subdomain.name !== 'default') {
                                    // if url subdomain is wrong we redirect to home with subdomain
                                    redirectWithSubdomain(this.$subdomain.name)
                                }

                                this.loading = false
                                this.code_loading = false
                            },
                            error: function (err) {
                                this.loading = false
                                this.code_loading = false
                                this.redirectUser()
                            }
                        })
                    },
                    error: err => {
                        if (err && err.response && err.response.data) {
                            if (err.response.data.error.status === 412) {
                                // show OTA box for entering key
                                this.request2FA = true
                                return
                            }

                            if (err.response.data.error.status === 401) {
                                self.$message.error(err.response.data.error.message)
                            } else {
                                self.$message.error('Login failed, invalid username or password')
                            }
                        } else {
                            self.$message.error('Server not available')
                        }

                        this.loading = false
                        this.code_loading = false
                    },
                    rememberMe: this.rememberMe,
                    redirect: '',
                    fetchUser: false
                })
            },

            redirectUser() {
                var redirect = this.$auth.redirect()
                // if there is a redirect path we go there and let it handle
                // its permision access else we redirect based on the user role
                let redirectTo
                let redirectQuery = {}
                if (redirect && redirect.from.name) {
                    redirectTo = redirect.from.name
                    redirectQuery = redirect.from.query
                } else {
                    if (this.$can('manage', 'role_customer')) {
                        redirectTo = 'customer_dashboard'
                    } else if (this.$can('manage', 'role_team')) {
                        redirectTo = 'team_dashboard'
                    } else if (this.$can('manage', 'role_admin')) {
                        redirectTo = 'dashboard'
                    } else if (this.$can('manage', 'role_super_admin')) {
                        redirectTo = 'superadmin_companies'
                    } else {
                        redirectTo = 'dashboard'
                    }
                }
                this.$router.push({name: redirectTo, query: redirectQuery})
            }
        }
    }
</script>

<style lang="scss">
    @import "Login";

    .ota-input {
        .el-input__inner {
            font-size: 30px;
            padding: 10px;
            height: 50px;
            line-height: 50px;
            letter-spacing: 10px;
            text-align: center;
        }

    }
</style>
