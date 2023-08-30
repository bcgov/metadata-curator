<template>
    <v-container class="defText">
        <v-row>
          <v-col cols="12">
            <h3>Difference Highlights</h3>
          </v-col>
          <span style="width: 100%" v-for="(_, index) in basicDiff.resources" :key="'diffHighlight-'+index+'-'+(showAll && showAll[index] ? showAll[index].toString() : '')">
            <v-row class="bordered mb-15 pa-2" v-if="index === parseInt(index).toString()">
              <span style="width: 100%;">
                <v-row v-if="hasResourceDiff(index, 'name')">
                  <v-col cols="12">
                    <v-alert type="warning">
                      File name {{ JSON.parse(leftSideText).resources[index].name }} does not equal {{ JSON.parse(rightSideText).resources[index].name }}
                    </v-alert>
                  </v-col>
                </v-row>

                <v-row v-if="hasFieldCountDiff(index).diff">
                  <v-col cols="12">
                    <v-alert type="warning">
                      Columns count {{ hasFieldCountDiff(index).left }} in provided file does not match expected {{ hasFieldCountDiff(index).right }}
                    </v-alert>
                  </v-col>
                </v-row>

                <span v-for="(changed, cKey, cIndex) in fieldChanges[index]" :key="`changedField-${index}-${cIndex}-${showAll[index].toString()}`">
                  <v-row v-if="changed !== 0 && (cIndex < 5 || showAll[index])">
                    <v-col cols="12">
                      <v-alert type="warning">
                        Field {{ cKey }} {{ changedText(changed) }}
                      </v-alert>
                    </v-col>
                  </v-row>
                </span>
              </span>
              <v-row v-if="numDiffs[index] >= 5 && !showAll[index]">
                <v-col cols="4"></v-col>
                <v-col cols="4"><v-btn text @click="showAllFunc(index)">Show All</v-btn></v-col>
                <v-col cols="4"></v-col>
              </v-row>
            </v-row>
          </span>

        </v-row>

        <v-row>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>Expand for full details</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row>
                    <v-col cols=1>
                        <span>Legend:</span>
                    </v-col>
                    <v-col cols=2>
                        <span class="green">{{$tc('Only found in')}} {{(rightHeader.toLowerCase().indexOf('edition') !== -1) ? 'existing' : 'right'}} {{$tc('metadata')}}</span>
                    </v-col>
                    <v-col cols=2>
                        <span class="red">{{$tc('Only found in')}} {{(leftHeader.toLowerCase().indexOf('inferred') !== -1) ? 'inferred' : 'left'}} {{$tc('metadata')}}</span>
                    </v-col>
                    <v-col cols=2>
                        <span class="yellow">Different value</span>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols=6>
                        <h3>{{(leftHeader.toLowerCase().indexOf('inferred') !== -1) ? $tc(leftHeader) : leftHeader}}</h3>
                    </v-col>
                    <v-col cols=6>
                        <h3>{{(rightHeader.toLowerCase().indexOf('edition') !== -1) ? $tc(rightHeader) : rightHeader}}</h3>
                    </v-col>
                </v-row>
                <v-row v-if="stateType==rawState">
                    <v-col cols=6>
                        <v-row v-for="(line, key) in leftLines" :key="'leftLine-'+key">
                            <v-col cols=1>
                                {{line.added ? '+' : line.removed ? '-' : ' '}}
                            </v-col>
                            <v-col cols=11 :class="line.colour">
                                {{line.text}}
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols=6>
                        <v-row v-for="(line, key) in rightLines" :key="'rightLine-'+key">
                            <v-col cols=1>
                                {{line.added ? '+' : line.removed ? '-' : ' '}}
                            </v-col>
                            <v-col cols=11 :class="line.colour">
                                {{line.text}}
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row v-else>
                    <v-col cols=6 v-if="leftTitle || rightTitle">
                        <h1>{{leftTitle}}</h1>
                    </v-col>
                    <v-col cols=6 v-if="leftTitle || rightTitle">
                        <h1>{{rightTitle}}</h1>
                    </v-col>

                    <v-col cols=6 v-if="leftDescription || rightDescription">
                        <h3>{{leftDescription}}</h3>
                    </v-col>
                    <v-col cols=6 v-if="leftDescription || rightDescription">
                        <h3>{{rightDescription}}</h3>
                    </v-col>


                    <v-col cols=6>
                        <ResourceDisplay :fieldsCollapsedByDefault="true" :resources="leftResources" :other="rightResources" :diff="basicDiff" compare-type="left"></ResourceDisplay>
                    </v-col>

                    <v-col cols=6>
                        <ResourceDisplay :fieldsCollapsedByDefault="true" :resources="rightResources" :other="leftResources" :diff="basicDiff" compare-type="right"></ResourceDisplay>
                    </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>
    </v-container>
