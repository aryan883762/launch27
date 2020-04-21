<template>
    <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" :modal-append-to-body="false" :visible.sync="showModal" @close="settingsRedirect" custom-class="fullscreen-modal-display" title="Rating">
        <div class="modal-body">
            <rating-form :booking-id="$route.params.bookingId" />
        </div>

    </el-dialog>
</template>


<script>
    import RatingForm from "@/components/RatingForm";

    export default {
        components: {
            RatingForm
        },
        data() {
            return {
                showModal: false,
            }
        },
        mounted() {
            this.showModal = true
        },
        methods: {
            settingsRedirect() {
                if (this.$auth.check()) {
                    this.$router.push({name: 'dashboard'})
                } else {
                    this.$router.push({name: 'login'})
                }

            }
        }
    }
</script>

