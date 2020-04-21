<template>
  <el-form :model="company_form" :rules="rules" class="" ref="company_form">
    <div class="divider-1x">
      <h2>Welcome {{ $auth.user().first_name }}</h2>
    </div>

    <p>You are only a few minutes aweay from building bigger business with Launch27. <br/>So tell us a bit about your business</p>

    <el-row :gutter="40">
      <el-col :md="12" :sm="12">
        <el-form-item prop="business_name">
          <el-input placeholder="Business Name" v-model="company_form.business_name"/>
        </el-form-item>
      </el-col>
      <el-col :md="12" :sm="12">
        <el-form-item prop="industry">
          <el-select placeholder="Which industry are you in?" v-model="company_form.industry">
            <el-option :key="industry.industry_code" :label="industry.name" :value="industry.industry_code" v-for="industry in industries"/>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :md="12" :sm="12">
        <el-form-item prop="country_code">
          <el-select placeholder="What country is your business in?" v-model="company_form.country_code">
            <el-option :key="code" :label="country.name + ' (' + code + ')'" :value="code" v-for="(country, code) in countries"/>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :md="12" :sm="12">
        <el-form-item>
          <el-input placeholder="What is your business url (optional)" v-model="company_form.business_url"/>
        </el-form-item>
      </el-col>
    </el-row>

    <div class="divider"/>
    <el-row>
      <el-col :md="12" :sm="12">
        <el-upload :action="getFileUrl()" :headers="getHeaders()" :limit="1" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="uploadSuccess" :show-file-list="true" class="avatar-uploader">
          <img :src="logo_url" class="business-logo" v-if="logo_url"/>
          <i class="avatar-uploader-icon" v-else>
            <img src="@/assets/svgs/onboarding/upload.svg" svg-inline/>
          </i>
        </el-upload>
      </el-col>

      <el-col :md="12" :sm="12"/>
    </el-row>

    <div class="divider"/>
    <el-row>
      <el-col :md="24" :sm="24">
        <el-button :loading="loading" @click="next" class="pull-right" round type="primary">
          Next
        </el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
    import {countries} from "countries-list";

    export default {
        data: () => {
            return {
                company_form: {
                    business_logo: "",
                    business_name: "",
                    industry: "",
                    country_name: "",
                    country_code: "",
                    business_url: ""
                },
                logo_url: false,
                activeCompany: false,
                countries: countries,
                industries: [
                    {
                        id: "cleaning",
                        name: "Cleaning (traditional/ non-traditional)"
                    },
                    {
                        id: "dogwalking",
                        name: "Dog Walking/ tutor/ handyman/ caregiving/ babysitting"
                    },
                    {
                        id: "equipment",
                        name: "Equipment rental/laundry"
                    },
                    {
                        id: "lawncare",
                        name: "Lawncare/ snow removal"
                    },
                    {
                        id: "painting",
                        name: "Painting/ Carpet Cleaning/ Window Washing"
                    }
                ],
                rules: {
                    business_name: [{message: "Business name is required", required: true, trigger: "blur"}],
                    industry: [{message: "Select industry of your business", required: true, trigger: "blur"}],
                    country_code: [{message: "Select where your business is located", required: true, trigger: "blur"}]
                },
                loading: false
            };
        },

        created() {
        },

        mounted() {
            this.$events.emitEvent("illustration", ["company", 1]);
            if (this.$auth.user().company) {
                this.company_form = JSON.parse(JSON.stringify(this.$auth.user().company));

                // delete some fields from company form
                delete this.company_form.accountId;
                delete this.company_form.locations;
                delete this.company_form.serviceCategories;

                this.logo_url = this.company_form.business_logo;
            }
        },

        methods: {
            next() {
                // save data before
                // check if the
                // use put to post or replace


                this.$refs["company_form"].validate(valid => {
                    if (valid) {
                        this.loading = true
                        let data = {
                            business_name: this.company_form.business_name,
                            country_code: this.company_form.country_code,
                            industry: this.company_form.industry,
                            business_url: this.company_form.business_url,
                            accountId: this.$auth.user().id,
                            business_logo: this.logo_url || ""
                        };

                        if (this.company_form.hasOwnProperty("id")) data.id = this.company_form.id;

                        this.axios
                            .put("/companies", data)
                            .then(res => {
                                this.$events.emitEvent("onboarding-next");
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(() => {
                                this.loading = false
                            })
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
            }
        }
    };
</script>

<style lang="scss">
  @import "themes/Company.scss";
</style>
