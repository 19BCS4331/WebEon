const fs = require('fs').promises;
const path = require('path');

// Cache for route metadata
let routeMetadataCache = null;

/**
 * Route metadata structure for better AI navigation
 */
class RouteMetadata {
    constructor(path, title, description, keywords, parentPath = null) {
        this.path = path;
        this.title = title;
        this.description = description;
        this.keywords = keywords;
        this.parentPath = parentPath;
        this.children = [];
    }
}

/**
 * Convert path to title
 * e.g., '/system-setup/UserGroup/false' -> 'User Profiles'
 */
const pathToTitle = (path) => {
    // Add your path mappings here
    const pathMappings = {
        '/dashboard': 'Dashboard',
        '/system-setup/UserGroup/false': 'User Profiles',
        '/system-setup/UserGroup/true': 'User Groups',
        '/finance/transactions': 'Transactions',
        '/finance/reports': 'Financial Reports',
        '/settings/general': 'General Settings',
        '/settings/security': 'Security Settings',
        // Add more mappings as needed
    };

    return pathMappings[path] || path.split('/').pop().replace(/([A-Z])/g, ' $1').trim();
};

/**
 * Generate keywords from path and title
 */
const generateKeywords = (path, title, description) => {
    const keywords = new Set();
    
    // Add path segments as keywords
    path.split('/').forEach(segment => {
        if (segment) {
            // Split on camelCase and remove special characters
            segment.split(/(?=[A-Z])/).forEach(word => {
                keywords.add(word.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
            });
        }
    });
    
    // Add title words as keywords
    title.split(' ').forEach(word => {
        keywords.add(word.toLowerCase());
    });
    
    // Add description words as keywords
    if (description) {
        description.split(' ').forEach(word => {
            keywords.add(word.toLowerCase());
        });
    }
    
    return Array.from(keywords);
};

/**
 * Generate description from title and path
 */
const generateDescription = (path, title) => {
    const action = path.includes('Group') ? 'Manage' : 'View and manage';
    return `${action} ${title.toLowerCase()}`;
};

/**
 * Load routes from a JSON configuration file
 */
const loadRoutesFromConfig = async () => {
    try {
        const configPath = path.join(__dirname, 'routes-config.json');
        const configExists = await fs.access(configPath).then(() => true).catch(() => false);
        
        if (configExists) {
            const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
            // Access the routes array from the config
            return config.routes || [];
        }
    } catch (error) {
        console.warn('Could not load routes config:', error);
    }
    return null;
};

/**
 * Define route metadata for the application
 */
const defineRoutes = async () => {
    const routes = new Map();
    
    // Try to load routes from config first
    const configRoutes = await loadRoutesFromConfig();
    
    if (configRoutes) {
        // Use routes from config file
        for (const route of configRoutes) {
            const routeMetadataObject = new RouteMetadata(
                route.path,
                route.title || pathToTitle(route.path),
                route.description || generateDescription(route.path, route.title || pathToTitle(route.path)),
                route.keywords || generateKeywords(route.path, route.title || pathToTitle(route.path), route.description)
            );
            routes.set(route.path, routeMetadataObject);
        }
    } else {
        // Fallback to hardcoded routes
        const routeMetadata = [
            // Dashboard
            {
                path: '/dashboard',
                title: 'Dashboard',
                description: 'Main dashboard overview',
                keywords: ['dashboard', 'home', 'main', 'overview'],
            },
            // User Management Section
            {
                path: '/system-setup/UserGroup/false',
                title: 'User Management',
                description: 'Manage system users and access control',
                keywords: ['users', 'accounts', 'people', 'staff', 'employees', 'team members'],
                children: [
                    {
                        path: '/system-setup/UserGroup/false',
                        title: 'User Profiles',
                        description: 'View and manage individual user accounts',
                        keywords: ['profile', 'account', 'user details', 'personal info', 'contact', 'user permissions', 'user', 'user profile']
                    },
                    {
                        path: '/system-setup/UserGroup/true',
                        title: 'User Groups',
                        description: 'Manage user groups and permissions',
                        keywords: ['groups', 'roles', 'group permissions', 'access levels', 'teams', 'group management', 'group', 'group profile', 'user group']
                    }
                ]
            },
            // Financial Management Section
            {
                path: '/finance',
                title: 'Financial Management',
                description: 'Manage financial transactions and reports',
                keywords: ['finance', 'money', 'transactions', 'accounting'],
                children: [
                    {
                        path: '/finance/transactions',
                        title: 'Transactions',
                        description: 'View and manage financial transactions',
                        keywords: ['transactions', 'payments', 'transfers', 'money movement']
                    },
                    {
                        path: '/finance/reports',
                        title: 'Financial Reports',
                        description: 'Generate and view financial reports',
                        keywords: ['reports', 'statements', 'analytics', 'summaries']
                    }
                ]
            },
            // Settings Section
            {
                path: '/settings',
                title: 'System Settings',
                description: 'Configure system preferences and options',
                keywords: ['settings', 'preferences', 'configuration', 'setup'],
                children: [
                    {
                        path: '/settings/general',
                        title: 'General Settings',
                        description: 'Basic system configuration options',
                        keywords: ['general', 'basic', 'system', 'preferences']
                    },
                    {
                        path: '/settings/security',
                        title: 'Security Settings',
                        description: 'Configure security and access control options',
                        keywords: ['security', 'access', 'permissions', 'authentication']
                    },
                    {
                        path: '/system-setup/select-theme',
                        title: 'Theme Settings',
                        description: 'Select and customize the system theme',
                        keywords: ['theme', 'color', 'appearance', 'dark', 'light', 'mode', 'visual']
                    }
                ]
            }
        ];
        
        for (const route of routeMetadata) {
            const routeMetadataObject = new RouteMetadata(
                route.path,
                route.title,
                route.description,
                route.keywords
            );
            routes.set(route.path, routeMetadataObject);

            if (route.children) {
                for (const child of route.children) {
                    const childRouteMetadataObject = new RouteMetadata(
                        child.path,
                        child.title,
                        child.description,
                        child.keywords,
                        route.path
                    );
                    routes.set(child.path, childRouteMetadataObject);
                    routeMetadataObject.children.push(childRouteMetadataObject);
                }
            }
        }
    }
    
    return routes;
};

const themeKeywords = [
  'theme', 'color', 'appearance', 'dark', 'light', 'mode', 'visual',
  'display', 'ui', 'interface', 'style', 'look', 'design'
];

function isThemeRelatedQuery(query) {
  const lowercaseQuery = query.toLowerCase();
  return themeKeywords.some(keyword => lowercaseQuery.includes(keyword));
}

/**
 * Find the best matching route based on user intent
 */
const findBestRoute = async (userIntent) => {
    try {
        userIntent = userIntent.toLowerCase();
        let bestMatch = null;
        let highestScore = 0;

        if (!routeMetadataCache) {
            routeMetadataCache = await defineRoutes();
        }

        if (isThemeRelatedQuery(userIntent)) {
            const themeRoute = routeMetadataCache.get('/system-setup/select-theme');
            if (themeRoute) {
                return {
                    success: true,
                    route: themeRoute,
                    confidence: 0.9
                };
            }
        }

        for (const [path, route] of routeMetadataCache) {
            let score = 0;
            
            // Check title match
            if (route.title.toLowerCase().includes(userIntent)) {
                score += 3;
            }
            
            // Check description match
            if (route.description.toLowerCase().includes(userIntent)) {
                score += 2;
            }
            
            // Check keyword matches
            for (const keyword of route.keywords) {
                if (userIntent.includes(keyword.toLowerCase())) {
                    score += 1;
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestMatch = route;
            }
        }

        if (bestMatch && highestScore > 0) {
            return {
                success: true,
                route: bestMatch
            };
        }

        return {
            success: false,
            message: 'Could not find a matching route for the given intent'
        };
    } catch (error) {
        console.error('Error in findBestRoute:', error);
        return {
            success: false,
            message: 'Error while finding route'
        };
    }
};

/**
 * Get contextual information about the current route
 */
const getRouteContext = async (currentPath) => {
    if (!routeMetadataCache) {
        routeMetadataCache = await defineRoutes();
    }

    const currentRoute = routeMetadataCache.get(currentPath);
    if (!currentRoute) return null;

    // Get parent and sibling routes
    const parent = currentRoute.parentPath ? routeMetadataCache.get(currentRoute.parentPath) : null;
    const siblings = parent ? parent.children.filter(r => r.path !== currentPath) : [];

    return {
        current: currentRoute,
        parent,
        siblings,
        children: currentRoute.children
    };
};

module.exports = {
    findBestRoute,
    getRouteContext
};
