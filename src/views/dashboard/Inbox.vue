<template>
    <div class="app-section inbox">
        <el-row class="l27-dashboard-inbox">
            <el-col :md="24" class="l27-inbox-page-wrap">
                <div>
                    <el-row class="full-width">
                        <el-col :md="6" :sm="6" :xs="24" class="bg-white border-shadow left-list-pane">
                            <h4 class="sub-title nip-sides">
                                Messages ({{unread_count}})
                                <span class="icon-wrap pull-right">

                    <el-tooltip class="item" effect="dark" content="Start new conversation" placement="top">
                      <el-button @click="conversation_modal = true" style="padding: 0;margin: 0; border: none"><i class="el-icon-circle-plus"/></el-button>
                    </el-tooltip>

                  <el-popover
                          v-if="false"
                          ref="no_conv_pop"
                          placement="right"
                          title="Title"
                          width="200"
                          trigger="click"
                          content="this is content, this is content, this is content">
                    <el-button ref="pop_btn" slot="reference" style="padding: 0; margin: 0; border: none"></el-button>
                  </el-popover>
                  </span>
                            </h4>

                            <el-divider class="filter-divider"/>

                            <el-select
                                    class="inbox-search-box nip-sides"
                                    v-model="value"
                                    filterable
                                    remote
                                    reserve-keyword
                                    placeholder="Search"
                                    :remote-method="remoteMethod"
                                    :loading="loading"
                            >
                                <el-button slot="prepend" icon="el-icon-search"/>
                                <el-option
                                        v-for="item in options"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                />
                            </el-select>

                            <!--<el-input :placeholder="'button_text.dashboard.search'" @input="searchPeople" class="inbox-search-box nip-sides border-shadow">-->
                            <!--<el-button slot="prepend" icon="el-icon-search" />-->
                            <!--</el-input>-->
                            <el-divider class="filter-divider"/>

                            <el-scrollbar wrap-class="list" view-class="view-box" :native="false" :style="{ maxHeight: (windowHeight - 210) + 'px', height: (windowHeight - 210) + 'px', overflow: 'hidden'}">

                                <ul class="people-list">

                                    <li :class="{ active: convo.id == selected_convo.id }" @click="selectConversation(convo.id)" v-for="convo in conversations">
                                        <el-row class="nip-sides">
                                            <div class="avatar-zone">
                                                <account-avatar :account="getRecentActivityAccount(convo)" :size="35"/>
                                            </div>
                                            <div class="detail-zone">
                                                <el-row>
                                                    <span>{{getRecentActivityAccount(convo).roleName}}</span>
                                                    <span class="pull-right">{{!convo.latestMessage ? $moment(convo.created_at).fromNow() : $moment(convo.latestMessage.created_at).fromNow()}}</span>
                                                </el-row>
                                                <el-row>
                                                    <el-col :md="20" :sm="20" :xs="20">
                                                        <h4>{{getRecentActivityAccount(convo).fullname}}</h4>
                                                        <p>{{convo.latestMessage ? convo.latestMessage.text : "" }}</p>
                                                    </el-col>
                                                    <el-col :md="4" :sm="4" :xs="4" style="margin-top: 5px"><span v-if="unread_data[convo.id] !== 0 && false" style="font-size: 12px;font-weight: bold;padding: 0px 15px;background-color: #1fb6ff;border-radius: 5px;color: white;margin-top: 5px;">{{unread_data[convo.id]}}</span></el-col>
                                                </el-row>
                                            </div>
                                        </el-row>
                                    </li>
                                </ul>
                            </el-scrollbar>
                        </el-col>

                        <el-col :md="18" :sm="18" class="l27-inbox-page-right">

                            <el-row class="right-pane-header nip-sides">
                                <el-col :md="8" :sm="8" class="avatar-area">
                                      <span v-for="av in selected_convo.accounts">
                                        <el-tooltip class="item" effect="dark" :content="av.fullname" placement="top">
                                          <account-avatar style="margin-right: 5px" :account="av" :size="35"/>
                                        </el-tooltip>
                                      </span>

                                    <div style="display: inline-block;">
                                        <el-popover
                                                placement="right"
                                                title=""
                                                width="400"
                                                trigger="click">
                                            <el-select :loading-text="'Loading members..' " placeholder="Add member(s)" :remote-method="getAccountsWithoutMembers" size="mini" style="width: 80%" collapse-tags filterable multiple remote v-loading="loading" v-model="newConvoMembers">
                                                <el-option :key="person.id" :label="person.name" :value="person.id" v-for="person in memberObjs"/>
                                            </el-select>
                                            <el-button @click="addAccountToConversation" style="width: 15%; margin-left: 10px" class="text-button" size="mini" type="primary">Add</el-button>
                                            <el-button v-if="!empty_convo" style="color: #30DB2E;" size="mini" type="text" slot="reference" class="add-person-plus"><i class="el-icon-plus"/> <span class="add-person-text">Add a person</span></el-button>
                                        </el-popover>
                                    </div>


                                    <!--<a href="#">-->
                                    <!--<span class="add-person-plus"><i class="el-icon-plus" /> <span class="add-person-text">Add a person</span></span>-->
                                    <!--</a>-->
                                </el-col>
                                <el-col :md="10" :sm="10" class="title-area">
                                    <p style="text-transform: uppercase"><strong>{{selected_convo.title}}</strong></p>
                                </el-col>
                            </el-row>

                            <el-row class="right-pane-messages">
                                <div class="messages-section">

                                    <el-scrollbar wrap-class="list" view-class="view-box" :native="false"  :style="{ maxHeight: (windowHeight - 240) + 'px', height: (windowHeight - 240) + 'px', overflow: 'hidden'}">
                                        <div class="messages-pane" ref="list-messages-reference" id="list-messages-reference">


                                            <el-row v-for="message in selected_convo_messages" :class="message.accountId === $auth.user().id ? 'from-me' : 'from-them'">
                                                <el-col :md="24" :sm="24" :xs="24">
                                                    <div :class="message.accountId === $auth.user().id ? 'pull-right' : 'pull-left'">
                                                        <div class="content">
                                                            <el-col class="text-section" :md="24" :sm="24" :xs="24">
                                                                <p>{{message.text}}</p>
                                                            </el-col>
                                                            <el-col :md="24" :sm="24" :xs="24">
                                                                <span class="pull-left">{{$moment(message.created_at).fromNow()}}</span>
                                                                <span class="pull-right">

                                                                <account-avatar :account="message.account" :size="25"/>
                                                              </span>
                                                            </el-col>
                                                        </div>
                                                    </div>
                                                </el-col>
                                            </el-row>
                                            <div id="view-scroll-section" ref="view-scroll-section"></div>


                                        </div>
                                    </el-scrollbar>
                                    <div class="input-pane">
                                        <el-form :model="message_frm" :rules="message_rules" class="message-typing-zone" ref="msg_frm">
                                            <el-form-item class="add-note-box" prop="text">
                                                <el-row>
                                                    <el-col :md="1" :sm="1" :xs="1" style="text-align: center">
                                                        <el-button class="attach-file" disabled icon="el-icon-paperclip" size="mini" type="text"/>
                                                    </el-col>
                                                    <el-col :md="18" :sm="18" :xs="18">
                                                        <el-input v-model="message_frm.text" prop="text" placeholder="Write your notes here" rows="2" type="textarea">
                                                        </el-input>
                                                    </el-col>

                                                    <el-col :md="4" :sm="4" :xs="4">
                                                        <el-button :disabled="empty_convo" @click="createMessage" round type="primary" class="send-message-button">
                                                            Send Message
                                                        </el-button>
                                                    </el-col>
                                                </el-row>
                                            </el-form-item>
                                        </el-form>
                                    </div>
                                </div>
                            </el-row>

                        </el-col>
                    </el-row>
                </div>
            </el-col>

            <el-dialog :append-to-body="true" :modal="true" :modal-append-to-body="false" :visible.sync="conversation_modal"
                       title="Create Conversation" width="30%" @close="clearFormValidation">
                <el-form :model="conversation_frm" label-position="top" :rules="conversation_rules" class="convo-modal-form" ref="conversation_frm">
                    <div class="modal-body">
                        <el-form-item label="Title" prop="title">
                            <el-input v-model="conversation_frm.title"></el-input>
                        </el-form-item>

                        <el-form-item label="Participants" prop="accountIds">
                            <el-select :loading-text="'Loading members..' " placeholder="Add member(s)" :remote-method="getAccounts" collapse-tags filterable multiple remote v-loading="loading" v-model="conversation_frm.accountIds">
                                <el-option :key="person.id" :label="person.name" :value="person.id" v-for="person in memberObjs"/>
                            </el-select>
                        </el-form-item>

                    </div>
                </el-form>

                <div slot="footer">
                    <el-button @click="clearFormValidation" round size="small">Cancel</el-button>
                    <el-button @click="createConversation" round size="small" type="primary">Create Conversation</el-button>
                </div>
            </el-dialog>
        </el-row>
    </div>
