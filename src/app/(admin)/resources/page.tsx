'use client';
import { useState } from 'react';

interface Book {
  id: number;
  name: string;
  size: string;
  date: string;
  downloads: number;
  author?: string;
}

export default function Resources() {
  // Books list state with downloads and optional authors
  const [books, setBooks] = useState<Book[]>([
    { id: 1, name: 'ইসলামী আন্দোলনের রূপরেখা.pdf', size: '৪.২ MB', date: '২০২৬-০৭-০৮', downloads: 145 },
    { id: 2, name: 'খেলাফত ব্যবস্থা: একটি পর্যালোচনা.pdf', size: '৩.৮ MB', date: '২০২৬-০৭-০৭', downloads: 98, author: 'শায়খুল হাদীস মাওলানা আজিজুল হক' },
    { id: 3, name: 'মৌলিক দ্বীনি শিক্ষা ও আচরণবিধি.pdf', size: '২.৫ MB', date: '২০২৬-০৭-০৫', downloads: 210 },
    { id: 4, name: 'ইসলামী অর্থনীতি ও যাকাত ব্যবস্থা.pdf', size: '৫.১ MB', date: '২০২৬-০৭-০২', downloads: 75, author: 'অধ্যাপক ড. আহমদ আবদুল কাদের' },
    { id: 5, name: 'নেতৃত্ব ও সাংগঠনিক শৃঙ্খলা.pdf', size: '১.৯ MB', date: '২০২৬-০৬-২৮', downloads: 120 },
    { id: 6, name: 'তাফসীরুল কুরআন সংক্ষেপ.pdf', size: '১২.৪ MB', date: '২০২৬-০৬-২৪', downloads: 350 },
    { id: 7, name: 'হাদীস সংকলন ও প্রয়োজনীয় দোয়া.pdf', size: '৩.২ MB', date: '২০২৬-০৬-২০', downloads: 185 },
    { id: 8, name: 'রাসূলের (সা.) জীবনাদর্শ ও জিহাদ.pdf', size: '৬.৭ MB', date: '২০২৬-০৬-১৫', downloads: 220 },
    { id: 9, name: 'পারিবারিক জীবন ও শিষ্টাচার.pdf', size: '২.১ MB', date: '২০২৬-০৬-১০', downloads: 140 },
    { id: 10, name: 'ইসলাম ও আধুনিক সমাজব্যবস্থা.pdf', size: '৪.৮ MB', date: '২০২৬-০৬-০৫', downloads: 165 },
    { id: 11, name: 'কুরবানী ও হজ্জের মাসায়েল.pdf', size: '৩.৫ MB', date: '২০২৬-০৫-২৮', downloads: 90 },
    { id: 12, name: 'ইসলামী জীবনপদ্ধতির রূপরেখা.pdf', size: '৫.৬ MB', date: '২০২৬-০৫-২০', downloads: 112, author: 'মাওলানা আজিজুল হক' }
  ]);

  // Book action states
  const [newBookName, setNewBookName] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookSize, setNewBookSize] = useState('৩.৫ MB'); // mock size
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingAuthor, setEditingAuthor] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination calculations
  const totalItems = books.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = books.slice(indexOfFirstItem, indexOfLastItem);

  // Add new book/PDF
  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookName.trim()) return;
    
    const nameWithExt = newBookName.toLowerCase().endsWith('.pdf') ? newBookName.trim() : `${newBookName.trim()}.pdf`;
    
    const newBook: Book = {
      id: Date.now(),
      name: nameWithExt,
      size: newBookSize || '২.০ MB',
      date: new Date().toISOString().split('T')[0],
      downloads: 0,
      author: newBookAuthor.trim() ? newBookAuthor.trim() : undefined
    };
    
    setBooks(prev => [newBook, ...prev]);
    setNewBookName('');
    setNewBookAuthor('');
    setNewBookSize('৩.৫ MB');
    setCurrentPage(1);
  };

  // Delete book
  const handleDeleteBook = (id: number) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    if (books.length - 1 <= (currentPage - 1) * itemsPerPage && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Start editing book
  const startEdit = (id: number, currentName: string, currentAuthor?: string) => {
    setEditingId(id);
    setEditingName(currentName);
    setEditingAuthor(currentAuthor || '');
  };

  // Save edited book name and author
  const saveEdit = (id: number) => {
    if (!editingName.trim()) return;
    setBooks(prev => prev.map(book => book.id === id ? { 
      ...book, 
      name: editingName.trim(),
      author: editingAuthor.trim() ? editingAuthor.trim() : undefined
    } : book));
    setEditingId(null);
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>রিসোর্স ম্যানেজমেন্ট</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>অ্যাপের ভেতর প্রদর্শনের জন্য বই এবং অন্যান্য ধর্মীয় পিডিএফ ফাইলসমূহ আপলোড ও ম্যানেজ করুন</p>
      </div>
      
      <div className="grid-2">
        {/* Upload/Add Resource Section */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i> নতুন বই/পিডিএফ আপলোড
          </h2>
          
          <form onSubmit={handleAddBook}>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '30px', textAlign: 'center', marginBottom: '20px', background: '#f8fafc' }}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '36px', color: '#94a3b8', marginBottom: '12px' }}></i>
              <p style={{ fontSize: '14px', color: 'var(--text-dark)', fontWeight: '500' }}>ফাইল এখানে ড্র্যাগ করুন অথবা ব্রাউজ করুন</p>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px' }}>সর্বোচ্চ ফাইল সাইজ: ২০ MB</p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>বইয়ের নাম/টাইটেল</label>
              <input 
                type="text" 
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="যেমন: ইসলামী আন্দোলনের রূপরেখা..." 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>লেখক/অথর (ঐচ্ছিক)</label>
              <input 
                type="text" 
                value={newBookAuthor}
                onChange={(e) => setNewBookAuthor(e.target.value)}
                placeholder="যেমন: শায়খুল হাদীস মাওলানা আজিজুল হক" 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>ফাইল সাইজ (Mock)</label>
              <input 
                type="text" 
                value={newBookSize}
                onChange={(e) => setNewBookSize(e.target.value)}
                placeholder="যেমন: ৪.৫ MB" 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '45px', fontSize: '15px' }}>আপলোড করুন</button>
          </form>
        </div>

        {/* Resources list with metadata and pagination */}
        <div className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-book-open" style={{ color: 'var(--primary-color)' }}></i> আপলোড করা বইসমূহ
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}>
            {currentBooks.map((book) => (
              <div 
                key={book.id} 
                className="resource-item"
              >
                {editingId === book.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, width: '100%' }}>
                    <input 
                      type="text" 
                      value={editingName} 
                      onChange={(e) => setEditingName(e.target.value)} 
                      placeholder="বইয়ের নাম"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--primary-color)', borderRadius: '8px', fontSize: '14px' }}
                    />
                    <input 
                      type="text" 
                      value={editingAuthor} 
                      onChange={(e) => setEditingAuthor(e.target.value)} 
                      placeholder="লেখক (ঐচ্ছিক)"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--primary-color)', borderRadius: '8px', fontSize: '14px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => saveEdit(book.id)} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>সেভ</button>
                      <button onClick={() => setEditingId(null)} className="btn" style={{ background: '#f1f5f9', padding: '6px 16px', fontSize: '13px' }}>বাতিল</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="resource-info">
                      <div style={{ width: '40px', height: '40px', background: '#fee2e2', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                        <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444', fontSize: '20px' }}></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-dark)', wordBreak: 'break-all' }}>{book.name}</h4>
                        {book.author && (
                          <p style={{ fontSize: '13px', color: 'var(--text-dark)', marginTop: '2px', fontWeight: '500' }}>
                            <i className="fa-solid fa-pen-nib"></i> লেখক: {book.author}
                          </p>
                        )}
                        <div className="resource-meta">
                          <span><i className="fa-solid fa-weight-hanging"></i> {book.size}</span>
                          <span><i className="fa-solid fa-calendar-day"></i> {book.date}</span>
                          <span><i className="fa-solid fa-download"></i> ডাউনলোড: <strong>{book.downloads} বার</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="resource-actions">
                      <button 
                        onClick={() => startEdit(book.id, book.name, book.author)}
                        style={{ color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', fontSize: '16px' }}
                        title="সম্পাদনা করুন"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteBook(book.id)}
                        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', fontSize: '16px' }}
                        title="মুছে ফেলুন"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {books.length === 0 && (
              <p style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: 'center', padding: '30px' }}>কোনো বই আপলোড করা হয়নি।</p>
            )}
          </div>

          {/* Books Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>
              মোট {totalItems} টি রিসোর্সের মধ্যে {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} দেখানো হচ্ছে
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
