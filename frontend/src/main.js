import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import App from './App.vue';

import 'es6-promise/auto';

import store from './store';
import router from './router';

Vue.config.productionTip = false;

new Vue({
    vuetify: vuetify,
    render: h => h(App),
    router,
    store,
}).$mount('#app');