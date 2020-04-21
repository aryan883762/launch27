import { abilitiesPlugin } from '@casl/vue'
import Vue from 'vue'
import {defaultAbilities} from '@/utils/auth/ability.js'

Vue.use(abilitiesPlugin, defaultAbilities);