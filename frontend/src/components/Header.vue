<template>
    <span style="display: none"></span>
</template>

<script>
import { mapState } from 'vuex'
export default {

    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
            userPermissions: state => state.user.userPermissions,
            loading: state => state.user.loading
        })
    },

    watch: {
        loading(newVal){
            this.handleAuth(newVal);
        }
    },

    methods: {
        handleAuth: function(loading){
            if (!loading){
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
        this.$store.dispatch('user/getCurrentUser');
        this.handleAuth(this.loading);
    }
}
</script>

<style scoped>

</style>