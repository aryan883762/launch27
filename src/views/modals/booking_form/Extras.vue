<template>
    <el-form :model="model" :rules="rules" class="extra-section-step" ref="form">
        <el-row :gutter="10" :key="serviceIndex" v-for="(service, serviceIndex) in selectedServices" v-if="service.extras.length > 0 && selectedServices">
            <el-col :sm="24">
                <el-divider> Extras for : {{ service.name }}</el-divider>
            </el-col>
            <el-col :key="extraIndex" :sm="6" style="margin-bottom:5px;" v-for="(extra, extraIndex) in service.extras">
                <el-card :class="{ selected: isSelected(extra.id, service.id) }" @click.native="selectExtra(extra, service.id, extra.duration, service.hourly)" class="extra-card" shadow="hover">
                    <el-avatar shape="square">
                        <img width="100%" :src="extra.icon"/>
                    </el-avatar>
                    <div class="extra-text">
                        <label>{{ extra.name }}</label>
                    </div>
                    <div class="quantity-counter" v-if="extra.minimum_quantity != extra.maximum_quantity && getQuantity(extra, service.id) > 0"><i @click.prevent.stop="reduceQuantity(extra, service.id)" class="el-icon-remove"></i>{{ getQuantity(extra, service.id) }}</div>
                    <p>{{ $currency }}{{ extra.price }}</p>
                    <i class="el-icon-circle-check" v-if="isSelected(extra.id, service.id)"></i>
                </el-card>
            </el-col>
        </el-row>
    </el-form>
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
                loading: true,
                extra_days: [],
                model: {
                    extras: []
                },
                daily_days: [],
                rules: {}
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
                if (val.meta.extras) {
                    this.model.extras = val.meta.extras
                }
            }
        },

        mounted() {
            if (this.booking && this.booking.meta.extras) {
                this.model.extras = this.booking.meta.extras
            }
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

            isSelected(extra_id, service_id) {

                if (!this.model.extras) return;

                let extra = this.model.extras.find(ex => {
                    return ex.id === extra_id && ex.service_id === service_id;
                });
                return extra;
            },
            getQuantity(extra, service_id) {

                if (!this.model.extras) return;

                let ex = this.model.extras.find(ex => {
                    return ex.id === extra.id && ex.service_id === service_id;
                });
                if (ex) return ex.quantity;

                return 0;
            },

            reduceQuantity(extra, service_id) {
                let yindex = -1;

                for (let x = 0; x < this.model.extras.length; x++) {
                    if (this.model.extras[x].id === extra.id && this.model.extras[x].service_id === service_id) {
                        yindex = x;
                        break;
                    }
                }

                if (yindex === -1) return;

                if (this.model.extras[yindex].quantity > 0) this.model.extras[yindex].quantity -= 1;

                if (this.model.extras[yindex].quantity === 0) this.model.extras.splice(yindex, 1);
            },

            selectExtra(extra, service_id, duration, hourly) {
                let index = -1;

                for (let x = 0; x < this.model.extras.length; x++) {
                    if (this.model.extras[x].id === extra.id && this.model.extras[x].service_id === service_id) {
                        index = x;
                    }
                }

                if (index === -1) {
                    //add new extra and set it to the minimum quantity
                    this.model.extras.push({id: extra.id, name: extra.name, quantity: extra.minimum_quantity, service_id: service_id, duration: duration || 0, hourly: hourly});
                } else {
                    //delete
                    if (extra.minimum_quantity < extra.maximum_quantity && (this.model.extras[index].quantity >= extra.minimum_quantity && this.model.extras[index].quantity < extra.maximum_quantity)) {
                        this.model.extras[index].quantity += 1;
                    } else {
                        this.model.extras.splice(index, 1);
                    }
                }
            }
        }
    };
</script>

<style lang="scss">
    .extra-section-step {
        .extra-card {
            cursor: pointer;
            position: relative;
            padding: 0px;
            height: 80px;
            line-height: initial;

            .el-avatar {
                float: left;
                margin-right: 10px;
            }

            .el-card__body {
                padding: 10px;
            }

            .quantity-counter {
                font-size: 24px;
                font-style: normal;
                text-align: center;
                position: absolute;
                bottom: 0;
                right: 0;
                left: 0;

                i {
                    display: inline-block;
                    font-size: 24px;
                    margin-right: 10px;
                    color: red;
                }
            }

            &.selected {
                background: #fff8e1;
            }

            .extra-text {
                font-size: 10px;
                white-space: normal;
                word-break: keep-all;
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
                font-size: 12px;
                padding: 0px;
                margin: 0px;
                color: black;
                position: absolute;
                left: 8px;
                bottom: 1px;
            }

            i.el-icon-circle-check {
                position: absolute;
                bottom: 5px;
                right: 5px;
                color: #8bc34a;
                font-size: 22px;
            }
        }
    }
</style>
