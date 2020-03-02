<template>
    <div style="width:350px;">
        <h1 style="margin-bottom:25px;">Column</h1>

        <TextInput class="column-prop-input"
                   :name="fldName.name"
                   :label="fldName.label"
                   :placeholder="fldName.placeholder"
                   :validation-rules="fldName.validationRules"
                   :value="fldName.value"/>

        <TextInput class="column-prop-input"
                   :name="fldTitle.name"
                   :label="fldTitle.label"
                   :placeholder="fldTitle.placeholder"
                   :validation-rules="fldTitle.validationRules"
                   :value="fldTitle.value"/>

        <TextInput class="column-prop-input"
                   :name="fldRdfType.name"
                   :label="fldRdfType.label"
                   :placeholder="fldRdfType.placeholder"
                   :validation-rules="fldRdfType.validationRules"
                   :value="fldRdfType.value"/>

        <TextArea class="column-prop-textarea"
                   :name="fldDesc.name"
                   :label="fldDesc.label"
                   :placeholder="fldDesc.placeholder"
                   :autogrow="fldDesc.autogrow"
                   :validation-rules="fldDesc.validationRules"
                   :value="fldDesc.value"/>

    </div>
</template>

<script>

    import TextInput from "./TextInput";
    import TextArea from "./TextArea";

    export default {
        name: 'ColumnProperties',
        components: {
            TextInput,
            TextArea
        },
        props: {
            fieldData: {
                type: Array,
                required: true,
                default: () => [
                ]
            },
        },
        data() {
            return {
                fldName: {
                    name: 'name',
                    label: 'Name',
                    placeholder: 'name',
                    value: null,
                    validationRules: 'required'
                },
                fldTitle: {
                    name: 'title',
                    label: 'Title',
                    placeholder: 'title',
                    value: null,
                    validationRules: ''
                },
                fldDesc: {
                    name: 'desc',
                    label: 'Description',
                    placeholder: 'description',
                    autogrow: true,
                    value: null,
                    validationRules: ''
                },
                fldRdfType: {
                    name: 'rdfType',
                    label: 'RDF Type',
                    placeholder: 'rdf type',
                    value: null,
                    validationRules: ''
                },
            }
        },
        methods: {

        },

    }
</script>

<style scoped>

    .column-prop-input {
        margin-bottom: 7px;
    }

    .column-prop-textarea {
        margin-bottom: 7px;
    }

</style>





