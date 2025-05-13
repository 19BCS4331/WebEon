// StyledButton.js
import React, { useContext } from "react";
import styled from "styled-components";
import ThemeContext from "../../contexts/ThemeContext";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';

const Button = styled.button`
  border: none;
  color: ${(props) => props.textColor || props.theme.text};
  background-color: ${(props) => props.bgColor || props.theme.secondaryBG};
  border-radius: 15px;
  width: 40%;
  height: 5vh;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  gap: ${(props)=> props.searchIcon || props.addIcon || props.doneIcon || props.downloadIcon || props.refreshIcon || props.loading ? "5px" : "0px"};
  align-items: center;
  justify-content: center;
  text-align: center;
 

  &:hover {
    // opacity: 0.7;
    color: ${(props) => props.textColOnHover || props.theme.background};
    font-size: 15px;
    background-color: ${(props) => props.bgColorHover || props.theme.text};
    border-radius: 20px;
    box-shadow: 0px 1px 11px -3px rgba(255, 255, 255, 1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledButton = ({
  children,
  bgColor,
  textColor,
  bgColorHover,
  textColOnHover,
  SearchIconColorOnHover,
  AddIconColorOnHover,
  DoneIconColorOnHover,
  DownloadIconColorOnHover,
  RefreshIconColorOnHover,
  searchIcon=false,
  addIcon = false,
  doneIcon = false,
  downloadIcon = false,
  refreshIcon = false,
  loading = false,
  spinnerSize = 24,
  ...props
}) => {
  const { Colortheme } = useContext(ThemeContext);

  return (
    <Button
      theme={Colortheme}
      textColor={textColor}
      textColOnHover={textColOnHover}
      bgColor={bgColor}
      bgColorHover={bgColorHover}
      SearchIconColorOnHover={SearchIconColorOnHover}
      AddIconColorOnHover={AddIconColorOnHover}
      DoneIconColorOnHover={DoneIconColorOnHover}
      DownloadIconColorOnHover={DownloadIconColorOnHover}
      RefreshIconColorOnHover={RefreshIconColorOnHover}
      searchIcon={searchIcon}
      addIcon={addIcon} 
      downloadIcon={downloadIcon}
      refreshIcon={refreshIcon}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <CircularProgress 
          size={spinnerSize} 
          sx={{ 
            color: Colortheme.text,
            
          }} 
        />
      ) : (
        <>
          {searchIcon && <SearchIcon sx={{color: SearchIconColorOnHover}}/>}
          {addIcon && <AddIcon sx={{color: AddIconColorOnHover}}/>}
          {doneIcon && <DoneIcon sx={{color: DoneIconColorOnHover}}/>}
          {downloadIcon && <DownloadIcon sx={{color: DownloadIconColorOnHover}}/>}
          {refreshIcon && <RefreshIcon sx={{color: RefreshIconColorOnHover}}/>}
          {children}
        </>
      )}
      
    </Button>
  );
};

export default StyledButton;
