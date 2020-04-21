<template>
    <div>
        <el-table :data="roles" v-loading="loading">
            <el-table-column label="Role name" prop="name"></el-table-column>
            <el-table-column label="User accounts">
                <template slot-scope="scope">
                    <el-avatar :size="32" v-if="scope.row.accounts">{{ scope.row.accounts.length }}</el-avatar>
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="300">
                <template slot-scope="scope">
                    <el-button-group style="margin-left: -20px;float:left;">
                        <el-button @click="triggerAction('edit', scope.row)" size="mini" type="text">Edit</el-button>
                        <el-button @click="triggerAction('duplicate', scope.row)" size="mini" type="text">Duplicate</el-button>
                        <el-button @click="triggerAction('delete', scope.row)" size="mini" type="text">Delete</el-button>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    export default {
        data: () => {
            return {
                roles: [],
                loading: true
            };
        },
        created() {
        },
        mounted() {
            this.loadRoles();
        },
        methods: {
            loadRoles() {
                this.loading = true;
                this.axios
                    .get("/companies/current/custom_roles", {params: {filter: {include: ['accounts']}}})
                    .then(res => {
                        this.roles = res.data;
                    })
                    .catch(err => {
                    })
                    .then((this.loading = false));
            },
            triggerAction(action, role) {
                switch (action) {
                    case "edit":
                        this.$events.emitEvent("edit-role", [role]);
                        break;

                    case "duplicate":
                        //first save as duplicate
                        //delete ID and post to create a duplicate and redirect for editting.
                        this.loading = true;
                        delete role.id;
                        role.name = role.name + " *";
                        this.axios
                            .post("/companies/current/custom_roles", role)
                            .then(res => {
                                this.$events.emitEvent("edit-role", [res.data]);
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
                            .delete("/custom_roles/" + role.id)
                            .then(res => {
                                this.loadRoles();
                            })
                            .catch()
                            .then(() => {
                                this.loading = false;
                            });
                        break;
                }
            }
        }
    };
</script>
