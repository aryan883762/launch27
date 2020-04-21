<template>
    <el-container class="signup-page unauth" v-show="ready">
        <el-main>
            <el-row class="contain-size">
                <el-col>
                    <a href="/login">
                        <svg height="24px" width="135px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <image
                                    height="18px"
                                    width="120px"
                                    x="0px"
                                    xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAYCAMAAADnCR6uAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAYFBMVEUAAAD/hgT/hgT/hgT/hgT/hgT/hgRyc3X/hgT/hgT/hgT/hgT/hgT/hgT/hgRyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3X/hgRyc3X/hgT///8q9MMLAAAAHXRSTlMAM4i77kQiu2YR3cx3qpkiiO5md8zdEaozVZlEVYVmdPkAAAABYktHRB8FDRC9AAAAB3RJTUUH4wIbFAcyPWWMmQAAAklJREFUSMfFlu2WgiAQhjEqNG0LUfIjuv/LXGAGBUSrPZ12fuwiDDMPr8MkIR82pW05m+3o4/HY011mHw+PyI6EJfd9luNI54w0S3EcvsGR7YOc+T/pUZxsqpLSEpJmCw5KvsBRmUzno0Xa2bG/eobX8gUO6qe2UN7iEeX4AscPpTRzDwUef1p0zx7H5aofOKttMBaGRDdmF4T+11wvU7CLYFy1rJaOQ4pGqfZWJzhDjkmOmUPeFFrTbXJ0LfphGnl1G9sONvUcJ5iMMQ5wOxZyTByyUZM1Wxx89qvjja0kKrBbhJGbK7xPyDFxWDWGkciewVHWOAynENadm+OCGg3TKnHUQwOhh+qwLO7VWZcJ3NIqlOPuJxg9oYcnHMJMjBxGF0thamVkHdYHeHTG42qP/eM3i7IIivYUJBjcHmPtJgdqLWBo5Gi8MrCywrCGMFE/pRMGXOJ8kaBz62KTA92MEC3M9CTkQA8JAYoZo6TVXKOwcAoTBNd+3OTwM8JfGXGEY9tDy9wDSMjxEQ6yyVHGrTwlh4vcJt6LmXPNiq9x8Kd6RB00LYd/0MHNYZ0yV/lAluZg8z17jyOUw0UWiXtr5vhoZmq+yiFcH9F1+RZHFbYSjCz5so9J17SwYyY57Eauf1pkzYdVjvjrS5v5KtkXMYe97L4xJxI2yDUO30kN8mWOPJRjjuzFcw1omuO1WOWA14h+48sckRxe5BFeiGpGcwksh/4UaPSXgJBkg4P07geYdS+/l1iOwGQvRN2R960XjN3EX3Y6+wVNBooECZNeKAAAAABJRU5ErkJggg=="
                                    y="0px"
                            />
                        </svg>
                    </a>
                </el-col>
            </el-row>
            <el-row class="contain-size" :gutter="40" style="margin-top: 40px; margin-bottom: 50px! important">
                <el-col class="unpad-left">
                     <h1 class="text-center">
                         You are about to join the thousands of successful users that power their local service business with <a href="https://launch27.com" target="_blank">Launch27</a>
                    </h1>

                </el-col>
                <el-col  style="margin-top: 40px; padding-left: -5px !important;" >
                    <el-row :gutter="20">
                        <el-col :md="24" :sm="24"/>
                        <el-col :md="24" :sm="24" class=" bullets-list divider highlights">
                            <span class="flex-row-center"> <img class="svg-icon" src="@/assets/svgs/signup/creditcard.svg"/>NO credit card required </span>
                            <span class="flex-row-center"> <img class="svg-icon" src="@/assets/svgs/signup/chat.svg"/>24/7 chat support </span>
                            <span class="flex-row-center"> <img class="svg-icon" src="@/assets/svgs/signup/features.svg"/>All features included in trial </span>
                        </el-col>

                        <testimonial class="hidden-xs-only"></testimonial>

                        <el-col :md="14" :sm="14" :xs="24">

                                <el-form :model="signup_form" :rules="rules" class="sub-container"  style="padding: 0px 20px 0px;" ref="signupform">
                                    <div class="divider-1x">
                                        <h3 style="margin : 0px 0px 30px;">To start building your portal</h3>
                                    </div>

                                    <el-form-item label=" " prop="first_name">
                                        <el-input autocomplete="nope" placeholder="First Name" type="text" v-model="signup_form.first_name"/>
                                    </el-form-item>

                                    <el-form-item label=" " prop="last_name">
                                        <el-input autocomplete="nope" placeholder="Last Name" type="text" v-model="signup_form.last_name"/>
                                    </el-form-item>

                                    <el-row :gutter="10">
                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item label=" " prop="country">
                                                <el-select @change="onChange" autocomplete="nope" filterable placeholder="Country" v-model="signup_form.country" value-key="name">
                                                    <el-option-group :key="group.label" :label="group.label" v-for="group in [{ label: 'Popular', countries: [countries['AU'], countries['CA'], countries['NZ'], countries['ZA'], countries['US'], countries['GB']] }, { label: 'Countries', countries: countries }]">
                                                        <el-option :key="country.name" :value="country.name" v-for="country in group.countries"> {{ country.emoji }} {{ country.name }} (+{{ country.phone }})</el-option>
                                                    </el-option-group>
                                                </el-select>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item label=" " prop="phone">
                                                <el-input placeholder="Phone" type="number" v-model="signup_form.phone">
                                                    <span slot="prepend" v-if="signup_form.country_selected"> ({{ signup_form.country_selected.emoji }} +{{ signup_form.country_selected.phone }}) </span>
                                                </el-input>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>

                                    <el-form-item label=" " prop="email">
                                        <el-input autocomplete="nope" placeholder="Email Address" type="text" v-model="signup_form.email"/>
                                    </el-form-item>

                                    <el-form-item class="signup-pass-input" style="margin-bottom: 12px !important;" label=" " prop="password">
                                        <el-input placeholder="Password" show-password type="password" v-model="signup_form.password"/>
                                        <small>Min 6 characters, must include digits and symbols</small>
                                    </el-form-item>

                                    <el-form-item style="margin-bottom: 0">
                                        <el-button @click="recaptcha()" style="width: 300px;" class="block-center button-large" round type="primary" :loading="loading">
                                            Start your free trial
                                        </el-button>
                                    </el-form-item>

                                    <el-form-item style="text-align: center">
                                        <router-link class="text-center login-link" to="/login">
                                            Already have an account?, Login here!
                                        </router-link>
                                    </el-form-item>
                                </el-form>

                        </el-col>

                        <testimonial class="hidden-sm-and-up"></testimonial>

                    </el-row>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>

