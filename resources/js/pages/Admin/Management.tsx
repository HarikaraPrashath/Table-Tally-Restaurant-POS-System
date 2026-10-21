import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Download, Package, Plus, Search, Trash2 } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';

type Resource = 'products' | 'categories' | 'tables' | 'orders' | 'inventory' | 'expenses' | 'reports' | 'users';
interface Props { resource: Resource }
interface InventoryRow { id: number; current_stock: number | string; minimum_stock: number | string; unit: string; product?: { name: string }; is_low_stock?: boolean }
const titles: Record<Resource, string> = { products: 'Products', categories: 'Categories', tables: 'Tables', orders: 'Orders', inventory: 'Inventory', expenses: 'Expenses', reports: 'Reports', users: 'Users' };
const units = ['kg', 'g', 'L', 'ml', 'pcs'];
const money = (value: number) => `Rs. ${Number(value || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

export default function Management({ resource }: Props) {
    const [rows, setRows] = useState<any[]>([]);
    const [report, setReport] = useState<any>(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [search, setSearch] = useState('');
    const [notice, setNotice] = useState('');
    const [period, setPeriod] = useState('month');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('');
    const [expenseFormCategory, setExpenseFormCategory] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
    const [expenseDescription, setExpenseDescription] = useState('');

    const load = () => axios.get(`/api/${resource}`, { params: resource === 'reports' ? { period, from, to } : resource === 'expenses' ? { from, to, category: expenseCategory } : {} }).then(response => {
        if (resource === 'reports') setReport(response.data);
        else setRows(response.data.data ?? response.data);
    }).catch(() => setNotice('Unable to load this section.'));

    useEffect(() => { load(); }, [resource]);

    async function create(event: FormEvent) {
        event.preventDefault();
        if (!name.trim()) return;
        const payload = resource === 'categories' || resource === 'tables' ? { name } : { name, category_id: 1, price: Number(price) };
        try {
            await axios.post(`/api/${resource}`, payload);
            setName('');
            setPrice('');
            setNotice(`${titles[resource]} updated.`);
            load();
        } catch (error: any) {
            setNotice(error.response?.data?.message ?? 'Unable to save.');
        }
    }

    async function remove(id: number) {
        if (!confirm('Delete this item?')) return;
        await axios.delete(`/api/${resource}/${id}`);
        load();
    }

    async function createExpense(event: FormEvent) {
        event.preventDefault();
        try {
            await axios.post('/api/expenses', {
                category: expenseFormCategory,
                amount: Number(expenseAmount),
                expense_date: expenseDate,
                description: expenseDescription,
            });
            setExpenseFormCategory('');
            setExpenseAmount('');
            setExpenseDescription('');
            setNotice('Expense added successfully.');
            load();
        } catch (error: any) {
            setNotice(error.response?.data?.message ?? 'Unable to add expense.');
        }
    }

    return <>
        <Head title={titles[resource]} />
        <AppShell>
            <div className="min-h-screen">
                <header className="border-b border-slate-200 bg-white px-5 py-5 lg:px-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d97745]">Admin workspace</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">{titles[resource]}</h1>
                </header>
                <div className="space-y-6 p-5 lg:p-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${titles[resource].toLowerCase()}...`} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#d97745]" />
                        </div>
                        {['categories', 'tables', 'products'].includes(resource) && <form onSubmit={create} className="flex flex-wrap gap-2">
                            <input value={name} onChange={event => setName(event.target.value)} placeholder={`New ${resource.slice(0, -1)} name`} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#d97745]" />
                            {resource === 'products' && <input required type="number" min="1" value={price} onChange={event => setPrice(event.target.value)} placeholder="Price" className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#d97745]" />}
                            <button className="flex items-center gap-2 rounded-xl bg-[#d97745] px-4 py-3 text-sm font-semibold text-white"><Plus size={17} />Add</button>
                        </form>}
                    </div>
                    {notice && <div className="flex items-center gap-2 rounded-xl bg-[#fff4ec] p-3 text-sm text-[#a85329]"><CheckCircle2 size={17} />{notice}</div>}
                    {resource === 'expenses' && <ExpenseForm category={expenseFormCategory} amount={expenseAmount} date={expenseDate} description={expenseDescription} onCategoryChange={setExpenseFormCategory} onAmountChange={setExpenseAmount} onDateChange={setExpenseDate} onDescriptionChange={setExpenseDescription} onSubmit={createExpense} />}
                    {resource === 'inventory' ? <InventoryTable rows={rows as InventoryRow[]} search={search} onUpdated={load} onNotice={setNotice} /> : resource === 'reports' && report ? <ReportTable report={report} period={period} from={from} to={to} onPeriodChange={setPeriod} onFromChange={setFrom} onToChange={setTo} onApply={load} /> : resource === 'expenses' ? <ExpenseTable rows={rows} from={from} to={to} category={expenseCategory} onFromChange={setFrom} onToChange={setTo} onCategoryChange={setExpenseCategory} onApply={load} onRemove={remove} /> : <DataTable resource={resource} rows={rows} search={search} onRemove={remove} />}
                </div>
            </div>
        </AppShell>
    </>;
}

