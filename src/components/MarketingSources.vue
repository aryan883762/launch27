<template>
    <el-select @change="changed" v-model="source">
        <el-option label="Yelp" value="Yelp"></el-option>
        <el-option label="Thumbtack" value="Thumbtack"></el-option>
        <el-option label="Search Engine" value="Search Engine"></el-option>
        <el-option label="Google Adwords" value="Google Adwords"></el-option>
        <el-option label="Facebook" value="Facebook"></el-option>
        <el-option label="Referred by a Friend" value="Referred by a Friend"></el-option>
        <el-option label="Direct Mail" value="Direct Mail"></el-option>
        <el-option label="Angieslist" value="Angieslist"></el-option>
        <el-option label="Nextdoor" value="Nextdoor"></el-option>
        <el-option label="Home Advisor" value="Home Advisor"></el-option>
        <el-option label="Bark" value="Bark"></el-option>
        <el-option label="Craigslist" value="Craigslist"></el-option>
    </el-select>
</template>


<script>
    export default {
        props: {
            value: {
                required: true
            }
        },
        data() {
            return {
                source: ''
            }
        },
        mounted() {
            this.source = this.value
        },
        methods: {
            changed(val) {
                this.$emit('input', val)
            }
        }
    }
</script>