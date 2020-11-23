import Vue from 'vue'
import Router from 'vue-router'

const home = () => import(/* webpackChunkName: "home" */ "../components/pages/home");
const dataUploadDetail = () => import(/* webpackChunkName: "dataUploadDetail" */ "../components/pages/dataUploadDetail")
const uploads = () => import(/* webpackChunkName: "uploads" */ "../components/pages/uploads");
const versions = () => import(/* webpackChunkName: "versions" */ "../components/pages/versions");
const version = () => import(/* webpackChunkName: "version" */ "../components/pages/version");
const datasets = () => import(/* webpackChunkName: "datasets" */ "../components/pages/datasets");
const datasetForm = () => import(/* webpackChunkName: "datasetForm" */ "../components/pages/datasetForm");
const upload = () => import(/* webpackChunkName: "upload" */ "../components/pages/upload");
const importSchema = () => import(/* webpackChunkName: "import" */ "../components/pages/importSchema");
const dataUploadRevisions = () => import(/* webpackChunkName: "dataUploadRevisions" */ "../components/pages/dataUploadRevisions");
const Admin = () => import(/* webpackChunkName: "Admin" */ "../components/pages/Admin");
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
      path: '/upload/:id',
      name: 'upload_view',
      component: upload,
      meta: {
          title: "Upload",
          requiresAuth: true
      },
      // beforeEnter(to, from, next) {
      //   console.log('beforeEnter: upload');
      //   // console.log("activeTab: ", $root.activeTab);
      //   console.log("before route change to: ", to);
      //   console.log("before route change from: ", from);
      //
      //     // console.log("app: ", this.$router.app);
      //     if(to.name === 'upload') {
      //         console.log("upload route");
      //         if (to.path.toString() === '/upload/new') {
      //             console.log("upload new to path");
      //             console.log("this.tabs: ", this.tabs);
      //             const matchTab = this.tabs.find(tabItem => tabItem.name === "Upload");
      //             console.log("matchTab: ", matchTab);
      //         } else {
      //             console.log("else");
      //             const regex = /\/upload\/(.{21})/;
      //             const matches = regex.exec(to.path);
      //             if(matches) {
      //                 console.log("match: " + matches[1]);
      //                 let matchTab = this.tabs.find(tabItem => tabItem.name === "Upload");
      //                 console.log("matchTab: ", matchTab);
      //                 this.uploadId = matches[1];
      //                 // matchTab.route = `/upload/${matches[1]}`;
      //                 console.log("this.tabs: ", this.tabs);
      //                 // this.$router.push({ name: 'upload', params: { id: this.upload._id } });
      //                 this.$router.push({ name: 'upload' });
      //             }
      //         }
      //     }
      //
      //   next();
      //  },
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
      path: '/datasets',
      name: 'datasets',
      component: datasets,
      meta: {
          title: "Datasets",
          requiresAuth: true
      }
    },
    {
      path: '/datasets/:id',
      name: 'datasets_form',
      component: datasetForm,
      meta: {
          title: "Dataset",
          requiresAuth: true
      }
    },
    {
      path: '/versions',
      name: 'versions',
      component: versions,
      meta: {
          title: "Versions",
          requiresAuth: true
      }
    },
    {
      path: '/version/:id',
      name: 'version_form',
      component: version,
      meta: {
          title: "Version",
          requiresAuth: true
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
      path: '/dataUpload/:id',
      name: 'data-upload-detail',
      component: dataUploadDetail,
      meta: {
          title: "Data Upload Detail",
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
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: {
          title: "Admin",
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
    document.title = "Metadata Curator - " + to.meta.title;
    next();
  }


});


export default r;
