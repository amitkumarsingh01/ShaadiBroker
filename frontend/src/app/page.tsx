'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Globe, Loader2, CheckCircle, ChevronUp } from 'lucide-react';

// Language translations
const translations = {
  en: {
    title: "Shadi Broker",
    subtitle: "All-community Bride-Groom Information Center",
    fullName: "Full Name",
    gender: "Gender",
    dateOfBirth: "Date of Birth",
    permanentAddress: "Permanent Address",
    pinCode: "PIN CODE/ZIP CODE",
    taluk: "Taluk",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    education: "Education",
    occupation: "Occupation",
    caste: "Caste",
    complexion: "Complexion",
    height: "Height",
    weight: "Weight",
    siblingsCount: "Number of Siblings",
    assetDetails: "Asset Details",
    dataVerification: "All the data as per my knowledge is correct",
    required: "Required",
    male: "MALE",
    female: "FEMALE",
    submit: "Submit",
    loading: "Loading...",
    success: "Profile created successfully!",
    error: "Something went wrong!",
    answered: "Answered",
    of: "of"
  },
  kn: {
    title: "ಶಾದಿ ಬ್ರೋಕರ್",
    subtitle: "ಸರ್ವಜನಾಂಗೀಯ ವಧು-ವರರ ಮಾಹಿತಿ ಕೇಂದ್ರ",
    fullName: "ವಧು/ವರನ ಪೂರ್ಣ ಹೆಸರು",
    gender: "ಲಿಂಗ",
    dateOfBirth: "ವಧು/ವರನ ಹುಟ್ಟಿದ ದಿನಾಂಕ",
    permanentAddress: "ವಧು/ವರನ ಖಾಯಂ ವಿಳಾಸ",
    pinCode: "ವಧು/ವರನ PIN CODE/ZIP CODE",
    taluk: "ವಧು/ವರನ ತಾಲೂಕು",
    fatherName: "ವಧು/ವರನ ತಂದೆ ಹೆಸರು",
    motherName: "ವಧು/ವರನ ತಾಯಿ ಹೆಸರು",
    education: "ವಧು/ವರನ ಶಿಕ್ಷಣ",
    occupation: "ವಧು/ವರನ ಉದ್ಯೋಗ",
    caste: "ವಧು/ವರನ ಜಾತಿ",
    complexion: "ವಧು/ವರನ ಬೆಡಗು",
    height: "ವಧು/ವರನ ಎತ್ತರ",
    weight: "ವಧು/ವರನ ತೂಕ",
    siblingsCount: "ವಧು/ವರನ ಸಹೋದರರ ಸಂಖ್ಯೆ",
    assetDetails: "ವಧು/ವರನ ಆಸ್ತಿ ವಿವರ",
    dataVerification: "ನನ್ನ ಜ್ಞಾನದ ಪ್ರಕಾರ ಎಲ್ಲಾ ಡೇಟಾ ಸರಿಯಾಗಿದೆ",
    required: "Required",
    male: "ಪುರುಷ",
    female: "ಮಹಿಳೆ",
    submit: "ಸಲ್ಲಿಸಿ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    success: "ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!",
    error: "ಏನೋ ತಪ್ಪಾಗಿದೆ!",
    answered: "ಉತ್ತರಿಸಲಾಗಿದೆ",
    of: "ನಲ್ಲಿ"
  }
};

interface FormData {
  full_name: string;
  gender: string;
  date_of_birth: string;
  permanent_address: string;
  pin_code: string;
  taluk: string;
  father_name: string;
  mother_name: string;
  education: string;
  occupation: string;
  caste: string;
  complexion: string;
  height: string;
  weight: string;
  siblings_count: string;
  asset_details: string;
  data_verification: boolean;
}

