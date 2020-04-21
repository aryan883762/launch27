<template>
    <div style="display: inline-block;">
        <el-popover
                placement="bottom"
                title=""
                width="400"
                trigger="click">

            <el-select :loading-text="'Loading members..' " placeholder="Add member(s)" :remote-method="getAccounts" size="mini" style="width: 100%" collapse-tags filterable multiple remote v-loading="loading" :value="selectedPeopleIds">
                <el-option :key="person.id" :label="person.name" :value="person.id" v-for="person in peopleObjs"/>
            </el-select>
            <el-button style="font-size: 18px" slot="reference" class="text-button" icon="el-icon-user-solid" size="large" type="text"></el-button>
        </el-popover>
    </div>
</template>

<script>
    import AccountAvatar from "./AccountAvatar";

    export default{
        components: {AccountAvatar},
        name: 'people-select',
        props: {
            value: {
                type: Object,
            }
        },

        data (){
            return{
                selectedPeopleIds:[],
                peopleObjs:{},
                loading: false
            }
        },
        methods:{
            getAccounts(query) {
                if(query.length >1){
                    this.loading = true;
                    this.axios
                        .get('/companies/current/accounts',{
                            params: {
                                filter: {
                                    where: {
                                        or: [
                                            {
                                                email: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                first_name: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                            {
                                                last_name: {
                                                    like: query,
                                                    options: 'i'
                                                }
                                            },
                                        ],
                                        id:{nin:[this.$auth.user().id]}
                                    }
                                }
                            }
                        })
                        .then(res => {
                            this.peopleObjs = res.data
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.loading = false
                        })
                }
            },
        }
    }
</script>

