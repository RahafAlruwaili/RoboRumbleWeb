import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export type WorkshopCategory = 'programming' | 'electronics' | 'mechanics' | 'design' | 'competition';
export type WorkshopLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WorkshopResource {
  id: string;
  name: string;
  nameEn: string;
  url: string;
  type: 'presentation' | 'code' | 'document' | 'other';
  isFile?: boolean;
  fileName?: string;
  fileSize?: number;
}

export interface Workshop {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: WorkshopCategory;
  level: WorkshopLevel;
  duration: string;
  durationEn: string;
  date: string;
  dateEn: string;
  presenter: string;
  presenterEn: string;
  whatYouLearn: string[];
  whatYouLearnEn: string[];
  requirements: string[];
  requirementsEn: string[];
  joinLink: string | null;
  resources: WorkshopResource[];
}

interface WorkshopsContextType {
  workshops: Workshop[];
  loading: boolean;
  addWorkshop: (workshop: Omit<Workshop, 'id'>) => void;
  updateWorkshop: (id: string, workshop: Partial<Workshop>) => void;
  deleteWorkshop: (id: string) => void;
  addResource: (workshopId: string, resource: Omit<WorkshopResource, 'id'>) => void;
  removeResource: (workshopId: string, resourceId: string) => void;
  getWorkshopById: (id: string) => Workshop | undefined;
  refetch: () => Promise<void>;
}

const WorkshopsContext = createContext<WorkshopsContextType | undefined>(undefined);

interface WorkshopsProviderProps {
  children: ReactNode;
}

export const WorkshopsProvider: React.FC<WorkshopsProviderProps> = ({ children }) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  const formatWorkshopDate = (date: string, startTime: string | null, endTime: string | null, locale: 'ar' | 'en') => {
    try {
      const dateObj = new Date(date);
      const dateStr = format(dateObj, 'd MMMM yyyy', { locale: locale === 'ar' ? ar : enUS });
      
      if (startTime) {
        const [hours, minutes] = startTime.split(':');
        const hour = parseInt(hours);
        const period = locale === 'ar' ? (hour >= 12 ? 'م' : 'ص') : (hour >= 12 ? 'PM' : 'AM');
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${dateStr} - ${hour12}:${minutes} ${period}`;
      }
      return dateStr;
    } catch {
      return date;
    }
  };

  const calculateDuration = (startTime: string | null, endTime: string | null, locale: 'ar' | 'en') => {
    if (!startTime || !endTime) return locale === 'ar' ? 'غير محدد' : 'TBD';
    
    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;
      const diff = endTotal - startTotal;
      
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      
      if (locale === 'ar') {
        if (hours === 1 && minutes === 0) return 'ساعة';
        if (hours === 2 && minutes === 0) return 'ساعتان';
        if (hours > 2 && minutes === 0) return `${hours} ساعات`;
        if (hours === 1 && minutes === 30) return 'ساعة ونصف';
        if (hours === 2 && minutes === 30) return 'ساعتان ونصف';
        return `${hours} ساعات و ${minutes} دقيقة`;
      } else {
        if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        if (minutes === 30) return `${hours}.5 hours`;
        return `${hours}h ${minutes}m`;
      }
    } catch {
      return locale === 'ar' ? 'غير محدد' : 'TBD';
    }
  };

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const mappedWorkshops: Workshop[] = (data || []).map((w) => ({
        id: w.id,
        title: w.title_ar || w.title,
        titleEn: w.title,
        description: w.description || '',
        descriptionEn: w.description || '',
        category: 'programming' as WorkshopCategory, // Default category since DB doesn't have it
        level: 'beginner' as WorkshopLevel, // Default level since DB doesn't have it
        duration: calculateDuration(w.start_time, w.end_time, 'ar'),
        durationEn: calculateDuration(w.start_time, w.end_time, 'en'),
        date: formatWorkshopDate(w.date, w.start_time, w.end_time, 'ar'),
        dateEn: formatWorkshopDate(w.date, w.start_time, w.end_time, 'en'),
        presenter: w.location || '',
        presenterEn: w.location || '',
        whatYouLearn: [],
        whatYouLearnEn: [],
        requirements: [],
        requirementsEn: [],
        joinLink: null,
        resources: [],
      }));

      setWorkshops(mappedWorkshops);
    } catch (err) {
      console.error('Error fetching workshops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const addWorkshop = (workshop: Omit<Workshop, 'id'>) => {
    const newWorkshop: Workshop = {
      ...workshop,
      id: Date.now().toString(),
    };
    setWorkshops((prev) => [...prev, newWorkshop]);
  };

  const updateWorkshop = (id: string, updates: Partial<Workshop>) => {
    setWorkshops((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  const deleteWorkshop = (id: string) => {
    setWorkshops((prev) => prev.filter((w) => w.id !== id));
  };

  const addResource = (workshopId: string, resource: Omit<WorkshopResource, 'id'>) => {
    const newResource: WorkshopResource = {
      ...resource,
      id: Date.now().toString(),
    };
    setWorkshops((prev) =>
      prev.map((w) =>
        w.id === workshopId
          ? { ...w, resources: [...w.resources, newResource] }
          : w
      )
    );
  };

  const removeResource = (workshopId: string, resourceId: string) => {
    setWorkshops((prev) =>
      prev.map((w) =>
        w.id === workshopId
          ? { ...w, resources: w.resources.filter((r) => r.id !== resourceId) }
          : w
      )
    );
  };

  const getWorkshopById = (id: string) => {
    return workshops.find((w) => w.id === id);
  };

  return (
    <WorkshopsContext.Provider
      value={{
        workshops,
        loading,
        addWorkshop,
        updateWorkshop,
        deleteWorkshop,
        addResource,
        removeResource,
        getWorkshopById,
        refetch: fetchWorkshops,
      }}
    >
      {children}
    </WorkshopsContext.Provider>
  );
};

export const useWorkshops = (): WorkshopsContextType => {
  const context = useContext(WorkshopsContext);
  if (context === undefined) {
    throw new Error('useWorkshops must be used within a WorkshopsProvider');
  }
  return context;
};
