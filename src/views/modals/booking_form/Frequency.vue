<template>
    <div class="frequency-section-step">
        <el-form :model="model" :rules="rules" label-position="top" ref="form">
            <el-row :gutter="10">
                <el-form-item prop="frequency">
                    <el-col :key="frequency.id" :sm="6" style="margin-bottom:5px;" v-for="frequency in company_frequencies" v-if="allowFrequency(frequency)">
                        <el-card :class="{ selected: frequency.id === model.frequency.id }" @click.native="selectFrequency(frequency)" class="frequency-card" shadow="hover">
                            <p v-if="frequency.discount_type === 'percent'">{{ frequency.discount }} %</p>
                            <p v-if="frequency.discount_type === 'amount'">{{$currency}} {{ frequency.discount }}</p>
                            <i>discount</i>
                            <label>{{ frequency.name }}</label>
                            <i class="el-icon-circle-check" v-if="frequency.id === model.frequency.id"></i>
                        </el-card>
                    </el-col>
                </el-form-item>
            </el-row>

            <el-row v-if="model.frequency.cron === '@daily'">
                <p>Choose days</p>
                <el-checkbox-group v-model="daily_days">
                    <el-checkbox label="0">Mon.</el-checkbox>
                    <el-checkbox label="1">Tues.</el-checkbox>
                    <el-checkbox label="2">Wed.</el-checkbox>
                    <el-checkbox label="3">Thurs.</el-checkbox>
                    <el-checkbox label="4">Fri</el-checkbox>
                    <el-checkbox label="5">Sat.</el-checkbox>
                    <el-checkbox label="6">Sun.</el-checkbox>
                </el-checkbox-group>
            </el-row>
        </el-form>
    </div>
</template>

<script>
    export default {
        props: {
            selectedServices: {
                required: true
            },
            booking: {
                required: false
            }
        },
        data: () => {
            return {
                company_frequencies: [],
                loading: true,
                frequency_days: [],
                daily_days: [],
                model: {
                    frequency: ""
                },
                rules: {
                    frequency: [{message: "Select frequency", required: true, trigger: "blur"}]
                }
            };
        },

        watch: {
            model: {
                handler(val, oldval) {
                    this.validate();
                },
                deep: true
            },
            booking(val) {
                this.model.frequency = val.frequency
            }
        },

        mounted() {
            this.axios
                .get("/companies/current/frequencies",
                    {
                        params: {
                            filter: {
                                where: {
                                    active: true
                                },
                                order: "ordering ASC"
                            }
                        }
                    })
                .then(res => {
                    this.company_frequencies = res.data;

                    //set the default frequency
                    this.company_frequencies.some((freq) => {
                        if (freq.default) {
                            this.model.frequency = freq
                        }
                    })

                    if (this.booking)
                        this.model.frequency = this.booking.frequency
                })
                .catch()
                .finally(_ => {
                    this.loading = false;
                });
        },
        methods: {
            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        this.$emit("on-validate", valid, this.model);
                        resolve(valid);
                        this.$emit("changed")

                    });
                });
            },

            selectFrequency(frequency) {
                this.model.frequency = frequency;
            },

            allowFrequency(frequency) {
                let allow = false;

                if (frequency.serviceIds.length === 0) return true

                frequency.serviceIds.forEach(serviceId => {
                    if (this.selectedServices)
                        this.selectedServices.forEach(srv_id => {
                            if (srv_id === serviceId) {
                                allow = true;
                            }
                        });
                });

                return allow;
            }
        }
    };
</script>

<style lang="scss">
    .frequency-section-step {
        .frequency-card {
            cursor: pointer;
            text-align: center;
            position: relative;
            padding: 0px;
            line-height: initial;

            .el-card__body {
                padding: 10px;
            }

            &.selected {
                background: #fff8e1;
            }

            i {
                font-size: 10px;
                display: block;
            }

            i.el-icon-info {
                position: absolute;
                top: 5px;
                right: 5px;
                font-size: 23px;
                color: lighten(#000, 50);
            }

            p {
                font-size: 20px;
                padding: 0px;
                margin: 0px;
                color: black;
            }

            i.el-icon-circle-check {
                position: absolute;
                bottom: 5px;
                left: 5px;
                color: #8bc34a;
                font-size: 22px;
            }
        }
    }
</style>
