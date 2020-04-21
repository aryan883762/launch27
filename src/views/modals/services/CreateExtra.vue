<template>
<div>
    <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="false" :visible.sync="showModal" @close="$router.back()" append-to-body custom-class="fullscreen-modal-display">
        <div class="modal-title-container" slot="title">
            <el-row>
                <el-col :sm="6" :xs="24">
          <span class="modal-title" v-if="!$route.params.id">
              Add a new Extra
          </span>
                    <span class="modal-title" v-if="$route.params.id">
              Editing Extra
            </span>
                </el-col>
            </el-row>
        </div>
        <div class="modal-body extras">
            <el-row :gutter="20">
                <el-col :md="16" :sm="16" :xs="24">
                    <el-card shadow="hover" v-loading="loading">
                        <el-form :model="form" :rules="rules" class="bg-white padding-2x" label-position="top" ref="extrasfrm" style="padding-top: 0px;padding-bottom:0px;">
                            <el-row :gutter="40">
                                <el-col :md="12" :sm="12">
                                    <el-row :gutter="20">
                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item label="Name" prop="name">
                                                <el-input v-model="form.name"/>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item label="Description">
                                                <el-input :autosize="false" :rows="6" type="textarea" v-model="form.description"/>
                                            </el-form-item>
                                        </el-col>

                                        <el-col :md="24" :sm="24" :xs="24">
                                            <el-form-item>
                                                <el-checkbox label="Add disclaimer text" v-model="form.has_disclaimer"/>
                                                <el-input :autosize="false" :rows="3" type="textarea" v-if="form.has_disclaimer" v-model="form.disclaimer"/>
                                            </el-form-item>
                                        </el-col>


                                    </el-row>
                                </el-col>

                                <el-col :md="12" :sm="12">
                                    <el-row :gutter="20">
                                        <el-card>
                                            <el-col :md="12" :sm="12" :xs="24">
                                                <el-form-item label="Price" prop="price">
                                                    <el-input min="0" placeholder="Price" type="number" v-model="form.price">
                                                        <span slot="prepend">{{ $currency }}</span>
                                                    </el-input>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="12" :sm="12" :xs="24">
                                                <el-form-item label="Min. Quantity">
                                                    <el-input-number :min="1" size="mini" v-model="form.minimum_quantity"/>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="12" :sm="12" :xs="24">
                                                <el-form-item label="Max. Quantity">
                                                    <el-input-number :min="1" size="mini" v-model="form.maximum_quantity"/>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item prop="duration">
                                                    <duration-picker :isRequired="true" v-model="form.duration"></duration-picker>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :md="24" :sm="24" :xs="24">
                                                <el-form-item label="Equipment" prop="equipment_qty_available">
                                                    <el-row :gutter="40">
                                                        <el-col :md="24" :sm="24" :xs="24">
                                                            <el-checkbox label="Is an Equipment" v-model="form.is_equipment"/>
                                                        </el-col>

                                                        <el-col :md="24" :sm="24" :xs="24">
                                                            <el-input size="small" type="number" v-if="form.is_equipment" v-model="form.equipment_qty_available">
                                                              <span slot="prepend">
                                                                Qty.
                                                              </span>
                                                            </el-input>
                                                        </el-col>

                                                        <el-col :md="24" :sm="24" :xs="24">
                                                            <el-input size="small" type="number" v-if="form.is_equipment" v-model="form.buffer_time">
                                                                      <span slot="prepend">
                                                                        Buffer time
                                                                      </span>
                                                                      <span slot="append">
                                                                        hrs
                                                                      </span>
                                                            </el-input>
                                                        </el-col>
                                                    </el-row>
                                                </el-form-item>
                                            </el-col>
                                        </el-card>
                                    </el-row>
                                </el-col>
                            </el-row>

                            <el-row>
                                <el-col>
                                    <el-divider>Additional Options & Icon</el-divider>
                                </el-col>

                                <el-col :md="10" :sm="10" :xs="24">
                                    <el-form-item label="Excluded from">
                                        <p>
                                            <el-checkbox label="Frequency Discounts" v-model="form.exclude_from_frequency"/>
                                        </p>
                                        <p>
                                            <el-checkbox label="Discount Code Discounts" v-model="form.exclude_from_discount_codes"/>
                                        </p>
                                    </el-form-item>

                                    <el-form-item label="Recurring Policy">
                                        <el-checkbox label="Add to first booking only" v-model="form.first_booking_only"/>
                                    </el-form-item>
                                </el-col>

                                <el-col :md="4" :sm="4" :xs="12">
                                    <el-upload :action="$root.getFileUrl()" :before-upload="beforeUpload"
                                               :headers="$root.getHeaders()" :limit="1"
                                               :on-error="errorUpload"
                                               :on-success="uploadSuccess"
                                               :show-file-list="false"
                                               list-type="picture-card">
                                        <img :src="form.icon" class="avatar" style="width: 100%" v-if="form.icon">
                                        <i class="el-icon-plus avatar-uploader-icon" style="width: 100%" v-else></i>
                                    </el-upload>
                                </el-col>

                                <el-col style="height: 100px;position: relative;" :md="1" :sm="1" :xs="24">
                                    <div style="position: absolute; top:40%">OR</div>
                                </el-col>

                                <el-col :md="6" :sm="6" :xs="24">
                                    <el-button style="height: 100px;position: relative;" type="text" @click="iconSelectDialogUp = true">Choose icon from library</el-button>

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

                            </el-row>

                            <el-divider></el-divider>

                            <el-button @click="saveExtra()" class="block-center text-center divider-1x" round size="small" type="primary">
                                Save Extra
                            </el-button>
                        </el-form>
                    </el-card>
                </el-col>
                <side-help/>
            </el-row>
        </div>

    </el-dialog>
