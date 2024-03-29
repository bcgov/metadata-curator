import Vue from 'vue'
import Router from 'vue-router'
import store from '../store/index'

const home = () => import(/* webpackChunkName: "home" */ "../components/pages/home");
const dataUploadDetail = () => import(/* webpackChunkName: "dataUploadDetail" */ "../components/pages/dataUploadDetail")
const uploads = () => import(/* webpackChunkName: "uploads" */ "../components/pages/uploads");
const versions = () => import(/* webpackChunkName: "versions" */ "../components/pages/versions");
const version = () => import(/* webpackChunkName: "version" */ "../components/pages/version");
const datasets = () => import(/* webpackChunkName: "datasets" */ "../components/pages/datasets");
const datasetForm = () => import(/* webpackChunkName: "datasetForm" */ "../components/pages/datasetForm");
const uploadOld = () => import(/* webpackChunkName: "upload" */ "../components/pages/uploadOld");
const upload = () => import(/* webpackChunkName: "upload" */ "../components/pages/upload");
const Admin = () => import(/* webpackChunkName: "Admin" */ "../components/pages/Admin");
const NotFound = () => import(/* webpackChunkName: "NotFound" */ "../components/pages/404");
const LoggedOut = () => import(/* webpackChunkName: "LoggedOut" */ "../components/pages/logout");
const user = () => import(/* webpackChunkName: "user" */ "../components/pages/user");
const publishedVersion = () => import(/* webpackChunkName: "publishedVersion" */ "../components/pages/publishedVersion");
const options = () => import(/* webpackChunkName: "options" */ "../components/pages/options");
const option = () => import(/* webpackChunkName: "options" */ "../components/pages/option");

const variableClassifications = () => import(/* webpackChunkName: "variableClassifications" */ "../components/pages/variableClassifications");
const variableClassification = () => import(/* webpackChunkName: "variableClassificationForm" */ "../components/pages/variableClassificationForm");
const publishedVariableClassificationForm = () => import(/* webpackChunkName: "publishedVariableClassification" */ "../components/pages/publishedVariableClassification");
const Search = () => import(/* webpackChunkName: "Search" */ "../components/pages/Search");

const projects = () => import(/* webpackChunkName: "projects" */ "../components/pages/projects");
const project = () => import(/* webpackChunkName: "projectForm" */ "../components/pages/projectForm");

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
          requiresAuth: true,
          phase: 2
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
      path: '/loggedout',
      name: 'loggedout',
      component: LoggedOut,
      meta: {
        title: "Logged out",
        requiresNoUser: true
      }
    },
    {
      path: '/upload/:id',
      name: 'upload_view',
      component: upload,
      meta: {
          title: "Uploads",
          requiresAuth: true
      },
    },
    {
      path: '/upload_old/:id',
      name: 'old_upload_view',
      component: uploadOld,
      meta: {
          title: "Uploads (Deprecated)",
          requiresAuth: true
      },
    },
    {
      path: '/uploads',
      name: 'uploads',
      component: uploads,
      meta: {
          title: "Uploads",
          requiresAuth: true
      }
    },
    {
      path: '/user',
      name: 'user',
      component: user,
      meta: {
          title: "User Info",
          requiresAuth: true
      }
    },
    {
      path: '/datasets',
      name: 'datasets',
      component: datasets,
      meta: {
          title: "Datasets",
          requiresAuth: true,
          phase: 2
      }
    },
    {
      path: '/datasets/:id',
      name: 'datasets_form',
      component: datasetForm,
      meta: {
          title: "Dataset",
          requiresAuth: true,
          phase: 2
      }
    },
    {
      path: '/versions',
      name: 'versions',
      component: versions,
      meta: {
          title: "Versions",
          requiresAuth: true,
          phase: 2
      }
    },
    {
      path: '/version/:id',
      name: 'version_form',
      component: version,
      meta: {
          title: "Version",
          requiresAuth: true,
          phase: 2
      }
    },
    {
      path: '/pub/v/:id',
      name: 'published_version',
      component: publishedVersion,
      meta: {
          title: "Version",
          requiresAuth: false,
          phase: 2
      }
    },
    {
      path: '/upload',
      name: 'upload',
      component: upload,
      meta: {
          title: "Upload",
          requiresAuth: true
      }
    },
    {
      path: '/upload_old',
      name: 'upload_old',
      component: uploadOld,
      meta: {
          title: "Upload (Deprecated)",
          requiresAuth: true
      }
    },
    {
      path: '/dataUpload/:id',
      name: 'data-upload-detail',
      component: dataUploadDetail,
      meta: {
          title: "Data Upload Detail",
          requiresAuth: true
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: {
          title: "Admin",
          requiresAuth: true
      }
    },
    {
      path: '/variable-classifications',
      name: 'variableClassifications',
      component: variableClassifications,
      meta: {
          title: "Variable Classifications",
          requiresAuth: true,
          phase: 2
      }
    },
    {
      path: '/variable-classification/:id',
      name: 'variableClassificationForm',
      component: variableClassification,
      meta: {
          title: "Variable Classification",
          requiresAuth: true,
          phase: 2
      }
    },
    {
      path: '/pub/c/:id',
      name: 'publishedVariableClassification',
      component: publishedVariableClassificationForm,
      meta: {
          title: "Variable Classification",
          requiresAuth: false,
          phase: 2
      }
    },
    {
      path: '/options',
      name: 'options',
      component: options,
      meta: {
          title: "Options",
          requiresAuth: true,
          phase: 3
      }
    },
    {
      path: '/option/:id',
      name: 'optionForm',
      component: option,
      meta: {
          title: "Option",
          requiresAuth: true,
          phase: 3
      }
    },
    {
        path: '/search',
        name: 'search',
        component: Search,
        meta: {
            title: "Search",
            requiresAuth: true
        }
    },
    {
      path: '/projects',
      name: 'projects',
      component: projects,
      meta: {
          title: "Projects",
          requiresAuth: true,
          phase: 2
      }
    },
    {
      path: '/project/:id',
      name: 'projectForm',
      component: project,
      meta: {
          title: "Project",
          requiresAuth: true,
          phase: 2
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


r.beforeEach(async(to, from, next) => {

  if (to.path.indexOf("/login") === 0){
    window.location.href = "/api"+to.fullPath;
  }else if (to.path === "/logout"){
      await store.dispatch('user/removeUser');
      window.location.href = "/api/logout";
  }else if (to.path === "/loggedout"){
    document.title = "Metadata Curator - " + to.meta.title;
    next();
  }else{
    await store.dispatch('user/getCurrentUser');
    let enabledPhase = await store.dispatch('config/getItem', {field: 'key', value: 'enabledPhase', def: {key: 'enabledPhase', value: '1'}});
    let loggedIn = store.state.user.loggedIn;

    //document.title = i18n.tc(to.meta.title);
    // document.title = "Metadata Curator - " + to.meta.title;

    //let requiresAuth = to.meta.requiresAuth;

    let requiresNoUser = to.meta.requiresNoUser;

    let phase = (to.meta.phase) ? to.meta.phase : 1;

    /*if ( (requiresAuth) && (!loggedIn) ){
      return next('/login?r='+to.path.substring(1));
    }else */if ( (requiresNoUser) && (loggedIn) ){
      return next('/');
    }

    if (enabledPhase.value < phase){
      return next('/uploads');
    }

    next();
  }


});


export default r;
