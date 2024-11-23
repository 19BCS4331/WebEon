import React from "react";
import { DataGrid } from "@mui/x-data-grid";


const CustomDataGrid = ({
  rows,
  columns,
  selectionModel,
  onSelectionModelChange,
  searchKeyword,
  setSearchKeyword,
  Colortheme,
  customSx,
  getRowId,
  sortModel,
  columnVisibilityModel,
  maxHeight,
  ...props
}) => {

  const defaultSx = {
    backgroundColor: Colortheme.background,
    maxHeight: maxHeight || "60vh",
    width: "100%",
    minWidth: 0,
    overflow: "auto",
    border: "2px solid",
    borderColor: Colortheme.background,
    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      {
        display: "none",
      },
    "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
      backgroundColor: Colortheme.background,
      color: Colortheme.text,
    },
    "& .MuiDataGrid-root": {
      color: Colortheme.text,
    },
    "& .MuiTablePagination-root": {
      color: Colortheme.text,
    },
    "& .MuiSvgIcon-root": {
      color: Colortheme.text,
    },
    "& .Mui-disabled .MuiSvgIcon-root": {
      color: "grey",
    },
    "& .MuiDataGrid-toolbarContainer": {
      color: Colortheme.text,
    },
    "& .MuiDataGrid-footerContainer": {
      backgroundColor: Colortheme.background,
    },
    "& .MuiButtonBase-root": {
      color: Colortheme.text,
    },
    "& .MuiButtonBase-root.Mui-disabled": {
      color: "grey",
    },
    // Custom Scrollbar Styles
    "& ::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "& ::-webkit-scrollbar-track": {
      background: Colortheme.background,
    },
    "& ::-webkit-scrollbar-thumb": {
      backgroundColor: Colortheme.text,
      borderRadius: "4px",
    },
    "& ::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "grey",
    },
    ...customSx,
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSize={5}
      disableRowSelectionOnClick
      disableColumnFilter
      getRowId={getRowId}
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={onSelectionModelChange}
      sortModel={sortModel}
      columnVisibilityModel={columnVisibilityModel}
      onModelChange={(model) => {
        if (model.filterModel && model.filterModel.items.length > 0) {
          setSearchKeyword(model.filterModel.items[0].value);
        } else {
          setSearchKeyword("");
        }
      }}
      sx={defaultSx}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 5 },
        },
      }}
      pageSizeOptions={[5, 10]}
      {...props}
    />
  );
};

export default CustomDataGrid;
