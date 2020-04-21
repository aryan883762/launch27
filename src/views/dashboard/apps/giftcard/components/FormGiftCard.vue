<template>
    <el-row :gutter="20" v-loading="loading">
        <el-form size="small" ref="giftCardForm" labelPosition="top" :model="giftCard" class="padding-2x" :rules="rules">
            <el-col :sm="12" :md="12" :xs="24">
                <el-form-item label="Recipient's Email" prop="recipient_email">
                    <el-input v-model="giftCard.recipient_email"/>
                </el-form-item>
                <el-form-item label="Recipient's Name" prop="recipient_name">
                    <el-input v-model="giftCard.recipient_name"/>
                </el-form-item>
                <el-form-item v-if="multiGiftCard" label="More Recipients" class="full-label-form-item">
                    <el-tag v-for="(multiGCAttribute, index) in multiGCAttributes" :key="index" closable :disable-transitions="false" @close="handleMultiGCAttributeClose(multiGCAttribute)"> {{ multiGCAttribute.recipient_name }}({{ multiGCAttribute.recipient_email }})</el-tag>
                    <template v-if="multiGCFormVisible">
                        <el-form ref="multiGiftCardForm" :inline="true" :model="multiGCForm" :rules="multiGCrules">
                            <el-form-item prop="recipient_email">
                                <el-input type="email" v-model="multiGCForm.recipient_email" ref="multiGCRecipientEmailInput" size="mini" placeholder="Email"/>
                            </el-form-item>
                            <el-form-item prop="recipient_name">
                                <el-input v-model="multiGCForm.recipient_name" size="mini" placeholder="Name"/>
                            </el-form-item>
                            <el-button class="button-new-tag" round type="primary" size="mini" @click="handleMultiGiftCardFormConfirm">Save</el-button>
                        </el-form>
                    </template>
                    <el-button v-else class="button-new-tag" round type="danger" size="mini" @click="showMultiGiftCardForm">+ New Recipient</el-button>
                </el-form-item>
                <el-form-item label="Card Value" prop="amount" v-if="isNew">
                    <template v-if="amountOptions">
                        <el-select v-model="giftCard.amount" placeholder="Select an amount">
                            <el-option v-for="(amount, amountIndex) in giftCardType.amounts" :key="amountIndex" :value="amount"> {{ $currency }}{{ amount }}</el-option>
                        </el-select>
                    </template>
                    <template v-else>
                        <el-input type="number" v-model.number="giftCard.amount" min="1">
                            <span slot="prepend">{{ $currency }}</span>
                        </el-input>
                    </template>
                </el-form-item>
                <el-form-item label="Gifter's Email" prop="gifter_email" v-if="$can('manage', 'role_anonymous')">
                    <el-input v-model="giftCard.gifter_email"/>
                </el-form-item>
                <el-form-item label="Gifter's Name" prop="gifter_name">
                    <el-input v-model="giftCard.gifter_name"/>
                </el-form-item>
                <el-form-item label="Gifter's Description" prop="description">
                    <el-input v-model="giftCard.description" rows="3" type="textarea"/>
                </el-form-item>
                <el-form-item label="Choose the Design" prop="background_image" class="image-list">
                    <el-radio-group v-model="giftCard.background_image" size="mini">
                        <el-radio-button v-for="(image, imageIndex) in giftCardType.background_images" :key="imageIndex" :label="image">
                            <el-image :src="image">
                                <div slot="placeholder" class="image-slot">Loading<span class="dot">...</span></div>
                                <div slot="error" class="image-slot"></div>
                            </el-image>
                        </el-radio-button>
                    </el-radio-group>
                </el-form-item>
            </el-col>
            <el-col :sm="12" :md="12" :xs="24">
                <preview-gift-card :background-image="giftCard.background_image" :description="giftCard.description" :show-ode="giftCardType.show_code" :amount="giftCard.amount" :recipient-name="giftCard.recipient_name" :gifter-name="giftCard.gifter_name" :currency="$currency"/>

                <div class="divider-3x"/>
                <el-form-item v-if="isNew">
                    <span class="success-text cost-text"> You will be bill for: {{ $currency }}{{ billingMessage }} </span>
                </el-form-item>
                <template v-if="isNew">
                    <el-form-item v-if="$can('manage', 'role_anonymous')">
                        <el-card class="box-card">
                            <template v-if="cardInfo">
                                Card ending with: <span class="card-info-text">{{ cardInfo }}</span>
                                <el-button type="danger" icon="el-icon-close" circle @click="cancelCardToken" class="pull-right"></el-button>
                            </template>
                            <template v-else>
                                <template v-if="company && company.payment_methods && company.payment_methods.card_processor === 'fspay'">
                                    <full-steam-pay-checkout :merchant-company-id="company.id" :on-token-received="onFullSteamPayTokenReceived" :show-button="false" :show-existing-cards="false" :show-cancel="false" submitButtonText="Confirm Card" template="inline" transaction-type="token"/>
                                </template>
                                <template v-if="company && company.payment_methods && company.payment_methods.card_processor === 'stripe'">
                                    <!--
                                                        <stripe-anonymous-card-form :on-payment-method-received="onStripePaymentMethodReceived" :holder-name="giftCard.gifter_name" :holder-email="giftCard.gifter_email"/>
                                    -->
                                    <stripe-card ref="stripe_card" :inline="true" :root-model="{}" :company="company"></stripe-card>
                                </template>
                            </template>
                        </el-card>
                    </el-form-item>
                    <el-form-item v-else class="customer-cardslist-giftc-sesction">
                        <account-cards :account.sync="currentAccount" v-model="selectedCard"></account-cards>
                    </el-form-item>
                </template>
                <el-form-item class="giftcard-submit-div">
                    <el-button type="primary" @click="saveGiftCard" round class="giftcard-submit-btn">
            <span v-if="isNew">
              Purchase
            </span>
                        <span v-else>
              Save Gift Card
            </span>
                    </el-button>
                </el-form-item>
            </el-col>
        </el-form>
    </el-row>
