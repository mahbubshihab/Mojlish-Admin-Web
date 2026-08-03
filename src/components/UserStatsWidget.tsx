'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, doc, getDoc } from 'firebase/firestore';

export default function UserStatsWidget() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalApps, setTotalApps] = useState<number | null>(null);
  const [totalNotices, setTotalNotices] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // 1. Total Users Count via Firestore Server Aggregation (Cost: 1 Document Read Total)
      let userCount = 0;
      try {
        const userSnapshot = await getCountFromServer(collection(db, 'users'));
        userCount = userSnapshot.data().count;
      } catch (err) {
        // Fallback to stats/users_count document if collection query blocked
        const statsDoc = await getDoc(doc(db, 'stats', 'users_count'));
        if (statsDoc.exists()) {
          userCount = statsDoc.data().totalUsers || 0;
        }
      }
      setTotalUsers(userCount);

      // 2. Total Applications Count (Cost: 1 Document Read)
      try {
        const appSnapshot = await getCountFromServer(collection(db, 'member_applications'));
        setTotalApps(appSnapshot.data().count);
      } catch (_) {
        setTotalApps(0);
      }

      // 3. Total Notifications Count (Cost: 1 Document Read)
      try {
        const noticeSnapshot = await getCountFromServer(collection(db, 'notifications'));
        setTotalNotices(noticeSnapshot.data().count);
      } catch (_) {
        setTotalNotices(0);
      }

    } catch (error) {
      console.error('Error fetching server aggregation stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    }}>
      {/* 1. Total Users Card */}
      <div className="card" style={{
        margin: 0,
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(15,23,42,0.7) 100%)',
        border: '1px solid rgba(16,185,129,0.3)',
        boxShadow: '0 8px 32px rgba(16,185,129,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          backgroundColor: 'rgba(16,185,129,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10B981',
          fontSize: '22px',
          border: '1px solid rgba(16,185,129,0.4)'
        }}>
          <i className="fa-solid fa-users" />
        </div>
        <div>
          <p style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600, margin: 0 }}>
            মোট অ্যাপ ব্যবহারকারী
          </p>
          <h3 style={{ color: '#F8FAFC', fontSize: '26px', fontWeight: 800, margin: '2px 0 0 0' }}>
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '18px', color: '#10B981' }} />
            ) : (
              (totalUsers ?? 0).toLocaleString('bn-BD')
            )}
          </h3>
        </div>
      </div>

      {/* 2. Total Member Applications Card */}
      <div className="card" style={{
        margin: 0,
        background: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(15,23,42,0.7) 100%)',
        border: '1px solid rgba(14,165,233,0.3)',
        boxShadow: '0 8px 32px rgba(14,165,233,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          backgroundColor: 'rgba(14,165,233,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0EA5E9',
          fontSize: '22px',
          border: '1px solid rgba(14,165,233,0.4)'
        }}>
          <i className="fa-solid fa-id-card" />
        </div>
        <div>
          <p style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600, margin: 0 }}>
            সদস্যপদ আবেদন
          </p>
          <h3 style={{ color: '#F8FAFC', fontSize: '26px', fontWeight: 800, margin: '2px 0 0 0' }}>
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '18px', color: '#0EA5E9' }} />
            ) : (
              (totalApps ?? 0).toLocaleString('bn-BD')
            )}
          </h3>
        </div>
      </div>

      {/* 3. Total Notifications Card */}
      <div className="card" style={{
        margin: 0,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(15,23,42,0.7) 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          backgroundColor: 'rgba(99,102,241,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6366F1',
          fontSize: '22px',
          border: '1px solid rgba(99,102,241,0.4)'
        }}>
          <i className="fa-solid fa-bullhorn" />
        </div>
        <div>
          <p style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600, margin: 0 }}>
            মোট ঘোষণা ও নোটিশ
          </p>
          <h3 style={{ color: '#F8FAFC', fontSize: '26px', fontWeight: 800, margin: '2px 0 0 0' }}>
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '18px', color: '#6366F1' }} />
            ) : (
              (totalNotices ?? 0).toLocaleString('bn-BD')
            )}
          </h3>
        </div>
      </div>
    </div>
  );
}
