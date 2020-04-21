<template>
    <div>


        <el-card :body-style="{display:'flex', 'justify-content':'space-between', width: '100%'}" class="flex-row"
                 shadow="never">
            <el-select @change="loadDiscountCodes()" class="filter" v-model="active_filter">
                <el-option :value="true" label="Active"></el-option>
                <el-option :value="false" label="Archived"></el-option>
            </el-select>
            <el-button @click="addNewDiscountCode()" icon="el-icon-plus" plain round size="mini" type="success">Create
                Discount Code
            </el-button>
        </el-card>

        <el-divider></el-divider>

        <el-table :data="discount_codes" v-loading="loading">
            <el-table-column label="Discount Code" prop="discount_code"></el-table-column>
            <el-table-column label="Discount Type" prop="discount_type">
                <template slot-scope="scope">
                    {{ scope.row.discount_type === "percent" ? "Percentage" : "Amount" }}
                </template>
            </el-table-column>
            <el-table-column label="Discount Value" prop="discount_value" align="center" width="120">
                <template slot-scope="scope">
                    {{ scope.row.discount_type === "amount" ? $currency + "" + scope.row.discount_value :
                    scope.row.discount_value + "%" }}
                </template>
            </el-table-column>
            <el-table-column label="Active Dates" align="center" width="200">
                <template slot-scope="scope">
                    {{ !scope.row.has_end_date ? $moment(scope.row.start_date).format($date_format) :
                    $moment(scope.row.start_date).format($date_format) + " - " + $moment(scope.row.end_date).format($date_format)
                    }}
                </template>
            </el-table-column>
            <el-table-column label="Usage Limit" prop="total_usage_limit"></el-table-column>
            <el-table-column label="Total Usage">
                <template slot-scope="scope">
                    <el-link @click="viewRedeemed(scope.row.id)" type="danger" v-if="scope.row.charges.length > 0">
                        {{scope.row.charges.length}} - View List
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column label="Status" prop="active">
                <template slot-scope="scope">

                    <el-switch @change="activateCode($event, scope.row)" active-color="green"
                               v-model="scope.row.active">

                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="200">
                <template slot-scope="scope">
                    <el-button-group style="">
                        <el-link @click="triggerAction('edit', scope.row)" size="mini" type="primary">Edit</el-link>
                        <el-link @click="triggerAction('duplicate', scope.row)" size="mini">Duplicate</el-link>
                        <el-link @click="activateCode(false, scope.row)" v-if="scope.row.active">Archive</el-link>
                        <el-link @click="activateCode(true, scope.row)" v-if="!scope.row.active">Activate</el-link>
                        <view-changes :id="scope.row.id" model-name="discount_code"></view-changes>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>

        <el-col class="pagination-footer">
            <div class="cct">
                <el-pagination
                        :current-page.sync="current_page"
                        :page-size="page_size"
                        :total="total_records"
                        @current-change="loadDiscountCodes"
                        background
                        layout="total, prev, pager, next">
                </el-pagination>
            </div>

        </el-col>
    </div>
</template>

<script>
    import ViewChanges from "../../../components/ViewChanges";

    export default {
        components: {ViewChanges},
        data: () => {
            return {
                discount_codes: [],
                loading: true,
                active_filter: true,
                total_records: 0,
                current_page: 1,
                page_size: 0
            };
        },
        watch: {},
        mounted() {
            this.loadDiscountCodes(1);
        },

        methods: {
            addNewDiscountCode() {
                this.$router.push({name: 'dashboard_settings_promotions_create'})
            },
            activateCode(status, code) {

                let msg = 'Are you sure you want to activate this service?';
                let status_msg = 'activated';
                if (!status) {
                    msg = 'Are you sure you want to archive this service?';
                    status_msg = 'archived';
                }

                this.$confirm(msg,
                    {
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    })
                    .then(() => {

                        this.axios
                            .patch("/discount_codes/" + code.id, {active: status})
                            .then(res => {
                                this.loadDiscountCodes(this.current_page);
                            })
                            .catch(err => {
                            })
                            .then(() => {
                                this.loading = false;
                            });

                    })
            },
            triggerAction(action, code) {
                switch (action) {
                    case "edit":
                        this.$router.push({
                            name: "dashboard_settings_promotions_edit",
                            params: {id: code.id}
                        })
                        break;

                    case "duplicate":
                        //first save as duplicate
                        //delete ID and post to create a duplicate and redirect for editting.
                        this.loading = true;
                        delete code.id;
                        code.discount_code = this.randomCode();
                        this.axios
                            .post("/companies/current/discount_codes", code)
                            .then(res => {
                                this.$events.emitEvent("edit-code", [res.data]);
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err.body.title);
                            })
                            .then(() => {
                                this.loading = false;
                            });
                        break;

                    case "delete":
                        this.loading = true;
                        this.axios
                            .delete("/discount_codes/" + code.id)
                            .then(res => {
                                this.loadDiscountCodes(this.current_page);
                            })
                            .catch()
                            .then(() => {
                                this.loading = false;
                            });
                        break;
                }
            },
            randomCode() {
                var randomstring = require("randomstring");
                return randomstring.generate(7);
            },
            viewRedeemed(id) {
                this.$router.push({
                    name: "dashboard_settings_promotions_redeem", params: {
                        id: id
                    }
                })
            },
            loadDiscountCodes() {
                this.loading = true;
                this.axios
                    .get("/companies/current/discount_codes", {
                        params: {
                            page: this.current_page,
                            filter: {
                                where: {
                                    active: this.active_filter
                                },
                                include: [
                                    {
                                        relation: "charges",
                                        scope: {
                                            fields: []
                                        }
                                    }
                                ]
                            }
                        }
                    })
                    .then(res => {
                        this.discount_codes = res.data.data;
                        this.total_records = res.data.meta.totalItemCount
                        this.page_size = res.data.meta.itemsPerPage
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false;
                    });
            }
        }
    };
</script>
