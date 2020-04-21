export default {
    methods: {
        impersonate(accountId) {
            const impersonate_loading = this.$loading({
                lock: true,
                text: 'Impersonating'
            });
            
            // can't be set in success because profile if fetched before then
            window.localStorage.setItem('masquerade-id', this.$auth.user().id);
            this.$auth.impersonate({
                data: {accountId: accountId},
                success: function () {
                    impersonate_loading.close();
                },
                error: function () {
                    window.localStorage.removeItem('masquerade-id');
                    impersonate_loading.close();
                    this.$helpers.errorHandle("Impersonation failed");
                }
            });
        },
        unimpersonate() {
            const impersonate_loading = this.$loading({
                lock: true,
                text: 'Stoping Impersonation'
            });
            this.$auth.unimpersonate({
                success: function () {
                    window.localStorage.removeItem('masquerade-id');
                    impersonate_loading.close();
                },
                error: function () {
                    impersonate_loading.close();
                    this.$helpers.errorHandle("Failed");
                }
            });
        }
    }
  };