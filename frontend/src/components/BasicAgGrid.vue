<template>
    <ag-grid-vue style="width: 500px; height: 500px;"
                 class="ag-theme-balham"
                 :gridOptions="gridOptions"
>
    </ag-grid-vue>
</template>

<script>
    import {AgGridVue} from "ag-grid-vue";

    export default {
        name: 'BasicAgGrid',
        data() {
            return {
                // columnDefs: null,
                // rowData: null
                gridOptions: null
            }
        },
        components: {
            AgGridVue
        },
        beforeMount() {
            // this.columnDefs = [
            //     {headerName: 'Make', field: 'make'},
            //     {headerName: 'Model', field: 'model'},
            //     {headerName: 'Price', field: 'price'}
            // ];

            // this.rowData = [
            //     {make: 'Toyota', model: 'Celica', price: 35000},
            //     {make: 'Ford', model: 'Mondeo', price: 32000},
            //     {make: 'Porsche', model: 'Boxter', price: 72000}
            // ];

            this.gridOptions = {
                columnDefs: [
                    {headerName: 'Make', field: 'make', editable: true},
                    {headerName: 'Model', field: 'model', editable: true},
                    {headerName: 'Price', field: 'price', editable: true}
                ],
                rowData: [
                    {make: 'Toyota', model: 'Celica', price: 35000},
                    {make: 'Ford', model: 'Mondeo', price: 32000},
                    {make: 'Porsche', model: 'Boxter', price: 72000}
                ],

            };

        }
    }
</script>



<style src="../../node_modules/ag-grid-community/dist/styles/ag-grid.css"></style>
<style src="../../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css"></style>




