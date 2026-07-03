import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import '../styles/history.css';

const History = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [accountNumber, setAccountNumber] = useState<string>('');

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
            const response: any = await axiosClient.get(`/transactions?accountNumber=${accountNumber}&page=${currentPage}&limit=10`);
            setTransactions(response.data);
            setMeta({
                page: response.currentPage,
                lastPage: response.totalPages
            });
        } catch (error) {
            console.error("Lỗi khi tải lịch sử:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accountNumber) {
            fetchHistory(page, accountNumber);
        }
    }, [page, accountNumber]);

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

    return (
        <div className="history-container">
            <div className="history-header">
                <h1>Lịch sử giao dịch</h1>
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
                                        <td>{tx.description || 'Không có nội dung'}</td>
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