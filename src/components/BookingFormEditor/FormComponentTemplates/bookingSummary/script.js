// import base from '../base';

// export default {
//     name: 'bookingFormEditorFormComponentTemplatesBookingSummary',
//     mixins: [base],
//     data() {
//         return {
//             affixOptions: {},
//         }
//     },
//     created() {
//     },
//     mounted() {
//         if (!this.editorMode) {
//             this.affixOptions = {
//                 scrollable: window,
//                 el: this.$el,
//             };

//             setTimeout(() => {
//                 this.affixInit();
//             }, 1000);

//             window.addEventListener('resize', this.affixInit, false);
//         }
//     },
//     methods: {
//         affixInit() {
//             if (window.innerWidth > 767) {
//                 var elRect = this.affixOptions.el.getBoundingClientRect();
//                 this.affixOptions.elTop = window.pageYOffset + elRect.top;
//                 if (this.affixOptions.el) {
//                     this.affixOptions.elWidth = this.affixOptions.el.getBoundingClientRect().width;
//                     if (elRect.top < 0) {
//                         this.affixApply();
//                     }
//                     this.affixOptions.scrollable.addEventListener('scroll', this.affixOnScroll, false);
//                 }
//             }
//             else {
//                 if (this.affixOptions.el) {
//                     this.affixOptions.scrollable.removeEventListener('scroll', this.affixOnScroll, false);
//                     this.affixReset();
//                 }
//             }
//         },
//         affixOnScroll() {
//             var scrollTop = this.affixOptions.scrollable.pageYOffset !== undefined ? this.affixOptions.scrollable.pageYOffset : this.affixOptions.scrollable.scrollTop;
//             if (scrollTop > this.affixOptions.elTop) {
//                 this.affixApply();
//             }
//             else {
//                 this.affixReset();
//             }
//         },
//         affixApply() {
//             this.affixOptions.el.style.top = '0';
//             this.affixOptions.el.style.position = 'fixed';
//             this.affixOptions.el.style.width = this.affixOptions.elWidth + 'px';
//         },
//         affixReset() {
//             this.affixOptions.el.style.top = 'initial';
//             this.affixOptions.el.style.position = 'relative';
//             this.affixOptions.el.style.width = 'auto';
//         }
//     },
//     computed: {
//         pricing() {
//             return this.$store.state.bookingFormEditor.pricing;
//         },
//     }
// }