<template>
  <div></div>
</template>

<script>
export default {
  created() {
    let redirectTo;

    if (this.$auth.check()) {
      if (this.$can("manage", "role_customer")) {
          redirectTo = "customer_bookings_new";
      } else  if (this.$can("manage", "role_admin")) {
          redirectTo = "dashboard_booking_new";
      }
    } else {
      redirectTo = "landing_page";
    }
    this.$router.push({ name: redirectTo, query: this.$route.query });
  }
};
</script>
