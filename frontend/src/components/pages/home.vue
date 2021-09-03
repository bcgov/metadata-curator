<template>
    <v-container>
        <v-row>
            <v-col cols=12>
                <h1>{{$tc('Welcome to')}} {{$tc('Metadata Curator')}}</h1>
            </v-col>
        </v-row>
        <v-row wrap>
            <v-col v-if="user && user.lastLogin" cols=12>
                {{$tc('You last logged in')}}: {{user.lastLogin | formatDate}}
            </v-col>
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
        })
    },
}
</script>
<style scoped>
</style>
