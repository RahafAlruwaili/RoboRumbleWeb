import { useState, useEffect, useCallback } from 'react';
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
import { User, GraduationCap, Link, ArrowLeft, ArrowRight, Cpu, Zap, Target, CheckCircle, UserPlus, Upload, FileText, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PhoneInput from '@/components/ui/phone-input';
import { validateSaudiPhone } from '@/lib/validation';

const STORAGE_KEY = 'roborumble-profile-draft';

const CompleteProfilePage = () => {
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
  const [currentStep, setCurrentStep] = useState(1);

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

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCurrentStep(parsed.currentStep || 1);
        setFullName(parsed.fullName || '');
        setPhone(parsed.phone || '');
        setUniversityId(parsed.universityId || '');
        setUniversity(parsed.university || '');
        setOtherUniversity(parsed.otherUniversity || '');
        setCvLink(parsed.cvLink || '');
        setExperienceLevel(parsed.experienceLevel || '');
        setTechnicalSkills(parsed.technicalSkills || []);
        setOtherTechnicalSkill(parsed.otherTechnicalSkill || '');
        setPersonalSkills(parsed.personalSkills || []);
        setOtherPersonalSkill(parsed.otherPersonalSkill || '');
        setCanCommit(parsed.canCommit || '');
        setGoals(parsed.goals || '');
        setRoboticsExperience(parsed.roboticsExperience || '');
        setHasProgrammedRobot(parsed.hasProgrammedRobot || '');
        setAutonomousLogicExp(parsed.autonomousLogicExp || '');
        setCircuitReadingExp(parsed.circuitReadingExp || '');
        setMechanicalWorkExp(parsed.mechanicalWorkExp || '');
        setManualControlExp(parsed.manualControlExp || '');
        setCompetitiveActivities(parsed.competitiveActivities || '');
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Auto-save to localStorage whenever form data changes
  const saveToStorage = useCallback(() => {
    const data = {
      currentStep,
      fullName,
      phone,
      universityId,
      university,
      otherUniversity,
      cvLink,
      experienceLevel,
      technicalSkills,
      otherTechnicalSkill,
      personalSkills,
      otherPersonalSkill,
      canCommit,
      goals,
      roboticsExperience,
      hasProgrammedRobot,
      autonomousLogicExp,
      circuitReadingExp,
      mechanicalWorkExp,
      manualControlExp,
      competitiveActivities,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [currentStep, fullName, phone, universityId, university, otherUniversity, cvLink, experienceLevel, technicalSkills, otherTechnicalSkill, personalSkills, otherPersonalSkill, canCommit, goals, roboticsExperience, hasProgrammedRobot, autonomousLogicExp, circuitReadingExp, mechanicalWorkExp, manualControlExp, competitiveActivities]);

  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  // Clear saved data on successful submit
  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

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

  const validateStep1 = () => {
    if (!fullName.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return false;
    }
    if (!phone.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال رقم الجوال' : 'Please enter your phone number');
      return false;
    }
    const phoneValidation = validateSaudiPhone(phone);
    if (!phoneValidation.isValid) {
      toast.error(language === 'ar' ? 'الرجاء إدخال رقم جوال سعودي صالح' : 'Please enter a valid Saudi phone number');
      return false;
    }
    if (!universityId.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال الرقم الجامعي' : 'Please enter your university ID');
      return false;
    }
    if (!university) {
      toast.error(language === 'ar' ? 'يرجى اختيار الجامعة' : 'Please select your university');
      return false;
    }
    if (university === 'Other' && !otherUniversity.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم الجامعة' : 'Please enter your university name');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!experienceLevel) {
      toast.error(language === 'ar' ? 'يرجى اختيار مستوى الخبرة' : 'Please select experience level');
      return false;
    }
    if (technicalSkills.length === 0) {
      toast.error(language === 'ar' ? 'يرجى اختيار مهارة تقنية واحدة على الأقل' : 'Please select at least one technical skill');
      return false;
    }
    if (technicalSkills.includes('other') && !otherTechnicalSkill.trim()) {
      toast.error(language === 'ar' ? 'يرجى تحديد المهارة التقنية الأخرى' : 'Please specify the other technical skill');
      return false;
    }
    if (personalSkills.length === 0) {
      toast.error(language === 'ar' ? 'يرجى اختيار مهارة شخصية واحدة على الأقل' : 'Please select at least one personal skill');
      return false;
    }
    if (personalSkills.includes('other') && !otherPersonalSkill.trim()) {
      toast.error(language === 'ar' ? 'يرجى تحديد المهارة الشخصية الأخرى' : 'Please specify the other personal skill');
      return false;
    }
    if (!canCommit) {
      toast.error(language === 'ar' ? 'يرجى الإجابة على سؤال الالتزام' : 'Please answer the commitment question');
      return false;
    }
    if (!goals.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال أهدافك من المشاركة' : 'Please enter your participation goals');
      return false;
    }
    if (goals.trim().length < 12) {
      toast.error(language === 'ar' ? 'يجب أن تكون الأهداف 12 حرفاً على الأقل' : 'Goals must be at least 12 characters');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
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
          full_name: fullName.trim(),
          phone: phone.trim(),
          university_id: universityId.trim(),
          university: finalUniversity,
          cv_link: finalCvLink || null,
          experience_level: experienceLevel,
          technical_skills: finalTechnicalSkills,
          personal_skills: finalPersonalSkills,
          can_commit: canCommit === 'yes',
          goals: goals.trim(),
          robotics_experience: roboticsExperience,
          has_programmed_robot: hasProgrammedRobot,
          autonomous_logic_exp: autonomousLogicExp,
          circuit_reading_exp: circuitReadingExp,
          mechanical_work_exp: mechanicalWorkExp,
          manual_control_exp: manualControlExp,
          competitive_activities: competitiveActivities,
          profile_completed: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      clearSavedData();
      toast.success(language === 'ar' ? 'تم إكمال الملف الشخصي بنجاح!' : 'Profile completed successfully!');
      navigate('/team-hub');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      const errorMessage = error?.message || error?.details || 'Unknown error';
      console.error('Error details:', errorMessage);
      toast.error(language === 'ar' ? `خطأ: ${errorMessage}` : `Error: ${errorMessage}`);
      setCvUploading(false);
    } finally {
      setLoading(false);
    }
  };

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
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowIconBack className="me-2" size={18} />
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 mb-4">
            <UserPlus size={18} />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'مطلوب لإكمال التسجيل' : 'Required to complete registration'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {language === 'ar' ? 'إكمال الملف الشخصي' : 'Complete Your Profile'}
          </h1>
          <p className="text-white/60 mt-2">
            {language === 'ar'
              ? 'أكمل بياناتك للمشاركة في الهاكاثون'
              : 'Complete your information to participate in the hackathon'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">
              {language === 'ar' ? `الخطوة ${currentStep} من 2` : `Step ${currentStep} of 2`}
            </span>
            <span className="text-primary text-sm font-medium">{currentStep * 50}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-logo-orange to-logo-yellow transition-all duration-500"
              style={{ width: `${currentStep * 50}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8">

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep === 1 ? 'bg-primary text-primary-foreground' : currentStep > 1 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>
              {currentStep > 1 ? (
                <CheckCircle size={18} />
              ) : (
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">1</span>
              )}
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
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} <span className="text-destructive">*</span>
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
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="universityId" className="text-white/90">
                  {language === 'ar' ? 'الرقم الجامعي' : 'University ID'} <span className="text-destructive">*</span>
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
                    required
                  />
                </div>
              </div>

              <PhoneInput
                value={phone}
                onChange={(value, isValid) => {
                  setPhone(value);
                  setIsPhoneValid(isValid);
                }}
                required
              />

              <div className="space-y-2">
                <Label htmlFor="university" className="text-white/90">
                  {language === 'ar' ? 'الجامعة' : 'University'} <span className="text-destructive">*</span>
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
                      required
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
                    htmlFor="cvFile"
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
                      id="cvFile"
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
                  {language === 'ar' ? 'مستوى الخبرة بالروبوتات بشكل عام' : 'Experience Level in Robotics'} <span className="text-destructive">*</span>
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
                  {language === 'ar' ? 'ما المهارات التقنية التي تتقنها؟' : 'What technical skills do you have?'} <span className="text-destructive">*</span>
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
                      required
                    />
                  </div>
                )}
              </div>

              {/* Personal Skills */}
              <div className="space-y-3">
                <Label className="text-white/90">
                  {language === 'ar' ? 'ما المهارات الشخصية التي تتحلى بها؟' : 'What personal skills do you have?'} <span className="text-destructive">*</span>
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
                      required
                    />
                  </div>
                )}
              </div>

              {/* Commitment */}
              <div className="space-y-2">
                <Label className="text-white/90">
                  {language === 'ar' ? 'هل تستطيع الالتزام بحضور جميع أيام الهاكاثون؟' : 'Can you commit to attending all hackathon days?'} <span className="text-destructive">*</span>
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
                  <span className="text-destructive ms-1">*</span>
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
                    {language === 'ar' ? 'مستوى الخبرة بالروبوتات' : 'Robotics Experience Level'} <span className="text-destructive">*</span>
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
                    {language === 'ar' ? 'هل سبق لك برمجة Robot أو Hardware؟' : 'Have you programmed a Robot or Hardware before?'} <span className="text-destructive">*</span>
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
                    {language === 'ar' ? 'هل لديك خبرة في Autonomous Logic؟' : 'Do you have experience with Autonomous Logic?'} <span className="text-destructive">*</span>
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
                    {language === 'ar' ? 'هل تستطيع قراءة وفهم الدوائر الإلكترونية؟' : 'Can you read and understand electronic circuits?'} <span className="text-destructive">*</span>
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
                    {language === 'ar' ? 'هل سبق لك العمل اليدوي على مشاريع ميكانيكية؟' : 'Have you worked on mechanical projects before?'} <span className="text-destructive">*</span>
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
                    {language === 'ar' ? 'هل سبق لك قيادة نظام يعتمد على تحكم يدوي مباشر؟' : 'Have you operated a system with direct manual control?'} <span className="text-destructive">*</span>
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
                    {language === 'ar' ? 'هل سبق لك المشاركة في أنشطة تنافسية؟' : 'Have you participated in competitive activities?'} <span className="text-destructive">*</span>
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
                <Button onClick={handleBack} size="lg" className="flex-1 bg-white/15 text-white hover:bg-white/25 border border-white/30">
                  <ArrowIconBack size={18} className="me-2" />
                  {language === 'ar' ? 'العودة للبيانات الأساسية' : 'Back to Basic Data'}
                </Button>
                <Button onClick={handleSubmit} variant="hero" size="lg" className="flex-1" disabled={loading}>
                  {loading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      {language === 'ar' ? 'إكمال التسجيل' : 'Complete Registration'}
                      <CheckCircle size={18} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