</div>
</template>

<script>
    import SideHelp from "../../components/SideHelp.vue";
    import moment from "moment";
    import IconSelect from "../../../components/IconUpload.vue"

    export default {
        components: {SideHelp,IconSelect},

        props: {
            companyServices: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },

        data() {
            return {
                form: {
                    name: "",
                    duration: 0,
                    price: "",
                    exclude_from_frequency: false,
                    exclude_from_discount_codes: false,
                    is_equipment: false,
                    equipment_qty_available: 1,
                    buffer_time: 1,
                    minimum_quantity: 1,
                    maximum_quantity: 1,
                    first_booking_only: false
                },
                extras: [],
                moment: moment,
                rules: {
                    name: [{
                        message: "Name is required",
                        required: true,
                        trigger: "blur"
                    }],
                    price: [{
                        message: "Price is required",
                        required: true,
                        trigger: "blur"
                    }],
                    equipment_qty_available: [
                        {
                            validator: (value, rule, callback) => {

                                if (!this.form.is_equipment) return callback()

                                if (this.form.equipment_qty_available < 0){
                                    return callback(new Error("Equipment quantity can't be less than 0"))
                                }

                                if (this.form.buffer_time < 0){
                                    return callback(new Error("Buffer time can't be less than 0"))
                                }

                                return callback()


                            }
                        }
                    ]
                },
                iconSelectDialogUp: false,
                choosenIcon:{},
                loading: false,
                services: [],
                showModal: false
            };
        },
        created() {
        },
        beforeMount() {

        },
        mounted() {

            (async () => {
                try {
                    //now load the extra if found
                    this.loading = true

                    this.services = (await this.axios.get("/companies/current/services")).data;


                    if (this.$route.params.id) {
                        this.form = (await this.axios.get('/companies/current/extras/' + this.$route.params.id)).data
                    }
                    this.loading = false
                } catch (err) {
                    this.loading = false
                }
            })()

            this.showModal = true


        },

        beforeDestroy() {
            this.$events.removeListener("extra:dialog:edit", this.setSelectedServiceEvent);
        },

        methods: {
            setSelectedServiceEvent(selectedExtra) {
                if (selectedExtra.hasOwnProperty("id")) this.form = selectedExtra;
                else this.resetForm();

                this.loading = false;
            },

            resetForm() {
                this.form = {
                    name: "",
                    duration: 0,
                    price: 0,
                    exclude_from_frequency: false,
                    exclude_from_discount_codes: false,
                    is_equipment: false,
                    equipment_qty_available: 1,
                    minimum_quantity: 1,
                    maximum_quantity: 1,
                    first_booking_only: false
                };
            },

            reloadExtras() {
                this.axios
                    .get("/companies/current/extras")
                    .then(res => {
                        this.extras = res.data;
                    })
                    .catch(err => {
                    });
            },
            addNewExtra() {
                this.form = {
                    name: "",
                    duration: 0,
                    price: 0,
                    exclude_from_frequency: false,
                    exclude_from_discount_codes: false,
                    is_equipment: false,
                    equipment_qty_available: 1,
                    minimum_quantity: 1,
                    maximum_quantity: 1,
                    first_booking_only: false
                };
            },
            deleteExtra(extra) {
            },
            duplicateExtra(extra) {
                delete this.form.id;
                this.form.name += " - duplicate";

                this.saveExtra();
            },
            archiveExtra(extra) {
            },
            selectExtra(extra) {
                this.form = extra;
            },

            errorUpload() {
                this.loading = false
            },
            beforeUpload() {
                this.loading = true
            },

            uploadSuccess(res, file) {
                this.loading = false
                this.form.icon = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
            },

            loadIconFromLibrary(){
                this.form.icon = this.choosenIcon.url;
                this.iconSelectDialogUp = false
            },
            saveExtra() {
                this.$refs["extrasfrm"].validate(valid => {
                    if (valid) {
                        if (this.form.hasOwnProperty("id")) {
                            // a patch
                            delete this.form.services;
                            this.axios
                                .patch("/extras/" + this.form.id, this.form)
                                .then(res => {
                                    this.form = res.data;
                                    // now add the first
                                    this.$helpers.successHandle("Extra successfully updated");
                                    this.$router.back()
                                })
                                .catch(err => {
                                });
                        } else {
                            // create a new one
                            this.axios
                                .post("/companies/current/extras", this.form)
                                .then(res => {
                                    this.form = res.data;
                                    // now add the first
                                    this.$helpers.successHandle("Extra successfully updated");
                                    this.$router.back()
                                })
                                .catch(err => {
                                });
                        }
                    }
                });
            }
        }
    };
