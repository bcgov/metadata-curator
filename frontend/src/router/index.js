import Vue from 'vue'
import Router from 'vue-router'

const home = () => import(/* webpackChunkName: "home" */ "../components/pages/home");

Vue.use(Router)
let r = new Router({
  mode: "history",
  routes: [
    {
      path: '/',
      name: 'home',
      component: home,
      meta: {
          title: "Home",
          requiresAuth: true
      }
    },
    { 
      path: '/login',
      name: 'Login',
      component: home,
      meta: {
        title: "Login",
        requiresNoUser: true
      }
    }
  ]
});


r.beforeEach((to, from, next) => {
  
  if (to.path === "/login"){
    window.location.href = "/api/login";
  }else{
  
    //document.title = i18n.tc(to.meta.title);
    document.title = "Metadata Generation Tool - " + to.meta.title;
    next();
  }
  

});


export default r;