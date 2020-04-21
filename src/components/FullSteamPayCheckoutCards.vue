<template>
    <div class="full-steam-pay-checkout-cards-wrapper">
        <div class="existing-cards-wrapper" v-loading="loading">
            <div class="existing-cards" v-if="finalCards.length">
                <p>Existing Cards</p>
                <div class="existing-card" v-for="(card, cardIndex) in finalCards" @click="onCardClick()">
                    <el-radio v-model="selected_card" :label="card.id">
                        <template v-if="card.id.indexOf('new:') === -1">
                            {{ card.cardType }} - {{ card.last4digits }} (expiring {{ card.expiryMonth }}/{{ card.expiryYear }})
                        </template>
                        <template v-else>
                            {{ card.cardType }} - {{ card.accountDetails.paymentAccountLast4 }} (expiring {{ card.accountDetails.expirationMonth }}/{{ card.accountDetails.expirationYear }})
                        </template>
                    </el-radio>
                </div>
            </div>
            <template v-else>
                <p v-if="options.template == 'inline'"><em>You have no available cards on file</em></p>
                <p v-else><em>You have no available cards on file</em></p>
            </template>

            <div class="existing-cards-buttons-wrapper" v-if="!options.form_visible">
                <el-button round type="primary" size="mini" v-if="selected_card" @click="useSelectedCard()">Use selected card</el-button>
                <el-button round v-if="isModal" type="danger" plain size="mini" class="cancel" @click="onCancel()">Cancel</el-button>
                <el-button round @click="showForm()"  type="primary"  size="mini">Add new card</el-button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "full-steam-pay-checkout-cards",
        props: {
            options: Object,
            isModal: Boolean
        },
        data() {
            return {
                loading: false,
                cards: [],
                selected_card: null
            };
        },
        created() {
            this.fetchExistingCards();
        },
        methods: {
            fetchExistingCards() {
                if (this.options.accountId) {
                    this.loading = true;
                    var filter = {};
                    /*if (this.options.merchantCompanyId) {
                      filter.where = { merchantCompanyId: this.options.merchantCompanyId };
                    }*/
                    this.axios({url: "/accounts/" + this.options.accountId + "/cards", method: "GET"})
                        .then(response => {
                            if (response && response.data.length) {
                                this.cards = response.data;
                            } else {
                                this.showForm();
                            }
                        })
                        .catch(_ => {
                            this.showForm();
                        })
                        .finally(_ => {
                            this.loading = false;
                        });
                }
            },
            useSelectedCard() {
                if (this.selected_card) {
                    if (this.options.hasOwnProperty("onCardSelected")) {
                        this.options.onCardSelected(this.selected_card, this.getCardById(this.selected_card));
                    }
                    if (this.options.template == "modal" && typeof this.options.onCancel == "function") {
                        this.options.onCancel();
                    }
                    this.$emit("command", "close-modal");
                }
            },
            getCardById(id) {
                if (id) {
                    return this.finalCards.find(obj => obj.id == id);
                }
            },
            onCardClick() {
                this.hideForm();
            },
            onCancel() {
                if (this.isModal) {
                    this.$emit("command", "close-modal");
                }
            },
            showForm() {
                var options = {};
                if (!this.isModal) {
                    options.modal = true;
                }
                this.selected_card = null;
                this.$emit("command", "show-form", options);
            },
            hideForm() {
                this.$emit("command", "hide-form");
            }
        },
        computed: {
            finalCards() {
                return this.cards.concat(this.options.newCards);
            }
        },
        watch: {
            "options.selectedCardId": function (id) {
                if (id) {
                    this.selected_card = id;
                }
            }
        }
    };
</script>
