import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  alpha,
  useMediaQuery,
  useTheme,
  Divider,
  Badge,
} from "@mui/material";
import {
  FilterList,
  Add,
  Map,
  Groups,
  RadioButtonChecked,
  Storefront,
  AssignmentLate,
  FileDownload,
  MoreVert,
  LocationOn,
  MyLocation,
  TrendingUp,
  AccessTime,
  ChevronRight,
  Search,
  NotificationsNone,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const PRIMARY = "#136dec";
const BG = "#f0f4fa";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Marcus Johnson",
    role: "Senior Sales Rep",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2xC6N0ZWq9o3hkV9gg0u7qCg28FhCXsrg7PzKHbiLx87gaAfkzLkBne0jD4dsXjadx3k6S2uG8kCPANTCCAomf1LHDX9COlsIcz23dq3U3m0__KMbnA8irfyiKVfCUFjodLt4M62v8wKtRb6dPvaYdr5_VqEL1uAkcg5q-59TB9Lw98Gk6OlYMTsFeU318hLrcBMWhxNV_dNgvY05AWD20PSTBSwN9_7u3wJZdRtQOuaBXIkjEuO5dTNK4ewVXSLQ7pl2bpfB72I",
    status: "inprogress",
    location: "Downtown, Chicago",
    checkin: "Today, 10:45 AM",
    showTrack: true,
    visits: 4,
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    role: "Regional Lead",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDoS2K3nmtkZsIMQnXjowQM0lix6OVuQP33rczarK5C5LpFc0BlENzlwzBhbv--MZxr_hSF5FN7Zu5JeX75pZRHhmENwyLFxhL4AYx_raWNe41iOTvJJyTeXiBO6CvaA5auoBwpjpxdWnVzp22P1wnXo5QTnxOtXS9tyzXRK1p3MDicgL1DVMFZTI-m6b4CLWF_5uXr-_gImP28Qr1L8OKMo-AwYbYYA7bck2eGP4Q5uZDWk8_jUbI77jSBNrjWY5sorhyp7WUftAM",
    status: "offline",
    location: "North Shore Area",
    checkin: "Yesterday, 06:15 PM",
    showTrack: false,
    visits: 7,
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Account Exec",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB9Pglyu3vy1tS2q5m0dBRN4G9WhYcjcZ-RezuHNXy8DpHGHVNqYNo-O7G9xalsoa7hdWWnIhZPvhQTNXqzS6LyPPJ_L8LARL-xxfJ2v4TWp2LLMj8MLNR27WplpBVeMay7ZpFQI0E_Qg7Cb42iQpOcq1XCfgh72V9OltEGs71KRivZuC7dWUqfOVxrA-DrXvA2y9QpEkYY4ohjMzwz_uoCsvq41KPOVKJBAwJEDHSZwFcakL3VVle0e-eQEOkPbHnAVLwbUVvcSgI",
    status: "active",
    location: "O'Hare Airport",
    checkin: "Today, 11:02 AM",
    showTrack: true,
    visits: 3,
  },
  {
    id: 4,
    name: "David Miller",
    role: "Junior Rep",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC-fZQdhL5cMVXdZSi7Hsy8y6OfjNSTtKjY_lAch6XplMyM5mHJtQ-dgjFgWs2gJR_KCKAFddixk0reYRi0g0zEnrXxfRHcauffnEiYr3HXW9rmN614LbJRpdKT5V2m06lWEnrnc_-kRraZ0ao2WJbNyyEXpoWZBV553LCpOXWL0Hgpb1bgDupK6jRUsfqBnH8NPDnyD3jqB6_QfRsZC6OkI7lFG8XdqR-zcjVkzhstPW0WevfU_5KunXr7d6JtXBe-xcAMFAD7Rz8",
    status: "active",
    location: "West Loop",
    checkin: "Today, 09:30 AM",
    showTrack: true,
    showMap: true,
    visits: 5,
  },
  {
    id: 5,
    name: "Emily Watson",
    role: "Sales Consultant",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHKEGxO2EhW0PGnlgoeN0yH3kDsARzhLddoG6HkCuYoR8PvCwAicU9VNBZGkp0sZBedqawwoYnoPVyL5e5ljqG9aPYMsH5h2Chw86pG0iOte67moTEBJvYLllP1TJWgUp7lEls1yl2pWAl_t9VERltiLV35E7cCMt10L5vFNKTiwspFyTxx4mudKhq4XUiTb0hquS8GZkm_LI_OpZJgNrbVBC3OCIV9DstQ6jSH43zJQBsNkQ9_EWTyWMKXVoaJKUZlRz8IWuoEtg",
    status: "offline",
    location: "Evanston HQ",
    checkin: "Today, 08:00 AM",
    showTrack: false,
    visits: 2,
  },
];

