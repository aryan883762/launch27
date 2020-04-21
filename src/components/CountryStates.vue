<template>
    <el-form label-position="top" v-loading="loading">
        <el-form-item label="State/Region" v-if="label">
            <el-select :disabled="disabled" @change="selectState" filterable name="state" v-model="state">
                <el-option key="00" value="--" label="-not applicable-" v-if="states.length === 0"></el-option>
                <el-option :key="getKey()" :label="state.name" :value="state.state_code"
                           v-for="state in states"/>
            </el-select>
        </el-form-item>
        <el-select v-else :disabled="disabled" @change="selectState" filterable name="state" v-model="state">
            <el-option key="00" value="--" label="-not applicable-" v-if="states.length === 0"></el-option>
            <el-option :key="getKey()" :label="state.name" :value="state.state_code" v-for="state in states"/>
        </el-select>
    </el-form>
</template>

<script>
    const uuidv1 = require('uuid/v1');

    export default {
        props: {
            value: {
                required: true
            },
            disabled: {
                default: false
            },
            label: {
                type: Boolean,
                default: true
            }
        },
        watch: {
            value(val) {
                this.state = this.value
            }
        },
        data() {
            return {
                states: [],
                loading: true,
                state: ''
            }
        },
        created() {
            this.state = this.value
        },
        mounted() {
            this.axios.get('/companies/current/states')
                .then(res => {
                    this.states = res.data
                    if (this.states.length === 0) {
                        this.state = "--"
                        this.$emit('input', '--')
                    }
                })
                .catch(err => {
                })
                .then(() => {
                    this.loading = false
                })
        },
        methods: {
            selectState(val) {
                this.$emit('input', val)
                this.$emit('focus')
            },
            getKey(id) {
                return uuidv1()
            }
        }
    }
</script>
