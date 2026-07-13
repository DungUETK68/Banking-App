import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import '../styles/history.css';

const History = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response: any = await axiosClient.get('/accounts/me');
                if (response.data && response.data.account) {
                    setAccountNumber(response.data.account.accountNumber);
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin tài khoản", error);
                setLoading(false);
            }
        };
        fetchAccount();
    }, []);

    const fetchHistory = async (currentPage: number, accountNumber: string) => {
        if (!accountNumber) {
            return;
        }

        setLoading(true);
        try {
            let url = `/transactions?accountNumber=${accountNumber}&page=${currentPage}&limit=10`;

            if (filters.type) url += `&type=${filters.type}`;
            if (filters.status) url += `&status=${filters.status}`;
            if (filters.minAmount) url += `&minAmount=${filters.minAmount}`;
            if (filters.maxAmount) url += `&maxAmount=${filters.maxAmount}`;
            if (filters.startDate) url += `&startDate=${filters.startDate}`;
            if (filters.endDate) url += `&endDate=${filters.endDate}`;

            const response: any = await axiosClient.get(url);
            setTransactions(response.data.items);
            setMeta({
                page: response.data.meta.currentPage,
                lastPage: response.data.meta.totalPages
            });
        } catch (error) {
            console.error("Lỗi khi tải lịch sử:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badgeStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center' };
        switch (status) {
            case 'success':
                return <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#166534' }}><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Thành công</span>;
            case 'failed':
                return <span style={{ ...badgeStyle, backgroundColor: '#fee2e2', color: '#991b1b' }}><XCircle size={12} style={{ marginRight: '4px' }} /> Thất bại</span>;
            case 'cancelled':
                return <span style={{ ...badgeStyle, backgroundColor: '#fee2e2', color: '#991b1b' }}><XCircle size={12} style={{ marginRight: '4px' }} /> Bị hủy</span>;
            case 'pending':
                return <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#92400e' }}><AlertCircle size={12} style={{ marginRight: '4px' }} /> Chờ duyệt</span>;
            case 'pending_otp':
                return <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#92400e' }}><AlertCircle size={12} style={{ marginRight: '4px' }} /> Chờ OTP</span>;
            case 'reversed':
                return <span style={{ ...badgeStyle, backgroundColor: '#e0e7ff', color: '#3730a3' }}><RefreshCw size={12} style={{ marginRight: '4px' }} /> Đã hoàn tiền</span>;
            default:
                return <span>{status}</span>;
        }
    };

    const handleApplyFilter = () => {
        if (page === 1) {
            fetchHistory(1, accountNumber);
        } else {
            setPage(1);
        }
    };

    useEffect(() => {
        if (accountNumber) {
            fetchHistory(page, accountNumber);
        }
    }, [page, accountNumber]);

    const formatInputMoney = (val: string) => {
        if (!val) return '';
        return new Intl.NumberFormat('vi-VN').format(Number(val));
    };

    const formatMoney = (val: number, type: string) => {
        const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
        return type === 'INCOME' ? `+ ${formatted}` : `- ${formatted}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'minAmount' | 'maxAmount') => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setFilters({ ...filters, [field]: rawValue });
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <h1>Lịch sử giao dịch</h1>
            </div>
            <div className="filter-toolbar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '160px' }}
                >
                    <option value="">Tất cả loại Giao dịch</option>
                    <option value="INCOME">Tiền vào</option>
                    <option value="EXPENSE">Tiền ra</option>
                </select>
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '150px' }}
                >
                    <option value="">Tất cả Trạng thái</option>
                    <option value="success">Thành công</option>
                    <option value="failed">Thất bại</option>
                    <option value="cancelled">Bị hủy</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="pending_otp">Chờ OTP</option>
                    <option value="reversed">Đã hoàn tiền</option>
                </select>
                <input
                    type="text" placeholder="Từ số tiền (VNĐ)" value={formatInputMoney(filters.minAmount)}
                    onChange={(e) => handleAmountChange(e, 'minAmount')}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '140px' }}
                />
                <input
                    type="text" placeholder="Đến số tiền (VNĐ)" value={formatInputMoney(filters.maxAmount)}
                    onChange={(e) => handleAmountChange(e, 'maxAmount')}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '140px' }}
                />
                <input
                    type="date" value={filters.startDate} title="Từ ngày"
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '130px' }}
                />
                <input
                    type="date" value={filters.endDate} title="Đến ngày"
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '130px' }}
                />
                <button onClick={handleApplyFilter} style={{ padding: '8px 16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Lọc Dữ Liệu
                </button>
            </div>
            <div className="history-table-wrapper">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</div>
                ) : transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Bạn chưa có giao dịch nào.
                    </div>
                ) : (
                    <>
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>THỜI GIAN</th>
                                    <th>LOẠI GIAO DỊCH</th>
                                    <th>SỐ TIỀN</th>
                                    <th>TRẠNG THÁI</th>
                                    <th>NỘI DUNG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                            {formatDate(tx.createdAt)}
                                        </td>
                                        <td>
                                            <div className="tx-type">
                                                {tx.type === 'INCOME' ? (
                                                    <><ArrowDownLeft size={18} color="#10b981" /> Tiền vào</>
                                                ) : (
                                                    <><ArrowUpRight size={18} color="#ef4444" /> Tiền ra</>
                                                )}
                                            </div>
                                        </td>
                                        <td className={tx.type === 'INCOME' ? 'amount-income' : 'amount-expense'}>
                                            {formatMoney(tx.amount, tx.type)}
                                        </td>
                                        <td>
                                            {getStatusBadge(tx.status)}
                                        </td>
                                        <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                                            {tx.description || 'Không có nội dung'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {meta && meta.lastPage > 1 && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    onClick={() => setPage(p => p - 1)}
                                    disabled={page <= 1}
                                >
                                    Trang trước
                                </button>
                                <span className="page-info">
                                    Trang {meta.page} / {meta.lastPage}
                                </span>
                                <button
                                    className="page-btn"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= meta.lastPage}
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default History;