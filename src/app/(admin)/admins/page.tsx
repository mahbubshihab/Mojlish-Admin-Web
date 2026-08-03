'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import CustomModal from '@/components/CustomModal';
import { isSuperAdmin } from '@/components/AdminGuard';

interface AdminUserDoc {
  id: string;
  email: string;
  addedBy?: string;
  createdAt?: any;
}

const HIDDEN_SUPER_ADMINS = [
  'magician290@gmail.com',
  'xlshihab9@gmail.com',
];

export default function AdminsPage() {
  const currentUser = auth.currentUser;
  const userIsSuperAdmin = isSuperAdmin(currentUser?.email);
  const [adminList, setAdminList] = useState<AdminUserDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'allowed_admins'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: AdminUserDoc[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const email = (data.email || docSnap.id).toLowerCase().trim();
          
          // 🛑 CRITICAL SECURITY & PRIVACY RULE: Never show Super Admin emails in the UI!
          if (!HIDDEN_SUPER_ADMINS.includes(email)) {
            docs.push({
              id: docSnap.id,
              email: email,
              addedBy: data.addedBy || 'সুপার এডমিন',
              createdAt: data.createdAt,
            });
          }
        });
        setAdminList(docs);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching admin list:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'ভুল ইমেইল ফরম্যাট',
        message: 'অনুগ্রহ করে একটি সঠিক ও বৈধ ইমেইল এড্রেস প্রদান করুন।',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    if (HIDDEN_SUPER_ADMINS.includes(cleanEmail)) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'ইমেইল পূর্বে নিবন্ধিত',
        message: 'এই ইমেইলটি সুপার অ্যাডমিন হিসেবে পূর্বে থেকেই অনুমোদিত।',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
      setNewEmail('');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create or update doc in 'allowed_admins'
      await setDoc(doc(db, 'allowed_admins', cleanEmail), {
        email: cleanEmail,
        addedBy: currentUser?.email || 'Super Admin',
        createdAt: serverTimestamp(),
        active: true,
      });

      setNewEmail('');
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'অ্যাডমিন যুক্ত করা হয়েছে',
        message: `${cleanEmail} সফলভাবে অ্যাডমিন হিসেবে যুক্ত করা হয়েছে। এই অ্যাকাউন্ট থেকে অ্যাডমিন প্যানেলে সাইন-ইন করা যাবে।`,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } catch (err: any) {
      console.error('Error adding admin:', err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'যুক্ত করতে ব্যর্থ',
        message: 'অ্যাডমিন ইমেইল যুক্ত করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (admin: AdminUserDoc) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'অ্যাডমিন সরান',
      message: `আপনি কি নিশ্চিত যে (${admin.email}) অ্যাকাউন্টটির অ্যাডমিন অ্যাক্সেস বাতিল করতে চান?`,
      onConfirm: () => confirmDeleteAdmin(admin.id, admin.email)
    });
  };

  const confirmDeleteAdmin = async (docId: string, email: string) => {
    try {
      await deleteDoc(doc(db, 'allowed_admins', docId));
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'অ্যাক্সেস বাতিল করা হয়েছে',
        message: `${email} এর অ্যাডমিন অ্যাক্সেস সফলভাবে বাতিল করা হয়েছে।`,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } catch (err: any) {
      console.error('Error deleting admin:', err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'বাতিল করতে ব্যর্থ',
        message: 'অ্যাডমিন অ্যাক্সেস বাতিল করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'আজকে';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'অজানা তারিখ';
    }
  };

  if (!userIsSuperAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          margin: '0 auto 16px'
        }}>
          <i className="fa-solid fa-lock" />
        </div>
        <h2 style={{ color: '#F8FAFC', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
          অনুমোদনহীন পৃষ্ঠা
        </h2>
        <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
          শুধুমাত্র প্রধান সুপার অ্যাডমিনগণ অ্যাডমিন অ্যাকাউন্ট যুক্ত ও অ্যাক্সেস পরিচালনা করতে পারবেন।
        </p>
      </div>
    );
  }

  return (
    <div>
      <CustomModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#F8FAFC', fontSize: '28px', fontWeight: 'bold' }}>অ্যাডমিন অ্যাকাউন্টস</h1>
        <p style={{ color: '#94A3B8', marginTop: '6px' }}>
          নতুন অ্যাডমিন ইমেইল যুক্ত করুন ও অ্যাক্সেস প্রাপ্ত অ্যাকাউন্টসমূহ পরিচালনা করুন
        </p>
      </div>

      {/* Add Admin Form Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F8FAFC', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-user-plus" style={{ color: '#10B981' }} />
          <span>নতুন অ্যাডমিন যোগ করুন</span>
        </h3>

        <form onSubmit={handleAddAdmin} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="অ্যাডমিনের ইমেইল এড্রেস লিখুন (যেমন: name@gmail.com)"
            style={{ 
              flex: 1, 
              minWidth: '260px',
              padding: '14px 16px', 
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'rgba(30, 41, 59, 0.5)',
              color: '#F8FAFC'
            }}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '14px 24px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              opacity: isSubmitting ? 0.8 : 1
            }}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                <span>যুক্ত করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-plus" />
                <span>অ্যাডমিন যোগ করুন</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Admin List Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-users-gear" style={{ color: '#0EA5E9' }} />
            <span>অ্যাডমিন তালিকা ({adminList.length})</span>
          </h3>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#10B981', marginBottom: '12px' }} />
            <p>লোড করা হচ্ছে...</p>
          </div>
        ) : adminList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
            <i className="fa-solid fa-user-shield" style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }} />
            <p>বর্তমানে অতিরিক্ত কোনো অনুমোদিত অ্যাডমিন ইমেইল যুক্ত নেই।</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94A3B8', fontSize: '13px' }}>
                  <th style={{ padding: '14px 12px' }}>ইমেইল এড্রেস</th>
                  <th style={{ padding: '14px 12px' }}>অনুমোদনকারী</th>
                  <th style={{ padding: '14px 12px' }}>যোগ করার তারিখ</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {adminList.map((admin) => (
                  <tr 
                    key={admin.id}
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                  >
                    <td style={{ padding: '14px 12px', color: '#F8FAFC', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(14, 165, 233, 0.15)',
                          color: '#0EA5E9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {admin.email[0].toUpperCase()}
                        </div>
                        <span>{admin.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#94A3B8', fontSize: '13px' }}>
                      {admin.addedBy}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#94A3B8', fontSize: '13px' }}>
                      {formatDate(admin.createdAt)}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteClick(admin)}
                        title="অ্যাডমিন অ্যাক্সেস বাতিল করুন"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#EF4444',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <i className="fa-solid fa-trash-can" />
                        <span>রিমুভ</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
