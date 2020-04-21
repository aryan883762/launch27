<template>
    <el-form :model="model" :rules="rules" class="service-step-section" label-position="top" ref="form"
             v-loading="loading">
        <el-row :gutter="10">

            <el-form-item label="Choose a category" prop="serviceCategoryId">
                <el-select @change="getCategoryServices" filterable style="width: 300px;"
                           v-model="model.serviceCategoryId">
                    <el-option label="All Services" value="0">All Services</el-option>
                    <el-option :key="category.id" :label="category.name" :value="category.id"
                               v-for="category in service_categories"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item prop="services">
                <el-col :key="service.id" :sm="6" style="margin-bottom:10px;" v-for="service in company_services">
                    <el-card :class="{ selected: isSelected(service.id) }" @click.native="addService(service)"
                             class="service-card" shadow="hover">
                        <el-popover v-if="service.description || service.has_disclaimer" placement="top" title="About this service" trigger="hover" width="300">
                            <div>
                                <p>{{ service.description || "n/a" }}</p>
                                <p v-if="service.has_disclaimer">
                                    <small style="display:block; color:black;">Disclaimer</small>
                                    {{ service.disclaimer }}
                                </p>
                            </div>
                            <i class="el-icon-info" slot="reference"></i>
                        </el-popover>

                        <el-avatar shape="square">
                            <img :src="service.icon"/>
                        </el-avatar>
                        <label>{{ service.name }} ({{ $currency }}{{ service.base_price }})</label>
                        <i class="el-icon-circle-check" v-if="isSelected(service.id)"></i>
                    </el-card>
                </el-col>
            </el-form-item>
        </el-row>

        <el-dialog :visible.sync="pvDialog" append-to-body title="Confirm your service" width="30%">
            <div class="modal-body" v-loading="loading_pv">
                <div class="service-hourly" v-if="pvService.hourly">
                    <el-form labelPosition="top">
                        <el-form-item label="Teams">
                            <el-select v-model="pvService.hourly_teams">
                                <el-option :key="n" :value="n"
                                           v-for="n in parseInt(pvService.hourly_settings.teams_maximum)"
                                           v-if="n >= parseInt(pvService.hourly_settings.teams_minimum)"> {{ n }} Teams
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Hours">
                            <el-select v-model="pvService.hours">
                                <el-option :key="n" :value="n"
                                           v-for="n in parseInt(pvService.hourly_settings.hours_maximum)"
                                           v-if="n >= parseInt(pvService.hourly_settings.hours_minimum)"> {{ n }} hours
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>

                <div class="pricing_variables"
                     v-if="!pvService.hourly && pvServiceVariables && pvServiceVariables.length > 0">
                    <div v-for="(pv, index) in pvServiceVariables">
                        <el-form label-position="top">
                            <el-form-item :label="pv.name">
                                <el-select style="margin-bottom: 10px;" v-if="pv.prices.length == 1"
                                           v-model="pvService.pricing_variables[index].quantity">
                                    <el-option :key="n"
                                               :label="n + ' ' + pv.name + ' (' + $currency + ' ' + pv.prices[0].price * n + ')'"
                                               :value="n" v-for="n in pv.prices[0].max_qty"
                                               v-if="n >= pv.prices[0].min_qty"></el-option>
                                </el-select>
                                <el-select v-if="pv.prices.length > 1"
                                           v-model="pvService.pricing_variables[index].selected_range" value-key="id">
                                    <el-option :key="x"
                                               :label="(price.label || 'Range ' + (x+1)) + ' - [' + price.min_qty + ' - ' + price.max_qty + '] (' + $currency + price.price + ')'"
                                               :value="price" v-for="(price, x) in pv.prices"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>

                    </div>
                </div>
            </div>
            <div class="dialog-footer" slot="footer">
                <el-button @click="cancelService" round size="small">Cancel</el-button>
                <el-button @click="confirmServiceSelection()" round size="small" type="primary">Choose</el-button>
            </div>
        </el-dialog>
    </el-form>
</template>

