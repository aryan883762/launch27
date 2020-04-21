<template>
    <el-row :gutter="20" class="variables">
        <el-col :sm="24">
            <el-card :body-style="{display:'flex', 'justify-content':'space-between', width: '100%'}" class="flex-row" shadow="never" style="margin-bottom: 5px;">
                <el-popover
                        ref="popover1"
                        placement="right"
                        title="Extra Settings"
                        width="400"
                        trigger="click">
                    <el-link type="danger" slot="reference"><i style="font-size: 16px;margin-right: 5px;" class="el-icon-setting"></i>Settings</el-link>
                    <div class="content">
                        <el-switch @change="updateBookingSettings" active-color="#13ce66" v-model="$auth.user().company.settings.booking.show_extra_price" active-text="Show prices on booking form"></el-switch>
                    </div>
                </el-popover>
                <div>
                    <el-button style="margin-right: 10px;" @click="addNewExtra()" icon="el-icon-plus" plain round size="mini" type="success">Add New Extra</el-button>

                    <el-select @change="loadExtras()" class="filter small" v-model="filter_active">
                        <el-option :value="true" label="Active"></el-option>
                        <el-option :value="false" label="Archived"></el-option>
                    </el-select>
                </div>

            </el-card>


            <el-table :data="extras" v-loading="loading">
                <el-table-column label="Name" prop="name"></el-table-column>
                <el-table-column align="center" label="Equipment?">
                    <template slot-scope="scope">
                        {{ scope.row.equipment ? "Yes" : "No" }}
                    </template>
                </el-table-column>

                <el-table-column align="center" label="Duration" width="150">
                    <template slot-scope="scope">
                        {{ scope.row.duration | duration }}
                    </template>
                </el-table-column>

                <el-table-column align="center" label="Price" prop="price">
                    <template slot-scope="scope">
                        {{ $currency }}{{ scope.row.price }}
                    </template>
                </el-table-column>
                <!--<el-table-column label="Duration" prop="duration"></el-table-column>-->
                <el-table-column align="center" label="Min. Qty" prop="minimum_quantity"></el-table-column>
                <el-table-column align="center" label="Max. Qty" prop="maximum_quantity"></el-table-column>
                <el-table-column align="center" label="Services" prop="services" width="300px">
                    <template slot-scope="scope">
                        <el-select @change="updateExtraServices($event, scope.row)" style="width: 250px;" collapse-tags filterable multiple v-model="scope.row.serviceIds">
                            <el-option v-show="srv.active" :key="srv.id" :label="srv.name" :value="srv.id" v-for="srv in services"></el-option>
                        </el-select>
                    </template>
                </el-table-column>

                <el-table-column lable="Options" width="300px">
                    <template slot-scope="scope">
                        <el-button-group class="table-action-btns">
                            <el-link @click="manageExtra(scope.row)" type="primary">Edit</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="duplicateExtra(scope.row)">Duplicate</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="archiveExtra(scope.row)" v-if="scope.row.active">Archive</el-link>
                            <el-link @click="archiveExtra(scope.row)" v-if="!scope.row.active">Activate</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <view-changes :id="scope.row.id"></view-changes>
                        </el-button-group>
                    </template>
                </el-table-column>
                <el-table-column width="70px" label="Order">
                    <template slot-scope="scope">
                        <reorder-item :index="scope.$index" model="extras" :item="scope.row" :list="extras" @change="loadExtras(1)"></reorder-item>
                    </template>
                </el-table-column>
            </el-table>
            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadExtras" background layout="total, prev, pager, next"></el-pagination>
                </div>
            </el-col>
        </el-col>

    </el-row>
</template>

