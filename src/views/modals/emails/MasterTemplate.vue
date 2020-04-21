<template>
    <div class="app-section email-templates" v-loading="loading">

        <el-row :gutter="10">
            <el-col>
                <el-form class="center" label-position="top" ref="form">


                    <el-card>
                        <el-row :gutter="20">


                            <el-col :md="12" :sm="12">
                                <el-form-item label="Name">
                                    <el-input v-model="selected_template.name"></el-input>
                                </el-form-item>
                            </el-col>

                            <el-col :md="12" :sm="12">
                                <div style="margin-bottom: 10px;">Available Templates</div>
                                <el-select @change="selectTemplate" class="filter small " v-model="selected_template" value-key="id">
                                    <el-option :label="master_template.name" :value="master_template" v-for="master_template in master_templates"></el-option>
                                </el-select>
                            </el-col>


                            <el-col  >
                                <el-link type="danger" @click="showTags=true" size="mini" round plain style="height: 30px;">Insert Tags</el-link>
                                <el-divider direction="vertical"></el-divider>
                                <el-switch v-model="htmlmode" active-text="View Source"></el-switch>
                            </el-col>

                            <!-- <el-col :md="8" :sm="8">
                                 <el-form-item label="Primary Text Color">
                                     <el-color-picker v-model="selected_template.primary_text_color"></el-color-picker>
                                 </el-form-item>
                             </el-col>
                             <el-col :md="8" :sm="8">
                                 <el-form-item label="Primary Color">
                                     <el-color-picker v-model="selected_template.primary_color"></el-color-picker>
                                 </el-form-item>
                             </el-col>-->

                        </el-row>


                        <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 380) + 'px', height: (windowHeight - 380) + 'px', overflow: 'hidden'}">


                            <quill-editor

                                    ref="htmlEditor"
                                    v-model="selected_template.content"
                                    :options="editorOption"
                                    @blur="onEditorBlur($event)"
                                    @focus="onEditorFocus($event)"
                                    @ready="onEditorReady($event)"
                                    v-if="!htmlmode"
                            >

                            </quill-editor>
                            <el-input id="html_textarea" type="textarea" class="html-textarea" v-if="htmlmode" v-model="selected_template.content"></el-input>

                        </el-scrollbar>

                        <el-row>
                            <el-col>
                                <el-button @click="cloneMasterTemplate()" round size="small" type="warning">Clone this template</el-button>
                                <el-button @click="saveTemplate(selected_template)" class="pull-right" round size="small" type="primary">
                                    Save Template
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-card>

                </el-form>
            </el-col>

        </el-row>


        <el-drawer :visible.sync="showTags" :modal="false" :modal-append-to-body="false">
            <el-card :body-style="{ padding: '10px;' }">
                <el-row style="padding: 10px  0px 0px;">
                    <el-col class="flex-row">
                        <el-select @change="loadTags()" class="filter" v-model="tag_group">
                            <el-option :key="getKey()" :label="group.title" :value="group.key" v-for="group in tag_groups"></el-option>
                        </el-select>
                    </el-col>
                </el-row>

                <el-divider></el-divider>
                <p>For all templates you can use the following tags</p>

                <div style="max-height: 600px; display:block; overflow:auto">
                    <div v-for="(tag, index) in templateTags">
                        <el-button @click="insertTag(index)" class="tag-button" plain size="mini" type="primary">{{index}}</el-button>
                        <i class="tag-description">{{tag}}</i>
                    </div>
                </div>
            </el-card>
        </el-drawer>

    </div>
</template>