</template>

<script>

    import Avatar from 'vue-avatar'
    import AccountAvatar from "../../components/AccountAvatar.vue"

    export default {
        components: {
            Avatar, AccountAvatar
        },
        data() {
            return {
                send_text: '',
                options: [],
                value: [],
                loading: false,
                selectedMemberIds: [],
                memberObjs: {},
                empty_convo: false,
                conversation_modal: false,
                newConvoMembers: "",
                conversation_list: [],
                selected_convo: {},
                selected_convo_messages: [],
                require_participant: "",
                message_count: [],
                unread_data: [],
                message_frm: {
                    text: "",
                },
                message_rules: {
                    text: [
                        {
                            required: true,
                            message: "Message is required",
                            trigger: "blur"
                        }
                    ]
                },
                conversation_frm: {
                    title: "",
                    companyId: "",
                    accountIds: [],
                    isGroup: true,
                },
                conversation_rules: {
                    title: [
                        {
                            required: true,
                            message: "Conversation title is required",
                            trigger: "blur"
                        }
                    ],
                    accountIds: [
                        {
                            validator: (value, rule, callback) => {
                                if (this.conversation_frm.accountIds.length < 1) {
                                    return callback(new Error('Please select participant(s)'));
                                }
                                return callback();
                            }
                        }
                    ]

                }
            }
        },
        computed: {
            conversations() {
                return this.conversation_list.sort((a, b) => {
                    if (!a.latestMessage) {
                        return 1;
                    }
                    if (!b.latestMessage) {
                        return -1;
                    }
                    if (b.latestMessage.created_at > a.latestMessage.created_at) return 1;
                    if (b.latestMessage.created_at < a.latestMessage.created_at) return -1;
                    return 0;
                });
            },

            unread_count() {
                let count_val = 0;
                for (const i in this.unread_data) {
                    count_val += this.unread_data[i];
                }
                return count_val;
            }
        },
        mounted() {
            this.loadConversationList();
        },
        methods: {

            getAccounts(query) {
                if (query.length > 1) {
                    this.loading = true;
                    this.axios
                        .get('/companies/current/accounts', {
                            params: {
                                filter: {
                                    where: {
                                        or: [
                                            {
                                                email: {like: query, options: 'i'}
                                            },
                                            {
                                                first_name: {like: query, options: 'i'}
                                            },
                                            {
                                                last_name: {like: query, options: 'i'}
                                            },
                                        ],
                                        id: {nin: [this.$auth.user().id]}
                                    }
                                }
                            }
                        })
                        .then(res => {
                            this.memberObjs = res.data
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.loading = false
                        })
                }
            },
            getAccountsWithoutMembers(query) {

                var excludeList = JSON.parse(JSON.stringify(this.selected_convo.accountIds));
                excludeList.push(this.$auth.user().id);

                if (query.length > 1) {
                    this.loading = true;
                    this.axios
                        .get('/companies/current/accounts', {
                            params: {
                                filter: {
                                    where: {
                                        or: [
                                            {
                                                email: {like: query, options: 'i'}
                                            },
                                            {
                                                first_name: {like: query, options: 'i'}
                                            },
                                            {
                                                last_name: {like: query, options: 'i'}
                                            },
                                        ],
                                        id: {nin: excludeList}
                                    }
                                }
                            }
                        })
                        .then(res => {
                            this.memberObjs = res.data

                        })
                        .catch(err => {
                        })
                        .then(() => {
                            console.log(this.selected_convo);
                            this.loading = false
                        })
                }

            },
            createConversation() {

                this.$refs["conversation_frm"].validate(valid => {

                    if (valid) {
                        this.conversation_frm.companyId = this.$auth.user().companyId;
                        this.conversation_frm.accountIds.unshift(this.$auth.user().id);

                        this.loading = true;
                        this.axios
                            .post("/messaging_conversations", this.conversation_frm)
                            .then(res => {
                                this.loadConversationList();
                            })
                            .catch()
                            .then(() => {
                                this.loading = false;
                                this.conversation_modal = false
                            });
                    }

                });
            },

            clearFormValidation() {
                this.conversation_modal = false
                this.$refs["conversation_frm"].resetFields();
                this.$refs["conversation_frm"].clearValidate();
                this.require_participant = "";
            },

            getRecentActivityAccount(convo) {

                if (convo.latestMessage) {

                    let ac_data = convo.accounts.find(x => x.id === convo.latestMessage.accountId);
                    return ac_data
                }

                if (!convo.latestMessage) {
                    let ac_data = convo.accounts[convo.accounts.length - 1];
                    return ac_data;
                }
            },

            loadConversationList() {

                if (this.$auth.user().roleName === "Administrator") {
                    this.loading = true;

                    const convos = this.axios
                        .get("/messaging_conversations", {
                            params: {
                                filter: {
                                    include: ["accounts", "latestMessage", "latestReadActivity"],
                                }
                            }
                        });
                    const unread_counts = this.axios
                        .get("/messaging_conversations/unread-messages-count");

                    this.axios.all([convos, unread_counts]).then(this.axios.spread((...res) => {

                        if (res[0].data.length) {
                            this.conversation_list = res[0].data;
                            this.selected_convo = res[0].data;
                            this.unread_data = res[1].data;
                            this.selectConversation(this.conversations[0]["id"])
                        } else {
                            this.empty_convo = true;
                        }

                    })).catch(err => {
                    })
                        .then(() => {
                            this.loading = false;
                        });
                }

                if (this.$auth.user().roleName !== "Administrator") {
                    this.loading = true;

                    const convos = this.axios
                        .get("/messaging_conversations", {
                            params: {
                                filter: {
                                    include: ["accounts", "latestMessage", "latestReadActivity"],
                                    where: {
                                        accountIds: {inq: [this.$auth.user().id]}
                                    }
                                }
                            }
                        });
                    const unread_counts = this.axios
                        .get("/messaging_conversations/unread-messages-count");

                    this.axios.all([convos, unread_counts]).then(this.axios.spread((...res) => {

                        if (res[0].data.length) {
                            this.conversation_list = res[0].data;
                            this.selected_convo = res[0].data;
                            this.unread_data = res[1].data;
                            this.selectConversation(this.conversations[0]["id"])
                        } else {
                            this.empty_convo = true;
                        }

                    })).catch(err => {
                    })
                        .then(() => {
                            this.loading = false;
                        });

                }
            },

            selectConversation(id) {
                this.$refs["msg_frm"].clearValidate();
                this.loading = true;
                const one_convo = this.axios
                    .get("/messaging_conversations/" + id, {
                        params: {
                            filter: {
                                include: ["accounts", "messages", "latestMessage", "latestReadActivity"]
                            }
                        }
                    });

                const convo_messages = this.axios.get("/messaging_messages/", {
                    params: {
                        filter: {include: ["account", "activities"], where: {conversationId: id}}
                    }
                });

                this.axios.all([one_convo, convo_messages]).then(this.axios.spread((...resps) => {
                    this.selected_convo = resps[0].data;
                    this.selected_convo_messages = resps[1].data;
                    this.scrollToEnd();
                })).catch(err => {
                }).then(() => {
                    this.loading = false;
                });
            },

            addAccountToConversation() {

                if (this.newConvoMembers.length && this.newConvoMembers.length > 0) {
                    this.loading = true;

//            let newMemberIds =  this.selected_convo.accountIds;
                    this.newConvoMembers.forEach((val) => {
                        this.selected_convo.accountIds.push(val);
                    });

                    this.axios
                        .patch("/messaging_conversations/" + this.selected_convo.id, {accountIds: this.selected_convo.accountIds})
                        .then(res => {
                            this.loadConversationList();
                            this.newConvoMembers = [];
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.loading = false;
                        });
                }


            },

            scrollToEnd() {
                var element = document.getElementById("list-messages-reference");
                element.scrollIntoView({behavior: "smooth", block: "start", inline: "end"});

            },

            createMessage() {

                this.message_frm.companyId = this.$auth.user().companyId;
                this.message_frm.accountId = this.$auth.user().id;
                this.message_frm.conversationId = this.selected_convo.id;

                this.selected_convo_messages.push(JSON.parse(JSON.stringify(this.message_frm)));

                this.scrollToEnd();

                this.loading = true;

                this.axios
                    .post("/messaging_messages", this.message_frm)
                    .then(res => {
                        this.message_frm.text = "";
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false;
                    })
            },


            remoteMethod(query) {
                if (query !== '') {
                    this.loading = true
                    setTimeout(() => {
                        this.loading = false
                        this.options = this.list.filter(item => {
                            return item.label.toLowerCase()
                                .indexOf(query.toLowerCase()) > -1
                        })
                    }, 200)
                } else {
                    this.options = []
                }
            }
        }
    }
