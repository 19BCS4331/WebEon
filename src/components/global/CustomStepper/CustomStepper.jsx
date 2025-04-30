import React, { useContext } from 'react';
import { Stepper, Step, StepLabel, styled } from '@mui/material';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import Check from '@mui/icons-material/Check';
import ThemeContext from '../../../contexts/ThemeContext';

// Custom connector styling
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg, green 0%, ${theme.text} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg, ${theme.secondaryBG} 0%, green 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: 'gray',
    borderRadius: 1,
  },
}));

// Custom step icon styling
const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: 'lightgray',
  zIndex: 1,
  color: 'white',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  ...(ownerState.active && {
    backgroundImage: `linear-gradient( 136deg, ${theme.text} 90%, ${theme.secondaryBG} 100%)`,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient( 230deg, #9ffcb8 10%, green 100%)`,
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className, onClick } = props;
  const { Colortheme } = useContext(ThemeContext);

  return (
    <CustomStepIconRoot 
      ownerState={{ active, completed }} 
      className={className} 
      theme={Colortheme}
      onClick={onClick}
    >
      {completed ? <Check className="CompletedIcon" /> : (
        <span style={{ 
          color: active ? Colortheme.background : '#999',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}>
          {props.icon}
        </span>
      )}
    </CustomStepIconRoot>
  );
}

const CustomStepper = ({ activeStep, steps, onStepClick }) => {
  const { Colortheme } = useContext(ThemeContext);
  
  return (
    <Stepper 
      alternativeLabel 
      activeStep={activeStep} 
      connector={<CustomConnector theme={Colortheme} />}
      sx={{ 
        p:1,
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        // Custom Scrollbar Styles
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: Colortheme.background,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: Colortheme.text,
          borderRadius: '8px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: Colortheme.secondaryBGcontra,
        },
        '& .MuiStepLabel-root': {
          cursor: 'pointer',
          padding: { xs: '0 8px', sm: '0 16px' },
        },

        '& .MuiStep-root': {
          padding: { xs: '0', sm: '0 16px' },
          minWidth: { xs: 'auto', sm: '160px' },
        },
        '& .MuiStepConnector-root': {
          left: { xs: 'calc(-50% + 20px)', sm: 'calc(-50% + 25px)' },
          right: { xs: 'calc(50% + 20px)', sm: 'calc(50% + 25px)' }
        },
        '& .MuiStepLabel-label': {
          fontFamily: 'Poppins',
          marginTop: '8px',
          color: 'gray',
          '&.Mui-active': {
            fontFamily: 'Poppins',
            color: Colortheme.text,
            fontWeight: 'bold',
          },
          '&.Mui-completed': {
            fontFamily: 'Poppins',
            color: '#399151',
          },
        },
        '& .CompletedIcon': {
          color:'white',
        },
      }}
    >
      {steps.map((label, index) => (
        <Step key={label} onClick={() => onStepClick(index)}>
          <StepLabel 
          
            StepIconComponent={(props) => (
              <CustomStepIcon {...props} onClick={() => onStepClick(index)} />
            )}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default CustomStepper;
