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
            <v-col v-if="userLoading" cols=12>
                {{$tc('Getting Activity...')}}
                <v-progress-circular
                    indeterminate
                ></v-progress-circular>
            </v-col>
            <v-col v-else-if="noUpdates" cols=12>
                {{$tc("No new activity since you last logged in. You're all caught up")}}
            </v-col>
            <v-col v-else-if="user && user.activity" cols=12>
                <v-row v-for="(activity, key) in user.activity" :key="'newActivity-'+key">
                    <v-col cols=12>
                        <span v-if="key === 'comments'">{{activity.length}} new {{$tc("Comments", activity.length)}}</span>
                        <router-link v-else-if="key !== 'branches'" :to="{name: $tc(key, 2).toLowerCase()}">{{activity.length}} new {{$tc(key, activity)}}</router-link>
                        <router-link v-else :to="{name: 'versions'}">{{activity.length}} new {{$tc(key, activity)}}</router-link>
                    </v-col>
                    <v-col cols=12 v-if="activity.length > 0">
                        <ul>
                        <li v-for="(item, index) in activity.slice(0,10)" :key="'activity-line-'+key+'-'+index">
                            <router-link 
                                v-if="key === 'comments'" 
                                :to="{name: (item.type === 'repo') ? 'datasets_form' : (item.type === 'branch') ? 'version_form' : (item.type === 'varClass') ? 'variableClassificationForm' : 'upload_view', params: { id: item.item_id }}">
                                    {{item.author_user}} on {{$tc(item.type)}} - {{item.name}}
                            </router-link>
                            <router-link v-else-if="key === 'uploads'" :to="{name: 'upload_view', params: { id: item._id }}">{{item.name}}</router-link>
                            <router-link v-else-if="key === 'repos'" :to="{name: 'datasets_form', params: { id: item._id }}">{{item.name}}</router-link>
                            <router-link v-else :to="{name: 'version_form', params: { id: item._id }}">{{item.name}}</router-link>
                        </li>
                        </ul>
                    </v-col>
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
            userLoading: state => state.user.loading,
        }),
        noUpdates: function(){
            let noUpdates = true;
            if (this.user && this.user.activity){
                let keys = Object.keys(this.user.activity);
                for (let i=0; i<keys.length; i++){
                    if (this.user.activity[keys[i]].length > 0){
                        noUpdates = false;
                    }
                }
            }
            return noUpdates;
        }
    },
}
</script>
<style scoped>
</style>
