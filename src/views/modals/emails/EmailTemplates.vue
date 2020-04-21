<template>
    <div class="email-templates" v-loading="loading">

        <el-card :body-style="{ padding: '20px' }" style="border:none; margin-bottom: 5px;">
            <el-row>
                <el-col class="text-center">

                    <div class="pull-left">
                        <el-select @change="loadEmails()" class="filter" placeholder="Type of Email" v-model="filter_email">
                            <el-option label="Customers" value="customer"></el-option>
                            <el-option label="Support" value="support"></el-option>
                            <el-option label="Teams" value="team"></el-option>
                            <el-option label="Staff" value="staff"></el-option>
                            <el-option label="Apps" value="apps"></el-option>
                        </el-select>
                    </div>

                    <div class="pull-right main-filters" v-if="selected_template">
                        <div style="display:inline-block;margin-right: 10px;">Master template</div>
                        <el-select class="small filter" placeholder="Master template" v-model="selected_template.masterTemplateId">
                            <el-option :label="mt.name" :value="mt.id" v-for="mt in master_templates"></el-option>
                        </el-select>
                    </div>
                </el-col>
            </el-row>

        </el-card>

        <el-row :gutter="10">
            <el-col :md="6" :sm="6" v-loading="loading">
                <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 240) + 'px', height: (windowHeight - 240) + 'px', overflow: 'hidden'}">

                    <el-card :body-style="{padding: '0px 0px', 'min-height' : '626px'}">

                        <ul class="template-list">
                            <li :class="{ active: email_template.id == selected_template.id }" @click="selectTemplate(email_template)" v-for="email_template in email_templates">
                                <el-row>
                                    <el-col style="position:relative">
                                        <div class="flex-row">
                                            <label style="">{{ email_template.name }}</label>
                                            <el-switch v-if="email_template.options.enableable" @change="toggleEnable(email_template)" active-color="#13ce66" class="pull-right" v-model="email_template.options.enabled"></el-switch>
                                        </div>
                                        <small>last editted : {{$moment(email_template.updated_at).format($date_format)}}</small>

                                    </el-col>

                                </el-row>

                                <el-row v-if="false">
                                    <el-col :md="24" :sm="24">
                                        <p>{{ email_template.description }}</p>
                                    </el-col>
                                </el-row>
                            </li>
                        </ul>
                    </el-card>

                </el-scrollbar>
            </el-col>

            <el-col :md="18" :sm="18" v-if="selected_template">

                <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 290) + 'px', height: (windowHeight - 290) + 'px', overflow: 'hidden'}">

                    <el-card style="border:none; border-radius:0;" shadow="hover">
                        <div class="flex-row" shadow="never">
                            <h4>{{ selected_template.name }} </h4>


                            <!-- <div>
                               <el-select class="filter" placeholder="Location" v-model="locationId" value-key="id">
                                 <el-option :key="location.id" :label="location.name" :value="location.id" v-for="location in locations"></el-option>
                               </el-select>
                             </div>-->

                            <el-switch v-model="htmlmode" active-text="View Source"></el-switch>

                        </div>

                        <div style="margin: 10px 0px;">Subject</div>
                        <el-input class="email-subject" placeholder="Subject" v-model="selected_template.subject"></el-input>

                        <div class="flex-row" style="margin: 10px 0px;">
                            <div>Content</div>
                            <el-button type="danger" @click="showTags=true" size="mini" round plain style="height: 30px;">Insert Tags</el-button>
                        </div>

                        <div class="editor">
                            <!-- <html-editor v-model="selected_template.content"></html-editor>-->

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

                        </div>


                        <!-- <el-button @click="restoreTemplate(selected_template)" plain size="small" round>
                            Restore Default
                        </el-button> -->


                    </el-card>

                </el-scrollbar>

                <div class="bg-white" style="padding: 15px;">
                    <view-changes :id="selected_template.id" link-type="link"></view-changes>

                    <el-button @click="saveTemplate(selected_template)" class="pull-right" round size="small" type="success">
                        Save Template
                    </el-button>
                    <el-button @click="show_modal = true" class="pull-right m-r-10" round size="small" type="info">
                        Send Test Email
                    </el-button>
                    <el-button @click="loadPreview" class="pull-right" round size="small" type="default">
                        Preview Email
                    </el-button>
                </div>


                <!--  <el-col :md="8" :sm="8" class="tags-section" v-if="false">
                      <el-card :body-style="{ padding: '10px;' }">
                          <el-row style="padding: 10px  0px 0px;">
                              <el-col class="flex-row">
                                  <el-select @change="loadTags()" class="filter" v-model="tag_group">
                                      <el-option :key="getKey()" :label="group.title" :value="group.key" v-for="group in tag_groups"></el-option>
                                  </el-select>
                                  &lt;!&ndash;<el-switch @change="" active-color="#13ce66" class="pull-right" v-model="selected_template.options.enabled"></el-switch>&ndash;&gt;
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


                  </el-col>-->
            </el-col>

            <!--  <el-col :md="18" :sm="18" class="bg-white" v-if="!selected_template">
                  <email-template-guide></email-template-guide>
              </el-col>-->

        </el-row>

        <el-row>
            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadEmails" background layout="total, prev, pager, next"></el-pagination>
                </div>
            </el-col>
        </el-row>

        <el-dialog :close-on-press-escape="true" :fullscreen="false"
                   :visible.sync="show_modal" append-to-body title="Send Test Email" top="0">
            <el-form :model="test_email" :rules="test_email_rules" class="bg-white padding-2x"
                     label-position="top" ref="testEmailForm" v-loading="modal_loading">
                <el-row :gutter="20">
                    <el-col :md="24" :sm="24" :xs="24">

                        <el-form-item>
                            <el-alert
                                    :closable="false"
                                    title="The saved template will be sent"
                                    type="warning">
                            </el-alert>
                        </el-form-item>

                        <el-form-item label="Email" prop="email">
                            <el-input type="email" v-model="test_email.email"/>
                        </el-form-item>

                        <el-form-item label="Name">
                            {{ selected_template.name }}
                        </el-form-item>

                        <el-form-item label="Subject">
                            {{ selected_template.subject }}
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col class="text-center">
                        <el-button @click="show_modal = false" round>Close</el-button>
                        <el-button @click="sendTestEmail" round type="primary">Send</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </el-dialog>

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

        <el-dialog :visible.sync="showPreview" :append-to-body="true" :modal="true" top="0" @close="preview_email = {}">
            <div v-loading="loading_preview">
                <el-row :gutter="20">
                    <el-col>
                        <el-form label-position="top">
                            <el-form-item>
                                <el-alert
                                        :closable="false"
                                        title="The saved template will is previewed"
                                        type="warning">
                                </el-alert>
                            </el-form-item>
                            <el-form-item label="Title">
                            <p>{{preview_email.title}}</p>
                            </el-form-item>
                            <el-form-item label="Subject">
                            <p>{{preview_email.subject}}</p>
                            </el-form-item>
                            <el-form-item label="Content">
                            <div v-html="preview_email.full" style="word-break: normal"></div>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>


    </div>
