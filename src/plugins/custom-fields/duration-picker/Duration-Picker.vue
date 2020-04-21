<template>
    <div class="l27-duration-picker">
        <el-form :model="model" :rules="rules" ref="duration_picker">
            <el-form-item prop="hours">
                <span slot="label" v-if="showLabel" ><span v-if="isRequired" style="color: #F56C6C; margin-right: 3px;">*</span> Duration <el-button v-if="showReset"  @click="resetDuration" size="mini" type="text">(Reset)</el-button></span>
                <el-card>
                    <el-input class="first" max="24" min="0" placeholder="hrs" type="number" v-model="model.hours" v-on:input="changed">
                        <span slot="append">hours</span>
                    </el-input>
                    <el-input max="60" min="0" placeholder="mins" type="number" v-model="model.minutes" v-on:input="changed">
                        <span slot="append">mins</span>
                    </el-input>
                </el-card>
                <i v-if="false">{{ input_text }}</i>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                required: true
            },
            isRequired: {
                default: false
            },
            showReset: {
                default: false
            },
            showLabel: {
                default : true
            }
        },
        data: function () {
            return {
                model: {
                    hours: 0,
                    minutes: 0
                },
                input_text: "",
                previous_duration: 0,
                rules: {
                    hours: [
                        {
                            validator: (rule, value, callback) => {
                                if (this.model.hours < 0 || this.model.hours > 24) {
                                    return callback(new Error("Maximum allowed is 0 - 24hours"));
                                }

                                if (this.model.minutes < 0 || this.model.minutes > 60) {
                                    return callback(new Error("Maximum allowed is 0 - 60minutes"));
                                }

                                return callback();
                            },
                            trigger: "blur"
                        }
                    ]
                }
            };
        },

        watch: {
            value(value) {
                if (!value && value !== 0) return;

                if (this.value && this.value > 0) {
                    this.model.minutes = this.value % 60;
                    this.model.hours = (this.value - this.model.minutes) / 60;
                    this.changed();
                } else {
                    this.reset();
                }
            }
        },

        beforeCreate() {
        },

        mounted() {
            if (this.value && this.value > 0) {
                this.model.minutes = this.value % 60;
                this.model.hours = (this.value - this.model.minutes) / 60;
            } else {
                this.reset();
            }
        },

        beforeMount() {
        },

        beforeDestroy() {
        },

        methods: {
            changed() {
                let minutes = parseInt(this.model.hours) * 60 + parseInt(this.model.minutes);

                //finally all to minutes
                //now validate the form first
                this.$refs.duration_picker.validate(valid => {
                    if (valid) {
                        if (this.model.hours > 0) {
                            this.input_text = this.model.hours + (this.model.hours == 1 ? "H" : "H");
                        }

                        if (this.model.minutes > 0 && this.model.hours > 0) {
                            this.input_text += " " + this.model.minutes + (this.model.minutes == 1 ? "M" : "M");
                        } else if (this.model.minutes > 0) {
                            this.input_text = this.model.minutes + (this.model.minutes == 1 ? "M" : "M");
                        }

                        this.$emit("input", parseInt(minutes));
                    }
                });
            },
            reset() {
                this.model.hours = 0;
                this.model.minutes = 0;
            },
            resetDuration() {
                this.$emit('reset-duration')
            }
        }
    };
</script>

<style lang="scss">
    .l27-duration-picker {
        width: 300px;

        .el-card {
            padding: 0px;
            border: 1px solid #dcdfe6;

            .el-card__body {
                padding: 0px;
            }
        }

        i {
            font-style: normal;
            margin-top: 5px;
            display: block;
            font-size: 13px;
            margin-left: 0px;
        }

        .el-form-item__content {
            line-height: 1;
        }

        .el-input-group__append,
        .el-input-group__prepend {
            border-radius: 0;
        }

        .el-input-group {
            width: 50%;
            display: inline-flex;

            .el-input__inner {
                border-radius: 0px;
                width: calc(100% - 64px);
            }

            .el-input-group__append {
                display: inline-flex;
                width: 64px;
                padding: 0px;
                box-sizing: border-box;

                span {
                    line-height: 30px;
                    text-align: center;
                    margin: 0 auto;
                    font-size: 12px;
                }
            }

            &.first {
                .el-input-group__append {
                    border: none;
                    border-left: 1px solid #dcdfe6;
                    border-right: 1px solid #dcdfe6;
                }

                .el-input__inner {
                    border-top-left-radius: 4px;
                    border-bottom-left-radius: 4px;
                    border: none;
                }
            }

            &:not(.first) {
                .el-input__inner {
                    border: none;
                }

                .el-input-group__append {
                    border-bottom-right-radius: 4px;
                    border-top-right-radius: 4px;
                    border: none;
                    border-left: 1px solid #dcdfe6;
                }
            }
        }
    }
</style>
