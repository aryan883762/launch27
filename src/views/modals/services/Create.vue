<template>
<div>
    <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="false" :visible.sync="showModal"
               @close="$router.back()" append-to-body custom-class="fullscreen-modal-display">
        <div class="modal-title-container" slot="title">
            <el-row>
                <el-col :sm="6" :xs="24">
            <span class="modal-title" v-if="!$route.params.id">
              Add a new Service
            </span>
                    <span class="modal-title" v-if="$route.params.id">
              Editing Service
            </span>
                </el-col>
            </el-row>
        </div>
        <div class="modal-body">
            <el-row :gutter="20" class="create-service-container">
                <el-col :md="16" :sm="16">
                    <el-card shadow="hover" v-loading="loading">
                        <el-form :model="form" :rules="rules" class="bg-white padding-2x" label-position="top"
                                 ref="servicesfrm" style="padding-top: 0px;padding-bottom:0px;">
                            <el-row :gutter="40">
                                <el-col :sm="12">
                                    <el-row :gutter="20">
                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item prop="name">
                                                <template slot="label">
                                                    <el-tooltip placement="top" effect="dark">
                                                        <div slot="content">
                                                            This is how you identify your service. <br/>
                                                            This name is visible both to staff and customers.
                                                        </div>
                                                        <span>Service Name <i class="el-icon-info"></i></span>
                                                    </el-tooltip>
                                                </template>
                                                <el-input v-model="form.name"/>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item prop="serviceCategoryIds">
                                                <template slot="label">
                                                    <el-tooltip placement="top" effect="dark">
                                                        <div slot="content">
                                                            Service Category helps you organize your services. <br/>
                                                            When you choose a category, all the services within that <br/>
                                                            category will show for you to choose from.
                                                        </div>
                                                        <span>Service Category <i class="el-icon-info"></i></span>
                                                    </el-tooltip>
                                                </template>
                                                <el-select collapse-tags filterable multiple
                                                           v-model="form.serviceCategoryIds">
                                                    <el-option :key="category.id" :label="category.name"
                                                               :value="category.id"
                                                               v-for="category in service_categories"/>
                                                </el-select>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item label="Service Description">
                                                <el-input :autosize="false" :rows="3" type="textarea"
                                                          v-model="form.description"/>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item>
                                                <template slot="label">
                                                    <el-tooltip placement="top" effect="dark">
                                                        <div slot="content">
                                                            These are notes you can add to a service that are visible to staff only.
                                                        </div>
                                                        <span>Service Staff Notes <i class="el-icon-info"></i></span>
                                                    </el-tooltip>
                                                </template>
                                                <el-input :autosize="false" :rows="3" type="textarea"
                                                          v-model="form.staff_notes"/>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item>
                                                    <el-tooltip placement="top" effect="dark">
                                                        <div slot="content">
                                                            This is a text visible on your booking form <br/>
                                                            that your customers will see when they choose your service.<br/>
                                                            As Part of Booking Payout- if this is enabled, <br/>
                                                            your team will get paid a percentage for this service.
                                                        </div>
                                                        <el-checkbox v-model="form.has_disclaimer">Add disclaimer text <i class="el-icon-info"></i></el-checkbox>
                                                    </el-tooltip>
                                                <el-input :autosize="false" :rows="3" type="textarea"
                                                          v-if="form.has_disclaimer" v-model="form.disclaimer"/>
                                            </el-form-item>
                                        </el-col>

                                    </el-row>
                                </el-col>

                                <el-col :sm="12">
                                    <el-row :gutter="20">
                                        <el-card>
                                            <el-col :md="12" :sm="12" :xs="24">
                                                <el-form-item :label="'Service Price (' + $currency +')'"
                                                              prop="base_price">
                                                    <el-input-number :min="0" controls-position="right"
                                                                     placeholder="Service Price"
                                                                     v-model="form.base_price">
                                                    </el-input-number>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24" v-show="!form.hourly">
                                                <el-form-item prop="duration">
                                                    <duration-picker :isRequired="true"
                                                                     v-model="form.duration"></duration-picker>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24">

                                                <el-checkbox label="Hourly Service" style="margin-bottom: 10px;"
                                                             v-model="form.hourly"/>
                                                <el-form-item prop="hourly_settings">
                                                    <el-row class="hourly" style="background:#f3f3f3; padding: 15px;"
                                                            v-if="form.hourly">
                                                        <el-row :gutter="20">
                                                            <el-col :sm="12">
                                                                <label>Minimum hrs</label>
                                                                <el-input placeholder="Min. hrs" type="number" :min="0"
                                                                          v-model="form.hourly_settings.hours_minimum"></el-input>

                                                            </el-col>
                                                            <el-col :sm="12">
                                                                <label>Maximum hrs</label>
                                                                <el-input placeholder="Max. hrs" type="number"
                                                                          :min="0"
                                                                          v-model="form.hourly_settings.hours_maximum">
                                                                </el-input>

                                                            </el-col>

                                                            <el-col :sm="12">
                                                                <label>Min. Teams</label>

                                                                <el-input placeholder="Min. hrs" type="number"
                                                                          :min="0"
                                                                          v-model="form.hourly_settings.teams_minimum">
                                                                </el-input>

                                                            </el-col>
                                                            <el-col :sm="12">
                                                                <label>Max. Teams</label>
                                                                <el-input placeholder="Max. hrs" type="number"
                                                                          :min="0"
                                                                          v-model="form.hourly_settings.teams_maximum">
                                                                </el-input>

                                                            </el-col>
                                                        </el-row>
                                                    </el-row>
                                                </el-form-item>


                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item v-if="company_locations.length > 0">
                                                    <el-checkbox label="All Locations" v-model="form.all_locations"/>
                                                    <el-select filterable multiple v-if="!form.all_locations"
                                                               v-model="form.locationIds">
                                                        <el-option :key="location.id" :label="location.name"
                                                                   :value="location.id"
                                                                   v-for="location in company_locations"/>
                                                    </el-select>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24" v-if="company_teams.length > 0">
                                                <el-form-item label="Teams">
                                                    <el-select filterable v-model="form.teamIds">
                                                        <el-option :key="team.id" :label="team.name" :value="team.id"
                                                                   v-for="team in company_teams"/>
                                                    </el-select>
                                                </el-form-item>
                                            </el-col>

                                        </el-card>

                                        <el-divider></el-divider>

                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item label="Add Tags (Press Enter to attach tag)">
                                                <!-- <el-select allow-create clearable default-first-option filterable multiple v-model="form.tags">
                                                   <el-option :key="tag.name" :label="tag.name" :value="tag.name" v-for="tag in form.tags" />
                                                 </el-select>-->

                                                <tags v-model="form.tagIds"></tags>
                                            </el-form-item>
                                        </el-col>

                                    </el-row>
                                </el-col>

                            </el-row>
                            <el-row>
                                <el-col>
                                    <el-divider>Additional Options & Service Icon</el-divider>
                                </el-col>
                                <el-col :md="10" :sm="10" :xs="24" class="toggles">
                                    <el-form-item>
                                        <el-row>
                                            <el-col>
                                                <el-switch active-color="green" inactive-text="Private service"
                                                           style="display: block; margin-bottom : 10px;"
                                                           v-model="form.private"/>
                                            </el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col>
                                                <el-switch active-color="green" inactive-text="Part of Booking Payout"
                                                           style="display: block; margin-bottom : 10px;"
                                                           v-model="form.payout_included"/>
                                            </el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col>
                                                <el-tooltip placement="top" effect="dark">
                                                    <div slot="content">
                                                         If this is enabled the service will be taxable 
                                                    </div>
                                                    <el-switch active-color="green" inactive-text="Taxable"
                                                        style="display: block;  margin-bottom : 10px;"
                                                        v-model="form.taxable"></el-switch>
                                                </el-tooltip>
                                            </el-col>
                                        </el-row>

                                    </el-form-item>
                                </el-col>
                                <el-col :md="8" :sm="8" :xs="24">
                                    <el-col :md="12" :sm="12" :xs="24">
                                        <el-form-item style="display: inline-block">
                                            <el-upload :action="getFileUrl()" :headers="getHeaders()"
                                                       :on-success="uploadSuccess" :show-file-list="false"
                                                       list-type="picture-card">
                                                <img :src="form.icon" class="avatar" style="width: 100%"
                                                     v-if="form.icon">
                                                <i class="el-icon-plus avatar-uploader-icon" style="width: 100%"
                                                   v-else></i>
                                            </el-upload>
                                        </el-form-item>
                                    </el-col>
                                    <el-col style="height: 100px;position: relative;" :md="2" :sm="2" :xs="24">
                                        <div style="position: absolute; top:40%">OR</div>
                                    </el-col>

                                    <el-col style="height: 100px;position: relative;" :md="6" :sm="6" :xs="24">
                                        <el-button style="position: absolute; top:40%; padding-left: 20px; padding-top: 2px;" type="text" @click="iconSelectDialogUp = true">Choose icon from library</el-button>

                                        <el-dialog top="0vh" title="Choose icon" :visible.sync="iconSelectDialogUp"
                                                   :close-on-press-escape="true" :fullscreen="false" width="60%" append-to-body>
                                            <div>
                                                <icon-select v-model="choosenIcon"></icon-select>
                                            </div>

                                            <div slot="footer" class="dialog-footer">
                                                <el-button size="mini" @click="iconSelectDialogUp = false" round>Cancel</el-button>
                                                <el-button size="mini" type="primary" @click="loadIconFromLibrary" round>Choose</el-button>
                                            </div>
                                        </el-dialog>
                                    </el-col>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-divider></el-divider>
                            </el-row>
                            <el-row>
                                <el-col :md="24" :sm="24" :xs="24" class="divider-3x">
                                    <el-button @click="saveService()" class="block-center" size="small" round
                                               type="primary">
                                        Save Service
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-card>
                </el-col>

                <side-help></side-help>
            </el-row>
        </div>

    </el-dialog>
    </div>
