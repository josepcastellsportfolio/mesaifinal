/**
 * Main application layout component with sidebar navigation and header.
 * Uses Telerik UI components for a professional look and responsive design.
 */

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/queries/auth.queries';
import { 
  Drawer, 
  DrawerContent,
  AppBar, 
  AppBarSection, 
  AppBarSpacer,
  Avatar 
} from '@progress/kendo-react-layout';
import { 
  Button 
} from '@progress/kendo-react-buttons';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/queries';
import { ROUTES, NAVIGATION_ITEMS } from '@/constants';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auth store and logout mutation
  const { user, setUser, hasAnyRole } = useAuthStore();
  const logoutMutation = useLogout();
  
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Helper function to check user role (now using store method)
  const checkAnyRole = (requiredRoles: string[]): boolean => {
    return hasAnyRole(requiredRoles);
  };

  // Filter navigation items based on user role
  const filteredNavItems = NAVIGATION_ITEMS.filter(item => 
    !item.roles || checkAnyRole([...item.roles])
  );

  const handleNavigation = (path: string) => {
    navigate(path);
  };

const { data: username } = useCurrentUser();


  const handleLogout = async () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setUser(null);
        navigate(ROUTES.LOGIN);
      },
      onError: (error) => {
        console.error('Logout failed:', error);
        // Even if logout fails on server, clear local state
        setUser(null);
        navigate(ROUTES.LOGIN);
      }
    });
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Icon mapping for navigation items
  const getIconForItem = (iconName: string): string => {
    const iconMap: Record<string, string> = {
      dashboard: '📊',
      api: '🔧',
      product: '📦',
      category: '📂',
      people: '👥',
      settings: '⚙️',
    };
    return iconMap[iconName] || '📄';
  };

  const renderSidebarContent = () => (
    <div className="sidebar-content">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo">
          {sidebarExpanded ? (
            <h3>Mesai Final</h3>
          ) : (
            <span>MF</span>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredNavItems.map((item) => (
            <li key={item.path} className="nav-item">
              <button
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                title={sidebarExpanded ? '' : item.label}
              >
                <span className={`nav-icon icon-${item.icon}`}>
                  {getIconForItem(item.icon)}
                </span>
                {sidebarExpanded && (
                  <span className="nav-text">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  const renderHeader = () => (
    <AppBar>
      <AppBarSection>
        <Button
          icon="menu"
          fillMode="flat"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
        />
      </AppBarSection>
      
      <AppBarSpacer />
      
      <AppBarSection>
        <div className="user-section">
          <span className="user-name">
  {user?.first_name} {user?.last_name} {/* o user?.username */}
</span>
          <div className="user-menu">
            <Button
              fillMode="flat"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <Avatar
                type="image"
                size="small"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.full_name} />
                ) : (
                  <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                )}
              </Avatar>
            </Button>
            
            {userMenuOpen && (
              <div className="user-dropdown">
                <ul>
                  <li>
                    <button onClick={() => navigate(ROUTES.PROFILE)}>
                      Profile
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate(ROUTES.SETTINGS)}>
                      Settings
                    </button>
                  </li>
                  <li className="divider" />
                  <li>
                    <button onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </AppBarSection>
    </AppBar>
  );

  return (
    <div className="app-layout">
      <Drawer
        expanded={sidebarExpanded}
        position="start"
        mode="push"
        mini={true}
        width={250}
        miniWidth={60}
        items={[]}
      >
        <DrawerContent>
          {renderSidebarContent()}
        </DrawerContent>
      </Drawer>
      
      {/* Main layout content */}
      <div className="app-content">
        {/* Header */}
        <header className="app-header">
          {renderHeader()}
        </header>

        {/* Main Content */}
        <main className="app-main">
          <div className="main-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