const STATUS_CONFIG = {
  active: {
    label: "Active",
    bg: alpha("#10b981", 0.1),
    color: "#059669",
    dotColor: "#10b981",
    pulse: false,
  },
  inprogress: {
    label: "In Progress",
    bg: alpha("#3b82f6", 0.1),
    color: "#2563eb",
    dotColor: "#3b82f6",
    pulse: true,
  },
  offline: {
    label: "Offline",
    bg: "#f1f5f9",
    color: "#64748b",
    dotColor: "#94a3b8",
    pulse: false,
  },
};

const SUMMARY_CARDS = [
  {
    title: "Total Members",
    value: "42",
    icon: <Groups />,
    iconBg: alpha("#3b82f6", 0.1),
    iconColor: "#2563eb",
    badge: "+2 this week",
    badgeBg: alpha("#10b981", 0.1),
    badgeColor: "#059669",
    sub: null,
  },
  {
    title: "Currently Active",
    value: "28",
    icon: <RadioButtonChecked />,
    iconBg: alpha("#10b981", 0.1),
    iconColor: "#059669",
    badge: null,
    sub: "live",
    subText: "Live now",
    rightText: "Just now",
  },
  {
    title: "Visits Today",
    value: "156",
    icon: <Storefront />,
    iconBg: alpha("#f59e0b", 0.1),
    iconColor: "#d97706",
    badge: null,
    sub: "trend",
    subText: "↑ 12% vs yesterday",
  },
  {
    title: "Pending Approvals",
    value: "5",
    icon: <AssignmentLate />,
    iconBg: alpha("#ef4444", 0.1),
    iconColor: "#dc2626",
    badge: null,
    sub: "link",
    subText: "Review reports →",
  },
];

// ─── StatusChip ───────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
  return (
    <Chip
      size="small"
      label={cfg.label}
      icon={
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: cfg.dotColor,
            flexShrink: 0,
            ml: "6px !important",
            ...(cfg.pulse && {
              animation: "dotPulse 1.5s ease-in-out infinite",
              "@keyframes dotPulse": {
                "0%,100%": { opacity: 1 },
                "50%": { opacity: 0.3 },
              },
            }),
          }}
        />
      }
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: "0.65rem",
        height: 24,
        borderRadius: "999px",
        "& .MuiChip-icon": { mr: 0 },
      }}
    />
  );
};