</template>

<script>

const Diff = require('diff');

import ResourceDisplay from './ResourceDisplay';

import JsonProcessor from '../../mixins/JsonProcessor'


export default {
    mixins: [JsonProcessor],

    components:{
        ResourceDisplay,
    },

    props: {
        leftSideText: {
            type: String,
            required: true
        },
        rightSideText: {
            type: String,
            required: true
        },
        diffJson: {
            type: Boolean,
            required: false,
            default: false
        },
        leftHeader: {
            type: String,
            required: false,
            default: "Inferred Metadata"
        },
        rightHeader: {
            type: String,
            required: false,
            default: "Edition Metadata"
        },
    },
    data(){
        return {
            diff: "",
            leftLines: [],
            rightLines: [],
            stateType: 1,
            stateMin: 1,
            stateLabels: ['Basic', 'Raw'],
            basicState: 1,
            rawState: 2,
            basicDiff: {},
            workingLeftSideText: this.leftSideText ? this.leftSideText : "",
            workingRightSideText: this.rightSideText ? this.rightSideText : "",
            previouslyMovedtoEnd: 0,
            fieldChanges: [],
            numDiffs: [],
            showAll: [],
        }
    },
    watch: {

        leftSideText(){
            this.workingLeftSideText = this.leftSideText;
            this.calcDiff();
            
        },
        rightSideText(){
            this.workingRightSideText = this.rightSideText;
            this.calcDiff();
        }
    },
    methods: {

      showAllFunc(index){
        this.showAll[index] = true;
        this.$forceUpdate();
      },

      changedText(changed){
        if (changed < 0){
          return "is not expected";
        }else if (changed === 1){
          return "is expected but not present";
        }else if (changed > 1){
          return "is moved";
        }
        return "";
        
      },

      hasResourceDiff(resourceInd, fieldName){
        let rv = this.basicDiff && this.basicDiff.resources && this.basicDiff.resources[resourceInd]
        rv = rv && this.basicDiff.resources[resourceInd][fieldName] && this.basicDiff.resources[resourceInd][fieldName].diff;
        return rv;
      },

      hasFieldCountDiff(resourceInd){
        let leftCount = 0;
        let rightCount = 0;
        let lst = JSON.parse(this.workingLeftSideText);
        let rst = JSON.parse(this.workingRightSideText);
        
        if (lst && lst.resources && lst.resources[resourceInd] && lst.resources[resourceInd].schema && lst.resources[resourceInd].schema.fields){
          leftCount = lst.resources[resourceInd].schema.fields.length
        }

        if (rst && rst.resources && rst.resources[resourceInd] && rst.resources[resourceInd].schema && rst.resources[resourceInd].schema.fields){
          rightCount = rst.resources[resourceInd].schema.fields.length
        }

        let rv = {left: leftCount, right: rightCount, diff: leftCount !== rightCount};
        return rv;
      },

        calcJsonDiff: function(left, right){
            let b = {};
            let l = left;
            try{
                l = JSON.parse(left);
            }catch(ex){
                //failed to parse left but we still have the right value
            }

            let r = right;
            try{
                r = JSON.parse(right);
            }catch(ex){
                //failed to parse right but we still have the right value
            }

            if (Array.isArray(l)){
              let hasDiff = false;
              if (!Array.isArray(r)){
                return {diff: true};
              }

              for (let i=0; i<l.length; i++){
                          
                if (typeof(b) === 'undefined'){
                  b = {};
                }
                if (typeof(b[i]) === 'undefined'){
                  b[i] = {};
                }
              
                if (r && r.length>i){
                  let innerDiff = this.calcJsonDiff(l[i], r[i]);
                  b[i] = innerDiff;
                  b[i].comparedAgainst = i;
                  hasDiff = (hasDiff || innerDiff.diff || innerDiff.removed || innerDiff.added)
                }else{
                  b[i].removed = true;
                  hasDiff = true;
                }              

                for (let i=l.length; i<r.length; i++){
                    b[i] = {added: true};
                    hasDiff = true;
                }

                b.hasDiff = hasDiff
              }


            }else if (typeof(l) === "object"){
                if (typeof(r) !== 'object'){
                    return {diff: true};
                }

                let hasDiff = false;
                
                let lK = new Set()
                if ( l !== null ){
                    lK = new Set(Object.keys(l));
                }
                
                let rK = new Set();
                if ( r !== null ){
                    rK = new Set(Object.keys(r));
                }

                let intersection = new Set([...lK].filter(x => rK.has(x)));
                let lDisjointed = new Set([...lK].filter(x => (!rK.has(x))));
                let rDisjointed = new Set([...rK].filter(x => (!lK.has(x))));

                for (let i=0; i<intersection.size; i++){
                    let currKey = [...intersection][i]
                    
                    let innerDiff = this.calcJsonDiff(l[currKey], r[currKey]);
                    
                    b[currKey] =  innerDiff
                    
                    hasDiff = (hasDiff || innerDiff.diff || innerDiff.removed || innerDiff.added)
                }

                for ( let i=0; i<lDisjointed.size; i++){
                    
                    b[[...lDisjointed][i]] = {removed: true}
                    hasDiff = true;
                }

                for ( let i=0; i<rDisjointed.size; i++){
                    
                    b[[...rDisjointed][i]] = {added: true}
                    hasDiff = true;
                }

                b.hasDiff = hasDiff;

            }else{
                //primitive
                b = {diff: l !== r}
                if ( (typeof(l) === 'string') && (typeof(r) === 'string') ){
                    b = {diff: l.trim() !== r.trim()}
                }
                
                
            }

            return b;
        },

        calcDiff: function(){
            try{
                if (this.diffJson){
                    this.basicDiff = this.calcJsonDiff(this.workingLeftSideText, this.workingRightSideText);
                    //this.diff = Diff.diffJson(JSON.parse(this.workingLeftSideText), JSON.parse(this.workingRightSideText), {ignoreWhitespace: true})
                    this.diff = [];
                }else{
                    this.basicDiff = {};
                    this.diff = Diff.diffTrimmedLines(this.workingLeftSideText, this.workingRightSideText)
                }
            }catch(e){
                this.basicDiff = {};
                this.diff = [];
            }

            this.leftLines = [];
            this.rightLines = [];

            this.diff.forEach( (part) => {
                let colour = part.added ? 'green' : part.removed ? 'red' : 'none';
                if (!part.added && !part.removed){
                    this.leftLines.push({text: part.value, colour: colour, added: false, removed: false})
                    this.rightLines.push({text: part.value, colour: colour, added: false, removed: false})
                }else if (part.added){
                    this.leftLines.push({text: '', colour: colour, added: true, removed: false})
                    this.rightLines.push({text: part.value, colour: colour, added: true, removed: false})
                }else{
                    this.leftLines.push({text: part.value, colour: colour, added: false, removed: true})
                    this.rightLines.push({text: '', colour: colour, added: false, removed: true})
                }
            });

            this.fieldChanges = [];
            let fieldChangeLevel = 0;
            let parsedL = JSON.parse(this.leftSideText);
            let parsedR = JSON.parse(this.rightSideText);

            let largerLen = parsedL.resources.length > parsedR.resources.length ? parsedL.resources.length : parsedR.resources.length;
            for (let i=0; i<largerLen; i++){
              this.fieldChanges[i] = {}
              this.numDiffs[i] = 0;
              this.showAll[i] = false;
            }

            let smallerLen = parsedL.resources.length > parsedR.resources.length ? parsedR.resources.length : parsedL.resources.length;

            for (let j=0; j<smallerLen; j++){
              let leftResources = parsedL.resources && parsedL.resources[j] && parsedL.resources[j].schema && parsedL.resources[j].schema.fields ? parsedL.resources[j].schema.fields : [];
              let rightResources = parsedR.resources && parsedR.resources[j] && parsedR.resources[j].schema && parsedR.resources[j].schema.fields ? parsedR.resources[j].schema.fields : [];

              leftResources.forEach(element => {
                element.name = element.name.trim();
              });
              rightResources.forEach(element => {
                element.name = element.name.trim();
              });
 
              for (let i=0; i<rightResources.length; i++){
                let name = rightResources[i].name.trim();
                let lIndex = leftResources.findIndex(e => e.name === name);
                if (lIndex === -1){
                  this.fieldChanges[j][name] = 1
                  this.numDiffs[j] += 1;
                  console.log("nd increment");
                  fieldChangeLevel = 1;
                }else if (lIndex === i){
                  //this.fieldChanges[name] = 0
                }else{
                  this.fieldChanges[j][name] = 2
                  this.numDiffs[j] += 1;
                  console.log("nd increment");
                  fieldChangeLevel = 1;
                }
              }

              //catch the ones on the left that aren't on the right
              for (let i=0; i<leftResources.length; i++){
                let name = leftResources[i].name;
                if (typeof(this.fieldChanges[j][name]) === 'undefined'){
                  this.fieldChanges[j][name] = -1
                  fieldChangeLevel = 1;
                  this.numDiffs[j] += 1;
                  console.log("nd increment");
                }
              }

              let highlights = {
                name: this.hasResourceDiff(0, 'name') ? 1 : 0,
                fields: this.hasFieldCountDiff(0).diff ? 1 : 0,
                fieldChanges: fieldChangeLevel,
              }
              this.$emit('compared', highlights, j);
            }
            console.log("nd", this.numDiffs);
            return this.diff;
        },
    },
    mounted(){
        this.workingLeftSideText = this.leftSideText;
        this.workingRightSideText = this.rightSideText;
        this.calcDiff();
    },
    computed: {

        leftWorkingVal: function(){
            try{
                let obj = JSON.parse(this.workingLeftSideText);
                return obj;
            }catch(e){
                return {};
            }
        },

        workingVal: function(){
            try{
                let obj = JSON.parse(this.workingRightSideText);
                return obj;
            }catch(e){
                return {}
            }
        },
        
        leftTitle: function(){
            return this.getTitle(this.leftWorkingVal);
        },

        leftDescription: function(){
            return this.getDescription(this.leftWorkingVal);
        },

        leftFields: function(){
            return this.getFields(this.leftWorkingVal);
        },

        leftResources: function(){
            let r = this.getResources(this.leftWorkingVal);
            return r;
        },

        rightTitle: function(){
            return this.getTitle(this.workingVal);
        },

        rightDescription: function(){
            return this.getDescription(this.workingVal);
        },

        rightFields: function(){
            return this.getFields(this.workingVal);
        },

        rightResources: function(){
          let r = this.getResources(this.workingVal);
          return r;
        },
    },
    
}
</script>

<style scoped>

    .defText{
        color: var(--v-text-base);
    }

    .yellow{
        color: black;
    }

    .bordered{
      width: 100%;
      border: 1px solid;
    }
</style>