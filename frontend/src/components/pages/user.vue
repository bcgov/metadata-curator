<template>
    <v-container>
        <v-row>
            <v-col cols=12>
                <h1>{{user.displayName}}</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=2>
                <v-img ma-0 pa-0 :src="userImage" :alt="alt" height="200px" width="200px" contain v-on="on"></v-img>
            </v-col>
            <v-col cols=10>
                <v-row class="bordered" v-if="enabledPhase >= 3">
                    <v-col cols=12>
                        <h3>BCDC Data Catalogue Info</h3>
                    </v-col>
                    <v-col cols=12 v-if="!editing">
                        <v-btn @click="editing = true">Edit</v-btn>
                    </v-col>
                    <v-col cols=12 v-else-if="editing">
                        <v-btn @click="save">Save</v-btn>
                    </v-col>
                    <v-col cols=12 v-if="!editing">
                        {{ (user.bcdcSet) ? 'Configured' : "Not Configured"}}
                    </v-col>
                    <v-col cols=12 v-if="editing">
                        <TextInput
                            :label="$tc('Api Key',1)"
                            placeholder=""
                            name="bcdc_apiKey"
                            :editing="editing"
                            value=""
                            helpPrefix="user"
                            @blur="(event) => { settableUserInfo.bcdc_apiKey = event.target.value }"
                        ></TextInput>
                    </v-col>
                    <v-col cols=12 v-if="editing">
                        <TextInput
                            :label="$tc('Access Key',1)"
                            placeholder=""
                            name="bcdc_accessKey"
                            :editing="editing"
                            value=""
                            helpPrefix="user"
                            @blur="(event) => { settableUserInfo.bcdc_accessKey = event.target.value }"
                        ></TextInput>
                    </v-col>
                    <v-col cols=12 v-if="editing">
                        {{$tc('NOTE: In order to set either api key or access key you must set both!')}}
                    </v-col>
                </v-row>
                <v-col cols=12>
                    <div>{{$tc('Group', 2)}}: <span v-for="group in user.groups" :key="group">{{group}}, </span></div>
                </v-col>
                <v-col cols=12>{{$tc('Logged In')}}: {{loggedIn}}</v-col>
                <v-col cols=12>{{$tc('Email')}}: {{user._json.email.toLowerCase().trim()}}</v-col>
                <v-col cols=12>{{$tc('Permission', 2)}}: {{userPermissions}}</v-col>
                <v-col cols=12>{{$tc('Loading')}}: {{loading}}</v-col>
                <v-col cols=12>{{$tc('Dark Mode')}}: {{useDark}}</v-col>
                <v-col cols=12>{{$tc('Can Upload')}}: {{canUpload}}</v-col>
                <v-col cols=12>{{$tc('JWT')}}: {{jwt}}</v-col>
            </v-col>
        </v-row>
        
    </v-container>
</template>
<script>

import { mapActions, mapState} from 'vuex';
import md5 from 'md5'
import TextInput from '../TextInput';

export default {
    components:{
        TextInput
    },
    created() {
    },
    methods: {
        ...mapActions({
            setBCDCUserInfo: 'user/setBCDCUserInfo',
        }),
        save: async function(){
            await this.setBCDCUserInfo(this.settableUserInfo);
            this.editing = false;
        }
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
        }),
        userImage: function(){
            return ( (this.user && this.user._json && this.user._json.email) ) ? 'https://www.gravatar.com/avatar/' + md5(this.user._json.email.toLowerCase().trim()) + "?s=200" : "Logout"
        },

        alt: function(){
            return ( (this.user && this.user.displayName) ) ? this.user.displayName : "Logout"
        },

        enabledPhase(){
            let en = this.$store.state.config.items.find(item => item['key'] === 'enabledPhase');
            return (en) ? parseInt(en.value) : 1;
        },
    },
    data(){
        return {
            editing: false,
            settableUserInfo: {},
        }
    }
}
</script>
<style scoped>
    .bordered{
        border: 1px solid;
    }
</style>
