<template>
    <el-form :model="company_form" :rules="rules" class="" ref="company_form" v-loading="loading">

        <onboarding-steps current_step="1" illustration="company" v-if="stage === 1"></onboarding-steps>
        <onboarding-steps current_step="2" illustration="logo" v-if="stage === 2"></onboarding-steps>


        <div class="divider-1x" v-if="stage == 1">
            <h2>Welcome {{ $auth.user().first_name }}!</h2>
        </div>

        <p v-if="stage == 1">You are only a few minutes away from building a bigger business with Launch27. <br/>So tell
            us a bit about your business</p>

        <div class="form-container">
            <el-row :gutter="40" v-if="stage === 1">

                <el-col :md="24" :sm="24" :xs="24">
                    <el-form-item label=" " prop="business_name">
                        <el-input autocomplete="nope" placeholder="Business Name" v-model="company_form.business_name"/>
                    </el-form-item>
                </el-col>
                <el-col :md="24" :sm="24" :xs="24">
                    <el-form-item label=" " prop="subdomain">
                        <el-input @focus="subdomain_changed = true" autocomplete="nope"
                                  placeholder="Subdomain (.launch27.app)" v-model="company_form.subdomain"/>
                    </el-form-item>
                </el-col>
                <el-col :md="24" :sm="24" :xs="24">
                    <el-form-item label=" " prop="industry">
                        <el-select filterable placeholder="Which industry are you in?" v-model="company_form.industry">
                            <el-option :key="industry.industry_code" :label="industry.name"
                                       :value="industry.industry_code" v-for="industry in industries"/>
                        </el-select>
                    </el-form-item>
                </el-col>

                <el-col :md="12" :sm="12" :xs="24">
                    <el-form-item label=" " prop="country">
                        <el-row :gutter="10">
                            <el-col :sm="24" :xs="24">
                                <el-select @change="onChange" autocomplete="nope" filterable placeholder="Country"
                                           style="width: calc(100% - 70px);" v-model="company_form.country"
                                           value-key="name">
                                    <el-option-group :key="group.label" :label="group.label"
                                                     v-for="group in [{ label: 'Popular', countries: [countries['AU'], countries['CA'], countries['NZ'], countries['ZA'], countries['US'], countries['GB']] }, { label: 'Countries', countries: countries }]">
                                        <el-option :key="country.name" :value="country.name"
                                                   v-for="country in group.countries"> {{ country.emoji }} {{
                                            country.name }} (+{{ country.phone }})
                                        </el-option>
                                    </el-option-group>
                                </el-select>
                                <span class="currency" v-if="company_form.country_selected">
                    <strong>{{ company_form.country_selected.currency.split(",")[0] }} {{ company_form.country_selected.emoji }} </strong>
                  </span>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </el-col>

                <el-col :md="12" :sm="12" :xs="24">
                    <el-form-item label=" " prop="timezone">
                        <el-select autocomplete="nope" filterable v-model="company_form.timezone">
                            <el-option :key="tzIndex" :value="tz.timezone" v-for="(tz, tzIndex) in country_timezones">{{
                                tz.label }}
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>

                <el-col :md="12" :sm="12" :xs="24">
                    <el-form-item label=" " prop="business_address">
                        <form autocomplete="off" onsubmit="return false">
                            <vue-google-autocomplete :country="[company_form.country_selected.isoCode]"
                                                     autocomplete="false" classname="el-input__inner"
                                                     id="company_address_auto"
                                                     placeholder="Where is your business located?" ref="locationfrm"
                                                     v-on:placechanged="getAddressData"></vue-google-autocomplete>
                        </form>
                    </el-form-item>
                </el-col>

                <el-col :md="12" :sm="12" :xs="24">
                    <el-form-item prop="business_url">
                        <el-input placeholder="What is your business url (optional)"
                                  v-model="company_form.business_url"/>
                    </el-form-item>
                </el-col>

            </el-row>

            <el-row :gutter="40" v-if="stage === 2">
                <el-col>


                    <h2>Next, let's customize your portal</h2>


                    <el-row>
                        <el-col :md="12" :sm="12" :xs="24">
                            <p style="font-size: 17px; margin: 0; ">
                                Add your logo (don't worry... you can skip this part if
                            </p>
                            <p style="font-size: 17px; margin: 0; ">
                                you don't have one yet).
                            </p>
                            <el-upload :action="getFileUrl()" :before-upload="beforeLogoUpload" :headers="getHeaders()"
                                       :limit="1" :on-preview="handlePreview" :on-remove="handleRemove"
                                       :on-success="uploadSuccess" :show-file-list="true" class="">
                                <el-button class="text-button" style="padding:10px 0 0px;" type="text">
                                    UPLOAD YOUR LOGO
                                </el-button>
                            </el-upload>
                        </el-col>

                        <el-col :md="12" :sm="12" :xs="24">
                            <el-upload :action="getFileUrl()" :before-upload="beforeLogoUpload" :headers="getHeaders()"
                                       :limit="1" :on-preview="handlePreview" :on-remove="handleRemove"
                                       :on-success="uploadSuccess" :show-file-list="true"
                                       class="avatar-uploader pull-right">
                                <img :src="logo_url" style="height: 89px; display: block; margin: 0 auto;"
                                     v-if="logo_url"/>
                                <i class="avatar-uploader-icon" v-else>
                                    <img src="@/assets/svgs/onboarding/upload.svg" svg-inline/>
                                </i>
                            </el-upload>
                        </el-col>
                    </el-row>


                    <el-divider></el-divider>

                    <el-row style="    display: flex;align-items: center;">
                        <el-col :md="12" :sm="12" :xs="24">
                            <p style="font-size: 17px; margin: 0; display: inline">
                                Next, choose your company colors (again, skip if
                            </p>
                            <p style="font-size: 17px; margin: 0;">
                                you don't have these yet).
                            </p>
                        </el-col>

                        <el-col :md="12" :sm="12" :xs="24" class="text-center">
                            <div class="inline-block padding-2x pull-right">
                                <el-color-picker class="block-center" v-model="company_form.button_color"/>
                                <span class="block-center">
                                      Button Color
                                    </span>
                            </div>
                            <div class="inline-block padding-2x pull-right" style="padding-right: 0px;">
                                <el-color-picker class="block-center" v-model="company_form.main_color"/>
                                <span class="block-center">
                                Main Color
                              </span>
                            </div>
                        </el-col>
                    </el-row>

                    <el-divider></el-divider>

                </el-col>

            </el-row>

            <el-row>
                <el-col :md="24" :sm="24" :xs="24" class="button-container">
                    <el-button @click="stage = 1" class="pull-left" plain round size="small" style="min-width: 100px"
                               type="warning" v-if="stage === 2">
                        Back
                    </el-button>

                    <el-button :loading="loading" @click="next(false)" class="pull-right" round size="small"
                               style="min-width: 100px" type="warning">
                        Next
                    </el-button>
                </el-col>
            </el-row>
        </div>
    </el-form>
</template>

<script>
    import {countries} from "countries-list";
    import VueGoogleAutocomplete from "vue-google-autocomplete";
    import {redirectWithSubdomain} from "@/utils/subdomain_helper.js";
    import OnboardingSteps from "./OnboardingSteps";

    export default {
        components: {
            OnboardingSteps,
            VueGoogleAutocomplete
        },
        data: () => {
            return {
                company_form: {
                    business_logo: "",
                    business_name: "",
                    industry: "",
                    country: "",
                    country_selected: false,
                    business_url: "",
                    main_color: "",
                    button_color: "",
                    currency: "",
                    business_address: "",
                    coordinates: [0, 0],
                    timezone: "",
                    subdomain: ""
                },
                loading: false,
                logo_url: false,
                stage: 1,
                activeCompany: false,
                countries: countries,
                industries: [],
                rules: {
                    business_name: [{message: "Business name is required", required: true}],
                    industry: [{message: "Select industry of your business", required: true}],
                    country: [{message: "Select where your business is located", required: true}],
                    business_address: [{message: "Please provide your business location", required: true}],
                    timezone: [{message: "A timezone is required", required: true}],
                    subdomain: [{type: "string", message: "Subdomain is required", required: true}, {
                        min: 3,
                        message: "Subdomain length should be atleast 3"
                    }, {
                        type: "string",
                        pattern: /(^[a-z0-9]+)([a-z0-9]+$)/,
                        message: "Subdomain must be only lowercase letters and digits. Spaces and special characters are not allowed"
                    }],
                    // business_url: [{message: "Provide a valid url", required: false, type: "url"}]s
                },
                country_timezones: [],
                subdomain_changed: false
            };
        },

        watch: {
            "company_form.business_name": function (value) {
                if (!this.subdomain_changed) {
                    this.company_form.subdomain = value.toLowerCase().replace(/[^A-Z0-9]/ig, "");
                }
            },
            "stage"(val) {
                if (val === 1) {
                    //console.log()
                    //update the google places box
                    this.$nextTick(() => {
                        this.$refs.locationfrm.update(this.company_form.business_address || this.company_form.locations[0].name)
                    })
                }
            }
        },

        created() {
        },

        mounted() {
            this.$events.emitEvent("illustration", ["company", 1]);

            if (this.$auth.user().company) {
                this.company_form = JSON.parse(JSON.stringify(this.$auth.user().company));

                //update the google places box
                this.$refs.locationfrm.update(this.company_form.locations[0].name);

                // delete some fields from company form
                delete this.company_form.accountId;
                delete this.company_form.locations;
                delete this.company_form.serviceCategories;

                this.logo_url = this.company_form.business_logo;

                this.subdomain_changed = true;
            }

            // set the default country
            if (this.$auth.user().country) {
                this.company_form.country_selected = this.$auth.user().country;
                this.company_form.country = this.$auth.user().country.name;
            }

            (async context => {
                try {
                    this.loading = true;
                    this.industries = await this.getIndustries(context);
                    this.country_timezones = await this.getTimezone(context);

                    this.loading = false;
                } catch (err) {
                    this.loading = false;
                    this.$helpers.errorHandle(err, this)
                }
            })(this);
        },

        methods: {
            next(quick_setup) {
                // save data before
                // check if the
                // use put to post or replace

                this.$refs["company_form"].validate(valid => {
                    if (valid) {
                        let data = {
                            business_name: this.company_form.business_name,
                            country: this.company_form.country_selected,
                            industry: this.company_form.industry,
                            business_url: this.company_form.business_url,
                            button_color: this.company_form.button_color,
                            main_color: this.company_form.main_color,
                            business_logo: this.logo_url || "",
                            business_address: this.company_form.business_address,
                            coordinates: this.company_form.coordinates,
                            timezone: this.company_form.timezone,
                            subdomain: this.company_form.subdomain
                        };

                        if (this.company_form.hasOwnProperty("id")) data.id = this.company_form.id;

                        (async () => {
                            try {
                                this.loading = true
                                let company = await this.updateCompany(data);
                                this.company_form = company;
                                this.company_form.country_selected = company.country;
                                this.company_form.country = company.country_selected.name;
                                this.company_form.timezone = company.timezone;

                                this.$auth.fetch({
                                    params: {},
                                    success: () => {
                                        if (quick_setup) {
                                            //move to get started
                                            this.axios
                                                .patch("/onboardings/" + company.onboarding.id, {
                                                    company_setup: true,
                                                    services: true,
                                                    opening: true,
                                                    teams: true,
                                                    complete: true
                                                })
                                                .then(res => {
                                                    this.loading = false
                                                    this.$router.push({name: "dashboard_getting_started"});
                                                    redirectWithSubdomain(this.$subdomain.name);
                                                })
                                                .catch(err => {
                                                    this.$helpers.errorHandle(err, this)
                                                })
                                                .finally(() => {
                                                    this.loading = false
                                                })
                                            return;
                                        } else {
                                            this.loading = false
                                        }

                                        if (this.stage === 1) {
                                            this.stage++;
                                            this.$events.emitEvent("onboarding-next-logo")
                                        } else {
                                            this.$events.emitEvent("onboarding-get-started");
                                        }
                                    },
                                    error: (err) => {
                                        this.loading = false
                                        this.$helpers.errorHandle(err, this)
                                    }
                                });
                            } catch (err) {
                                this.$helpers.errorHandle(err, this)
                                this.loading = false
                            }
                        })();
                    }
                });
            },

            getIndustries(context) {
                return new Promise((resolve, reject) => {
                    context.axios
                        .get("/services/industries")
                        .then(res => {
                            resolve(res.data);
                        })
                        .catch(err => {
                            reject(err);
                        })
                        .then(err => {
                        });
                });
            },

            getTimezone(context) {
                return new Promise((resolve, reject) => {
                    context.axios
                        .get("/companies/timezones", {params: {country_code: context.company_form.country_selected.isoCode}})
                        .then(res => {
                            resolve(res.data);
                        })
                        .catch(err => {
                            reject(err);
                        })
                        .then(() => {
                        });
                });
            },

            updateCompany(data) {
                return new Promise((resolve, reject) => {
                    if (!data.hasOwnProperty("id")) {

                        //first check if company already not exits
                        (async () => {
                            try {

                                let company = (await this.axios.get("/accounts/" + this.$auth.user().id + "/company")).data

                                if (company) {
                                    //then do n update
                                    this.axios
                                        .put("/accounts/" + this.$auth.user().id + "/company", data)
                                        .then(res => {
                                            resolve(res.data);
                                        })
                                        .catch(err => {
                                            reject(err);
                                        });
                                }

                            } catch (err) {
                                this.axios
                                    .post("/accounts/" + this.$auth.user().id + "/company", data)
                                    .then(res => {
                                        // fetching company with all includes
                                        if (res.data.id) {
                                            this.axios
                                                .get("/accounts/" + this.$auth.user().id + "/company")
                                                .then(res => {
                                                    resolve(res.data);
                                                })
                                                .catch(err => {
                                                    reject(err);
                                                });
                                        } else {
                                            resolve(res.data);
                                        }
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                            }
                        })()


                    } else {
                        this.axios
                            .put("/accounts/" + this.$auth.user().id + "/company", data)
                            .then(res => {
                                resolve(res.data);
                            })
                            .catch(err => {
                                reject(err);
                            });
                    }
                });
            },

            getHeaders() {
                return {Authorization: this.$auth.token()};
            },
            getFileUrl() {
                return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
            },

            prev() {
                this.$events.emitEvent("onboarding-prev");
            },

            uploadSuccess(res, file) {
                this.logo_url = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
            },
            handlePreview() {
            },
            handleRemove() {
                this.logo_url = "";
            },
            beforeLogoUpload(file) {

                if (file) {
                    const imgList = ["image/bmp", "image/gif", "image/jpeg", "image/png"];
                    const isLt2M = file.size / 1024 / 1024 < 2;

                    if (imgList.includes(file.type) && isLt2M) {
                        return file;
                    }

                    if (!imgList.includes(file.type)) {
                        this.$helpers.errorHandle('Logo must be JPG,GIF,PNG format!');
                        return false;
                    }
                    if (!isLt2M) {
                        this.$helpers.errorHandle('Logo size can not exceed 2MB!');
                        return false;
                    }

                }
            },

            onChange(event) {
                this.company_form.timezone = "";

                let country;
                for (let key in this.countries) {
                    country = this.countries[key];
                    if (country.name === event) {
                        this.company_form.country_selected = country;
                        this.company_form.country_selected.isoCode = key;
                        break;
                    }
                }

                this.loading = true;
                this.getTimezone(this)
                    .then(res => {
                        this.country_timezones = res;
                        this.loading = false;
                    })
                    .catch(err => {
                        this.loading = false;
                    });
            },

            getAddressData(addressData, placeResultData, id) {
                this.company_form.business_address = placeResultData.formatted_address;
                this.company_form.coordinates = {
                    lat: placeResultData.geometry.location.lat(),
                    lng: placeResultData.geometry.location.lng()
                };
                this.$refs["company_form"].validate()
            }
        }
    };
</script>

<style lang="scss">
    @import "themes/Company.scss";
</style>
