<template>
    <div>
        <div id="card-element" v-loading="card_loading"></div>
        <label id="card-errors" style="color:red;margin-top: 5px;"></label>
        <div class="flex-row-reverse" style="margin-top: 10px;" v-if="!inline">
            <el-button @click="setupCard" :disabled="!complete" round size="small" type="primary">Save Card</el-button>
            <el-button @click="$emit('close')" round size="small" style="margin-right: 10px;"
                       type="warning">Cancel
            </el-button>

        </div>
    </div>

</template>

<script>

    export default {
        name: 'stripe-card',
        props: {
            rootModel: {
                type: Object,
                required: true
            },
            inline: {
                type: Boolean,
                required: false
            },
            company: {
                type: Object
            }
        },
        data() {
            return {
                stripeAPIToken: process.env.VUE_APP_STRIPE_PK,
                stripe: '',
                elements: '',
                card: '',
                card_loading: false,
                complete: false,
                account: false
            }
        },

        created() {

        },

        mounted() {
            if (this.company) {
                console.log(this.company.payment_methods.stripe_user_id)
            } else {
                console.log(this.$auth.user().company.payment_methods.stripe_user_id)
            }

            if (this.rootModel.account) {
                this.account = this.rootModel.account
            }
            this.configureStripe();
        },

        methods: {

            /*  Configures Stripe by setting up the elements and
                    creating the card element.
                */


            configureStripe() {

                if (this.company) {
                    this.stripe = Stripe(
                        this.stripeAPIToken,
                        {stripeAccount: this.company.payment_methods.stripe_user_id}
                    );
                } else {
                    this.stripe = Stripe(
                        this.stripeAPIToken,
                        {stripeAccount: this.$auth.user().company.payment_methods.stripe_user_id}
                    );
                }

                this.elements = this.stripe.elements();
                this.card = this.elements.create('card');

                this.card.mount('#card-element');


                // Handle real-time validation errors from the card Element.
                this.card.addEventListener('change', (event) => {
                    this.complete = event.complete

                    if (this.complete) {

                        this.$emit('card-ready',)

                    }

                    var displayError = document.getElementById('card-errors');
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                });

            },

            createToken() {
                this.stripe.createToken(this.card).then(function (result) {
                    if (result.error) {
                        // Inform the user if there was an error.
                        var errorElement = document.getElementById('card-errors');
                        errorElement.textContent = result.error.message;
                    } else {
                        // Send the token to your server.
                        this.stripeTokenHandler(result.token);
                    }
                });
            },

            // Submit the form with the token ID.
            stripeTokenHandler(token) {
                // Insert the token ID into the form so it gets submitted to the server
                console.log(token)
            },

            setupCard() {
                this.card_loading = true;
                let billing_details = {}

                if (this.account) {
                    billing_details = {
                        name: this.account.first_name + ' ' + this.account.last_name
                    }
                }

                this.stripe.createPaymentMethod({
                    type: 'card',
                    card: this.card,
                    billing_details: billing_details
                }).then((result) => {
                    // Handle result.error or result.payment_method
                    if (result.paymentMethod && result.paymentMethod.id) {
                        //callback(response.setupIntent.payment_method);
                        //submit card
                        this.card_loading = false
                        //save & attache card
                        this.axios.post('/cards/stripe-card-attach', {
                            accountId: this.account.id,
                            payment_method_id: result.paymentMethod.id
                        })
                            .then(res => {
                                this.$message.success('Card Successfully Added')
                                this.$emit('close')
                            })
                            .catch()
                            .finally(_ => {
                                this.card_loading = false
                            })
                    } else {
                        this.card_loading = false
                        if (result.error) {
                            this.$helpers.errorHandle(result.error.message)
                            var errorElement = document.getElementById('card-errors');
                            errorElement.textContent = result.error.message;
                        }
                    }
                });
            },

            getPaymentMethod(billing_address, cb) {

                if (!billing_address) {
                    if (this.account) {
                        billing_address = {
                            name: this.account.first_name + ' ' + this.account.last_name
                        }
                    } else {
                        billing_address = {}
                    }
                }

                if (!this.complete) {
                    cb(false)
                    return this.$message.error('Invalid card information provided')
                }

                this.card_loading = true;

                this.stripe.createPaymentMethod({
                    type: 'card',
                    card: this.card,
                    billing_details: billing_address
                }).then((result) => {
                    // Handle result.error or result.payment_method

                    if (result.paymentMethod && result.paymentMethod.id) {
                        //submit card
                        this.card_loading = false
                        cb({payment_method_id: result.paymentMethod.id})
                    } else {
                        this.card_loading = false
                        cb(false)
                    }

                    if (result.error) {
                        this.$helpers.errorHandle(result.error.message)
                        var errorElement = document.getElementById('card-errors');
                        errorElement.textContent = result.error.message;
                    }
                })

            }


        }
    }
</script>


<style>

</style>