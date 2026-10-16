import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveUserDashboardPath } from '../utils/userDashboard';
import { 
  LayoutDashboard, 
  UserCheck, 
  ListCheck, 
  Users, 
  GraduationCap,
  Settings, 
  LogOut,
  Building,
  Building2,
  TrendingUp,
  BarChart3,
  BarChart2,
  FileText,
  Sparkles,
  Award,
  Bell,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Briefcase,
  ShieldCheck,
  Wallet,
  PlusCircle,
  DollarSign,
  BookOpen,
  Tag,
  ShoppingBag,
  ShoppingCart,
  Coins,
  ChevronDown,
  Calendar,
  CheckCircle2,
  Receipt,
  CreditCard,
  Target,
  Megaphone,
  Magnet,
  PhoneCall,
  Contact,
  Code2,
  Palette,
  FileCode,
  Lightbulb,
  Paintbrush,
  BookOpenCheck,
  Video,
  FileVideo,
  ClipboardCheck,
  Sliders,
  Calculator,
  PieChart,
  ClipboardList,
  Clock,
  Clipboard,
  Layers,
  School,
  UsersRound,
  UserCog,
  BookCheck,
  Stethoscope,
  Activity,
  HeartPulse,
  X
} from 'lucide-react';


const menuItems = [
  // 1. Overview & Front-Desk Reception
  { icon: LayoutDashboard, label: 'Dashboard', path: '/polyclinic-dashboard', category: 'Overview' },
  { icon: UserCheck, label: 'Tokens & Queue', path: '/reception-queue', category: 'Reception' },
  { icon: PhoneCall, label: 'Patients', path: '/patient-enquiries', category: 'Patients' },
  { icon: UsersRound, label: 'Family', path: '/family-patients', category: 'Patients' },
  { icon: Calendar, label: 'Appointments', path: '/appointments', category: 'Appointments' },
  { icon: HeartPulse, label: 'Services', path: '/services', category: 'Services' },

  // 2. Clinical Care, EMR & Therapies
  { icon: Stethoscope, label: 'Doctor Consultations', path: '/doctor-emr', category: 'Clinical Care' },
  { icon: FileText, label: 'Prescriptions', path: '/prescriptions', category: 'Clinical Care' },
  { icon: Sparkles, label: 'Therapy Sessions', path: '/panchakarma', category: 'Panchakarma' },
  { icon: Activity, label: 'Lab Reports', path: '/laboratory', category: 'Diagnostics' },

  // 3. Dispensary, Billing & Follow-up
  { icon: Tag, label: 'Pharmacy Inventory', path: '/pharmacy-inventory', category: 'Dispensary' },
  { icon: Receipt, label: 'Invoices', path: '/invoices', category: 'Billing' },
  { icon: Clock, label: 'Follow-ups', path: '/patient-followups', category: 'Follow-ups' },

  // 4. Staff & Clinic Operations
  { icon: UserCog, label: 'Doctors & Therapists', path: '/doctors-staff', category: 'Staff' },
  { icon: UserCheck, label: 'Staff Attendance', path: '/staff-attendance', category: 'Staff' },
  { icon: Calendar, label: 'Leave Requests', path: '/leaves', category: 'HR' },
  { icon: CreditCard, label: 'Staff Payslips', path: '/payslips', category: 'Payroll' },
  { icon: FileText, label: 'My Payslip', path: '/my-payslip', category: 'Payroll' },
  { icon: Wallet, label: 'Accounts & Expenses', path: '/accounts', category: 'Finance' },
  { icon: Building, label: 'Departments', path: '/departments', category: 'Administration' },
  { icon: Users, label: 'Users & Roles', path: '/users', category: 'Administration' },
  { icon: ShieldCheck, label: 'Role Permissions', path: '/permissions', category: 'Administration' },

  // 5. Reports, Tasks & Communications
  { icon: BarChart3, label: 'Hospital Reports', path: '/polyclinic-reports', category: 'Analytics' },
  { icon: Sparkles, label: 'AI Health Insights', path: '/ai-report', category: 'Analytics' },
  { icon: ListCheck, label: 'Tasks', path: '/todo', category: 'Productivity' },
  { icon: Bell, label: 'Notifications', path: '/notifications', category: 'Communications' }
];

