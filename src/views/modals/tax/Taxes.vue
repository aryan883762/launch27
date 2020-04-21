<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="false" append-to-body
                   :visible.sync="showModal" @close="settingsRedirect" custom-class="fullscreen-modal-display"
                   title="Taxes">
            <div class="modal-body taxes">

                <el-card :body-style="{padding: '20px'}" shadow="never" style="margin-bottom: 5px;">

                    <el-row>
                        <el-col class="flex-row">
                            <el-col :md="4" :sm="4">
                                <el-switch @change="updateSettings" active-text="Enable Sales Tax"
                                           v-model="settings.sales_tax"></el-switch>
                            </el-col>
                            <el-col :md="8" :sm="8">
                                <el-select @change="reloadTaxes()" class="filter small" v-model="filter_active">
                                    <el-option :value="true" label="Active"></el-option>
                                    <el-option :value="false" label="Archived"></el-option>
                                </el-select>
                            </el-col>

                            <el-col :md="12" :sm="12">
                                <el-button :disabled="!settings.sales_tax" @click="addNewTax" class="pull-right" plain round
                                           size="small" type="success">Add New Tax
                                </el-button>
                            </el-col>

                        </el-col>
                    </el-row>

                </el-card>

                <el-divider></el-divider>





                <el-table :data="taxes" v-loading="loading">
                    <el-table-column label="Tax name" prop="name"></el-table-column>
                    <el-table-column label="Tax">
                        <template slot-scope="scope">
                            {{ scope.row.value }} %
                        </template>
                    </el-table-column>
                    <el-table-column label="Effective Date">
                        <template slot-scope="scope">
                            {{ $moment(scope.row.effective_date).format("DD/MM/YYYY") }}
                        </template>
                    </el-table-column>

                    <el-table-column label="Set Locations" width="450" align="center">
                        <template slot-scope="scope">
                            <el-row>
                                <el-col :md="4" :sm="4">
                                    <el-switch @change="updateTax(scope.row)" active-color="green"
                                               v-model="scope.row.all_locations"></el-switch>
                                </el-col>
                                <el-col :md="20" :sm="20">
                                    <el-select v-if="!scope.row.all_locations" :disabled="scope.row.all_locations" @change="updateTax(scope.row)"
                                               collapse-tags filterable multiple v-model="scope.row.locationIds">
                                        <el-option :key="location.id" :label="location.name" :value="location.id"
                                                   v-for="location in locations"></el-option>
                                    </el-select>
                                    <div v-else> All locations</div>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>

                    <el-table-column label="Active">
                        <template slot-scope="scope">
                            <el-switch @change="updateTax(scope.row)" active-color="green"
                                       v-model="scope.row.active"></el-switch>
                        </template>
                    </el-table-column>

                    <el-table-column label="Options">
                        <template slot-scope="scope">
                            <el-link @click="editTax(scope.row)">Edit</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="archiveTax(scope.row)" v-if="scope.row.active">Archive</el-link>
                            <el-link @click="archiveTax(scope.row)" v-if="!scope.row.active">Activate</el-link>
                        </template>
                    </el-table-column>

                    <el-table-column label="Report">
                        <template slot-scope="scope">
                            <el-link @click="viewReport(scope.row.id)">View Report</el-link>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <el-dialog :close-on-press-escape="true" :title="'New Sales Tax'" :visible.sync="salesTaxDialog"
                       @close="beforeCloseTaxDialog" append-to-body width="50%">
                <el-form :model="form" :rules="rules" labelPosition="top" ref="salesfrm">
                    <el-row :gutter="40">
                        <el-col :md="24" :sm="24" :xs="24">
                            <el-form-item label="Name" prop="name">
                                <el-input placeholder="eg. Sales Tax, VAT " type="text" v-model="form.name"></el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :md="12" :sm="12" :xs="24">
                            <el-form-item label="Effective Date" prop="effective_date">
                                <el-date-picker placeholder="When tax comes into effect" type="date"
                                                v-model="form.effective_date"></el-date-picker>
                            </el-form-item>
                        </el-col>

                        <el-col :md="12" :sm="12" :xs="24">
                            <el-form-item label="Tax" prop="value">
                                <el-input type="number" v-model="form.value" required>
                                    <span slot="append">%</span>
                                </el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :md="24" :sm="24" :xs="24">
                            <el-form-item label="Options">
                                <el-checkbox v-model="form.active">Active</el-checkbox>
                                <el-checkbox v-model="form.all_locations">All Locations</el-checkbox>
                            </el-form-item>
                        </el-col>

                        <el-col :md="24" :sm="24" :xs="24">
                            <el-form-item label="Locations" v-if="!form.all_locations">
                                <el-select collapse-tags filterable multiple v-model="form.locationIds">
                                    <el-option :key="location.id" :label="location.name" :value="location.id"
                                               v-for="location in locations"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <div class="dialog-footer" slot="footer">
                    <el-button @click="salesTaxDialog = false" size="small" round >Cancel
                    </el-button>
                    <el-button :loading="updating_tax" @click="saveTax()" size="small" type="primary" round>Save Tax</el-button>
                </div>
            </el-dialog>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "SettingsTaxes",
        data() {
            return {
                showModal: false,
                taxes: [],
                locations: [],
                settings: {},
                loading: true,
                salesTaxDialog: false,
                filter_active: true,
                multiServiceIds:[],
                form: {
                    name: "",
                    effective_date: "",
                    value: 0,
                    all_locations: false,
                    locationIds: [],
                    active: true
                },
                rules: {
                    name: [{message: "Name is required", required: true}],
                    effective_date: [{message: "Effective date required", required: true}],
                    value: [
                        {
                            validator: (value, rule, callback) => {

                                if (this.form.value < 0){
                                    return callback(new Error('Tax cannot be less than 0'))
                                }
                                return callback()
                            }
                        }
                    ]
                },
                updating_tax: false
            };
        },
        mounted() {
            this.showModal = true;
        },
        created() {
            const getCompany = context => {
                return new Promise((resolve, reject) => {
                    context.axios
                        .get("/companies/current", {params: {filter: {include: ["settings"]}}})
                        .then(res => {
                            context.settings = res.data.settings;
                            context.locations = res.data.locations;
                            resolve();
                        })
                        .catch(err => {
                            reject(err);
                        });
                });
            };

            const getTaxes = context => {
                return new Promise((resolve, reject) => {
                    context.axios
                        .get("/companies/current/taxes")
                        .then(res => {
                            context.taxes = res.data;
                            resolve();
                        })
                        .catch(err => {
                            reject(err);
                        });
                });
            };

            (async context => {
                try {
                    this.loading = true;
                    await getCompany(context);
                    await getTaxes(context);
                    this.loading = false;
                } catch (err) {
                    this.loading = false;
                }
            })(this);
        },
        methods: {
            reloadTaxes() {
                this.loading = true;
                this.axios
                    .get("/companies/current/taxes",{
                        params: {
                            filter: {
                                where: {
                                    active: this.filter_active
                                }
                            }
                        }
                    })
                    .then(res => {
                        this.taxes = res.data;
                    })
                    .catch(err => {
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            settingsRedirect() {
                this.$router.push("/dashboard/settings");
            },
            beforeCloseTaxDialog() {
            },
            resetForm() {
                this.form = {
                    name: "",
                    effective_date: "",
                    value: "",
                    all_locations: false,
                    locationIds: [],
                    active: true
                };
            },
            updateSettings() {
                this.loading = true;
                this.axios
                    .put("/companies/current/settings", this.settings)
                    .then(res => {
                        this.settings = res.data;
                    })
                    .catch(err => {
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            addNewTax() {
                this.resetForm();
                this.salesTaxDialog = true;
            },
            updateTax(tax) {
                this.loading = true;
                this.axios
                    .put("/taxes", tax)
                    .then(res => {
                        this.reloadTaxes();
                    })
                    .catch((err) => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            editTax(tax) {
                this.form = tax;
                this.salesTaxDialog = true;
            },
            archiveTax(tax) {
                let msg = 'Are you sure you want to activate this tax?';
                let status_msg = 'activated';
                if (tax.active) {
                    msg = 'Are you sure you want to archive this tax?';
                    status_msg = 'archived';
                }


                this.$confirm(msg, {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                })
                    .then(() => {
                        this.axios
                            .patch("/taxes/" + tax.id, {
                                active: !tax.active
                            })
                            .then(res => {
                                this.$message.success("Tax successfully " + status_msg);
                                this.reloadTaxes();
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(() => {
                            })
                    })
            },
            saveTax() {
                this.$refs.salesfrm.validate(valid => {
                    if (valid) {

                        if (this.updating_tax) return

                        this.updating_tax = true

                        if (this.form.hasOwnProperty("id")) {
                            this.axios
                                .put("/taxes", this.form)
                                .then(res => {
                                    this.salesTaxDialog = false;
                                    this.reloadTaxes();
                                    this.resetForm();
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(_ => {
                                    this.updating_tax = false
                                });
                        } else {
                            this.axios
                                .post("/companies/current/taxes", this.form)
                                .then(res => {
                                    this.salesTaxDialog = false;
                                    this.reloadTaxes();
                                    this.resetForm();
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(_ => {
                                    this.updating_tax = false
                                });
                        }
                    }
                });
            },
            viewReport(id) {
                this.$router.push({name: 'dashboard_settings_sales_tax_report', params: {id: id}})
            }
        }
    };
</script>
<style lang="scss"></style>
