<template>
    <div id="app">
        <main v-if="!turn_off">
            <fade-transition :duration="250" mode="out-in" origin="center">
                <template v-if="$subdomain.error">
                    <error-404/>
                </template>
                <template v-else>
                    <router-view v-if="$auth.ready() && $subdomain.ready"/>
                    <div class="main-loading" v-if="!($auth.ready() && $subdomain.ready)" v-loading="true"></div>
                </template>
            </fade-transition>
        </main>
        <h2 v-if="turn_off" style="margin-top: 100px; text-align: center">
            Thank you for providing feedback on your First Look.
            <br/> <br/>
            You helped us identify critical areas of need that we want to address.

            <br/> <br/>
            So, we are hard at work incorporating that feedback to make v2 even better than before. <br/> <br/>
            The First Look environment has been shut down in the meantime to make those changes.
            <br/> <br/>
            Feel free to reach out to support@launch27.com with any questions!
        </h2>
    </div>
</template>

<script>

    import {initializeFirebase} from "./pushNotification";
    window.jQuery = window.jquery = window.$ = require("jquery");
    export default {
        name: "App",
        components: {
            "error-404": require("@/views/auth/404").default
        },

        data() {
            return {
                refreshing: false,
                registration: null,
                updateExists: false,
                testing: true,
                turn_off: false
            }
        },

        watch: {},

        created() {
            // Listen for swUpdated event and display refresh snackbar as required.

            initializeFirebase(this);

            document.addEventListener('swUpdated', this.showRefreshUI, {once: true});
            // Refresh all open app tabs when a new service worker is installed.
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (this.refreshing) return;
                this.refreshing = true;
                window.location.reload();
            });

            this.turn_off = (process.env.VUE_APP_TURN_OFF && process.env.NODE_ENV === 'production')

        },

        methods: {
            getHeaders() {
                return {Authorization: this.$auth.token()};
            },
            getFileUrl() {
                return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
            },
            notProductionReady() {
                return (process.env.NODE_ENV === 'development')
            },

            showRefreshUI(e) {
                // Display a button inviting the user to refresh/reload the app due
                // to an app update being available.
                // The new service worker is installed, but not yet active.
                // Store the ServiceWorkerRegistration instance for later use

                this.registration = e.detail;
                this.updateExists = true;

                let toast = this.$toasted.show("NEW VERSION", {
                    theme: "toasted-primary",
                    position: "top-center",
                    duration: null,
                    fitToScreen: true,
                    action: {
                        text: 'Click here to update',
                        onClick: (e, toastObject) => {
                            toastObject.goAway(0);
                            this.refreshApp()
                        }
                    },
                });

            },
            refreshApp() {
                // Handle a user tap on the update app button.
                this.updateExists = false;
                // Protect against missing registration.waiting.
                if (!this.registration || !this.registration.waiting) {
                    return;
                }
                this.registration.waiting.postMessage('skipWaiting');
            },
        },
        mounted(){
            setInterval(()=>{
              if(document.querySelector('input[placeholder="Start date"]')) {
                    if(window.matchMedia("(max-width: 767px)").matches) {
                        // The viewport is less than 768 pixels wide
                        document.querySelector('input[placeholder="Start date"]').addEventListener('click', function() {
                            $('.el-date-range-picker__content.is-left').attr('style', 'display: block !important');
                            $('.el-date-range-picker__content.is-right').attr('style', 'display: none !important');
                        });
                        document.querySelector('input[placeholder="End date"]').addEventListener('click', function() {
                            $('.el-date-range-picker__content.is-right').attr('style', 'display: block !important');
                            $('.el-date-range-picker__content.is-left').attr('style', 'display: none !important');
                        });
                    }else {
                            $('.el-date-range-picker__content.is-right').attr('style', 'display: block !important');
                            $('.el-date-range-picker__content.is-left').attr('style', 'display: block !important');
                    }
              }
            },100)
      
        }
    };
</script>

<style lang="scss">
    @import "@/theme/app.scss";

    .app-update {
        background: black !important;
        cursor: pointer;

        .el-notification__title {
            color: white;
        }
    }

    .toasted-container .toasted {
        top: 0 !important;
        border-radius: 5px;
        font-size: 12px !important;
    }

    .toasted .primary, .toasted.toasted-primary {
        top: 0px;
        border-radius: 2px;
        min-height: 38px;
        line-height: 1.1em;
        background-color: #2196F3;
        padding: 0px 20px !important;
        font-size: 15px;
        font-weight: 300;
        color: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, .12), 0 1px 2px rgba(0, 0, 0, .24);


        .action {
            text-decoration: none;
            font-size: 12px !important;
            padding: 0px;
            margin: 0px;
            color: white;
        }
    }


</style>
