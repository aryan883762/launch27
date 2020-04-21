<template>
  <div class="">
    <booking-form-editor :booking-form-id="$route.params.id" :editor-mode="false" :is-quote-form="$route.name === 'quote-form'"/>
  </div>
</template>

<script>
    import BookingFormEditor from "@/components/BookingFormEditor/component.vue";

    export default {
        name: "BookingFormPage",
        components: {
            BookingFormEditor
        }
    };
</script>
