import { useState, useEffect } from 'react';
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
import './AppLayout.css';

const MOBILE_BREAKPOINT = 768;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, hasAnyRole } = useAuthStore();
  const logoutMutation = useLogout();

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        setSidebarOpen(false);
        setSidebarExpanded(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Always keep user in store in sync with backend (React Query)
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      console.log('Current user object:', currentUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Only show sidebar for admin/manager
  const canSeeSidebar = hasAnyRole(['admin', 'manager']);

  const checkAnyRole = (requiredRoles: string[]): boolean => {
    return hasAnyRole(requiredRoles);
  };

  const filteredNavItems = NAVIGATION_ITEMS.filter(item => 
    !item.roles || checkAnyRole([...item.roles])
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setUser(null);
        navigate(ROUTES.LOGIN);
      },
      onError: (error) => {
        console.error('Logout failed:', error);
        setUser(null);
        navigate(ROUTES.LOGIN);
      }
    });
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarExpanded(!sidebarExpanded);
    }
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
    <div className={`sidebar-content${isMobile ? ' mobile' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo">
          {(!isMobile && sidebarExpanded) ? (
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
                title={(!isMobile && sidebarExpanded) ? '' : item.label}
              >
                <span className={`nav-icon icon-${item.icon}`}>
                  {getIconForItem(item.icon)}
                </span>
                {(!isMobile && sidebarExpanded) && (
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
      {/* Sidebar toggle button always on the left in mobile */}
      {canSeeSidebar && isMobile && (
        <Button
          fillMode="solid"
          style={{ background: "#fff", color: "#222", marginRight: 8, fontWeight: 600 }}
          onClick={toggleSidebar}
          title="Open Sidebar"
          className="sidebar-toggle-btn"
        >
          Menu
        </Button>
      )}
      {/* Dashboard button in mobile */}
      {isMobile && (
        <Button
          fillMode="solid"
          style={{ background: "#fff", color: "#222", fontWeight: 600 }}
          onClick={() => navigate(ROUTES.DASHBOARD)}
          title="Go to Dashboard"
          className="dashboard-nav-btn"
        >
          Dashboard
        </Button>
      )}
    </AppBarSection>
    <AppBarSpacer />
    <AppBarSection>
      <div className="user-section">
        <span className="user-name">
          {user?.first_name} {user?.last_name}
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
      {canSeeSidebar && (
        <>
          {/* Desktop sidebar */}
          {!isMobile && (
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
          )}
          {/* Mobile sidebar overlay */}
          {isMobile && sidebarOpen && (
            <div className="mobile-sidebar-overlay" onClick={toggleSidebar}>
              <div className="mobile-sidebar" onClick={e => e.stopPropagation()}>
                {renderSidebarContent()}
              </div>
            </div>
          )}
        </>
      )}
      {/* Main layout content */}
      <div className="app-content">
        <header className="app-header">{renderHeader()}</header>
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