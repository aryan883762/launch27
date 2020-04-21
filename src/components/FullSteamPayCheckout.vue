<template>
    <div class="full-steam-pay-checkout" :class="['template--' + template]">
        <template v-if="template == 'modal'">
            <el-button v-if="showButton" @click="onButtonClick()" :class="finalButtonClasses" round
                       :disabled="buttonDisabled === true">{{ finalButtonText }}
            </el-button>
            <el-dialog class="full-steam-pay-checkout-modal" :visible.sync="modal_visible" width="30%" top="0vh"
                       :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false"
                       :destroy-on-close="true" :append-to-body="true">
                <full-steam-pay-checkout-cards v-if="showExistingCards" :options="cards_options" :is-modal="true" @command="onCommandReceived"/>
                <full-steam-pay-checkout-form v-if="modal_visible && form_visible" :options="form_options" :is-modal="true" @command="onCommandReceived" :on-mounted="onFormInit" />
            </el-dialog>
        </template>
        <template v-else-if="template == 'inline'">
            <full-steam-pay-checkout-cards v-if="showExistingCards" :options="cards_options"
                                           @command="onCommandReceived"/>
            <template v-if="form_visible">
                <el-dialog v-if="modal_form" class="full-steam-pay-checkout-modal" :visible="true" width="30%"
                           :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false"
                           :destroy-on-close="true" :append-to-body="true">
                    <full-steam-pay-checkout-form :options="form_options" :is-modal="true"
                                                  @command="onCommandReceived" :on-mounted="onFormInit" />
                </el-dialog>
                <full-steam-pay-checkout-form v-else :options="form_options" @command="onCommandReceived" :on-mounted="onFormInit" />
            </template>
        </template>
    </div>
</template>

<script>
    export default {
        name: "full-steam-pay-checkout",
        components: {
            "full-steam-pay-checkout-form": require("./FullSteamPayCheckoutForm").default,
            "full-steam-pay-checkout-cards": require("./FullSteamPayCheckoutCards").default
        },
        props: {
            showButton: Boolean,
            buttonText: String,
            buttonClass: String,
            buttonDisabled: Boolean,
            submitButtonText: String,
            submitButtonClass: String,
            accountId: String,
            nameOnCard: String,
            billingAddress: Object,
            company: Object,
            amount: [String, Number],
            showExistingCards: {
                type: Boolean,
                default: true
            },
            subscription: {
                type: Boolean,
                default: false
            },
            merchantCompanyId: String,
            template: {
                type: String,
                default: "modal",
                required: true,
                validator: value => {
                    return ["modal", "inline"].indexOf(value) !== -1;
                }
            },
            transactionType: {
                type: String,
                default: "token",
                validator: value => {
                    return ["token", "payment"].indexOf(value) !== -1;
                }
            },
            showCancel: {
                type: Boolean,
                default: true
            },
            onMounted: Function,
            onTokenReceived: Function,
            onCardSelected: Function,
        },
        data() {
            return {
                modal_loading: false,
                modal_visible: false,
                form_visible: false,
                modal_form: false,
                form_options: {},
                cards_options: {},
                form_instance: null,
            };
        },
        created() {
            this.cards_options = Object.assign({newCards: [], selectedCardId: null}, this.$props);
            this.form_options = Object.assign({}, this.$props);
        },
        mounted() {
            if (typeof this.onMounted == "function") {
                this.onMounted(this);
            }

            if (!this.showExistingCards) {
                this.form_visible = true;
            }
        },
        methods: {
            onButtonClick() {
                this.showModal();
            },
            showModal() {
                this.modal_visible = true;
                this.modal_loading = true;
                if (!this.form_visible && !this.showExistingCards) {
                    this.form_visible = true;
                }
            },
            closeModal() {
                this.modal_visible = false;
                this.modal_loading = false;
            },
            onCommandReceived(command, args) {
                if (command == "show-form") {
                    if (args && args.modal) {
                        this.modal_form = true;
                        this.modal_visible = true;
                    }
                    this.$set(this.form_options, "form_visible", true);
                    this.$set(this.cards_options, "form_visible", true);
                    this.form_visible = true;
                }
                if (command == "hide-form") {
                    this.$set(this.form_options, "form_visible", false);
                    this.$set(this.cards_options, "form_visible", false);
                    this.form_visible = false;
                }
                if (command == "add-new-card-to-existing") {
                    var new_card = JSON.parse(JSON.stringify(args));
                    new_card.id = "new:" + Math.floor(Date.now() / 1000);
                    this.cards_options.newCards.push(new_card);
                    this.cards_options.selectedCardId = new_card.id;
                }
                if (command == "close-modal") {
                    this.closeModal();
                }
            },
            submitForm() {
                this.form_instance.submitFormByButton();
            },
            onFormInit(instance) {
                this.form_instance = instance;
            }
        },
        computed: {
            finalButtonText() {
                var out;
                if (this.buttonText) {
                    out = this.buttonText;
                } else {
                    out = "Pay";
                    if (this.amount) {
                        out += "($" + this.amount + ")";
                    }
                }
                return out;
            },
            finalButtonClasses() {
                var out = [];
                if (this.buttonClass) {
                    out = this.buttonClass.split(" ");
                }
                return out;
            }
        }
    };
</script>

<style lang="scss">
    .full-steam-pay-checkout-modal {
        .el-dialog__header {
            display: none;
        }
    }

    #full-steam-pay-checkout-form {
        .el-form-item__label {
            line-height: normal !important;
            padding-bottom: 5px !important;
        }

        .el-form-item {
            margin-bottom: 10px;

            &.has-errors {
                .el-input__inner {
                    border-color: red;
                }
            }
        }
    }

    .full-steam-pay-checkout,
    .full-steam-pay-checkout-modal {
        .existing-cards-buttons-wrapper {
            margin-top: 10px;
            padding-top: 10px;
        }

        .existing-cards-wrapper {
            p {
                margin-top: 0;
            }

            .existing-cards-buttons-wrapper {
                &:after {
                    content: "";
                    display: block;
                    clear: both;
                }

                .cancel {
                    float: right;
                }
            }
        }
    }
</style>