<script>
    export default {
        props: ["booking"],
        data: () => {
            return {
                model: {
                    services: [],
                    pricing_variables: {},
                    service_options: {},
                    random: ""
                },
                rules: {
                    services: [
                        {
                            validator: (rule, value, callback) => {
                                if (value.length === 0) return callback(new Error("At least one service is required"));
                                return callback();
                            },
                            trigger: "blur"
                        }
                    ]
                },
                company_services: [],
                loading: true,
                count_services: 1,
                pvDialog: false,
                pvService: false,
                service_categories: [],
                filter: {
                    where: {
                        active: true
                    },
                    include: [
                        {
                            relation: "pricing_variables",
                            scope: {
                                where: {active: true}
                            }
                        },
                        {
                            "relation": "extras",
                            "scope": {
                                where: {active: true},
                                order: "ordering ASC",
                            }
                        }]
                },
                loading_pv: false,
                pvServiceVariables: false
            };
        },

        watch: {
            model: {
                handler(val, oldval) {
                    this.validate();
                },
                deep: true
            },
            booking(val) {
                if (val) {
                  ///  this.model.services = val.serviceIds
                   // this.model.service_options = val.meta.service_options
                   // this.model.serviceCategoryId = val.serviceCategoryId
                }
            }
        },

        mounted() {

            (async () => {
                try {
                    this.loading = true
                    this.service_categories = (await this.axios.get('/companies/current/serviceCategories', {
                        params: {
                            filter: {
                                where: {active: true}
                            }
                        }
                    })).data

                    this.company_services = (await this.axios.get("/companies/current/services", {
                        params: {
                            filter: this.filter
                        }
                    })).data


                    this.$events.emitEvent("booking:data:services", [this.company_services]);

                    if (this.booking) {
                        //this.model.services = this.booking.serviceIds
                        // this.model.service_options = this.booking.meta.service_options
                        //this.model.serviceCategoryId = this.booking.serviceCategoryId
                    }

                    this.loading = false


                } catch (err) {
                    this.$helpers.errorHandle(err, this)
                    this.loading = false
                }
            })()


        },

        methods: {
            getCategoryServices(categoryId) {

                this.loading = true
                let url
                if (categoryId == 0) {
                    url = "/companies/current/services"

                } else {
                    url = "/service_categories/" + categoryId + '/services'
                }


                this.axios.get(url, {
                    params: {
                        filter: this.filter
                    }
                }).then(res => {
                    this.company_services = res.data
                    this.$events.emitEvent("booking:data:services", [this.company_services]);

                    if (this.booking) {
                        //this.model.services = this.booking.serviceIds
                        //this.model.service_options = this.booking.meta.service_options
                    }

                    this.loading = false
                }).catch(err => {
                    this.$helpers.errorHandle(err, this)
                    this.loading = false
                })

            },

            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        // we want the model to be updated even if service length is 0,
                        // so that the price is correctly estimated
                        // this step will still be invalid but the price will be estimated
                        this.$emit("on-validate", true, this.model);
                        resolve(valid);
                        this.$emit("changed")
                    });
                });
            },

            addService(srv) {
                let multiple_services = this.$auth.user().company.settings.booking.multiple_services || false
                let selected = this.model.services.find(id => {
                    return id === srv.id;
                });

                if (selected) {
                    this.model.services.splice(this.model.services.indexOf(srv.id), 1);
                } else {
                    //trigger Priving Variable Selection

                    if (srv.hourly || srv.pricing_variables.length > 0) {
                        this.model.service_options[srv.id] = {teams: 0, hours: 0, pricing_variables: {}};
                        this.loading_pv = true
                        this.pvService = srv
                        this.axios.get('/services/' + srv.id + '/pricing_variables', {
                            params: {
                                filter: {
                                    include: ["prices"],
                                    where: {active: true}
                                }
                            }
                        })
                            .then(res => {
                                this.pvServiceVariables = res.data
                                this.pvService.pricing_variables = res.data
                                this.pvDialog = true;
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(() => {
                                this.loading_pv = false
                            })

                    } else {
                        if (multiple_services)
                            this.model.services.push(srv.id);
                        else
                            this.model.services = [srv.id]
                    }
                }
            },

            confirmServiceSelection() {
                let multiple_services = this.$auth.user().company.settings.booking.multiple_services

                if (this.pvService.hourly) {
                    //create hourly option
                    this.model.service_options[this.pvService.id] = {
                        hourly: {
                            teams: this.pvService.hourly_teams,
                            hours: this.pvService.hours
                        }
                    };
                    //now add service as selected
                    if (this.pvService.hourly_teams && this.pvService.hours) {
                        if (multiple_services)
                            this.model.services.push(this.pvService.id);
                        else
                            this.model.services = [this.pvService.id]
                    }
                } else {
                    this.model.service_options[this.pvService.id] = {
                        pricing_variables: {}
                    };

                    //now add the pricing variables
                    this.pvService.pricing_variables.forEach(pv => {
                        this.model.service_options[this.pvService.id].pricing_variables[pv.id] = {
                            not_ranged: pv.quantity,
                            ranged: pv.selected_range
                        };
                    });

                    //make sure we only add service after pricing variables are all selected for the service.
                    let invalid = false;
                    for (var x in this.model.service_options[this.pvService.id].pricing_variables) {
                        let pvs = this.model.service_options[this.pvService.id].pricing_variables[x];
                        if (!pvs.ranged && !pvs.not_ranged) {
                            invalid = true;
                        }
                    }

                    if (!invalid) {
                        if (multiple_services)
                            this.model.services.push(this.pvService.id);
                        else
                            this.model.services = [this.pvService.id]
                    }
                }

                this.pvDialog = false;
                this.pvService = false;
                this.pvServiceVariables = [];
            },

            isSelected(service_id) {
                //lets make sure this service is not already selectedt
                return this.model.services.find(id => {
                    return id === service_id;
                });
            },

            cancelService() {
                this.pvDialog = false;
            }
        }
    };
</script>

<style lang="scss">
    .service-step-section {
        .el-card {
            height: 100px;
            position: relative;
            cursor: pointer;

            &.selected {
                background: #fff8e1;
            }

            i.el-icon-info {
                position: absolute;
                top: 5px;
                right: 5px;
                font-size: 14px;
                color: lighten(#000, 50);

                opacity: 0;
            }

            &:hover {
                i.el-icon-info {
                    opacity: 1;
                }
            }

            i.el-icon-circle-check {
                position: absolute;
                bottom: 3px;
                left: 3px;
                color: #8bc34a;
                font-size: 20px;
            }

            i.service-price {
                position: absolute;
                left: 10px;
                top: 0px;
                font-size: 17px;
                font-weight: 500;
                font-style: normal;
            }

            .el-avatar {
                margin: 0 auto;
                display: block;

                img {
                    width: 100%;
                }
            }

            label {
                text-align: center;
                display: inline-block;
                width: 100%;
            }
        }
    }
</style>
