import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, ChefHat, CircleUserRound, LayoutDashboard, LogOut, Package, ReceiptText, ShoppingBasket, Table2, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import type { User } from '../../types';

interface PageProps {
    children: ReactNode;
}

export default function AppShell({ children }: PageProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const isAdmin = auth.user?.role === 'ADMIN';
    const navigation = isAdmin
        ? [
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'POS', href: '/pos', icon: ShoppingBasket },
            { label: 'Categories', href: '/admin/categories', icon: Package },
            { label: 'Products', href: '/admin/products', icon: Package },
            { label: 'Tables', href: '/admin/tables', icon: Table2 },
            { label: 'Orders', href: '/admin/orders', icon: ReceiptText },
            { label: 'Expenses', href: '/admin/expenses', icon: ReceiptText },
            { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
            { label: 'Users', href: '/admin/users', icon: Users },
        ]
        : [
            { label: 'POS', href: '/pos', icon: ShoppingBasket },
            { label: 'Tables', href: '/cashier/tables', icon: Table2 },
            { label: 'Orders', href: '/cashier/orders', icon: ReceiptText },
            { label: 'Billing', href: '/cashier/billing', icon: ReceiptText },
            { label: 'Payments', href: '/cashier/payments', icon: ReceiptText },
            { label: 'Shift', href: '/cashier/shift', icon: BarChart3 },
            { label: 'Receipts', href: '/cashier/receipts', icon: ReceiptText },
            { label: 'Customers', href: '/cashier/customers', icon: Users },
        ];

    return (
        <div className="min-h-screen bg-[#f5f7f8] lg:flex">
            <aside className="flex w-full flex-col bg-[#102b2b] px-5 py-5 text-white lg:min-h-screen lg:w-64 lg:shrink-0">
                <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d97745] shadow-lg shadow-[#d97745]/20"><ChefHat size={21} /></div>
                    <div><p className="text-sm font-semibold tracking-wide">TABLE & TALLY</p><p className="text-xs text-white/50">Restaurant POS</p></div>
                </div>
                <nav className="mt-6 grid grid-cols-2 gap-1 lg:block lg:space-y-1">
                    {navigation.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"><Icon size={17} />{label}</Link>)}
                </nav>
                <div className="mt-auto hidden border-t border-white/10 pt-4 lg:block"><div className="mb-3 flex items-center gap-3"><CircleUserRound size={20} className="text-[#e6a06c]" /><div><p className="text-sm">{auth.user?.name}</p><p className="text-xs text-white/45">{auth.user?.role}</p></div></div><button onClick={() => router.post('/logout')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/55 hover:bg-white/10 hover:text-white"><LogOut size={17} />Sign out</button></div>
            </aside>
            <main className="min-w-0 flex-1">{children}</main>
        </div>
    );
}