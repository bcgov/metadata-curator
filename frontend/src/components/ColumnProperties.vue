<template>
    <div style="width:350px;">
        <h1 style="margin-bottom:25px;">Column</h1>

        <TextInput class="column-prop-input"
                   :name="fldName.name"
                   :label="fldName.label"
                   :placeholder="fldName.placeholder"
                   :validation-rules="fldName.validationRules"
                   :value="fldName.value"
                   outlined="true"/>

        <TextInput class="column-prop-input"
                   :name="fldTitle.name"
                   :label="fldTitle.label"
                   :placeholder="fldTitle.placeholder"
                   :validation-rules="fldTitle.validationRules"
                   :value="fldTitle.value"
                   outlined="true"/>

        <TextArea class="column-prop-textarea"
                   :name="fldDesc.name"
                   :label="fldDesc.label"
                   :placeholder="fldDesc.placeholder"
                   :autogrow="fldDesc.autogrow"
                   :validation-rules="fldDesc.validationRules"
                   :value="fldDesc.value"/>

        <Select :name="fldType.name"
                :label="fldType.label"
                :validationRules="fldType.validationRules"
                :items="fldType.items"
                :itemText="fldType.itemText"
                :itemValue="fldType.itemValue"
                :select="fldType.select"/>

        <Select :name="fldFormat.name"
                :label="fldFormat.label"
                :validationRules="fldFormat.validationRules"
                :items="fldFormat.items"
                :itemText="fldFormat.itemText"
                :itemValue="fldFormat.itemValue"
                :select="fldFormat.select"/>

        <TextInput class="column-prop-input"
                   :name="fldRdfType.name"
                   :label="fldRdfType.label"
                   :placeholder="fldRdfType.placeholder"
                   :validation-rules="fldRdfType.validationRules"
                   :value="fldRdfType.value"
                   outlined="true"/>

    </div>
</template>

<script>

    import TextInput from "./TextInput";
    import TextArea from "./TextArea";
    import Select from "./Select";

    export default {
        name: 'ColumnProperties',
        components: {
            TextInput,
            TextArea,
            Select
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
                fldType: {
                    name: 'type',
                    label: 'Type',
                    items: [
                        {text: 'string', value: 'STR'},
                        {text: 'number', value: 'NUM'},
                        {text: 'integer', value: 'INT'},
                        {text: 'boolean', value: 'BOOL'},
                    ],
                    itemText: 'text',
                    itemValue: 'value',
                    select: 'STR'
                },
                fldFormat: {
                    name: 'format',
                    label: 'Format',
                    items: [
                        {text: 'email', value: '1'},
                        {text: 'uri', value: '2'},
                        {text: 'binary', value: '3'},
                        {text: 'uuid', value: '4'},
                        {text: 'default', value: '5'},
                    ],
                    itemText: 'text',
                    itemValue: 'value',
                    select: '5'
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





