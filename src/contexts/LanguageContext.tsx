import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ar" | "en";
type Direction = "rtl" | "ltr";

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.about": "عن روبو رمبل",
    "nav.terms": "شروط المشاركة",
    "nav.schedule": "الجدول الزمني",
    "nav.sponsors": "الرعاة",
   // "nav.prizes": "الجوائز",
    "nav.leaderboard": "لوحة المتصدرين",
    "nav.login": "تسجيل الدخول",
    "nav.register": "سجّل الآن",
    "nav.dashboard": "لوحة التحكم",
    "nav.profile": "الملف الشخصي",
    "nav.logout": "تسجيل الخروج",
    "nav.team": "الفرق",
    "nav.myTeam": "فريقي",
    "nav.workshops": "ورش عمل",

    // Hero
    "hero.title": "روبو رمبل",
    "hero.slogan": "فكّر، ابنِ، نافس",
    "hero.description":
      "أول هاكاثون من نوعه في عالم الروبوتات التنافسية، بيئة تعليمية، تحديات عملية ومعارك هندسية تحسمها الدقة والابتكار. انضم إلينا الآن!",
    "hero.cta": "سجّل الآن",
    "hero.learnMore": "اعرف المزيد",
    "hero.participants": "مشارك",
    "hero.teams": "فريق",
    "hero.days": "أيام",

    // About
    "about.title": "عن روبو رمبل",
    "about.subtitle": "هاكاثون الروبوتات",
    "about.description":
      "روبو رمبل هو هاكاثون الروبوتات الأول من نوعه الذي ينظمه نادي الدرونز والروبوت في جامعة الملك سعود. حيث يجتمع المبتكرون الشباب لتصميم وبناء روبوتات قتالية.",
    "about.objective1.title": "نشر الوعي",
    "about.objective1.desc": "تعزيز الوعي بعالم الروبوتات والتقنيات الحديثة",
    "about.objective2.title": "روح المنافسة",
    "about.objective2.desc": "تعزيز روح المنافسة الشريفة بين المشاركين",
    "about.objective3.title": "العمل الجماعي",
    "about.objective3.desc": "تعزيز مهارات العمل الجماعي والتعاون",
    "about.objective4.title": "المهارات التقنية",
    "about.objective4.desc": "تعليم المهارات الأساسية في الروبوتات",

    // Event Details
    "event.title": "تفاصيل الحدث",
    "event.participants": "80 مشاركاً",
    "event.participantsDesc": "من طلاب الجامعة",
    "event.teams": "16 فريق",
    "event.teamsDesc": "يتنافسون على اللقب",
    "event.duration": "4 أيام",
    "event.durationDesc": "من المنافسة المكثفة",
    "event.workshops": "ورش العمل",
    "event.workshopsDate": "21-23 يناير 2026",
    "event.workshopsDesc": "ورش عمل تدريبية (عن بُعد)",
    "event.hackathon": "الهاكاثون",
    "event.hackathonDate": "28-31 يناير 2026",
    "event.hackathonDesc": "أيام المنافسة الرئيسية",
    "event.location": "الموقع",
    "event.locationValue": "الرياض، المملكة العربية السعودية",

    // Schedule
    "schedule.title": "الجدول الزمني",
    "schedule.subtitle": "أربعة أيام من الإبداع والتحدي",
    "schedule.day1.title": "اليوم الأول",
    "schedule.day1.subtitle": "الافتتاح والورش",
    "schedule.day1.item1": "حفل الافتتاح",
    "schedule.day1.item2": "مقدمة في الروبوتات والإلكترونيات",
    "schedule.day1.item3": "ورش البرمجة",
    "schedule.day1.item4": "ورشة الطباعة ثلاثية الأبعاد",
    "schedule.day2.title": "اليوم الثاني",
    "schedule.day2.subtitle": "التخطيط والبناء",
    "schedule.day2.item1": "التجميع والتخطيط",
    "schedule.day2.item2": "استراتيجيات روبو رمبل",
    "schedule.day2.item3": "جلسات عمل الفرق",
    "schedule.day3.title": "اليوم الثالث",
    "schedule.day3.subtitle": "التحضير النهائي",
    "schedule.day3.item1": "التحضيرات النهائية",
    "schedule.day3.item2": "اختبارات الروبوتات",
    "schedule.day3.item3": "مراجعة المتطلبات",
    "schedule.day4.title": "اليوم الرابع",
    "schedule.day4.subtitle": "المنافسة والختام",
    "schedule.day4.item1": "المنافسات الرئيسية",
    "schedule.day4.item2": "النهائيات",
    "schedule.day4.item3": "حفل التتويج والجوائز",

    // Sponsors
    //"sponsors.title": "الرعاة",
    //"sponsors.subtitle": "شركاء النجاح",
    //"sponsors.official": "الراعي الرسمي",
    //"sponsors.gold": "الرعاة الذهبيون",
    //"sponsors.silver": "الرعاة الفضيون",
    //"sponsors.bronze": "الرعاة البرونزيون",
    //"sponsors.become": "كن راعياً",
    //"sponsors.becomeDesc": "انضم إلينا في دعم جيل المبتكرين القادم",

    // Leaderboard
    "leaderboard.title": "لوحة المتصدرين",
    "leaderboard.subtitle": "يتم تحديث النتائج بعد اعتمادها",
    "leaderboard.overall": "الإجمالي",
    "leaderboard.daily": "الترتيب اليومي",
    "leaderboard.rank": "الترتيب",
    "leaderboard.team": "اسم الفريق",
    "leaderboard.score": "النقاط",
    "leaderboard.total": "المجموع",
    "leaderboard.day": "اليوم",
    "leaderboard.noData": "لا توجد نتائج بعد",
    "leaderboard.searchTeams": "ابحث عن فريق",
    "leaderboard.status": "الحالة",
    "leaderboard.active": "نشط",
    "leaderboard.warning": "تنبيه",
    "leaderboard.violation": "مخالفة",
    "leaderboard.disqualified": "مستبعد",
    "leaderboard.teamDetails": "تفاصيل الفريق",
    "leaderboard.currentRank": "الترتيب الحالي",
    "leaderboard.totalScore": "مجموع النقاط",
    "leaderboard.dailyBreakdown": "تفصيل النقاط اليومية",
    "leaderboard.penalties": "الخصومات",
    "leaderboard.dayTotal": "مجموع اليوم",
    "leaderboard.judgeNotes": "ملاحظات الحكام",
    "leaderboard.noNotes": "لا توجد ملاحظات",
    "leaderboard.backToLeaderboard": "العودة للترتيب",
    "leaderboard.judgesAward": "جائزة لجنة التحكيم",
    "leaderboard.judgesAwardDesc": "أعلى عدد من النقاط - درع تكريمي",

    // Workshops
    "workshops.title": "ورش عمل",
    "workshops.subtitle": "ورش تساعدك تستعد للهاكاثون",
    "workshops.all": "الكل",
    "workshops.programming": "البرمجة",
    "workshops.electronics": "الإلكترونيات",
    "workshops.mechanics": "الميكانيكا",
    "workshops.design": "التصميم",
    "workshops.competition": "التحضير للمنافسة",
    "workshops.search": "ابحث عن ورشة",
    "workshops.details": "التفاصيل",
    "workshops.addToCalendar": "إضافة للتقويم",
    "workshops.beginner": "مبتدئ",
    "workshops.intermediate": "متوسط",
    "workshops.advanced": "متقدم",
    "workshops.duration": "المدة",
    "workshops.presenter": "المقدم",
    "workshops.date": "التاريخ",
    "workshops.whatYouLearn": "ماذا ستتعلم",
    "workshops.requirements": "المتطلبات",
    "workshops.joinLink": "رابط الانضمام",
    "workshops.resources": "الموارد",
    "workshops.notAvailable": "غير متوفر حالياً",
    "workshops.noWorkshops": "لا توجد ورش حالياً",
    "workshops.backToWorkshops": "العودة للورش",

    // Footer
    "footer.organizer": "نادي الدرونز والروبوت",
    "footer.university": "جامعة الملك سعود",
    "footer.rights": "جميع الحقوق محفوظة",
    "footer.contact": "تواصل معنا",
    "footer.followUs": "تابعنا",

    // Auth
    "auth.login": "تسجيل الدخول",
    "auth.signup": "إنشاء حساب",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.confirmPassword": "تأكيد كلمة المرور",
    "auth.forgotPassword": "نسيت كلمة المرور؟",
    "auth.noAccount": "ليس لديك حساب؟",
    "auth.hasAccount": "لديك حساب بالفعل؟",
    "auth.loginBtn": "دخول",
    "auth.signupBtn": "إنشاء حساب",
    "auth.loginRequired": "يجب تسجيل الدخول للوصول لهذه الصفحة",

    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.success": "تمت العملية بنجاح",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.submit": "إرسال",
    "common.next": "التالي",
    "common.previous": "السابق",
    "common.viewDetails": "عرض التفاصيل",
    "common.back": "رجوع",

    // Timeline
    "timeline.title": "الجدول الزمني",
    "timeline.subtitle": "رحلتك في روبو رمبل",
    "timeline.phase1": "فتح التسجيل",
    "timeline.phase1Date": "14 يناير 2026",
    "timeline.phase1Desc": "بدء استقبال طلبات التسجيل للفرق المشاركة في RoboRumble.",
    "timeline.phase2": "إغلاق التسجيل",
    "timeline.phase2Date": "24 يناير 2026",
    "timeline.phase2Desc": "إغلاق باب التسجيل ومراجعة طلبات الفرق.",
    "timeline.phase3": "القبول المبدئي",
    "timeline.phase3Date": "27 يناير 2026",
    "timeline.phase3Desc": "إعلان الفرق المقبولة مبدئيًا.",
    "timeline.phase4": "بداية الورش الأونلاين",
    "timeline.phase4Date": "29 يناير 2026",
    "timeline.phase4Desc": "ورش أونلاين لتصميم الروبوتات وتقديم المسودة الأولى.",
    "timeline.phase5": "نهاية الورش الأونلاين",
    "timeline.phase5Date": "31 يناير 2026",
    "timeline.phase5Desc": "انتهاء مرحلة التحضير والتصميم عن بُعد.",
    "timeline.phase6": "القبول النهائي",
    "timeline.phase6Date": "2 فبراير 2026",
    "timeline.phase6Desc": "إعلان الفرق المتأهلة للمشاركة في الحدث الحضوري.",
    "timeline.phase7": "بداية RoboRumble",
    "timeline.phase7Date": "4 فبراير 2026",
    "timeline.phase7Desc": "انطلاق الهاكاثون الحضوري: بناء، اختبار، ومنافسة.",
    "timeline.phase8": "نهائيات RoboRumble",
    "timeline.phase8Date": "7 فبراير 2026",
    "timeline.phase8Desc": "التصفيات النهائية، المعارك، وحفل الختام.",

    // FAQ
    "faq.title": "الأسئلة الشائعة",
    "faq.subtitle": "كل ما تحتاج معرفته",
    "faq.q1": "من يمكنه المشاركة؟",
    "faq.a1": "الهاكاثون مفتوح لجميع طلاب الجامعات في المملكة العربية السعودية.",
    "faq.q2": "هل أحتاج خبرة سابقة؟",
    "faq.a2": "لا! نحن نقدم ورش عمل تغطي جميع الأساسيات قبل الهاكاثون.",
    "faq.q3": "كم عدد أعضاء الفريق؟",
    "faq.a3": "كل فريق يتكون من 4 أعضاء على الأقل.",
    //"faq.q4": "ما هي الجوائز؟",
    //"faq.a4":
     // "سيتم تكريم الفرق الفائزة خلال حفل الختام وفق الجوائز التالية:\n\n🥇 المركز الأول: جائزة مالية قدرها 15,000 ريال سعودي\n\n🥈 المركز الثاني: جائزة مالية قدرها 10,000 ريال سعودي\n\n🥉 المركز الثالث: جائزة مالية قدرها 5,000 ريال سعودي\n\n🏅 جائزة لجنة التحكيم: تُمنح للفريق الذي يحقق أعلى عدد من النقاط، وتكون على شكل درع تكريمي\n\nملاحظة: جائزة لجنة التحكيم مستقلة عن المراكز الثلاثة الأولى، وقد تُمنح لأي فريق يستحقها.",
    "faq.moreQuestions": "لديك المزيد من الأسئلة؟",
    "faq.askTelegram": "اسألنا على تيليجرام",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.terms": "Participation Terms",
    "nav.schedule": "Schedule",
    "nav.sponsors": "Sponsors",
   // "nav.prizes": "Prizes",
    "nav.leaderboard": "Leaderboard",
    "nav.login": "Login",
    "nav.register": "Register Now",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.team": "Teams",
    "nav.myTeam": "My Team",
    "nav.workshops": "Workshops",

    // Hero
    "hero.title": "RoboRumble",
    "hero.slogan": "Think, Build, Battle",
    "hero.description":
      "The first hackathon of its kind in the world of competitive robotics. An educational environment, practical challenges, and engineering battles decided by precision and innovation. Join us now!",
    "hero.cta": "Register Now",
    "hero.learnMore": "Learn More",
    "hero.participants": "Participants",
    "hero.teams": "Teams",
    "hero.days": "Days",

    // About
    "about.title": "About RoboRumble",
    "about.subtitle": "The Robotics Hackathon",
    "about.description":
      "RoboRumble is the first robotics hackathon of its kind, organized by the Drones and Robotics Club at King Saud University. Where young innovators come together to design and build battle robots.",
    "about.objective1.title": "Raise Awareness",
    "about.objective1.desc": "Promote awareness of robotics and modern technologies",
    "about.objective2.title": "Competitive Spirit",
    "about.objective2.desc": "Foster fair competition among participants",
    "about.objective3.title": "Teamwork",
    "about.objective3.desc": "Enhance teamwork and collaboration skills",
    "about.objective4.title": "Technical Skills",
    "about.objective4.desc": "Teach core robotics skills",

    // Event Details
    "event.title": "Event Details",
    "event.participants": "80 Participants",
    "event.participantsDesc": "University students",
    "event.teams": "16 Teams",
    "event.teamsDesc": "Competing for the title",
    "event.duration": "4 Days",
    "event.durationDesc": "Of intensive competition",
    "event.workshops": "Workshops",
    "event.workshopsDate": "Jan 21-23, 2026",
    "event.workshopsDesc": "Online training workshops",
    "event.hackathon": "Hackathon",
    "event.hackathonDate": "Jan 28-31, 2026",
    "event.hackathonDesc": "Main competition days",
    "event.location": "Location",
    "event.locationValue": "Riyadh, Saudi Arabia",

    // Schedule
    "schedule.title": "Schedule",
    "schedule.subtitle": "Four days of creativity and challenge",
    "schedule.day1.title": "Day 1",
    "schedule.day1.subtitle": "Opening & Workshops",
    "schedule.day1.item1": "Opening Ceremony",
    "schedule.day1.item2": "Intro to Robotics & Electronics",
    "schedule.day1.item3": "Programming Workshops",
    "schedule.day1.item4": "3D Printing Workshop",
    "schedule.day2.title": "Day 2",
    "schedule.day2.subtitle": "Planning & Building",
    "schedule.day2.item1": "Assembly & Planning",
    "schedule.day2.item2": "RoboRumble Strategies",
    "schedule.day2.item3": "Team Work Sessions",
    "schedule.day3.title": "Day 3",
    "schedule.day3.subtitle": "Final Preparations",
    "schedule.day3.item1": "Final Preparations",
    "schedule.day3.item2": "Robot Testing",
    "schedule.day3.item3": "Requirements Review",
    "schedule.day4.title": "Day 4",
    "schedule.day4.subtitle": "Competition & Awards",
    "schedule.day4.item1": "Main Competitions",
    "schedule.day4.item2": "Finals",
    "schedule.day4.item3": "Awards Ceremony",

    // Sponsors
    //"sponsors.title": "Sponsors",
    //"sponsors.subtitle": "Partners in Success",
    //"sponsors.official": "Official Sponsor",
    //"sponsors.gold": "Gold Sponsors",
    //"sponsors.silver": "Silver Sponsors",
    //"sponsors.bronze": "Bronze Sponsors",
    //"sponsors.become": "Become a Sponsor",
    //"sponsors.becomeDesc": "Join us in supporting the next generation of innovators",

    // Leaderboard
    "leaderboard.title": "Leaderboard",
    "leaderboard.subtitle": "Results are updated after approval",
    "leaderboard.overall": "Overall",
    "leaderboard.daily": "Daily Ranking",
    "leaderboard.rank": "Rank",
    "leaderboard.team": "Team Name",
    "leaderboard.score": "Score",
    "leaderboard.total": "Total",
    "leaderboard.day": "Day",
    "leaderboard.noData": "No results yet",
    "leaderboard.searchTeams": "Search teams",
    "leaderboard.status": "Status",
    "leaderboard.active": "Active",
    "leaderboard.warning": "Warning",
    "leaderboard.violation": "Violation",
    "leaderboard.disqualified": "Disqualified",
    "leaderboard.teamDetails": "Team Details",
    "leaderboard.currentRank": "Current Rank",
    "leaderboard.totalScore": "Total Score",
    "leaderboard.dailyBreakdown": "Daily Score Breakdown",
    "leaderboard.penalties": "Penalties",
    "leaderboard.dayTotal": "Day Total",
    "leaderboard.judgeNotes": "Judge Notes",
    "leaderboard.noNotes": "No notes available",
    "leaderboard.backToLeaderboard": "Back to Leaderboard",
    "leaderboard.judgesAward": "Judges' Award",
    "leaderboard.judgesAwardDesc": "Highest score - Honorary Shield",

    // Workshops
    "workshops.title": "Workshops",
    "workshops.subtitle": "Workshops to prepare you for the hackathon",
    "workshops.all": "All",
    "workshops.programming": "Programming",
    "workshops.electronics": "Electronics",
    "workshops.mechanics": "Mechanics",
    "workshops.design": "Design",
    "workshops.competition": "Competition Prep",
    "workshops.search": "Search workshops",
    "workshops.details": "Details",
    "workshops.addToCalendar": "Add to Calendar",
    "workshops.beginner": "Beginner",
    "workshops.intermediate": "Intermediate",
    "workshops.advanced": "Advanced",
    "workshops.duration": "Duration",
    "workshops.presenter": "Presenter",
    "workshops.date": "Date",
    "workshops.whatYouLearn": "What You Will Learn",
    "workshops.requirements": "Requirements",
    "workshops.joinLink": "Join Link",
    "workshops.resources": "Resources",
    "workshops.notAvailable": "Not available yet",
    "workshops.noWorkshops": "No workshops available yet",
    "workshops.backToWorkshops": "Back to Workshops",

    // Footer
    "footer.organizer": "Drones and Robotics Club",
    "footer.university": "King Saud University",
    "footer.rights": "All rights reserved",
    "footer.contact": "Contact Us",
    "footer.followUs": "Follow Us",

    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.forgotPassword": "Forgot Password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.loginBtn": "Login",
    "auth.signupBtn": "Sign Up",
    "auth.loginRequired": "Login required to access this page",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Operation successful",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.submit": "Submit",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.viewDetails": "View Details",
    "common.back": "Back",

    // Timeline
    "timeline.title": "Timeline",
    "timeline.subtitle": "Your RoboRumble Journey",
    "timeline.phase1": "Open Registration",
    "timeline.phase1Date": "January 14, 2026",
    "timeline.phase1Desc": "Team registration opens for RoboRumble participants.",
    "timeline.phase2": "Registration Closed",
    "timeline.phase2Date": "January 24, 2026",
    "timeline.phase2Desc": "Registration closes and team applications are reviewed.",
    "timeline.phase3": "First Round Acceptance",
    "timeline.phase3Date": "January 27, 2026",
    "timeline.phase3Desc": "Initial accepted teams are announced.",
    "timeline.phase4": "Online Workshops Start",
    "timeline.phase4Date": "January 29, 2026",
    "timeline.phase4Desc": "Online workshop focused on robot design and first draft submission.",
    "timeline.phase5": "Online Workshops End",
    "timeline.phase5Date": "January 31, 2026",
    "timeline.phase5Desc": "End of the online preparation phase.",
    "timeline.phase6": "Final Acceptance",
    "timeline.phase6Date": "February 2, 2026",
    "timeline.phase6Desc": "Final teams are confirmed for on-site participation.",
    "timeline.phase7": "RoboRumble Begins",
    "timeline.phase7Date": "February 4, 2026",
    "timeline.phase7Desc": "On-site hackathon begins: build, test, and compete.",
    "timeline.phase8": "RoboRumble Finals & Closing",
    "timeline.phase8Date": "February 7, 2026",
    "timeline.phase8Desc": "Final battles, judging, and awards ceremony.",

    // FAQ
    "faq.title": "FAQ",
    "faq.subtitle": "Everything you need to know",
    "faq.q1": "Who can participate?",
    "faq.a1": "The hackathon is open to all university students in Saudi Arabia.",
    "faq.q2": "Do I need prior experience?",
    "faq.a2": "No! We provide workshops covering all the basics before the hackathon.",
    "faq.q3": "How many team members?",
    "faq.a3": "Each team consists of at least 4 members.",
    "faq.q4": "What are the prizes?",
    "faq.a4":
      "Winning teams will be honored during the closing ceremony with the following prizes:\n\n🥇 1st Place: Cash prize of 15,000 SAR\n\n🥈 2nd Place: Cash prize of 10,000 SAR\n\n🥉 3rd Place: Cash prize of 5,000 SAR\n\n🏅 Judges Award: Awarded to the team with the highest score, in the form of a commemorative shield\n\nNote: The Judges Award is independent of the top 3 positions and may be awarded to any deserving team.",
    "faq.moreQuestions": "Have more questions?",
    "faq.askTelegram": "Ask us on Telegram",
  },
} as const;

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("ar");

  const direction: Direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const savedLang = localStorage.getItem("roborumble-lang") as Language;
    if (savedLang && (savedLang === "ar" || savedLang === "en")) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", language);
    localStorage.setItem("roborumble-lang", language);
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
