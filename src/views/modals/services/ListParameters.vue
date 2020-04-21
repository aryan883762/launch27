<template>
    <el-row :gutter="20" class="variables">
        <el-col :sm="24">
            <el-card shadow="never" style="margin-bottom: 5px;">

                <el-row>
                    <el-col class="flex-row">
                        <div class="main-filters pull-left">
                            <el-select @change="reloadVariables(1,1)" class="filter small" v-model="filter_active">
                                <el-option :value="true" label="Active"></el-option>
                                <el-option :value="false" label="Archived"></el-option>
                            </el-select>
                        </div>

                        <div class="main-filters pull-right">


                            <el-dropdown @command="handleCommand" class="pull-right" size="mini"
                                         style="margin-left: 10px;" type="primary">
                                <el-button size="mini" type="primary">
                                    Action<i class="el-icon-arrow-down el-icon--right"></i>
                                </el-button>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item :disabled="multiPVIds.length === 0 || !filter_active"
                                                      command="archive">Archive
                                    </el-dropdown-item>
                                    <el-dropdown-item :disabled="multiPVIds.length === 0 || filter_active"
                                                      command="active">Active
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>

                            <el-button @click="addNewVariable();variableDialog = true;" class="pull-right"
                                       icon="el-icon-plus" plain round size="mini" style="margin-left: 10px;"
                                       type="success">Add New Variable
                            </el-button>
                        </div>

                    </el-col>
                </el-row>


            </el-card>


            <el-table :data="pricingVariables" @selection-change="handleSelectionChange" v-loading="loading">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="Variable Name" prop="name"></el-table-column>

                <el-table-column align="center" label="Duration" width="150">
                    <template slot-scope="scope">
                        {{scope.row.duration | duration}}
                    </template>
                </el-table-column>


                <el-table-column align="center" label="All Services" width="100">
                    <template slot-scope="scope">
                        <el-switch @change="partialUpdateVariable($event, scope.row, 'all_services')"
                                   active-color="#13ce66" v-model="scope.row.all_services"></el-switch>
                    </template>
                </el-table-column>

                <el-table-column align="center" label="Services" prop="services" width="300">
                    <template slot-scope="scope">
                        <el-select :disabled="scope.row.all_services" style="width: 250px;"
                                   @change="updateVariableServices($event, scope.row)" collapse-tags filterable multiple
                                   v-model="scope.row.serviceIds">
                            <el-option v-show="srv.active" :key="srv.id"
                                       :label="srv.name + ((!srv.active) ? ' (ARCH.)' :'')" :value="srv.id"
                                       v-for="srv in services" v-if="!srv.hourly"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="Pricing" prop="prices">
                    <template slot-scope="scope">
                        <i :key="index" style="font-weight:500;" v-for="(price, index) in scope.row.prices"
                           v-if="index < 3"> {{ $currency }}{{ price.price }}<span
                                v-if="scope.row.prices.length >1">,</span> </i>
                        <el-button style="padding: 0; font-size: 12px" @click="selectVariable(scope.row)"
                                   v-if="scope.row.prices.length > 3" type="text">+{{ parseInt(scope.row.prices.length)
                            - 3 }} more
                        </el-button>
                        <i style="color:red!important;" v-if="scope.row.prices.length == 0">Has no pricing
                            <el-divider direction="vertical"></el-divider>
                        </i>
                        <el-button style="margin: 0" @click="selectVariable(scope.row)" class="price-edit" type="text">
                            Edit
                        </el-button>
                    </template>
                </el-table-column>

                <el-table-column lable="Options" width="300">
                    <template slot-scope="scope">
                        <el-button-group class="table-action-btns">
                            <el-link @click="manageVariable(scope.row)" type="primary">Edit</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="duplicateVariable(scope.row)">Duplicate</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="archiveVariable(scope.row)" v-if="scope.row.active">Archive</el-link>
                            <el-link @click="archiveVariable(scope.row)" v-if="!scope.row.active">Activate</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <view-changes :id="scope.row.id"></view-changes>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>

            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records"
                                   @current-change="reloadVariables(0,1)" background
                                   layout="total, prev, pager, next"></el-pagination>
                </div>

            </el-col>

        </el-col>

        <el-dialog class="price-edit-modal" :close-on-press-escape="true" :title="  selectedVariable.name"
                   :visible.sync="pricingDialog" @close="beforeClosePricingDialog" top="0vh" append-to-body width="60%">
            <div class="type-err-mgs" style="text-align: center; color: red; padding: 0 0 29px 0;">{{err_msg}}</div>
            <el-row :gutter="10" :key="index"
                    :class="index === violating_index ? 'pricing-item violated-line' : 'pricing-item'"
                    v-for="(price, index) in selectedVariable.prices">
                <el-form class="price-item-form" label-position="top" v-model="price[index]" :rules="price_rules">
                    <el-col :md="6" :sm="6" :xs="24">
                        <el-form-item style="margin-bottom: 0" :label="index == 0 ? 'Label' : ''">
                            <el-input v-on:keyup.native="savePrice(price, index)" v-model="price.label"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :md="6" :sm="6" :xs="24">
                        <el-form-item style="margin-bottom: 0" :label="index == 0 ? 'Price' : ''" prop="price">
                            <el-input v-on:keyup.native="savePrice(price, index)" type="number" :min="0"
                                      v-model="price.price">
                                <div slot="prepend">{{ $currency }}</div>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col style="padding: 0 !important;" :md="8" :sm="8" :xs="24" class="quantity-group">
                        <el-col :md="12" :sm="12" :xs="24">
                            <el-form-item style="margin-bottom: 0" :label="index == 0 ? 'Min.Quantity' : ''" prop="min">
                                <el-input v-on:keyup.native="savePrice(price, index)" type="number" :min="0"
                                          v-model="price.min_qty"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :md="12" :sm="12" :xs="24">
                            <el-form-item style="margin-bottom: 0" :label="index == 0 ? 'Max. Quantity' : ''"
                                          prop="max">
                                <el-input v-on:keyup.native="savePrice(price, index)" type="number" :min="0"
                                          v-model="price.max_qty"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-col>
                    <el-col :md="4" :sm="4">
                        <el-form-item style="margin-bottom: 0" :label="index == 0 ? 'Option' : ''">
                            <el-button v-if="price.id" @click="deletePrice(price, index)" icon="el-icon-delete"
                                       size="mini" type="warning">Delete
                            </el-button>
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>
            <el-link @click="addNewPrice()" size="mini" type="primary">
                Add Additional Pricing
            </el-link>
            <span class="dialog-footer" slot="footer">
        <el-button @click="pricingDialog = false" size="mini" round type="primary"
                   :loading="pricing_update">Save / Close</el-button>
      </span>
        </el-dialog>

        <el-dialog :close-on-press-escape="true" :fullscreen="false" width="30%" top="0vh"
                   :title="(!selectedVariable.id)? 'Add new Variable' : selectedVariable.name"
                   :visible.sync="variableDialog" @closed="reloadVariables(1,1)" append-to-body>
            <create-parameters :variable.sync="selectedVariable" @edit-price="selectVariable"/>
        </el-dialog>
    </el-row>
