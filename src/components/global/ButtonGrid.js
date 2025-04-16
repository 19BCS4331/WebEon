// ButtonGrid.js
import React from "react";
import styled from "styled-components";
import StyledButton from "./StyledButton";
import { useMediaQuery, useTheme } from "@mui/material";

// Flex container for more flexible button layout
const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.gap || '1rem'};
  margin-bottom: ${props => props.marginBottom || '1.5rem'};
  width: 100%;
  justify-content: center;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  /* No fixed width - let buttons determine their own width */
  ${props => props.isMobile ? 'width: 100%;' : ''}
`;

/**
 * ButtonGrid - A reusable component for displaying a grid of buttons
 * 
 * @param {Object[]} buttons - Array of button configurations
 * @param {string} buttons[].label - Text to display on the button
 * @param {function} buttons[].onClick - Function to call when button is clicked
 * @param {string} [buttons[].icon] - Optional icon type ('search', 'add', 'done', 'download')
 * @param {Object} [buttons[].props] - Additional props to pass to StyledButton
 * @param {string} [gap='1rem'] - Gap between buttons
 * @param {string} [marginBottom='1.5rem'] - Bottom margin of the grid
 */
const ButtonGrid = ({
  buttons = [],
  gap = '1rem',
  marginBottom = '1.5rem',
  style = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <FlexContainer 
      gap={gap} 
      marginBottom={marginBottom}
      style={style}
    >
      {buttons.map((button, index) => {
        const { label, onClick, icon, style: buttonStyle, ...buttonProps } = button;
        
        // Determine icon props
        const iconProps = {};
        if (icon === 'search') iconProps.searchIcon = true;
        if (icon === 'add') iconProps.addIcon = true;
        if (icon === 'done') iconProps.doneIcon = true;
        if (icon === 'download') iconProps.downloadIcon = true;
        if (icon === 'refresh') iconProps.refreshIcon = true;
        
        return (
          <ButtonWrapper key={index} isMobile={isMobile}>
            <StyledButton 
              onClick={onClick}
              style={buttonStyle}
              {...iconProps}
              {...buttonProps}
            >
              {label}
            </StyledButton>
          </ButtonWrapper>
        );
      })}
    </FlexContainer>
  );
};

export default ButtonGrid;
