// StyledButton.js
import React, { useContext } from "react";
import styled from "styled-components";
import ThemeContext from "../../contexts/ThemeContext";

const Button = styled.button`
  // border: 1px solid ${(props) => props.theme.text};
  border: none;
  color: ${(props) => props.theme.text};
  background-color: ${(props) => props.theme.background};
  border-radius: 15px;
  width: 40%;
  height: 5vh;
  margin-top: 40px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    opacity: 0.7;
    color: ${(props) => props.theme.background};
    font-size: 15px;
    background-color: ${(props) => props.theme.text};
    border-radius: 20px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledButton = ({ children, ...props }) => {
  const { Colortheme } = useContext(ThemeContext);

  return (
    <Button theme={Colortheme} {...props}>
      {children}
    </Button>
  );
};

export default StyledButton;
