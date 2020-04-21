import base from '../base';
import { Frequency } from 'rrule';

export default {
    name: 'bookingFormEditorFormComponentTemplatesFrequencies',
    mixins: [base],
    data() {
        return {
        }
    },
    mounted() {
        (async()=>{
            try{
                //set frequency_id - frequency_id=5e3b4f1a7f50f2197213bb2c

                //check and set default frequency
                let result = await this.axios.get('/companies/current/frequencies/', {params: {filter: {where: {default : true}}}});
                let default_frequency = result && result.data && result.data.length > 0 ? result.data[0] : false;
                if (default_frequency){
                    this.onFrequencySelect(default_frequency);
                    this.$store.state.bookingFormEditor.form.frequencyId = default_frequency.id;
                }


                if (this.$route.query.frequency_id) {
                    let freq_id = decodeURIComponent(this.$route.query.frequency_id)
                    let frequency = null;
                    if(Number(freq_id)){
                        let result = await this.axios.get('/companies/current/frequencies/', {params: {filter: {where: {oldVersionId: freq_id}}}});
                        frequency = result && result.data && result.data.length > 0 ? result.data[0] : null;
    
                    }else{
                        frequency = (await this.axios.get('/companies/current/frequencies/' + freq_id )).data;
                    }
                    if(frequency && frequency.active){
                        this.onFrequencySelect(frequency);
                        this.$store.state.bookingFormEditor.form.frequencyId = frequency.id;
                    }
                }


            }catch(err){console.log(err)}            
        })()
    },
    methods: {
        onFrequencySelect(frequency) {
            if (!this.editorMode) {
                this.$set(this.form, this.item.formId, frequency.id);
                this.$events.emitEvent('BookingFormEditor:updatePricing');
                if (this.hasValidation) {
                    this.$events.emitEvent('BookingFormEditor:resetFieldValidation', [this.itemId]);
                    this.$events.emitEvent('BookingFormEditor:validateField', [this.itemId]);
                }
            }
        },
        isFrequencySelected(frequency) {
            var out = false;
            if (this.form.hasOwnProperty(this.item.formId)) {
                out = this.form[this.item.formId] == frequency.id;
            }
            return out;
        },
    },
    computed: {
        frequencies() {
            return this.$store.state.bookingFormEditor.frequencies.filter(item => item.active);
        },
    }
}