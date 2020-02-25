import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import App from './App.vue';

import 'es6-promise/auto';

import router from './router';

import store from './store';

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
  //document.title = i18n.tc(to.meta.title);
  document.title = to.meta.title;
  next();
});

new Vue({
    vuetify,
    render: h => h(App),
    router,
    store,
}).$mount('#app');