function InventoryTable({ rows, search, onUpdated, onNotice }: { rows: InventoryRow[]; search: string; onUpdated: () => void; onNotice: (message: string) => void }) {
    const [type, setType] = useState<Record<number, string>>({});
    const [quantity, setQuantity] = useState<Record<number, string>>({});
    const [minimum, setMinimum] = useState<Record<number, string>>({});
    const [unit, setUnit] = useState<Record<number, string>>({});
    const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));

    async function submit(row: InventoryRow) {
        try {
            await axios.post(`/api/inventory/${row.id}/movement`, {
                movement_type: type[row.id] ?? 'STOCK_IN',
                quantity: Number(quantity[row.id] ?? 0),
                minimum_stock: Number(minimum[row.id] ?? row.minimum_stock),
                unit: unit[row.id] ?? row.unit,
            });
            onNotice('Inventory updated successfully.');
            onUpdated();
        } catch (error: any) {
            onNotice(error.response?.data?.message ?? 'Unable to update inventory.');
        }
    }

    return <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Current stock</th><th className="px-5 py-4">Minimum</th><th className="px-5 py-4">Unit</th><th className="px-5 py-4">Movement</th><th className="px-5 py-4 text-right">Save</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(row => { const low = row.is_low_stock ?? Number(row.current_stock) <= Number(row.minimum_stock); return <tr key={row.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold"><div className="flex items-center gap-2"><Package size={17} className="text-[#d97745]" />{row.product?.name ?? 'Product'}</div></td><td className={`px-5 py-4 font-semibold ${low ? 'text-red-600' : 'text-slate-700'}`}>{row.current_stock} {row.unit}{low && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-600"><AlertTriangle size={12} />Low</span>}</td><td className="px-5 py-4"><input type="number" min="0" value={minimum[row.id] ?? row.minimum_stock} onChange={event => setMinimum({ ...minimum, [row.id]: event.target.value })} className="w-24 rounded-lg border border-slate-200 px-2 py-2" /></td><td className="px-5 py-4"><select value={unit[row.id] ?? row.unit} onChange={event => setUnit({ ...unit, [row.id]: event.target.value })} className="rounded-lg border border-slate-200 px-2 py-2">{units.map(option => <option key={option}>{option}</option>)}</select></td><td className="px-5 py-4"><div className="flex gap-2"><select value={type[row.id] ?? 'STOCK_IN'} onChange={event => setType({ ...type, [row.id]: event.target.value })} className="rounded-lg border border-slate-200 px-2 py-2"><option value="STOCK_IN">Stock in</option><option value="STOCK_OUT">Stock out</option><option value="ADJUSTMENT">Adjustment</option></select><input type="number" min="0.001" step="0.001" value={quantity[row.id] ?? ''} onChange={event => setQuantity({ ...quantity, [row.id]: event.target.value })} placeholder="Qty" className="w-20 rounded-lg border border-slate-200 px-2 py-2" /></div></td><td className="px-5 py-4 text-right"><button onClick={() => submit(row)} className="rounded-lg bg-[#102b2b] px-3 py-2 text-xs font-semibold text-white">Save</button></td></tr>; })}</tbody></table>{filtered.length === 0 && <p className="p-10 text-center text-sm text-slate-400">No inventory records found.</p>}</div></div>;
}

function ReportTable({ report, period, from, to, onPeriodChange, onFromChange, onToChange, onApply }: { report: any; period: string; from: string; to: string; onPeriodChange: (value: string) => void; onFromChange: (value: string) => void; onToChange: (value: string) => void; onApply: () => void }) {
    function downloadReport() {
        const header = 'Period,Orders,Revenue,Expenses,Profit';
        const lines = (report.rows ?? []).map((row: any) => [row.period, row.orders, row.revenue ?? row.sales, row.expenses, row.profit].join(','));
        const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `profit-report-${period}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><FilterBar from={from} to={to} onFromChange={onFromChange} onToChange={onToChange} onApply={onApply}><select value={period} onChange={event => onPeriodChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"><option value="date">Day by day</option><option value="week">Week by week</option><option value="month">Month by month</option><option value="year">Year by year</option></select></FilterBar><button onClick={downloadReport} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:border-[#d97745] hover:text-[#c26435]"><Download size={17} />Download profit CSV</button></div><div className="grid gap-4 sm:grid-cols-3"><Metric label="Revenue" value={money(report.revenue ?? report.sales)} /><Metric label="Expenses" value={money(report.expenses)} /><Metric label="Profit" value={money(report.profit ?? 0)} /></div><div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Period</th><th className="px-5 py-4">Orders</th><th className="px-5 py-4">Revenue</th><th className="px-5 py-4">Expenses</th><th className="px-5 py-4">Profit</th></tr></thead><tbody className="divide-y divide-slate-100">{(report.rows ?? []).map((row: any) => <tr key={row.period}><td className="px-5 py-4 font-semibold">{row.period}</td><td className="px-5 py-4">{row.orders}</td><td className="px-5 py-4 text-emerald-700">{money(row.revenue ?? row.sales)}</td><td className="px-5 py-4 text-red-600">{money(row.expenses)}</td><td className="px-5 py-4 font-semibold text-[#c26435]">{money(row.profit)}</td></tr>)}</tbody></table></div></div></div>;
}

function ExpenseForm({ category, amount, date, description, onCategoryChange, onAmountChange, onDateChange, onDescriptionChange, onSubmit }: { category: string; amount: string; date: string; description: string; onCategoryChange: (value: string) => void; onAmountChange: (value: string) => void; onDateChange: (value: string) => void; onDescriptionChange: (value: string) => void; onSubmit: (event: FormEvent) => void }) {
    return <form onSubmit={onSubmit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d97745]">Record an expense</p><h2 className="mt-1 text-lg font-semibold">Add gas, electricity, labour, or any other cost</h2></div><div className="grid gap-3 md:grid-cols-4"><input required value={category} onChange={event => onCategoryChange(event.target.value)} placeholder="Category e.g. Labour" className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#d97745]" /><input required min="0.01" type="number" step="0.01" value={amount} onChange={event => onAmountChange(event.target.value)} placeholder="Amount (Rs.)" className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#d97745]" /><input required type="date" value={date} onChange={event => onDateChange(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#d97745]" /><input value={description} onChange={event => onDescriptionChange(event.target.value)} placeholder="Description (optional)" className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#d97745]" /></div><button className="mt-3 rounded-xl bg-[#d97745] px-4 py-3 text-sm font-semibold text-white">Add expense</button></form>;
}

function ExpenseTable({ rows, from, to, category, onFromChange, onToChange, onCategoryChange, onApply, onRemove }: { rows: any[]; from: string; to: string; category: string; onFromChange: (value: string) => void; onToChange: (value: string) => void; onCategoryChange: (value: string) => void; onApply: () => void; onRemove: (id: number) => void }) {
    const categories = [...new Set(['Gas', 'Electricity', 'Transport', 'Maintenance', 'Cleaning', 'Other', ...rows.map(row => row.category).filter(Boolean)])];

    return <div className="space-y-5"><FilterBar from={from} to={to} onFromChange={onFromChange} onToChange={onToChange} onApply={onApply}><select value={category} onChange={event => onCategoryChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"><option value="">All categories</option>{categories.map(option => <option key={option}>{option}</option>)}</select></FilterBar><div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Description</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(row => <tr key={row.id}><td className="px-5 py-4">{new Date(row.expense_date).toLocaleDateString('en-GB')}</td><td className="px-5 py-4 font-semibold">{row.category}</td><td className="px-5 py-4 text-slate-500">{row.description ?? '-'}</td><td className="px-5 py-4 font-semibold text-red-600">{money(row.amount)}</td><td className="px-5 py-4 text-right"><button onClick={() => onRemove(row.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Delete"><Trash2 size={16} /></button></td></tr>)}{rows.length === 0 && <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-400">No expenses found for these filters.</td></tr>}</tbody></table></div></div></div>;
}

function FilterBar({ from, to, onFromChange, onToChange, onApply, children }: { from: string; to: string; onFromChange: (value: string) => void; onToChange: (value: string) => void; onApply: () => void; children?: ReactNode }) {
    return <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-slate-50 p-4"><label className="text-xs font-semibold text-slate-500">From<input type="date" value={from} onChange={event => onFromChange(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label><label className="text-xs font-semibold text-slate-500">To<input type="date" value={to} onChange={event => onToChange(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>{children}<button onClick={onApply} className="rounded-xl bg-[#102b2b] px-4 py-3 text-sm font-semibold text-white">Apply filters</button></div>;
}

function DataTable({ resource, rows, search, onRemove }: { resource: Resource; rows: any[]; search: string; onRemove: (id: number) => void }) { const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())); return <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Name / item</th><th className="px-5 py-4">Status / detail</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(row => <tr key={row.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold">{row.name ?? row.order_number ?? row.product?.name ?? row.email ?? `#${row.id}`}</td><td className="px-5 py-4 text-slate-500">{row.price ? money(row.price) : row.status ?? row.role ?? row.current_stock ?? row.category ?? 'Active'}</td><td className="px-5 py-4 text-right">{['products', 'categories', 'tables', 'expenses'].includes(resource) && <button onClick={() => onRemove(row.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={3} className="px-5 py-14 text-center text-slate-400">No records yet.</td></tr>}</tbody></table></div></div>; }

function Metric({ label, value }: { label: string; value: string | number }) {
    return <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}
