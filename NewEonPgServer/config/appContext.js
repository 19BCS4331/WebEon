// Application context map for AI assistant
const appContext = {
    pages: {
        dashboard: {
            path: '/dashboard',
            features: [
                'Overview of financial metrics',
                'Quick access to recent transactions',
                'Financial summaries and charts',
                'Performance indicators',
                'Real-time currency rates'
            ],
            relatedFeatures: ['reports', 'transactions']
        },
        master: {
            path: '/master',
            features: [
                'System configuration',
                'Master data management',
                'System setup options'
            ],
            subPages: {
                masterProfiles: {
                    path: '/master-profiles',
                    features: [
                        'Currency profile management',
                        'Financial codes configuration',
                        'Division and accounts setup',
                        'AD1 provider management'
                    ],
                    subPages: {
                        currencyProfile: {
                            path: '/master-profiles/currency-profile',
                            features: ['Currency configuration', 'Exchange rate settings']
                        },
                        financialCodes: {
                            path: '/master-profiles/financial-codes',
                            features: ['Financial code management', 'Code categorization']
                        },
                        accountsProfile: {
                            path: '/master-profiles/accounts-profile',
                            features: ['Account setup', 'Profile management']
                        }
                    }
                },
                systemSetup: {
                    path: '/system-setup',
                    features: [
                        'System configuration settings',
                        'Global system parameters',
                        'Advanced settings'
                    ],
                    subPages: {
                        companyProfile: {
                            path: '/system-setup/company-profile',
                            features: [
                                'Company information management',
                                'Business details configuration',
                                'Company settings'
                            ]
                        },
                        branchProfile: {
                            path: '/system-setup/branch-profile',
                            features: [
                                'Branch location management',
                                'Branch settings configuration',
                                'Location details'
                            ]
                        },
                        userProfile: {
                            path: '/system-setup/UserGroup',
                            features: [
                                'User management and creation',
                                'User role assignment',
                                'User permissions configuration',
                                'User profile editing'
                            ],
                            howTo: {
                                manageUsers: [
                                    'Navigate to Master menu',
                                    'Select System Setup',
                                    'Click on User Profile',
                                    'Here you can:',
                                    '- View all users',
                                    '- Create new users',
                                    '- Edit existing user profiles',
                                    '- Manage user roles and permissions'
                                ]
                            }
                        },
                        advSettings: {
                            path: '/system-setup/adv-settings',
                            features: [
                                'Advanced system configuration',
                                'System parameters setup',
                                'Global settings management'
                            ]
                        },
                        mailConfig: {
                            path: '/system-setup/mail-server-config',
                            features: [
                                'Mail server configuration',
                                'Email settings management',
                                'Notification setup'
                            ]
                        }
                    }
                }
            }
        },
        transactions: {
            path: '/transactions',
            features: [
                'Create and manage transactions',
                'Transaction history',
                'Bulk transaction operations'
            ],
            subPages: {
                accounting: {
                    path: '/transactions/accounting',
                    features: [
                        'Payment processing',
                        'Receipt management',
                        'Journal entries'
                    ],
                    subPages: {
                        payment: {
                            path: '/transactions/accounting/payment',
                            features: ['Payment processing', 'Payment records']
                        },
                        receipt: {
                            path: '/transactions/accounting/receipt',
                            features: ['Receipt management', 'Receipt records']
                        },
                        journal: {
                            path: '/transactions/accounting/journal-vouchers',
                            features: ['Journal entry creation', 'Voucher management']
                        }
                    }
                },
                buyingSelling: {
                    path: '/transactions/buying-selling',
                    features: [
                        'Currency buying transactions',
                        'Currency selling transactions',
                        'Rate management'
                    ],
                    subPages: {
                        buyFromIndividuals: {
                            path: '/transactions/buying-selling/buy-from-individuals',
                            features: ['Individual purchase transactions', 'Rate calculation']
                        },
                        sellToIndividuals: {
                            path: '/transactions/buying-selling/sell-to-individuals',
                            features: ['Individual sale transactions', 'Rate application']
                        }
                    }
                },
                maker: {
                    path: '/transactions/maker',
                    features: [
                        'Transaction creation',
                        'Initial processing',
                        'Draft management'
                    ],
                    subPages: {
                        payment: {
                            path: '/transactions/maker/payment',
                            features: ['Payment creation', 'Payment drafts']
                        },
                        receipt: {
                            path: '/transactions/maker/receipt',
                            features: ['Receipt creation', 'Receipt drafts']
                        }
                    }
                },
                checker: {
                    path: '/transactions/checker',
                    features: [
                        'Transaction verification',
                        'Approval process',
                        'Review management'
                    ],
                    subPages: {
                        payment: {
                            path: '/transactions/checker/payment',
                            features: ['Payment verification', 'Payment approval']
                        },
                        receipt: {
                            path: '/transactions/checker/receipt',
                            features: ['Receipt verification', 'Receipt approval']
                        }
                    }
                }
            }
        },
        tools: {
            path: '/tools',
            features: [
                'System utilities',
                'Administrative tools',
                'Maintenance features'
            ],
            subPages: {
                systemTools: {
                    path: '/tools/system-tools',
                    features: [
                        'System maintenance',
                        'Configuration tools',
                        'Database management'
                    ],
                    subPages: {
                        passwordPolicy: {
                            path: '/tools/system-tools/password-policy',
                            features: [
                                'Password rules configuration',
                                'Security policy management'
                            ]
                        },
                        dbSettings: {
                            path: '/tools/system-tools/yr-wise-db-settings',
                            features: [
                                'Database configuration',
                                'Year-wise settings'
                            ]
                        }
                    }
                },
                auditTrail: {
                    path: '/tools/audit-trail',
                    features: [
                        'Activity logging',
                        'Change tracking',
                        'Audit reports'
                    ],
                    subPages: {
                        changeDateRequest: {
                            path: '/tools/audit-trail/change-date-request',
                            features: ['Date modification requests', 'Change tracking']
                        },
                        changeInfoRequest: {
                            path: '/tools/audit-trail/change-pax-info-request',
                            features: ['Information update requests', 'Change management']
                        }
                    }
                }
            }
        }
    },
    roles: {
        admin: {
            capabilities: [
                'Full system access',
                'User management via Master > System Setup > User Profile',
                'System configuration via Master > System Setup',
                'Advanced settings management',
                'Audit trail access',
                'Transaction approval authority',
                'Report generation and export',
                'Master data management'
            ],
            restrictedFeatures: []
        },
        user: {
            capabilities: [
                'Basic transaction creation',
                'Report viewing',
                'Profile management',
                'Transaction history access'
            ],
            restrictedFeatures: [
                'User management',
                'System configuration',
                'Advanced settings',
                'Audit trail access'
            ]
        }
    },
    commonTasks: {
        userManagement: {
            path: 'Master > System Setup > User Profile',
            steps: [
                'Access the Master menu',
                'Click on System Setup',
                'Select User Profile',
                'Perform user management tasks'
            ]
        },
        transactionCreation: {
            path: 'Transactions > Maker',
            steps: [
                'Go to Transactions menu',
                'Select Maker section',
                'Choose transaction type',
                'Fill required details',
                'Submit for approval'
            ]
        },
        systemConfiguration: {
            path: 'Master > System Setup > Advanced Settings',
            steps: [
                'Navigate to Master menu',
                'Enter System Setup',
                'Select Advanced Settings',
                'Modify system parameters'
            ]
        }
    }
};

module.exports = appContext;
