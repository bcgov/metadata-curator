<template>
    <v-container class="defText">
        <!-- <v-row>
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
        </v-row> -->
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
                <ResourceDisplay :resources="leftResources" :other="rightResources" :diff="basicDiff" compare-type="left"></ResourceDisplay>
            </v-col>

            <v-col cols=6>
                <ResourceDisplay :resources="rightResources" :other="leftResources" :diff="basicDiff" compare-type="right"></ResourceDisplay>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

const Diff = require('diff');

import ResourceDisplay from './ResourceDisplay';

import JsonProcessor from '../../mixins/JsonProcessor'

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
        resetChangeRight: {
            type: Boolean,
            required: false,
            default: false,
        }
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
            changeRight: true,

        }
    },
    watch: {
        resetChangeRight(){
            if (this.resetChangeRight){
                this.changeRight = true;
            }
        },

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

        //expects left and right to be arrays of objects
        getBestMatches: function(left, right){
            let matchArr = [];

                for (let i=0; i<left.length; i++){

                    try{
                        let lk = new Set(Object.keys(left[i]));

                        //bestMatch is expected to have target and rating, ratings is an array of those objects
                        let matchObj = {
                            ratings: [],
                            bestMatch: {},
                            bestMatchIndex: -1
                        };

                        let bestScore = -1;
                        let bestIndex = -1;

                        for (let j=0; j<right.length; j++){
                            let rk = new Set(Object.keys(right[j]));

                            let ak = new Set([...lk, ...rk]);

                            let allKeys = [...ak];

                            let totalRating = 0;
                            for (let k=0; k<allKeys.length; k++){
                                let lC = left[i][allKeys[k]];
                                let skip = false;
                                if (typeof(lC) === 'object'){
                                    lC = JSON.stringify(lC);
                                }else if (typeof(lC) === 'undefined'){
                                    skip = true;
                                }else if (typeof(lC) !== 'string'){
                                    lC = lC.toString();
                                }

                                let rC = right[j][allKeys[k]];
                                if (typeof(rC) === 'object'){
                                    rC = JSON.stringify(rC);
                                }else if (typeof(rC) === 'undefined'){
                                    skip = true;
                                }else if (typeof(rC) !== 'string'){
                                    rC = rC.toString();
                                }

                                if (!skip){
                                    let propRating = StringSimilarity.compareTwoStrings(lC, rC);
                                    totalRating += ((propRating*2) + 1) //1 for the property match and the some value based on similarity of value
                                }
                            }
                            totalRating = totalRating / (allKeys.length*3) // the maximum possible value is all keys match and all values of said keys match we double weight value
                            matchObj.ratings.push({rating: totalRating, target: right[j], index: j});
                            if (totalRating > bestScore){
                                bestScore = totalRating;
                                bestIndex = j;
                            }
                        }
                        matchObj.bestMatch = matchObj.ratings[bestIndex];
                        matchObj.bestMatchIndex = bestIndex;
                        matchArr.push(matchObj);
                    }catch(e){
                        //eslint-disable-next-line
                    }
                }
            
            return matchArr;
        },

        setChangeRight: function(value){
            this.changeRight = value;
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

                        let matchArr = this.getBestMatches(l, r);

                        //matchArr[i] is the ratings for each l[i] we need to compareAgainst the best rating
                        //but not necessarily in order ie 1 might be a best match for 2, but 2 might be exactly 2 ie [1,2] [2]
                        for (let i=0; i<matchArr.length && r.length>0; i++){
                            
                            let sortedMatchArr = JSON.parse(JSON.stringify(matchArr[i].ratings));
                            sortedMatchArr.sort((a,b) => (a.rating < b.rating) ? 1 : ((b.rating < a.rating) ? -1 : 0))

                            let ratingsIndex = 0;
                            let bestRating = sortedMatchArr[ratingsIndex].rating;
                            while ((ratingsIndex<sortedMatchArr.length) && (compareAgainst.indexOf(sortedMatchArr[ratingsIndex].index) !== -1)){
                                ratingsIndex++;
                            }

                            for (let j=0; j<matchArr.length; j++){
                                if (j !== i){
                                    let sortedJArr = JSON.parse(JSON.stringify(matchArr[j].ratings));
                                    sortedJArr.sort((a,b) => (a.rating < b.rating) ? 1 : ((b.rating < a.rating) ? -1 : 0))
                                    let bestJIndex = 0;
                                    while ((bestJIndex<sortedJArr.length) && (compareAgainst.indexOf(sortedJArr[bestJIndex].index) !== -1)){
                                        bestJIndex++;
                                    }
                                    if ( (ratingsIndex>=0) && (ratingsIndex<sortedMatchArr.length) && (bestJIndex<sortedJArr.length) && (sortedJArr[bestJIndex].index == sortedMatchArr[ratingsIndex].index) && (sortedJArr[bestJIndex].rating > bestRating) ){
                                        ratingsIndex++;
                                        while ((ratingsIndex<sortedMatchArr.length) && (compareAgainst.indexOf(sortedMatchArr[ratingsIndex].index) !== -1)){
                                            ratingsIndex++;
                                        }

                                        try{
                                            bestRating = sortedMatchArr[ratingsIndex].rating;
                                        }catch(ex){
                                            bestRating = -1;
                                            ratingsIndex = -1;
                                        }
                                        j=-1;
                                    }
                                }
                            }
                            if (ratingsIndex >=0 && ratingsIndex<sortedMatchArr.length && sortedMatchArr[ratingsIndex].index<r.length){
                                compareAgainst.push(sortedMatchArr[ratingsIndex].index);
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
                            b[l.length+i] = {added: true};
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
            let rightResources = this.getResources(this.workingVal);
            
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
                        
                        newF = newF.filter((el) => {
                            return el !== null && typeof el !== 'undefined';
                        });
                        r[i].schema.fields = JSON.parse(JSON.stringify(newF));
                    }
                    

                    if ( this.basicDiff && this.basicDiff.resources && this.basicDiff.resources[i] && (this.basicDiff.resources[i].comparedAgainst || this.basicDiff.resources[i].comparedAgainst === 0) ){
                        
                        newR[parseInt(this.basicDiff.resources[i].comparedAgainst)] = r[i];
                        
                    }else if ( this.basicDiff && this.basicDiff.resources && this.basicDiff.resources[i] && (this.basicDiff.resources[i].removed) ){
                        
                        newR[hi] = r[i];
                        hi--;
                        
                    }else{
                        newR[i] = r[i];
                    }
                }
                
                this.updateWorkingText('left', {resources: newR});
                this.calcDiff();
                
                return newR;
            }
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

            let rDiff = this.basicDiff;
            let hi = r.length-1;
            let movedToEnd = 0;

            
            let leftResources = this.getResources(this.leftWorkingVal);
            
            if (r.length > leftResources.length){
                let newR = [];
                for (let i=0; i<r.length; i++){
                    let newF = [];
                    let hiF = (r[i] && r[i].schema && r[i].schema.fields && r[i].schema.fields.length) ? r[i].schema.fields.length-1 : 0;
                    
                    if (r[i] && r[i].schema && r[i].schema.fields){
                        
                        let originalKeys = Object.keys(r[i].schema.fields);
                        for (let j=0; j<r[i].schema.fields.length; j++){
                            let bd = false;
                            try{
                                bd = rDiff.resources[i].schema.fields[j];
                            //eslint-disable-next-line
                            }catch(ex){
                            }

                            //basic diff, has compared against
                            if (bd && (bd.comparedAgainst || bd.comparedAgainst === 0) ){
                                let ind = j;
                                let compareAgainstInt = parseInt(bd.comparedAgainst)
                                let removeInd = originalKeys.indexOf(compareAgainstInt.toString())
                                originalKeys.splice(removeInd, 1);
                                newF[ind] = JSON.parse(JSON.stringify(r[i].schema.fields[compareAgainstInt]));

                            }else if ( bd &&  bd.added ){
                                //9 on the right is added we need it to be at 22
                                newF[hiF] = JSON.parse(JSON.stringify(r[i].schema.fields[parseInt(originalKeys[0])]));
                                originalKeys.splice(0,1);
                                // resourceMoveToEnd++;
                                hiF--;
                                movedToEnd++;
                                //let ind = j-resourceMoveToEnd;
                                //ind = ind<0 ? 0 : ind;
                                //newF[ind] = r[i].schema.fields[j];
                            }else{
                                let ind = j;
                                originalKeys.splice(j,1);
                                newF[ind] = JSON.parse(JSON.stringify(r[i].schema.fields[j]));
                            }
                            
                        }
                        if (Object.keys(newF).length > 0){
                            r[i].schema.fields = JSON.parse(JSON.stringify(newF));
                        }
                    }
                }

                let originalRKeys = Object.keys(r);
                for (let i=0; i<r.length; i++){
                    
                    if ( this.basicDiff && this.basicDiff.resources && this.basicDiff.resources[i] && (this.basicDiff.resources[i].comparedAgainst || this.basicDiff.resources[i].comparedAgainst === 0) ){
                        

                        newR[i] = r[parseInt(this.basicDiff.resources[i].comparedAgainst)];
                        let origKeyIndex = originalRKeys.indexOf(parseInt(this.basicDiff.resources[i].comparedAgainst).toString())
                        originalRKeys.splice(origKeyIndex,1)
                        
                    }else if ( this.basicDiff && this.basicDiff.resources && this.basicDiff.resources[i] && this.basicDiff.resources[i].added ){
                        
                        newR[hi] = r[originalRKeys[0]];
                        originalRKeys.splice(0,1);
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
                let newR = [];
                for (let i=0; i<r.length; i++){
                    let newF = [];
                    let hiF = (r[i] && r[i].schema && r[i].schema.fields && r[i].schema.fields.length) ? r[i].schema.fields.length-1 : 0;
                    newR[i] = JSON.parse(JSON.stringify(r[i]));
                    if (r[i] && r[i].schema && r[i].schema.fields){
                        
                        let originalKeys = Object.keys(r[i].schema.fields);
                        for (let j=0; j<r[i].schema.fields.length; j++){
                            let bd = false;
                            try{
                                bd = rDiff.resources[i].schema.fields[j];
                            //eslint-disable-next-line
                            }catch(ex){
                            }

                            //basic diff, has compared against
                            if (bd && (bd.comparedAgainst || bd.comparedAgainst === 0) && (r[i].schema.fields[parseInt(bd.comparedAgainst)]) ){
                                let ind = j;
                                let compareAgainstInt = parseInt(bd.comparedAgainst)
                                let removeInd = originalKeys.indexOf(compareAgainstInt.toString())
                                originalKeys.splice(removeInd, 1);
                                
                                newF[ind] = JSON.parse(JSON.stringify(r[i].schema.fields[compareAgainstInt]));

                            }else if ( bd &&  bd.added ){
                                //9 on the right is added we need it to be at 22
                                newF[hiF] = JSON.parse(JSON.stringify(r[i].schema.fields[parseInt(originalKeys[0])]));
                                originalKeys.splice(0,1);
                                // resourceMoveToEnd++;
                                hiF--;
                                movedToEnd++;
                                //let ind = j-resourceMoveToEnd;
                                //ind = ind<0 ? 0 : ind;
                                //newF[ind] = r[i].schema.fields[j];
                            }else{
                                let ind = j;
                                originalKeys.splice(j,1);
                                newF[ind] = JSON.parse(JSON.stringify(r[i].schema.fields[j]));
                            }
                            
                        }
                        if (Object.keys(newF).length > 0){
                            newR[i].schema.fields = JSON.parse(JSON.stringify(newF));
                        }
                    }
                    
                    
                }
                
                if (movedToEnd > this.previouslyMovedtoEnd){
                    // this.setChangeRight(false);
                    this.updateWorkingText('right', {resources: newR});
                    this.calcDiff();
                    this.setMovedToEnd(movedToEnd);
                    // this.setChangeRight(true);
                }
                return newR;
                
            }
            
            //this.setChangeRight(true);
            // return r;
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