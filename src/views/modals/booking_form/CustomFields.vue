<template>
    <div>
        <el-divider content-position="left" v-if="model.customFields.components && Object.keys(model.customFields.components).length > 0 && model.customFields.components.constructor === Object ">Additional Information</el-divider>
        <p v-else>No custom fields defined for this account</p>

        <el-form :model="model" :rules="rules" label-position="top" ref="form">

            <el-form-item :label="field.attributes.label" v-for="(field, index) in model.customFields.components"
                          v-if="model.customFields  && model.customFields.components">

                <el-input :placeholder="field.attributes.placeholder" v-if="field.type === 'textfield' && !field.fieldType" v-model="field.value"></el-input>

                <el-input :placeholder="field.attributes.placeholder" type="textarea" v-if="field.type === 'textarea'" v-model="field.value"></el-input>

                <el-select :placeholder="field.attributes.placeholder" v-if="field.type === 'select'" v-model="field.value">
                    <el-option :label="option.label" :value="option.value" v-for="option in field.attributes.options"></el-option>
                </el-select>

                <el-date-picker :placeholder="field.attributes.placeholder" v-if="field.type === 'textfield' && field.fieldType === 'date'" v-model="field.value"></el-date-picker>

                <time-picker v-model="field.value" v-if="field.type === 'textfield' && field.fieldType === 'time'"></time-picker>

                <el-checkbox-group v-model="field.value" v-if="field.type === 'checkbox'">
                    <el-checkbox :label="option.value" v-for="option in field.attributes.options">{{option.label}}</el-checkbox>
                </el-checkbox-group>

                <el-radio-group v-if="field.type === 'radio'" v-model="field.value">
                    <el-radio :label="option.value" v-for="option in field.attributes.options">{{option.label}}</el-radio>
                </el-radio-group>

            </el-form-item>


        </el-form>
    </div>

</template>

<script>
    import TimePicker from "../../../components/TimePicker";

    export default {
        components: {TimePicker},
        data: () => {
            return {
                model: {
                    customFields: false
                },
                rules: {}
            };
        },

        mounted() {
            this.axios.get('/companies/current/booking_form')
                .then(res => {
                    if (res.data.customFields) {
                        for (let x in res.data.customFields.components) {
                            let field = res.data.customFields.components[x]
                            if (field.type === 'checkbox') {
                                field.value = []
                            } else {
                                field.value = ""
                            }
                        }

                        this.model.customFields = res.data.customFields
                        console.log(this.model.customFields)
                    }
                })
                .catch(err => {
                    //this.$helpers.errorHandle('No custom fields defined')
                })
                .finally(() => {

                })
        },
        methods: {
            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        this.$emit("on-validate", valid, this.model);
                        resolve(valid);
                    });
                });
            }
        }
    };
</script>

<style lang="scss"></style>