<script>
    import moment from "moment";
    import SideHelp from "../../components/SideHelp";

    import 'quill/dist/quill.core.css'
    import 'quill/dist/quill.snow.css'
    import 'quill/dist/quill.bubble.css'

    import {quillEditor} from 'vue-quill-editor'

    const uuidv1 = require('uuid/v1');


    export default {
        components: {
            SideHelp,
            quillEditor
        },
        data: () => {
            return {
                moment: moment,
                master_templates: [],
                loading: false,
                primary_color: "",
                primary_text_color: "",
                selected_template: {},
                tag_groups: [],
                tag_group: "",
                templateTags: [],
                htmlmode: false,
                editorOption: {
                    // Some Quill options...
                },
                showTags: false
            };
        },
        computed: {
            editor() {
                return this.$refs.htmlEditor.quill
            }
        },
        created() {
            this.selected_template = {
                name: '',
                primary_color: this.$auth.user().company.main_color,
                primary_text_color: '#333'
            }
        },
        mounted() {

            (async () => {
                try {
                    this.loading = true
                    this.getMasterTemplates()

                    this.tag_groups = (await this.axios.get('/email_templates/get-tag-groups')).data
                    if (this.tag_groups.length > 0) {
                        this.tag_group = this.tag_groups[0].key

                        this.templateTags = (await this.axios.get('/email_templates/get-tag-list', {
                            params: {
                                key: this.tag_group
                            }
                        })).data.data
                    }

                } catch (err) {

                }
            })()


        },

        methods: {
            insertTag(tag) {

                let mergeFieldText = '{{' + this.tag_group + '.' + tag + '}}'
                if (this.tag_group === 'other') {
                    mergeFieldText = '{{' + tag + '}}'
                }

                if (this.htmlmode) {
                    this.insertAtCaret('html_textarea', mergeFieldText)
                    this.selected_template.content = document.getElementById('html_textarea').value
                } else {
                    var selection = this.editor.getSelection(true);
                    this.editor.insertText(selection.index, mergeFieldText);
                }


                this.showTags = false
            },
            getDefaultMaster() {
                this.axios.get('/email_templates/master-default')
                    .then(res => {
                        this.selected_template = res.data
                    })
                    .catch(err => {
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            getMasterTemplates() {
                this.axios.get('/companies/current/master_templates')
                    .then(res => {
                        this.master_templates = res.data


                        if (this.master_templates.length === 0) {
                            this.getDefaultMaster()
                        } else {
                            this.selected_template = this.master_templates[0]
                            this.loading = false
                        }
                    })
            },
            selectTemplate(email_template) {
                this.selected_template = email_template;
            },
            cloneMasterTemplate() {

                delete this.selected_template.id
                this.selected_template.name = this.selected_template.name + ' copy'
                this.saveTemplate()
            },
            saveTemplate() {
                this.loading = true
                if (this.selected_template.id) {
                    this.axios.patch('/email_masters/' + this.selected_template.id, this.selected_template)
                        .then(res => {
                            this.getMasterTemplates()
                        })
                        .catch(() => {
                        })
                        .finally(() => {
                            this.loading = false
                        })
                } else {
                    this.axios.post('/companies/current/master_templates', this.selected_template)
                        .then(res => {
                            this.getMasterTemplates()
                        })
                        .catch(() => {
                        })
                        .finally(() => {
                            this.loading = false
                        })
                }
            },
            onEditorBlur(quill) {
                //console.log('editor blur!', quill)
            },
            onEditorFocus(quill) {
                //console.log('editor focus!', quill)
            },
            onEditorReady(quill) {
                //console.log('editor ready!', quill)
            },
            onEditorChange({quill, html, text}) {
                //console.log('editor change!', quill, html, text)
                this.content = html
            },
            insertAtCaret(areaId, text) {
                var txtarea = document.getElementById(areaId);
                var scrollPos = txtarea.scrollTop;
                var strPos = 0;
                var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
                    "ff" : (document.selection ? "ie" : false));
                if (br == "ie") {
                    txtarea.focus();
                    var range = document.selection.createRange();
                    range.moveStart('character', -txtarea.value.length);
                    strPos = range.text.length;
                } else if (br == "ff") strPos = txtarea.selectionStart;

                var front = (txtarea.value).substring(0, strPos);
                var back = (txtarea.value).substring(strPos, txtarea.value.length);
                txtarea.value = front + text + back;
                strPos = strPos + text.length;
                if (br == "ie") {
                    txtarea.focus();
                    var range = document.selection.createRange();
                    range.moveStart('character', -txtarea.value.length);
                    range.moveStart('character', strPos);
                    range.moveEnd('character', 0);
                    range.select();
                } else if (br == "ff") {
                    txtarea.selectionStart = strPos;
                    txtarea.selectionEnd = strPos;
                    txtarea.focus();
                }
                txtarea.scrollTop = scrollPos;
            },

            loadTags() {

                this.axios.get('/email_templates/get-tag-list',
                    {
                        params: {
                            key: this.tag_group
                        }
                    })
                    .then(res => {
                        this.templateTags = res.data.data
                    })
            },
            getKey(id) {
                return uuidv1()
            },
            insertAtCaret(areaId, text) {
                var txtarea = document.getElementById(areaId);
                var scrollPos = txtarea.scrollTop;
                var strPos = 0;
                var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
                    "ff" : (document.selection ? "ie" : false));
                if (br == "ie") {
                    txtarea.focus();
                    var range = document.selection.createRange();
                    range.moveStart('character', -txtarea.value.length);
                    strPos = range.text.length;
                } else if (br == "ff") strPos = txtarea.selectionStart;

                var front = (txtarea.value).substring(0, strPos);
                var back = (txtarea.value).substring(strPos, txtarea.value.length);
                txtarea.value = front + text + back;
                strPos = strPos + text.length;
                if (br == "ie") {
                    txtarea.focus();
                    var range = document.selection.createRange();
                    range.moveStart('character', -txtarea.value.length);
                    range.moveStart('character', strPos);
                    range.moveEnd('character', 0);
                    range.select();
                } else if (br == "ff") {
                    txtarea.selectionStart = strPos;
                    txtarea.selectionEnd = strPos;
                    txtarea.focus();
                }
                txtarea.scrollTop = scrollPos;
            }
        }
    };
</script>
