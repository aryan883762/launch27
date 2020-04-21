<template>
    <el-row :gutter="20">
        <el-col :sm="24">

            <el-card :body-style="{display:'flex', 'justify-content':'space-between', width: '100%'}" class="flex-row"
                     shadow="never" style="margin-bottom: 5px;">
                <el-select @change="getCategories()" class="filter small" v-model="filter_active">
                    <el-option :value="true" label="Active"></el-option>
                    <el-option :value="false" label="Archived"></el-option>
                </el-select>
                <el-button @click="addCategory()" icon="el-icon-plus" plain round size="mini" type="success">Add New
                    Service Category
                </el-button>
            </el-card>


            <el-table :data="categories" v-loading="loading">
                <el-table-column label="Category" prop="name"></el-table-column>
                <el-table-column align="center" label="Services">
                    <template slot-scope="scope">
                        {{scope.row.services.length}}
                    </template>
                </el-table-column>

                <el-table-column>
                    <template slot-scope="scope">
                        <el-button-group class="table-action-btns">
                            <el-link @click="addCategory(true, scope.row)" size="mini" style="margin-right: 0">Edit
                            </el-link>
                            <el-divider direction="vertical"></el-divider>
                            <el-link @click="archiveCategory(scope.row)" size="mini" style="margin-right: 0"
                                     v-if="scope.row.active"> Archive
                            </el-link>
                            <el-link @click="archiveCategory(scope.row)" size="mini" style="margin-right: 0"
                                     v-if="!scope.row.active"> Activate
                            </el-link>
                            <el-divider direction="vertical"></el-divider>
                            <view-changes :id="scope.row.id"></view-changes>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>

        </el-col>


        <el-dialog :append-to-body="true" :modal="true" :modal-append-to-body="false" :visible.sync="dialog"
                   title="Add Category" width="30%" @close="clearFormValidation">
            <div class="modal-body">
                <el-form :model="model" :rules="rules" label-position="top" ref="categoryFrm">
                    <el-form-item label="Category Name" prop="name">
                        <el-input v-model="model.name"></el-input>
                    </el-form-item>

                    <el-form-item label="Services">
                        <el-select filterable multiple v-model="model.serviceIds">
                            <el-option  v-show="service.active" :key="service.id" :label="service.name"
                                       :value="service.id" v-for="service in services"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>

            <div slot="footer">
                <el-button @click="dialog = false" round size="small">Cancel</el-button>
                <el-button @click="saveCategory" round size="small" type="primary">Save Category</el-button>
            </div>
        </el-dialog>

    </el-row>
</template>


<script>
    import ViewChanges from "../../../components/ViewChanges";

    export default {
        components: {ViewChanges},
        data() {
            return {
                categories: [],
                loading: false,
                dialog: false,
                model: {
                    name: '',
                    serviceIds: [],
                    oldServiceIds: []
                },
                services: [],
                rules: {
                    name: [
                        {
                            required: true,
                            message: "Category name is required",
                            trigger: "blur"
                        }
                    ]
                },
                filter_active: true
            }
        },

        mounted() {
            this.getCategories()
        },

        beforeMount() {
            //pre-load
            if (this.$storage.getItem('categories_filter')) {
                this.filter_active = (this.$storage.getItem('categories_filter') === "true")
            }

        },
        beforeDestroy() {
            //set fitlers to storage
            this.$storage.setItem('categories_filter', this.filter_active)
        },

        methods: {
            reset() {
                this.model = {
                    name: '',
                    serviceIds: [],
                    oldServiceIds: []
                }
                this.clearFormValidation();
            },

            archiveCategory(category) {

                let msg = 'Are you sure you want to activate this service category?';
                let status_msg = 'activated';
                if (category.active) {
                    msg = 'Are you sure you want to archive this service category?';
                    status_msg = 'archived';
                }


                this.$confirm(msg, {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then(() => {
                    this.axios.patch('/service_categories/' + category.id, {
                        active: !category.active
                    })
                        .then(res => {
                            this.$helpers.successHandle("Service category successfully " + status_msg);
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        })
                        .then(() => {
                            this.getCategories()
                        })
                })

            },
            addCategory(edit, category) {

                this.axios.get('/companies/current/services',
                    {
                        params: {
                            filter: {
                                where: {active: {inq: [true, false]}}
                            }
                        }
                    })
                    .then(res => {
                        this.services = res.data
                        if (edit) {


                            this.model = {
                                id: category.id,
                                name: category.name,
                                active: category.active,
                                serviceIds: [],
                                oldServiceIds: []
                            }

                            for (let x = 0; x < category.services.length; x++) {
                                this.model.serviceIds.push(category.services[x].id)
                                this.model.oldServiceIds.push(category.services[x].id)
                            }

                        } else {
                            this.reset()
                        }

                        this.dialog = true


                    })
                    .catch(err => {

                        this.$helpers.errorHandle(err, this)

                    })
                    .finally(() => {
                        this.dialog = true
                    })
            },

            getCategories() {
                this.loading = true
                this.axios.get('/companies/current/serviceCategories', {
                    params: {
                        filter: {
                            include: "services",
                            where: {active: this.filter_active}
                        }
                    }
                })
                    .then(res => {
                        this.categories = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },

            saveCategory() {
                this.$refs.categoryFrm.validate((valid) => {
                    if (valid) {
                        if (this.model.id) {
                            //edit

                            //things get elements that are in old ids but not in the new arra.
                            this.model.unlinkServiceIds = this.model.oldServiceIds.filter(x => !this.model.serviceIds.includes(x));

                            this.axios.put('/service_categories/' + this.model.id, this.model)
                                .then(res => {
                                    this.$helpers.successHandle('Category updated', this)
                                    this.dialog = false
                                    this.reset()
                                    this.getCategories()
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(() => {
                                })
                        } else {
                            //post and create
                            this.axios.post('/companies/current/serviceCategories', this.model)
                                .then(res => {
                                    this.$helpers.successHandle('Category updated', this)
                                    this.dialog = false
                                    this.reset()
                                    this.getCategories()
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(() => {
                                })
                        }
                    }
                })
            },

            clearFormValidation() {                
                this.$refs["categoryFrm"].clearValidate();
            }

        }
    }
</script>
