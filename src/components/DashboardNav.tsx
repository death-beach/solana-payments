import { usePrivy } from '@privy-io/react-auth';

import Link from 'next/link';

import { CLOVER_ROLES } from '@/config/clover-roles';
import { useAuth } from '@/hooks/useAuth';
import { isPrivyUser } from '@/types/auth/user';
import type { PrivyUser } from '@/types/auth/user';

const DashboardNav = () => {
  const { logout } = usePrivy();
  const { role, user } = useAuth();
  // Check for name property in different ways depending on the user type
  const merchantName = 
    (user && 'name' in user) ? user.name : 
    (isPrivyUser(user) ? user.email?.address : null) || 
    'Merchant Dashboard';

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      roles: [CLOVER_ROLES.OWNER, CLOVER_ROLES.ADMIN, CLOVER_ROLES.MANAGER, CLOVER_ROLES.EMPLOYEE],
    },
    {
      name: 'Transactions',
      href: '/dashboard/transactions',
      roles: [CLOVER_ROLES.OWNER, CLOVER_ROLES.ADMIN, CLOVER_ROLES.MANAGER],
    },
    {
      name: 'Wallets',
      href: '/dashboard/wallets',
      roles: [CLOVER_ROLES.OWNER, CLOVER_ROLES.ADMIN],
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      roles: [CLOVER_ROLES.OWNER, CLOVER_ROLES.ADMIN],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <nav className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <span className="text-lg font-semibold">{merchantName}</span>
        <div className="flex space-x-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-600 hover:text-gray-900"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={logout}
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Sign Out
      </button>
    </nav>
  );
};

export default DashboardNav;