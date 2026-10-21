import { Head } from '@inertiajs/react';
import { ArrowUpRight, Banknote, BarChart3, CreditCard, ReceiptText, ShoppingCart, Smartphone } from 'lucide-react';
import AppShell from '../components/layout/AppShell';

interface Props {
    metrics: {
        sales: number;
        orders: number;
        cash: number;
        card: number;
        lankaqr: number;
        expenses: { category: string; total: number }[];
    };
}

const money = (value: number) => `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Dashboard({ metrics }: Props) {
    const cards = [
        { label: "Today's sales", value: money(metrics.sales), icon: BarChart3, tint: 'bg-[#fff0e5] text-[#c26435]' },
        { label: "Today's orders", value: metrics.orders.toString(), icon: ReceiptText, tint: 'bg-[#eaf4ef] text-[#32805b]' },
        { label: 'Cash sales', value: money(metrics.cash), icon: Banknote, tint: 'bg-[#eef1fb] text-[#5968a8]' },
        { label: 'Digital sales', value: money(metrics.card + metrics.lankaqr), icon: Smartphone, tint: 'bg-[#f3edf8] text-[#8a5e9f]' },
    ];

    return <>
        <Head title="Dashboard" />
        <AppShell>
            <div className="min-h-screen">
                <header className="border-b border-slate-200 bg-white px-5 py-5 lg:px-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d97745]">Overview</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">Good morning, Sir</h1>
                    <p className="mt-1 text-sm text-slate-500">Here is today&apos;s service at a glance.</p>
                </header>
                <div className="space-y-6 p-5 lg:p-8">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map(({ label, value, icon: Icon, tint }) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex items-start justify-between"><span className={`rounded-xl p-2.5 ${tint}`}><Icon size={19} /></span><ArrowUpRight size={17} className="text-slate-300" /></div><p className="mt-6 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p></div>)}
                    </div>
                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Today&apos;s expenses</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {metrics.expenses.length ? metrics.expenses.map(expense => <div key={expense.category} className="rounded-xl bg-[#fff7f2] p-4"><p className="text-sm text-slate-500">{expense.category}</p><p className="mt-1 text-xl font-semibold text-[#c26435]">{money(expense.total)}</p></div>) : <p className="text-sm text-slate-400">No expenses recorded today.</p>}
                        </div>
                    </section>
                    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sales rhythm</p><h2 className="mt-1 text-lg font-semibold">This week</h2></div><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><ShoppingCart size={18} /></button></div>
                            <div className="mt-8 flex h-56 items-end gap-3 border-b border-l border-slate-100 px-4 pt-4 sm:gap-8">{[45, 62, 38, 78, 56, 88, 64].map((height, index) => <div key={index} className="flex flex-1 flex-col items-center gap-3"><div className={`w-full max-w-10 rounded-t-lg ${index === 5 ? 'bg-[#d97745]' : 'bg-[#f3d5c2]'}`} style={{ height: `${height}%` }} /><span className="mb-2 text-xs text-slate-400">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</span></div>)}</div>
                        </section>
                        <section className="rounded-2xl bg-[#102b2b] p-6 text-white shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Payment mix</p><h2 className="mt-1 text-lg font-semibold">Today</h2></div><CreditCard className="text-[#e6a06c]" size={20} /></div><div className="mt-8 space-y-5">{[['Cash', metrics.cash, 'bg-[#e6a06c]'], ['Card', metrics.card, 'bg-[#82a8b1]'], ['LankaQR', metrics.lankaqr, 'bg-[#c9d96f]']].map(([label, value, color]) => <div key={label as string}><div className="mb-2 flex justify-between text-sm"><span className="text-white/65">{label as string}</span><span>{money(value as number)}</span></div><div className="h-2 rounded-full bg-white/10"><div className={`h-2 rounded-full ${color}`} style={{ width: `${metrics.sales ? Math.min(100, ((value as number) / metrics.sales) * 100) : 0}%` }} /></div></div>)}</div></section>
                    </div>
                </div>
            </div>
        </AppShell>
    </>;
}
