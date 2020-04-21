<template>
    <el-container>
        <el-row class="full-width">
            <el-card class="apps-list-table" shadow="never">
                <el-row>
                    <el-col class="bg-white text-center">
                        <div class="pull-left main-filters">
                            <el-date-picker
                                    end-placeholder="End date"
                                    range-separator="to"
                                    size="small"
                                    start-placeholder="Start date"
                                    type="date_range"
                                    v-model="date_range"
                                    :default-time="['00:00:00', '23:59:59']"
                                    @change="filterChanged"
                            />
                        </div>
                        <div class="pull-left main-filters">
                            <el-input
                                    size="small"
                                    v-model="search"
                                    placeholder="Search"
                                    class="search round small"
                                    @change="filterChanged"
                            />
                        </div>


                        <el-button
                                class="pull-right m-l-10"
                                type="info"
                                icon="el-icon-setting"
                                size="small"
                                round
                                @click="show_options = true"
                        >Options
                        </el-button>

                        <el-button
                                class="pull-right m-l-10"
                                type="success"
                                icon="el-icon-refresh"
                                size="small"
                                round
                                @click="openBatchModal"
                        >
                            Selected Options
                            <b>({{multiple_selection.length}})</b>
                        </el-button>


                        <el-button
                                class="pull-right m-l-10"
                                type="danger"
                                icon="el-icon-delete"
                                size="small"
                                round
                                @click="deleteCompany('selected')">
                            Delete Selected
                            <b>({{multiple_selection.length}})</b>
                        </el-button>

                        <el-button type="danger" round size="small" @click="migrateChecklists">
                            Migrate Checklists
                        </el-button>

                        <div class="pull-right main-filters">
                            <div>
                                <el-radio-group v-model="region_type" size="small" @change="filterChanged">
                                    <el-radio-button label="all">All</el-radio-button>
                                    <el-radio-button label="us">United States</el-radio-button>
                                    <el-radio-button label="eu">Europe</el-radio-button>
                                </el-radio-group>
                            </div>
                        </div>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col>
                        <el-divider></el-divider>
                        <!-- <vcl-table v-if="loading"></vcl-table> -->
                        <el-table
                                :default-sort="sort"
                                @sort-change="sortChanged"
                                :data="companies"
                                style="width: 100%"
                                :empty-text="loading ? 'Loading...' : ''"
                                ref="multipleTable"
                                @selection-change="handleSelectionChange"
                                row-key="id"
                        >
                            <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
                            <el-table-column label="ID" width="60" prop="oldVersionId"></el-table-column>
                            <el-table-column label="Business Name" prop="business_name"></el-table-column>
                            <el-table-column label="Subdomain" prop="subdomain"></el-table-column>
                            <el-table-column label="Country" prop="country.name"></el-table-column>
                            <el-table-column label="Complete" prop="migrated" sortable="custom">
                                <template slot-scope="scope">
                                    <el-tag
                                            :type="scope.row.migrated ? 'success' : 'danger'"
                                    >{{ scope.row.migrated ? 'Yes' : 'No' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="CHK Mig.." prop="checklist_migrated" sortable="custom">
                                <template slot-scope="scope">
                                    <el-tag
                                            :type="scope.row.checklist_migrated ? 'success' : 'danger'">{{ scope.row.checklist_migrated ? 'Yes' : 'No' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="Tokens" prop="token_migrated" sortable="custom">
                                <template slot-scope="scope">
                                    <el-tag
                                            :type="scope.row.token_migrated ? 'success' : (scope.row.country && scope.row.country.isoCode  === 'US' ? 'danger' : 'info')"
                                    >{{ scope.row.token_migrated ? 'Yes' : 'No' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="Data Migrated" prop="data_migrated" sortable="custom">
                                <template slot-scope="scope">
                                    <el-tag
                                            :type="scope.row.data_migrated ? 'success' : 'danger'"
                                    >{{ scope.row.data_migrated ? 'Yes' : 'No' }}
                                    </el-tag>
                                    <el-tag :type="migrationPercent(scope.row.data_migrations) == 100 ? 'success' : ''">{{ migrationPercent(scope.row.data_migrations) }} %</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="Customers" prop="old_version_customers" sortable="custom"></el-table-column>
                            <el-table-column label="Bookings" prop="old_version_bookings" sortable="custom"></el-table-column>
                            <el-table-column label="Last Run">
                                <template
                                        slot-scope="scope"
                                >{{ migrationLastRunDate(scope.row.data_migrations) }}
                                </template>
                            </el-table-column>
                            <el-table-column align="right">
                                <template slot-scope="scope">
                                    <!-- <el-button
                                      type="text"
                                      size="small"
                                      @click="deleteCompany('one', scope.row)"
                                    >Delete</el-button> -->
                                    <el-button type="text" size="small" @click="impersonate(scope.row.accountId)" v-if="scope.row.data_migrated && scope.row.accountId">Impersonate</el-button>
                                    <el-button type="text" size="small" @click="viewCompany(scope.row.id)">View</el-button>
                                    <el-button type="text" size="small" @click="openBusinessTab(scope.row.id)">Tab</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-col>
                </el-row>

                <el-row class="stats-row" :gutter="0">
                    <el-col :sm="4" :md="4" :xs="12" class="first">
                        <span class="stats-number _first">{{ companies_stats.count }}</span>
                        <label>
                            Total Companies
                            <br/>
                        </label>
                    </el-col>

                    <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
                        <span class="stats-number _fourth">{{ companies_stats.migrated }}</span>
                        <label>
                            Migrated
                            <br/>
                        </label>
                    </el-col>

                    <el-col :sm="4" :md="4" :xs="12" class="pull-right fourth">
                        <span class="stats-number _fourth">{{ companies_stats.data_migrated }}</span>
                        <label>
                            Data Migrated
                            <br/>
                        </label>
                    </el-col>
                </el-row>
            </el-card>
        </el-row>
        <el-col class="pagination-footer">
            <div class="cct">
                <el-pagination
                        :current-page.sync="current_page"
                        :page-size="page_size"
                        :total="total_records"
                        @current-change="loadCompanies"
                        background
                        layout="total, prev, pager, next"
                ></el-pagination>
            </div>
        </el-col>
        <el-row>
            <el-dialog
                    title="Import From V1"
                    :visible.sync="show_missing_modal"
                    :fullscreen="false"
                    :close-on-press-escape="false"
                    :close-on-click-modal="false"
                    :show-close="false"
                    top="0"
                    width="80%"
                    append-to-body
            >
                <el-row>
                    <el-col>
                        <h2>Checking Version 1 Companies</h2>
                    </el-col>
                </el-row>
                <div v-loading="loading_missing">
                    <el-row>
                        <el-col>
                            <label>Total V1 Companies:</label>
                            <span>{{ missing_data.total }}</span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>
                            <label>Companies Not Added:</label>
                            <span>{{ missing_data.missing }}</span>
                            <el-button
                                    type="text"
                                    size="small"
                                    @click="missing_list = true"
                                    v-if="!missing_list"
                            >View List
                            </el-button>
                            <el-button type="text" size="small" @click="missing_list = false" v-else>Hide List</el-button>
                        </el-col>
                    </el-row>
                    <el-row v-if="missing_list">
                        <el-col>
                            <ul>
                                <li
                                        :key="comp.oldVersionId"
                                        v-for="comp in missing_data.list"
                                >ID: {{comp.oldVersionId}}, Country: {{comp.country.name}}, Name: {{comp.business_name}}, subdomain: {{comp.subdomain}}
                                </li>
                            </ul>
                        </el-col>
                    </el-row>
                    <template v-if="import_data_complete">
                        <el-row>
                            <el-col>
                                <h2>Checking Version 1 Companies</h2>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-row>
                                <el-col>
                                    <label>Total:</label>
                                    <span>{{ import_data.total }}</span>
                                </el-col>
                            </el-row>
                            <el-col>
                                <label>Success:</label>
                                <span>{{ import_data.success }}</span>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col>
                                <label>failed:</label>
                                <span>{{ import_data.failed }}</span>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col>
                                <label>Errors:</label>
                                <span>{{ import_data.errors.length }}</span>
                                <el-button
                                        type="text"
                                        size="small"
                                        @click="error_list = true"
                                        v-if="!error_list"
                                >View List
                                </el-button>
                                <el-button type="text" size="small" @click="error_list = false" v-else>Hide List</el-button>
                            </el-col>
                        </el-row>
                        <el-row v-if="error_list">
                            <el-col>
                                <ul>
                                    <li :key="index" v-for="(message, index) in import_data.errors">{{message}}</li>
                                </ul>
                            </el-col>
                        </el-row>
                    </template>
                </div>
                <el-row>
                    <el-col class="text-center">
                        <el-button @click="show_missing_modal = false" round>Close</el-button>
                        <el-button
                                type="info"
                                @click="updateCompanyStats"
                                round
                        >Update stats
                        </el-button>
                        <el-button
                                type="primary"
                                @click="ImportMissingCompanies"
                                round
                                :disabled="loading_missing && missing_data.missing > 0"
                        >Import Company info
                        </el-button>
                    </el-col>
                </el-row>
            </el-dialog>
            <el-dialog
                    :title="'Batch Migrate (' + multiple_selection.length + ')'"
                    :visible.sync="show_batch_modal"
                    :fullscreen="false"
                    :close-on-press-escape="false"
                    :close-on-click-modal="false"
                    :show-close="false"
                    top="0"
                    width="80%"
                    append-to-body
            >
                <el-row>
                    <el-col>
                        <p
                                class="text-center"
                        >The following selected businesses data will be migrated. Please don't refresh the page until the process is done.</p>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col class="text-center">
                        <el-button size="small" @click="refreshMigration" round>Migration in progress click to check status</el-button>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :md="12">
                        <ul>
                            <li
                                    :key="comp.id"
                                    v-for="comp in multiple_selection"
                            >ID: {{comp.oldVersionId}}, Country: {{comp.country.name}}, Name: {{comp.business_name}}
                            </li>
                        </ul>
                    </el-col>
                    <!-- <el-col :md="12" v-if="!migration_running">
                      <ul>
                        <li
                          :key="result.companyId"
                          v-for="result in batch_migration_result"
                        >
                          {{ migrationResultSummary(result.migrations) }}
                          <el-button type="text" size="small" @click="openBusinessTab(result.companyId)">View</el-button>
                        </li>
                      </ul>
                    </el-col> -->
                    <el-col :md="12">
                        <ul>
                            <li
                                    :key="result.companyId"
                                    v-for="result in batch_migration_status"
                            >
                                <el-tag
                                        :type="result.dataDone ? 'success' : 'danger'"
                                >{{ result.dataDone ? 'Yes' : 'No' }}
                                </el-tag>
                                {{ migrationResultSummary(result.migrations) }}
                                <el-button type="text" size="small" @click="openBusinessTab(result.companyId)">View</el-button>
                            </li>
                        </ul>
                    </el-col>
                </el-row>
                <el-row v-if="!migration_running">
                    <el-col class="text-center">
                        <el-button :disabled="migration_running" @click="show_batch_modal = false" round>Close</el-button>                        
                        <el-button
                                type="danger"
                                :disabled="multiple_selection.length < 1 || migration_running"
                                @click="migrateStepUndoAll"
                                round
                        >Delete Migrated Data
                        </el-button>
                        <el-button
                                type="primary"
                                :disabled="multiple_selection.length < 1 || migration_running"
                                @click="companyMigrationComplete()"
                                round
                        >(4) Complete Migration
                        </el-button>
                        <el-button
                                type="warning"
                                :disabled="multiple_selection.length < 1 || migration_running"
                                @click="companyMigrationFinalCleanup()"
                                round
                        >(5) Final cleanup
                        </el-button>
                        <el-button
                                type="success"
                                :disabled="multiple_selection.length < 1 || migration_running"
                                @click="companyMigrationFinal"
                                round
                        >(3) Booking Re-migrate
                        </el-button>
                        <el-button
                                type="warning"
                                :disabled="multiple_selection.length < 1 || migration_running"
                                @click="cleanupMigration()"
                                round
                        >(2) Cleanup Migrated Data
                        </el-button>
                        <el-button
                                type="success"
                                :disabled="multiple_selection.length < 1 || migration_running"
                                @click="migrateStepAll"
                                round
                        >(1) Migrate All Selected Business
                        </el-button>
                    </el-col>
                </el-row>
            </el-dialog>
        </el-row>
        <el-row>
            <el-dialog
                    title="Options"
                    :visible.sync="show_options"
                    :fullscreen="false"
                    :close-on-press-escape="true"
                    :close-on-click-modal="true"
                    :show-close="true"
                    top="0"
                    width="60%"
                    append-to-body
            >
                <el-row>
                    <el-col :md="6" class="text-center">
                        <el-button @click="show_options = false" round>Close</el-button>
                    </el-col>
                    <el-col :md="6" class="text-center">
                        <el-button
                                type="danger"
                                icon="el-icon-delete"
                                round
                                :disabled="migration_running"
                                @click="deleteCompany('all')"
                        >Delete all
                        </el-button>

                    </el-col>
                    <el-col :md="6" class="text-center">
                        <el-button
                                type="warning"
                                icon="el-icon-refresh"
                                round
                                :disabled="migration_running"
                                @click="cleanupMigration('all')"
                        >Cleanup all
                        </el-button>
                    </el-col>
                    <el-col :md="6" class="text-center">
                        <el-button
                                type="primary"
                                icon="el-icon-plus"
                                round
                                :disabled="migration_running"
                                @click="checkMissingCompanies"
                        >Import(V1)
                        </el-button>
                    </el-col>
                </el-row>
            </el-dialog>
        </el-row>
    </el-container>
</template>


<script>
    import {VclTable} from "vue-content-loading";
    import ImpersonateMixin from '@/mixins/ImpersonateMixin';

    export default {
        components: {
            VclTable
        },

        mixins: [ImpersonateMixin],

        data() {
            return {
                date_range: "",
                filter_country: "",
                region_type: "all",
                search: "",
                loading: false,
                companies: [],
                companies_stats: {
                    count: 0,
                    migrated: 0,
                    data_migrated: 0
                },
                total_records: 0,
                page_size: 0,
                current_page: 1,
                load_stats: true,
                show_missing_modal: false,
                loading_missing: false,
                missing_data: {total: 0, missing: 0, list: []},
                import_data: {
                    total: 0,
                    success: 0,
                    failed: 0,
                    errors: []
                },
                import_data_complete: false,
                missing_list: false,
                error_list: false,
                multiple_selection: [],
                show_batch_modal: false,
                migration_running: false,
                batch_migration_result: [],
                sort: {prop: 'data_migrated', order: 'DESC'},
                batch_migration_status: [],
                show_options: false
            };
        },

        mounted() {
            this.loadCompanies();
        },

        methods: {
            filterChanged() {
                this.current_page = 1;
                // only loading stats if filter has changed
                this.load_stats = true;
                this.loadCompanies();
            },
            loadCompanies() {
                this.loading = true;
                this.companies = [];

                let whereQuery = {version: "v1"};
                let orderQuery = '';

                if (this.date_range && this.date_range[0] && this.date_range[1]) {
                    whereQuery.founded_at = {between: this.date_range};
                }
                if (this.search !== "") {
                    let pattern = {like: ".*" + this.search + ".*", options: "i"};
                    let idArray = this.search.split(',').map(i => parseInt(i));
                    whereQuery.or = [{business_name: pattern}, {subdomain: pattern}, {oldVersionId: {inq: idArray}}];
                }
                if (this.filter_country !== "" && this.filter_country !== "all") {
                    whereQuery["country.name"] = this.filter_country;
                }
                if (this.region_type === "us") {
                    whereQuery["country.isoCode"] = "US";
                } else if (this.region_type === "eu") {
                    whereQuery["country.continent"] = "EU";
                }

                if (this.sort.prop && this.sort.order) {
                    orderQuery = this.sort.prop;
                    if (this.sort.order === 'ascending') {
                        orderQuery += ' ASC';
                    } else {
                        orderQuery += ' DESC';
                    }
                }
                this.axios
                    .get("/companies", {
                        params: {
                            page: this.current_page,
                            filter: {
                                where: whereQuery,
                                order: orderQuery,
                                include: 'data_migrations'
                            }
                        }
                    })
                    .then(res => {
                        if (res.data) {
                            this.companies = res.data.data;
                            if (res.data.meta) {
                                this.page_size = res.data.meta.itemsPerPage;
                                this.total_records = res.data.meta.totalItemCount;
                            }
                        }
                        this.getStats(whereQuery);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            getStats(whereQuery) {
                if (this.load_stats) {
                    this.axios
                        .get("/companies/list-statistics", {
                            params: {
                                where: whereQuery
                            }
                        })
                        .then(res => {
                            this.companies_stats = res.data;
                            this.load_stats = false;
                        });
                }
            },
            sortChanged({column, prop, order}) {
                this.sort = {prop: prop, order: order};
                this.current_page = 1;
                this.loadCompanies();
            },
            viewCompany(id) {
                this.$router.push({
                    name: "superadmin_companies_data_migration",
                    params: {id: id}
                });
            },
            checkMissingCompanies() {
                this.show_missing_modal = true;
                this.loading_missing = true;
                this.axios
                    .get("/data_migrations/missing-companies")
                    .then(res => {
                        this.missing_data = res.data;
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
                    .finally(() => {
                        this.loading_missing = false;
                    });
            },
            ImportMissingCompanies() {
                this.loading_missing = true;
                this.axios
                    .get("/data_migrations/import-v1-companies")
                    .then(res => {
                        this.import_data = res.data;
                        this.import_data_complete = true;
                        this.filterChanged();
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
                    .finally(() => {
                        this.loading_missing = false;
                    });
            },
            deleteCompany(type, company) {
                let message = "";
                let ids = [];

                if (type === "selected") {
                    ids = this.multiple_selection.map(c => c.id);
                    message =
                        "Are sure you want to completely delete selected businesses with incomplete migration?";
                } else if (type === "all") {
                    ids = [];
                    message =
                        "Are sure you want to completely delete all imported businesses with incomplete migration?";
                } else if (company) {
                    message =
                        "Are sure you want to delete this company " +
                        company.business_name +
                        " ?";
                    ids = [company.id];
                }

                this.$confirm(message, "Confirm Deletion").then(() => {
                    this.loading = true;
                    this.companies = [];
                    this.axios
                        .post("/data_migrations/delete-v1-company", {
                            ids: ids,
                            type: type
                        })
                        .then(res => {
                            this.$message.success("Company deleted");
                            this.$refs.multipleTable.clearSelection();
                            this.filterChanged();
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this);
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                });
            },
            handleSelectionChange(val) {
                this.multiple_selection = val;
            },
            migrateStepAll() {
                this.batch_migration_result = [];
                this.migration_running = true;
                this.axios
                    .post("/data_migrations/migrate-company-all", {
                        ids: this.multiple_selection.map(c => c.id)
                    })
                    .then(res => {
                        this.batch_migration_result = res.data;
                        this.refreshMigration();
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
                    .finally(() => {
                        this.migration_running = false;
                        this.loadCompanies();
                    });
            },
            migrateStepUndoAll() {
                this.$confirm(
                    "Are sure you want to delete selected business migrated data?",
                    "Confirm Deletion"
                ).then(() => {
                    this.batch_migration_result = [];
                    this.migration_running = true;
                    this.axios
                        .get("/data_migrations/migrate-company-all-undo", {
                            params: {
                                ids: this.multiple_selection.map(c => c.id)
                            }
                        })
                        .then(res => {
                            this.batch_migration_result = [];
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this);
                        })
                        .finally(() => {
                            this.migration_running = false;
                            this.loadCompanies();
                        });
                });
            },
            updateCompanyStats() {
                this.loading_missing = true;
                this.axios
                    .get("/data_migrations/update-all-company-stats")
                    .then(res => {
                        this.filterChanged();
                    })
                    .finally(() => {
                        this.loading_missing = false;
                    });
            },
            migrationResultSummary(migrations) {
                let stepsTotal = 13;
                let stepsCount = migrations.filter((m) => m.status === "done").length;
                let recordsTotal = migrations.reduce((total, migration) => {
                    return total + migration.records;
                }, 0);
                let recordsCount = migrations.reduce((total, migration) => {
                    return total + migration.migrated_records;
                }, 0);
                let errorsCount = migrations.reduce((total, migration) => {
                    return total + migration.error_info.list.length;
                }, 0);

                let percent = Math.round(stepsCount / stepsTotal * 100);

                let summary =
                    // stepsCount +
                    // "/" +
                    // stepsTotal +
                    // " steps, " +
                    percent +
                    "%, " +
                    recordsCount +
                    "/" +
                    recordsTotal +
                    " records and process, " +
                    errorsCount +
                    " errors";
                return summary;
            },
            openBatchModal() {
                this.show_batch_modal = true;
                this.batch_migration_result = [];
                this.batch_migration_status = [];
            },
            refreshMigration() {
                this.batch_migration_status = [];
                this.axios
                    .get("/data_migrations/migrate-company-status-check", {
                        params: {
                            ids: this.multiple_selection.map(c => c.id)
                        }
                    })
                    .then(res => {
                        this.batch_migration_status = res.data;
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    });
            },
            cleanupMigration(type) {
                this.migration_running = true;
                this.axios
                    .get("/data_migrations/migrate-company-clean", {
                        params: {
                            ids: this.multiple_selection.map(c => c.id),
                            type: type
                        }
                    })
                    .then(res => {
                        if (type === 'all') {
                            this.show_options = false;
                        } else {
                            this.refreshMigration();
                        }
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
                    .finally(() => {
                        this.migration_running = false;
                    });
            },
            openBusinessTab(id) {
                let url = window.location.origin + this.$router.resolve({name: 'superadmin_companies_data_migration', params: {id: id}}).href;
                window.open(url, "_blank");
            },
            migrationPercent(migrations) {
                return migrations && migrations.length > 1 ? Math.round((migrations.length - 1) / 13 * 100) : 0;
            },
            migrationLastRunDate(migrations) {
                let date = " - ";
                if (migrations.length > 1) {
                    date = migrations[1].updated_at;
                    for (let migration of migrations) {
                        if (migration.updated_at > date) {
                            date = migration.updated_at;
                        }
                    }
                    return this.$moment(date).format(this.$date_format + ' ' + this.$time_format);
                }
                return date;
            },
            migrateChecklists() {
                this.axios.get('/checklists/import-all')
                    .then()
                    .catch()
                    .finally()
            },
            companyMigrationComplete() {
                this.$prompt('PLEASE INPUT THE NUMBER OF SELECTED BUSINESSES', 
                 'PERMANENTLY COMPLETE MIGRATION?', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    inputValidator: (val)=> parseInt(val) === this.multiple_selection.length,
                    inputErrorMessage: 'Invalid Number'
                    }).then(({ value }) => {
                    this.$message({
                        type: 'success',
                        message: 'Correct number'
                    });
                    this.migration_running = true;
                    this.axios
                        .get("/data_migrations/migrate-company-complete", {
                            params: {
                                ids: this.multiple_selection.map(c => c.id)
                            }
                        })
                        .then(res => {
                                this.show_batch_modal = false;
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this);
                        })
                        .finally(() => {
                            this.migration_running = false;
                        });
                    });
            },
            companyMigrationFinal(){
                this.$confirm(
                    "Are sure you want to Re-migrate selected business Bookings?",
                    "Confirm Re-migrate"
                ).then(() => {
                    this.migration_running = true;
                    this.axios
                        .get("/data_migrations/migrate-final-import", {
                            params: {
                                ids: this.multiple_selection.map(c => c.id)
                            }
                        })
                        .then(res => {
                            this.refreshMigration();
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this);
                        })
                        .finally(() => {
                            this.migration_running = false;
                        });
                });
            },
            companyMigrationFinalCleanup(){
                this.$confirm(
                    "Are sure you want to cleanup selected business Bookings?",
                    "Confirm Ceanup"
                ).then(() => {
                    this.migration_running = true;
                    this.axios
                        .get("/data_migrations/migrate-final-cleanup", {
                            params: {
                                ids: this.multiple_selection.map(c => c.id)
                            }
                        })
                        .then(res => {
                                this.show_batch_modal = false;
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this);
                        })
                        .finally(() => {
                            this.migration_running = false;
                        });
                });
            }
        }
    };
</script>


<style lang="scss">
    .m-l-10 {
        margin-left: 10px !important;
        margin-top: 2px !important;
    }
</style>
