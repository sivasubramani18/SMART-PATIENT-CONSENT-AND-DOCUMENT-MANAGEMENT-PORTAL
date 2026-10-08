import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Bell,
  Check,
  CheckCheck,
  FileCheck2,
  FileText,
  AlertTriangle,
  Flame,
  Info,
  X,
  ExternalLink
} from 'lucide-react';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail on polling
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 25 seconds for live healthcare activity updates
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, [user]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => {
        const item = notifications.find((n) => n._id === id);
        return item && !item.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'CONSENT_REQUEST':
        return <FileCheck2 className="w-4 h-4 text-amber-600" />;
      case 'CONSENT_ACCEPTED':
        return <Check className="w-4 h-4 text-emerald-600" />;
      case 'CONSENT_REJECTED':
        return <X className="w-4 h-4 text-rose-600" />;
      case 'DOCUMENT_UPLOAD':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'SECURITY_ALERT':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'EMERGENCY_ACCESS':
        return <Flame className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        title="In-App Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-600 text-white text-[10px] font-bold items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-teal-100 text-teal-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-600">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No notifications or consent alerts at this time.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleMarkAsRead(item._id, item.link)}
                  className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 relative group ${
                    !item.read ? 'bg-teal-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold truncate ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-400">
                        {formatTime(item.createdAt)}
                      </span>
                      {item.link && (
                        <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-0.5">
                          Open <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 ml-auto"></span>
                      )}
                    </div>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, item._id)}
                    className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
