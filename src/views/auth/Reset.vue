<template>
    <div class="signin-page unauth">
        <el-row class="flex-row-center block-center" style="max-width: 640px;">
            <el-col :md="24" :sm="24" :xs="24">
                <el-row :gutter="20">
                    <div style="text-align: center; margin-top: 40px;">
                        <svg height="48px" width="240px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <image
                                    height="18px"
                                    width="200px"
                                    x="0px"
                                    xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAYCAMAAADnCR6uAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAYFBMVEUAAAD/hgT/hgT/hgT/hgT/hgT/hgRyc3X/hgT/hgT/hgT/hgT/hgT/hgT/hgRyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3X/hgRyc3X/hgT///8q9MMLAAAAHXRSTlMAM4i77kQiu2YR3cx3qpkiiO5md8zdEaozVZlEVYVmdPkAAAABYktHRB8FDRC9AAAAB3RJTUUH4wIbFAcyPWWMmQAAAklJREFUSMfFlu2WgiAQhjEqNG0LUfIjuv/LXGAGBUSrPZ12fuwiDDMPr8MkIR82pW05m+3o4/HY011mHw+PyI6EJfd9luNI54w0S3EcvsGR7YOc+T/pUZxsqpLSEpJmCw5KvsBRmUzno0Xa2bG/eobX8gUO6qe2UN7iEeX4AscPpTRzDwUef1p0zx7H5aofOKttMBaGRDdmF4T+11wvU7CLYFy1rJaOQ4pGqfZWJzhDjkmOmUPeFFrTbXJ0LfphGnl1G9sONvUcJ5iMMQ5wOxZyTByyUZM1Wxx89qvjja0kKrBbhJGbK7xPyDFxWDWGkciewVHWOAynENadm+OCGg3TKnHUQwOhh+qwLO7VWZcJ3NIqlOPuJxg9oYcnHMJMjBxGF0thamVkHdYHeHTG42qP/eM3i7IIivYUJBjcHmPtJgdqLWBo5Gi8MrCywrCGMFE/pRMGXOJ8kaBz62KTA92MEC3M9CTkQA8JAYoZo6TVXKOwcAoTBNd+3OTwM8JfGXGEY9tDy9wDSMjxEQ6yyVHGrTwlh4vcJt6LmXPNiq9x8Kd6RB00LYd/0MHNYZ0yV/lAluZg8z17jyOUw0UWiXtr5vhoZmq+yiFcH9F1+RZHFbYSjCz5so9J17SwYyY57Eauf1pkzYdVjvjrS5v5KtkXMYe97L4xJxI2yDUO30kN8mWOPJRjjuzFcw1omuO1WOWA14h+48sckRxe5BFeiGpGcwksh/4UaPSXgJBkg4P07geYdS+/l1iOwGQvRN2R960XjN3EX3Y6+wVNBooECZNeKAAAAABJRU5ErkJggg=="
                                    y="0px"
                            />
                        </svg>
                    </div>

                    <h2 class="text-center" style="margin-top: 40px;">
                        Request Password Reset
                    </h2>

                    <el-card shadow="always">
                        <p class="text-center" style="font-size: 17px;">
                            Enter your email below to request for a password change
                        </p>

                        <el-form :model="reset_form" :rules="rules" class="sub-container block-center" ref="reset_form" v-loading="loading">
                            <realm-input :email="reset_form.email" ref="realm_input" v-model="reset_form.realm"/>

                            <el-form-item prop="email">
                                <el-input autocomplete="on" placeholder="Email e.g. john@smith.com" type="email" v-model="reset_form.email"/>
                            </el-form-item>

                            <el-form-item style="text-align: center">
                                <div class="padding-2x  block-center"/>
                                <el-button @click="recaptcha()" class="block-center button-large" round style="width : 240px;" type="primary">
                                    Reset Password
                                </el-button>
                                <router-link style="width: auto; display: inline" to="/login">
                                    Back to Login
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
    </div>
</template>

<script>
    import RealmInput from "@/components/RealmInput";

    export default {
        components: {
            RealmInput
        },

        data: () => {
            return {
                reset_form: {
                    email: "",
                    realm: ""
                },
                rules: {
                    email: [{required: true, message: "Email is required", trigger: "blur"}, {type: "email", message: "Enter a valid email", trigger: "blur"}],
                    realm: [{required: true, trigger: "blur"}]
                },
                loading: false,
                recaptcha_token: ''
            };
        },

        methods: {
            async recaptcha() {
                // (optional) Wait until recaptcha has been loaded.
                try {
                    this.loading = true
                    this.recaptcha_token = ""

                    await this.$recaptchaLoaded()

                    // Execute reCAPTCHA with action "login".
                    this.recaptcha_token = await this.$recaptcha('reset')
                    this.handleReset()
                } catch (err) {
                    this.recaptcha_token = ''
                    this.loading = false
                }
            },
            handleReset() {
                this.$refs["reset_form"].validate(valid => {
                    if (valid) {
                        this.$refs["realm_input"].setRealm(this.reset);
                        this.loading = false
                    }else {
                        this.loading = false
                    }
                });
            },

            reset() {

                this.reset_form.token = this.recaptcha_token

                this.axios
                    .post("/accounts/reset", this.reset_form)
                    .then(res => {
                        this.$helpers.successHandle("Request successful, check your email for further instructions", this);
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    };
</script>

<style lang="scss">
    @import "Login";
</style>