<script>
    import {countries} from "countries-list";
    import Testimonial from "../../components/SignTestimonial.vue";
    import {redirectWithNoSubdomain} from "@/utils/subdomain_helper.js";

    export default {
        components: {
            Testimonial
        },
        data: () => {
            return {
                signup_form: {
                    first_name: "",
                    last_name: "",
                    phone: "",
                    company_name: "",
                    password: "",
                    email: "",
                    country: "",
                    country_code: "",
                    country_selected: false,
                    role: "r_admin"
                },

                rules: {
                    first_name: [
                        {
                            required: true,
                            message: "Your first name is required",
                        }
                    ],
                    last_name: [
                        {
                            required: true,
                            message: "Your last name is required",
                        }
                    ],
                    phone: [
                        {
                            required: true,
                            message: "Enter your contact phone number",
                        }
                    ],
                    country: [
                        {
                            required: true,
                            message: "Choose your country of operation",
                        }
                    ],
                    password: [
                        {
                            required: true,
                            message: "Enter a strong password",
                        }
                    ],
                    company_name: [
                        {
                            required: true,
                            message: "Provide your company name",
                        }
                    ],
                    email: [{required: true, message: "Email is required", trigger: "blur"}, {type: "email", message: "Enter a valid email", trigger: "blur"}]
                },

                phoneInput: false,
                countries: countries,
                loading: false,
                ready: false,
                recaptcha_token : ""
            };
        },
        created() {
            //delete all
            window.localStorage.clear()

            // is page has a subdomain, we redirect without it.
            if (!redirectWithNoSubdomain()) {
                this.ready = true;
            }
        },
        mounted() {
        },
        methods: {
            async recaptcha() {
                // (optional) Wait until recaptcha has been loaded.
                try {
                    this.loading = true
                    this.recaptcha_token = ""

                    await this.$recaptchaLoaded()

                    // Execute reCAPTCHA with action "login".
                    this.recaptcha_token = await this.$recaptcha('signup')
                    this.signup()

                } catch (err) {
                    console.log(err)
                    this.loading = false
                }
            },

            onInput({number, isValid, country}) {
                if (isValid) {
                    this.signup_form.phone = number;
                    this.signup_form.country = country.iso2;
                } else {
                    this.signup_form.phone = "";
                }
            },

            signup() {
                // send data to the server and create account.
                let self = this;

                this.$refs["signupform"].validate(valid => {
                    if (valid) {
                        this.loading = true;
                        this.$auth.register({
                            data: {
                                email: this.signup_form.email,
                                password: this.signup_form.password,
                                first_name: this.signup_form.first_name,
                                last_name: this.signup_form.last_name,
                                phone: this.signup_form.phone,
                                role: this.signup_form.role,
                                country: this.signup_form.country_selected,
                                realm: "default",
                                token : this.recaptcha_token
                            },
                            success: res => {
                                this.loading = false;
                            },
                            error: err => {
                                this.loading = false;
                                if (err.response && err.response.data) {
                                    self.$helpers.errorHandle(err,this)
                                } else {
                                    self.$message.error("Server not available");
                                }
                            },
                            autoLogin: true,
                            rememberMe: true,
                            redirect: {name: "onboarding_company"}
                        });
                    }else {
                        this.loading = false
                    }
                });
            },

            onChange(event) {
                for (let key in this.countries) {
                    let country = this.countries[key];
                    if (country.name === event) {
                        this.signup_form.country_selected = country;
                        this.signup_form.country_selected.isoCode = key;
                        break;
                    }
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "~intl-tel-input/build/css/intlTelInput.min.css";
    @import "Auth.scss";

    .contain-size{
        max-width: 960px;
        margin: 0 auto !important;
    }
    .unpad-left{
        padding-left: 0 !important;
    }

    .login-link{
        color: $launch-brand-color;
        display: inline-block;
        line-height: 2;
    }

    .signup-pass-input{
        .el-form-item__error{
            color: #F56C6C;
            font-size: 12px;
            line-height: 1;
            padding-top: 4px;
            position: absolute;
            top: 85%;
            left: 0;
        }
    }


</style>
