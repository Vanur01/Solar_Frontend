// components/Sidebar.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  SwipeableDrawer,Avatar,
  useTheme,
  useMediaQuery,
  Collapse,
  Badge,
} from "@mui/material";
import {
  Dashboard,
  Groups,
  PersonAdd,
  AccountBalance,
  Description,
  ReceiptLong,
  TaskAlt,
  Warning,
  CloudUpload,
  CalendarMonth,
  FilterAlt,
  Paid,
  AdminPanelSettings,
  PendingActions,
  Insights,
  AccountTree,
  PeopleAlt,
  SupervisorAccount,
  WorkspacePremium,
  Engineering,
  Logout,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  Home,
  Analytics,
  Settings,
  Help,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Color Constants
const PRIMARY_COLOR = "#4569ea";
const PRIMARY_LIGHT = "#5c7cec";
const PRIMARY_DARK = "#3a5ac8";
const TEXT_COLOR = "#ffffff";
const HOVER_BG = "rgba(255, 255, 255, 0.15)";
const ACTIVE_BG = "rgba(255, 255, 255, 0.25)";
const BORDER_COLOR = "rgba(255, 255, 255, 0.25)";

// Constants
const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 70;

const Sidebar = ({ open, toggleDrawer, onClose, isMobile, isTablet }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [expandedItems, setExpandedItems] = useState({});

  // Mock user data (replace with actual auth context)
  const user = {
    firstName: "John",
    lastName: "Doe",
    role: "Head_office",
  };

  // Save collapsed state
  useEffect(() => {
    if (!isMobile && !isTablet) {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMobile, isTablet]);

  // Role-based configurations
  const roleConfig = useMemo(() => {
    const config = {
      Head_office: {
        label: "Head Office",
        icon: <WorkspacePremium sx={{ fontSize: 20 }} />,
        color: "#ff6d00",
      },
      ZSM: {
        label: "Zonal Manager",
        icon: <SupervisorAccount sx={{ fontSize: 20 }} />,
        color: "#1a237e",
      },
      ASM: {
        label: "Area Manager",
        icon: <PeopleAlt sx={{ fontSize: 20 }} />,
        color: "#2e7d32",
      },
      TEAM: {
        label: "Field Executive",
        icon: <Engineering sx={{ fontSize: 20 }} />,
        color: "#6a1b9a",
      },
    };
    return (
      config[user?.role] || {
        label: "User",
        icon: <PeopleAlt />,
        color: "#666",
      }
    );
  }, [user]);

  // Menu items with categories for better organization
  const menuCategories = useMemo(() => [
    {
      title: "Main",
      items: [
        {
          text: "Dashboard",
          icon: <Dashboard />,
          path: "/dashboard",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
      ],
    },
    {
      title: "Leads & Visits",
      items: [
        {
          text: "Total Visits",
          icon: <Groups />,
          path: "/total-visits",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Registration",
          icon: <PersonAdd />,
          path: "/registration",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "All Leads",
          icon: <FilterAlt />,
          path: "/all-leads",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Lead Funnel",
          icon: <AccountTree />,
          path: "/lead-funnel",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Missed Leads",
          icon: <Warning />,
          path: "/missed-leads",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Import Leads",
          icon: <CloudUpload />,
          path: "/import-leads",
          roles: ["Head_office", "ZSM"],
        },
      ],
    },
    {
      title: "Financial",
      items: [
        {
          text: "Bank Loan",
          icon: <AccountBalance />,
          path: "/bank-loan-apply",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Loan Pending",
          icon: <PendingActions />,
          path: "/bank-at-pending",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Disbursement",
          icon: <ReceiptLong />,
          path: "/disbursement",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Expense",
          icon: <Paid />,
          path: "/expense",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          text: "Document",
          icon: <Description />,
          path: "/document-submission",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Installation",
          icon: <TaskAlt />,
          path: "/installation-completion",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Attendance",
          icon: <CalendarMonth />,
          path: "/attendance",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
        {
          text: "Location Visit",
          icon: <LocationOnIcon />,
          path: "/visit-summary",
          roles: ["Head_office", "ZSM", "ASM", "TEAM"],
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          text: "Users",
          icon: <AdminPanelSettings />,
          path: "/user-management",
          roles: ["Head_office", "ZSM", "ASM"],
        },
        {
          text: "Reports",
          icon: <Insights />,
          path: "/reports",
          roles: ["Head_office", "ZSM", "ASM"],
        },
      ],
    },
    
  ], []);

  // Filter items based on user role
  const filteredCategories = useMemo(() => {
    return menuCategories
      .map(category => ({
        ...category,
        items: category.items.filter(item => item.roles.includes(user?.role))
      }))
      .filter(category => category.items.length > 0);
  }, [menuCategories, user?.role]);

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile || isTablet) {
      onClose();
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
  };

  const toggleExpand = (categoryTitle) => {
    setExpandedItems(prev => ({
      ...prev,
      [categoryTitle]: !prev[categoryTitle]
    }));
  };

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  };

  const getUserFullName = () => {
    if (!user?.firstName && !user?.lastName) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  };

  // Render menu item
  const renderMenuItem = (item, isInGroup = false) => {
    const active = isActive(item.path);
    const bgColor = active ? ACTIVE_BG : "transparent";
    const hoverBgColor = HOVER_BG;

    const buttonContent = (
      <ListItemButton
        onClick={() => handleNavigate(item.path)}
        sx={{
          pl: isInGroup ? 4 : 2,
          borderRadius: "8px",
          mx: 1,
          my: 0.3,
          bgcolor: bgColor,
          color: TEXT_COLOR,
          "&:hover": {
            bgcolor: hoverBgColor,
            transform: !isMobile && !isCollapsed ? "translateX(4px)" : "none",
          },
          py: 1,
          minHeight: 40,
          transition: "all 0.2s ease",
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: TEXT_COLOR }}>
          {item.badge ? (
            <Badge badgeContent={item.badge} color="error" variant="dot">
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            fontSize: isMobile ? "0.95rem" : "0.9rem",
            fontWeight: active ? 600 : 400,
          }}
        />
        {item.badge && !isCollapsed && (
          <Box
            sx={{
              bgcolor: "error.main",
              color: "white",
              borderRadius: "12px",
              px: 1,
              py: 0.25,
              fontSize: "0.7rem",
              fontWeight: "bold",
              ml: 1,
            }}
          >
            {item.badge}
          </Box>
        )}
      </ListItemButton>
    );

    if (isCollapsed && !isMobile && !isTablet) {
      return (
        <Tooltip key={item.path} title={item.text} placement="right" arrow>
          {buttonContent}
        </Tooltip>
      );
    }

    return buttonContent;
  };

  // Render category
  const renderCategory = (category) => {
    const isExpanded = expandedItems[category.title] !== false;
    const hasActiveItem = category.items.some(item => isActive(item.path));

    if (isCollapsed && !isMobile && !isTablet) {
      return category.items.map(item => renderMenuItem(item));
    }

    return (
      <Box key={category.title} sx={{ mb: 1 }}>
        <ListItemButton
          onClick={() => toggleExpand(category.title)}
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: "8px",
            mx: 1,
            "&:hover": {
              bgcolor: HOVER_BG,
            },
          }}
        >
          <ListItemText
            primary={category.title}
            primaryTypographyProps={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          />
          {category.items.length > 0 && (
            isExpanded ? <ExpandLess sx={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }} /> 
                     : <ExpandMore sx={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }} />
          )}
        </ListItemButton>
        
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          {category.items.map(item => renderMenuItem(item, true))}
        </Collapse>
      </Box>
    );
  };

  // Desktop Sidebar content
  const DesktopSidebarContent = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: PRIMARY_COLOR,
        width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        transition: "all 0.3s ease",
        background: `linear-gradient(180deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%)`,
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: isCollapsed ? 2 : 3,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          gap: 2,
          borderBottom: `1px solid ${BORDER_COLOR}`,
          minHeight: 80,
        }}
      >
        <Box
          sx={{
            width: isCollapsed ? 40 : 48,
            height: isCollapsed ? 40 : 48,
            borderRadius: "12px",
            bgcolor: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          <Typography variant="h6" color={TEXT_COLOR} fontWeight="bold">
            S
          </Typography>
        </Box>

        {!isCollapsed && (
          <Box>
            <Typography variant="h6" color={TEXT_COLOR} fontWeight="bold">
              SunergyTech
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.8)" }}
            >
              Solar Management
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 2,
          px: isCollapsed ? 1 : 1.5,
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.2)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
        }}
      >
        {filteredCategories.map(category => renderCategory(category))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: isCollapsed ? 1.5 : 2,
          borderTop: `1px solid ${BORDER_COLOR}`,
        }}
      >
        {/* Collapse Toggle - Only for desktop/tablet */}
        {!isMobile && !isTablet && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: isCollapsed ? 1 : 2,
            }}
          >
            <IconButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              size="small"
              sx={{
                color: TEXT_COLOR,
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                width: 36,
                height: 36,
              }}
            >
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>
        )}

        {/* Version and Logout */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {!isCollapsed && (
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              v2.2.0
            </Typography>
          )}
          <Tooltip
            title="Logout"
            placement={isCollapsed ? "right" : "top"}
            arrow
          >
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                color: TEXT_COLOR,
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                width: 36,
                height: 36,
              }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  // Mobile Sidebar content (Optimized for touch)
  const MobileSidebarContent = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: PRIMARY_COLOR,
        width: 300,
        background: `linear-gradient(180deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%)`,
      }}
    >
      {/* Mobile Header with User Info */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid rgba(255, 255, 255, 0.3)`,
            }}
          >
            <Typography variant="h6" color={TEXT_COLOR} fontWeight="bold">
              S
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color={TEXT_COLOR} fontWeight="bold">
              SunergyTech
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.8)" }}
            >
              Solar Management
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Mobile Menu - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 2,
          px: 1.5,
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        {filteredCategories.map((category) => (
          <Box key={category.title} sx={{ mb: 2 }}>
            <Typography
              sx={{
                px: 2,
                py: 1,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {category.title}
            </Typography>
            {category.items.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  pl: 2,
                  borderRadius: "8px",
                  mx: 1,
                  my: 0.5,
                  bgcolor: isActive(item.path) ? ACTIVE_BG : "transparent",
                  color: TEXT_COLOR,
                  "&:hover": {
                    bgcolor: HOVER_BG,
                  },
                  py: 1.5,
                  minHeight: 48,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: TEXT_COLOR }}>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
                {item.badge && (
                  <Box
                    sx={{
                      bgcolor: "error.main",
                      color: "white",
                      borderRadius: "12px",
                      px: 1,
                      py: 0.25,
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItemButton>
            ))}
          </Box>
        ))}
      </Box>

      {/* Mobile Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.7)" }}
          >
            © 2025 Sunergytech
          </Typography>
          <IconButton
            onClick={handleLogout}
            sx={{
              color: TEXT_COLOR,
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              width: 40,
              height: 40,
            }}
          >
            <Logout />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
              boxSizing: "border-box",
              overflowX: "hidden",
              transition: "all 0.3s ease",
              backgroundColor: "transparent",
              border: "none",
              boxShadow: "none",
            },
          }}
        >
          {DesktopSidebarContent}
        </Drawer>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <SwipeableDrawer
          anchor="left"
          open={open}
          onClose={onClose}
          onOpen={toggleDrawer}
          swipeAreaWidth={30}
          disableSwipeToOpen={false}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: 300,
              maxWidth: "85vw",
              backgroundColor: "transparent",
              border: "none",
              boxShadow: "4px 0 20px rgba(0,0,0,0.2)",
            },
          }}
        >
          {MobileSidebarContent}
        </SwipeableDrawer>
      )}
    </>
  );
};

export default Sidebar;