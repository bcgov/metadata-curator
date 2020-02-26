import BasicAgGrid from '../src/components/BasicAgGrid';
import {withKnobs, object} from "@storybook/addon-knobs";

export default {
    title: 'Basic ag-Grid',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const tableData = {
    columnDefs: [
        {headerName: 'Make', field: 'make', editable: false, sortable: false, filter:false},
        {headerName: 'Model', field: 'model', editable: false, sortable: false, filter:false},
        {headerName: 'Price', field: 'price', editable: false, sortable: false, filter:false}
    ],
    rowData: [
        {make: 'Toyota', model: 'Celica', price: 35000},
        {make: 'Ford', model: 'Mondeo', price: 32000},
        {make: 'Porsche', model: 'Boxter', price: 72000}
    ]
}


const template = `<BasicAgGrid :columnDefs="columnDefs" :rowData="rowData" />`;

export const Default = () => ({
    components: {
        BasicAgGrid
    },
    props: {
        columnDefs: {
            default: () => object('columnDefs', tableData.columnDefs)
        },
        rowData: {
            default: () => object('rowData', tableData.rowData)
        }
    },
    template: template,
    methods: actionsData
});

export const Editable = () => ({
    components: {
        BasicAgGrid
    },
    props: {
        columnDefs: {
            default: () => {
                const items = tableData.columnDefs.map(item => {
                    return {...item, editable: true};
                });
                return object('columnDefs', items);
            }
        },
        rowData: {
            default: () => object('rowData', tableData.rowData)
        }
    },
    template: template,
    methods: actionsData
});


export const Sortable = () => ({
    components: {
        BasicAgGrid
    },
    props: {
        columnDefs: {
            default: () => {
                const items = tableData.columnDefs.map(item => {
                    return {...item, sortable: true};
                });
                return object('columnDefs', items);
            }
        },
        rowData: {
            default: () => object('rowData', tableData.rowData)
        }
    },
    template: template,
    methods: actionsData
});

export const Filter = () => ({
    components: {
        BasicAgGrid
    },
    props: {
        columnDefs: {
            default: () => {
                const items = tableData.columnDefs.map(item => {
                    return {...item, filter: true};
                });
                return object('columnDefs', items);
            }
        },
        rowData: {
            default: () => object('rowData', tableData.rowData)
        }
    },
    template: template,
    methods: actionsData
});

export const FullyLoaded = () => ({
    components: {
        BasicAgGrid
    },
    props: {
        columnDefs: {
            default: () => {
                const items = tableData.columnDefs.map(item => {
                    return {...item, editable: true, sortable: true, filter: true};
                });
                return object('columnDefs', items);
            }
        },
        rowData: {
            default: () => object('rowData', tableData.rowData)
        }
    },
    template: template,
    methods: actionsData
});
