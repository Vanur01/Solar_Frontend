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
  SwipeableDrawer,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
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

const Sidebar = ({ open, toggleDrawer, onClose, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // Mock user data (replace with actual auth context)
  const user = {
    firstName: "John",
    lastName: "Doe",
    role: "Head_office",
  };

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

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

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/dashboard",
      roles: ["Head_office", "ZSM", "ASM", "TEAM"],
    },
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
      text: "Bank Loan",
      icon: <AccountBalance />,
      path: "/bank-loan-apply",
      roles: ["Head_office", "ZSM", "ASM", "TEAM"],
    },
    {
      text: "Document",
      icon: <Description />,
      path: "/document-submission",
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
      text: "Installation",
      icon: <TaskAlt />,
      path: "/installation-completion",
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
      text: "Expense",
      icon: <Paid />,
      path: "/expense",
      roles: ["Head_office", "ZSM", "ASM", "TEAM"],
    },
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
  ];

  // Filter items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
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
  const renderMenuItem = (item) => {
    const active = isActive(item.path);
    const bgColor = active ? ACTIVE_BG : "transparent";
    const hoverBgColor = HOVER_BG;

    if (!isCollapsed || isMobile) {
      return (
        <ListItemButton
          key={item.path}
          onClick={() => handleNavigate(item.path)}
          sx={{
            pl: 2,
            borderRadius: "8px",
            mx: 1,
            my: 0.5,
            bgcolor: bgColor,
            color: TEXT_COLOR,
            "&:hover": {
              bgcolor: hoverBgColor,
              transform: "translateX(4px)",
            },
            py: 1.2,
            minHeight: 48,
            transition: "all 0.2s ease",
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: TEXT_COLOR }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: "0.9rem",
              fontWeight: active ? 600 : 400,
            }}
          />
        </ListItemButton>
      );
    }

    return (
      <Tooltip key={item.path} title={item.text} placement="right" arrow>
        <ListItemButton
          onClick={() => handleNavigate(item.path)}
          sx={{
            justifyContent: "center",
            borderRadius: "8px",
            mx: 0.5,
            my: 0.5,
            bgcolor: bgColor,
            "&:hover": {
              bgcolor: hoverBgColor,
            },
            p: 1.5,
            minHeight: 48,
          }}
        >
          <ListItemIcon
            sx={{
              justifyContent: "center",
              minWidth: "auto",
              color: TEXT_COLOR,
            }}
          >
            {item.icon}
          </ListItemIcon>
        </ListItemButton>
      </Tooltip>
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
        background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%)`,
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
          px: isCollapsed ? 1 : 2,
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        <List>{filteredMenuItems.map((item) => renderMenuItem(item))}</List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: isCollapsed ? 1.5 : 2,
          borderTop: `1px solid ${BORDER_COLOR}`,
        }}
      >
        {/* Collapse Toggle */}
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

  // Mobile Sidebar content
  const MobileSidebarContent = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: PRIMARY_COLOR,
        width: 280,
        background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%)`,
      }}
    >
      {/* Mobile Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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

      {/* Mobile Menu */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 2,
          px: 2,
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        <List>{filteredMenuItems.map((item) => renderMenuItem(item))}</List>
      </Box>

      {/* Mobile Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${BORDER_COLOR}`,
          textAlign: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.7)", display: "block", mb: 1 }}
        >
          © 2025 Sunergytech • v2.2.0
        </Typography>
        <IconButton
          onClick={handleLogout}
          sx={{
            color: TEXT_COLOR,
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
        >
          <Logout />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
              boxSizing: "border-box",
              overflowX: "hidden",
              transition: "all 0.3s ease",
              backgroundColor: "transparent",
              border: "none",
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
              width: 280,
              maxWidth: "90vw",
              backgroundColor: "transparent",
              border: "none",
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
