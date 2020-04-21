<template>
    <div class="account-cards ">
        <div v-if="payments_enabled">
            <div class="flex-row-reverse" v-if="!mini">
                <el-button @click="addNewCard" class="m-l-10" plain round size="mini" type="success" v-if="addButton">
                    Add a new card
                </el-button>
                <el-button @click="toogleDefaultCard" plain round size="mini" type="warning"
                           v-if="defaultButton && selected_card_id">
                    {{ selected_card_default ? 'Remove as default' : 'Set as default' }}
                </el-button>
                <el-button @click="deleteCard" plain round size="mini" type="danger" v-if="deleteButton && selected_card_id">Delete card
                </el-button>
            </div>

            <div class="" v-if="mini" style="margin-bottom: 10px;">
                <el-button @click="addNewCard" plain size="mini" style="font-size: 11px !important;" type="success" v-if="addButton">Add card</el-button>
                <el-divider direction="vertical" v-if="defaultButton && selected_card_id"></el-divider>
                <el-link @click="toogleDefaultCard" style="font-size: 11px !important;" plain round size="mini" type="warning" v-if="defaultButton && selected_card_id">{{ selected_card_default ? 'Rem. as default' : 'Make default' }}</el-link>
                <el-divider direction="vertical" v-if="deleteButton && selected_card_id"></el-divider>
                <el-link @click="deleteCard" style="font-size: 11px !important;" plain round size="mini" type="danger" v-if="deleteButton && selected_card_id">Delete</el-link>
            </div>

            <el-divider v-if="!mini">Account Cards</el-divider>
            <el-row :gutter="20" class=" " v-loading="loading">
                <el-col :key="card.id" :md="mini? 24 : 8" :sm="mini? 24: 8" :xs="24"
                        style="margin-bottom: 10px;max-width: 280px;" v-for="card in cards">

                    <el-card v-if="mini" :body-style="{ padding: '10px' }"
                             :class="{selected : card.id === selected_card_id}"
                             style="box-shadow: none;border:none;padding:0px;" @click.native="selectCard(card)"
                             shadow="hover">
                        <el-image v-if="card.cardType" :src="require(`@/assets/icons/cards/${card.cardType}.png`)" class="charge-item-card" fit="fit"></el-image>
                        <el-image v-if="!card.cardType" :src="require(`@/assets/icons/cards/pay.svg`)" class="charge-item-card" fit="fit"></el-image>

                        <div class="charge-item-card-details">
                            <small>**** **** **** {{card.last4digits}}</small>
                            <small>Expires: {{card.expiryMonth}}/{{card.expiryYear}}</small>
                            <el-button size="mini" type="text" v-if="card.default">Default <i
                                    class="el-icon-caret-bottom"></i></el-button>
                        </div>
                        <i class="el-icon-circle-check" v-if="card.id === selected_card_id"></i>
                    </el-card>

                    <el-card v-else :class="{selected : card.id === selected_card_id}" @click.native="selectCard(card)" shadow="hover">
                        <el-image v-if="card.cardType" :src="require(`@/assets/icons/cards/${card.cardType}.png`)" class="charge-item-card" fit="fit"></el-image>
                        <el-image v-if="!card.cardType" :src="require(`@/assets/icons/cards/pay.svg`)" class="charge-item-card" fit="fit"></el-image>
                        <div class="charge-item-card-details">
                            <small>**** **** **** {{card.last4digits}}</small>
                            <small>Expires: {{card.expiryMonth}}/{{card.expiryYear}}</small>
                            <el-button size="mini" type="text" v-if="card.default">Default <i
                                    class="el-icon-caret-bottom"></i></el-button>
                        </div>
                        <i class="el-icon-circle-check" v-if="card.id === selected_card_id"></i>
                    </el-card>
                </el-col>
                <el-col v-if="cards.length === 0">
                    <p>No cards found for this account</p>
                </el-col>
            </el-row>

            <template v-if="company && company.payment_methods.card_processor === 'fspay'">
                <full-steam-pay-checkout
                        :account-id="account.id"
                        :merchant-company-id="account.companyId"
                        :name-on-card="account.first_name + ' ' + account.last_name"
                        :on-card-selected="onFullSteamPayCardSelected"
                        :on-mounted="onFullSteamPayMounted"
                        :on-token-received="onFullSteamPayTokenReceived"
                        :show-button="false"
                        :show-existing-cards=false
                        submitButtonText="Add Card"
                        template="modal"
                        transaction-type="token"
                />
            </template>

            <el-dialog
                    :visible.sync="cardDialog"
                    append-to-body
                    title="Add a new card"
                    width="30%">

                <el-form label-position="top" v-if="company && company.payment_methods.card_processor === 'stripe'">
                    <div v-loading="card_loading">
                        <el-form-item>
                            <!--<card :class="{ complete }" :options="stripeOptions" :stripe="stripe_publishable_key"
                                  @change="complete = $event.complete" class="stripe-card"/>-->

                            <stripe-card ref="stripe_card" :root-model="{account: account}" @change="complete = $event.complete" @close="closeDialog()"></stripe-card>

                        </el-form-item>

                    </div>
                </el-form>
            </el-dialog>
        </div>
        <div v-else>
            <el-alert>Card payments not enabled</el-alert>
        </div>

    </div>

