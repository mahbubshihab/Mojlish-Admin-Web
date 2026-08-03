'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import UserStatsWidget from '@/components/UserStatsWidget';
import CustomModal from '@/components/CustomModal';

interface Application {
  id: string;
  name: string;
  phone: string;
  majlis: string;
  district: string;
  profession: string;
  age: string;
  facebook: string;
  date: string;
  address?: string;
  notes?: string;
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm' | 'info';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'member_applications'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: Application[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          docs.push({
            id: docSnap.id,
            name: data.name || data.fullName || 'নামহীন',
            phone: data.phone || data.mobile || 'N/A',
            majlis: data.majlis || 'খেলাফত মজলিস',
            district: data.district || data.city || 'N/A',
            profession: data.profession || data.occupation || 'N/A',
            age: data.age ? `${data.age} বছর` : 'N/A',
            facebook: data.facebook || 'N/A',
            date: data.createdAt ? data.createdAt.toDate().toLocaleDateString('bn-BD', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'সদ্য',
            address: data.address || '',
            notes: data.notes || '',
          });
        });
        setApplications(docs);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching applications:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Pagination calculations
  const totalItems = applications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = applications.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteRequest = (app: Application, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'আবেদন মুছে ফেলা',
      message: `আপনি কি নিশ্চিত যে "${app.name}" এর সদস্যপদ আবেদনটি চিরতরে মুছে ফেলতে চান?`,
      confirmText: 'হ্যাঁ, মুছে ফেলুন',
      cancelText: 'বাতিল',
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteDoc(doc(db, 'member_applications', app.id));
          if (selectedApp?.id === app.id) setSelectedApp(null);
        } catch (err: any) {
          console.error('Error deleting application:', err);
          setTimeout(() => {
            setModalConfig({
              isOpen: true,
              type: 'error',
              title: 'ত্রুটি',
              message: 'আবেদনটি মুছে ফেলা সম্ভব হয়নি।',
              confirmText: 'ঠিক আছে',
              onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
          }, 300);
        }
      },
      onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  };

  const exportCSV = () => {
    if (applications.length === 0) {
      setModalConfig({
        isOpen: true,
        type: 'info',
        title: 'ডাটা পাওয়া যায়নি',
        message: 'এক্সপোর্ট করার মতো কোনো সদস্যপদ আবেদন ডাটা নেই।',
        confirmText: 'ঠিক আছে',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    const headers = ['নাম,ফোন,জেলা,পেশা,বয়স,ফেসবুক,তারিখ\n'];
    const rows = applications.map(
      (a) => `"${a.name}","${a.phone}","${a.district}","${a.profession}","${a.age}","${a.facebook}","${a.date}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `member_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Custom Glassmorphic Modal */}
      <CustomModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>সদস্যপদ আবেদন সমূহ</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '6px' }}>মোবাইল অ্যাপ থেকে আসা সকল সদস্যপদ আবেদনের রিয়েল-টাইম তালিকা</p>
        </div>
        <button onClick={exportCSV} className="btn btn-primary">
          <i className="fa-solid fa-download"></i> এক্সপোর্ট (CSV)
        </button>
      </div>

      <UserStatsWidget />

      <div className="card">
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }} />
            <p>আবেদন তালিকা লোড করা হচ্ছে...</p>
          </div>
        ) : totalItems === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-dark)' }}>কোনো সদস্যপদ আবেদন পাওয়া যায়নি</h3>
            <p style={{ fontSize: '14px', marginTop: '6px' }}>মোবাইল অ্যাপ থেকে ব্যবহারকারীরা আবেদন জমা দিলে তা এখানে দেখাবে।</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                    <th style={{ padding: '16px 12px' }}>আবেদনকারীর নাম</th>
                    <th style={{ padding: '16px 12px' }}>সংগঠন/মজলিস</th>
                    <th style={{ padding: '16px 12px' }}>ফোন নম্বর</th>
                    <th style={{ padding: '16px 12px' }}>জেলা</th>
                    <th style={{ padding: '16px 12px' }}>পেশা</th>
                    <th style={{ padding: '16px 12px' }}>তারিখ</th>
                    <th style={{ padding: '16px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((app) => (
                    <tr 
                      key={app.id} 
                      onClick={() => setSelectedApp(app)}
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        backgroundColor: selectedApp?.id === app.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '16px 12px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{app.name}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          background: 'rgba(16, 185, 129, 0.15)', 
                          color: '#10B981', 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontSize: '12px', 
                          fontWeight: 'bold' 
                        }}>
                          {app.majlis}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-dark)' }}>{app.phone}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-light)' }}>{app.district}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-light)' }}>{app.profession}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-light)', fontSize: '13px' }}>{app.date}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <button 
                          onClick={(e) => handleDeleteRequest(app, e)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>
                  মোট {totalItems} টি আবেদনের মধ্যে {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} দেখানো হচ্ছে
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn"
                    style={{ background: '#f1f5f9', padding: '6px 14px', fontSize: '13px', color: currentPage === 1 ? '#94a3b8' : 'var(--text-dark)' }}
                  >
                    <i className="fa-solid fa-chevron-left"></i> পূর্ববর্তী
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn"
                    style={{ background: '#f1f5f9', padding: '6px 14px', fontSize: '13px', color: currentPage === totalPages ? '#94a3b8' : 'var(--text-dark)' }}
                  >
                    পরবর্তী <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setSelectedApp(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: 'var(--text-light)',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-dark)' }}>
              আবেদনের বিস্তারিত তথ্য
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>আবেদনকারীর নাম</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{selectedApp.name}</span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>মোবাইল নম্বর</span>
                <span style={{ fontSize: '15px', color: 'var(--text-dark)' }}>{selectedApp.phone}</span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>জেলা / অবস্থান</span>
                <span style={{ fontSize: '15px', color: 'var(--text-dark)' }}>{selectedApp.district}</span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>পেশা</span>
                <span style={{ fontSize: '15px', color: 'var(--text-dark)' }}>{selectedApp.profession}</span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>বয়স</span>
                <span style={{ fontSize: '15px', color: 'var(--text-dark)' }}>{selectedApp.age}</span>
              </div>

              {selectedApp.facebook && (
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>ফেসবুক প্রোফাইল</span>
                  <a href={selectedApp.facebook} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', fontSize: '14px', wordBreak: 'break-all' }}>
                    {selectedApp.facebook}
                  </a>
                </div>
              )}

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>জমা দেওয়ার তারিখ</span>
                <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>{selectedApp.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
