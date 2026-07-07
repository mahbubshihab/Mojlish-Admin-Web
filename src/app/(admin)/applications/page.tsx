'use client';
import { useState } from 'react';

interface Application {
  id: number;
  name: string;
  phone: string;
  district: string;
  profession: string;
  age: string;
  facebook?: string;
  date: string;
}

export default function ApplicationsPage() {
  const [applications] = useState<Application[]>([
    { id: 1, name: 'আব্দুল্লাহ আল নোমান', phone: '০১৭১২৩৪৫৬৭৮', district: 'ঢাকা', profession: 'ছাত্র', age: '২২', facebook: 'facebook.com/noman', date: '২০২৬-০৭-০৮' },
    { id: 2, name: 'রাকিবুল হাসান', phone: '০১৯৮৭৬৫৪৩২১', district: 'সিলেট', profession: 'চাকরিজীবী', age: '২৮', facebook: 'facebook.com/rakib', date: '২০২৬-০৭-০৭' },
    { id: 3, name: 'তামিম ইকবাল', phone: '০১৮২২৩৩৪৪৫৫', district: 'চট্টগ্রাম', profession: 'ব্যবসায়ী', age: '৩৫', date: '২০২৬-০৭-০৬' },
    { id: 4, name: 'সাকিব আল হাসান', phone: '০১৬৬৬৭৭৮৮৯৯', district: 'মাগুরা', profession: 'ছাত্র', age: '২০', facebook: 'facebook.com/sakib', date: '২০২৬-০৭-০ shadow' },
    { id: 5, name: 'মাহমুদুল্লাহ রিয়াদ', phone: '০১৫৫৫৪৪৩৩২২', district: 'ময়মনসিংহ', profession: 'চাকরিজীবী', age: '৩২', date: '২০২৬-০৭-০৪' },
    { id: 6, name: 'মুশফিকুর রহিম', phone: '০১৭৭৭৮৮৮৯৯৯', district: 'বগুড়া', profession: 'ছাত্র', age: '২১', date: '২০২৬-০৭-০৩' },
    { id: 7, name: 'তাসকিন আহমেদ', phone: '০১৮৮৮৯৯৯০০০', district: 'ঢাকা', profession: 'ব্যবসায়ী', age: '২৭', date: '২০২৬-০৭-০২' },
    { id: 8, name: 'মেহেদী হাসান মিরাজ', phone: '০১৯৯৯০০০১১১', district: 'খুলনা', profession: 'ছাত্র', age: '২৩', date: '২০২৬-০৭-০১' },
    { id: 9, name: 'মুস্তাফিজুর রহমান', phone: '০制造৭৭৭২২', district: 'সাতক্ষীরা', profession: 'ছাত্র', age: '২৪', date: '২০২৬-০৬-৩০' },
    { id: 10, name: 'লিটন দাস', phone: '০১৮৮৮৩৩৩৩২২', district: 'দিনাজপুর', profession: 'চাকরিজীবী', age: '২৯', date: '২০২৬-০৬-২৯' },
    { id: 11, name: 'নাজমুল হোসেন শান্ত', phone: '০১৯৯৯৪৪৪৪৩৩', district: 'রাজশাহী', profession: 'ছাত্র', age: '২২', date: '২০২৬-০৬-২৮' },
    { id: 12, name: 'শরিফুল ইসলাম', phone: '০১৬৬৬৫৫৫৫৪৪', district: 'পঞ্চগড়', profession: 'ছাত্র', age: '২০', date: '২০২৬-০৬-২৭' },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const itemsPerPage = 10;

  // Pagination calculations
  const totalItems = applications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = applications.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>সদস্যপদ আবেদন সমূহ</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>মোবাইল অ্যাপ থেকে আসা সকল আবেদনের সংক্ষিপ্ত তালিকা</p>
        </div>
        <button className="btn btn-primary"><i className="fa-solid fa-download"></i> এক্সপোর্ট (CSV)</button>
      </div>

      <div style={{ maxWidth: '300px', marginBottom: '20px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-color)', padding: '16px 20px', marginBottom: 0 }}>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', fontWeight: '600' }}>সর্বমোট আবেদন সংখ্যা</p>
          <h2 style={{ fontSize: '32px', margin: '6px 0', color: 'var(--text-dark)', fontWeight: '800' }}>{totalItems}</h2>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                <th style={{ padding: '16px 12px' }}>আবেদনকারীর নাম</th>
                <th style={{ padding: '16px 12px' }}>আবেদনের তারিখ</th>
                <th style={{ padding: '16px 12px', textAlign: 'right' }}>বিস্তারিত</th>
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
                  <td style={{ padding: '16px 12px', color: 'var(--text-light)' }}>{app.date}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <button 
                      className="btn" 
                      style={{ background: '#f1f5f9', color: 'var(--primary-dark)', padding: '6px 14px', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      ভিউ ডিটেইলস
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
            মোট {totalItems} টি আবেদনের মধ্যে {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} দেখানো হচ্ছে
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(prev => Math.max(prev - 1, 1));
              }}
              disabled={currentPage === 1}
              className="btn"
              style={{ background: '#f1f5f9', color: currentPage === 1 ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <i className="fa-solid fa-chevron-left"></i> পূর্ববর্তী
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
              }}
              disabled={currentPage === totalPages}
              className="btn"
              style={{ background: '#f1f5f9', color: currentPage === totalPages ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              পরবর্তী <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
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
                <i className="fa-solid fa-xmark"></i>
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
                    <a href={`https://${selectedApp.facebook}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <i className="fa-brands fa-facebook"></i> {selectedApp.facebook}
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
