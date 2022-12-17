<template>
    <div v-scroll="onScroll">
        <v-btn v-if="!isVisible" fab fixed bottom right color="primary" @click="toBottom">
            <v-icon>mdi-arrow-down-bold-box-outline</v-icon>
        </v-btn>
        <v-btn v-else fab fixed bottom right color="primary" @click="toTop">
            <v-icon>mdi-arrow-up-bold-box-outline</v-icon>
        </v-btn>
    </div>
</template>
<script>
export default {
    data() {
        return {
            isVisible: false
        }
    },
    methods: {
        onScroll() {
            this.isVisible = window.scrollY > 50
        },
        toTop() {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            })
        },
        toBottom() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            })
        }
    }
}
</script>
