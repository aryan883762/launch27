<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" :visible.sync="showModal" @close="settingsRedirect" appendToBody custom-class="fullscreen-modal-display" title="Company Settings">
            <el-container class="modal-body company-general">
                <el-row :gutter="20" v-loading="loading">
                    <el-col :md="16" :sm="16" :xs="24">
                        <el-form :model="company" :rules="rules" class="bg-white padding-2x" label-position="top" ref="companyfrm">
                            <el-row :gutter="40">
                                <view-changes :id="$auth.user().company.id" link-type="button" model-name="company"></view-changes>

                                <el-col :sm="24">
                                    <el-upload :action="getFileUrl()" :before-upload="beforeUpload" :headers="getHeaders()" :on-error="uploadError" :on-progress="uploadProgress" :on-success="uploadSuccess" :show-file-list="false" class="avatar-uploader company-logo-uploader" style="max-width: 180px;margin: 0 auto;">
                                        <el-avatar :size="178" :src="logo" fit="contain">
                                            <i class="el-icon-plus avatar-uploader-icon" v-if="!logo"/>
                                        </el-avatar>
                                        <small style="display: block;">{{ logo !== '' ? "Click to change" : "Add new logo"}}</small>
                                    </el-upload>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item label="Name" prop="business_name">
                                        <el-input v-model="company.business_name"/>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item label="Email">
                                        <el-input disabled readonly type="email" v-model="company.email"/>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item label="Website">
                                        <el-input v-model="company.business_url"/>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item label="Support Phone number" prop="phone">
                                        <el-input type="tel" v-model="company.phone">
                                            <span slot="prepend" v-if="company.country_selected"> ({{ company.country_selected.emoji }} +{{ company.country_selected.phone }}) </span>
                                        </el-input>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item label="Support Email" prop="support_email">
                                        <el-input type="email" v-model="company.support_email"/>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item :label="'Time Zone'">
                                        <el-select v-model="company.timezone">
                                            <el-option :key="tz.timezone" :label="tz.label" :value="tz.timezone" v-for="tz in time_zones"/>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="40">
                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item label="Subdomain (.launch27.com)">
                                        <el-input disabled readonly type="text" v-model="company.subdomain"/>
                                    </el-form-item>
                                </el-col>

                             <!--   <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item label="Booking URL">
                                        <el-input type="text" v-model="company.booking_url"/>
                                    </el-form-item>
                                </el-col>-->

                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item prop="country_code">
                                        <span slot="label">
                                          Country -
                                          <span class="currency" v-if="company.country_selected">Currency: <strong>{{ company.country_selected.currency }} {{ company.country_selected.emoji }} </strong></span>
                                        </span>
                                        <el-form-item prop="country">
                                            <el-select @change="onChange" autocomplete="nope" disabled filterable placeholder="Country" v-model="company.country" value-key="name">
                                                <el-option-group :key="group.label" :label="group.label" v-for="group in [{ label: 'Popular', countries: [countries['AU'], countries['CA'], countries['NZ'], countries['ZA'], countries['US'], countries['GB']] }, { label: 'Countries', countries: countries }]">
                                                    <el-option :key="country.name" :value="country.name" v-for="country in group.countries">
                                                        {{ country.emoji }} {{ country.name }} (+{{ country.phone }})
                                                    </el-option>
                                                </el-option-group>
                                            </el-select>
                                        </el-form-item>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24"/>

                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item :label="'Date (' + company.date_format + ')'">
                                        <el-select v-model="company.date_format">
                                            <el-option :label="$moment().format('DD-MM-YYYY')" value="DD-MM-YYYY"/>
                                            <el-option :label="$moment().format('MM-DD-YYYY')" value="MM-DD-YYYY"/>
                                            <el-option :label="$moment().format('YYYY-MM-DD')" value="YYYY-MM-DD"/>
                                            <el-option :label="$moment().format('DD.MM.YYYY')" value="DD.MM.YYYY"/>
                                            <el-option :label="$moment().format('MM.DD.YYYY')" value="MM.DD.YYYY"/>
                                            <el-option :label="$moment().format('MM/DD/YYYY')" value="MM/DD/YYYY"/>
                                            <el-option :label="$moment().format('DD/MM/YYYY')" value="DD/MM/YYYY"/>
                                            <el-option :label="$moment().format('Do/MM/YYYY')" value="Do/MM/YYYY"/>
                                            <el-option :label="$moment().format('MM/Do/YYYY')" value="MM/Do/YYYY"/>
                                        </el-select>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="6" :sm="6" :xs="12">
                                    <el-form-item class="color-picker-append" label="Main Site Color">
                                        <el-input v-model="company.main_color">
                                          <span slot="append">
                                            <el-color-picker v-model="company.main_color"/>
                                          </span>
                                        </el-input>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="6" :sm="6" :xs="12">
                                    <el-form-item class="color-picker-append" label="Button Color">
                                        <el-input v-model="company.button_color">
                                          <span slot="append">
                                            <el-color-picker v-model="company.button_color"/>
                                          </span>
                                        </el-input>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="12" :sm="12" :xs="24">
                                    <el-form-item :label="'Time Format ( 1:20 PM / 13:20 )'">
                                        <el-select v-model="company.time_format">
                                            <el-option :label="$moment().format('hh:mm a')" value="hh:mm a"/>
                                            <el-option :label="$moment().format('HH:mm')" value="HH:mm"/>
                                        </el-select>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="24" :sm="24" :xs="24">
                                    <el-button @click="saveCompanySettings()" class="block-center" round size="small" type="primary">
                                        Save Your Settings
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-col>

                    <side-help/>
                </el-row>
            </el-container>
        </el-dialog>
    </div>
