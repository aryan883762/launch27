<template>
  <div class="app-section email-templates" v-loading="loading">

    <el-row :gutter="20">
      <el-col :md="6" :sm="6" class="" v-loading="loading">

        <el-card :body-style="{padding: '10px 0px', 'min-height' : '600px'}" class="bg-white">
          <div style="padding: 10px;">
            <el-select @change="loadEmails()" class="filter" placeholder="Type of Email" v-model="filter_email">
              <el-option label="Customers" value="customer"></el-option>
              <el-option label="Support" value="support"></el-option>
              <el-option label="Teams" value="team"></el-option>
              <el-option label="Staff" value="staff"></el-option>
            </el-select>
          </div>

          <el-divider class="list-divider"></el-divider>
          <ul class="template-list">
            <li :class="{ active: email_template.id == selected_template.id }" @click="selectTemplate(email_template)" v-for="email_template in email_templates">
              <el-row>
                <el-col>
                  <div class="flex-row">
                    <label style="">{{ email_template.name }}</label>
                    <el-switch @change="" active-color="#13ce66" class="pull-right" v-model="email_template.options.enabled"></el-switch>
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

      </el-col>

      <el-col :md="18" :sm="18" class="bg-white" style="padding-bottom: 100px;" v-if="selected_template">
        <el-row :gutter="40">
          <el-col :md="16" :sm="16" class="wysiwyg-section">


            <div class="flex-row" shadow="never">
              <h4 class="selected-template-title">{{ selected_template.name }} </h4>


            </div>


            <div class="editor">
              <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
                <div class="menubar">

                  <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold" class="menubar__button">
                    <icon name="bold"/>
                  </button>

                  <button :class="{ 'is-active': isActive.italic() }" @click="commands.italic" class="menubar__button">
                    <icon name="italic"/>
                  </button>

                  <button :class="{ 'is-active': isActive.strike() }" @click="commands.strike" class="menubar__button">
                    <icon name="strike"/>
                  </button>

                  <button :class="{ 'is-active': isActive.underline() }" @click="commands.underline" class="menubar__button">
                    <icon name="underline"/>
                  </button>

                  <button :class="{ 'is-active': isActive.code() }" @click="commands.code" class="menubar__button">
                    <icon name="code"/>
                  </button>

                  <button :class="{ 'is-active': isActive.paragraph() }" @click="commands.paragraph" class="menubar__button">
                    <icon name="paragraph"/>
                  </button>

                  <button :class="{ 'is-active': isActive.heading({ level: 1 }) }" @click="commands.heading({ level: 1 })" class="menubar__button">
                    H1
                  </button>

                  <button :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })" class="menubar__button">
                    H2
                  </button>

                  <button :class="{ 'is-active': isActive.heading({ level: 3 }) }" @click="commands.heading({ level: 3 })" class="menubar__button">
                    H3
                  </button>

                  <button :class="{ 'is-active': isActive.bullet_list() }" @click="commands.bullet_list" class="menubar__button">
                    <icon name="ul"/>
                  </button>

                  <button :class="{ 'is-active': isActive.ordered_list() }" @click="commands.ordered_list" class="menubar__button">
                    <icon name="ol"/>
                  </button>

                  <button :class="{ 'is-active': isActive.blockquote() }" @click="commands.blockquote" class="menubar__button">
                    <icon name="quote"/>
                  </button>

                  <button :class="{ 'is-active': isActive.code_block() }" @click="commands.code_block" class="menubar__button">
                    <icon name="code"/>
                  </button>

                  <button @click="commands.horizontal_rule" class="menubar__button">
                    <icon name="hr"/>
                  </button>

                  <button @click="commands.undo" class="menubar__button">
                    <icon name="undo"/>
                  </button>

                  <button @click="commands.redo" class="menubar__button">
                    <icon name="redo"/>
                  </button>

                </div>
              </editor-menu-bar>

              <editor-content :editor="editor" class="editor__content"/>
            </div>

            <el-button @click="saveTemplate(selected_template)" class="pull-right" round type="primary">
              Save Template
            </el-button>
          </el-col>

          <el-col :md="8" :sm="6" class="tags-section">

            <el-row style="padding: 20px  0px 0px;">
              <el-col class="flex-row">
                <el-select @change="loadTags()" class="filter" v-model="tag_group">
                  <el-option :key="group.key" :label="group.title" :value="group.key" v-for="group in tag_groups"></el-option>
                </el-select>
                <el-switch @change="" active-color="#13ce66" class="pull-right" v-model="selected_template.options.enabled"></el-switch>
              </el-col>
            </el-row>

            <el-divider class-></el-divider>

            <strong>Template Variables</strong>
            <p>For all templates you can use the following tags</p>

            <div style="max-height: 600px; display:block; overflow:auto">
              <div v-for="(tag, index) in templateTags">
                <el-button @click="insertTag(index)" class="tag-button" plain size="mini" type="primary">{{index}}</el-button>
                <i class="tag-description">{{tag}}</i>
              </div>
            </div>

          </el-col>
        </el-row>
      </el-col>
      <el-col :md="18" :sm="18" class="bg-white" v-if="!selected_template">
        <email-template-guide></email-template-guide>
      </el-col>
    </el-row>

    <el-row>
      <el-col class="pagination-footer">
        <div class="cct">
          <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadEmails" background layout="total, prev, pager, next"></el-pagination>
        </div>
      </el-col>
    </el-row>


  </div>
