<template>
    <div :class="bodyClass" :style="getStyle()" class="account-avatar">
        <el-avatar :size="size" :src="account.avatar" class="profile-avatar" fit="contain" style="margin-right: 10px;" v-if="account.avatar"/>
        <avatar :backgroundColor="account.color || 'black'" :size="size" :username="account.fullname || account.name" class="pull-left profile-avatar" color="white" style="margin-right: 10px;" v-if="!account.avatar"/>
        <i class="el-icon-caret-bottom" v-if="show_caret"></i>
    </div>
</template>

<script>
    import Avatar from 'vue-avatar'

    export default {
        components: {
            Avatar
        },
        props: {
            account: {
                type: Object,
                required: true
            },
            size: {
                type: Number,
                default: 32
            },
            show_caret: {
                type: Boolean,
                default: false
            },
            bodyClass: {
                type: String
            }
        },
        methods: {
            getStyle() {
                return {
                    height: this.size + 'px',
                    width: this.size + 'px'
                }
            }
        }
    }
</script>

<style lang="scss">
    .account-avatar {
        .profile-avatar {
            margin-right: 10px;
        }
    }
</style>
