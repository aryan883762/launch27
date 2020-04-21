<template>
    <el-row :gutter="20" class="variables">
        <el-col :sm="24">
            <el-card shadow="never" style="margin-bottom: 5px;">

                <el-row>
                    <el-col class="flex-row">
                        <div class="main-filters pull-left">
                            <el-select @change="loadFrequencies()" class="filter small" v-model="filter_active">
                                <el-option :value="true" label="Active"></el-option>
                                <el-option :value="false" label="Archived"></el-option>
                            </el-select>

                            <el-switch @change="toggleRecurring" active-color="#13ce66" v-model="$auth.user().company.settings.frequency.recurring.exclude_first_booking" active-text="Exclude frequency from first booking"></el-switch>

                        </div>

                        <div class="main-filters pull-right">
                            <el-button @click="addNewFrequency()" class="pull-right" icon="el-icon-plus" plain round size="mini" type="success">Add new frequency</el-button>
                        </div>


                    </el-col>
                </el-row>


            </el-card>


            <el-table :data="frequencies" v-loading="loading">
                <el-table-column label="Name">
                    <template slot-scope="scope">
                        {{scope.row.name}}
                        <el-tooltip content="Private frequency">
                            <el-tag size="mini" v-if="scope.row.private" style="margin-right: 5px;">P</el-tag>
                        </el-tooltip>
                        <el-tooltip content="Default Frequency">
                            <el-tag size="mini" v-if="scope.row.default" style="margin-right: 5px;">Default</el-tag>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="Discount">
                    <template slot-scope="scope">
                        {{ scope.row.discount_type === "percent" ? scope.row.discount.toString() + "%" : $currency + scope.row.discount.toString() }}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="Services">
                    <template slot-scope="scope">
                        {{ scope.row.serviceIds.length }}
                    </template>
                </el-table-column>
                <el-table-column align="center" label="All Services" prop="is_global">
                    <template slot-scope="scope">
                        <el-switch @change="updateIsGlobal(scope.row)" v-model="scope.row.is_global"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column lable="Options" width="300">
                    <template slot-scope="scope">
                        <el-button-group class="table-action-btns">
                            <el-link @click="manageFrequency(scope.row)" type="primary">Edit</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="duplicateFrequency(scope.row)">Duplicate</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="archiveFrequency(scope.row)" v-if="scope.row.active">Archive</el-link>
                            <el-link @click="archiveFrequency(scope.row)" v-if="!scope.row.active">Activate</el-link>
                            <el-divider direction="vertical"></el-divider>
                            <view-changes :id="scope.row.id"></view-changes>
                        </el-button-group>
                    </template>
                </el-table-column>
                <el-table-column width="70px" label="Order">
                    <template slot-scope="scope">
                        <reorder-item :index="scope.$index" model="frequencies" :item="scope.row" :list="frequencies" @change="loadFrequencies(1)"></reorder-item>
                    </template>
                </el-table-column>
            </el-table>

            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadFrequencies" background layout="total, prev, pager, next"></el-pagination>
                </div>

            </el-col>

        </el-col>

    </el-row>
</template>

<script>
    import CreateFrequency from "./CreateFrequency.vue";
    import ViewChanges from "../../../components/ViewChanges";
    import ReorderItem from "../../../components/ReorderItems";

    export default {
        components: {
            ReorderItem,
            ViewChanges,
            CreateFrequency
        },
        data: () => {
            return {
                frequencies: [],
                loading: true,
                frequencyDialog: false,
                selectedFrequency: false,
                total_records: 0,
                page_size: 0,
                current_page: 1,
                filter_active: true
            };
        },

        mounted() {
            this.loadFrequencies(1);
            this.$events.addListener("frequency:dialog:close", this.frequencyDialogClosed);
            this.$events.emitEvent('track-page')
        },

        beforeMount() {
            //pre-load
            if (this.$storage.getItem('frequency_filter')) {
                this.filter_active = (this.$storage.getItem('frequency_filter') === "true")
            }

        },
        beforeDestroy() {
            //set fitlers to storage
            this.$storage.setItem('frequency_filter', this.filter_active)
        },

        methods: {
            addNewFrequency() {
                this.$router.push({name: "dashboard_settings_frequency_add"})
            },

            loadFrequencies(current_page) {

                if (!current_page) current_page = this.current_page

                this.loading = true;
                this.axios
                    .get("/companies/current/frequencies", {
                        params: {
                            page: current_page,
                            filter: {
                                where: {active: this.filter_active},
                                order: "ordering ASC"
                            }
                        }
                    })
                    .then(res => {
                        this.frequencies = res.data.data;
                        this.total_records = res.data.meta.totalItemCount
                        this.page_size = res.data.meta.itemsPerPage
                    })
                    .catch()
                    .then(() => {
                        this.loading = false;
                    });
            },

            manageFrequency(frequency) {
                this.$router.push({
                    name: "dashboard_settings_frequency_edit",
                    params: {id: frequency.id}
                })
            },

            duplicateFrequency(frequency) {
                this.selectedFrequency = frequency;
                delete this.selectedFrequency.id;
                this.selectedFrequency.name = this.selectedFrequency.name + " *";
                // now save
                this.saveFrequency();
            },

            archiveFrequency(frequency) {

                let msg = 'Are you sure you want to activate this frequency?';
                let status_msg = 'activated';
                if (frequency.active) {
                    msg = 'Are you sure you want to archive this frequency?';
                    status_msg = 'archived';
                }


                this.$confirm(msg, {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then(() => {
                    this.axios.patch('/frequencies/' + frequency.id,
                        {
                            active: !frequency.active
                        })
                        .then(() => {
                            this.$helpers.successHandle("Frequency successfully " + status_msg);
                            this.loadFrequencies()
                        })
                })
            },
            updateIsGlobal(frequency) {
                this.axios.put('/companies/current/frequencies/' + frequency.id, {is_global: frequency.is_global})
                    .then(res => {

                    })
                    .catch()

            },

            saveFrequency() {
                if (this.selectedFrequency.hasOwnProperty("id")) {
                    delete this.selectedFrequency.services;
                    this.axios
                        .patch("/frequencies/" + this.selectedFrequency.id, this.selectedFrequency)
                        .then(res => {
                            this.loadFrequencies(this.current_page);
                        })
                        .catch(err => {
                        });
                } else {
                    this.axios
                        .post("/companies/current/frequencies", this.selectedFrequency)
                        .then(res => {
                            this.loadFrequencies(this.current_page);
                        })
                        .catch(err => {
                        });
                }
            },

            frequencyDialogOpened() {
                this.$events.emitEvent("frequency:dialog:edit", [this.selectedFrequency]);
            },

            frequencyDialogClosed() {
                this.frequencyDialog = false;
                this.selectedFrequency = false;
                this.loadFrequencies(this.current_page);
            },
            toggleRecurring(val) {
                this.loading = true

                this.axios.patch('/company_settings/' + this.$auth.user().company.settings.id,
                    {
                        frequency: this.$auth.user().company.settings.frequency
                    })
                    .then(res => {
                        this.$helpers.successHandle('frequency settings updated')
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
        }
    };
</script>

<style lang="scss"></style>
