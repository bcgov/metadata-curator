<template>
    <v-btn height="auto" block color="primary">
        <v-row dense>
            <v-col v-if="icon !== ''" cols=12>
                <v-icon>{{icon}}</v-icon>
            </v-col>
            <v-col v-if="image !== ''" cols=12>
                <v-img :alt="imageAlt" :src="image" :height="imageHeight" :width="imageWidth" contain class="mx-auto"></v-img>
            </v-col>
            <v-col  v-if="text !== ''" cols=12> 
                <span>{{text}}</span>
            </v-col>
        </v-row>
    </v-btn>
</template>

<script>
export default {

    props: {
        text: {
            type: String,
            required: false
        },
        icon: {
            type: String,
            required: false
        },
        image: {
            type: String,
            required: false
        },
        imageAlt: {
            type: String,
            required: false
        },
        imageHeight: {
            type: Number,
            required: false
        },
        imageWidth: {
            type: Number,
            required: false
        }
    }
    
    
}
</script>

<style scoped>

</style>