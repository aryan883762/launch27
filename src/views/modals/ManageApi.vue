<template>
    <div>
        <el-dialog custom-class="fullscreen-modal-display" title="Manage API Keys" :visible.sync="showModal" append-to-body :modal="true" :fullscreen="true" :close-on-press-escape="true" @close="settingsRedirect">
            <div class="modal-body">
                <el-card>
                    <div class="flex-row-reverse">
                        <el-button type="primary" round size="small" @click="showKeyDialog = true">Add a new Key</el-button>
                    </div>

                    <el-table :data="keys" v-loading="loading">
                        <el-table-column label="Date">
                            <template slot-scope="scope">
                                {{$moment(scope.row.created_at).format($date_format)}}
                            </template>
                        </el-table-column>
                        <el-table-column label="Name" prop="name"></el-table-column>
                        <el-table-column label="API Key" prop="token"></el-table-column>
                        <el-table-column label="Scopes" prop="scopes"></el-table-column>
                        <el-table-column label="Manage">
                            <template slot-scope="scope">
                                <el-link type="danger" @click="deleteKey(scope.row.id)">Delete</el-link>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </div>

            <el-dialog title="API Key" :modal="true" width="30%" top="0vh" destroy-on-close :visible.sync="showKeyDialog" append-to-body>
                <div class="modal-body">
                    <el-form ref="apifrm" :model="model" :rules="rules" label-position="top">
                        <el-form-item label="Key Name" prop="name">
                            <el-input v-model="model.name" placeholder="eg. Zapier, "></el-input>
                        </el-form-item>
                        <el-form-item label="Authorization Scope">
                            <el-checkbox-group v-model="model.scopes">
                                <el-checkbox label="read">Read</el-checkbox>
                                <el-checkbox label="write">Write</el-checkbox>
                            </el-checkbox-group>
                            <p>Authorization scopes determines the level of access that this API Key should provide</p>
                        </el-form-item>
                    </el-form>
                </div>
                <div slot="footer">
                    <el-button round size="small" @click="showKeyDialog = false">Cancel</el-button>
                    <el-button round size="small" type="primary" @click="createKey" :loading="loading">Add API Key</el-button>

                </div>
            </el-dialog>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "ManageApi",
        data() {
            return {
                showModal: false,
                showKeyDialog: false,
                model: {
                    name: '',
                    scopes: []
                },
                rules: {
                    name: [{message: "Name is required", required: true}]
                },
                keys: [],
                loading: false
            };
        },
        mounted() {
            this.showModal = true;
            this.getApis()
        },
        methods: {
            createKey() {
                this.$refs.apifrm.validate((valid) => {
                    if (valid) {
                        this.loading = true
                        this.axios.post('/extaccess/tokens', this.model)
                            .then(res => {
                                this.getApis()
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err)
                            })
                            .finally(() => {
                                this.loading = false
                            })
                    }
                })

            },
            settingsRedirect() {
                this.$router.push("/dashboard/settings");
            },
            getApis() {
                this.loading = true
                this.axios.get('/companies/current/api_keys')
                    .then(res => {
                        this.keys = res.data

                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            deleteKey(id) {
                this.$confirm('Delete API Key?', 'API Keys')
                    .then(() => {
                        this.loading = true
                        this.axios.delete('/extaccess/tokens/' + id)
                            .then(res => {
                                this.$helpers.successHandle('Token successfully deleted')
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err)
                            })
                            .finally(() => {
                                this.loading = false
                            })
                    })

            }
        }
    };
</script>
<style lang="scss"></style>