</script>

<style lang="scss">
    .l27-dashboard-inbox {
        padding: 0px;
        background: #f4f8f9;
        height: calc(100vh - 150px);

        .l27-inbox-page-wrap {

            .left-list-pane {
                padding-top: 20px;
                min-height: calc(100vh - 100px);

                .nip-sides {
                    padding: 0 20px;
                }

                h4 {
                    margin: 0;
                    padding: 0;
                    line-height: 1.5;

                    i {
                        font-size: 20px;
                        color: #30DB2E;
                    }
                }

                .inbox-search-box {
                    width: 260px;
                    border-radius: 50px;

                    .el-input__inner {
                        border-radius: 50px;

                        -webkit-box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
                        box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
                        border: 0;
                    }
                }

                .people-list {
                    list-style: none;
                    padding: 0;

                    p {
                        margin: 0;
                        padding: 0;
                        line-height: 1;
                    }

                    li {
                        padding: 10px 5px;
                        cursor: pointer;

                        .nip-sides {
                            padding: 0 10px;

                            .avatar-zone, .detail-zone {
                                overflow: hidden;
                                display: inline-block;
                            }

                            .avatar-zone {
                                width: 40px;
                                margin-bottom: 2px;
                            }

                            .detail-zone {
                                width: calc(100% - 50px);
                                padding-right: 10px;

                                * {
                                    font-size: 10px;
                                }
                            }
                        }

                        &.active {
                            background-color: #F4FBFF;
                            border-left: 5px solid #2EB7FC;
                            padding-left: 0;
                        }

                    }
                }
            }

            .l27-inbox-page-right {
                .nip-sides {
                    padding: 0 20px;
                }

                .right-pane-header {
                    padding: 20px;
                    background-color: white;
                    border-bottom: 1px solid #E6EEF2;
                    display: flex;

                    h4, p {
                        margin: 0;
                        padding: 0;
                        line-height: 1.5;
                    }

                    .avatar-area {
                        display: flex;
                        align-items: center;

                        .profile-avatar {
                            margin-right: 5px;
                        }

                        a {
                            color: #30DB2E;
                        }
                    }

                    .title-area {
                        p, h4 {
                            font-size: 12px;
                        }

                        .date-time-location {
                            font-size: 12px;
                        }
                    }

                    .button-area {
                        display: flex;
                        align-items: center;

                        button {
                            -webkit-box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
                            box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
                        }
                    }
                }

                .right-pane-messages {
                    background-color: white;

                    .messages-section {
                        display: flex;
                        flex-direction: column;
                        height: 100%;

                        .messages-pane {
                            flex-grow: 8;
                            overflow-y: scroll;
                            overflow: auto;
                            display: flex;
                            flex-direction: column;

                            .from-me {
                                padding: 20px 40px;

                                .pull-right {
                                    width: 50%;

                                    .content {
                                        overflow: hidden;

                                        .text-section {
                                            border: none;
                                            background-color: #E6F5FC;
                                            padding: 20px;
                                            border-radius: 20px 20px 0 20px;
                                            margin-bottom: 10px;

                                            p {
                                                margin: 0;
                                            }
                                        }

                                        span.pull-right {
                                            width: auto;
                                        }

                                        .attachment {
                                            img {
                                                border-radius: 20px 20px 0 20px;
                                            }
                                        }
                                    }
                                }
                            }

                            .from-them {
                                padding: 20px 40px;

                                .pull-left {
                                    width: 50%;

                                    .content {
                                        overflow: hidden;

                                        .text-section {
                                            border: 1px solid #E6EEF1;
                                            padding: 20px;
                                            border-radius: 20px 20px 20px 0;
                                            margin-bottom: 10px;

                                            p {
                                                margin: 0;
                                            }
                                        }

                                        .attachment {
                                            border-radius: 20px 20px 20px 0;
                                        }
                                    }
                                }

                            }

                        }

                        .input-pane {

                            .message-typing-zone {
                                .add-note-box {
                                    margin-bottom: 0;

                                    .attach-file {
                                        i {
                                            font-size: 20px;
                                        }
                                    }


                                    .el-form-item__content {
                                        border-radius: 0;
                                        border: 1px none #e2e2e2;
                                        border-top-style: solid;
                                        padding: 15px 10px;

                                        .el-textarea {
                                            textarea {
                                                padding: 5px 0;
                                            }
                                        }
                                    }

                                    .send-message-button span {
                                        color: white;
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
    }

    .convo-modal-form {
        /*background-color: blue;*/
    }

    ::-webkit-scrollbar {
        width: 0px;  /* Remove scrollbar space */
        background: transparent;  /* Optional: just make scrollbar invisible */
    }


</style>