</template>

<script>
    import SideHelp from "../../components/SideHelp.vue";
    import Tags from "../../../components/Tags";
    import IconSelect from "../../../components/IconUpload.vue"
    import ElDivider from "../../../../node_modules/element-ui/packages/divider/src/main";

    export default {
        components: {
            ElDivider, SideHelp,
            Tags,
            IconSelect
        },
        data(){
            return {
                form: {
                    name: "",
                    description: "",
                    pricingVariableIds: [],
                    tagIds: [],
                    extraIds: [],
                    icon: "",
                    base_price: 0,
                    duration: 0,
                    locationIds: [],
                    serviceCategoryIds: [],
                    teamIds: [],
                    has_disclaimer: false,
                    disclaimer: "",
                    all_locations: true,
                    hourly: false,
                    hourly_settings: {
                        hours_minimum: 1,
                        hours_maximum: 24,
                        teams_minimum: 1,
                        teams_maximum: 5
                    },
                    unlinkCategoryIds: [],
                    oldCategoryIds: []
                },
                searchSelectedService: "",
                rules: {
                    name: [{
                        message: "Name of service is required",
                        required: true,
                    }],
                    base_price: [{
                        message: "Price is required",
                        required: true,
                        type: "number"
                    }],
                    hourly_settings : [
                        {
                            validator: (value, rule, callback) => {

                                if (!this.form.hourly) return callback()

                                if (this.form.hourly_settings.hours_minimum < 0){
                                    return callback(new Error('Minimum hours cannot be less than 0'))
                                }
                                if (this.form.hourly_settings.hours_maximum < 0){
                                    return callback(new Error('Maximum hours cannot be less than 0'))
                                }
                                if (this.form.hourly_settings.teams_minimum < 0){
                                    return callback(new Error('Teams min. cannot be less than 0'))
                                }
                                if (this.form.hourly_settings.hours_minimum < 0){
                                    return callback(new Error('Teams max.  cannot be less than 0'))
                                }

                                if (this.form.hourly_settings.hours_minimum > this.form.hourly_settings.hours_maximum){
                                    return callback(new Error('Min. hours cannot be greater than Max. hours'))
                                }

                                if (this.form.hourly_settings.teams_minimum > this.form.hourly_settings.teams_maximum){
                                    return callback(new Error('Min. teams cannot be greater than Max teams'))
                                }

                                return callback()
                            }
                        }
                    ]
                },
                iconSelectDialogUp: false,
                choosenIcon: {},
                services: [],
                service_categories: [],
                company_locations: [],
                service_extras: [],
                company_teams: [],
                company_pricing_variables: [],
                loading: false,
                showModal: false,
                service_cats: []
            };
        },

        watch: {
            'form.hourly'(val) {
                if (val) {
                    this.form.duration = 0;
                } else {
                    this.form.hourly_settings = {
                        hours_minimum: 1,
                        hours_maximum: 24,
                        teams_minimum: 1,
                        teams_maximum: 5
                    };
                }
            }
        },

        mounted() {

            this.showModal = true;

            (async () => {
                try {
                    this.loading = true
                    this.service_categories = (await this.axios.get("/companies/current/serviceCategories", {
                        params: {
                            filter: {
                                where: {active: true}
                            }
                        }
                    })).data;
                    this.company_locations = (await this.axios.get("/companies/current/locations")).data;
                    this.service_extras = (await this.axios.get("/companies/current/extras")).data

                    //now load the service if found
                    if (this.$route.params.id) {
                        let serviceId = this.$route.params.id
                        this.form = (await this.axios.get('/companies/current/services/' + serviceId)).data

                        //get service categories
                        this.form.serviceCategoryIds = []
                        this.form.oldCategoryIds = []
                        this.form.unlinkCategoryIds = []

                        let service_categoryIds = (await this.axios.get('/services/' + serviceId + '/service_categories')).data
                        service_categoryIds.forEach((x) => {
                            this.$nextTick(() => {
                                this.form.serviceCategoryIds.push(x.id)
                                this.form.oldCategoryIds.push(x.id)
                            })

                        })
                    }


                    this.loading = false
                } catch (err) {
                    this.loading = false
                    this.$helpers.errorHandle(err, this)
                    this.$router.back()
                }
            })()

        },

        beforeDestroy() {
            this.$events.removeListener("services:dialog:edit", this.setSelectedServiceEvent);
        },

        methods: {
            setSelectedServiceEvent(selectedService) {
                if (selectedService.hasOwnProperty("id")) {
                    this.form = selectedService;
                } else {
                    this.resetForm();
                }

                this.loading = false;
            },

            resetForm() {
                this.form = {
                    name: "",
                    pricingVariableIds: [],
                    tagIds: [],
                    extraIds: [],
                    price: 0,
                    duration: 0,
                    locationIds: [],
                    serviceCategoryIds: [],
                    teamIds: [],
                    has_disclaimer: false,
                    all_locations: true,
                    hourly: false,
                    hourly_settings: {
                        hours_minimum: 1,
                        hours_maximum: 24,
                        teams_minimum: 1,
                        teams_maximum: 5
                    }
                };
            },

            getHeaders() {
                return {Authorization: this.$auth.token()};
            },
            getFileUrl() {
                return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
            },

            handleRemove() {
            },
            uploadSuccess(res, file) {
                this.form.icon = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
            },

            handlePreview() {
            },

            querySearchAsync(queryString, cb) {
                this.axios
                    .get("/companies/current/services", {
                        params: {
                            filter: {
                                where: {
                                    name: {
                                        like: queryString,
                                        options: "i"
                                    }
                                }
                            }
                        }
                    })
                    .then(res => {
                        cb(res.data);
                    })
                    .catch(err => {
                    });
            },

            handleSelect(item) {
                this.form = item;

                if (!this.form.tags) {
                    this.form.tags = [];
                }

            },

            saveService() {
                this.$refs.servicesfrm.validate(valid => {
                    if (valid) {
                        this.loading = true;
                        if (this.form.hasOwnProperty("id")) {

                            //things get elements that are in old ids but not in the new arra.
                            this.form.unlinkCategoryIds = this.form.oldCategoryIds.filter(x => !this.form.serviceCategoryIds.includes(x));

                            this.axios
                                .put("/companies/current/services/" + this.form.id, this.form)
                                .then(res => {
                                    this.$helpers.successHandle("Service successfully updated");
                                    this.$router.back()
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(_ => {
                                    this.loading = false;
                                });
                        } else {

                            if (this.form.icon === ''){
                                delete this.form.icon
                            }

                            this.axios
                                .post("/companies/current/services", this.form)
                                .then(res => {
                                    this.$helpers.successHandle("Service successfully saved");
                                    this.$router.back()
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(_ => {
                                    this.loading = false;
                                });
                        }
                    }
                });
            },

            fetchData() {
                this.loading = false;
                this.$events.emitEvent("services:dialog:close");
            },

            loadIconFromLibrary(){
                this.form.icon = this.choosenIcon.url;
                this.iconSelectDialogUp = false
            }
        }
    };
</script>

<style lang="scss">
    .create-service-container {
        .el-switch__label {
            color: #333 !important;

            span {
                font-weight: 400;
                min-width: 200px;
                font-size: 13px;
            }
        }

        .el-switch__label.is-active {
            color: #333;
            /* font-weight: normal; */
            /* font-size: 11px; */
        }

        .hourly {
            .el-input-group__prepend {
                width: 40px;
                padding: 0 10px;

                span {
                    font-size: 12px;
                }
            }
        }

        .el-upload--picture-card {
            box-sizing: border-box;
            width: 100px;
            height: 100px;
            line-height: 100px;
        }

        .el-upload-list--picture-card .el-progress {
            width: 90px !important;
        }

        .el-upload-list--picture-card .el-upload-list__item {
            width: 100px;
            height: 100px;
            margin: 0 8px 8px 0;
        }

        .el-progress-circle {
            width: 90px !important;
            height: 90px !important;
        }
    }
</style>