</template>

<script>
    import SideHelp from '../components/SideHelp.vue'
    import {countries} from 'countries-list'
    import ViewChanges from "../../components/ViewChanges";

    export default {
        components: {SideHelp, ViewChanges},
        name: 'SettingsCompanyGeneral',
        data() {
            return {
                showModal: false,
                company: {},
                countries: countries,
                time_zones: [],
                rules: {
                    business_name: [{
                        Message: 'Company name is required',
                        required: true,
                    }],
                    button_color: [{
                        Message: 'Button color required',
                        required: true,
                    }],
                    main_color: [{
                        Message: 'Main color required',
                        required: true,
                    }],
                    phone: [{
                        Message: 'Company phone number is required',
                        required: true,
                    }]
                },
                loading: false,
                logo: ''
            }
        },
        mounted() {
            this.showModal = true

            this.loading = true

            this.axios
                .get('/companies/current', {params: {filter: {include: 'account'}}})
                .then(res => {
                    this.company = res.data
                    this.company.country_selected = this.company.country
                    this.company.country = this.company.country.name
                    this.company.email = this.company.account.email
                    this.logo = this.company.business_logo

                    this.loadTimeZones()

                })
                .catch(err => {
                    this.$helpers.errorHandle(err, this)
                })
                .finally(() => {
                    this.loading = false
                })

            this.axios.get('/companies/current/states')
                .then(
                    res => {
                    }
                )

            this.$events.emitEvent('track-page')

        },
        methods: {
            settingsRedirect() {
                this.$router.back()
            },
            saveCompanySettings() {
                this.$refs.companyfrm.validate(valid => {
                    if (valid) {
                        this.loading = true
                        let data = JSON.parse(JSON.stringify(this.company))
                        data.country = this.company.country_selected
                        data.timezone = this.company.timezone

                        delete data.subscription
                        delete data.locations
                        delete data.payment_methods
                        delete data.settings
                        delete data.account
                        delete data.country_selected
                        delete data.onboarding

                        this.axios
                            .put('/companies', data)
                            .then(res => {
                                this.$auth.fetch({
                                    success: () => {
                                        this.$message.success('Company settings saved')
                                    }
                                })
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(() => {
                                this.loading = false
                            })
                    }
                })
            },

            getHeaders() {
                return {Authorization: this.$auth.token()}
            },
            getFileUrl() {
                return process.env.VUE_APP_API_HOST + '/api/containers/' + process.env.VUE_APP_STORAGE_FOLDER + '/upload'
            },

            uploadSuccess(res, file) {
                this.company.business_logo = 'https://storage.googleapis.com/' + process.env.VUE_APP_STORAGE_FOLDER + '/' + res.result.files.file[0].name
                this.logo = this.company.business_logo
                this.loading = false
            },

            uploadError() {
                this.loading = false
            },

            beforeUpload() {
                this.loading = true
                return true
            },

            uploadProgress(event, file, fileList) {
            },
            loadTimeZones() {
                this.loading = true
                this.axios
                    .get('/companies/timezones', {params: {country_code: this.company.country_selected.isoCode}})
                    .then(res => {
                        this.time_zones = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },

            onChange(event) {
                for (let key in this.countries) {
                    let country = this.countries[key]
                    if (country.name === event) {
                        this.company.country_selected = country
                        this.company.country_selected.isoCode = key
                        break
                    }
                }
            }
        }
    }
</script>
<style lang="scss">
    .modal-body.company-general {
        .el-input-group__append,
        .el-input-group__prepend {
            color: #909399;
            vertical-align: middle;
            display: table-cell;
            position: relative;
            padding: 0 2px;
            width: 1px;
            white-space: nowrap;

        }

        .color-picker-append {
            .el-input-group__append,
            .el-input-group__prepend {
                background: white;
                border: none;
            }
        }

        .company-logo-uploader {
            max-width: 190px;
            margin: 0 auto;
        }

    }
</style>
