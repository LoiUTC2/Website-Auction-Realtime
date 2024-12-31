import React, { useState } from 'react';
import { Bell, User, ArrowLeft } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'system', read: false, message: 'System maintenance scheduled for tonight', time: '2 hours ago' },
  { id: 2, type: 'personal', read: false, message: 'You have a new message from John', time: '3 hours ago' },
  { id: 3, type: 'system', read: true, message: 'Your account has been verified', time: '1 day ago' },
  { id: 4, type: 'personal', read: true, message: 'New friend suggestion: Jane Doe', time: '2 days ago' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('unread');

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const NotificationItem = ({ notification }) => (
    <div className={`mb-4 p-4 rounded-lg transition-all duration-200 ${
      notification.read ? 'bg-gray-50' : 'bg-white shadow-md'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${
          notification.type === 'system' ? 'bg-blue-100' : 'bg-green-100'
        }`}>
          {notification.type === 'system' ? (
            <Bell className="h-5 w-5 text-blue-600" />
          ) : (
            <User className="h-5 w-5 text-green-600" />
          )}
        </div>
        <div className="flex-grow">
          <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold ml-3">Notifications</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'unread' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread ({unreadNotifications.length})
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'read'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Read ({readNotifications.length})
            </button>
          </div>

          <div className="p-4">
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {activeTab === 'unread' ? (
                unreadNotifications.length > 0 ? (
                  unreadNotifications.map(notification => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No unread notifications</p>
                )
              ) : (
                readNotifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}