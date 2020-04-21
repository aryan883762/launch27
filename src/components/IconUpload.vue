<template>
    <div>
        <el-tabs class="icon-selector-tab" style="position: relative" v-model="selectedTab" :stretch="true" tab-position="left" @tab-click="handleTabClick">
            <el-tab-pane v-loading="loading" :lazy="true" label="Bathroom" name="Bathroom">
                <el-card @click.native="selectIcon(img)" :class="'img-card ' + (selectedImg.id === img.id ? 'selected' : '' )" v-for="img in imageList"><img width="48px" height="48px" :src="img.url" :alt="img.group"></el-card>
            </el-tab-pane>
            <el-tab-pane v-loading="loading" label="Garage" name="Garage">
                <el-card @click.native="selectIcon(img)" :class="'img-card ' + (selectedImg.id === img.id ? 'selected' : '' )" v-for="img in imageList"><img width="48px" height="48px" :src="img.url" :alt="img.group"></el-card>
            </el-tab-pane>
            <el-tab-pane v-loading="loading" label="Laundry" name="Laundry">
                <el-card @click.native="selectIcon(img)" :class="'img-card ' + (selectedImg.id === img.id ? 'selected' : '' )" v-for="img in imageList"><img width="48px" height="48px" :src="img.url" :alt="img.group"></el-card>
            </el-tab-pane>
            <el-tab-pane v-loading="loading" label="Lawn" name="Lawn">
                <el-card @click.native="selectIcon(img)" :class="'img-card ' + (selectedImg.id === img.id ? 'selected' : '' )" v-for="img in imageList"><img width="48px" height="48px" :src="img.url" :alt="img.group"></el-card>
            </el-tab-pane>
            <el-tab-pane v-loading="loading" label="Move" name="Move">
                <el-card @click.native="selectIcon(img)" :class="'img-card ' + (selectedImg.id === img.id ? 'selected' : '' )" v-for="img in imageList"><img width="48px" height="48px" :src="img.url" :alt="img.group"></el-card>
            </el-tab-pane>
            <el-tab-pane v-loading="loading" label="Paint" name="Paint">
                <el-card @click.native="selectIcon(img)" :class="'img-card ' + (selectedImg.id === img.id ? 'selected' : '' )" v-for="img in imageList"><img width="48px" height="48px" :src="img.url" :alt="img.group"></el-card>
            </el-tab-pane>
            <el-tab-pane v-loading="loading" label="Pets" name="Pets">
                <el-card @click.native="selectIcon(img)" :class="'img-card ' + (selectedImg.id === img.id ? 'selected' : '' )" v-for="img in imageList"><img width="48px" height="48px" :src="img.url" :alt="img.group"></el-card>
            </el-tab-pane>
            <el-tab-pane v-loading="loading" label="Windows" name="Windows">
                <el-card @click.native="selectIcon(img)" :class="'img-card ' + (selectedImg.id === img.id ? 'selected' : '' )" v-for="img in imageList"><img width="48px" height="48px" :src="img.url" :alt="img.group"></el-card>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>


<script>
    export default {
        name: "icon-upload",
        props: {
            value:{
                type: Object
            }

        },
        data(){
            return {
                imageList:[],
                loading: false,
                selectedTab: "Bathroom",
                selectedImg: {
                    id: '',
                    url: ''
                }
            }
        },
        created(){
            this.loadDefaultIcons();
        },
        methods: {
            loadDefaultIcons(){
                this.loading = true;
                this.axios.get('/default_icons',{
                    params: {
                        filter: {
                            where: {group: this.selectedTab}
                        }
                    }
                })
                .then(res => {
                    this.imageList = res.data;
                })
                .catch(err => {
                    this.$helpers.errorHandle(err, this)
                })
                .then(() => {
                    this.loading = false
                })
            },

            handleTabClick(tab, event){
                this.selectedTab = tab.name;
                this.loadDefaultIcons()
            },
            selectIcon(img){
                this.selectedImg = img;
                this.$emit('input', img);
                this.$emit('change', img)
            }
        }
    }
</script>

<style lang="scss">
    .icon-selector-tab{

        .el-tab-pane{
            max-height: 400px;
            height: 100%;
            overflow-y: scroll;
            margin-left: 10px;
        }
        .img-card{
            max-width: 100px;
            display: inline-block;
            margin-right: 15px;
        }
        .img-card.selected{
            background-color: #62a77e3b;
        }

    }
</style>