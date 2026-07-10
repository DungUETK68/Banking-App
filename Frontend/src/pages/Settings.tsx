import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Save, Trash2, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';
import '../styles/transfer.css';

const Settings = () => {
    const { user, updateUser, logout } = useAuthStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: ''
    });

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const res: any = await axiosClient.patch('/users/me', formData);
            if (res.data) {
                setSuccessMessage('Cập nhật thông tin thành công!');
                // Update zustand store user
                updateUser({ ...user, ...res.data } as any);
                setTimeout(() => setSuccessMessage(''), 4000);
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
            setTimeout(() => setErrorMessage(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'XAC NHAN') {
            alert('Vui lòng nhập chính xác chữ "XAC NHAN".');
            return;
        }

        setDeleteLoading(true);
        try {
            await axiosClient.delete('/users/me');
            alert('Tài khoản của bạn đã được vô hiệu hóa thành công.');
            logout();
            navigate('/login');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản.');
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="transfer-container">
            <div className="transfer-card" style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
                <div className="transfer-header">
                    <SettingsIcon size={28} />
                    <h2>Cài đặt tài khoản</h2>
                </div>

                {successMessage && (
                    <div className="toast-message success">
                        ✅ {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="toast-message error">
                        ⚠️ {errorMessage}
                    </div>
                )}

                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                        Thông tin cá nhân
                    </h3>

                <form onSubmit={handleUpdateProfile}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Họ và tên</label>
                        <div className="input-with-icon" style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên..."
                                required
                                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Địa chỉ Email</label>
                        <div className="input-with-icon" style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Nhập email..."
                                required
                                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Số điện thoại</label>
                        <div className="input-with-icon" style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại..."
                                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        <Save size={18} />
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </form>
            </div>

            <div style={{ backgroundColor: '#fff1f2', padding: '20px', borderRadius: '12px', marginTop: '30px', border: '1px solid #fecdd3' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={18} /> Danger Zone
                    </h3>
                    <p style={{ color: '#be123c', fontSize: '13px', marginBottom: '15px' }}>
                        Một khi bạn xóa tài khoản, bạn sẽ không thể đăng nhập lại được nữa. Tất cả dữ liệu của bạn sẽ được ẩn đi.
                        Hành động này không thể hoàn tác.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                    >
                        <Trash2 size={16} />
                        Xóa tài khoản vĩnh viễn
                    </button>
                </div>
            </div>

            {/* Modal Xóa Tài Khoản */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
                        <h3 style={{ marginTop: 0, color: '#e11d48', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={24} /> Xác nhận xóa
                        </h3>
                        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                            Bạn đang thực hiện thao tác nguy hiểm. Vui lòng nhập chữ <strong>XAC NHAN</strong> (viết hoa, không dấu) vào ô bên dưới để tiếp tục.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="XAC NHAN"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                                style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'XAC NHAN' || deleteLoading}
                                style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: (deleteConfirmText !== 'XAC NHAN' || deleteLoading) ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: (deleteConfirmText !== 'XAC NHAN' || deleteLoading) ? 0.6 : 1 }}
                            >
                                {deleteLoading ? 'Đang xóa...' : 'Xóa tài khoản'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
