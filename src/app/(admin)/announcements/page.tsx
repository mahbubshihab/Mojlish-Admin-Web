'use client';
import { useState } from 'react';

interface Announcement {
  id: number;
  title: string;
  link: string;
  date: string;
  description: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 1, title: 'আগামী মাসিক সাধারণ সভা সংক্রান্ত নোটিশ', link: 'https://khelafatmojlish.com/meeting', date: '২০২৬-০৭-০৮', description: 'খেলাফত মজলিসের সকল কর্মীকে আগামী ১৫ই জুলাইর মাসিক সাধারণ সভায় উপস্থিত থাকার অনুরোধ করা যাচ্ছে।' },
    { id: 2, title: 'নবীন সদস্য বরণ অনুষ্ঠান', link: '', date: '২০২৬-০৭-০৫', description: 'ছাত্র মজলিসের নবীন সদস্য বরণ ও পরিচিতি অনুষ্ঠান আগামী শুক্রবার অনুষ্ঠিত হবে।' },
    { id: 3, title: 'জেলা পর্যায়ের সদস্য সম্মেলন', link: 'https://khelafatmojlish.com/conference', date: '২০২৬-০৭-০৩', description: 'যুব মজলিসের ঢাকা জেলা সম্মেলন সংক্রান্ত নোটিশ।' },
    { id: 4, title: 'করোনা পরবর্তী সচেতনতা প্রচারণা', link: '', date: '২০২৬-০৬-২৮', description: 'করোনা সচেতনতা বৃদ্ধিতে লিফলেট বিতরণ কার্যক্রম।' },
    { id: 5, title: 'আইটি প্রশিক্ষণ কর্মশালা', link: 'https://khelafatmojlish.com/it-training', date: '২০২৬-০৬-২০', description: 'আইটি স্কিল ডেভেলপমেন্ট বিষয়ক ৩ দিনব্যাপী বিশেষ প্রশিক্ষণ কর্মশালা।' },
    { id: 6, title: 'ইসলামী কুইজ প্রতিযোগিতা', link: '', date: '২০২৬-০৬-১৫', description: 'আগামী সপ্তাহে দেশব্যাপী সাধারণ জ্ঞান ও ইসলামী কুইজ প্রতিযোগিতা অনুষ্ঠিত হতে যাচ্ছে।' }
  ]);

  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination calculations
  const totalItems = announcements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = announcements.slice(indexOfFirstItem, indexOfLastItem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    const newNotice: Announcement = {
      id: Date.now(),
      title,
      link,
      date: new Date().toISOString().split('T')[0],
      description
    };
    
    setAnnouncements(prev => [newNotice, ...prev]);
    setTitle('');
    setLink('');
    setDescription('');
    setCurrentPage(1);
  };

  const handleDelete = (id: number) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
    if (announcements.length - 1 <= (currentPage - 1) * itemsPerPage && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>ঘোষণা প্যানেল</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>মোবাইল অ্যাপে নতুন কোনো বিজ্ঞপ্তি বা ঘোষণা পাঠানোর মাধ্যম</p>
      </div>
      
      <div className="grid-2">
        {/* Form section */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-bullhorn" style={{ color: 'var(--primary-color)' }}></i> নতুন ঘোষণা তৈরি করুন
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>ঘোষণার শিরোনাম (Title)</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: আগামী মাসিক সভার সময়সূচী..." 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>লিংক যুক্ত করুন (অপশনাল)</label>
              <input 
                type="url" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="যেমন: https://example.com/details (যদি থাকে)" 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>বিস্তারিত বিবরণ (Description)</label>
              <textarea 
                rows={5} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="বিস্তারিত নোটিশ লিখুন..." 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '45px', fontSize: '15px' }}>ঘোষণা পাঠান</button>
          </form>
        </div>

        {/* List section with pagination */}
        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-list" style={{ color: 'var(--primary-color)' }}></i> পূর্বের ঘোষণা সমূহ
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '300px' }}>
            {currentItems.map((item) => (
              <div key={item.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '5px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}><i className="fa-regular fa-calendar"></i> {item.date}</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-dark)' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.5', marginBottom: item.link ? '10px' : '0' }}>{item.description}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
                    <i className="fa-solid fa-link"></i> বিস্তারিত লিংক দেখুন
                  </a>
                )}
                
                <button 
                  onClick={() => handleDelete(item.id)}
                  style={{ position: 'absolute', top: '16px', right: '16px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                  title="মুছে ফেলুন"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}
            {announcements.length === 0 && (
              <p style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>কোনো ঘোষণা পাঠানো হয়নি।</p>
            )}
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>
              মোট {totalItems} টি ঘোষণার মধ্যে {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} দেখানো হচ্ছে
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn"
                style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '13px', color: currentPage === 1 ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <i className="fa-solid fa-chevron-left"></i> পূর্ববর্তী
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="btn"
                style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '13px', color: currentPage === totalPages || totalPages === 0 ? '#cbd5e1' : 'var(--text-dark)', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
              >
                পরবর্তী <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
