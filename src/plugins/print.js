import Vue from 'vue';
import VueHtmlToPaper from 'vue-html-to-paper';

const options = {
    name: '_blank',
    specs: [
        'fullscreen=yes',
        'titlebar=yes',
        'scrollbars=yes'
    ],
    styles: [
        './print.css'
    ]
}

Vue.use(VueHtmlToPaper, options);