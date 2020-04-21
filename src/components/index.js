import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import InlineSvg from 'vue-inline-svg';
import draggable from 'vuedraggable'

library.add(fas, far);
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.component('inline-svg', InlineSvg);
Vue.component('draggable', draggable);

Vue.component('FormComponent', require('@/components/BookingFormEditor/FormComponent/component.vue').default);
