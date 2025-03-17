import { Box, Grid, Paper, Typography, useMediaQuery, useTheme, CircularProgress } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import "../css/pages/Dashboard.css";
import Marquee from "react-fast-marquee";
import MainContainerCompilation from "../components/global/MainContainerCompilation";
import ThemeContext from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { AttachMoney, TrendingUp, AccountBalance, SwapHoriz, CurrencyRupee } from '@mui/icons-material';
import axios from 'axios';
import { apiClient } from "../services/apiClient";
import {useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { Colortheme } = useContext(ThemeContext);
  const {branch} = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todayTransactions: [],
    recentTransactions: [],
    currencyRates: [],
    stats: {
      totalTransactions: 0,
      totalVolume: 0,
      avgTransactionValue: 0,
      growth: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!branch?.nBranchID || !branch?.vBranchCode) {
          showToast('error', 'Branch information not available');
          setLoading(false);
          return;
        }
    
        const response = await apiClient.post('/api/dashboard/stats', {
          nBranchID: branch.nBranchID,
          vBranchCode: branch.vBranchCode
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast('error', error.response?.data?.error || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [showToast, branch]);

  // Stats cards data
  const statCards = [
    { 
      title: 'Total Transactions', 
      value: dashboardData.stats.totalTransactions, 
      icon: SwapHoriz, 
      color: '#4CAF50' 
    },
    { 
      title: 'Total Volume', 
      value: `₹${dashboardData.stats.totalVolume.toLocaleString()}`, 
      icon: CurrencyRupee, 
      color: '#2196F3' 
    },
    { 
      title: 'Avg Transaction', 
      value: `₹${dashboardData.stats.avgTransactionValue.toLocaleString()}`, 
      icon: AccountBalance, 
      color: '#9C27B0' 
    },
    { 
      title: 'Growth', 
      value: `${dashboardData.stats.growth}%`, 
      icon: TrendingUp, 
      color: '#FF9800' 
    }
  ];

  if (loading) {
    return (
      <MainContainerCompilation title={"Dashboard"}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </MainContainerCompilation>
    );
  }

  return (
    <MainContainerCompilation title={"Dashboard"}>
    <Box
      sx={{
        height: 'calc(100vh - 100px)',
        width: '98%',
        overflowY: 'auto',
        overflowX: 'hidden',
        p: 3,
        // backgroundColor: Colortheme.background,
        '&::-webkit-scrollbar': {
          width: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: `${Colortheme.background}99`,
          borderRadius: '10px',
          border: `2px solid ${Colortheme.text}22`,
          transition: 'all 0.3s ease',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: Colortheme.text,
          borderColor: `${Colortheme.text}44`,
        },
      }}
    >
      {/* Currency Rates Marquee */}
      <Marquee
        pauseOnHover={true}
        style={{
          width: '100%',
          justifySelf:'center',
          color: Colortheme.text,
          marginBottom: '24px',
          padding: '12px',
          borderRadius: '8px',
          background: `${Colortheme.text}11`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Typography variant="h6" component="span" fontFamily={"Poppins"} sx={{ fontWeight: 500 }}>
          Live Currency Rates: &nbsp;
        </Typography>
        {dashboardData.currencyRates.map((rate, index) => (
          <span key={rate.currency} style={{ 
            padding: '4px 12px',
            margin: '0 4px',
            borderRadius: '4px',
            background: `${Colortheme.text}11`,
          }}>
            {rate.currency}: {parseFloat(rate.rate).toFixed(2)} &nbsp;
          </span>
        ))}
      </Marquee>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                backgroundColor: `${stat.color}11`,
                color: Colortheme.text,
                borderRadius: '12px',
                boxShadow: `0 8px 32px -4px ${stat.color}22`,
                transition: 'all 0.3s ease',
                border: `1px solid ${stat.color}22`,
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 12px 40px -8px ${stat.color}44`,
                  borderColor: `${stat.color}44`,
                  backgroundColor: `${stat.color}22`,
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" component="h2" fontFamily={"Poppins"} sx={{ 
                  fontWeight: 500,
                  color: stat.color,
                }}>
                  {stat.title}
                </Typography>
                <stat.icon sx={{ 
                  color: stat.color,
                  fontSize: 40,
                  filter: `drop-shadow(0 4px 8px ${stat.color}44)`,
                }} />
              </Box>
              <Typography variant="h4" component="p" fontFamily={"Poppins"} sx={{ 
                mt: 2,
                color: stat.color,
                fontWeight: 600,
                textShadow: `0 2px 4px ${stat.color}22`,
              }}>
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Transaction Volume Trend */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 4,
              height: 350,
              backgroundColor: Colortheme.background,
              color: Colortheme.text,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: `1px solid ${Colortheme.text}11`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                borderColor: `${Colortheme.text}22`,
              }
            }}
          >
            <Typography variant="h6" gutterBottom fontFamily={"Poppins"} sx={{ 
              fontWeight: 500,
              mb: 3,
              color: `${Colortheme.text}dd`,
            }}>
              Transaction Volume Trend
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={dashboardData.recentTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke={Colortheme.text} opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  stroke={Colortheme.text}
                  tick={{ fill: Colortheme.text }}
                />
                <YAxis 
                  stroke={Colortheme.text}
                  tick={{ fill: Colortheme.text }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: Colortheme.background,
                    border: `1px solid ${Colortheme.text}`,
                    color: Colortheme.text
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Today's Transaction Distribution */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              height: 350,
              backgroundColor: Colortheme.background,
              color: Colortheme.text,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: `1px solid ${Colortheme.text}11`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                borderColor: `${Colortheme.text}22`,
              }
            }}
          >
            <Typography variant="h6" gutterBottom fontFamily={"Poppins"}>Today's Transactions</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={dashboardData.todayTransactions}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.todayTransactions.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={[
                        '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C'
                      ][index % 5]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: Colortheme.background,
                    border: `1px solid ${Colortheme.text}`,
                    color: Colortheme.text
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Currency-wise Volume */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 4,
              backgroundColor: Colortheme.background,
              color: Colortheme.text,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: `1px solid ${Colortheme.text}11`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                borderColor: `${Colortheme.text}22`,
              }
            }}
          >
            <Typography variant="h6" gutterBottom fontFamily={"Poppins"}>Currency-wise Transaction Volume</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.todayTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke={Colortheme.text} opacity={0.1} />
                <XAxis 
                  dataKey="currency" 
                  stroke={Colortheme.text}
                  tick={{ fill: Colortheme.text }}
                />
                <YAxis 
                  stroke={Colortheme.text}
                  tick={{ fill: Colortheme.text }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: Colortheme.background,
                    border: `1px solid ${Colortheme.text}`,
                    color: Colortheme.text
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="volume" 
                  fill="#8884d8"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </MainContainerCompilation>
  );
};

export default Dashboard;