</template>


<script>
    import {Card, handleCardSetup} from "vue-stripe-elements-plus";
    import StripeCard from "./StripeCards";

    export default {
        props: {
            account: {
                type: Object,
                required: true
            },
            value: {
                required: true
            },
            addButton: {
                default: true
            },
            deleteButton: {
                default: false
            },
            defaultButton: {
                default: false
            },
            mini: {
                type: Boolean,
                default: false
            }
        },
        components: {
            StripeCard,
            Card,
            "full-steam-pay-checkout": require("@/components/FullSteamPayCheckout").default
        },
        watch: {
            'account'(val) {
                this.getCards()
            }
        },
        data() {
            return {
                complete: false,
                selected_card_id: false,
                selected_card_default: null,
                loading: false,
                cards: [],
                stripeOptions: {
                    base: {
                        iconColor: "#666EE8",
                        color: "#31325F",
                        lineHeight: "40px",
                        fontWeight: 300,
                        fontFamily: "Helvetica Neue",
                        fontSize: "15px",

                        "::placeholder": {
                            color: "#CFD7E0"
                        }
                    }
                },
                stripe_publishable_key: process.env.VUE_APP_STRIPE_PK,
                model: {
                    payment_type: "",
                    stripe_payment_method_id: ""
                },
                cardDialog: false,
                fsPayInstance: false,
                card_loading: false,
                company: null,
                payments_enabled: true
            }
        },
        created() {
            //check that the payment method or gateways are rady


        },
        mounted() {
            this.getCards()
            this.selected_card_id = this.value
        },
        methods: {
            closeDialog() {
                this.cardDialog = false
                this.getCards()
            },
            addNewCard(stripe) {
                //depends on whether stripe or fspay
                if (this.company && this.company.payment_methods.card_processor === 'stripe') {
                    this.cardDialog = true
                } else {
                    this.fsPayInstance.showModal()
                }
            },
            getCards() {
                this.loading = true
                this.selected_card_id = false

                let gateway = this.$auth.user().company.payment_methods.card_processor

                this.axios.get('/accounts/' + this.account.id + '/cards',
                    {
                        params: {
                            filter: {
                                where: {gateway: gateway}
                            }
                        }
                    })
                    .then(
                        res => {
                            this.cards = res.data
                        }
                    )
                    .catch(err => {

                    })
                    .finally(() => {
                        this.getCompany()
                        this.loading = false
                    })
            },

            selectCard(card) {
                this.selected_card_id = card.id
                this.selected_card_default = card.default
                this.$emit('input', card.id)
            },


            onFullSteamPayMounted(fsInstance) {
                if (fsInstance) {
                    this.fsPayInstance = fsInstance;
                }
            },
            onFullSteamPayTokenReceived(token) {
                this.model.cardToken = token;
                this.model.cardId = null;

                //save & attache card
                this.axios.post('/cards/fs-card-attach', {
                    accountId: this.account.id,
                    token: token
                })
                    .then(res => {
                        this.$message.success('Card Successfully Added')
                        this.getCards()
                    })
                    .catch()
                    .finally(_ => {
                        this.card_loading = false
                    })
            },
            onFullSteamPayCardSelected(cardId, card) {
                if (cardId.indexOf("new:") !== -1) {
                    this.model.cardToken = card;
                    this.model.cardId = null;
                } else {
                    this.model.cardId = cardId;
                    this.model.cardToken = null;
                }
            },
            deleteCard() {
                this.$confirm('Are sure you want to delete this card?',
                    'Confirm Deletion')
                    .then(() => {
                        this.axios.delete("/cards/" + this.selected_card_id)
                            .then(res => {
                                this.getCards();
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err)
                            })
                            .finally()
                    });
            },
            toogleDefaultCard() {
                this.loading = true;
                this.axios.patch("/cards/" + this.selected_card_id,
                    {
                        default: !this.selected_card_default
                    })
                    .then(res => {
                        this.selected_card_default = res.data.default
                    })
                    .finally(() => {
                        this.loading = false;
                        this.getCards();
                    });
            },
            getCompany() {
                this.company = this.$auth.user().company
                if (!(this.company && (this.company.payment_methods.card_processor === 'stripe' || this.company.payment_methods.card_processor === 'fspay')
                    && this.company.payment_methods.card)) {
                    this.payments_enabled = false
                }

                if (this.company.migrated && process.env.VUE_APP_EARLY_LOOK) {
                    this.payments_enabled = true
                }
            }
        }
    }
</script>


<style lang="scss">
    .account-cards {

        small {
            display: block;
        }

        .el-card {
            cursor: pointer;
        }

        .charge-item-card {
            width: 32px !important;
            float: left;
            margin-right: 10px;
        }

        .selected {
            background: #F9FBE7;
            position: relative;

            .el-icon-circle-check {
                font-size: 25px;
                position: absolute;
                bottom: 10px;
                right: 10px;
            }
        }

        .charge-item-card-details {
            width: calc(100% - 50px);
            display: inline-block;

            .el-button {
                color: #333;
            }
        }

        .charge-item {
            span {
                display: block;
                font-size: 11px;
            }
        }

        .m-l-10 {
            margin-left: 10px;
        }
    }
</style>
