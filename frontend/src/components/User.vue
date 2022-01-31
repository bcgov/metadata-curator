<template>
    <span>

        <v-dialog v-model="aboutDia">
            <v-card>
                <v-card-title>
                    {{$tc('About')}}
                    <v-spacer></v-spacer>
                    <v-btn @click="aboutDia = false">X</v-btn>
                </v-card-title>
                <v-card-text>
                    <About></About>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog scrollable v-model="changesDia">
            <v-card>
                <v-card-title>
                    {{$tc('Update Information')}}
                    <v-spacer></v-spacer>
                    <v-btn @click="changesDia = false">X</v-btn>
                </v-card-title>
                <v-card-text>
                    <Changes></Changes>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-progress-circular
            v-if="loading"
            indeterminate
        ></v-progress-circular>
        <v-btn primary class="" v-else-if="!loggedIn" @click="login">{{$tc('Login')}}</v-btn>
        <v-menu v-else offset-y>
            <template v-slot:activator="{ on }">
                <v-img id="userMenu" v-if="showImage" ma-0 pa-0 :src="buttonImage" :alt="alt" :height="height+'px'" :width="width+'px'" contain v-on="on" v-on:error="onImgError"></v-img>
                <v-btn id="userMenu" v-else-if="!showImage" text v-on="on"><v-icon>fa-user</v-icon></v-btn>
            </template>
            <v-list>
                <v-list-item id="toUserPage" @click="$router.push('/user')">
                    <v-list-item-title>{{$tc('Signed in as')}} {{user._json.preferred_username}}</v-list-item-title>
                </v-list-item>
                <v-list-item
                    v-for="(item, index) in items"
                    :key="index"
                    @click="item.action"
                    :id="'userMenu-'+item.title"
                >
                    <v-list-item-title>{{ $tc(item.title) }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </span>
  
</template>


<script>
import { mapState } from 'vuex';
import md5 from 'md5'
import About from './About'
import Changes from './Changes';

export default {

    components:{
        About,
        Changes
    },

    props: {
        height: {
            type: Number,
            default: 40
        },
        width: {
            type: Number,
            default: 40
        }
    },

    data() {
        return {
            showImage: true,
            aboutDia: false,
            changesDia: false,
        }
    },

    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
            userPermissions: state => state.user.userPermissions,
            loading: state => state.user.loading
        }),
        items: function(){
            var items = [];
            var item = {};
            var self = this;
            item.title = "Logout";
            item.action = function(){
                // eslint-disable-next-line
                self.$router.push({name: "logout"});
            }

            var item2 = {};
            item2.title = "About";
            item2.action = function(){
                // eslint-disable-next-line
                self.aboutDia = true;
            }

            items.push(item2);

            item2 = {};
            item2.title = "Updates";
            item2.action = function(){
                // eslint-disable-next-line
                self.changesDia = true;
            }

            items.push(item2);

            items.push(item);

            return items;
        },
        buttonImage: function(){
            return ( (this.user && this.user._json && this.user._json.email) ) ? 'https://www.gravatar.com/avatar/' + md5(this.user._json.email.toLowerCase().trim()) : "Logout"
        },
        alt: function(){
            return ( (this.user && this.user.displayName) ) ? this.user.displayName : "Logout"
        }
    },

    methods: {
        onImgError(){
            this.showImage = false
        },
        login(){
            this.$router.push({name: "login"})
        }
    },

}
</script>

<style scoped>

    .fixed{
        position: fixed;
    }

</style>