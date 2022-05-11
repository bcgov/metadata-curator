import { action } from '@storybook/addon-actions';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import FileReader from '../src/components/FormElements/FileReader';

export default {
    title: 'FileReader',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const fileData = {
    label: "File Input",
    readFile: false,
    mutateVuex: false
}



const template = `<FileReader :label="label" :readFile="readFile" :mutateVuex="mutateVuex"></FileReader>`

export const Default = () => ({
    components: {
        FileReader
    },
    template: template,
    props: {
        label: {
            default: text('title', fileData.label)
        },
        readFile: {
            default: boolean('readFile', fileData.readFile)
        },
        mutateVuex: {
            default: fileData.mutateVuex
        },
    },
    methods: actionsData
});