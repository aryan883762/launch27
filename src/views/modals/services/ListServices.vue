<template>
    <el-row :gutter="20">
        <el-col :sm="24" class="service-list-section">
            <el-card :body-style="{padding: '20px'}" shadow="never" style="margin-bottom: 5px;">

                <el-row>
                    <el-col class="flex-row">
                        <div class="main-filters pull-left">

                            <el-popover
                                    ref="popover1"
                                    placement="right"
                                    title="Service Settings"
                                    width="400"
                                    trigger="click">
                                <el-link type="danger" slot="reference" ><i style="font-size: 16px;margin-right: 5px;" class="el-icon-setting"></i>Settings</el-link>
                                <div class="content">
                                    <el-switch style="margin-bottom: 10px;" @change="updateBookingSettings" active-color="#13ce66" v-model="$auth.user().company.settings.booking.multiple_services" active-text="Enable Multiple services booking"></el-switch>
                                    <el-switch @change="updateBookingSettings" active-color="#13ce66" v-model="$auth.user().company.settings.booking.show_service_price" active-text="Show prices on booking form"></el-switch>
                                </div>
                            </el-popover>
                            <el-tooltip placement="right">
                                <label slot="content">
                                    Allow booking of more than one service per booking
                                </label>
                            </el-tooltip>

                        </div>

                        <div class="pull-right main-filters">




                            <el-button @click="addNewService()" icon="el-icon-plus" plain round size="mini"
                                       type="success">Add New Service
                            </el-button>

                            <div style="display:inline-flex; margin-right:10px;">
                                <el-dropdown @command="handleCommand" class="pull-right" size="mini"
                                             style="margin-left: 10px;" type="primary">
                                    <el-button size="mini" type="primary">
                                        Action<i class="el-icon-arrow-down el-icon--right"></i>
                                    </el-button>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item :disabled="multiServiceIds.length === 0 || !filter_active"
                                                          command="archive">Archive
                                        </el-dropdown-item>
                                        <el-dropdown-item :disabled="multiServiceIds.length === 0 || filter_active"
                                                          command="active">Active
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>

                            </div>


                            <el-select @change="loadServices()" class="filter small" v-model="filter_active" style="margin-right: 10px;">
                                <el-option :value="true" label="Active"></el-option>
                                <el-option :value="false" label="Archived"></el-option>
                            </el-select>

                        </div>
                    </el-col>
                </el-row>

            </el-card>


            <el-table :data="services" @selection-change="handleSelectionChange" v-loading="loading">
                <el-table-column type="selection" width="55"></el-table-column>


                <el-table-column label="Service Name" prop="name" style="font-weight:bold"></el-table-column>
                <el-table-column align="center" label="Price">
                    <template slot-scope="scope">
                        {{ $currency }}{{ scope.row.base_price }}
                    </template>
                </el-table-column>

                <el-table-column align="center" label="Duration">
                    <template slot-scope="scope">
                        {{ scope.row.duration | duration }}
                    </template>
                </el-table-column>

                <el-table-column align="center" label="Variables" prop="name" width="110px">
                    <template slot-scope="scope">
                        <el-popover
                                ref="popover1"
                                placement="right-end"
                                title="Pricing Variables"
                                width="600"
                                trigger="hover"
                                @show="loadPvs(scope.row.id)">
                            <div v-if="pVS.length > 0">
                                <el-table :data="pVS">
                                    <el-table-column label="Variable Name" prop="name"></el-table-column>
                                    <el-table-column label="Duration">
                                        <template slot-scope="scope">
                                            {{scope.row.duration | duration}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="Pricing">
                                        <template slot-scope="scope">
                                            <div v-for="price in scope.row.prices">
                                                <span style="min-width: 100px;display:inline-block">{{ price.label }} </span>
                                                <el-divider direction="vertical"></el-divider>
                                                <span style="min-width: 70px;display:inline-block">{{ $currency }}{{ price.price }} </span>
                                                <el-divider direction="vertical"></el-divider>
                                                <span>Range: {{ price.min_qty }} - {{ price.max_qty }}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                            <p class="text-center" style="margin: 0" v-if="scope.row.pricing_variables.length <= 0">
                                No variable pricing available for this service
                            </p>
                            <el-button type="warning" size="small" slot="reference">{{ scope.row.pricing_variables.length }}</el-button>
                        </el-popover>

                    </template>
                </el-table-column>
                <el-table-column align="center" label="Taxable?" width="110px">
                    <template slot-scope="scope">
                        <el-switch @change="partialUpdateService($event, scope.row, 'taxable')" active-color="#13ce66"
                                   v-model="scope.row.taxable"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="Private?" width="110px">
                    <template slot-scope="scope">
                        <el-switch @change="partialUpdateService($event, scope.row, 'private')" active-color="#13ce66"
                                   v-model="scope.row.private"></el-switch>
                    </template>
                </el-table-column>

                <el-table-column align="center" class="text-center" label="All Locations" width="110px">
                    <template slot-scope="scope">
                        <el-switch @change="partialUpdateService($event, scope.row, 'all_locations')"
                                   active-color="#13ce66" v-model="scope.row.all_locations"></el-switch>
                    </template>
                </el-table-column>

                <el-table-column align="center" label="In Payouts?" width="110px">
                    <template slot-scope="scope">
                        <el-switch @change="partialUpdateService($event, scope.row, 'payout_included')"
                                   active-color="#13ce66" v-model="scope.row.payout_included"></el-switch>
                    </template>
                </el-table-column>

                <el-table-column lable="Options" width="300px">
                    <template slot-scope="scope">
                        <el-button-group class="table-action-btns">
                            <el-link @click="manageService(scope.row)" type="primary">Edit</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="duplicateService(scope.row)">Duplicate</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="archiveService(scope.row)" v-if="scope.row.active">Archive</el-link>
                            <el-link @click="archiveService(scope.row)" v-if="!scope.row.active">Activate</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <view-changes :id="scope.row.id" model-name="services"></view-changes>
                        </el-button-group>
                    </template>
                </el-table-column>
                <el-table-column width="70px">
                    <template slot-scope="scope">
                        <reorder-item :index="scope.$index" model="services" :item="scope.row" :list="services" @change="loadServices(1)"></reorder-item>
                    </template>
                </el-table-column>
            </el-table>

            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records"
                                   @current-change="loadServices" background
                                   layout="total, prev, pager, next"></el-pagination>
                </div>
            </el-col>
        </el-col>

    </el-row>
</template>

<script>
    import SideHelp from "../../components/SideHelp.vue";
    import CreateService from "./Create.vue";
    import ViewChanges from "../../../components/ViewChanges";
    import ReorderItem from "../../../components/ReorderItems";


    export default {
        props: {},
        components: {
            ReorderItem,
            SideHelp,
            CreateService,
            ViewChanges
        },
        data: () => {
            return {
                selectedService: false,
                searchSelectedService: "",
                rules: {},
                serviceDialog: false,
                services: [],
                loading: false,
                total_records: 0,
                page_size: 0,
                current_page: 1,
                filter_active: true,
                multiServiceIds: [],
                pVS: []
            };
        },

        watch: {
            serviceDialog(val) {
                if (!val) this.selectedService = false;
            }
        },

        created() {
            this.$events.emitEvent('track-page')
        },

        mounted() {
            this.loadServices(1);
            this.$events.addListener("services:dialog:close", this.serviceDialogClose);
        },


        beforeMount() {
            //pre-load
            if (this.$storage.getItem('services_filter')) {
                this.filter_active = (this.$storage.getItem('services_filter') === "true")
            }

        },
        beforeDestroy() {
            //set fitlers to storage
            this.$storage.setItem('services_filter', this.filter_active)
        },

        methods: {

            handleCommand(command) {
                if (this.multiServiceIds.length > 0) {
                    //archive the list of services
                    this.loading = true;

                    this.axios.post('/services/bulk-update', {serviceIds: this.multiServiceIds, action: command})
                        .then(res => {
                            this.$helpers.successHandle("Services successfully updated")
                            this.multiServiceIds = []
                            this.loadServices(1)
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
                this.multiServiceIds = []
                val.forEach(row => {
                    this.multiServiceIds.push(row.id)
                })
            },

            partialUpdateService(value, service, property) {
                this.loading = true;
                this.axios
                    .patch("/services/" + service.id, {[property]: value})
                    .then(res => {
                        //this.loadServices()
                        this.$helpers.successHandle("Service updated");
                    })
                    .catch(err => {
                    })
                    .then(() => (this.loading = false));
            },

            serviceDialogOpened() {
                //this sends dialog to service editting window
                this.$events.emitEvent("services:dialog:edit", [this.selectedService]);
            },

            serviceDialogClosed() {
                this.selectedService = false;
                this.loadServices(this.current_page);
            },

            serviceDialogClose() {
                this.serviceDialog = false;
            },

            loadServices(current_page) {
                this.loading = true;
                this.axios
                    .get("/services", {
                        params: {
                            page: this.current_page,
                            filter: {
                                where: {
                                    active: this.filter_active
                                },
                                order: "ordering ASC",
                                include: [
                                    {
                                        relation: "pricing_variables",
                                        scope: {
                                            where: {active: true},
                                            include: "prices"
                                        }
                                    }, "tags"]
                            }
                        }
                    })
                    .then(res => {
                        this.services = res.data.data;
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },

            addNewService() {
                this.$router.push({name: 'dashboard_settings_services_add'})
            },

            manageService(service) {
                this.$router.push({
                    name: 'dashboard_settings_services_edit',
                    params: {id: service.id}
                })
            },

            archiveService(service) {

                let msg = 'Are you sure you want to activate this service?';
                let status_msg = 'activated';
                if (service.active) {
                    msg = 'Are you sure you want to archive this service?';
                    status_msg = 'archived';
                }


                this.$confirm(msg, {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                })
                    .then(() => {
                        this.axios
                            .patch("/services/" + service.id, {
                                active: !service.active
                            })
                            .then(res => {
                                this.$helpers.successHandle("Service successfully " + status_msg);
                                this.loadServices(this.current_page);
                            })
                            .catch(err => {
                            });
                    })
            },

            duplicateService(service) {
                this.selectedService = service;
                delete this.selectedService.id;
                this.selectedService.name = this.selectedService.name + " duplicate";
                // now save
                this.saveService();
            },
            loadPvs(serviceId) {
                this.axios.get('/services/' + serviceId + "/pricing_variables",
                    {
                        params: {
                            filter: {
                                include: ["prices"],
                                where: {active: true}
                            }
                        }
                    })
                    .then(res => {
                        this.pVS = res.data
                    })
            },

            saveService() {
                if (this.selectedService.hasOwnProperty("id")) {
                    this.axios
                        .put("/companies/current/services/" + this.selectedService.id, this.selectedService)
                        .then(res => {
                            this.$helpers.successHandle("Service successfully updated");
                            this.loadServices(this.current_page);
                        })
                        .catch(err => {
                        });
                } else {
                    this.axios
                        .post("/companies/current/services", this.selectedService)
                        .then(res => {
                            this.$helpers.successHandle("Service successfully saved");
                            this.loadServices(this.current_page);
                        })
                        .catch(err => {
                        });
                }
            },
            updateBookingSettings(val) {
                this.loading = true

                this.axios.patch('/company_settings/' + this.$auth.user().company.settings.id,
                    {
                        booking: this.$auth.user().company.settings.booking
                    })
                    .then(res => {
                        this.$helpers.successHandle('Service settings updated')
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }

        }
    };
</script>
