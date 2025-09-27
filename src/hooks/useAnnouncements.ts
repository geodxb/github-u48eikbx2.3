import { useState, useEffect } from 'react';
import { AnnouncementService, Announcement } from '../services/announcementService';

export const useAnnouncements = (userRole: 'admin' | 'investor' | 'governor' | null) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('📢 useAnnouncements called with role:', userRole);

  useEffect(() => {
    if (!userRole) {
      console.log('📢 No user role provided, skipping announcements');
      setLoading(false);
      return;
    }
    
    if (userRole !== 'admin' && userRole !== 'investor' && userRole !== 'governor') {
      console.log('📢 Invalid user role:', userRole);
      setLoading(false);
      return;
    }

    // Set up real-time listener
    console.log('📢 Setting up announcements listener for role:', userRole);
    const unsubscribe = AnnouncementService.subscribeToAnnouncements(userRole, (updatedAnnouncements) => {
      console.log('📢 Announcements updated for role:', userRole, 'Count:', updatedAnnouncements.length);
      updatedAnnouncements.forEach((ann, index) => {
        console.log(`📢 Announcement ${index + 1}:`, {
          id: ann.id,
          title: ann.title,
          targetRoles: ann.targetRoles,
          isActive: ann.isActive,
          type: ann.type,
          priority: ann.priority
        });
      });
      setAnnouncements(updatedAnnouncements);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error('📢 Error in announcements listener:', error);
      setError(error.message);
      setLoading(false);
    }, (error) => {
      console.error('📢 Error in announcements listener:', error);
      setError(error.message);
      setLoading(false);
      setAnnouncements([]);
    });

    // Cleanup listener on unmount
    return () => {
      console.log('📢 Cleaning up announcements listener');
      unsubscribe();
    };
  }, [userRole]);

  return { announcements, loading, error };
};

export const useAllAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await AnnouncementService.getAnnouncements();
      setAnnouncements(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return { announcements, loading, error, refetch: fetchAnnouncements };
};