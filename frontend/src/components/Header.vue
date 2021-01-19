<template>
    <v-container fluid ma-0 pa-0>
        <v-app-bar>
            <v-toolbar-title class="font-weight-light">{{title}}</v-toolbar-title>

            <div v-show="loggedIn && (tabs.length > 0)">
                <v-tabs v-model="activeTab"
                        icons-and-text
                        centered
                        class="noBack"
                        grow>
                    <v-tabs-slider style="opacity: 0;"></v-tabs-slider>
                    <v-tab v-for="tab of tabs" :key="tab.id" :to="tab.route" exact :disabled="tab.disabled" :id="'tab-'+tab.name.toLowerCase()">
                        {{ tab.name }}
                        <v-icon>{{tab.icon}}</v-icon>
                    </v-tab>
                </v-tabs>
            </div>

            <v-spacer></v-spacer>

            <User class="mr-4"></User>

            <v-switch v-model="dark" label="Dark Mode" :class="(this.setTheme ? 'pt-4' : 'pt-4')"></v-switch>

        </v-app-bar>
    </v-container>
</template>

<script>
import { mapState } from 'vuex'
import User from './User'
export default {

    props: {
        title: {
            type: String,
            required: true,
        },
        checkRoute: {
            type: Boolean,
            default: true
        }
    },

    components: {
        User
    },

    data() {
        return {
            dark: this.useDark,
            activeTab: null,
        }
    },

    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
            userPermissions: state => state.user.userPermissions,
            loading: state => state.user.loading,
            useDark: state => state.user.useDark
        }),

        setTheme(){
            if (typeof(this.dark) !== 'undefined'){
                this.$store.commit('user/setUseDark', {useDark: this.dark});
            }
            return false;
        },

        tabs: function(){
          let t = [
              { id: 1, name: "Home", route: `/`, icon: 'mdi-home', disabled: false},
              { id: 2, name: "Uploads", route: `/uploads`, icon: 'mdi-cloud-upload', disabled: false},
              { id: 3, name: "Datasets", route: `/datasets`, icon: 'mdi-folder-open', disabled: false},
              { id: 4, name: "Versions", route: `/versions`, icon: 'mdi-source-fork', disabled: false},

            //   { id: 2, name: "Upload", route: `/upload/new`, icon: 'mdi-upload', disabled: false},
            //   { id: 3, name: "Import", route: `/import`, icon: 'mdi-import', disabled: false },
            //   { id: 4, name: "Guess", route: `/infer`, icon: 'mdi-file-question-outline', disabled: true},
            //   { id: 5, name: "Column", route: `/column`, icon: 'mdi-view-column', disabled: true},
            //   { id: 6, name: "Table", route: `/table`, icon: 'mdi-table', disabled: true},
            //   { id: 7, name: "Provenance", route: `/provenance`, icon: 'mdi-file-document', disabled: true },
            //   { id: 8, name: "Package", route: `/package`, icon: 'mdi-package-variant-closed', disabled: true },
            //   { id: 9, name: "Validate", route: `/validate`, icon: 'mdi-checkbox-marked-circle', disabled: true },
            //   { id: 10, name: "Find & Replace", route: `/findreplace`, icon: 'mdi-file-find', disabled: true },
            //   { id: 11, name: "Submit", route: `/submit`, icon: 'mdi-send', disabled: true }
          ];

          if ( (this.user) && (this.user.isAdmin) ){
              t.push({ id: 12, name: "Admin", route: `/admin`, icon: 'mdi-settings', disabled: false });
          }

          return t;
        },

    },

    watch: {
        loading(){
            this.handleAuth();
        },
        user(){
            this.handleAuth();
        },
        useDark(newVal){
            this.dark = newVal;
            this.$vuetify.theme.dark = this.dark
        }
    },

    methods: {
        handleAuth: function(){
            if (this.checkRoute){
                let requiresAuth = this.$router.currentRoute.path !== '/login';//this.$router.app._route.meta.requiresAuth;
                let requiresNoUser = this.$router.currentRoute.path === '/login';//this.$router.app._route.meta.requiresNoUser;
                if ( (requiresAuth) && (!this.loggedIn) ){
                    this.$router.push('/login');
                }else if ( (requiresNoUser) && (this.loggedIn) ){
                    this.$router.push('/');
                }
            }
        }
    },

    mounted(){
        this.dark = this.useDark;
        this.$vuetify.theme.dark = this.dark
        this.$store.dispatch('user/getCurrentUser');
        this.handleAuth(this.loading);
    }
}
</script>

<style >

.noBack.v-tabs>.v-tabs-bar{
    background: none;
}

</style>
