<template>
  <vl-calendar
    :is-selected="date => date === selectedDate"
    :single-month="singleMonth"
    :is-disabled="calculateDisabled"
    @input="date => emitDate(date)"
    ref="calendar"
  />
</template>

<script>
    import VlCalendar from './vl-calendar'

    export default {
        name: 'VlDaySelector',
        model: {
            prop: 'selectedDate'
        },

        components: {
            VlCalendar
        },

        props: {
            selectedDate: String,
            singleMonth: Boolean,
            disabledDates: Object,
        },

        methods: {
            emitDate(date) {
                this.$emit('input', date);
                this.$emit('focus');
                this.$emit('changed', date)
            },
            calculateDisabled (date) {
                const isDisabled = this.isDisabled || (() => false)

                if (this.disabled) {
                    return true
                } else if (this.startDate && !this.endDate) {
                    return isDisabled(date) || (!this.enableSingleDate && date === this.startDate)
                } else if (this.disabledDates) {
                    if (this.disabledDates.from) {
                        return date >= this.disabledDates.from
                    } else if (this.disabledDates.to) {
                        return date <= this.disabledDates.to
                    }
                } else {
                    return isDisabled(date)
                }
            }
        }
    }
</script>
