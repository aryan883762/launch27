<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="false" :visible.sync="showModal" @close="settingsRedirect" append-to-body custom-class="fullscreen-modal-display" title="Tags Management">

            <div class="modal-body app-section-tags">

                <el-row :gutter="10">
                    <el-col :md="6" :sm="6">
                        <el-card :body-style="{padding: '0px'}">
                            <h4 style="padding: 10px 20px;">Available Tags</h4>
                            <ul class="tags-list">
                                <li :class="{active : $route.params.id === tag.id}" v-for="tag in tags">
                                    <el-link @click="selectTag(tag.id)"><i class="el-icon-collection-tag"></i> {{tag.name}} ({{tag.total_usage}})</el-link>
                                </li>
                            </ul>
                        </el-card>
                    </el-col>

                    <el-col :md="18" :sm="18">
                        <router-view/>
                    </el-col>
                </el-row>


                <el-row>
                    <el-col class="pagination-footer">
                        <div class="cct">
                            <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadTags" background layout="total, prev, pager, next"></el-pagination>
                        </div>
                    </el-col>
                </el-row>
            </div>

        </el-dialog>
    </div>

</template>

<script>
    export default {
        data() {
            return {
                tags: [],
                total_records: 0,
                page_size: 0,
                current_page: 1,
                selectedTag: false,
                showModal: false,
            };
        },

        mounted() {
            this.loadTags();
            this.showModal = true
        },

        methods: {
            settingsRedirect() {
                this.$router.push({name: 'dashboard_settings'});
            },
            loadTags() {
                this.axios
                    .get("/tags/list", {
                        params: {
                            page: this.current_page,
                        }
                    })
                    .then(res => {
                        this.tags = res.data;
                        //
                        if (this.tags.length > 0 && !this.$route.params.id)
                            this.$router.push({name: 'dashboard_settings_tag_detail', params: {id: this.tags[0].id}})
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
            },
            loadTag(tagId) {
                this.axios.get('/tags/' + tagId + '/usage')
                    .then(res => {
                        this.selectedTag = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {

                    })
            },
            selectTag(id) {
                this.$router.push({name: 'dashboard_settings_tag_detail', params: {id: id}})
            }
        }
    };
</script>

<style lang="scss">
    .app-section-tags {
        ul {
            &.tags-list {
                list-style: none;
                margin: 0px;
                padding: 0px 0px 20px;

                li {
                    font-size: 14px;
                    padding: 2px 10px 2px 20px;
                    border-left: 4px solid white;

                    &:hover {
                        background: #f3f3f3;
                        border-left-color: $launch-primary-color;
                    }

                    &.active {
                        background: #f3f3f3;
                        border-left-color: $launch-primary-color;
                    }
                }
            }
        }
    }

</style>
