<template>
    <el-form :model="selectedVariable" :rules="rules" class="bg-white" label-position="top" ref="variablesfrm">

        <el-row :gutter="20">

            <el-col :md="24" :sm="24" :xs="24">
                <el-form-item label="Name" prop="name">
                    <el-input v-model="selectedVariable.name"/>
                </el-form-item>

                <el-form-item label="Description">
                    <el-input type="textarea" :rows="4" v-model="selectedVariable.description"></el-input>
                </el-form-item>
            </el-col>


            <el-col :md="24" :sm="24" :xs="24">
                <duration-picker v-model="selectedVariable.duration"></duration-picker>
            </el-col>

            <el-col :md="24" :sm="24" :xs="24">
                <el-form-item prop="price" :label="'Price (' + $currency + ')'" v-if="!selectedVariable.hasOwnProperty('id')">
                    <el-input-number :min="0" v-model="selectedVariable.price"></el-input-number>
                    <p>You would be able to add additional pricing later.</p>
                </el-form-item>
                <el-form-item label="Prices"  v-if="selectedVariable.hasOwnProperty('id')">
                    <el-tag effect="dark" type="primary" style="margin-right:10px;" v-for="price in selectedVariable.prices">{{$currency}}{{price.price}}</el-tag>
                    <div>
                        <el-link size="mini" type="primary" @click="invokeEditPrice()">Edit Prices</el-link>
                    </div>
                </el-form-item>
            </el-col>

        </el-row>

        <el-row>
            <div class="divider-3x"/>
            <el-col :md="24" :sm="24" :xs="24" class="divider-3x">
                <el-button :loading="loading" @click="saveVariable()" class="text-center block-center" round
                           size="small" type="primary">
                    Save Variable
                </el-button>
            </el-col>
        </el-row>
    </el-form>
</template>

<script>
    import SideHelp from "../../components/SideHelp.vue";
    import moment from "moment";

    export default {
        components: {SideHelp},
        props: {
            companyLocations: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            companyServices: {
                type: Array,
                default: () => {
                    return [];
                }
            },

            variable: {
                type: [Boolean, Object],
                default: false
            },
            variableDialog: {
                type: Boolean
            }
        },
        data() {
            return {
                moment: moment,
                loading: false,
                selectedVariable: {
                    name: "",
                    serviceIds: [],
                    duration: 0,
                    price: 0,
                    description: ""
                },
                selectedVariablePricing: {
                    label: "",
                    min_qty: 1,
                    max_qty: 1,
                    price: 0
                },
                rules: {
                    name: [{required: true, message: "Variable name is required"}],
                    price: [

                        {
                            validator: (value, rule, callback) => {
                                if (Number(this.selectedVariable.price) < 0) {
                                    return callback(new Error("Price cannot be less than 0"))
                                }
                                return callback()
                            }
                        }]
                },
                pricingVariables: [],
                newVariablePricing: {
                    label: "",
                    min_qty: 1,
                    max_qty: 1,
                    price: 0
                },
                activeTab: ""
            };
        },
        watch: {
            variable(val) {
                if (val) {
                    this.selectedVariable = val;
                }
            }
        },
        created() {
        },
        mounted() {
            if (this.variable) {
                this.selectedVariable = this.variable;

                this.selectedVariable.price = this.variable.prices[0].price
            }
        },

        methods: {
            addNewVariable() {
                this.selectedVariable = {
                    name: "",
                    serviceIds: [],
                    duration: 0,
                    description: ""
                };

                this.selectedVariablePricing = {
                    label: "",
                    min_qty: 1,
                    max_qty: 1,
                    price: 0
                };
            },
            addNewPrice() {
                this.newVariablePricing = {
                    label: "",
                    min_qty: 1,
                    max_qty: 1,
                    price: 0
                };
            },

            querySearchAsync() {
            },

            handleSelect() {
            },
            selectVariable(variable) {
                this.activeTab = "";

                this.selectedVariable = variable;
                if (variable.prices.length > 0) {
                    this.selectedVariablePricing = variable.prices[0];
                } else {
                    this.selectedVariablePricing = {
                        label: "",
                        min_qty: 1,
                        max_qty: 1,
                        price: 0
                    };
                }
            },
            deletePrice(price) {
                this.axios
                    .delete("/pricing_variables/" + this.selectedVariable.id + "/prices/" + price.id)
                    .then(res => {
                        this.$helpers.successHandle("Price successfully deleted");
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    });
            },
            deleteVariable() {
                // 1. delete all prices of the variable
                // 2. delete the variable itself finally to prevent orphan pricing

                // first delete all prices
                this.axios
                    .delete("/pricing_variables/" + this.selectedVariable.id + "/prices")
                    .then(res => {
                        // noew delete the actual variable
                        this.axios
                            .delete("/pricing_variables/" + this.selectedVariable.id)
                            .then(res => {

                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            });
                    })
                    .catch(err => {
                    });
            },
            duplicateVariable() {
                delete this.selectedVariable.id;
                this.selectedVariable.name += " - duplicate";

                this.saveVariable();
            },
            archiveVariable() {
            },
            savePrice() {
                this.loading = true;
                if (this.newVariablePricing.hasOwnProperty("id")) {
                    this.axios
                        .patch("/pricing_variables/" + this.selectedVariable.id + "/prices", this.newVariablePricing)
                        .then(res => {
                            this.addNewPrice();
                            this.loading = false
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                            this.loading = false
                        });
                } else {
                    this.axios
                        .post("/pricing_variables/" + this.selectedVariable.id + "/prices", this.newVariablePricing)
                        .then(res => {
                            this.addNewPrice();
                            this.loading = false
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                            this.loading = false
                        });
                }
            },
            saveVariable() {
                this.$refs["variablesfrm"].validate(valid => {
                    if (valid) {
                        this.loading = true;

                        if (this.selectedVariable.hasOwnProperty("id")) {
                            // a patch
                            this.axios
                                .patch("/pricing_variables/" + this.selectedVariable.id, {
                                    name: this.selectedVariable.name,
                                    duration: this.selectedVariable.duration,
                                    serviceIds: this.selectedVariable.serviceIds,
                                    description: this.selectedVariable.description
                                })
                                .then(res => {
                                    this.selectedVariable = res.data;
                                    // now add the first
                                    this.$events.emitEvent("close-variable-dialog");
                                    this.loading = false;
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                    this.loading = false;
                                })
                                .finally(() => this.loading = false)
                        } else {
                            // create a new one
                            this.axios
                                .post("/companies/current/pricing_variables", this.selectedVariable)
                                .then(res => {
                                    this.loading = false;
                                    this.selectedVariable = res.data;
                                    // now add the first
                                    this.$events.emitEvent("close-variable-dialog");
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                    this.loading = false;
                                })
                                .finally(() => this.loading = false)
                        }
                    }
                });
            },
            invokeEditPrice(){
                this.$emit('edit-price', this.selectedVariable)
            }
        }
    };
</script>

<style lang="scss">
    .modal-body {
        .variables {
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
                height: 75px;
            }
        }
    }
</style>