// ─── Mobile Member Card ───────────────────────────────────────────────────────
const MemberCard = ({ member, onViewDetails }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: "1rem",
      border: "1px solid #e8edf5",
      bgcolor: "#fff",
      p: 2,
      transition: "all 0.2s",
      "&:hover": {
        boxShadow: "0 8px 24px rgba(19,109,236,0.08)",
        borderColor: alpha(PRIMARY, 0.2),
        transform: "translateY(-1px)",
      },
    }}
  >
    {/* Top Row */}
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      mb={1.5}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: STATUS_CONFIG[member.status]?.dotColor,
                border: "2px solid #fff",
              }}
            />
          }
        >
          <Avatar
            src={member.avatar}
            alt={member.name}
            sx={{ width: 46, height: 46, border: "2px solid #f0f4fa" }}
          />
        </Badge>
        <Box>
          <Typography
            fontWeight={700}
            fontSize="0.88rem"
            color="#0f172a"
            lineHeight={1.3}
          >
            {member.name}
          </Typography>
          <Typography fontSize="0.7rem" color="#94a3b8" fontWeight={500}>
            {member.role}
          </Typography>
        </Box>
      </Stack>
      <StatusChip status={member.status} />
    </Stack>

    <Divider sx={{ borderColor: "#f1f5f9", mb: 1.5 }} />

    {/* Location + Time row */}
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      mb={1.5}
    >
      <Stack direction="row" spacing={0.5} alignItems="center">
        <LocationOn
          sx={{
            fontSize: 14,
            color: member.status === "offline" ? "#cbd5e1" : PRIMARY,
          }}
        />
        <Typography fontSize="0.75rem" color="#475569" fontWeight={500}>
          {member.location}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <AccessTime sx={{ fontSize: 13, color: "#cbd5e1" }} />
        <Typography fontSize="0.7rem" color="#94a3b8">
          {member.checkin.replace("Today, ", "").replace("Yesterday, ", "")}
        </Typography>
      </Stack>
    </Stack>

    {/* Footer row: visits badge + action buttons */}
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box
        sx={{
          px: 1.25,
          py: 0.4,
          borderRadius: "0.375rem",
          bgcolor: alpha(PRIMARY, 0.06),
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Storefront sx={{ fontSize: 12, color: PRIMARY }} />
        <Typography fontSize="0.65rem" fontWeight={700} color={PRIMARY}>
          {member.visits} visits today
        </Typography>
      </Box>

      <Stack direction="row" spacing={0.75} alignItems="center">
        {member.showTrack && !member.showMap && (
          <Tooltip title="Track Live">
            <IconButton
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: "0.5rem",
                border: "1px solid #e8edf5",
                color: "#94a3b8",
                "&:hover": {
                  color: PRIMARY,
                  bgcolor: alpha(PRIMARY, 0.06),
                  borderColor: alpha(PRIMARY, 0.2),
                },
              }}
            >
              <MyLocation sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        )}
        {member.showMap && (
          <Tooltip title="View on Map">
            <IconButton
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: "0.5rem",
                border: `1px solid ${alpha(PRIMARY, 0.2)}`,
                bgcolor: alpha(PRIMARY, 0.04),
                color: PRIMARY,
                "&:hover": { bgcolor: alpha(PRIMARY, 0.1) },
              }}
            >
              <Map sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        )}
        <Button
          size="small"
          endIcon={<ChevronRight sx={{ fontSize: 14, ml: -0.5 }} />}
          onClick={onViewDetails}
          sx={{
            color: PRIMARY,
            border: `1px solid ${alpha(PRIMARY, 0.2)}`,
            bgcolor: alpha(PRIMARY, 0.05),
            fontWeight: 700,
            fontSize: "0.7rem",
            borderRadius: "0.5rem",
            textTransform: "none",
            px: 1.5,
            py: 0.55,
            "&:hover": {
              bgcolor: PRIMARY,
              color: "#fff",
              borderColor: PRIMARY,
            },
          }}
        >
          Details
        </Button>
      </Stack>
    </Stack>
  </Paper>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeamTracking() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [page, setPage] = useState(1);

  const paginationLabels = isMobile
    ? ["Prev", "1", "2", "3", "Next"]
    : ["Previous", "1", "2", "3", "Next"];

  return (
    <Box sx={{ minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* ─── Sticky Mobile Top Bar ───────────────────────────────────── */}
      {isMobile && (
        <Box
          sx={{
            bgcolor: "#fff",
            px: 2.5,
            py: 1.5,
            borderBottom: "1px solid #e8edf5",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              fontWeight={800}
              fontSize="1.05rem"
              color="#0f172a"
              letterSpacing="-0.3px"
            >
              Team Tracking
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                sx={{ color: "#64748b", borderRadius: "0.5rem" }}
              >
                <Search sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      )}

      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: "auto" }}>
        {/* ─── Desktop Page Header ─────────────────────────────────────── */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  letterSpacing: "-0.5px",
                  color: "#0f172a",
                  lineHeight: 1.1,
                }}
              >
                Team Tracking
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#94a3b8", mt: 0.5, fontWeight: 500 }}
              >
                Real-time field activity and team locations
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<FilterList sx={{ fontSize: 17 }} />}
                sx={{
                  borderColor: "#e2e8f0",
                  bgcolor: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  borderRadius: "0.6rem",
                  textTransform: "none",
                  px: 2,
                  py: 1,
                  "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
                }}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<Map sx={{ fontSize: 17 }} />}
                sx={{
                  borderColor: "#e2e8f0",
                  bgcolor: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  borderRadius: "0.6rem",
                  textTransform: "none",
                  px: 2,
                  py: 1,
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                Live Map
              </Button>
              <Button
                variant="contained"
                startIcon={<Add sx={{ fontSize: 18 }} />}
                onClick={() => navigate("/add-visit")}
                sx={{
                  background: "#0f5fd4",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  borderRadius: "0.6rem",
                  textTransform: "none",
                  px: 2.5,
                  py: 1,
                  boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                  "&:hover": {
                    bgcolor: "#0f5fd4",
                    boxShadow: `0 4px 16px ${alpha(PRIMARY, 0.35)}`,
                  },
                }}
              >
                Add Visit
              </Button>
            </Stack>
          </Box>
        )}

        {/* ─── Summary Cards ──────────────────────────────────────────── */}
        <Grid
          container
          spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          {SUMMARY_CARDS.map((card, i) => (
            <Grid item xs={6} sm={6} lg={3} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.75, sm: 2.5 },
                  borderRadius: "0.875rem",
                  border: "1px solid #e8edf5",
                  bgcolor: "#fff",
                  height: "100%",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    mb: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#94a3b8",
                        fontWeight: 500,
                        fontSize: { xs: "0.68rem", sm: "0.75rem" },
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      fontWeight={800}
                      sx={{
                        color: "#0f172a",
                        fontSize: { xs: "1.6rem", sm: "1.9rem" },
                        lineHeight: 1,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: { xs: 0.75, sm: 1 },
                      borderRadius: "0.6rem",
                      bgcolor: card.iconBg,
                      color: card.iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(card.icon, {
                      sx: { fontSize: { xs: 18, sm: 22 } },
                    })}
                  </Box>
                </Box>

                {card.badge && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      px: 0.9,
                      py: 0.3,
                      borderRadius: "0.25rem",
                      bgcolor: card.badgeBg,
                      color: card.badgeColor,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}
                  >
                    {card.badge}
                  </Box>
                )}
                {card.sub === "live" && (
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: "#10b981",
                        flexShrink: 0,
                        animation: "livePulse 1.5s ease-in-out infinite",
                        "@keyframes livePulse": {
                          "0%,100%": { opacity: 1 },
                          "50%": { opacity: 0.3 },
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.68rem",
                      }}
                    >
                      {card.subText}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.62rem",
                        display: { xs: "none", sm: "block" },
                      }}
                    >
                      {card.rightText}
                    </Typography>
                  </Stack>
                )}
                {card.sub === "trend" && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingUp sx={{ fontSize: 13, color: "#10b981" }} />
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontWeight: 500,
                        fontSize: "0.68rem",
                      }}
                    >
                      {card.subText}
                    </Typography>
                  </Stack>
                )}
                {card.sub === "link" && (
                  <Typography
                    sx={{
                      color: PRIMARY,
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {card.subText}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ─── Mobile Action Bar ──────────────────────────────────────── */}
        {isMobile && (
          <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList sx={{ fontSize: 16 }} />}
              sx={{
                borderColor: "#e2e8f0",
                bgcolor: "#fff",
                color: "#475569",
                fontWeight: 600,
                fontSize: "0.78rem",
                borderRadius: "0.6rem",
                textTransform: "none",
                py: 1,
              }}
            >
              Filter
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/add-visit")}
              sx={{
                bgcolor: PRIMARY,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.78rem",
                borderRadius: "0.6rem",
                textTransform: "none",
                py: 1,
                boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                "&:hover": { bgcolor: "#0f5fd4" },
              }}
            >
              Add Visit
            </Button>
          </Stack>
        )}

        {/* ─── Section Header ──────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            px: { xs: 0.25, md: 0 },
          }}
        >
          <Typography
            fontWeight={700}
            fontSize={{ xs: "0.9rem", md: "1rem" }}
            color="#0f172a"
          >
            Team Member Status
          </Typography>
          {!isMobile && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Download">
                <IconButton
                  size="small"
                  sx={{
                    color: "#94a3b8",
                    borderRadius: "0.375rem",
                    "&:hover": { bgcolor: "#f1f5f9" },
                  }}
                >
                  <FileDownload fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="More">
                <IconButton
                  size="small"
                  sx={{
                    color: "#94a3b8",
                    borderRadius: "0.375rem",
                    "&:hover": { bgcolor: "#f1f5f9" },
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>

        {/* ─── Mobile: Card List ──────────────────────────────────────── */}
        {isMobile && (
          <>
            <Stack spacing={1.5}>
              {TEAM_MEMBERS.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onViewDetails={() => navigate("/member-history")}
                />
              ))}
            </Stack>
            <Box sx={{ pt: 2, pb: 3, textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  fontSize: "0.72rem",
                  display: "block",
                  mb: 1.5,
                }}
              >
                Showing 5 of 42 team members
              </Typography>
              <Stack direction="row" spacing={0.75} justifyContent="center">
                {paginationLabels.map((label, i) => {
                  const isActive = label === String(page);
                  return (
                    <Button
                      key={i}
                      size="small"
                      onClick={() => {
                        if (!["Prev", "Next"].includes(label))
                          setPage(Number(label));
                      }}
                      sx={{
                        minWidth: 0,
                        px: 1.25,
                        py: 0.5,
                        fontSize: "0.72rem",
                        fontWeight: isActive ? 700 : 400,
                        borderRadius: "0.375rem",
                        border: "1px solid",
                        borderColor: isActive ? alpha(PRIMARY, 0.3) : "#e2e8f0",
                        textTransform: "none",
                        color: isActive ? PRIMARY : "#475569",
                        bgcolor: isActive ? alpha(PRIMARY, 0.08) : "#fff",
                        "&:hover": { bgcolor: "#f8fafc" },
                        boxShadow: "none",
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
              </Stack>
            </Box>
          </>
        )}

        {/* ─── Desktop: Table ─────────────────────────────────────────── */}
        {!isMobile && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "1rem",
              border: "1px solid #e8edf5",
              bgcolor: "#fff",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: "#f8fafc",
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid #e8edf5",
                        py: 1.75,
                        color: "#94a3b8",
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      },
                    }}
                  >
                    <TableCell sx={{ pl: 3 }}>Team Member</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">
                      Current / Last Location
                    </TableCell>
                    <TableCell align="center">Check-in Time</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TEAM_MEMBERS.map((member) => (
                    <TableRow
                      key={member.id}
                      onMouseEnter={() => setHoveredRow(member.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      sx={{
                        borderBottom: "1px solid #f8fafc",
                        transition: "background 0.12s",
                        "&:hover": { bgcolor: "#fafbff" },
                        "&:last-child td": { borderBottom: "none" },
                      }}
                    >
                      {/* Member */}
                      <TableCell sx={{ pl: 3, py: 2.25 }}>
                        <Stack
                          direction="row"
                          spacing={1.75}
                          alignItems="center"
                        >
                          <Badge
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            badgeContent={
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor:
                                    STATUS_CONFIG[member.status]?.dotColor,
                                  border: "2px solid #fff",
                                }}
                              />
                            }
                          >
                            <Avatar
                              src={member.avatar}
                              alt={member.name}
                              sx={{
                                width: 42,
                                height: 42,
                                border: "2px solid #f0f4fa",
                              }}
                            />
                          </Badge>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{
                                color: "#0f172a",
                                fontSize: "0.85rem",
                                lineHeight: 1.3,
                              }}
                            >
                              {member.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#94a3b8",
                                fontSize: "0.7rem",
                                fontWeight: 500,
                              }}
                            >
                              {member.role}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 2.25 }}>
                        <Box>
                          <StatusChip status={member.status} />
                          {member.status === "inprogress" &&
                            hoveredRow === member.id && (
                              <Stack
                                direction="row"
                                spacing={1.5}
                                sx={{ mt: 0.75 }}
                              >
                                {["Complete", "Cancel"].map((lbl) => (
                                  <Typography
                                    key={lbl}
                                    variant="caption"
                                    sx={{
                                      fontWeight: 700,
                                      color:
                                        lbl === "Complete"
                                          ? "#059669"
                                          : "#94a3b8",
                                      cursor: "pointer",
                                      textDecoration: "underline",
                                      fontSize: "0.63rem",
                                      "&:hover": {
                                        color:
                                          lbl === "Complete"
                                            ? "#047857"
                                            : "#ef4444",
                                      },
                                    }}
                                  >
                                    {lbl}
                                  </Typography>
                                ))}
                              </Stack>
                            )}
                        </Box>
                      </TableCell>

                      {/* Location */}
                      <TableCell align="center" sx={{ py: 2.25 }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <LocationOn
                            sx={{
                              fontSize: 15,
                              color:
                                member.status === "offline"
                                  ? "#cbd5e1"
                                  : PRIMARY,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "#475569", fontSize: "0.8rem" }}
                          >
                            {member.location}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Check-in */}
                      <TableCell align="center" sx={{ py: 2.25 }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <AccessTime sx={{ fontSize: 13, color: "#cbd5e1" }} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#64748b",
                              fontSize: "0.78rem",
                              fontWeight: 500,
                            }}
                          >
                            {member.checkin}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right" sx={{ pr: 3, py: 2.25 }}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          {member.showTrack && !member.showMap && (
                            <Tooltip title="Track Live">
                              <IconButton
                                size="small"
                                sx={{
                                  color: "#cbd5e1",
                                  borderRadius: "0.5rem",
                                  width: 32,
                                  height: 32,
                                  border: "1px solid #e8edf5",
                                  transition: "all 0.15s",
                                  "&:hover": {
                                    color: PRIMARY,
                                    bgcolor: alpha(PRIMARY, 0.06),
                                    borderColor: alpha(PRIMARY, 0.2),
                                  },
                                }}
                              >
                                <MyLocation sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {member.showMap && (
                            <Tooltip title="View on Map">
                              <IconButton
                                size="small"
                                sx={{
                                  color: PRIMARY,
                                  borderRadius: "0.5rem",
                                  width: 32,
                                  height: 32,
                                  border: `1px solid ${alpha(PRIMARY, 0.2)}`,
                                  bgcolor: alpha(PRIMARY, 0.04),
                                  "&:hover": { bgcolor: alpha(PRIMARY, 0.1) },
                                }}
                              >
                                <Map sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate("/member-history")}
                            sx={{
                              color: PRIMARY,
                              borderColor: alpha(PRIMARY, 0.2),
                              bgcolor: alpha(PRIMARY, 0.04),
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              borderRadius: "0.5rem",
                              textTransform: "none",
                              px: 1.75,
                              py: 0.6,
                              transition: "all 0.15s",
                              "&:hover": {
                                bgcolor: PRIMARY,
                                color: "#fff",
                                borderColor: PRIMARY,
                                boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                              },
                            }}
                          >
                            View Details
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Desktop Pagination */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#94a3b8", fontSize: "0.72rem" }}
              >
                Showing 5 of 42 team members
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {paginationLabels.map((label, i) => {
                  const isActive = label === String(page);
                  return (
                    <Button
                      key={i}
                      size="small"
                      onClick={() => {
                        if (!["Previous", "Next"].includes(label))
                          setPage(Number(label));
                      }}
                      sx={{
                        minWidth: 0,
                        px: 1.25,
                        py: 0.4,
                        fontSize: "0.72rem",
                        fontWeight: isActive ? 700 : 400,
                        borderRadius: "0.375rem",
                        border: "1px solid",
                        borderColor: isActive ? alpha(PRIMARY, 0.3) : "#e2e8f0",
                        textTransform: "none",
                        color: isActive ? PRIMARY : "#475569",
                        bgcolor: isActive ? alpha(PRIMARY, 0.07) : "#fff",
                        "&:hover": { bgcolor: "#f8fafc" },
                        boxShadow: "none",
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
              </Stack>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
