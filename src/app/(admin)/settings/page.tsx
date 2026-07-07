'use client';
import { useState } from 'react';

export default function Settings() {
  const [socialLinks, setSocialLinks] = useState({
    facebook: { active: true, url: 'https://facebook.com/groups/mojlish' },
    youtube: { active: true, url: 'https://youtube.com/mojlishofficial' },
    twitter: { active: false, url: 'https://x.com/mojlish' },
    website: { active: true, url: 'https://khelafatmojlish.com' },
  });

  const toggleLink = (key: keyof typeof socialLinks) => {
    setSocialLinks(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>সোশ্যাল মিডিয়া সেটিংস</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>মোবাইল অ্যাপে প্রদর্শন করার জন্য সোশ্যাল মিডিয়া লিংক ও টগল সেটিংস</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-share-nodes" style={{ color: 'var(--primary-color)' }}></i> সোশ্যাল মিডিয়া লিংকসমূহ
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '24px' }}>
          যেকোনো প্ল্যাটফর্মের বাটন অফ করলে সেটি ইউজারের মোবাইল অ্যাপে আর শো করবে না।
        </p>

        {/* Facebook Group */}
        <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <i className="fa-brands fa-facebook" style={{ color: '#1877F2', fontSize: '20px' }}></i> ফেসবুক গ্রুপ
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={socialLinks.facebook.active}
                onChange={() => toggleLink('facebook')}
                style={{
                  width: '40px',
                  height: '20px',
                  appearance: 'none',
                  backgroundColor: socialLinks.facebook.active ? 'var(--primary-color)' : '#cbd5e1',
                  borderRadius: '20px',
                  position: 'relative',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                className="toggle-switch"
              />
              <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: socialLinks.facebook.active ? 'var(--primary-dark)' : 'var(--text-light)' }}>
                {socialLinks.facebook.active ? 'চালু' : 'বন্ধ'}
              </span>
            </div>
          </div>
          <input 
            type="url" 
            defaultValue={socialLinks.facebook.url} 
            placeholder="ফেসবুক গ্রুপের লিংক লিখুন"
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
            disabled={!socialLinks.facebook.active} 
          />
        </div>

        {/* YouTube Channel */}
        <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <i className="fa-brands fa-youtube" style={{ color: '#FF0000', fontSize: '20px' }}></i> ইউটিউব চ্যানেল
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={socialLinks.youtube.active}
                onChange={() => toggleLink('youtube')}
                style={{
                  width: '40px',
                  height: '20px',
                  appearance: 'none',
                  backgroundColor: socialLinks.youtube.active ? 'var(--primary-color)' : '#cbd5e1',
                  borderRadius: '20px',
                  position: 'relative',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              />
              <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: socialLinks.youtube.active ? 'var(--primary-dark)' : 'var(--text-light)' }}>
                {socialLinks.youtube.active ? 'চালু' : 'বন্ধ'}
              </span>
            </div>
          </div>
          <input 
            type="url" 
            defaultValue={socialLinks.youtube.url} 
            placeholder="ইউটিউব চ্যানেলের লিংক লিখুন"
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
            disabled={!socialLinks.youtube.active} 
          />
        </div>

        {/* Twitter */}
        <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <i className="fa-brands fa-x-twitter" style={{ color: '#000000', fontSize: '20px' }}></i> টুইটার (X)
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={socialLinks.twitter.active}
                onChange={() => toggleLink('twitter')}
                style={{
                  width: '40px',
                  height: '20px',
                  appearance: 'none',
                  backgroundColor: socialLinks.twitter.active ? 'var(--primary-color)' : '#cbd5e1',
                  borderRadius: '20px',
                  position: 'relative',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              />
              <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: socialLinks.twitter.active ? 'var(--primary-dark)' : 'var(--text-light)' }}>
                {socialLinks.twitter.active ? 'চালু' : 'বন্ধ'}
              </span>
            </div>
          </div>
          <input 
            type="url" 
            defaultValue={socialLinks.twitter.url} 
            placeholder="টুইটার লিংক লিখুন"
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
            disabled={!socialLinks.twitter.active} 
          />
        </div>

        {/* Website */}
        <div style={{ marginBottom: '30px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <i className="fa-solid fa-globe" style={{ color: 'var(--primary-color)', fontSize: '20px' }}></i> ওয়েবসাইট লিংক
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={socialLinks.website.active}
                onChange={() => toggleLink('website')}
                style={{
                  width: '40px',
                  height: '20px',
                  appearance: 'none',
                  backgroundColor: socialLinks.website.active ? 'var(--primary-color)' : '#cbd5e1',
                  borderRadius: '20px',
                  position: 'relative',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              />
              <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: socialLinks.website.active ? 'var(--primary-dark)' : 'var(--text-light)' }}>
                {socialLinks.website.active ? 'চালু' : 'বন্ধ'}
              </span>
            </div>
          </div>
          <input 
            type="url" 
            defaultValue={socialLinks.website.url} 
            placeholder="অফিসিয়াল ওয়েবসাইটের লিংক লিখুন"
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} 
            disabled={!socialLinks.website.active} 
          />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px' }}>সেটিংস সেভ করুন</button>
      </div>

      <style jsx global>{`
        /* Inline Switch slider styles for standard input type checkbox */
        input[type="checkbox"] {
          position: relative;
        }
        input[type="checkbox"]::before {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          background-color: white;
          transition: transform 0.2s;
        }
        input[type="checkbox"]:checked::before {
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
}
