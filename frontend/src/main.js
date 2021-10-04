import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import App from './App.vue';
import moment from 'moment'
import VueI18n from 'vue-i18n';

import 'es6-promise/auto';

import store from './store';
import router from './router';

Vue.config.productionTip = false;

Vue.filter('formatDate', function(value) {
    if (value) {
        return moment(String(value)).format('MMM D, YYYY')
    }
});


Vue.use(VueI18n);
var locale = (window.navigator.userLanguage || window.navigator.language).substring(0,2);
var messages = require('./i18n/en').default;
if (locale == "fr"){
  Object.assign(messages, require('./i18n/fr').default);
}
// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: locale,
    fallbackLocale: 'en',
    messages, // set locale messages
    silentFallbackWarn: process.env.NODE_ENV === "production"
  });

router.beforeEach((to, from, next) => {
    let num = (to.meta.title[to.meta.title.length-1] === 's') ? 2 : 1
    
    document.title = i18n.tc(to.meta.title, num);
    next();
});
  

new Vue({
    vuetify: vuetify,
    render: h => h(App),
    router,
    store,
    i18n
}).$mount('#app');
