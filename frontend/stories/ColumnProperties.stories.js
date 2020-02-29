import ColumnProperties from '../src/components/ColumnProperties';
import {withKnobs, object} from "@storybook/addon-knobs";

export default {
    title: 'ColumnProperties',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const columnPropertiesData = {

}


const template = `<ColumnProperties />`;

export const Default = () => ({
    components: {
        ColumnProperties
    },
    props: {
    },
    template: template,
    methods: actionsData
});

