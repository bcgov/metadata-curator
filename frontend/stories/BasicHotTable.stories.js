import { action } from '@storybook/addon-actions';
import BasicHotTable from '../src/components/BasicHotTable';

export default {
    title: 'Basic Handsontable',
    excludeStories: /.*Data$/,
}

export const actionsData = {

}

export const tableData = {

}

const template = `<BasicHotTable />`

export const Default = () => ({
    components: {
        BasicHotTable
    },
    template: template,
    methods: actionsData
});