</script>

<style lang="scss">
    .modal-body {
        &.extras {
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

            .pricing-box {
                border: 1px solid #f3f3f3;
                border-radius: 5px;
                margin: 0px !important;
            }

            ul.variables-list {
                list-style: none;
                padding: 0;

                li {
                    padding: 10px;
                    display: block;
                    cursor: pointer;
                    min-height: 40px;

                    .service-image,
                    .service-content {
                        display: inline-block;
                    }

                    .service-image {
                        img {
                            width: 32px;
                            height: 32px;
                            margin-right: 5px;
                            /* border-radius : 50%;*/
                        }
                    }

                    .service-content {
                        width: calc(100% - 40px);

                        p {
                            margin: 0;
                            font-size: 12px;
                            line-height: 1.5;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            max-height: 35px;
                        }
                    }

                    .service-name {
                        font-weight: 500;
                        color: black;
                        font-size: 12px;
                    }

                    .service-price {
                        font-weight: bold;
                        font-style: normal;
                    }

                    &.active {
                        border-left: 4px solid $launch-primary-color;
                        background: $launch-dashboard-bg-color;
                    }
                }
            }

            .pricing-item {
                padding: 15px;
                background: $launch-dashboard-bg-color;
                border: 1px dashed #f3f3f3;
                border-radius: 5px;
                font-weight: 500;
                font-size: 13px;
                margin-bottom: 10px;
            }

            .el-collapse {
                border: none;
            }

            .el-collapse-item__content {
                background: $launch-dashboard-bg-color;
                padding: 10px;
                margin-bottom: 10px;
            }

            .el-form-item {
            }
        }
    }
</style>
