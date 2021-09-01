<template>
    <v-container fluid>
        <v-row v-if="error">
            <v-col cols=12>
                <v-alert class="mb-0" v-model="error" type="error" dismissible>
                    {{errorText}}
                </v-alert>
            </v-col>
        </v-row>
        <v-row>
            <v-slider
                v-if="showStates"
                v-model="stateType"
                :tick-labels="stateLabels"
                :max="2"
                :min="1"
                step="1"
                ticks="always"
                tick-size="1"
            ></v-slider>
        </v-row>
        <v-row v-if="stateType == 2">
            <v-col cols=12>
                <v-textarea v-model="workingStr" @change="updatedStr"></v-textarea>
            </v-col>
        </v-row>
        <v-row v-else>
            <RepeatingObject 
                :key="'rootRepeating-'+reindexKey" 
                :val="workingVal" 
                @update="updatedObj" 
                :expanded="expanded" 
                @expand="onExpand" 
                :focus-prop="focus" 
                :show-type-prop="showType"
                @show-type="updateShowType"
                self-key="_"
                @focus="onFocus">
            </RepeatingObject>
        </v-row>
    </v-container>
</template>

<script>

import RepeatingObject from './RepeatingObject';

export default{
    components: {
        RepeatingObject,
    },

    props: {
        val: {
            type: Object,
            required: true,
        },
        showStates: {
            type: Boolean,
            required: false,
            default: true,
        }
    },

    watch: {

        stateType: function(){
            this.$emit('state', this.stateType);
        }

    },

    methods: {
        replacerFunc: function(){
            const visited = new WeakSet();
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (visited.has(value)) {
                        console.log("Replacing key", key);
                        return;
                    }
                    visited.add(value);
                }
                return value;
            };
        },

        updateShowType: function(newShowType){
            if (JSON.stringify(this.showType) !== JSON.stringify(newShowType)){
                this.showType = newShowType;
                this.reindexKey++;
                this.$forceUpdate();
            }
        },

        onExpand: function(expanded){
            this.expanded = expanded;
        },

        updatedStr: function(){
            try{
                let obj = JSON.parse(this.workingStr);
                this.workingVal = obj;
                this.$emit('edited', obj);
            }catch(ex){
                this.error = true;
                this.errorText = "Invalid JSON"
            }
        },

        updatedObj: function(info){
            if (typeof(info.newKey) === 'undefined'){
                
                //let k = Object.keys(this.workingVal);
                //let newKey = k.indexOf(info.key) === -1;
                this.workingVal[info.key] = info.val;
                let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
                this.workingStr = str;
                this.$emit('edited', this.workingVal);
                //if (newKey){
                    this.reindexKey++;
                    this.$forceUpdate();
                //}
            }else{
                //key updated;
                let k = Object.keys(this.workingVal);
                let ind = k.indexOf(info.key);
                
                this.workingVal[info.newKey] = this.workingVal[info.key];
                delete this.workingVal[info.key];
                
                let k2 = Object.keys(this.workingVal);
                let ind2 = k2.indexOf(info.newKey);

                let expandedK2 = this.expanded[ind2];
                this.expanded[ind2] = this.expanded[ind];
                this.expanded[ind] = expandedK2;

                let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
                this.workingStr = str;
                this.$emit("edited", this.workingVal);
                this.reindexKey++;
                this.$forceUpdate();
            }
        },

        onFocus: function(f){
            this.focus = f;
        }
    },

    data() {
        return {
            workingVal: {},
            workingStr: "",
            error: false,
            errorText: "",
            reindexKey: 0,
            expanded: {},
            focus: "",
            showType: {},
            stateLabels: [
                // 'Basic',
                'Advanced',
                'Raw',
            ],
            stateType: 1
        };
    },

    mounted(){
        this.workingVal = this.val;
        this.workingStr = JSON.stringify(this.val, this.replacerFunc(), 4);
    }
}
</script>

<style scoped>

</style>>
