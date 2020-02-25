import { action } from '@storybook/addon-actions';
import BasicAgGrid from '../src/components/BasicAgGrid';

export default {
    title: 'Basic ag-Grid',
    excludeStories: /.*Data$/,
}

export const actionsData = {

}

export const tableData = {

}

const template = `<BasicAgGrid />`

export const Default = () => ({
    components: {
        BasicAgGrid
    },
    template: template,
    methods: actionsData
});