</template>

<script>
    import moment from "moment";
    import Icon from "../../../components/Icon";
    import EmailTemplateGuide from "../../../components/Guides/EmailTemplateGuide";
    import {Editor, EditorContent, EditorMenuBar} from 'tiptap'
    import {
        Blockquote,
        CodeBlock,
        HardBreak,
        Heading,
        HorizontalRule,
        OrderedList,
        BulletList,
        ListItem,
        TodoItem,
        TodoList,
        Bold,
        Code,
        Italic,
        Link,
        Strike,
        Underline,
        History,
    } from 'tiptap-extensions';

    export default {
        components: {
            EditorContent,
            EditorMenuBar,
            Icon,
            EmailTemplateGuide
        },

        data: () => {
            return {
                moment:            moment,
                email_templates:   [],
                loading:           true,
                selected_loading:  false,
                selected_template: "",
                locationId:        '',
                locations:         [],
                templateTags:      [],
                filter_email:      'customer',
                current_page:      1,
                page_size:         0,
                total_records:     0,
                tag_groups:        [],
                tag_group:         "",

                tag_current_page:  1,
                tag_page_size:     0,
                tag_total_records: 0,
                editor:            new Editor({
                    extensions: [
                        new Blockquote(),
                        new BulletList(),
                        new CodeBlock(),
                        new HardBreak(),
                        new Heading({levels: [1, 2, 3]}),
                        new HorizontalRule(),
                        new ListItem(),
                        new OrderedList(),
                        new TodoItem(),
                        new TodoList(),
                        new Link(),
                        new Bold(),
                        new Code(),
                        new Italic(),
                        new Strike(),
                        new Underline(),
                        new History(),
                    ],
                    content:    ''
                })
            };
        },
        beforeDestroy() {
            this.editor.destroy()
        },

        mounted() {

            (async () => {
                try {
                    this.loading = true

                    let result = (await this.axios.get("/companies/current/email_templates", {
                        params: {
                            page:   this.current_page,
                            filter: {
                                where: {
                                    code: {like: this.filter_email + '.*'},
                                    type: "sms"
                                }
                            }
                        }
                    })).data


                    this.email_templates = result.data


                    this.total_records = result.meta.totalItemCount;
                    this.page_size = result.meta.itemsPerPage;

                    if (this.email_templates.length > 0) {
                        this.selected_template = this.email_templates[0]

                        this.editor.setContent(this.selected_template.content)
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


                    this.loading = false
                } catch (err) {
                    this.loading = false
                }
            })()

        },

        methods: {
            insertTag(tag) {
                let text = '{{' + this.tag_group + '.' + tag + '}}'
                const transaction = this.editor.state.tr.insertText(text)
                this.editor.view.dispatch(transaction)
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
            loadEmails() {
                this.selected_template = false

                this.axios
                    .get("/companies/current/email_templates", {
                        params: {
                            page:   this.current_page,
                            filter: {
                                where: {
                                    code: {like: this.filter_email + '.*'},
                                    type: "sms"
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
                            this.editor.setContent(this.selected_template.content)
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
                this.editor.setContent(email_template.content)
            },
            saveTemplate(selected_temp) {
                this.loading = true;
                this.selected_template.content = this.editor.getHTML()
                this.axios
                    .put("/companies/current/email_templates/" + this.selected_template.id, this.selected_template)
                    .then(res => {
                        this.$helpers.successHandle('Template successfully updated', this)
                    })
                    .catch()
                    .then(() => {
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
</style>
