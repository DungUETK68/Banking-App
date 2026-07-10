import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import '../styles/admin.css';

const AdminLedger = () => {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);
    const [filters, setFilters] = useState({ accountNumber: '', transactionId: '', type: '' });

    const fetchLedgerEntries = async (currentPage: number) => {
        setLoading(true);
        try {
            let url = `/admin/ledger-entries?page=${currentPage}&limit=10`;
            if (filters.accountNumber) url += `&accountNumber=${filters.accountNumber}`;
            if (filters.transactionId) url += `&transactionId=${filters.transactionId}`;
            if (filters.type) url += `&type=${filters.type}`;

            const response: any = await axiosClient.get(url);
            setEntries(response.data.items);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sổ cái:", error);
            alert("Có lỗi xảy ra khi tải dữ liệu sổ cái");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedgerEntries(1);
    }, []);

    const handleFilter = () => {
        setPage(1);
        fetchLedgerEntries(1);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '100px' }}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="admin-container">
            <h1 className="page-title">Sổ cái kép (Ledger Entries)</h1>
            
            <div className="filter-toolbar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input
                    type="text" 
                    placeholder="Số tài khoản..." 
                    value={filters.accountNumber}
                    onChange={(e) => setFilters({ ...filters, accountNumber: e.target.value })}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <input
                    type="text" 
                    placeholder="Mã giao dịch..." 
                    value={filters.transactionId}
                    onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <select 
                    value={filters.type} 
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })} 
                    style={{ padding: '8px', borderRadius: '8px' }}
                >
                    <option value="">Tất cả Bút toán</option>
                    <option value="CREDIT">Ghi Có (CREDIT +)</option>
                    <option value="DEBIT">Ghi Nợ (DEBIT -)</option>
                </select>
                <button
                    onClick={handleFilter}
                    style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Áp dụng
                </button>
            </div>

            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>THỜI GIAN</th>
                            <th>MÃ BÚT TOÁN</th>
                            <th>SỐ TÀI KHOẢN</th>
                            <th>LOẠI</th>
                            <th>SỐ TIỀN</th>
                            <th>SỐ DƯ SAU GD</th>
                            <th>MÃ GIAO DỊCH GỐC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu</td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id}>
                                    <td style={{ fontSize: '13px' }}>{formatDate(entry.createdAt)}</td>
                                    <td style={{ fontSize: '12px', color: '#666' }}>{entry.id}</td>
                                    <td style={{ fontWeight: 'bold' }}>{entry.account?.accountNumber || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${entry.type === 'CREDIT' ? 'status-active' : 'status-locked'}`}
                                            style={{ backgroundColor: entry.type === 'CREDIT' ? '#dcfce7' : '#fee2e2', 
                                                     color: entry.type === 'CREDIT' ? '#166534' : '#991b1b' }}>
                                            {entry.type}
                                        </span>
                                    </td>
                                    <td style={{ 
                                        fontWeight: 'bold', 
                                        color: entry.type === 'CREDIT' ? '#10b981' : '#ef4444' 
                                    }}>
                                        {entry.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Number(entry.amount))}
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>{formatCurrency(Number(entry.balanceAfter))}</td>
                                    <td style={{ fontSize: '12px', color: '#666' }}>{entry.transaction?.id || 'N/A'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {meta && meta.totalPages > 1 && (
                    <div className="pagination">
                        <button 
                            className="page-btn" 
                            disabled={page <= 1} 
                            onClick={() => { setPage(page - 1); fetchLedgerEntries(page - 1); }}
                        >
                            Trang trước
                        </button>
                        <span className="page-info">Trang {meta.currentPage} / {meta.totalPages}</span>
                        <button 
                            className="page-btn" 
                            disabled={page >= meta.totalPages} 
                            onClick={() => { setPage(page + 1); fetchLedgerEntries(page + 1); }}
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminLedger;
