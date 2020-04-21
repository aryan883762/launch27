<template>
    <div v-if="rating">
        Rating
    </div>
    <p v-else>No rating was provided by customer</p>
</template>

<script>
    export default {
        name: 'booking-rating',
        props: {
            bookingId: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                loading: false,
                rating: false
            }
        },
        created() {

        },
        mounted() {
            this.getBookingRating()
        },
        methods: {
            getBookingRating() {
                this.loading = true

                this.axios.get('/bookings/' + this.bookingId + '/rating')
                    .then(res => {
                        this.rating = res.data
                    })
                    .catch(err => {
                       // this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            }
        }
    }
</script>