</template>

<script>
    import moment from "moment";
    import EmailTemplateGuide from "../../../components/Guides/EmailTemplateGuide";
    import ViewChanges from "../../../components/ViewChanges";

    import 'quill/dist/quill.core.css'
    import 'quill/dist/quill.snow.css'
    import 'quill/dist/quill.bubble.css'

    import {quillEditor} from 'vue-quill-editor'

    const uuidv1 = require('uuid/v1');

    export default {
        components: {
            quillEditor,
            ViewChanges,
            EmailTemplateGuide
        },

        data: () => {
            return {
                moment: moment,
                email_templates: [],
                loading: true,
                selected_loading: false,
                selected_template: "",
                locationId: '',
                locations: [],
                templateTags: [],
                filter_email: 'customer',
                current_page: 1,
                page_size: 0,
                total_records: 0,
                tag_groups: [],
                tag_group: "",
                editorOption: {
                    // Some Quill options...
                },
                tag_current_page: 1,
                tag_page_size: 0,
                tag_total_records: 0,
                master_templates: [],
                show_modal: false,
                test_email: {email: ''},
                modal_loading: false,
                test_email_rules: {
                    email: [
                        {message: "Email is required", required: true, trigger: "blur"},
                        {type: "email", message: "Please provide a valid email", trigger: "blur"}
                    ]
                },
                htmlmode: false,
                showTags: false,
                showPreview : false,
                loading_preview: false,
                preview_email: {}
            };
        },
        computed: {
            editor() {
                return this.$refs.htmlEditor.quill
            }
        },
        beforeDestroy() {
        },

        created() {

        },

        mounted() {
            if (this.$route.params.filter) {
                this.filter_email = this.$route.params.filter;
            }
            (async () => {
                try {
                    this.loading = true

                    let result = (await this.axios.get("/companies/current/email_templates", {
                        params: {
                            page: this.current_page,
                            filter: {
                                where: {
                                    code: {like: this.filter_email + '.*'},
                                    type: "email"
                                }
                            }
                        }
                    })).data


                    this.email_templates = result.data


                    this.total_records = result.meta.totalItemCount;
                    this.page_size = result.meta.itemsPerPage;

                    if (this.email_templates.length > 0) {
                        this.selected_template = this.email_templates[0]
                    }

                    this.tag_groups = (await this.axios.get('/email_templates/get-tag-groups')).data
                    if (this.tag_groups.length > 0) {
                        this.tag_group = this.tag_groups[0].key

                        this.templateTags = (await this.axios.get('/email_templates/get-tag-list', {
                            params: {
                                key: this.tag_group
                            }
                        })).data.data
                    }

                    this.master_templates = (await this.axios.get('/companies/current/master_templates')).data


                    this.loading = false
                } catch (err) {
                    this.loading = false
                }
            })()

            this.test_email.email = this.$auth.user().email;

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
            restoreTemplate(selected_template) {
                this.axios.post('/email_templates/restore-default', {
                    params: {}
                })
            },
            loadEmails() {
                this.selected_template = false
                this.axios
                    .get("/companies/current/email_templates", {
                        params: {
                            page: this.current_page,
                            filter: {
                                where: {
                                    code: {like: this.filter_email + '.*'},
                                    type: "email"
                                }
                            }
                        }
                    })
                    .then(res => {
                        this.email_templates = res.data.data;
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                        if (this.email_templates.length > 0) {
                            this.selected_template = this.email_templates[0]
                        }
                    })
                    .catch()
                    .then(() => {
                        this.loading = false;
                    });
            },

            selectTemplate(email_template) {
                this.selected_loading = true;
                this.selected_template = email_template;
            },
            toggleEnable(val) {
                this.loading = true;
                this.axios
                    .put("/companies/current/email_templates/" + val.id, {
                        options: val.options
                    })
                    .then(res => {
                        this.$message.success('Template is updated')
                    })
                    .catch((err) => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            saveTemplate(selected_temp) {
                this.loading = true;
                this.axios
                    .put("/companies/current/email_templates/" + this.selected_template.id, this.selected_template)
                    .then(res => {
                        this.$message.success('Template is updated')
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            getTemplateTags() {
                this.axios.get('/email_templates/tags',
                    {
                        params: {
                            code: this.selected_template.code
                        }
                    })
                    .then(res => {
                        this.templateTags = res.data
                    })
            },
            sendTestEmail() {
                this.modal_loading = true;
                this.axios.get('/email_templates/send-test-email',
                    {
                        params: {
                            email: this.test_email.email,
                            code: this.selected_template.code
                        }
                    })
                    .then(res => {
                        if (res.data && res.data.success) {
                            this.$message.success("Email sent.");
                        } else {
                            this.$helpers.errorHandle("Sending failed, please try again later.");
                        }
                    })
                    .catch(err => {
                        this.$helpers.errorHandle("Sending failed, please try again later.");
                    })
                    .finally(() => {
                        this.modal_loading = false;
                    })
            },
            getKey(id) {
                return uuidv1()
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
            loadPreview() {
                this.loading_preview = true;
                this.showPreview = true;
                this.preview_email = {};
                this.axios.get('/email_templates/test-email-preview',
                    {
                        params: {
                            code: this.selected_template.code
                        }
                    })
                    .then(res => {
                        this.preview_email = res.data;
                    })
                    .catch(err => {
                        this.$helpers.errorHandle("Loading preview failed, please try again later.");
                    })
                    .finally(() => {
                        this.loading_preview = false;
                    })
            }
        }
    };
</script>

<style lang="scss">
    @import './styles/EmailTemplates.scss';

    .email-templates {
        @import '../../../theme/editor/editor';
        @import '../../../theme/editor/menubar';
        @import '../../../theme/editor/menububble';

    }

    .m-r-10 {
        margin-right: 10px !important;
    }
</style>
