// StyledButton.js
import React, { useContext } from "react";
import styled from "styled-components";
import ThemeContext from "../../contexts/ThemeContext";

const Button = styled.button`
  border: none;
  color: ${(props) => props.theme.text};
  background-color: ${(props) => props.bgColor || props.theme.secondaryBG};
  border-radius: 15px;
  width: 40%;
  height: 5vh;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    opacity: 0.7;
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
  bgColorHover,
  textColOnHover,
  ...props
}) => {
  const { Colortheme } = useContext(ThemeContext);

  return (
    <Button
      theme={Colortheme}
      textColOnHover={textColOnHover}
      bgColor={bgColor}
      bgColorHover={bgColorHover}
      {...props}
    >
      {children}
    </Button>
  );
};

export default StyledButton;
