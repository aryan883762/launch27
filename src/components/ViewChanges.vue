<template>
    <div style="display:inline-block;">

        <el-link :underline="false" @click="showModal = true" size="mini" type="danger" v-if="linkType !== 'button'">View History</el-link>
        <el-button @click="showModal = true" round size="small" style="margin:0px 10px; float:right;" type="warning" v-if="linkType == 'button'">View History</el-button>

        <el-dialog :append-to-body="true" :destroy-on-close="true" :visible.sync="showModal" @closed="closedModal" @opened="openedModal" title="View Changes" top="0vh" width="70%">
            <div class="modal-body view-changes-dialog" v-loading="loading">
                <el-table :data="revisions">
                    <el-table-column label="When" width="100">
                        <template slot-scope="scope">
                            {{$moment(scope.row.when).format($date_format + ' ' + $time_format)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="Whom" prop="whom_name" width="150"></el-table-column>
                    <el-table-column label="What">
                        <template slot-scope="scope">
                            <ul class="revision-list">
                                <li v-for="diff in scope.row.revision" v-if="diff.name !== 'updated_at'">
                                    <span class="diff-name">{{diff.name}}</span>
                                    <div class="diff-details">
                                        <label class="old" v-if="diff.name !== 'duration'">{{diff.old }}</label>
                                        <label class="old" v-if="diff.name === 'duration'">{{diff.old | duration }}</label>
                                        <el-divider direction="vertical"></el-divider>
                                        <label class="new" v-if="diff.name !== 'duration'">{{diff.new}}</label>
                                        <label class="new" v-if="diff.name === 'duration'">{{diff.new | duration}}</label>
                                    </div>
                                </li>
                            </ul>
                        </template>
                    </el-table-column>
                    <el-table-column label="Ip Address" prop="ip_forwarded"></el-table-column>

                </el-table>
            </div>
            <div slot="footer">
                <el-button @click="showModal = false" round size="small" type="primary">Close</el-button>
            </div>
        </el-dialog>
    </div>

</template>

<script>

    export default {
        props: {
            id: {
                type: String,
                required: true
            },
            modelName: {
                type: String,
                required: false
            },
            linkType: {
                type: String,
                default: () => {
                    return 'inline'
                }
            }
        },
        data() {
            return {
                showModal: false,
                revisions: [],
                loading: true
            }
        },
        mounted() {
            // get the id and load the revisions
        },

        methods: {
            openedModal() {
                this.loading = true

                this.axios.get('/history_trackings/' + this.id + '/get-history',
                    {
                        params: {
                            model_name: this.modelName
                        }
                    })
                    .then(
                        res => {
                            this.revisions = res.data
                        }
                    )
                    .catch(err => {

                    })
                    .then(() => {
                        this.loading = false
                    })

            },
            closedModal() {
                this.revisions = []
            },

        }
    }
</script>

<style lang="scss">
    .view-changes-dialog {
        .revision-list {
            margin: 0;
            list-style: none;
            padding: 0px;

            li {
                .diff-name {
                    font-weight: 500;
                    max-width: 45%;
                    display: inline-block;
                }

                .diff-details {
                    width: auto;
                    display: inline-block;
                    padding-left: 10px;

                    label {
                        &.old {
                            color: red;
                            text-decoration: line-through;
                        }

                        &.new {
                            color: green
                        }
                    }
                }
            }
        }
    }
</style>
