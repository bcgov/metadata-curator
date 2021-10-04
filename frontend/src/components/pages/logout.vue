<template>
    <v-container>
        <v-row>
            <v-col cols=12>
                <h1>{{$tc('Metadata Curator')}}</h1>
            </v-col>
        </v-row>
        <v-row wrap>
            {{$tc('You have been logged out')}}
            
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
