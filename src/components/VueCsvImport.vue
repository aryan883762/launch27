<template>
    <div class="vue-csv-uploader">
        <div class="form">
            <div class="vue-csv-uploader-part-one">
                <div style="color:red">{{validateError}}</div>
                <div class="form-check form-group csv-import-checkbox" v-if="headers === null">
                    <slot :headers="hasHeaders" :toggle="toggleHasHeaders" name="hasHeaders">
                        <input :class="checkboxClass" :id="makeId('hasHeaders')" :value="hasHeaders" @change="toggleHasHeaders" type="checkbox">
                        <label :for="makeId('hasHeaders')" class="form-check-label">
                            File Has Headers
                        </label>
                    </slot>
                </div>
                <div class="form-group csv-import-file">

                    <input :class="inputClass" @change.prevent="validFileMimeType" name="csv" ref="csv" type="file">

                    <div style="margin-top: 10px;" v-if="false">
                        <el-checkbox v-model="updateRecords">Update existing records</el-checkbox>
                        <i>(i.e. records that already exist will be updated with values from your CSV based on emails)</i>
                    </div>

                    <slot name="error" v-if="showErrorMessage">
                        <div class="invalid-feedback d-block">
                            File type is invalid
                        </div>
                    </slot>
                </div>
                <el-divider></el-divider>
                <div class="form-group">
                    <slot :load="load" name="next">
                        <el-button :class="buttonClass" :disabled="disabledNextButton" @click.prevent="load" round size="mini" type="primary">
                            {{ loadBtnText }}
                        </el-button>
                    </slot>
                </div>
            </div>
            <div class="vue-csv-uploader-part-two">
                <div class="vue-csv-mapping" v-if="sample">
                    <table :class="tableClass" class="el-table">
                        <slot name="thead">
                            <thead>
                            <tr>
                                <th>Field</th>
                                <th>CSV Column</th>
                            </tr>
                            </thead>
                        </slot>
                        <tbody>
                        <tr :class="{'error': mapErrors.find((x) => {return x === field.label}) }" :key="key" v-for="(field, key) in fieldsToMap">
                            <td>{{ field.label }} <span v-if="requiredFields.find((x)=> {return x === field.label})">*</span></td>
                            <td>
                                <el-select clearable :name="`csv_uploader_map_${key}`" class="form-control" v-model="map[field.key]">
                                    <el-option :key="key" :label="column" :value="key" v-for="(column, key) in firstRow">{{ column }}</el-option>
                                </el-select>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <el-divider></el-divider>

                    <div class="form-group" v-if="url">
                        <el-button :class="buttonClass" :value="submitBtnText" @click="submit" round size="small" type="danger"> Import File</el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import Papa from 'papaparse';
    import mimeTypes from "mime-types";
    import validator from 'validator'

    export default {
        props: {
            value: Array,
            url: {
                type: String
            },
            mapFields: {
                required: true
            },
            callback: {
                type: Function,
                default: () => ({})
            },
            catch: {
                type: Function,
                default: () => ({})
            },
            finally: {
                type: Function,
                default: () => ({})
            },
            parseConfig: {
                type: Object,
                default() {
                    return {};
                }
            },
            headers: {
                default: null
            },
            loadBtnText: {
                type: String,
                default: "Next"
            },
            submitBtnText: {
                type: String,
                default: "Submit"
            },
            tableClass: {
                type: String,
                default: "table"
            },
            checkboxClass: {
                type: String,
                default: "form-check-input"
            },
            buttonClass: {
                type: String,
                default: "btn btn-primary"
            },
            inputClass: {
                type: String,
                default: "form-control-file"
            },
            validation: {
                type: Boolean,
                default: true,
            },
            fileMimeTypes: {
                type: Array,
                default: () => {
                    return ["text/csv", "text/x-csv", "application/vnd.ms-excel", "text/plain"];
                }
            },
            requiredFields: {
                type: Array,
                required: true
            },
            role: {
                type: String,
            }
        },

        data: () => ({
            form: {
                csv: null,
            },
            fieldsToMap: [],
            map: {},
            hasHeaders: true,
            csv: null,
            sample: null,
            isValidFileMimeType: false,
            fileSelected: false,
            validateError: "",
            mapErrors: [],
            updateRecords : true
        }),

        created() {
            this.hasHeaders = this.headers;

            if (_.isArray(this.mapFields)) {
                this.fieldsToMap = _.map(this.mapFields, (item) => {
                    return {
                        key: item,
                        label: item
                    };
                });
            } else {
                this.fieldsToMap = _.map(this.mapFields, (label, key) => {
                    return {
                        key: key,
                        label: label
                    };
                });
            }
        },

        methods: {
            submit() {
                const _this = this;
                this.form.csv = this.buildMappedCsv();
                this.$emit('input', this.form.csv);

                this.validateError = ""
                this.mapErrors = []
                let valid = true;

                this.form.role = this.role
                this.form.update = this.updateRecords

                //validate csv make sure that all required fields are provided

                for (let x = 0; x < this.form.csv.length; x++) {
                    let data = JSON.parse(JSON.stringify(this.form.csv[x]))

                    //first make sure it's not an empty data

                    if (_.isEmpty(data)) {
                        this.mapErrors = this.requiredFields
                        this.validateError = "You must provide mappings"
                        return;
                        break;
                    }

                    this.requiredFields.forEach((field) => {

                        if (!data.hasOwnProperty(field)) {
                            valid = false
                            this.mapErrors.push(field)
                        }

                        if (data[field] && validator.isEmpty(data[field])) {
                            valid = false
                        }

                        if (field === 'email') {
                            //validate email
                            if (!validator.isEmail(data[field])) {
                                valid = false
                                this.validateError = "Field " + field + ' contains invalid email at file position ' + (x + 1) + ' with value ' + data[field]
                            }
                        }
                    })

                    if (!valid) break;
                }


                if (!valid) {
                    if (this.validateError.trim() === '')
                        this.validateError = "Some required fields are missing, please check your csv and import again"
                    return;
                }

                if (this.url) {
                    this.axios.post(this.url, this.form).then(response => {
                        _this.callback(response);
                    }).catch(response => {
                        _this.catch(response);
                    }).finally(response => {
                        _this.finally(response);
                    });
                } else {
                    _this.callback(this.form.csv);
                }
            },
            buildMappedCsv() {
                const _this = this;

                let csv = this.hasHeaders ? _.drop(this.csv) : this.csv;

                return _.map(csv, (row) => {
                    let newRow = {};

                    _.forEach(_this.map, (column, field) => {
                        _.set(newRow, field, _.get(row, column));
                    });

                    return newRow;
                });
            },
            validFileMimeType() {
                let file = this.$refs.csv.files[0];
                const mimeType = file.type === "" ? mimeTypes.lookup(file.name) : file.type;

                if (file) {
                    this.fileSelected = true;
                    this.isValidFileMimeType = this.validation ? this.validateMimeType(mimeType) : true;
                } else {
                    this.isValidFileMimeType = !this.validation;
                    this.fileSelected = false;
                }
            },
            validateMimeType(type) {
                return this.fileMimeTypes.indexOf(type) > -1;
            },
            load() {
                const _this = this;

                this.readFile((output) => {
                    _this.sample = _.get(Papa.parse(output, {preview: 2, skipEmptyLines: true}), "data");
                    _this.csv = _.get(Papa.parse(output, {skipEmptyLines: true}), "data");
                });
            },
            readFile(callback) {
                let file = this.$refs.csv.files[0];

                if (file) {
                    let reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = function (evt) {
                        callback(evt.target.result);
                    };
                    reader.onerror = function () {
                    };
                }
            },
            toggleHasHeaders() {
                this.hasHeaders = !this.hasHeaders;
            },
            makeId(id) {
                return `${id}${this._uid}`;
            }
        },
        watch: {
            map: {
                deep: true,
                handler: function (newVal) {
                    if (!this.url) {
                        let hasAllKeys = Array.isArray(this.mapFields) ? _.every(this.mapFields, function (item) {
                            return newVal.hasOwnProperty(item);
                        }) : _.every(this.mapFields, function (item, key) {
                            return newVal.hasOwnProperty(key);
                        });

                        if (hasAllKeys) {
                            this.submit();
                        }
                    }
                }
            }
        },
        computed: {
            firstRow() {
                return _.get(this, "sample.0");
            },
            showErrorMessage() {
                return this.fileSelected && !this.isValidFileMimeType;
            },
            disabledNextButton() {
                return !this.isValidFileMimeType;
            }
        },
    };
</script>

<style lang="scss">
    .vue-csv-uploader {
        table {
            tr {
                &.error {
                    color: red;
                }
            }
        }
    }
</style>
