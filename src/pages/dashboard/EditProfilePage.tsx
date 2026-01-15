import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { User, GraduationCap, Link, ArrowLeft, ArrowRight, Cpu, Zap, Target, CheckCircle, Lock, Eye, EyeOff, Edit3, Loader2, Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PhoneInput from '@/components/ui/phone-input';
import PasswordChecklist from '@/components/ui/password-checklist';
import { validatePassword, validateSaudiPhone } from '@/lib/validation';

const EditProfilePage = () => {
  const { language, direction } = useLanguage();
  const { isAdmin, isJudge } = useRole();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect admins and judges away from this page
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    } else if (isJudge) {
      navigate('/judge');
    }
  }, [isAdmin, isJudge, navigate]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('profile');

  // Step 1: Basic Data
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [universityId, setUniversityId] = useState('');
  const [university, setUniversity] = useState('');
  const [otherUniversity, setOtherUniversity] = useState('');
  const [cvLink, setCvLink] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);

  // Step 2: Skills & Categories
  const [experienceLevel, setExperienceLevel] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [otherTechnicalSkill, setOtherTechnicalSkill] = useState('');
  const [personalSkills, setPersonalSkills] = useState<string[]>([]);
  const [otherPersonalSkill, setOtherPersonalSkill] = useState('');
  const [canCommit, setCanCommit] = useState<string>('');
  const [goals, setGoals] = useState('');

  // New robotics-specific questions
  const [roboticsExperience, setRoboticsExperience] = useState('');
  const [hasProgrammedRobot, setHasProgrammedRobot] = useState('');
  const [autonomousLogicExp, setAutonomousLogicExp] = useState('');
  const [circuitReadingExp, setCircuitReadingExp] = useState('');
  const [mechanicalWorkExp, setMechanicalWorkExp] = useState('');
  const [manualControlExp, setManualControlExp] = useState('');
  const [competitiveActivities, setCompetitiveActivities] = useState('');

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load profile data from database
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setInitialLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          setUniversityId(data.university_id || '');
          setCvLink(data.cv_link || '');
          setExperienceLevel(data.experience_level || '');
          setTechnicalSkills(data.technical_skills || []);
          setPersonalSkills(data.personal_skills || []);
          setCanCommit(data.can_commit === true ? 'yes' : data.can_commit === false ? 'no' : '');
          setGoals(data.goals || '');

          // Load new robotics-specific fields
          setRoboticsExperience((data as any).robotics_experience || '');
          setHasProgrammedRobot((data as any).has_programmed_robot || '');
          setAutonomousLogicExp((data as any).autonomous_logic_exp || '');
          setCircuitReadingExp((data as any).circuit_reading_exp || '');
          setMechanicalWorkExp((data as any).mechanical_work_exp || '');
          setManualControlExp((data as any).manual_control_exp || '');
          setCompetitiveActivities((data as any).competitive_activities || '');
          setGoals(data.goals || '');

          // Handle university - check if it's a known university or "Other"
          const knownUniversities = [
            'King Saud University',
            'King Fahd University of Petroleum and Minerals',
            'King Abdulaziz University',
            'Imam Mohammad Ibn Saud Islamic University',
            'Princess Nourah bint Abdulrahman University',
          ];

          if (data.university) {
            if (knownUniversities.includes(data.university)) {
              setUniversity(data.university);
            } else {
              setUniversity('Other');
              setOtherUniversity(data.university);
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading profile data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, language]);
  const ArrowIconNext = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const ArrowIconBack = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const universities = [
    { ar: 'جامعة الملك سعود', en: 'King Saud University' },
    { ar: 'جامعة الملك فهد للبترول والمعادن', en: 'King Fahd University of Petroleum and Minerals' },
    { ar: 'جامعة الملك عبدالعزيز', en: 'King Abdulaziz University' },
    { ar: 'جامعة الإمام محمد بن سعود الإسلامية', en: 'Imam Mohammad Ibn Saud Islamic University' },
    { ar: 'جامعة الأميرة نورة بنت عبدالرحمن', en: 'Princess Nourah bint Abdulrahman University' },
    { ar: 'أخرى', en: 'Other' },
  ];

  const experienceLevels = [
    { value: 'beginner', ar: 'مبتدئ', en: 'Beginner' },
    { value: 'intermediate', ar: 'متوسط', en: 'Intermediate' },
    { value: 'advanced', ar: 'متقدم', en: 'Advanced' },
  ];

  const technicalSkillsList = [
    { value: 'python', ar: 'Python', en: 'Python' },
    { value: 'javascript', ar: 'JavaScript', en: 'JavaScript' },
    { value: 'cpp', ar: 'C++', en: 'C++' },
    { value: 'arduino', ar: 'Arduino', en: 'Arduino' },
    { value: 'ros', ar: 'ROS', en: 'ROS' },
    { value: 'cad', ar: 'CAD/3D Modeling', en: 'CAD/3D Modeling' },
    { value: 'electronics', ar: 'إلكترونيات', en: 'Electronics' },
    { value: 'ml', ar: 'تعلم الآلة', en: 'Machine Learning' },
    { value: 'embedded', ar: 'أنظمة مدمجة', en: 'Embedded Systems' },
    { value: 'iot', ar: 'إنترنت الأشياء', en: 'IoT' },
    { value: 'raspberry_pi', ar: 'Raspberry Pi', en: 'Raspberry Pi' },
    { value: 'sensors', ar: 'Sensors', en: 'Sensors' },
    { value: 'motors', ar: 'Motors & Motor Drivers', en: 'Motors & Motor Drivers' },
    { value: 'power_management', ar: 'Power Management', en: 'Power Management' },
    { value: 'wiring_debugging', ar: 'Wiring & Debugging', en: 'Wiring & Debugging' },
    { value: 'mechanical_assembly', ar: 'Mechanical Assembly', en: 'Mechanical Assembly' },
    { value: 'tools_usage', ar: 'Tools Usage', en: 'Tools Usage' },
    { value: '3d_printed_parts', ar: 'Handling 3D Printed Parts', en: 'Handling 3D Printed Parts' },
    { value: 'solidworks', ar: 'SolidWorks', en: 'SolidWorks' },
    { value: 'fusion360', ar: 'Fusion 360', en: 'Fusion 360' },
    { value: 'autocad', ar: 'AutoCAD', en: 'AutoCAD' },
    { value: 'other', ar: 'أخرى', en: 'Other' },
  ];

  // New robotics-specific question options
  const roboticsExpLevels = [
    { value: 'beginner', ar: 'مبتدئ', en: 'Beginner' },
    { value: 'intermediate', ar: 'متوسط', en: 'Intermediate' },
    { value: 'advanced', ar: 'متقدم', en: 'Advanced' },
  ];

  const yesNoOptions = [
    { value: 'yes', ar: 'نعم', en: 'Yes' },
    { value: 'no', ar: 'لا', en: 'No' },
  ];

  const yesPartialNoOptions = [
    { value: 'yes', ar: 'نعم', en: 'Yes' },
    { value: 'partial', ar: 'إلى حد ما', en: 'Somewhat' },
    { value: 'no', ar: 'لا', en: 'No' },
  ];

  const competitiveOptions = [
    { value: 'esports', ar: 'ألعاب تنافسية (eSports / Console / PC)', en: 'Competitive Gaming (eSports / Console / PC)' },
    { value: 'robotics_competitions', ar: 'مسابقات روبوتات', en: 'Robotics Competitions' },
    { value: 'other_competitive', ar: 'أنشطة تنافسية أخرى', en: 'Other Competitive Activities' },
    { value: 'none', ar: 'لم أشارك سابقًا', en: 'Never Participated' },
  ];

  const personalSkillsList = [
    { value: 'teamwork', ar: 'العمل الجماعي', en: 'Teamwork' },
    { value: 'communication', ar: 'التواصل', en: 'Communication' },
    { value: 'leadership', ar: 'القيادة', en: 'Leadership' },
    { value: 'problem_solving', ar: 'حل المشكلات', en: 'Problem Solving' },
    { value: 'creativity', ar: 'الإبداع', en: 'Creativity' },
    { value: 'time_management', ar: 'إدارة الوقت', en: 'Time Management' },
    { value: 'adaptability', ar: 'المرونة والتكيف', en: 'Adaptability' },
    { value: 'critical_thinking', ar: 'التفكير النقدي', en: 'Critical Thinking' },
    { value: 'other', ar: 'أخرى', en: 'Other' },
  ];

  const commitmentOptions = [
    { value: 'yes', ar: 'نعم', en: 'Yes' },
    { value: 'no', ar: 'لا', en: 'No' },
  ];

  const handleTechnicalSkillToggle = (skill: string) => {
    setTechnicalSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handlePersonalSkillToggle = (skill: string) => {
    setPersonalSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must be logged in');
      return;
    }

    setLoading(true);

    try {
      let finalCvLink = cvLink;

      // Upload CV file if selected
      if (cvFile && !cvLink) {
        setCvUploading(true);
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `${user.id}/cv-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(fileName, cvFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('cvs')
          .getPublicUrl(fileName);

        finalCvLink = urlData.publicUrl;
        setCvUploading(false);
      }

      // Prepare technical skills with "other" value
      const finalTechnicalSkills = technicalSkills.includes('other') && otherTechnicalSkill.trim()
        ? [...technicalSkills.filter(s => s !== 'other'), otherTechnicalSkill.trim()]
        : technicalSkills;

      // Prepare personal skills with "other" value
      const finalPersonalSkills = personalSkills.includes('other') && otherPersonalSkill.trim()
        ? [...personalSkills.filter(s => s !== 'other'), otherPersonalSkill.trim()]
        : personalSkills;

      // Determine final university value
      const finalUniversity = university === 'Other' ? otherUniversity : university;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          university_id: universityId.trim() || null,
          university: finalUniversity || null,
          cv_link: finalCvLink || null,
          experience_level: experienceLevel || null,
          technical_skills: finalTechnicalSkills.length > 0 ? finalTechnicalSkills : null,
          personal_skills: finalPersonalSkills.length > 0 ? finalPersonalSkills : null,
          can_commit: canCommit ? canCommit === 'yes' : null,
          goals: goals.trim() || null,
          // Robotics-specific fields
          robotics_experience: roboticsExperience || null,
          has_programmed_robot: hasProgrammedRobot || null,
          autonomous_logic_exp: autonomousLogicExp || null,
          circuit_reading_exp: circuitReadingExp || null,
          mechanical_work_exp: mechanicalWorkExp || null,
          manual_control_exp: manualControlExp || null,
          competitive_activities: competitiveActivities || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حفظ البيانات' : 'Error saving profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال كلمة المرور الحالية' : 'Please enter current password');
      return;
    }
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast.error(language === 'ar' ? 'كلمة المرور الجديدة لا تستوفي المتطلبات' : 'New password does not meet requirements');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تغيير كلمة المرور' : 'Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Show loading state while fetching profile
  if (initialLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-white/60">{language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-logo-yellow/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-logo-red/8 rounded-full blur-3xl" />
      </div>

      {/* Decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 md:left-16 opacity-20 animate-[spin_20s_linear_infinite]">
          <Cpu className="w-16 h-16 md:w-24 md:h-24 text-logo-orange" />
        </div>
        <div className="absolute bottom-20 right-8 md:right-16 opacity-15 animate-[spin_25s_linear_infinite_reverse]">
          <Cpu className="w-20 h-20 md:w-32 md:h-32 text-logo-yellow" />
        </div>
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-4">
            <Edit3 size={18} />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'تعديل ملفي الشخصي' : 'Edit My Profile'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {language === 'ar' ? 'إعدادات الملف الشخصي' : 'Profile Settings'}
          </h1>
          <p className="text-white/60 mt-2">
            {language === 'ar'
              ? 'قم بتحديث معلوماتك الشخصية ومهاراتك'
              : 'Update your personal information and skills'}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <User size={16} className="me-2" />
              {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </TabsTrigger>
            <TabsTrigger value="password" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Lock size={16} className="me-2" />
              {language === 'ar' ? 'كلمة المرور' : 'Password'}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {/* Profile Form Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8">

              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white/60'}`}>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">1</span>
                  <span className="text-sm">{language === 'ar' ? 'البيانات الأساسية' : 'Basic Data'}</span>
                </div>
                <div className="w-8 h-0.5 bg-white/20" />
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white/60'}`}>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">2</span>
                  <span className="text-sm">{language === 'ar' ? 'المهارات والفئات' : 'Skills & Categories'}</span>
                </div>
              </div>

              {/* Step 1: Basic Data */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <User className="text-primary" size={20} />
                    {language === 'ar' ? 'القسم الأول: البيانات الأساسية' : 'Section 1: Basic Data'}
                  </h2>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white/90">
                      {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </Label>
                    <div className="relative">
                      <User className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                        className="ps-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="universityId" className="text-white/90">
                      {language === 'ar' ? 'الرقم الجامعي' : 'University ID'}
                    </Label>
                    <div className="relative">
                      <GraduationCap className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                      <Input
                        id="universityId"
                        type="text"
                        value={universityId}
                        onChange={(e) => setUniversityId(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل رقمك الجامعي' : 'Enter your university ID'}
                        className="ps-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <PhoneInput
                    value={phone}
                    onChange={(value, isValid) => {
                      setPhone(value);
                      setIsPhoneValid(isValid);
                    }}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="university" className="text-white/90">
                      {language === 'ar' ? 'الجامعة' : 'University'}
                    </Label>
                    <div className="relative">
                      <GraduationCap className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50 z-10" size={18} />
                      <Select value={university} onValueChange={setUniversity}>
                        <SelectTrigger className="ps-10 bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر الجامعة' : 'Select university'} />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map((uni) => (
                            <SelectItem key={uni.en} value={uni.en}>
                              {language === 'ar' ? uni.ar : uni.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Other University Name */}
                  {university === 'Other' && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="otherUniversity" className="text-white/90">
                        {language === 'ar' ? 'اسم الجامعة' : 'University Name'} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <GraduationCap className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                        <Input
                          id="otherUniversity"
                          type="text"
                          value={otherUniversity}
                          onChange={(e) => setOtherUniversity(e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل اسم جامعتك' : 'Enter your university name'}
                          className="ps-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* CV Upload (Optional) */}
                  <div className="space-y-2">
                    <Label className="text-white/90">
                      {language === 'ar' ? 'السيرة الذاتية' : 'CV'} <span className="text-white/40">({language === 'ar' ? 'اختياري - PDF فقط' : 'Optional - PDF only'})</span>
                    </Label>

                    {/* File Upload Area */}
                    {!cvLink && !cvFile && (
                      <label
                        htmlFor="cvFileEdit"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-white/40" />
                          <p className="text-sm text-white/60">
                            {language === 'ar' ? 'اضغط لرفع ملف PDF' : 'Click to upload PDF file'}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {language === 'ar' ? 'الحد الأقصى: 10 ميجابايت' : 'Max size: 10MB'}
                          </p>
                        </div>
                        <input
                          id="cvFileEdit"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                toast.error(language === 'ar' ? 'حجم الملف يجب أن يكون أقل من 10 ميجابايت' : 'File size must be less than 10MB');
                                return;
                              }
                              if (file.type !== 'application/pdf') {
                                toast.error(language === 'ar' ? 'يجب أن يكون الملف بصيغة PDF' : 'File must be PDF format');
                                return;
                              }
                              setCvFile(file);
                            }
                          }}
                        />
                      </label>
                    )}

                    {/* Show selected file */}
                    {cvFile && !cvLink && (
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20">
                        <FileText className="w-8 h-8 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{cvFile.name}</p>
                          <p className="text-xs text-white/50">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-white/50 hover:text-white hover:bg-white/10"
                          onClick={() => setCvFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Show uploaded CV link */}
                    {cvLink && (
                      <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                        <FileText className="w-8 h-8 text-green-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{language === 'ar' ? 'تم رفع السيرة الذاتية' : 'CV uploaded'}</p>
                          <a href={cvLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                            {language === 'ar' ? 'عرض الملف' : 'View file'}
                          </a>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-white/50 hover:text-white hover:bg-white/10"
                          onClick={() => {
                            setCvLink('');
                            setCvFile(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Next Button */}
                  <Button onClick={handleNext} variant="hero" size="lg" className="w-full mt-6">
                    {language === 'ar' ? 'التالي' : 'Next'}
                    <ArrowIconNext size={18} />
                  </Button>
                </div>
              )}

              {/* Step 2: Skills & Categories */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Zap className="text-primary" size={20} />
                    {language === 'ar' ? 'القسم الثاني: المهارات والفئات' : 'Section 2: Skills & Categories'}
                  </h2>

                  <div className="space-y-2">
                    <Label className="text-white/90">
                      {language === 'ar' ? 'مستوى الخبرة بالروبوتات بشكل عام' : 'Experience Level in Robotics'}
                    </Label>
                    <div className="relative">
                      <Zap className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50 z-10" size={18} />
                      <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                        <SelectTrigger className="ps-10 bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر مستوى الخبرة' : 'Select experience level'} />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {language === 'ar' ? level.ar : level.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white/90">
                      {language === 'ar' ? 'ما المهارات التقنية التي تتقنها؟' : 'What technical skills do you have?'}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {technicalSkillsList.map((skill) => (
                        <div
                          key={skill.value}
                          onClick={() => handleTechnicalSkillToggle(skill.value)}
                          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${technicalSkills.includes(skill.value)
                            ? 'bg-primary/20 border-primary border'
                            : 'bg-white/5 border-white/10 border hover:bg-white/10'
                            }`}
                        >
                          <Checkbox
                            checked={technicalSkills.includes(skill.value)}
                            className="border-white/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="text-white/90 text-sm">{language === 'ar' ? skill.ar : skill.en}</span>
                        </div>
                      ))}
                    </div>
                    {technicalSkills.includes('other') && (
                      <div className="mt-2 animate-fade-in">
                        <Label className="text-white/90 text-sm mb-1 block">
                          {language === 'ar' ? 'حدد المهارة' : 'Specify skill'} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={otherTechnicalSkill}
                          onChange={(e) => setOtherTechnicalSkill(e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل المهارة التقنية الأخرى' : 'Enter other technical skill'}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                        />
                      </div>
                    )}
                  </div>

                  {/* Personal Skills */}
                  <div className="space-y-3">
                    <Label className="text-white/90">
                      {language === 'ar' ? 'ما المهارات الشخصية التي تتحلى بها؟' : 'What personal skills do you have?'}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {personalSkillsList.map((skill) => (
                        <div
                          key={skill.value}
                          onClick={() => handlePersonalSkillToggle(skill.value)}
                          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${personalSkills.includes(skill.value)
                            ? 'bg-primary/20 border-primary border'
                            : 'bg-white/5 border-white/10 border hover:bg-white/10'
                            }`}
                        >
                          <Checkbox
                            checked={personalSkills.includes(skill.value)}
                            className="border-white/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="text-white/90 text-sm">{language === 'ar' ? skill.ar : skill.en}</span>
                        </div>
                      ))}
                    </div>
                    {personalSkills.includes('other') && (
                      <div className="mt-2 animate-fade-in">
                        <Label className="text-white/90 text-sm mb-1 block">
                          {language === 'ar' ? 'حدد المهارة' : 'Specify skill'} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={otherPersonalSkill}
                          onChange={(e) => setOtherPersonalSkill(e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل المهارة الشخصية الأخرى' : 'Enter other personal skill'}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                        />
                      </div>
                    )}
                  </div>

                  {/* Commitment */}
                  <div className="space-y-2">
                    <Label className="text-white/90">
                      {language === 'ar' ? 'هل تستطيع الالتزام بحضور جميع أيام الهاكاثون؟' : 'Can you commit to attending all hackathon days?'}
                    </Label>
                    <div className="relative">
                      <CheckCircle className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50 z-10" size={18} />
                      <Select value={canCommit} onValueChange={setCanCommit}>
                        <SelectTrigger className="ps-10 bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر إجابة' : 'Select answer'} />
                        </SelectTrigger>
                        <SelectContent>
                          {commitmentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {language === 'ar' ? option.ar : option.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="space-y-2">
                    <Label htmlFor="goals" className="text-white/90">
                      {language === 'ar' ? 'ما الأهداف التي تسعى لتحقيقها من خلال مشاركتك؟' : 'What goals do you aim to achieve through your participation?'}
                    </Label>
                    <div className="relative">
                      <Target className="absolute top-3 start-3 text-white/50" size={18} />
                      <Textarea
                        id="goals"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder={language === 'ar' ? 'اكتب أهدافك هنا...' : 'Write your goals here...'}
                        className="ps-10 min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary resize-none"
                      />
                    </div>
                  </div>

                  {/* New Robotics Questions Section */}
                  <div className="border-t border-white/10 pt-5 mt-5">
                    <h3 className="text-md font-semibold text-white flex items-center gap-2 mb-4">
                      <Cpu className="text-primary" size={18} />
                      {language === 'ar' ? 'أسئلة متخصصة في الروبوتات' : 'Robotics Specific Questions'}
                    </h3>

                    {/* 1. Robotics Experience Level */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white/90">
                        {language === 'ar' ? 'مستوى الخبرة بالروبوتات' : 'Robotics Experience Level'}
                      </Label>
                      <Select value={roboticsExperience} onValueChange={setRoboticsExperience}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر مستوى الخبرة' : 'Select experience level'} />
                        </SelectTrigger>
                        <SelectContent>
                          {roboticsExpLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {language === 'ar' ? level.ar : level.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 2. Have you programmed a robot or hardware? */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white/90">
                        {language === 'ar' ? 'هل سبق لك برمجة Robot أو Hardware؟' : 'Have you programmed a Robot or Hardware before?'}
                      </Label>
                      <Select value={hasProgrammedRobot} onValueChange={setHasProgrammedRobot}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر إجابة' : 'Select answer'} />
                        </SelectTrigger>
                        <SelectContent>
                          {yesNoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {language === 'ar' ? option.ar : option.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 3. Autonomous Logic Experience */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white/90">
                        {language === 'ar' ? 'هل لديك خبرة في Autonomous Logic؟' : 'Do you have experience with Autonomous Logic?'}
                      </Label>
                      <Select value={autonomousLogicExp} onValueChange={setAutonomousLogicExp}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر إجابة' : 'Select answer'} />
                        </SelectTrigger>
                        <SelectContent>
                          {yesPartialNoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {language === 'ar' ? option.ar : option.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 4. Circuit Reading Experience */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white/90">
                        {language === 'ar' ? 'هل تستطيع قراءة وفهم الدوائر الإلكترونية؟' : 'Can you read and understand electronic circuits?'}
                      </Label>
                      <Select value={circuitReadingExp} onValueChange={setCircuitReadingExp}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر إجابة' : 'Select answer'} />
                        </SelectTrigger>
                        <SelectContent>
                          {yesPartialNoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {language === 'ar' ? option.ar : option.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 5. Mechanical Work Experience */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white/90">
                        {language === 'ar' ? 'هل سبق لك العمل اليدوي على مشاريع ميكانيكية؟' : 'Have you worked on mechanical projects before?'}
                      </Label>
                      <Select value={mechanicalWorkExp} onValueChange={setMechanicalWorkExp}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر إجابة' : 'Select answer'} />
                        </SelectTrigger>
                        <SelectContent>
                          {yesPartialNoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {language === 'ar' ? option.ar : option.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 6. Manual Control Experience */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white/90">
                        {language === 'ar' ? 'هل سبق لك قيادة نظام يعتمد على تحكم يدوي مباشر؟' : 'Have you operated a system with direct manual control?'}
                      </Label>
                      <Select value={manualControlExp} onValueChange={setManualControlExp}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر إجابة' : 'Select answer'} />
                        </SelectTrigger>
                        <SelectContent>
                          {yesPartialNoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {language === 'ar' ? option.ar : option.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 7. Competitive Activities */}
                    <div className="space-y-2">
                      <Label className="text-white/90">
                        {language === 'ar' ? 'هل سبق لك المشاركة في أنشطة تنافسية؟' : 'Have you participated in competitive activities?'}
                      </Label>
                      <Select value={competitiveActivities} onValueChange={setCompetitiveActivities}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white [&>span]:text-white/40 focus:border-primary">
                          <SelectValue placeholder={language === 'ar' ? 'اختر إجابة' : 'Select answer'} />
                        </SelectTrigger>
                        <SelectContent>
                          {competitiveOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {language === 'ar' ? option.ar : option.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 mt-6">
                    <Button onClick={handleBack} variant="outline" size="lg" className="flex-1 border-white/20 text-white hover:bg-white/10">
                      <ArrowIconBack size={18} />
                      {language === 'ar' ? 'العودة' : 'Back'}
                    </Button>
                    <Button onClick={handleSubmit} variant="hero" size="lg" className="flex-1" disabled={loading}>
                      {loading ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <>
                          {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                          <CheckCircle size={18} />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Lock className="text-primary" size={20} />
                {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </h2>

              <div className="space-y-5">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white/90">
                    {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                      className="ps-10 pe-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute top-1/2 -translate-y-1/2 end-3 text-white/50 hover:text-white/80"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white/90">
                    {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                      className="ps-10 pe-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute top-1/2 -translate-y-1/2 end-3 text-white/50 hover:text-white/80"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <PasswordChecklist
                    validation={validatePassword(newPassword)}
                    show={newPassword.length > 0}
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/90">
                    {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                      className="ps-10 pe-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 -translate-y-1/2 end-3 text-white/50 hover:text-white/80"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Change Password Button */}
                <Button onClick={handlePasswordChange} variant="hero" size="lg" className="w-full mt-6" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <Lock size={18} className="me-2" />
                      {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditProfilePage;