// Simple Portal implementation to render the badge safely outside of parent overflow cropping
const PortalTooltip = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};


const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const activePath = location.pathname;
  const { user: liveUser } = useUser() || {};
  const [, setPermissionsVersion] = React.useState(0);

  React.useEffect(() => {
    const handleStorageChange = () => {
      setPermissionsVersion(v => v + 1);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getVisibleMenuItems = () => {
    try {
      let userObj = liveUser;
      if (!userObj) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try { userObj = JSON.parse(savedUser); } catch (e) {}
        }
      }

      if (!userObj) {
        return menuItems.filter(item => !item.allowedRoles && !item.allowedDepartments && !item.allowedDesignations);
      }

      const currentUserRole = String(userObj.role_id || userObj.roleId || userObj.role || '').toLowerCase().trim();
      const isSuperAdminUser = 
        userObj.isSuperAdmin === true ||
        userObj.is_super_admin === true ||
        currentUserRole === 'superadmin' || 
        currentUserRole === 'super_admin' || 
        currentUserRole === 'super admin' || 
        currentUserRole === '0' || 
        String(userObj.role || '').toLowerCase() === 'superadmin' ||
        String(userObj.role || '').toLowerCase() === '0';

      // 1. Super Admin access: Full access to all sidebar items for Super Admin
      if (isSuperAdminUser) {
        return menuItems.filter(item => !item.isCommonDashboardFallback && !item.isBasicReportFallback);
      }

      // 2. Custom Sidebar Permissions set by Super Admin for this user
      if (Array.isArray(userObj.permissions) && userObj.permissions.length > 0) {
        const allowedSet = userObj.permissions.map(p => String(p).toLowerCase().trim());
        
        // Map extra permission labels to sidebar paths
        const extraPathMappings = {
          'admin dashboard': '/dashboard',
          'md dashboard': '/md-dashboard',
          'accountant dashboard': '/accountant-dashboard',
          'income': '/accounts/income',
          'sales': '/accounts/sales',
          'capital': '/accounts/capital',
          'purchase': '/accounts/purchase',
          'create invoice': '/accounts/create-invoice',
          'daily operations os': '/daily-operations',
          'daily operations': '/daily-operations',
          'tl daily operations': '/tl-daily-operations',
        };
        const extraAllowedPaths = [];
        for (const perm of allowedSet) {
          if (extraPathMappings[perm]) {
            extraAllowedPaths.push(extraPathMappings[perm].toLowerCase());
          }
        }
        
        let customVisible = menuItems
          .map(item => {
            const itemLabelLower = item.label.toLowerCase().trim();
            const itemPathLower = item.path ? item.path.toLowerCase().trim() : '';

            const isParentAllowed = 
              item.path === '/leaves' ||
              allowedSet.includes(itemLabelLower) || 
              allowedSet.includes(itemPathLower) ||
              extraAllowedPaths.includes(itemPathLower);

            if (item.children) {
              const allowedChildren = item.children.filter(child => {
                const childLabelLower = child.label.toLowerCase().trim();
                const childPathLower = child.path ? child.path.toLowerCase().trim() : '';
                return isParentAllowed || allowedSet.includes(childLabelLower) || allowedSet.includes(childPathLower);
              });

              if (allowedChildren.length > 0) {
                return { ...item, children: allowedChildren };
              }
              return isParentAllowed ? item : null;
            }

            return isParentAllowed ? item : null;
          })
          .filter(Boolean);

        // If MD Dashboard permission is granted, override Dashboard path to /md-dashboard
        if (allowedSet.includes('md dashboard') && !allowedSet.includes('dashboard') && !allowedSet.includes('admin dashboard')) {
          customVisible = customVisible.map(item => {
            if (item.label === 'Dashboard' && item.path === '/dashboard') {
              return { ...item, path: '/md-dashboard' };
            }
            return item;
          });
        }

        if (customVisible.length > 0) {
          // Fallback dashboard: if user has no dashboard in custom permissions
          const hasDashboard = customVisible.some(item => item.label.toLowerCase().includes('dashboard'));
          if (!hasDashboard) {
            const fallbackDashboard = menuItems.find(item => item.isCommonDashboardFallback);
            if (fallbackDashboard) customVisible.unshift(fallbackDashboard);
          }

          // Fallback report: if user has no report page in custom permissions
          const hasReport = customVisible.some(item => item.label.toLowerCase().includes('report'));
          if (!hasReport) {
            const fallbackReport = menuItems.find(item => item.isBasicReportFallback);
            if (fallbackReport) customVisible.push(fallbackReport);
          }

          return customVisible;
        }
      }
      
      const deptName = userObj.department || userObj.departmentId?.name || '';
      const isNonOperational = String(deptName).toLowerCase().trim() === 'non-operational';
      if (isNonOperational) {
        return menuItems.filter(item => item.label === 'Employee Reports' || item.label === 'Dashboard' || item.path === '/leaves');
      }

      let currentUserDept = '';
      if (userObj.departmentId) {
        if (typeof userObj.departmentId === 'object' && userObj.departmentId._id) {
          currentUserDept = String(userObj.departmentId._id).trim();
        } else {
          currentUserDept = String(userObj.departmentId).trim();
        }
      }

      let currentUserDesignation = '';
      if (userObj.designationId) {
        if (typeof userObj.designationId === 'object' && userObj.designationId._id) {
          currentUserDesignation = String(userObj.designationId._id).trim();
        } else {
          currentUserDesignation = String(userObj.designationId).trim();
        }
      } else if (userObj.designation_id) {
        currentUserDesignation = String(userObj.designation_id).trim();
      }
      
      const isPrivilegedUser = ['0', '1', '2', '10', 'admin', 'hr', 'superadmin', 'manager', 'team_lead', 'teamlead', 'tl', 'md'].includes(currentUserRole) || !!userObj.isTeamLead;
      const DEFAULT_EMPLOYEE_LABELS = ['Dashboard', 'Task Assign', 'Notifications', 'Attendance', 'Leave Requests', 'My LMS Learning', 'Employee Training', 'Personal Payslip'];

      const visible = menuItems.filter(item => {
        if (item.excludeRoles && item.excludeRoles.includes(currentUserRole)) {
          return false;
        }
        // Show Team Reports page only for non-HR department team leads
        if (item.isTeamLeadOnly) {
          const desigName = String(userObj.designation || userObj.designationId?.name || '').toLowerCase().trim();
          const isHrUser = currentUserRole === 'hr' || desigName.includes('hr');
          if (isHrUser) return false;
          return !!userObj.isTeamLead;
        }
        if (item.isCommonDashboardFallback || item.isBasicReportFallback) {
          return false;
        }
        if (item.label === 'Clients' || item.label === 'Projects' || item.label === 'Client Leads' || item.label === 'KPI Analytics' || item.label === 'Lead Dashboard' || item.label === 'Marketing Dashboard') {
          return isPrivilegedUser;
        }

        const hasNoRoleRestrictions = !item.allowedRoles && !item.allowedDepartments && !item.allowedDesignations && !item.allowedDepartmentNames && !item.allowedDesignationNames;
        
        if (hasNoRoleRestrictions) {
          if (isPrivilegedUser) return true;
          // Standard employees without custom permissions only get default items
          return DEFAULT_EMPLOYEE_LABELS.includes(item.label);
        }

        const roleMatch = item.allowedRoles && item.allowedRoles.includes(currentUserRole);
        const deptMatch = item.allowedDepartments && item.allowedDepartments.includes(currentUserDept);
        const designationMatch = item.allowedDesignations && item.allowedDesignations.includes(currentUserDesignation);
        
        // Name-based department matching (works across environments)
        const currentDeptName = String(deptName).toLowerCase().trim();
        const deptNameMatch = item.allowedDepartmentNames && item.allowedDepartmentNames.some(name => 
          currentDeptName.includes(name) || name.includes(currentDeptName)
        );

        // Name-based designation matching (works across environments)
        const currentDesigName = String(userObj.designation || userObj.designationId?.name || '').toLowerCase().trim();
        const desigNameMatch = item.allowedDesignationNames && item.allowedDesignationNames.some(name => 
          currentDesigName.includes(name) || name.includes(currentDesigName)
        );
        
        const matches = [];
        if (item.allowedRoles) matches.push(roleMatch);
        if (item.allowedDepartments) matches.push(deptMatch);
        if (item.allowedDesignations) matches.push(designationMatch);
        if (item.allowedDepartmentNames) matches.push(deptNameMatch);
        if (item.allowedDesignationNames) matches.push(desigNameMatch);
        
        return matches.some(m => m === true);
      });

      // Fallback dashboard: if user has no other dashboard in visible items
      const hasOtherDashboard = visible.some(item => item.label.toLowerCase().includes('dashboard'));
      if (!hasOtherDashboard) {
        const fallbackDashboard = menuItems.find(item => item.isCommonDashboardFallback);
        if (fallbackDashboard) visible.unshift(fallbackDashboard);
      }

      // Fallback report: if user has no other report page in visible items
      const hasOtherReport = visible.some(item => item.label.toLowerCase().includes('report'));
      if (!hasOtherReport) {
        const fallbackReport = menuItems.find(item => item.isBasicReportFallback);
        if (fallbackReport) {
          visible.push(fallbackReport);
        }
      }

      // Determine the user's primary dashboard and place it at the VERY TOP of the sidebar under Overview
      const userDashboardPath = resolveUserDashboardPath(userObj);
      let primaryDash = menuItems.find(item => item.path === userDashboardPath);
      if (!primaryDash) {
        primaryDash = visible.find(item => item.label.toLowerCase().includes('dashboard'));
      }

      let finalVisible = [...visible];
      if (primaryDash) {
        // Remove existing copy if present
        finalVisible = finalVisible.filter(item => item.path !== primaryDash.path && item.label !== primaryDash.label);
        // Unshift primary dashboard at the top under Overview category
        finalVisible.unshift(primaryDash);
      }

      return finalVisible;
    } catch (e) {
      console.error("Error reading operator authorization layout paths:", e);
      return menuItems.filter(item => !item.allowedRoles && !item.allowedDepartments && !item.allowedDesignations);
    }
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo header */}
        <div className={`h-16 flex items-center justify-between shrink-0 overflow-hidden border-b border-slate-100 dark:border-slate-800/40 ${
          isCollapsed ? 'px-3' : 'px-5'
        }`}>
          <div className="flex items-center gap-2.5">
            {!isCollapsed ? (
              <img src="/logo3.png" alt="AyurCare Logo" className="h-9 w-auto object-contain" />
            ) : (
              <img src="/logo2.png" alt="AyurCare Logo Icon" className="h-8 w-8 object-contain shrink-0" />
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsCollapsed(prev => {
                const nextState = !prev;
                localStorage.setItem('sidebarCollapsed', JSON.stringify(nextState));
                return nextState;
              });
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Menu Items (Direct List without Headings) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleMenuItems.map((item) => (
            <NavItem 
              key={`${item.path}-${item.label}`}
              icon={<item.icon size={20} />} 
              label={item.label} 
              to={item.path} 
              active={activePath === item.path || (item.children && item.children.some(c => activePath === c.path))} 
              isCollapsed={isCollapsed}
              childrenItems={item.children}
            />
          ))}
        </div>

        {/* Logout (Bottom-aligned) */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <NavItem 
            icon={<LogOut size={20} />} 
            label="Logout" 
            to="/" 
            active={false} 
            isLogout={true}
            isCollapsed={isCollapsed}
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('user_id');
            }}
          />
        </div>
      </aside>

      {/* 2. Mobile Sidebar Slide-over Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 3. Mobile Sidebar Slide-over Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <img src="/logo3.png" alt="AyurCare Logo" className="h-9 w-auto object-contain" />
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {visibleMenuItems.map((item) => (
            <NavItem
              key={`${item.path}-${item.label}`}
              icon={<item.icon size={20} />}
              label={item.label}
              to={item.path}
              active={activePath === item.path || (item.children && item.children.some(c => activePath === c.path))}
              isCollapsed={false}
              childrenItems={item.children}
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <Link
            to="/"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('user_id');
              setIsMobileOpen(false);
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-medium"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ icon, label, to, active, isLogout, isCollapsed, onClick, childrenItems }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    if (childrenItems && childrenItems.some(c => location.pathname.startsWith(c.path))) {
      return true;
    }
    return false;
  });

  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const itemRef = useRef(null);

  const handleMouseEnter = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    }
    setIsHovered(true);
  };

  const isParentActive = active || (childrenItems && childrenItems.some(c => location.pathname.startsWith(c.path)));

  if (childrenItems && childrenItems.length > 0) {
    return (
      <div className="w-full space-y-1 select-none">
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setIsHovered(false)}
          ref={itemRef}
          className="relative w-full flex items-center justify-between group"
        >
          <Link
            to={to}
            onClick={(e) => {
              setIsOpen(true);
              if (onClick) onClick(e);
            }}
            className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 
              ${isParentActive 
                ? 'text-white bg-indigo-600 shadow-md shadow-indigo-500/15 font-semibold' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
              }`}
          >
            <span className="flex items-center justify-center shrink-0">
              {icon}
            </span>
            <span className={`text-sm transition-all duration-200 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
              {label}
            </span>
          </Link>

          {!isCollapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className={`p-2 rounded-xl transition-colors ${
                isParentActive
                  ? 'text-white/80 hover:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={isOpen ? "Collapse Submenu" : "Expand Submenu"}
            >
              <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Floating label badge when collapsed */}
        <AnimatePresence>
          {isHovered && isCollapsed && (
            <PortalTooltip>
              <motion.span 
                initial={{ opacity: 0, x: -10, y: '-50%' }}
                animate={{ opacity: 1, x: 0, y: '-50%' }}
                exit={{ opacity: 0, x: -10, y: '-50%' }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                }}
                className="fixed pointer-events-none z-[9999] px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[11px] font-semibold rounded-lg shadow-md border border-slate-200 dark:border-slate-800 whitespace-nowrap -translate-y-1/2"
              >
                {label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 bg-white dark:bg-slate-900 rotate-45 border-l border-b border-slate-200 dark:border-slate-800" />
              </motion.span>
            </PortalTooltip>
          )}
        </AnimatePresence>

        {/* Child Items */}
        <AnimatePresence>
          {isOpen && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-3 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4 mt-1"
            >
              {childrenItems.map(child => {
                const childActive = location.pathname === child.path;
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={onClick}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      childActive
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <ChildIcon size={14} className="shrink-0" />
                    <span className="truncate">{child.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link 
      to={to} 
      onClick={onClick} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      ref={itemRef}
      className="relative flex items-center justify-start shrink-0 group select-none w-full"
    >
      <div
        className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 
          ${active 
            ? 'text-white bg-indigo-600 shadow-md shadow-indigo-500/15' 
            : isLogout 
              ? 'text-rose-500 hover:bg-rose-500/10'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
      >
        <span className="flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className={`text-sm font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
          {label}
        </span>
      </div>
      
      {/* Portalled Floating Label Badge to make sure it bypasses all overflow constraints */}
      <AnimatePresence>
        {isHovered && isCollapsed && (
          <PortalTooltip>
            <motion.span 
              initial={{ opacity: 0, x: -10, y: '-50%' }}
              animate={{ opacity: 1, x: 0, y: '-50%' }}
              exit={{ opacity: 0, x: -10, y: '-50%' }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
              }}
              className="fixed pointer-events-none z-[9999] px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[11px] font-semibold rounded-lg shadow-md border border-slate-200 dark:border-slate-800 whitespace-nowrap -translate-y-1/2"
            >
              {label}
              
              {/* Desktop Side Arrow Pin Indicator */}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 bg-white dark:bg-slate-900 rotate-45 border-l border-b border-slate-200 dark:border-slate-800" />
            </motion.span>
          </PortalTooltip>
        )}
      </AnimatePresence>
    </Link>
  );
};

export default Sidebar;