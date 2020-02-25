<template>
    <h1>{{name}}</h1>
</template>

<script>
export default {
    props: {
        name: {
            type: String,
            required: true,
            default: "Web Curator"
        }
    }
    
}
</script>

<style scoped>
</style>