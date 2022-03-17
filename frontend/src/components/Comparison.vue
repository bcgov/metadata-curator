<template>
    <v-container class="defText">
        <v-row>
            <v-col cols=3></v-col>
            <v-col cols=3>
                <v-slider
                    v-model="stateType"
                    :tick-labels="stateLabels"
                    :max="2"
                    :min="stateMin"
                    step="1"
                    ticks="always"
                    tick-size="1"
                ></v-slider>
            </v-col>
        </v-row>
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
                <ResourceDisplay :resources="leftResources" :diff="basicDiff" compare-type="left"></ResourceDisplay>
            </v-col>

            <v-col cols=6>
                <ResourceDisplay :resources="rightResources" :diff="basicDiff" compare-type="right"></ResourceDisplay>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

const Diff = require('diff');

import ResourceDisplay from './ResourceDisplay';

import JsonProcessor from '../mixins/JsonProcessor'

const StringSimilarity = require("string-similarity");


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
            calcRightSide: true,
            calcLeftSide: true,

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

        setCalcSide(left, value){
            if (left){
                this.calcLeftSide = value;
            }else{
                this.calcRightSide = value;
            }
        },

        setMovedToEnd: function(movedToEnd){
            this.previouslyMovedtoEnd  = movedToEnd;
        },
        

        updateWorkingText: function(side, obj){
            if (side === 'left'){
                this.workingLeftSideText = JSON.stringify(obj);
            }else{
                this.workingRightSideText = JSON.stringify(obj);
            }
        },

        calcJsonDiff: function(left, right){
            //console.log("JSON DIFF", left, right);
            let b = {};
            let l = left;
            let hasDiff = false;
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

            //Arrays have to be handled differently as they should compare against their closest match
            if (Array.isArray(l)){

                if (!Array.isArray(r)){
                    return {diff: true};
                }

                
                let compareAgainst = [];

                if (l.length > 0){
                    let entryType = typeof(l[0]);
                    if (entryType === 'object'){
                        //is either an array or an object so need to compare against all other entries for closest match

                        let matchArr = [];
                        let rightSideJsonS = [];
                        for (let i=0; i<r.length; i++){
                            rightSideJsonS.push(JSON.stringify(r[i]));
                        }


                        for (let i=0; i<l.length && rightSideJsonS.length>0; i++){
                            let leftSideJsonS = JSON.stringify(l[i]);
                            let matches = StringSimilarity.findBestMatch(leftSideJsonS, rightSideJsonS);
                            
                            matchArr.push(matches);
                        }

                        //matchArr[i] is the ratings for each l[i] we need to compareAgainst the best rating
                        //but not necessarily in order ie 1 might be a best match for 2, but 2 might be exactly 2 ie [1,2] [2]
                        for (let i=0; i<l.length && rightSideJsonS.length>0; i++){
                            
                            let sortedMatchArr = JSON.parse(JSON.stringify(matchArr[i].ratings));
                            sortedMatchArr.sort((a,b) => (a.rating < b.rating) ? 1 : ((b.rating < a.rating) ? -1 : 0))

                            let bestRatingIndex = matchArr[i].bestMatchIndex;

                            let ratingsIndex = 0;
                            let bestRating = sortedMatchArr[ratingsIndex].rating;
                            while (compareAgainst.indexOf(ratingsIndex) !== -1){
                                ratingsIndex++;
                            }

                            for (let j=0; j<matchArr.length; j++){
                                if (j !== i){
                                    let bestJIndex = matchArr[j].bestMatchIndex
                                    if ( (bestJIndex == bestRatingIndex) && (matchArr[j].ratings[bestJIndex].rating > bestRating) ){
                                        ratingsIndex++;
                                        while (compareAgainst.indexOf(ratingsIndex) !== -1){
                                            ratingsIndex++;
                                        }

                                        try{
                                            bestRating = sortedMatchArr[ratingsIndex].rating;
                                            bestRatingIndex = matchArr[i].ratings.filter(obj => {
                                                return obj.rating === bestRating
                                            })[0];
                                        }catch(ex){
                                            bestRating = -1;
                                            bestRatingIndex = -1;
                                        }
                                        j=-1;
                                    }
                                }
                            }
                            if (bestRatingIndex<r.length){
                                compareAgainst.push(bestRatingIndex);
                            }else{
                                compareAgainst.push(-1);
                            }
                        }

                        let allRKeys = Object.keys(r);
                        allRKeys.forEach(function (e, i, a) {
                            a[i] = parseInt(e)
                        });
                        let notComparedAgainst = [...allRKeys].filter(v => (compareAgainst.indexOf(v) === -1));

                        for (let i=0; i<l.length; i++){
                            
                            if (compareAgainst[i] === -1){
                                if (typeof(b) === 'undefined'){
                                    b = {};
                                }
                                if (typeof(b[i]) === 'undefined'){
                                    b[i] = {};
                                }
                                if (notComparedAgainst.length > 0){
                                    
                                    let innerDiff = this.calcJsonDiff(l[i], r[notComparedAgainst[0]]);
                                    b[i] = innerDiff;
                                    b[i].comparedAgainst = notComparedAgainst[0];
                                    //b[i].diff = true;
                                    notComparedAgainst = notComparedAgainst.slice(1);
                                    
                                }else{
                                    b[i].removed = true;
                                }
                                hasDiff = true;
                            }else{
                                let innerDiff = this.calcJsonDiff(l[i], r[compareAgainst[i]]);

                                
                                if (typeof(b) === 'undefined'){
                                    b = {}
                                }
                                b[i] =  innerDiff;
                                b[i].comparedAgainst = compareAgainst[i]
                                
                                hasDiff = (hasDiff || innerDiff.diff || innerDiff.removed || innerDiff.added)
                            }
                        }

                        for (let i=0; i<notComparedAgainst.length; i++){
                            b[notComparedAgainst[i]] = {added: true};
                        }

                        b.hasDiff = hasDiff

                    }else{
                        //is a primitive so should have a matching order
                        let lSmaller = l.length < r.length;

                        let smallerLength = lSmaller ? l.length : r.length;
                        let largerLength = lSmaller ? r.length : l.length;
                        for (let i=0; i<smallerLength; i++){
                            
                            hasDiff = hasDiff || (l[i] !== r[i]);
                            b[i] = {diff: (l[i] !== r[i])}
                        }

                        for (let i=smallerLength; i<largerLength; i++){

                            
                            if (lSmaller){
                                b[i] = {added: true}
                            }else{
                                b[i] = {removed: true}
                            }
                            hasDiff = true;
                        }
                    }
                }

                
                for (let i=0; i<compareAgainst.length; i++){
                    compareAgainst[i] = compareAgainst[i].toString();
                }
                //let rK = new Set(Object.keys(r));

                // let rDisjointed = new Set([...rK].filter(x => (compareAgainst.indexOf(x) === -1)));

                // for ( let i=0; i<rDisjointed.size; i++){
                    
                //     b[[...rDisjointed][i]] = {added: true}
                //     hasDiff = true;
                // }

                b.hasDiff = hasDiff;


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
                    this.diff = Diff.diffJson(JSON.parse(this.workingLeftSideText), JSON.parse(this.workingRightSideText), {ignoreWhitespace: true})
                }else{
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

            return this.diff;
        },
    },
    mounted(){
        this.workingLeftSideText = this.leftSideText;
        this.workingRightSideText = this.rightSideText;
        this.calcDiff();
    },
    computed: {
        rightSideResourceDiff: function(){
            return this.calcJsonDiff(this.workingRightSideText, this.workingLeftSideText);
        },

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
            if (!this.calcLeftSide){
                return r;
            }
            this.setCalcSide(true, false);
            let rightResources = this.getResources(this.workingVal);
            // console.log("LEFT RESOURCES", r, rightResources);
            let hi = r.length-1;
            
            if (r.length >= rightResources.length){
                let newR = [];

                for (let i=0; i<r.length; i++){

                    let newF = [];
                    let hiF = (r[i] && r[i].schema && r[i].schema.fields && r[i].schema.fields.length) ? r[i].schema.fields.length-1 : 0;
                    if (r[i] && r[i].schema && r[i].schema.fields){
                        for (let j=0; j<r[i].schema.fields.length; j++){
                            let bd = false;
                            try{
                                bd = this.basicDiff.resources[i].schema.fields[j];
                            //eslint-disable-next-line
                            }catch(ex){
                            }

                            if (bd && (bd.comparedAgainst || bd.comparedAgainst === 0) ){
                                newF[parseInt(bd.comparedAgainst)] = JSON.parse(JSON.stringify(r[i].schema.fields[j]));
                            }else if ( bd && (bd.removed || bd.added) ){
                                newF[hiF] = JSON.parse(JSON.stringify(r[i].schema.fields[j]));
                                hiF--;
                            }else{
                                newF[j] = JSON.parse(JSON.stringify(r[i].schema.fields[j]));
                            }
                        }
                        r[i].schema.fields = JSON.parse(JSON.stringify(newF));
                    }
                    

                    if ( this.basicDiff && this.basicDiff.resources && this.basicDiff.resources[i] && (this.basicDiff.resources[i].comparedAgainst || this.basicDiff.resources[i].comparedAgainst === 0) ){
                        
                        newR[parseInt(this.basicDiff.resources[i].comparedAgainst)] = r[i];
                        
                    }else if ( this.basicDiff && this.basicDiff.resources && this.basicDiff.resources[i] && (this.basicDiff.resources[i].removed || this.basicDiff.resources[i].added) ){
                        
                        newR[hi] = r[i];
                        hi--;
                        
                    }else{
                        newR[i] = r[i];
                    }
                }
                
                this.updateWorkingText('left', {resources: newR});
                this.calcDiff();
                
                this.setCalcSide(true, true);
                return newR;
            }
            this.setCalcSide(true, true);
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

            if (!this.calcRightSide){
                return r;
            }
            this.setCalcSide(false, false);
            let rDiff = this.rightSideResourceDiff;
            let hi = r.length-1;
            let movedToEnd = 0;
            
            let leftResources = this.getResources(this.leftWorkingVal);
            // console.log("RIGHT RESOURCES", leftResources, r);
            if (r.length > leftResources.length){
                let newR = [];
                for (let i=0; i<r.length; i++){
                    let newF = {};
                    let hiF = (r[i] && r[i].schema && r[i].schema.fields && r[i].schema.fields.length) ? r[i].schema.fields.length-1 : 0;
                    if (r[i] && r[i].schema && r[i].schema.fields){
                        for (let j=0; j<r[i].schema.fields.length; j++){
                            let bd = false;
                            try{
                                bd = rDiff.resources[i].schema.fields[j];
                            //eslint-disable-next-line
                            }catch(ex){
                            }

                            if (bd && (bd.comparedAgainst || bd.comparedAgainst === 0) ){
                                newF[parseInt(bd.comparedAgainst)] = r[i].schema.fields[j];
                            }else if ( bd && (bd.removed || bd.added) ){
                                newF[hiF] = r[i].schema.fields[j];
                                hiF--;
                            }else{
                                newF[j] = r[i].schema.fields[j];
                            }
                        }
                        r[i].schema.fields = JSON.parse(JSON.stringify(newF));
                    }
                    
                    if ( this.basicDiff && this.basicDiff.resources && this.basicDiff.resources[i] && (this.basicDiff.resources[i].comparedAgainst || this.basicDiff.resources[i].comparedAgainst === 0) ){
                        
                        newR[parseInt(this.basicDiff.resources[i].comparedAgainst)] = r[i];
                        
                    }else if ( this.basicDiff && this.basicDiff.resources && this.basicDiff.resources[i] && (this.basicDiff.resources[i].removed || this.basicDiff.resources[i].added) ){
                        
                        newR[hi] = r[i];
                        hi--;
                        
                    }else{
                        let useI = i;
                        while (typeof(newR[useI]) !== 'undefined'){
                            useI--;
                        }
                        newR[useI] = r[i];
                    }
                }
                
                this.updateWorkingText('right', {resources: newR});
                this.calcDiff();
                
                return newR;
            }else{
                let changed = false;
                let newR = [];
                for (let i=0; i<r.length; i++){
                    let newF = [];
                    let hiF = (r[i] && r[i].schema && r[i].schema.fields && r[i].schema.fields.length) ? r[i].schema.fields.length-1 : 0;
                    newR[i] = JSON.parse(JSON.stringify(r[i]));
                    if (r[i] && r[i].schema && r[i].schema.fields){
                        for (let j=0; j<r[i].schema.fields.length; j++){
                            let resourceMoveToEnd = 0;
                            let bd = false;
                            try{
                                bd = rDiff.resources[i].schema.fields[j];
                            //eslint-disable-next-line
                            }catch(ex){
                            }

                            if (bd && (bd.comparedAgainst || bd.comparedAgainst === 0) ){
                                let ind = j-resourceMoveToEnd;
                                //ind = ind<0 ? 0 : ind;
                                newF[ind] = r[i].schema.fields[parseInt(bd.comparedAgainst)];
                                changed = (changed || (parseInt(bd.comparedAgainst) !== j));
                            }else if ( bd && (bd.removed || bd.added) ){
                                newF[hiF] = r[i].schema.fields[j];
                                resourceMoveToEnd++;
                                hiF--;
                                changed = (changed || (movedToEnd>=this.previouslyMovedtoEnd));
                            }else{
                                let ind = j-resourceMoveToEnd;
                                ind = ind<0 ? 0 : ind;
                                newF[ind] = r[i].schema.fields[j];
                            }
                            
                        }
                        if (Object.keys(newF).length > 0){
                            newR[i].schema.fields = JSON.parse(JSON.stringify(newF));
                        }
                    }
                    
                    
                }
                if (changed){
                    this.updateWorkingText('right', {resources: newR});
                    this.calcDiff();
                    if (movedToEnd == this.previouslyMovedtoEnd){
                        movedToEnd++;
                    }
                    this.setMovedToEnd(movedToEnd)
                    this.setCalcSide(false, true);
                    return newR;
                }
                
            }
            
            this.setCalcSide(false, true);
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
</style>