const questions = [
  { id: 1, field: 'full_name', label: 'fullName' },
  { id: 2, field: 'gender', label: 'gender', type: 'radio' },
  { id: 3, field: 'date_of_birth', label: 'dateOfBirth', type: 'date' },
  { id: 4, field: 'permanent_address', label: 'permanentAddress', type: 'textarea' },
  { id: 5, field: 'pin_code', label: 'pinCode' },
  { id: 6, field: 'taluk', label: 'taluk' },
  { id: 7, field: 'father_name', label: 'fatherName' },
  { id: 8, field: 'mother_name', label: 'motherName' },
  { id: 9, field: 'education', label: 'education' },
  { id: 10, field: 'occupation', label: 'occupation' },
  { id: 11, field: 'caste', label: 'caste' },
  { id: 12, field: 'complexion', label: 'complexion' },
  { id: 13, field: 'height', label: 'height' },
  { id: 14, field: 'weight', label: 'weight' },
  { id: 15, field: 'siblings_count', label: 'siblingsCount', type: 'number' },
  { id: 16, field: 'asset_details', label: 'assetDetails', type: 'textarea' },
  { id: 17, field: 'data_verification', label: 'dataVerification', type: 'checkbox' }
];

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'kn'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [dataVerified, setDataVerified] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  const t = translations[language];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>();

  const watchedValues = watch();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  };

  const onSubmit = async (data: FormData) => {
    if (!dataVerified) {
      toast.error('Please verify that all data is correct');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/profiles', {
        ...data,
        payment_status: false
      });
      
      toast.success(t.success);
      setShowSuccess(true);
      reset();
      setDataVerified(false);
      setAnsweredQuestions(new Set());
    } catch (error) {
      console.error('Profile creation failed:', error);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (questionId: number, value: any) => {
    if (value && value.toString().trim() !== '') {
      setAnsweredQuestions(prev => new Set([...prev, questionId]));
    } else {
      setAnsweredQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const renderQuestion = (question: any) => {
    const { id, field, label, type = 'text' } = question;
    const isAnswered = answeredQuestions.has(id);
    const hasError = errors[field as keyof FormData];

    if (type === 'checkbox') {
      return (
        <div key={id} className="mb-6">
          <div className="bg-red-800 text-white px-4 py-3 rounded-t-lg">
            <span className="font-medium">{id}. {t[label as keyof typeof t]}</span>
          </div>
          <div className="bg-white p-4 rounded-b-lg">
            <label className="flex items-center text-black font-medium">
              <input
                type="checkbox"
                {...register(field as keyof FormData, { required: true })}
                onChange={(e) => {
                  setDataVerified(e.target.checked);
                  handleQuestionChange(id, e.target.checked);
                }}
                className="mr-2"
              />
              {t[label as keyof typeof t]}
            </label>
            {hasError && <p className="text-red-500 text-sm mt-1">{t.required}</p>}
          </div>
        </div>
      );
    }

    return (
      <div key={id} className="mb-6">
        <div className="bg-red-800 text-white px-4 py-3 rounded-t-lg">
          <span className="font-medium">{id}. {t[label as keyof typeof t]}</span>
        </div>
        <div className="bg-white p-4 rounded-b-lg">
          {type === 'radio' ? (
            <div className="space-y-2">
              <label className="flex items-center text-black font-medium">
                <input
                  type="radio"
                  value="male"
                  {...register(field as keyof FormData, { required: true })}
                  onChange={(e) => handleQuestionChange(id, e.target.value)}
                  className="mr-2"
                />
                {t.male}
              </label>
              <label className="flex items-center text-black font-medium">
                <input
                  type="radio"
                  value="female"
                  {...register(field as keyof FormData, { required: true })}
                  onChange={(e) => handleQuestionChange(id, e.target.value)}
                  className="mr-2"
                />
                {t.female}
              </label>
            </div>
          ) : type === 'textarea' ? (
            <textarea
              {...register(field as keyof FormData, { required: true })}
              onChange={(e) => handleQuestionChange(id, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black placeholder-gray-500"
            />
          ) : (
            <input
              type={type}
              {...register(field as keyof FormData, { required: true })}
              onChange={(e) => handleQuestionChange(id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black placeholder-gray-500"
            />
          )}
          
          {hasError && <p className="text-red-500 text-sm mt-1">{t.required}</p>}
        </div>
      </div>
    );
  };

  // Success Screen
  if (showSuccess) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center"
        style={{ backgroundImage: 'url(/bg.png)' }}
      >
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 max-w-md mx-4">
          <div className="mb-6">
            <img 
              src="/img.gif" 
              alt="Success Animation" 
              className="w-32 h-32 mx-auto rounded-lg"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {language === 'en' ? 'Profile Submitted Successfully!' : 'ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'en' 
              ? 'Thank you for submitting your matrimonial profile. We will contact you soon.' 
              : 'ನಿಮ್ಮ ವಿವಾಹ ಪ್ರೊಫೈಲ್ ಸಲ್ಲಿಸಿದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಾವು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.'}
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {language === 'en' ? 'Submit Another Profile' : 'ಮತ್ತೊಂದು ಪ್ರೊಫೈಲ್ ಸಲ್ಲಿಸಿ'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: 'url(/bg.png)' }}
    >
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo.png" 
              alt="Shadi Broker Logo" 
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t.title}</h1>
              <p className="text-xs sm:text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Globe size={16} />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <form id="shadi-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {questions.map(renderQuestion)}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isLoading || !dataVerified}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
                isLoading || !dataVerified
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 size={20} className="animate-spin" />
                  <span>{t.loading}</span>
                </div>
              ) : (
                t.submit
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-red-800 text-white px-4 py-3 z-50">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{t.answered} {answeredQuestions.size} {t.of} {questions.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronUp size={20} />
            </button>
            <button
              type="submit"
              form="shadi-form"
              disabled={isLoading || !dataVerified}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
