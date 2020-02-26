<template>
    <ag-grid-vue style="width: 500px; height: 500px;"
                 class="ag-theme-balham"
                 :columnDefs="gridColDefs"
                 :rowData="gridRowData"
                 @grid-ready="onGridReady"
    ></ag-grid-vue>
</template>

<script>
    import {AgGridVue} from "ag-grid-vue";

    export default {
        name: 'BasicAgGrid',
        props: {
            columnDefs: {
                type: Array,
                required: true,
                default: () => []
            },
            rowData: {
                type: Array,
                required: true,
                default: () => []
            },
        },
        data() {
            return {
                gridColDefs: null,
                gridRowData: null,
                gridApi: null,
                columnApi: null,
            }
        },
        components: {
            AgGridVue
        },
        methods: {
          onGridReady(params) {
              // console.log("ongrid ready: ", params);
              this.gridApi = params.api;
              this.columnApi = params.columnApi;
          }
        },
        beforeMount() {
            this.gridColDefs = this.columnDefs;
            this.gridRowData = this.rowData;
        },
        watch: {
            columnDefs: function (newVal, oldVal) {
                // console.log('columnDefs prop changed: ', newVal, ' | was: ', oldVal);
                this.gridApi.setColumnDefs(newVal);
                // console.log("this.gridColDefs: ", this.gridColDefs);
            },
            rowData: function (newVal, oldVal) {
                // console.log('rowdata prop changed: ', newVal, ' | was: ', oldVal);
                this.gridRowData = newVal;
                // console.log("this.gridRowData: ", this.gridRowData);
                this.gridApi.refreshCells();
            }

        }
    }
</script>


<style src="../../node_modules/ag-grid-community/dist/styles/ag-grid.css"></style>
<style src="../../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css"></style>




