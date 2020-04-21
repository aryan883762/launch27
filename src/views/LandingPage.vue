<template>
  <div></div>
</template>

<script>
export default {
  created() {
    let redirectTo;

    if (this.$can("manage", "role_customer")) {
      redirectTo = "customer_dashboard";
    } else if (this.$can("manage", "role_team")) {
      redirectTo = "team_dashboard";
    } else if (this.$can("manage", "role_admin")) {
      redirectTo = "dashboard";
    } else if (this.$can("manage", "role_super_admin")) {
      redirectTo = "superadmin_companies";
    } else if (this.$can("manage", "role_anonymous")) {
      redirectTo = "login";
    } else {
      redirectTo = "dashboard_getting_started";
    }
    this.$router.push({ name: redirectTo });
  }
};
</script>
