import Select from '../src/components/Select';
import {withKnobs, text, object} from "@storybook/addon-knobs";

export default {
    title: 'Select',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {}

export const selectData = {
    name: 'type',
    label: 'Type',
    value: '',
    items: [
        {text: 'String', value: 'STR'},
        {text: 'Number', value: 'NUM'},
        {text: 'Integer', value: 'INT'},
        {text: 'Boolean', value: 'BOOL'},
    ],
    itemText: 'text',
    itemValue: 'value',
    itemsCustom: [
        {key: 'String', val: 'STR'},
        {key: 'Number', val: 'NUM'},
        {key: 'Integer', val: 'INT'},
        {key: 'Boolean', val: 'BOOL'},
    ],
    itemTextCustom: 'key',
    itemValueCustom: 'val',
    select: null,
    validationRules: ''
}

const template = `<Select :name="name"
                    :label="label"
                    :validationRules="validationRules"
                    :items="items"
                    :itemText="itemText"
                    :itemValue="itemValue"
                    :select="select"/>`;

export const Default = () => ({
    components: {
        Select
    },
    props: {
        name: {
            default: text('name', selectData.name)
        },
        label: {
            default: text('label', selectData.label)
        },
        validationRules: {
            default: text('validationRules', selectData.validationRules)
        },
        items: {
            default: object('items', selectData.items)
        },
        itemText: {
            default: text('itemText', selectData.itemText)
        },
        itemValue: {
            default: text('itemValue', selectData.itemValue)
        },
        select: {
            default: text('select', selectData.select)
        },
    },
    template: template,
    methods: actionsData
});


export const WithRequiredValidationRule = () => ({
    components: {
        Select
    },
    props: {
        name: {
            default: text('name', selectData.name)
        },
        label: {
            default: text('label', selectData.label)
        },
        validationRules: {
            default: text('validationRules', 'required')
        },
        items: {
            default: object('items', selectData.items)
        },
        itemText: {
            default: text('itemText', selectData.itemText)
        },
        itemValue: {
            default: text('itemValue', selectData.itemValue)
        },
        select: {
            default: text('select', selectData.select)
        },
    },
    template: template,
    methods: actionsData
});

export const CustomItems = () => ({
    components: {
        Select
    },
    props: {
        name: {
            default: text('name', selectData.name)
        },
        label: {
            default: text('label', selectData.label)
        },
        validationRules: {
            default: text('validationRules', selectData.validationRules)
        },
        items: {
            default: object('items', selectData.itemsCustom)
        },
        itemText: {
            default: text('itemText', selectData.itemTextCustom)
        },
        itemValue: {
            default: text('itemValue', selectData.itemValueCustom)
        },
        select: {
            default: text('select', selectData.select)
        },
    },
    template: template,
    methods: actionsData
});


