<template>
    <v-container>
        <v-row>
            <v-col cols=12>
                <h1>{{user.displayName}}</h1>
            </v-col>
            <v-col cols=12>
                <div>{{$tc('Group', 2)}}: <span v-for="group in user.groups" :key="group">{{group}}, </span></div>
            </v-col>
            <v-col cols=12>{{$tc('Logged In')}}: {{loggedIn}}</v-col>
            <v-col cols=12>{{$tc('Permission', 2)}}: {{userPermissions}}</v-col>
            <v-col cols=12>{{$tc('Loading')}}: {{loading}}</v-col>
            <v-col cols=12>{{$tc('Dark Mode')}}: {{useDark}}</v-col>
            <v-col cols=12>{{$tc('Can Upload')}}: {{canUpload}}</v-col>
            <v-col cols=12>{{$tc('JWT')}}: {{jwt}}</v-col>
        </v-row>
        
    </v-container>
</template>
<script>

import {mapState} from 'vuex';

export default {
    components:{
    },
    created() {
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
            userPermissions: state => state.user.userPermissions,
            loading: state => state.user.loading,
            useDark: state => state.user.useDark,
            canUpload: state => state.user.canUpload,
            jwt: state => state.user.jwt,
        })
    },
}
</script>
<style scoped>
</style>
