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

        <v-row wrap>
            <v-col cols=12>
                <h2>Recent Activity</h2>
            </v-col>
            <v-col v-if="noUpdates" cols=12>
                {{$tc("No new activity since you last logged in. You're all caught up")}}
            </v-col>
            <v-col v-else-if="user && user.activity" cols=12>
                <v-row v-for="(activity, key) in user.activity" :key="'newActivity-'+key">
                    <router-link v-if="key !== 'branches'" :to="{name: $tc(key, 2).toLowerCase()}">{{activity}} new {{$tc(key, activity)}}</router-link>
                    <router-link v-else :to="{name: 'versions'}">{{activity}} new {{$tc(key, activity)}}</router-link>
                </v-row>
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
        }),
        noUpdates: function(){
            let keys = Object.keys(this.user.activity);
            let noUpdates = true;
            for (let i=0; i<keys.length; i++){
                if (this.user.activity[keys[i]] > 0){
                    noUpdates = false;
                }
            }
            return noUpdates;
        }
    },
}
</script>
<style scoped>
</style>
