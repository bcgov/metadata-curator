import Vue from 'vue';
import { Backend } from '../../services/backend';
const backend = new Backend();

var build = function(getFn, newFn, updateFn, deleteFn, getSingle){

    const state = {
        items: [],
        error: "",
        wipItem: {},
    };

    const getters = {};

    const actions = {
        async clearItems({ commit }){
            commit('clearItems');
        },
        async getItems({ commit }, { param }) {

            if ( (typeof(param) !== 'undefined') && (param !== false) ){
                try{
                    let data = await backend[getFn](param);
                    commit('setItems', {items: data});
                }catch(e){
                    console.error("Retrieve data uploads error: ", e);
                }
            }else{
                try{
                    let data = await backend[getFn]();
                    commit('setItems', {items: data});
                }catch(e){
                    console.error("Retrieve data uploads error: ", e);
                }
            }
        },

        async getItem({state, commit, dispatch}, {field, value, def}){
            if (!state.items || state.items.length === 0){
                await dispatch('getItems', {});
            }
            let rv = state.items.find(item => item[field] === value);
            if (!rv && getSingle && typeof(backend[getSingle]) !== 'undefined'){
                rv = await backend[getSingle](value);
            }
            if ( (!rv) && (def) ){
                commit('pushItem', {item: def});
                return def;
            }else{
                commit('setItem', {item: rv});
                return rv;
            }
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
        clearItems(state){
            Vue.set(state.items, []);    
        },

        editItem(state, {name, value}){
            Vue.set(state.wipItem, name, value);
        },

        setItem(state, {item}){
            Vue.set(state, 'wipItem', item);
        },

        setItems(state, {items}){
            if (state.items == []){
                Vue.set(state, 'items', items);
            }else{
                let concatItems = [];
                for (let i=0; i<items.length; i++){
                    let inArr = false;
                    for (let j=0; j<state.items.length; j++){
                        if (JSON.stringify(state.items[j]) === JSON.stringify(items[i])){
                            inArr = true;
                            break;
                        }
                    }
                    if (!inArr){
                        concatItems.push(items[i])
                    }
                }
                var newItems = state.items.concat(concatItems);
                Vue.set(state, "items", newItems);
            }
        },

        pushItem(state, {item}){
            let x = state.items.concat([item]);
            Vue.set(state, "items", x);
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