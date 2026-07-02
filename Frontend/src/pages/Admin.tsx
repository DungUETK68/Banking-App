import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Lock, Unlock } from 'lucide-react';
import '../styles/admin.css';

const Admin = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response: any = await axiosClient.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'locked' : 'active';

        if (!window.confirm(`Bạn có chắc chắn muốn ${newStatus === 'locked' ? 'Khóa' : 'Mở khóa'} tài khoản này?`)) {
            return;
        }

        try {
            await axiosClient.patch(`/admin/users/${userId}/status`, {
                status: newStatus
            });
            fetchUsers();
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
                                            onClick={() => toggleStatus(user.id, user.status)}
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
            </div>
        </div>
    );
}

export default Admin;