<script>
    import CreateExtra from "./CreateExtra.vue";
    import ViewChanges from "../../../components/ViewChanges";
    import ReorderItem from "../../../components/ReorderItems";

    export default {
        components: {
            ReorderItem,
            ViewChanges,
            CreateExtra
        },
        data: () => {
            return {
                extraDialog: false,
                loading: false,
                extras: [],
                services: [],
                selectedExtra: false,
                total_records: 0,
                page_size: 0,
                current_page: 1,
                filter_active: true
            };
        },

        created() {
            this.loadServices();
            this.loadExtras(1);
            this.$events.emitEvent('track-page')
        },

        mounted() {
            this.$events.addListener("extra:dialog:close", this.extraDialogClosed);
        },


        beforeMount() {
            //pre-load
            if (this.$storage.getItem('extras_filter')) {
                this.filter_active = (this.$storage.getItem('extras_filter') === "true")
            }

        },
        beforeDestroy() {
            //set fitlers to storage
            this.$storage.setItem('extras_filter', this.filter_active)
            this.$events.removeListener("extra:dialog:close", this.extraDialogClosed);
        },


        methods: {
            loadServices() {
                this.axios
                    .get("/companies/current/services", {})
                    .then(res => {
                        this.services = res.data;
                    })
                    .catch(err => {
                    })
                    .then(() => {
                    });
            },
            addNewExtra() {
                this.$router.push({name: 'dashboard_settings_extra_add'})
            },
            loadExtras(current_page) {
                if (!current_page) current_page = this.current_page;
                this.loading = true;
                this.axios
                    .get("/companies/current/extras", {
                        params: {
                            page: this.current_page,
                            filter: {
                                where: {active: this.filter_active},
                                order: "ordering ASC",
                                include: ["services"]
                            }
                        }
                    })
                    .then(res => {
                        this.extras = res.data.data;
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },

            manageExtra(extra) {
                this.$router.push({
                    name: 'dashboard_settings_extra_edit',
                    params: {id: extra.id}
                })
            },
            archiveExtra(extra) {

                let msg = 'Are you sure you want to activate this extra?';
                let status_msg = 'activated';
                if (extra.active) {
                    msg = 'Are you sure you want to archive this extra?';
                    status_msg = 'archived';
                }


                this.$confirm(msg, {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then(() => {
                    this.axios
                        .patch("/extras/" + extra.id,
                            {
                                active: !extra.active
                            })
                        .then((res) => {
                            this.$helpers.successHandle("Extra successfully " + status_msg);
                        })
                        .catch()
                        .then(() => {
                            this.loadExtras(this.current_page);
                        });
                })


            },

            duplicateExtra(extra) {
                this.selectedExtra = extra;
                delete this.selectedExtra.id;
                this.selectedExtra.name += " - duplicate";

                this.saveExtra();
            },

            saveExtra() {
                if (this.selectedExtra.hasOwnProperty("id")) {
                    // a patch
                    delete this.selectedExtra.services;
                    this.axios
                        .patch("/extras/" + this.selectedExtra.id, this.selectedExtra)
                        .then(res => {
                            this.selectedExtra = res.data;
                            // now add the first
                            this.loadExtras(this.current_page);
                        })
                        .catch(err => {
                        });
                } else {
                    // create a new one
                    this.axios
                        .post("/companies/current/extras", this.selectedExtra)
                        .then(res => {
                            this.selectedExtra = res.data;
                            // now add the first
                            this.loadExtras(this.current_page);
                        })
                        .catch(err => {
                        });
                }
            },


            extraDialogOpened() {
                this.$events.emitEvent("extra:dialog:edit", [this.selectedExtra]);
            },

            extraDialogClosed() {
                this.extraDialog = false;
                this.selectedExtra = false;
                this.loadExtras(this.current_page);
            },

            updateExtraServices(newServiceIds, variable) {
                //first get all current related services of the pricing variable
                this.axios
                    .get("/extras/" + variable.id, {params: {filter: {include: ["services"]}}})
                    .then(res => {
                        //now get the servicesId and compare with the current one and then delete what's been removed and amend.
                        let current_serviceIds = res.data.serviceIds;
                        let deletedServiceRelations = current_serviceIds.filter(x => !newServiceIds.includes(x));
                        let newServiceRelations = newServiceIds.filter(x => !current_serviceIds.includes(x));

                        this.axios.post("/extras/" + variable.id + "/service-relations", {
                            remove: deletedServiceRelations,
                            add: newServiceRelations
                        }).then(res => {
                            this.loadExtras(this.current_page);
                        });
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },
            updateBookingSettings(val) {
                this.loading = true

                this.axios.patch('/company_settings/' + this.$auth.user().company.settings.id,
                    {
                        booking: this.$auth.user().company.settings.booking
                    })
                    .then(res => {
                        this.$helpers.successHandle('Extra settings updated')
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

<style lang="scss"></style>
