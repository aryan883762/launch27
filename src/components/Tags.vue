<template>
    <el-card class="manage-tags-cc" v-loading="loading">
        <el-tag :disable-transitions="false" :key="tag.id" :type="status" @close="handleClose(tag.id, index)" :closable="!readOnly" size="small" v-for="(tag, index) in tags" v-if="isTagged(tag.id)">
            {{ tag.name }}
        </el-tag>
        <el-autocomplete
                :fetch-suggestions="getTags" :highlight-first-item="true" @keyup.enter.native="handleInputConfirm"
                @select="handleSelect"
                class="input-new-tag"
                placeholder="Add new or search"
                ref="saveTagInput"
                size="mini"
                v-if="inputVisible"
                v-model="inputValue"
                value-key="name"
        ></el-autocomplete>
        <el-button v-if="!readOnly && !inputVisible" @click="showInput" class="button-new-tag" plain size="mini" style="padding:5px;" type="danger">+ New Tag</el-button>
    </el-card>
</template>

<script>
    export default {
        props: {
            value: {
                type: Array,
                required: true
            },
            readOnly: {
                type: Boolean,
                default: false
            },
            status: {
              type:String,
              default: 'primary'
            }
        },

        data() {
            return {
                tags: [],
                inputVisible: false,
                inputValue: "",
                selectedTags: [],
                loading: false
            };
        },

        watch: {
            value(val) {
                this.selectedTags = val;
            }
        },

        mounted() {
            this.selectedTags = [];

            if (this.value) this.selectedTags = this.value;

            this.loadTags();
        },

        methods: {
            isTagged(tagId) {
                return this.selectedTags.find(tgId => {
                    return tgId === tagId;
                });
            },
            loadTags() {
                this.loading = true;
                this.axios
                    .get("/companies/current/tags")
                    .then(res => {
                        this.tags = res.data;
                    })
                    .catch(err => {
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            handleClose(tagId, index) {
                let indice = this.selectedTags.indexOf(tagId);
                if (indice > -1) {
                    this.selectedTags.splice(indice, 1);
                }
                this.$emit("input", this.selectedTags);
                this.$emit("changed", this.selectedTags);
            },

            showInput() {
                this.inputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },

            handleInputConfirm() {
                if (this.inputValue.id) return;

                let inputValue = this.inputValue;
                if (inputValue) {
                    this.axios.post("/companies/current/tags", {name: inputValue}).then(res => {
                        this.tags.push(res.data);
                        this.selectedTags.push(res.data.id);
                        this.$emit("input", this.selectedTags);
                        this.$emit("changed", this.selectedTags);
                    });
                }
                this.inputVisible = false;
                this.inputValue = "";
            },
            handleSelect(tag) {
                if (tag && tag.id) {
                    this.selectedTags.push(tag.id)
                    this.inputValue = ""
                    this.$emit("input", this.selectedTags);
                    this.$emit("changed", this.selectedTags);
                }
            },
            getTags(query, cb) {
                this.axios.get('/companies/current/tags',
                    {
                        params: {
                            filter: {
                                where: {
                                    name: {
                                        like: query,
                                        options: 'i'
                                    }
                                }
                            }
                        }
                    })
                    .then(res => {
                        cb(res.data)
                    })
            }
        }
    };
</script>

<style lang="scss">
    .manage-tags-cc {
        box-shadow: none !important;
        border: 0 !important;

        .el-card__body {
            padding: 0px;
        }

        .el-tag {
            margin-right: 10px;
            margin-bottom: 5px;
        }

        .button-new-tag {
            margin-right: 10px;
        }

        .input-new-tag {
            width: 120px;
            margin-right: 10px;
            vertical-align: bottom;
        }
    }
</style>
