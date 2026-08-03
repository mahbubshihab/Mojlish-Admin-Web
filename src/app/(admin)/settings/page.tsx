'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface SocialLinkItem {
  active: boolean;
  url: string;
}

interface SocialLinksState {
  facebook: SocialLinkItem;
  youtube: SocialLinkItem;
  twitter: SocialLinkItem;
  website: SocialLinkItem;
}

const DEFAULT_LINKS: SocialLinksState = {
  facebook: { active: true, url: 'https://facebook.com/groups/mojlish' },
  youtube: { active: true, url: 'https://youtube.com/mojlishofficial' },
  twitter: { active: false, url: 'https://x.com/mojlish' },
  website: { active: true, url: 'https://khelafatmojlish.com' },
};

export default function Settings() {
  const [socialLinks, setSocialLinks] = useState<SocialLinksState>(DEFAULT_LINKS);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Real-time sync with Firestore `settings/social_links`
  useEffect(() => {
    const docRef = doc(db, 'settings', 'social_links');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SocialLinksState;
        setSocialLinks(data);
      }
    }, (err) => {
      console.error('Error loading social links from Firestore:', err);
    });

    return () => unsubscribe();
  }, []);

  const toggleLink = (key: keyof SocialLinksState) => {
    if (!isEditing) return; // Prevent toggle when locked
    setSocialLinks(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  const handleUrlChange = (key: keyof SocialLinksState, url: string) => {
    if (!isEditing) return;
    setSocialLinks(prev => ({
      ...prev,
      [key]: { ...prev[key], url }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    setIsSaving(true);
    setSuccessMessage('');
    try {
      await setDoc(doc(db, 'settings', 'social_links'), socialLinks);
      setSuccessMessage('সোশ্যাল মিডিয়া সেটিংস সফলভাবে আপডেট ও সেভ হয়েছে!');
      setIsEditing(false); // Lock again after saving
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error saving social links:', err);
      alert(`সেটিংস সেভ করতে সমস্যা হয়েছে: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '28px', fontWeight: 'bold' }}>সোশ্যাল মিডিয়া সেটিংস</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>মোবাইল অ্যাপে প্রদর্শন করার জন্য সোশ্যাল মিডিয়া লিংক ও টগল সেটিংস</p>
      </div>

      {successMessage && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 20px auto',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10B981',
          color: '#10B981',
          padding: '12px 18px',
          borderRadius: '14px',
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '18px' }} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header with Lock/Unlock Status & Edit Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: '#F8FAFC', margin: 0 }}>
              <i className="fa-solid fa-share-nodes" style={{ color: 'var(--primary-color)' }}></i> সোশ্যাল মিডিয়া লিংকসমূহ
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Status Badge */}
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: isEditing ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isEditing ? '#EAB308' : '#10B981',
              border: isEditing ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <i className={`fa-solid ${isEditing ? 'fa-lock-open' : 'fa-lock'}`} />
              {isEditing ? 'এডিটিং আনলকড' : 'সুরক্ষিত (লকড)'}
            </span>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-pen-to-square" />
                <span>এডিট করুন</span>
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '24px' }}>
          {isEditing 
            ? 'এখন প্রয়োজনীয় লিংক সংশোধন ও টগল অন/অফ করে নিচে সেভ করুন।'
            : 'সেটিংস পরিবর্তন করতে উপরের "এডিট করুন" বাটনে ক্লিক করুন।'}
        </p>

        <form onSubmit={handleSave}>
          {/* Facebook Group */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '18px', 
            border: isEditing ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)', 
            borderRadius: '16px', 
            background: isEditing ? 'rgba(16, 185, 129, 0.04)' : 'rgba(30, 41, 59, 0.4)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#F8FAFC' }}>
                <i className="fa-brands fa-facebook" style={{ color: '#1877F2', fontSize: '20px' }}></i> ফেসবুক গ্রুপ
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={socialLinks.facebook.active}
                  onChange={() => toggleLink('facebook')}
                  disabled={!isEditing}
                  style={{
                    width: '42px',
                    height: '22px',
                    appearance: 'none',
                    backgroundColor: socialLinks.facebook.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    position: 'relative',
                    outline: 'none',
                    cursor: isEditing ? 'pointer' : 'not-allowed',
                    opacity: isEditing ? 1 : 0.65,
                    transition: 'background-color 0.2s',
                  }}
                  className="toggle-switch"
                />
                <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: socialLinks.facebook.active ? '#10B981' : 'var(--text-light)' }}>
                  {socialLinks.facebook.active ? 'চালু' : 'বন্ধ'}
                </span>
              </div>
            </div>
            <input 
              type="url" 
              value={socialLinks.facebook.url} 
              onChange={(e) => handleUrlChange('facebook', e.target.value)}
              placeholder="ফেসবুক গ্রুপের লিংক লিখুন"
              style={{ width: '100%', padding: '12px', fontSize: '14px', opacity: isEditing ? 1 : 0.7 }} 
              disabled={!isEditing || !socialLinks.facebook.active} 
            />
          </div>

          {/* YouTube Channel */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '18px', 
            border: isEditing ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)', 
            borderRadius: '16px', 
            background: isEditing ? 'rgba(16, 185, 129, 0.04)' : 'rgba(30, 41, 59, 0.4)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#F8FAFC' }}>
                <i className="fa-brands fa-youtube" style={{ color: '#FF0000', fontSize: '20px' }}></i> ইউটিউব চ্যানেল
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={socialLinks.youtube.active}
                  onChange={() => toggleLink('youtube')}
                  disabled={!isEditing}
                  style={{
                    width: '42px',
                    height: '22px',
                    appearance: 'none',
                    backgroundColor: socialLinks.youtube.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    position: 'relative',
                    outline: 'none',
                    cursor: isEditing ? 'pointer' : 'not-allowed',
                    opacity: isEditing ? 1 : 0.65,
                    transition: 'background-color 0.2s',
                  }}
                />
                <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: socialLinks.youtube.active ? '#10B981' : 'var(--text-light)' }}>
                  {socialLinks.youtube.active ? 'চালু' : 'বন্ধ'}
                </span>
              </div>
            </div>
            <input 
              type="url" 
              value={socialLinks.youtube.url} 
              onChange={(e) => handleUrlChange('youtube', e.target.value)}
              placeholder="ইউটিউব চ্যানেলের লিংক লিখুন"
              style={{ width: '100%', padding: '12px', fontSize: '14px', opacity: isEditing ? 1 : 0.7 }} 
              disabled={!isEditing || !socialLinks.youtube.active} 
            />
          </div>

          {/* Twitter */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '18px', 
            border: isEditing ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)', 
            borderRadius: '16px', 
            background: isEditing ? 'rgba(16, 185, 129, 0.04)' : 'rgba(30, 41, 59, 0.4)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#F8FAFC' }}>
                <i className="fa-brands fa-x-twitter" style={{ color: '#F8FAFC', fontSize: '20px' }}></i> টুইটার (X)
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={socialLinks.twitter.active}
                  onChange={() => toggleLink('twitter')}
                  disabled={!isEditing}
                  style={{
                    width: '42px',
                    height: '22px',
                    appearance: 'none',
                    backgroundColor: socialLinks.twitter.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    position: 'relative',
                    outline: 'none',
                    cursor: isEditing ? 'pointer' : 'not-allowed',
                    opacity: isEditing ? 1 : 0.65,
                    transition: 'background-color 0.2s',
                  }}
                />
                <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: socialLinks.twitter.active ? '#10B981' : 'var(--text-light)' }}>
                  {socialLinks.twitter.active ? 'চালু' : 'বন্ধ'}
                </span>
              </div>
            </div>
            <input 
              type="url" 
              value={socialLinks.twitter.url} 
              onChange={(e) => handleUrlChange('twitter', e.target.value)}
              placeholder="টুইটার লিংক লিখুন"
              style={{ width: '100%', padding: '12px', fontSize: '14px', opacity: isEditing ? 1 : 0.7 }} 
              disabled={!isEditing || !socialLinks.twitter.active} 
            />
          </div>

          {/* Website */}
          <div style={{ 
            marginBottom: '28px', 
            padding: '18px', 
            border: isEditing ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)', 
            borderRadius: '16px', 
            background: isEditing ? 'rgba(16, 185, 129, 0.04)' : 'rgba(30, 41, 59, 0.4)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#F8FAFC' }}>
                <i className="fa-solid fa-globe" style={{ color: 'var(--primary-color)', fontSize: '20px' }}></i> ওয়েবসাইট লিংক
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={socialLinks.website.active}
                  onChange={() => toggleLink('website')}
                  disabled={!isEditing}
                  style={{
                    width: '42px',
                    height: '22px',
                    appearance: 'none',
                    backgroundColor: socialLinks.website.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    position: 'relative',
                    outline: 'none',
                    cursor: isEditing ? 'pointer' : 'not-allowed',
                    opacity: isEditing ? 1 : 0.65,
                    transition: 'background-color 0.2s',
                  }}
                />
                <span style={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: socialLinks.website.active ? '#10B981' : 'var(--text-light)' }}>
                  {socialLinks.website.active ? 'চালু' : 'বন্ধ'}
                </span>
              </div>
            </div>
            <input 
              type="url" 
              value={socialLinks.website.url} 
              onChange={(e) => handleUrlChange('website', e.target.value)}
              placeholder="অফিসিয়াল ওয়েবসাইটের লিংক লিখুন"
              style={{ width: '100%', padding: '12px', fontSize: '14px', opacity: isEditing ? 1 : 0.7 }} 
              disabled={!isEditing || !socialLinks.website.active} 
            />
          </div>

          {/* Action Buttons when unlocked */}
          {isEditing && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="submit"
                disabled={isSaving}
                className="btn btn-primary" 
                style={{ flex: 1, height: '48px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    <span>সেভ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk" />
                    <span>সেটিংস সেভ করুন</span>
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn" 
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#F8FAFC', padding: '0 20px', fontSize: '15px', fontWeight: '600' }}
              >
                বাতিল
              </button>
            </div>
          )}
        </form>
      </div>

      <style jsx global>{`
        /* Inline Switch slider styles for standard input type checkbox */
        input[type="checkbox"] {
          position: relative;
        }
        input[type="checkbox"]::before {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
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
