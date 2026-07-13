import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Save, Settings as SettingsIcon } from 'lucide-react';
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

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

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

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordSuccess('');
        setPasswordError('');

        try {
            const res: any = await axiosClient.post('/auth/change-password', passwordData);
            if (res.data) {
                setPasswordSuccess(res.data.message || 'Đổi mật khẩu thành công!');
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            }
        } catch (error: any) {
            setPasswordError(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
            setTimeout(() => setPasswordError(''), 4000);
        } finally {
            setPasswordLoading(false);
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

            <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    Đổi mật khẩu
                </h3>
                
                {passwordSuccess && (
                    <div className="toast-message success" style={{ marginBottom: '15px' }}>
                        ✅ {passwordSuccess}
                    </div>
                )}
                {passwordError && (
                    <div className="toast-message error" style={{ marginBottom: '15px' }}>
                        ⚠️ {passwordError}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            placeholder="Nhập mật khẩu hiện tại..."
                            required
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Mật khẩu mới</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Nhập mật khẩu mới..."
                            required
                            minLength={6}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: passwordLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
        </div>
    );
};

export default Settings;
