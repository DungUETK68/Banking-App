import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Lock, Unlock } from 'lucide-react';
import '../styles/admin.css';

const Admin = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);
    const [filters, setFilters] = useState({ name: '', email: '', role: '', status: '' })

    const fetchUsers = async (currentPage: number) => {
        setLoading(true);
        try {
            let url = `/admin/users?page=${currentPage}&limit=10`;
            if (filters.name) url += `&name=${filters.name}`;
            if (filters.email) url += `&email=${filters.email}`;
            if (filters.role) url += `&role=${filters.role}`;
            if (filters.status) url += `&status=${filters.status}`;

            const response: any = await axiosClient.get(url);
            setUsers(response.data.items);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Lỗi khi tải danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const handleOpenModal = (user: any) => {
        setSelectedUser(user);
        setShowConfirmModal(true);
    };

    const confirmToggleStatus = async () => {
        if (!selectedUser) return;
        const newStatus = selectedUser.status === 'active' ? 'locked' : 'active';

        try {
            await axiosClient.patch(`/admin/users/${selectedUser.id}/status`, { status: newStatus });
            setShowConfirmModal(false);
            fetchUsers(1);
        } catch (error) {
            alert('Có lỗi xảy ra!');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '100px' }}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="admin-container">
            <h1 className="page-title">Quản trị hệ thống</h1>
            <div className="filter-toolbar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input
                    type="text" placeholder="Tìm tên..." value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <input
                    type="text" placeholder="Tìm email..." value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} style={{ padding: '8px', borderRadius: '8px' }}>
                    <option value="">Tất cả Vai trò</option>
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Quản trị viên</option>
                </select>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={{ padding: '8px', borderRadius: '8px' }}>
                    <option value="">Tất cả Trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="locked">Đã khóa</option>
                </select>
                <button
                    onClick={() => { setPage(1); fetchUsers(1); }}
                    style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Áp dụng
                </button>
            </div>
            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>HỌ VÀ TÊN</th>
                            <th>EMAIL</th>
                            <th>VAI TRÒ</th>
                            <th>TRẠNG THÁI</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>
                                    {user.role === 'admin' ?
                                        <span className="role-badge">Admin</span> :
                                        <span style={{ opacity: 0.6, fontSize: '13px' }}>Khách hàng</span>
                                    }
                                </td>
                                <td>
                                    <span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-locked'}`}>
                                        {user.status === 'active' ? 'Đang hoạt động' : 'Bị khóa'}
                                    </span>
                                </td>
                                <td>
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className={`action-btn ${user.status === 'active' ? 'btn-lock' : 'btn-unlock'}`}
                                        >
                                            {user.status === 'active' ? (
                                                <><Lock size={16} /> Khóa tài khoản</>
                                            ) : (
                                                <><Unlock size={16} /> Mở khóa</>
                                            )}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {meta && meta.totalPages > 1 && (
                    <div className="pagination">
                        <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trang trước</button>
                        <span className="page-info">Trang {meta.currentPage} / {meta.totalPages}</span>
                        <button className="page-btn" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Trang sau</button>
                    </div>
                )}
            </div>

            {showConfirmModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginTop: 0 }}>Xác nhận thao tác</h3>
                        <p>
                            Bạn có chắc chắn muốn <strong style={{ color: selectedUser.status === 'active' ? '#ef4444' : '#10b981', fontSize: '16px' }}>
                                {selectedUser.status === 'active' ? 'Khóa' : 'Mở khóa'}
                            </strong> tài khoản này không?
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            {selectedUser.status === 'active'
                                ? 'Người dùng sẽ bị văng ra ngoài và không thể đăng nhập lại.'
                                : 'Người dùng sẽ có thể đăng nhập và giao dịch bình thường.'}
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowConfirmModal(false)}>
                                Hủy bỏ
                            </button>
                            <button
                                className="modal-btn confirm"
                                onClick={confirmToggleStatus}
                                style={{ backgroundColor: selectedUser.status === 'active' ? '#ef4444' : '#10b981' }}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;