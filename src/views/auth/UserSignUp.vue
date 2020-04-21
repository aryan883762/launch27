<template>
    <div class="user-signup-container signin-page unauth  flex-row-center">
        <el-row>
            <el-col :md="12" :sm="12" class="svg-section">
                <img class="svg-logo" src="@/assets/svgs/logo.svg" svg-inline/>
                <img class="main-illus" src="@/assets/svgs/signup/Signup_team_step1.svg" svg-inline/>
            </el-col>
            <el-col :md="12" :sm="12" class="form-section">
                <div class="form-section-wrapper full-width">
                    <h2>Welcome {{model.first_name}}!</h2>
                    <p class="frm-message">Your company <strong>{{model.business_name}}</strong> has invited you as a
                        team member</p>

                    <el-form :model="model" :rules="rules" ref="account_signup_frm" label-position="top">
                        <el-row :gutter="20">
                            <el-col :md="12" :sm="12">
                                <h4>Personal Information</h4>

                                <el-form-item>
                                    <el-input disabled type="text" v-model="model.fullname"></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-input disabled type="email" v-model="model.email"></el-input>
                                </el-form-item>
                                <el-form-item prop="password">
                                    <el-input placeholder="minimum of 6 characters" show-password type="password"
                                              v-model="model.password"></el-input>
                                </el-form-item>
                                <el-form-item prop="confirm">
                                    <el-input placeholder="repeat password" show-password type="password"
                                              v-model="model.confirm"></el-input>
                                </el-form-item>

                            </el-col>
                            <el-col :md="8" :sm="8">
                                <h4>Upload your photo</h4>
                                <el-form-item prop="avatar">
                                    <el-upload
                                            :action="getFileUrl()"
                                            :before-upload="beforeUpload"
                                            :headers="getHeaders()" :on-error="uploadError"
                                            :on-progress="uploadProgress" :on-success="uploadSuccess"
                                            :show-file-list="true"
                                            class="avatar-uploader">
                                        <el-avatar :size="178" :src="avatar" fit="contain" shape="square">
                                            <i class="el-icon-plus avatar-uploader-icon" v-if="!avatar"></i>
                                        </el-avatar>
                                        <small style="display: block;">Click to change</small>
                                    </el-upload>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-divider></el-divider>
                        <el-row class="button-area">
                            <el-button @click="updateAccount()" class="center" round size="small" type="primary">
                                Get Started
                            </el-button>
                        </el-row>
                    </el-form>
                </div>
            </el-col>
        </el-row>
    </div>

</template>

<script>
    export default {
        data() {
            return {
                loading: true,
                selected_loading: false,
                selected_template: "",
                access_token: false,
                model: {
                    first_name: '',
                    last_name: '',
                    email: '',
                    fullname: '',
                    avatar: '',
                    password: '',
                    confirm: ''
                },
                rules: {
                    password: [
                        {message: "Password is required", trigger: "blur", required: true}
                    ],
                    confirm: [{
                        validator: (rule, value, callback) => {
                            if (value !== this.model.password) {
                                return callback(new Error("Passwords mismatch"))
                            }
                            return callback()
                        },
                        trigger: "blur"
                    }],
                    avatar: [
                        {
                            validator: (rule, value, callback) => {
                                if (!this.avatar) {
                                    return callback(new Error("Profile image is required"))
                                }
                                return callback()
                            },
                            trigger: "blur"
                        }
                    ]
                },
                avatar: ''
            };
        },

        mounted() {
            this.loading = true;

            this.axios.get('/status')

            if (this.$route.query.id && this.$route.query.access_token) {
                this.access_token = this.$route.query.access_token
                this.axios.get('/signup-user-details/' + this.$route.query.id)
                    .then(res => {
                        this.model = res.data
                    })
                    .catch()
                    .then()
            } else {
                //redirect user back to login
            }
        },

        methods: {
            getHeaders() {
                return {Authorization: this.access_token};
            },
            getFileUrl() {
                return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
            },

            uploadSuccess(res, file) {
                this.model.avatar = "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name;
                this.avatar = this.model.avatar
                this.loading = false;
            },

            uploadError() {
                this.loading = false;
            },

            beforeUpload() {
                this.loading = true;
                return true;
            },

            uploadProgress(event, file, fileList) {
            },

            updateAccount() {

                let updateAvatar = () => {
                    return new Promise((resolve, reject) => {
                        this.axios.patch('/accounts/' + this.$route.query.id + '?access_token=' + this.access_token,
                            {
                                avatar: this.model.avatar,
                                confirmed: true
                            })
                            .then((res) => {
                                resolve()
                            })
                            .catch(err => {
                                reject(err)
                            })
                    })
                }

                let updateCredential = () => {
                    return new Promise((resolve, reject) => {
                        this.axios.post('/accounts/reset-password?access_token=' + this.access_token, {newPassword: this.model.password})
                            .then(res => {
                                resolve()
                            })
                            .catch(err => {
                                reject(err)
                            })

                    })
                }

                this.$refs.account_signup_frm.validate((valid) => {
                    if (valid) {
                        (async () => {
                            try {
                                await updateAvatar()
                                await updateCredential()

                                this.$helpers.successHandle("Password has been successfully changed", this)
                                this.$router.push({name: 'login'})

                            } catch (err) {
                                console.log(err)
                                this.$helpers.errorHandle(err, this)
                            }


                        })()
                    }
                })


            }
        }
    };
</script>

<style lang="scss">
    .user-signup-container {
        // display: flex;
        // justify-content: center;
        // flex-direction: column;
        // text-align: center;
        // height: calc(100%);


        .el-avatar {
            img {
                width: 100%;
            }
        }

        .avatar-uploader .el-upload {
            border: none;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            margin: 0 auto 40px;
            display: block;
        }

        .avatar-uploader .el-upload:hover {
            border-color: #409eff;
        }

        .avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            line-height: 178px;
            text-align: center;
        }

        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }
    }


</style>
