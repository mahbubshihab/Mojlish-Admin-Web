'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface Application {
  id: string;
  name: string;
  phone: string;
  district: string;
  profession: string;
  age: string;
  facebook?: string;
  date: string;
  majlis?: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const itemsPerPage = 10;

  // Real-time subscription to Firestore `member_applications` collection
  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'member_applications'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedApps: Application[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedApps.push({
            id: docSnap.id,
            name: data.name || 'নাম বিহীন',
            phone: data.phone || 'N/A',
            district: data.district || 'অজানা',
            profession: data.profession || 'N/A',
            age: data.age || 'N/A',
            facebook: data.facebook || '',
            majlis: data.majlis || 'সকল',
            date: data.createdAt
              ? data.createdAt.toDate().toLocaleDateString('bn-BD', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'সদ্য',
          });
        });
        setApplications(fetchedApps);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching member applications:', error);
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('আপনি কি নিশ্চিত যে এই আবেদনটি মুছে ফেলতে চান?')) return;

    try {
      await deleteDoc(doc(db, 'member_applications', id));
      if (selectedApp?.id === id) setSelectedApp(null);
    } catch (err) {
      console.error('Error deleting application:', err);
      alert('আবেদনটি মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  const exportCSV = () => {
    if (applications.length === 0) {
      alert('এক্সপোর্ট করার মতো কোনো আবেদন ডাটা নেই।');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>সদস্যপদ আবেদন সমূহ</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>মোবাইল অ্যাপ থেকে আসা সকল সদস্যপদ আবেদনের রিয়েল-টাইম তালিকা</p>
        </div>
        <button onClick={exportCSV} className="btn btn-primary">
          <i className="fa-solid fa-download"></i> এক্সপোর্ট (CSV)
        </button>
      </div>

      <div style={{ maxWidth: '300px', marginBottom: '20px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-color)', padding: '16px 20px', marginBottom: 0 }}>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', fontWeight: '600' }}>সর্বমোট আবেদন সংখ্যা</p>
          <h2 style={{ fontSize: '32px', margin: '6px 0', color: 'var(--text-dark)', fontWeight: '800' }}>{totalItems}</h2>
        </div>
      </div>

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
                    <th style={{ padding: '16px 12px' }}>ফোন নাম্বার</th>
                    <th style={{ padding: '16px 12px' }}>জেলা</th>
                    <th style={{ padding: '16px 12px' }}>আবেদনের তারিখ</th>
                    <th style={{ padding: '16px 12px', textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((app) => (
                    <tr 
                      key={app.id} 
                      style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                      onClick={() => setSelectedApp(app)}
                    >
                      <td style={{ padding: '16px 12px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{app.name}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-dark)' }}>{app.phone}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-light)' }}>{app.district}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-light)' }}>{app.date}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <button 
                          className="btn" 
                          style={{ background: '#f1f5f9', color: 'var(--primary-dark)', padding: '6px 14px', fontSize: '13px', fontWeight: 'bold', marginRight: '8px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApp(app);
                          }}
                        >
                          ভিউ ডিটেইলস
                        </button>
                        <button
                          className="btn"
                          style={{ background: '#fee2e2', color: '#ef4444', padding: '6px 10px', fontSize: '13px' }}
                          onClick={(e) => handleDelete(app.id, e)}
                          title="মুছে ফেলুন"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                  মোট {totalItems} টি আবেদনের মধ্যে {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} দেখানো হচ্ছে
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn"
                    style={{ background: '#f1f5f9', color: currentPage === 1 ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <i className="fa-solid fa-chevron-left" /> পূর্ববর্তী
                  </button>
                  <button 
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn"
                    style={{ background: '#f1f5f9', color: currentPage === totalPages ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    পরবর্তী <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dedicated View Details Drawer/Modal */}
      {selectedApp && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedApp(null)}
        >
          <div 
            style={{
              background: 'white',
              width: '100%',
              maxWidth: '550px',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: 'var(--primary-color)', padding: '20px 24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>আবেদনকারীর বিস্তারিত তথ্য</h2>
              <button 
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 'bold' }}>আবেদনকারীর নাম</span>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-dark)', marginTop: '4px' }}>{selectedApp.name}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 'bold' }}>মোবাইল নাম্বার</span>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', marginTop: '4px' }}>{selectedApp.phone}</p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 'bold' }}>বয়স</span>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', marginTop: '4px' }}>{selectedApp.age} বছর</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 'bold' }}>পেশা</span>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', marginTop: '4px' }}>{selectedApp.profession}</p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 'bold' }}>জেলা</span>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', marginTop: '4px' }}>{selectedApp.district}</p>
                </div>
              </div>

              {selectedApp.facebook && (
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 'bold' }}>ফেসবুক প্রোফাইল</span>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--primary-dark)', marginTop: '4px' }}>
                    <a href={selectedApp.facebook.startsWith('http') ? selectedApp.facebook : `https://${selectedApp.facebook}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <i className="fa-brands fa-facebook" /> {selectedApp.facebook}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 'bold' }}>আবেদনের তারিখ</span>
                <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', marginTop: '4px' }}>{selectedApp.date}</p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => setSelectedApp(null)} 
                className="btn" 
                style={{ background: '#cbd5e1', color: 'var(--text-dark)' }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