</template>

<script>
    import PreviewGiftCard from "./PreviewGiftCard.vue";
    import AccountCards from "@/components/AccountCards";
    import StripeAnonymousCardForm from "@/components/StripeAnonymousCardForm";
    import StripeCard from "../../../../../components/StripeCards";

    export default {
        name: "form-gift-card",
        props: {
            giftCardType: {
                type: Object
            },
            giftCard: {
                type: Object
            },
            multiGiftCard: {
                type: Boolean,
                default: false
            },
            company: {
                type: Object
            }
        },

        components: {
            StripeCard,
            PreviewGiftCard,
            AccountCards,
            StripeAnonymousCardForm,
            "full-steam-pay-checkout": require("@/components/FullSteamPayCheckout").default
        },

        data: () => {
            return {
                loading: false,
                amountOptions: true,
                multiGCAttributes: [],
                multiGCFormVisible: false,
                selectedCard: "",
                cardToken: null,
                cardInfo: null,
                multiGCForm: {},
                rules: {
                    gifter_name: [{required: true, message: "Please enter a name", trigger: "blur"}],
                    gifter_email: [{type: "email", required: true, message: "Please enter a valid email", trigger: "blur"}],
                    recipient_name: [{required: true, message: "Please enter a name", trigger: "blur"}],
                    recipient_email: [{type: "email", required: true, message: "Please enter a valid email", trigger: "blur"}],
                    amount: [{required: true, message: "Please enter a value", trigger: "blur"}],
                    background_image: [{required: true, message: "Please select a design", trigger: "change"}]
                },
                multiGCrules: {
                    recipient_name: [{required: true, message: "Please enter a name", trigger: "blur"}],
                    recipient_email: [{type: "email", required: true, message: "Please enter a valid email", trigger: "blur"}]
                }
            };
        },

        created() {
            if (this.giftCardType.amounts && this.giftCardType.amounts.length > 0) {
                this.amountOptions = true;
            } else {
                this.amountOptions = false;
            }
        },

        computed: {
            billingMessage() {
                var message = "0";
                if (this.giftCard.amount && this.giftCard.amount > 0) {
                    var giftCardsCount = this.multiGCAttributes.length + 1;
                    message = this.giftCard.amount * giftCardsCount;
                    message += " (" + this.$currency + this.giftCard.amount + " x " + giftCardsCount + ")";
                }
                return message;
            },

            currentAccount() {
                if (this.$can("manage", "role_anonymous")) {
                    return null;
                } else {
                    return this.$auth.user();
                }
            },

            isNew() {
                return !this.giftCard.id;
            }
        },

        methods: {
            saveGiftCard() {
                this.$refs["giftCardForm"].validate(valid => {
                    if (valid) {
                        if (this.isNew) {
                            // we check if card is set
                            //get

                            //if stripe you must trigger stripe first
                            if (this.company.payment_methods.card_processor === 'stripe') {
                                this.$refs.stripe_card.getPaymentMethod({
                                    name: this.giftCard.gifter_name,
                                    email: this.giftCard.gifter_email,
                                }, (result) => {
                                    if (result) {
                                        this.cardToken = result.payment_method_id
                                        if ((this.selectedCard && this.selectedCard !== "") || this.cardToken) {
                                            this.saveManyGiftCard();
                                        } else {
                                            this.$helpers.errorHandle("A credit card is needed");
                                        }
                                    } else {
                                        this.$helpers.errorHandle("Failed to validate payment card");
                                    }
                                })
                            } else {
                                //this if for fullsteam
                                if ((this.selectedCard && this.selectedCard !== "") || this.cardToken) {
                                    this.saveManyGiftCard();
                                } else {
                                    this.$helpers.errorHandle("A credit card is needed");
                                }
                            }


                        } else {
                            this.saveOneGiftCard();
                        }
                    } else {
                        return false;
                    }
                });
            },

            saveOneGiftCard() {
                this.loading = true;
                let url = "/accounts/me/gifterGiftCards/";
                if (this.$can("manage", "manage_apps")) {
                    url = "/companies/current/giftCards/";
                }
                this.axios
                    .put(url + this.giftCard.id, this.giftCard)
                    .then(res => {
                        this.$message.success("Gift card edited");
                        this.$emit("done-edit-gift-card-dialog");
                    })
                    .catch(err => {
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },

            saveManyGiftCard() {
                this.loading = true;
                // create the data
                if (this.$auth.user().id) {
                    this.giftCard.gifterAccountId = this.$auth.user().id;
                    this.giftCard.gifter_email = this.$auth.user().email;
                }
                var data = {giftcards: [], cardId: this.selectedCard, cardToken: this.cardToken};
                data.giftcards.push(this.giftCard);
                this.multiGCAttributes.forEach(multiGCAttribute => {
                    if (multiGCAttribute.recipient_email && multiGCAttribute.recipient_name) {
                        var giftCardCopy = Object.assign({}, this.giftCard);
                        giftCardCopy.recipient_email = multiGCAttribute.recipient_email;
                        giftCardCopy.recipient_name = multiGCAttribute.recipient_name;
                        data.giftcards.push(giftCardCopy);
                    }
                });

                this.axios
                    .post("/gift_cards/multi", data)
                    .then(res => {
                        var count = 0;
                        var message = "";
                        if (res.data) {
                            count = res.data.length;
                        }
                        message = " Gift card";
                        if (count > 1) {
                            message += "s";
                        }
                        message = " purchased. You will receive an email once payment is successful";
                        this.$message.success(count + message);
                        this.$refs["giftCardForm"].resetFields();
                        this.cancelCardToken();
                        this.multiGCAttributes = [];
                    })
                    .catch(err => {
                        this.$helpers.errorHandle("Purchase failed, please try again later.");
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },

            showMultiGiftCardForm() {
                this.multiGCFormVisible = true;
                this.$nextTick(_ => {
                    this.$refs.multiGCRecipientEmailInput.$refs.input.focus();
                });
            },

            handleMultiGCAttributeClose(multiGCAttribute) {
                this.multiGCAttributes.splice(this.multiGCAttributes.indexOf(multiGCAttribute), 1);
            },

            handleMultiGiftCardFormConfirm() {
                this.$refs["multiGiftCardForm"].validate(valid => {
                    if (valid) {
                        this.multiGCAttributes.push(this.multiGCForm);
                        this.multiGCFormVisible = false;
                        this.multiGCForm = {};
                    } else {
                        return false;
                    }
                });
            },

            onFullSteamPayTokenReceived(token) {
                if (token) {
                    this.cardToken = {gatewayId: token.token};
                    this.cardInfo = token.accountDetails.paymentAccountLast4;
                }
            },

            onStripePaymentMethodReceived(paymentMethod) {
                if (paymentMethod) {
                    this.cardToken = {gatewayId: paymentMethod.id};
                    this.cardInfo = paymentMethod.card.last4;
                }
            },

            cancelCardToken() {
                this.cardToken = null;
                this.cardInfo = null;
            }
        }
    };
</script>

<style lang="scss">
    .image-list .el-radio-button__inner {
        padding: 3px 3px 1px 3px !important;
    }

    .image-list label.el-form-item__label {
        width: 100%;
        text-align: left;
    }

    .customer-cardslist-giftc-sesction {
        .el-col.el-col-24.el-col-xs-24.el-col-sm-6.el-col-md-6 {
            width: 50%;

            .charge-item-card-details {
                line-height: 1.5;
            }
        }
    }

    .image-list .el-radio-button img {
        height: 65px;
        width: auto;
    }

    .cost-text {
        font-size: 18px;
    }

    .giftcard-submit-div {
        text-align: center;
    }

    .giftcard-submit-btn {
        width: 80%;
    }
</style>
