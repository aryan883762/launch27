<template>
    <el-col :md="col_span" :sm="col_span" :xs="24" class="">
        <div :class="{'border-shadow': show_border}" class="bg-white padding-2x side-help" v-if="sidehelpData">
            <el-card :body-style="{padding: '5px'}" v-if="sidehelpData.videoId">
                <youtube :video-id="sidehelpData.videoId" ref="youtube"></youtube>
            </el-card>
            <div class="help-content" v-html="sidehelpData.content"></div>
        </div>
        <div :class="{'border-shadow': show_border}" class="bg-white padding-2x side-help" v-else>
            <el-card :body-style="{padding: '5px'}">
                <youtube ref="youtube" video-id="zzfypSTaX6k"></youtube>
            </el-card>
            <div class="help-content" v-html="default_content"></div>
        </div>
    </el-col>

</template>

<script>

    export default {
        name: "SideHelp",
        props: {
            show_border: {
                type: Boolean,
                default: () => {
                    return true
                }
            },
            sidehelpKey: {
                type: String
            },
            sidehelp: {
                type: Object
            },
            col_span: {
                type: Number,
                default: 8
            }
        },

        data() {
            return {
                guide: null,
                default_content: '      <p>You can invite people via the action button on the dashboard or on the people page. The people page will have all people (customers, staff, teams) but you can also filter. The default filter will be on customer.</p>\n' +
                    '\n' +
                    '      <p>When you press the add button it will ask you the role of the person you are inviting as well as show you default permissions which you can adjust.</p>\n' +
                    '\n' +
                    '      <p>Note: Address field should autofill, Login/Sign up via FB, Google or email. This leads to onbording for this timers users. Bulk important customers/teams via csv.</p>'
            }
        },

        computed: {
            sidehelpData() {
                if (this.sidehelp) {
                    return this.sidehelp;
                } else {
                    return this.guide;
                }
            }
        },

        mounted() {
            if (!this.sidehelp) {
                let key = this.$route.name;
                if (this.sidehelpKey) {
                    key = this.sidehelpKey;
                }
                //get the content for this panels
                this.axios.get('/sidehelps/guides/' + key)
                    .then(res => {
                        this.guide = res.data;
                    });
                this.axios.get('/sidehelps')
                    .then(res => {
                        console.log(res.data);
                    });
            }
        }
    };
</script>

<style lang="scss">
    .side-help {
        height: calc(100%);
        box-sizing: border-box;

        .video-image {
            width: 100%;
        }

        iframe {
            max-width: 100%;
            height: 25vh;
        }

        .help-content {
            margin-top: 20px;
            word-break: break-word;
            line-height: 2;
        }
    }
</style>
