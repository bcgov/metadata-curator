import { Backend } from '../../services/backend';
const authServ = new Backend();

const state = {
    user: {},
    loggedIn: false,
    userPermissions: {},
    loading: true,
    useDark: false,
    canUpload: false,
    jwt: ""
};

const getters = {
    isLoggedIn: (state) => {
        return state.loggedIn
    }
}

const actions = {
    removeUser({commit}){
        commit('setUser', {user: {}});
        commit('setJWT', {jwt: ""});
        commit('setLoggedIn', {loggedIn: false});
        commit('setUserPermissions', {userPermissions: {}});
    },

    async getCurrentUser({ commit, state }) {
        commit('setLoading', {loading: true});
        
        let user = state.user;
        let loggedIn = state.loggedIn;

        if (state.user && state.user.jwt) {
            let currDate = new Date();

            let base64Url = state.user.jwt.split('.')[1];
            let base64 = base64Url.replace('-', '+').replace('_', '/');
            let jwtObj = JSON.parse(window.atob(base64));
            let exp = new Date(0);
            exp.setUTCSeconds(jwtObj.exp);

            if (currDate > exp) {
                await authServ.getToken().then((data) => {
                    if ((typeof (data.error) === "undefined") && (typeof (data) === "object")) {
                        commit('setUser', { user: data });
                        commit('setJWT', { jwt: data.jwt });
                        commit('setLoggedIn', {loggedIn: true});
                        commit('setCanUpload', {canUpload: data.canUpload})
                        user = data;
                        loggedIn = true;
                    } else {
                        commit('setUser', {user: null});
                        commit('setJWT', { jwt: "" });
                        commit('setLoggedIn', {loggedIn: false});
                        commit('setCanUpload', {canUpload: false})
                        user = {};
                        loggedIn = false;
                    }
                });
            }else{
                //catch scenario where server crashed
                authServ.getToken().then((data) => {
                    if ((typeof (data.error) === "undefined") && (typeof (data) === "object")) {
                        commit('setUser', { user: data });
                        commit('setJWT', { jwt: data.jwt });
                        commit('setLoggedIn', {loggedIn: true});
                        commit('setCanUpload', {canUpload: data.canUpload})
                        user = data;
                        loggedIn = true;
                    } else {
                        commit('setUser', {user: null});
                        commit('setJWT', { jwt: "" });
                        commit('setLoggedIn', {loggedIn: false});
                        commit('setCanUpload', {canUpload: false})
                        user = {};
                        loggedIn = false;
                    }
                });
            }
        } else {
            await authServ.getToken().then((data) => {
                if ((typeof (data.error) === "undefined") && (typeof (data) === "object")) {
                    commit('setUser', { user: data });
                    commit('setJWT', { jwt: data.jwt });
                    commit('setLoggedIn', {loggedIn: true});
                    commit('setCanUpload', {canUpload: data.canUpload})
                    user = data;
                    loggedIn = true;
                }else{
                    commit('setUser', { user: null });
                    commit('setJWT', { jwt: "" });
                    commit('setLoggedIn', {loggedIn: false});
                    commit('setCanUpload', {canUpload: false})
                    user = null;
                    loggedIn = false;
                }
            });
        }

        let userPermissions = {};
        
        if ( (loggedIn) && user.userPermissions ){
            userPermissions = user.userPermissions;
        }else{
            userPermissions = {};
        }

        commit('setUserPermissions', {userPermissions: userPermissions});
        
        commit('setLoading', {loading: false});

    }
}

const mutations = {
    setLoading(state, {loading}){
        state.loading = loading;
    },
    setUserPermissions(state, { userPermissions }){
        state.userPermissions = userPermissions;
    },
    setUser(state, { user }) {
        state.user = user;
    },
    setLoggedIn(state, { loggedIn }){
        state.loggedIn = loggedIn;
    },
    setUseDark(state, { useDark }){
        state.useDark = useDark;
    },
    setJWT(state, { jwt }){
        state.jwt = jwt;
    },
    setCanUpload(state, { canUpload }){
        state.canUpload = canUpload;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}