import { Backend } from '../../services/backend';
const backend = new Backend();

var build = function(getFn, newFn, updateFn, deleteFn){

    const state = {
        items: [],
        error: "",
    };

    const getters = {};

    const actions = {
        getItems({ commit }) {

            backend[getFn]().then((data) => {
                commit('setItems', {items: data});
            }).catch((e) => {
                console.error("Retrieve data uploads error: ", e);
            });
        },

        newItem({commit}, {item}){
            backend[newFn](item).then((data) => {
                let newItems = state.items.slice();
                if (data.item){
                    newItems.push(data.item);
                }else{
                    newItems.push(item);
                }
                commit('setItems', {items: newItems});
            }).catch((e) => {
                commit('setError', {error: "Error Creating: " + e.message});
            });
        },

        updateItem({commit}, {id, item}){
            backend[updateFn](id, item).then(() => {
                let newItems = state.items.slice();
                for (var i=0; i<newItems.length; i++){
                    if (newItems[i]._id === id){
                        newItems[i] = item;
                        break;
                    }
                }
                commit('setItems', {items: newItems});
            }).catch((e) => {
                commit('setError', {error: "Error updating: " + e.message});
            });
        },
    }


    let mutations = {
        setItems(state, {items}){
            state.items = items;
        },

        setError(state, {error}){
            state.error = error;
        }
    }

    if (typeof(deleteFn) !== "undefined"){
        actions.deleteItem = function({commit}, {id}){
            backend[deleteFn](id).then(() => {
                let newItems = [];
                for (var i=0; i<state.items.length; i++){
                    if (state.items[i]._id != id){
                        newItems.push(state.items[i]);
                    }
                }
                commit('setItems', {items: newItems});
            }).catch((e) => {
                commit('setError', {error: "Error updating: " + e.message});
            });
        }
    }

    return {
        namespaced: true,
        state,
        getters,
        actions,
        mutations
    }
}

export { build } 

export default {
    build
}