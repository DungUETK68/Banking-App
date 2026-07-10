import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import '../styles/admin.css';

const AdminAuditLog = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedData, setSelectedData] = useState<{ title: string, data: any } | null>(null);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const response: any = await axiosClient.get('/admin/audit-logs');
            if (Array.isArray(response.data)) {
                setLogs(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                setLogs(response.data.data);
            } else if (Array.isArray(response)) {
                setLogs(response);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách Audit Log:", error);
            alert("Có lỗi xảy ra khi tải dữ liệu nhật ký hệ thống");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleViewData = (title: string, data: any) => {
        if (!data) return;
        setSelectedData({ title, data });
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '100px' }}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="admin-container">
            <h1 className="page-title">Nhật ký hệ thống</h1>

            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>THỜI GIAN</th>
                            <th>NGƯỜI THỰC HIỆN</th>
                            <th>HÀNH ĐỘNG</th>
                            <th>ĐỐI TƯỢNG</th>
                            <th>IP / USER AGENT</th>
                            <th>CHI TIẾT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id}>
                                    <td style={{ fontSize: '13px' }}>{formatDate(log.createdAt)}</td>
                                    <td style={{ fontSize: '13px', color: '#666' }}>{log.actorId || 'Hệ thống'}</td>
                                    <td>
                                        <span className="role-badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {log.entity} <br />
                                        <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal' }}>{log.entityId}</span>
                                    </td>
                                    <td style={{ fontSize: '12px', maxWidth: '200px' }}>
                                        <div><strong>IP:</strong> {log.ipAddress || 'N/A'}</div>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.userAgent}>
                                            {log.userAgent || 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {log.beforeData && (
                                                <button
                                                    onClick={() => handleViewData('Dữ liệu Cũ', log.beforeData)}
                                                    style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Xem cũ
                                                </button>
                                            )}
                                            {log.afterData && (
                                                <button
                                                    onClick={() => handleViewData('Dữ liệu Mới', log.afterData)}
                                                    style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Xem mới
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedData && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
                        <h3 style={{ marginTop: 0 }}>{selectedData.title}</h3>
                        <pre style={{
                            backgroundColor: '#1e293b',
                            color: '#e2e8f0',
                            padding: '15px',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            fontSize: '13px',
                            lineHeight: '1.5'
                        }}>
                            {JSON.stringify(selectedData.data, null, 2)}
                        </pre>
                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button className="modal-btn cancel" onClick={() => setSelectedData(null)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAuditLog;
