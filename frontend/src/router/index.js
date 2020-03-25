import Vue from 'vue'
import Router from 'vue-router'

const home = () => import(/* webpackChunkName: "home" */ "../components/pages/home");
const importSchema = () => import(/* webpackChunkName: "import" */ "../components/pages/importSchema");
const dataUploadRevisions = () => import(/* webpackChunkName: "dataUploadRevisions" */ "../components/pages/dataUploadRevisions");
const NotFound = () => import(/* webpackChunkName: "NotFound" */ "../components/pages/404");

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
      name: 'login',
      component: home,
      meta: {
        title: "Login",
        requiresNoUser: true
      }
    },
    {
      path: '/logout',
      name: 'logout',
      component: home,
      meta: {
        title: "Logout",
        requiresAuth: true
      }
    },
    {
      path: '/import',
      name: 'import',
      component: importSchema,
      meta: {
          title: "Import",
          requiresAuth: true
      }
    },
    {
      path: '/dataUploadRevisions/:id',
      name: 'data-upload-revisions',
      component: dataUploadRevisions,
      meta: {
          title: "Data Upload Revisions",
          requiresAuth: true
      }
    },
    {
      path: '*',
      component: NotFound,
      meta: {
          title: "404 - Page Not Found"
      }
    }
  ]
});


r.beforeEach((to, from, next) => {

  if (to.path === "/login"){
    window.location.href = "/api/login";
  }else if (to.path === "/logout"){
      window.location.href = "/api/logout";
  }else{

    //document.title = i18n.tc(to.meta.title);
    document.title = "Metadata Generation Tool - " + to.meta.title;
    next();
  }


});


export default r;
