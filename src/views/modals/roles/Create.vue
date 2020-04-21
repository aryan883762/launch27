<template>
    <div>
        <el-row :gutter="0">
            <el-col>
                <el-card style="margin-bottom: 5px;">
                    <el-row>
                        <el-col>
                            <el-button @click="resetForm" class="pull-right" plain round size="small" type="success">Add new role</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>


            <el-col>
                <el-row :gutter="20" style="margin:0px;">

                    <el-col :md="16" :sm="16" class="bg-white " >
                        <el-form :model="form" :rules="rules" class="padding-2x" label-position="top" ref="role_form">
                            <el-form-item  prop="name" style="font-weight : 600;font-size : 16px;">
                                <template slot="label">
                                    <el-tooltip placement="top" effect="dark">
                                        <div slot="content">
                                            Create a unique role by adding a name, <br/>
                                            choosing permissions below and saving it.
                                        </div><span>Name of role <i class="el-icon-info"></i></span>
                                    </el-tooltip>
                                </template>
                                <el-input placeholder="name" style="width : 50%;" v-model="form.name"></el-input>
                            </el-form-item>

                            <el-form-item label="Give access to" style="font-weight : 600;font-size : 16px;" v-loading="loading">
                                <el-row>
                                    <el-col :key="permissionIndex" :sm="12" class="permissions-checkbox-group" v-for="(permission, permissionIndex) in form.permissionList">
                                        <el-button @click="togglePermissionActive(permission)" type="text" v-if="permission.active"><i class="el-icon-remove-outline"></i></el-button>
                                        <el-button @click="togglePermissionActive(permission)" type="text" v-if="!permission.active"><i class="el-icon-circle-plus-outline"></i></el-button>
                                        <el-checkbox :disabled="!permission.active" v-model="permission.access">{{ permission.human }}</el-checkbox>
                                    </el-col>
                                </el-row>
                            </el-form-item>

                            <el-row>
                                <el-col :sm="12">
                                    <el-form-item>
                                        <template slot="label">
                                            <el-tooltip placement="top" effect="dark">
                                                <div slot="content">
                                                    Add users to this role by typing their name below. <br/>
                                                    This will automatically update their permissions.
                                                </div>
                                                <span>Add users <i class="el-icon-info"></i></span>
                                            </el-tooltip>
                                        </template>
                                        <el-select :remote-method="getPeople" collapse-tags filterable multiple remote reserve-keyword v-loading="remote_loading" v-model="form.accountIds">
                                            <el-option :key="team_member.id" :label="team_member.fullname" :value="team_member.id" v-for="team_member in people"/>
                                        </el-select>
                                    </el-form-item>
                                </el-col>

                                <el-col :sm="12">
                                    <el-button @click="saveRole()" class="pull-right" round size="small" type="primary">Save Your Role</el-button>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-col>

                    <el-col :md="8" :sm="8">
                        <el-card class="default-roles" v-loading="loading_roles">
                            <div v-for="role in roles">
                                <el-link :type="active_default == role.code ? 'primary' : ''" @click="chooseDefaultRole(role.code)">Default {{ role.name }}</el-link>
                                <p class="small">{{role.description}}</p>
                                <div class="divider"></div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>

        </el-row>

    </div>

</template>

<script>
    export default {
        props: {
            role: {
                type: [Object, Boolean]
            }
        },
        data: () => {
            return {
                roles: [],
                people: [],
                active_default: "r_staff",
                loading: true,
                loading_roles: true,
                remote_loading: false,
                form: {
                    name: "",
                    permissionList: [],
                    accountIds: [],
                    accounts: []
                },
                permissions: [],
                rules: {
                    name: [{message: "Role name is required", trigger: "blur", required: true}]
                }
            };
        },
        watch: {
            active_default(val) {
            }
        },

        mounted() {
            if (this.role) {
                this.form = this.role;
                this.active_default = "";

                //load accounts
                if (this.role.accountIds.length > 0)
                    this.axios.get('/companies/current/accounts',
                        {
                            params: {
                                filter: {
                                    where: {id: {inq: this.role.accountIds}}
                                }
                            }
                        })
                        .then(res => {
                            this.people = res.data
                        })
            }

            this.loading = true;

            this.axios
                .get("/permissions/roles")
                .then(res => {
                    this.roles = res.data;
                })
                .catch(err => {
                })
                .then(() => {
                    this.loading_roles = false;
                });

            this.axios
                .get("/permissions/list", {params: {customRoleId: this.role.id}})
                .then(res => {
                    this.permissions = JSON.parse(JSON.stringify(res.data));
                    this.form.permissionList = res.data;

                    //let set the default permissions
                    //only set default if role is false
                    if (!this.role) {

                        this.form.permissionList.forEach(permission => {
                            //if permission.access = permission.includes
                            permission.access = permission.defaults.includes("r_staff");
                        });
                    }
                })
                .catch(err => {
                })
                .then(() => {
                    this.loading = false;
                });
        },

        methods: {
            chooseDefaultRole(rcode) {
                //this.active_default = rcode;

                this.form.permissionList.forEach(permission => {
                    //if permission.access = permission.includes
                    // we set the access based on the custom role stored value
                    if (!permission.active) {
                        permission.access = permission.defaults.includes(rcode);
                        permission.active = false;
                    }
                });

                this.active_default = rcode;
            },

            getPeople(query) {
                if (query !== "") {
                    this.remote_loading = true;
                    let whereQuery = {};
                    if (this.$auth.user().company && this.$auth.user().company.accountId) {
                        whereQuery.id =  {neq: this.$auth.user().company.accountId};
                    }

                    let pattern = {like: '.*' + query + '.*', options: "i"};
                    whereQuery.or = [
                        {first_name: pattern},
                        {last_name: pattern}
                    ];
                    this.axios
                        .get("/companies/current/accounts", {
                            params: {
                                filter: {
                                    where: whereQuery
                                }
                            }
                        })
                        .then(res => {
                            this.people = res.data;
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.remote_loading = false;
                        });
                } else {
                    this.people = [];
                }
            },
            resetForm() {
                this.form = {
                    name: "",
                    accountIds: [],
                    permissionList: JSON.parse(JSON.stringify(this.permissions))
                };
            },
            saveRole() {
                //make sure that rule name is always provided
                this.$refs.role_form.validate(valid => {
                    if (valid) {
                        this.loading = true;

                        if (this.form.hasOwnProperty("id")) {
                            //this should be a put
                            this.axios
                                .put("/custom_roles", this.form)
                                .then(res => {
                                    this.$message.success("Role successfully created");
                                    this.resetForm();
                                })
                                .catch(err => {
                                })
                                .then(() => {
                                    this.loading = false;
                                });
                        } else {
                            this.axios
                                .post("/companies/current/custom_roles", {
                                    name: this.form.name,
                                    permissionList: this.form.permissionList,
                                    accountIds: this.form.accountIds,
                                    parent: this.active_default
                                })
                                .then(res => {
                                    this.$message.success("Role successfully created");
                                    this.resetForm();
                                })
                                .catch(err => {
                                })
                                .then(() => {
                                    this.loading = false;
                                });
                        }
                    }
                });
            },
            togglePermissionActive(permission) {
                permission.active = !permission.active;

                if (!permission.active) {
//        permission.access = permission.defaults.includes(this.role.code);
                    permission.active = false;
                } else {
                    permission.access = true;
                }

            }
        }
    };
</script>
