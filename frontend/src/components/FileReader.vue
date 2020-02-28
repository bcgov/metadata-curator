<template>
    <span>
        <v-file-input v-model="file" counter show-size label="File input"></v-file-input>
        <v-btn @click="encrypt">Encrypt</v-btn>
    </span>
</template>

<script>
export default {

    props: {
        label: {
            type: String,
            default: "File input"
        },
        readFile: {
            type: Boolean,
            default: true
        },
        mutateVuex: {
            type: Boolean,
            default: true
        }
        
    },

    data() {
        return {
            file: null,
            fileContent: ""
        }
    },

    watch: {
        file(){
            if (this.readFile){
                var reader = new FileReader();
                var self = this;
                reader.onload = function(e){
                    if (this.mutateVuex !== ""){
                        self.$store.commit('file/setContent', { content: e.target.result})
                        self.$store.commit('file/setFileName', { fileName: self.file.name})
                    }else{
                        self.fileContent = e.target.result;
                    }
                }
                reader.readAsText(this.file);
            }
        }
    },

    methods: {
        encrypt: function(){
            this.$store.dispatch('file/encryptContent');
        }
    }
    
}
</script>

<style scoped>

</style>