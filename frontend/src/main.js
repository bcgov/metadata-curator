import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import App from './App.vue';
import moment from 'moment'

import 'es6-promise/auto';

import store from './store';
import router from './router';

Vue.config.productionTip = false;

Vue.filter('formatDate', function(value) {
    if (value) {
        return moment(String(value)).format('MMM D, YYYY')
    }
});

new Vue({
    vuetify: vuetify,
    render: h => h(App),
    router,
    store,
}).$mount('#app');
