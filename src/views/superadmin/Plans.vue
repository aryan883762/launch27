<template>
    <el-container>
        <el-row class="full-width">
            <el-card class="apps-list-table" shadow="never">
                <el-row>
                    <el-col class="bg-white text-center">
                        <div class="pull-right  main-filters">

                            <el-button class="pull-right" type="primary" icon="el-icon-plus"
                                       size="mini" round @click="newPlan">New Plan
                            </el-button>

                            <el-select class="filter small pull-right" placeholder="Status"
                                       v-model="filter_status" @change="loadPlans">
                                <el-option label="All" value="all">All</el-option>
                                <el-option label="Active" value="true">Active</el-option>
                                <el-option label="Inactive" value="false">Inactive</el-option>

                            </el-select>

                        </div>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col>
                        <el-divider></el-divider>
                        <vcl-table v-if="loading"></vcl-table>
                        <el-table :data="plans" style="width: 100%" v-if="!loading">
                            <el-table-column label="Name" prop="name"></el-table-column>
                            <el-table-column label="Amount" prop="amount" min-width="50"></el-table-column>
                            <el-table-column label="Type" prop="type" min-width="50"></el-table-column>
                            <el-table-column label="Features Key" min-width="200">
                                <template slot-scope="scope">

                                    <el-popover
                                            ref="popover1"
                                            placement="right"
                                            title="Included in Plan"
                                            trigger="hover">
                                        <div v-for="item in scope.row.feature_keys" :key="item" style="margin-bottom: 5px;">
                                            <el-tag size="mini" type="primary">
                                                {{ item }}
                                            </el-tag>
                                        </div>
                                        <el-tag effect="dark" type="info" slot="reference">{{scope.row.feature_keys.length}} features</el-tag>
                                    </el-popover>
                                </template>
                            </el-table-column>
                            <el-table-column label="CTA Points" min-width="200">
                                <template slot-scope="scope">
                                    <el-popover
                                            ref="popover2"
                                            placement="right"
                                            title="CTA Points"
                                            trigger="hover">
                                        <div v-for="item in scope.row.list" :key="item" style="margin-bottom: 5px;">
                                            <el-tag size="mini" type="primary">
                                                {{ item }}
                                            </el-tag>
                                        </div>
                                        <el-tag effect="dark" type="default" slot="reference">{{scope.row.list.length}} items</el-tag>
                                    </el-popover>
                                </template>
                            </el-table-column>
                            <el-table-column label="Public" min-width="30">
                                <template slot-scope="scope">
                                    <el-tag :type="scope.row.public ? 'success' : 'danger'">
                                        {{ scope.row.public ? 'Yes' : 'No' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="Active" min-width="30">
                                <template slot-scope="scope">
                                    <el-tag :type="scope.row.active ? 'success' : 'danger'">
                                        {{ scope.row.active ? 'Yes' : 'No' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column align="right" min-width="30">
                                <template slot-scope="scope">
                                    <el-button type="text" size="small"
                                               @click="viewPlan(scope.row)">View
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-col>
                </el-row>
            </el-card>
        </el-row>
        <el-dialog :title="modal_title" :visible.sync="show_modal"
                   :close-on-press-escape="true" width="70%" top="0vh"
                   :fullscreen="false" append-to-body>
            <el-form :model="current_plan" :rules="plan_rules" v-loading="modal_loading"
                     class="bg-white padding-2x" label-position="top" ref="plansForm">
                <el-row :gutter="20">
                    <el-col :md="12" :sm="12" :xs="24">
                        <el-form-item prop="plan_id" label="Plan ID">
                            <el-input v-model="current_plan.plan_id" type="text"/>
                        </el-form-item>
                        <el-form-item prop="name" label="Name">
                            <el-input v-model="current_plan.name" type="text"/>
                        </el-form-item>
                        <el-form-item prop="description" label="Description">
                            <el-input v-model="current_plan.description" type="text"/>
                        </el-form-item>
                        <el-row>
                            <el-col :sm="12">
                                <el-form-item prop="amount" label="Amount">
                                    <el-input-number v-model="current_plan.amount" :min="0"/>
                                </el-form-item>
                            </el-col>
                            <el-col :sm="12">
                                <el-form-item prop="type" label="Type">
                                    <el-select v-model="current_plan.type" placeholder="select plan type">
                                        <el-option label="Old" value="old"></el-option>
                                        <el-option label="New" value="new"></el-option>
                                        <el-option label="All" value="all"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-form-item label="Add Tags">
                            <tags v-model="current_plan.tagIds"></tags>
                        </el-form-item>

                        <el-row>
                            <el-col :sm="12">
                                <el-form-item prop="active" label="Active">
                                    <el-switch
                                            style="display: block" v-model="current_plan.active"
                                            active-color="#13ce66" inactive-color="#ff4949"
                                            active-text="Active" inactive-text="Inactive">
                                    </el-switch>
                                </el-form-item>
                            </el-col>
                            <el-col :sm="12">
                                <el-form-item prop="public" label="Public">
                                    <el-switch
                                            style="display: block" v-model="current_plan.public"
                                            active-color="#13ce66" inactive-color="#ff4949"
                                            active-text="Public" inactive-text="Private">
                                    </el-switch>
                                </el-form-item>
                            </el-col>
                        </el-row>


                    </el-col>
                    <el-col :sm="12" :md="12" :xs="24">
                        <el-form-item prop="feature_keys" label="Features Key">
                            <el-select v-model="current_plan.feature_keys" multiple placeholder="Select">
                                <el-option
                                        v-for="item in plan_features"
                                        :key="item.key" :label="item.label" :value="item.key">
                                    {{ item.label }}
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Plan CTA Points" prop="list">
                            <el-tag :key="value" v-for="(value, index) in current_plan.list" closable
                                    :disable-transitions="false" @close="handleDescriptionClose(index)">
                                {{ value }}
                            </el-tag>
                            <el-input type="text" v-if="descriptionInputVisible"
                                      v-model="descriptionInputValue" ref="saveDescriptionInput"
                                      size="mini" @keyup.enter.native="handleDescriptionInputConfirm"
                                      @blur="handleDescriptionInputConfirm">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showDescriptionInput">+ New Description</el-button>
                        </el-form-item>
                        <el-row>
                            <el-col :sm="12">
                                <el-form-item prop="discount" label="Discount (%)">
                                    <el-input-number v-model="current_plan.discount" :min="0" :max="100"/>
                                </el-form-item>
                            </el-col>

                            <el-col :sm="12">
                                <el-form-item prop="paused_amount" label="Paused Amount">
                                    <el-input-number v-model="current_plan.paused_amount" :min="0"/>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :sm="12">
                                <el-form-item prop="additional_booking_cost" label="Additional Booking Cost">
                                    <el-input-number v-model="current_plan.additional_booking_cost" :min="0"/>
                                </el-form-item>
                            </el-col>
                            <el-col :sm="12">
                                <el-form-item prop="trial_days" label="Trial Days">
                                    <el-input-number v-model="current_plan.trial_days" :min="0"/>
                                </el-form-item>
                            </el-col>
                        </el-row>


                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer">
                <el-row>
                    <el-col class="text-center">
                        <el-button @click="show_modal = false" round>Close</el-button>
                        <el-button type="danger" @click="deletePlan(current_plan.id)" round v-if="current_plan.id">Delete</el-button>
                        <el-button type="primary" @click="savePlan" round>Save</el-button>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>
    </el-container>
</template>


<script>
    import {VclTable} from 'vue-content-loading';
    import Tags from "@/components/Tags";

    export default {
        components: {
            VclTable,
            Tags
        },
        data() {
            return {
                filter_status: '',
                loading: false,
                plans: [],
                plan_features: [],
                current_plan: {},
                show_modal: false,
                modal_title: '',
                modal_loading: false,
                descriptionInputVisible: false,
                descriptionInputValue: "",
                plan_rules: {
                    plan_id: [{message: "Plan ID is required", required: true, trigger: "blur"}],
                    name: [{message: "Name is required", required: true, trigger: "blur"}],
                    amount: [{message: "Amount is required", required: true, trigger: "blur"}],
                    discount: [{message: "Discount is required", required: true, trigger: "blur"}],
                    paused_amount: [{message: "Paused Amount is required", required: true, trigger: "blur"}],
                    active: [{message: "Active is required", required: true, trigger: "blur"}]
                }
            };
        },

        mounted() {
            this.loadPlans();
            this.loadPlanFeatures();
        },

        methods: {
            loadPlans() {
                this.loading = true;

                let whereQuery = {};
                if (this.filter_status !== '' && this.filter_status !== 'all') {
                    whereQuery.active = (this.filter_status === "true");
                }

                this.axios.get('/subscription_plans',
                    {
                        params: {
                            filter: {
                                where: whereQuery,
                                order: 'amount ASC'
                            }
                        }
                    })
                    .then(res => {
                        this.plans = res.data;
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            loadPlanFeatures() {
                this.axios.get('subscriptions/plans-features')
                    .then(res => {
                        this.plan_features = res.data;
                    });
            },
            viewPlan(plan) {
                this.modal_title = "Edit " + plan.name;
                this.current_plan = JSON.parse(JSON.stringify(plan));
                this.show_modal = true;
            },
            newPlan() {
                this.modal_title = "New Plan";
                this.current_plan = {
                    active: true,
                    public: true,
                    amount: 0,
                    discount: 0,
                    paused_amount: 0,
                    additional_booking_cost: 0,
                    list: [],
                    type: "all",
                    tagIds: [],
                    trial_days: 14
                };
                this.show_modal = true;
            },
            postData() {
                return {
                    plan_id: this.current_plan.plan_id,
                    name: this.current_plan.name,
                    amount: this.current_plan.amount,
                    discount: this.current_plan.discount,
                    paused_amount: this.current_plan.paused_amount,
                    additional_booking_cost: this.current_plan.additional_booking_cost,
                    list: this.current_plan.list,
                    type: this.current_plan.type,
                    feature_keys: this.current_plan.feature_keys,
                    active: this.current_plan.active,
                    public: this.current_plan.public,
                    tagIds: this.current_plan.tagIds,
                    trial_days: this.current_plan.trial_days
                };
            },
            savePlan() {
                this.$refs["plansForm"].validate(valid => {
                    if (valid) {
                        this.modal_loading = true;
                        if (this.current_plan.id) {
                            this.axios.patch("/subscription_plans/" + this.current_plan.id,
                                this.postData())
                                .then(res => {
                                    if (res.data) {
                                        this.$message.success("Plan Successfully Updated");
                                        this.loadPlans();
                                        this.current_plan = res.data;
                                    }
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(() => {
                                    this.modal_loading = false;
                                });
                        } else {
                            this.axios.post("/subscription_plans/", this.postData())
                                .then(res => {
                                    if (res.data) {
                                        this.$message.success("Plan Successfully Added");
                                        this.loadPlans();
                                        this.current_plan = res.data;
                                    }
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(() => {
                                    this.modal_loading = false;
                                });
                        }
                    } else {
                        return false;
                    }
                });
            },
            deletePlan(planId) {
                this.$confirm('Are sure you want to delete this plan?',
                    'Confirm Deletion')
                    .then(() => {
                        this.axios.delete("/subscription_plans/" + planId)
                            .then(res => {
                                this.current_plan = {};
                                this.show_modal = false;
                                this.loadPlans();
                            });
                    });
            },
            handleDescriptionClose(index) {
                this.current_plan.list.splice(index, 1);
            },
            showDescriptionInput() {
                this.descriptionInputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveDescriptionInput.$refs.input.focus();
                });
            },
            handleDescriptionInputConfirm() {
                var descriptionInputValue = this.descriptionInputValue;
                if (descriptionInputValue) {
                    this.current_plan.list.push(descriptionInputValue);
                }
                this.descriptionInputVisible = false;
                this.descriptionInputValue = "";
            }
        }
    }
</script>


<style lang="scss">
</style>