</template>

<script>
    import SideHelp from "../../components/SideHelp.vue";
    import moment from "moment";
    import CreateParameters from "./CreateParameters.vue";
    import ViewChanges from "../../../components/ViewChanges";
    import _ from 'lodash'

    export default {
        components: {
            ViewChanges,
            SideHelp,
            CreateParameters
        },
        props: {
            searchSelectedVariable: {
                type: Boolean,
                default: false
            }
        },
        filters: {
            savePrevious(value, oldValue) {
                return value;
            }
        },
        data: () => {
            return {
                moment: moment,
                selectedVariable: {
                    name: "New Variable",
                    serviceIds: [],
                    price: 0
                },
                selectedVariablePricing: {
                    label: "",
                    min_qty: 1,
                    max_qty: 1,
                    price: 0
                },
                rules: {
                    name: [{
                        required: true,
                        message: "Variable name is required"
                    }]
                },
                price_rules: {
                    price: [{
                        min: 0
                    }],
                    min: [{
                        min: 0
                    }],
                    max: [{
                        min: 0
                    }]

                },
                pricingVariables: [],
                newVariablePricing: {
                    label: "",
                    min_qty: 1,
                    max_qty: 1,
                    price: 0
                },
                err_msg: "",
                violating_index: -1,
                activeTab: "",
                pricingDialog: false,
                pricing_update: false,
                variableDialog: false,
                loading: true,
                previousServices: [],
                services: [],
                total_records: 0,
                page_size: 0,
                current_page: 1,
                filter_active: true,
                multiPVIds: [],
                change_effected: false,
                debounce : false
            };
        },
        created() {
            this.$events.addListener("close-variable-dialog", this.closeDialogEvent);
            this.$events.emitEvent('track-page')
        },

        beforeMount() {
            //pre-load
            if (this.$storage.getItem('variable_pricing_filter')) {
                this.filter_active = (this.$storage.getItem('variable_pricing_filter') === "true")
            }

        },
        
        mounted() {
            this.loadServices();
            this.reloadVariables(1, 1);
        },

        beforeDestroy() {
            //set fitlers to storage
            this.$storage.setItem('variable_pricing_filter', this.filter_active)
            this.$events.removeListener("close-variable-dialog", this.closeDialogEvent);

        },

        methods: {
            handleCommand(command) {
                if (this.multiPVIds.length > 0) {
                    //archive the list of services
                    this.loading = true;

                    this.axios.post('/pricing_variables/bulk-update', {pvIds: this.multiPVIds, action: command})
                        .then(res => {
                            this.$helpers.successHandle("Variables successfully updated")
                            this.multiPVIds = []
                            this.reloadVariables(1, 1)
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        })
                        .finally(() => {
                            this.loading = false

                        })
                }
            },
            handleSelectionChange(val) {
                this.multiPVIds = []
                val.forEach(row => {
                    this.multiPVIds.push(row.id)
                })
            },
            loadServices() {
                this.loading = true;
                this.axios
                    .get("/companies/current/services", {
                        params:
                            {
                                filter: {
                                    include: [{"pricing_variables": "prices"}],
                                    where: {active: {inq: [true, false]}}
                                }
                            }
                    })
                    .then(res => {
                        this.services = res.data;
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },
            closeDialogEvent() {
                this.variableDialog = false;
            },
            addNewVariable() {
                this.selectedVariable = {
                    name: "",
                    serviceIds: [],
                    price: 0
                };

                this.selectedVariablePricing = {
                    label: "",
                    min_qty: 1,
                    max_qty: 1,
                    price: 0
                };
            },
            manageVariable(variable) {
                this.selectedVariable = variable;
                this.variableDialog = true;
            },
            addNewPrice() {
                if (this.violating_index === -1) {
                    this.selectedVariable.prices.push({
                        label: "",
                        min_qty: 1,
                        max_qty: 1,
                        price: 0
                    });
                }
            },
            reloadVariables(current_page, delta_state) {


                if (delta_state === 1 || delta_state === 2) {

                    if (!current_page)
                        current_page = this.current_page

                    this.loading = true;
                    this.axios
                        .get("/companies/current/pricing_variables", {
                            params: {
                                page: current_page,
                                filter: {
                                    where: {active: this.filter_active},
                                    include: ["services", "prices"]
                                }
                            }
                        })
                        .then(res => {
                            this.pricingVariables = res.data.data;
                            this.total_records = res.data.meta.totalItemCount
                            this.page_size = res.data.meta.itemsPerPage
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.loading = false;
                        });

                }
            },

            updateVariableServices(newServiceIds, variable) {
                //first get all current related services of the pricing variable
                this.axios
                    .get("/pricing_variables/" + variable.id, {params: {filter: {include: ["services", "prices"]}}})
                    .then(res => {
                        //now get the servicesId and compare with the current one and then delete what's been removed and amend.
                        let current_serviceIds = res.data.serviceIds;
                        let deletedServiceRelations = current_serviceIds.filter(x => !newServiceIds.includes(x));
                        let newServiceRelations = newServiceIds.filter(x => !current_serviceIds.includes(x));

                        this.axios.post("/pricing_variables/" + variable.id + "/service-relations", {
                            remove: deletedServiceRelations,
                            add: newServiceRelations
                        }).then(res => {
                            this.reloadVariables(this.current_page);
                        });
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },

            selectVariable(variable) {
                console.log('clalled')

                this.activeTab = "";

                //show dialog boxes
                this.pricingDialog = true;

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
            deletePrice(price, index) {
                this.err_msg = "";
                this.axios
                    .delete("/prices/" + price.id)
                    .then(res => {
                        this.change_effected = true;
                        this.selectedVariable.prices.splice(index, 1);
                        this.$helpers.successHandle("Price successfully deleted");
                        this.reloadVariables(this.current_page, 2);
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    });
            },
            archiveVariable(variable) {

                let msg = 'Are you sure you want to activate this variable?';
                let status_msg = 'activated';
                if (variable.active) {
                    msg = 'Are you sure you want to archive this variable?';
                    status_msg = 'archived';
                }


                this.$confirm(msg, {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then(() => {
                    this.axios
                        .patch("/pricing_variables/" + variable.id, {
                            active: !variable.active
                        })
                        .then(res => {
                            this.$helpers.successHandle("Variable successfully " + status_msg);
                            this.reloadVariables(this.current_page, 2);
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        });
                })

            },
            duplicateVariable(variable) {
                delete variable.id;
                variable.name += " *";

                this.loading = true;

                this.axios
                    .post("/companies/current/pricing_variables", variable)
                    .then(res => {
                        // now add the first
                        this.reloadVariables(this.current_page, 2);
                    })
                    .catch(err => {
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },

            savePrice:_.debounce(function(price, index) {
                price.min_qty = parseFloat(price.min_qty);
                price.max_qty = parseFloat(price.max_qty);
                this.err_msg = "";
                this.change_effected = true;

                if (isNaN(price.price) || isNaN(price.min_qty) || isNaN(price.max_qty)) {
                    this.err_msg = "Only numbers are allowed";
                    return;
                }
                if (price.max_qty < price.min_qty) {
                    this.err_msg = "Maximum quantity must be more than minimum quantity";
                    this.violating_index = index;
                    return;
                }
                if (price.price < 0) { // Disallow negative prices
                    price.price = 0;
                    return;
                }
                if (price.min_qty < 0) { // Disallow negative minimums
                    price.min_qty = 0;
                    return;
                }
                if (price.max_qty < 0) { // Disallow negative maximums
                    price.max_qty = 0;
                    return;
                }


                if (price.hasOwnProperty("id")) {

                    if (this.selectedVariable.prices.length > 1) {
                        for (let i = 0; i < this.selectedVariable.prices.length; i++) {
                            if (i > 0) {
                                if (this.selectedVariable.prices[i].min_qty <= this.selectedVariable.prices[i - 1].max_qty) {
                                    this.violating_index = i;
                                    this.err_msg = "Next quantity range must exceed previous range";
                                    return;
                                }
                            }
                        }
                    }

                    this.pricing_update = true;
                    this.axios
                        .patch("/prices/" + price.id, price)
                        .then(res => {
                            this.selectedVariable.prices.splice(index, 1, res.data);
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        })
                        .finally(() => {
                            this.pricing_update = false;
                            this.violating_index = -1;
                        });
                } else {

                    if (this.selectedVariable.prices.length > 1) {

                        for (let i = 0; i < this.selectedVariable.prices.length; i++) {
                            if (i > 0) {
                                if (this.selectedVariable.prices[i].min_qty <= this.selectedVariable.prices[i - 1].max_qty) {
                                    this.violating_index = i;
                                    this.err_msg = "Next quantity range must exceed previous range";
                                    return;
                                }
                            }

                        }

                    }

                    this.pricing_update = true;
                    this.axios
                        .post("/pricing_variables/" + this.selectedVariable.id + "/prices", price)
                        .then(res => {
                            //this is updaing inline
                            this.selectedVariable.prices.splice(index, 1, res.data);
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        })
                        .finally(() => {
                            this.pricing_update = false;
                            this.violating_index = -1;
                        });
                }
            }, 1000),

            beforeClosePricingDialog() {
                if (this.change_effected) {
                    this.reloadVariables(this.current_page, 2);
                } else {
                    this.reloadVariables(this.current_page, 0);
                }
            },
            partialUpdateVariable(value, variable, property) {
                this.loading = true;
                this.axios
                    .patch("/pricing_variables/" + variable.id, {[property]: value})
                    .then(res => {
                        //this.loadServices()
                        this.$helpers.successHandle("Variable updated");
                        this.reloadVariables(this.current_page, 1)
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => (this.loading = false));
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

            .price-edit {
                display: block;
                line-height: 1;
                padding: 0;
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
                overflow: hidden;

                .price-item-form {
                    overflow: hidden;
                    margin-bottom: 20px;
                }
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

    .price-edit-modal {
        .pricing-item {
            overflow: hidden;

            .price-item-form {
                overflow: hidden;
                margin-bottom: 20px;

                .el-input-group {
                    vertical-align: baseline !important;
                }
            }
        }

        .pricing-item.violated-line {
            .price-item-form {
                .quantity-group {
                    border: 1px solid red;
                }
            }
        }

    }
</style>
