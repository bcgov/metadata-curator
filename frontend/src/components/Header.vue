<template>
    <v-container fluid ma-0 pa-0>
        <v-app-bar dense>
            <v-toolbar-title class="font-weight-light">{{title}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <User></User>

            <v-switch v-model="dark" label="Dark Mode" :class="(this.setTheme ? '' : '')"></v-switch>

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
            dark: this.useDark
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
        }

    },

    watch: {
        loading(newVal){
            this.handleAuth(newVal);
        },
        useDark(newVal){
            this.dark = newVal;
            this.$vuetify.theme.dark = this.dark
        }
    },

    methods: {
        handleAuth: function(loading){
            if (loading && this.checkRoute){
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

<style scoped>

</style>
