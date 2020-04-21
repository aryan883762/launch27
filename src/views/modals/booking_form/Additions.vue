<template>
    <el-form :model="model" :rules="rules" label-position="top" ref="form">
        <el-row :gutter="20">
            <el-col :md="12" :sm="12">
                <el-card>
                    <el-form-item>
                        <el-input placeholder="Discount Code" v-model="model.discount_code"></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-input placeholder="Gift Card" v-model="model.gift_card_code"></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-input placeholder="Referral Code" v-model="model.referral_code"></el-input>
                    </el-form-item>

                    <el-form-item label="Tip" prop="tip">
                        <el-input placeholder="Tip" size="small" type="number" min="0" v-model="model.tip">
                            <span slot="prepend">{{ $currency }}</span>
                        </el-input>
                    </el-form-item>

                    <el-form-item prop="duration">
                        <duration-picker @reset-duration="resetDuration" v-model="model.duration"></duration-picker>
                    </el-form-item>

                    <el-form-item label="Adjustment">
                        <el-input type="number" v-model="model.adjustment"><span slot="prepend">{{$currency}}</span>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Reason for adjustment">
                        <el-input :row="4" type="textarea" v-model="model.adjustment_reason"></el-input>
                    </el-form-item>

                </el-card>
            </el-col>

            <el-col :md="12" :sm="12">
                <el-card>
                    <el-form-item>
                        <el-input :rows="6" placeholder="Customer Comments" type="textarea"
                                  v-model="model.customer_notes"></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-input :rows="6" placeholder="Staff Note" type="textarea"
                                  v-model="model.staff_notes"></el-input>
                    </el-form-item>


                    <el-form-item label="Requested Team">
                        <team-select show-preferred :account-id="accountId" :multiple="false"
                                     v-model="model.team_requested"></team-select>
                    </el-form-item>

                    <el-form-item label="Team Key or Access Code">
                        <team-select show-preferred :account-id="accountId" :multiple="false"
                                     v-model="model.team_with_key"></team-select>
                    </el-form-item>


                </el-card>

            </el-col>


        </el-row>
    </el-form>
</template>

<script>
    import TeamSelect from "../../../components/TeamSelect";

    export default {
        components: {TeamSelect},
        props: {
            duration: {},
            booking: {},
            accountId: {}
        },
        data() {
            return {
                model: {
                    staff_notes_access: [],
                    customer_notes: "",
                    staff_notes: "",
                    discount_code: "",
                    referral_code: "",
                    tip: 0,
                    duration: 0,
                    assigned_teams: [],
                    adjustment_reason: '',
                    adjustment: 0,
                    team_with_key: "",
                    team_requested: ""
                },
                rules: {
                    duration: [{message: "duration must be greater than 0", required: true}],
                    tip: [{
                        validator: (value, rule, callback) => {
                            if (this.model.tip && this.model.tip < 0) {
                                return callback(new Error("Tip cannot be less than 0"))
                            }
                            return callback()
                        }
                    }]
                },
                teams: [],
                remote_loading: false,
                update_us : false
            };
        },
        watch: {
            "model.tip"(val) {
                this.validate();
            },
            "model.discount_code"(val) {
                this.validate();
            },
            "model.referral_code"(val) {
                this.validate()
            },
            "model.adjustment"(val) {
                this.validate();
            },
            "model.duration"(val) {
                this.validate();
            },
            duration(val) {
                this.model.duration = parseInt(val);
            },
            booking(val) {
                if (val) {
                    this.model.customer_notes = this.booking.customer_notes
                    this.model.tip = this.booking.charge.tip
                    this.model.discount_code = this.booking.charge.discount_code
                    this.model.gift_card_code = this.booking.gift_card_code
                    this.model.duration = this.booking.duration
                    this.model.adjustment = this.booking.charge.adjustment
                    this.model.adjustment_reason = this.booking.charge.adjustment_reason
                    this.model.staff_notes = this.booking.staff_notes
                    this.model.team_requested = this.booking.team_requested
                    this.model.team_with_key = this.booking.team_with_key
                }
            },
            accountId() {
                this.loadPreferredTeams()
            }
        },

        mounted() {
            //update duration from outside if need be
            if (this.duration) this.model.duration = parseInt(this.duration);

            if (this.booking) {
                this.model.customer_notes = this.booking.customer_notes
                this.model.tip = this.booking.charge.tip
                this.model.discount_code = this.booking.charge.discount_code
                this.model.gift_card_code = this.booking.gift_card_code
                this.model.duration = this.booking.duration
                this.model.adjustment = this.booking.charge.adjustment
                this.model.adjustment_reason = this.booking.charge.adjustment_reason
                this.model.staff_notes = this.booking.staff_notes
                this.model.team_requested = this.booking.team_requested
                this.model.team_with_key = this.booking.team_with_key
            }

            if (this.$route.query && this.$route.query.referral_code) {
                console.log(this.$route.query.referral_code);
                this.model.referral_code = this.$route.query.referral_code;
            }

            this.loadPreferredTeams()

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
            resetDuration() {
                //trigger validate so the duration can be recalculated.
                this.$emit('content-updated', true, this.model)
            },
            loadPreferredTeams() {
                if (!this.accountId) return;
                this.remote_loading = true
                this.axios.get('/accounts/' + this.accountId + '/teams_preferred')
                    .then(
                        res => {
                            this.teams = res
                        }
                    )
                    .catch(err => {
                    })
                    .finally(_ => {
                        this.remote_loading = true
                    })
            },
            searchTeam(query) {
                if (query !== '') {
                    this.remote_loading = true
                    this.axios
                        .get('/companies/current/accounts', {
                            params: {
                                filter: {
                                    where: {
                                        role: 'r_team',
                                        active: true
                                    }
                                }
                            }
                        })
                        .then(res => {
                            this.teams = res.data
                        })
                        .catch(err => {
                        })
                        .then(() => {
                            this.remote_loading = false
                        })
                } else {
                    this.teams = []
                }
            }
        }
    };
</script>
