'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingStates';

// Types
type KYCStep = 'personal' | 'identity' | 'address' | 'financial' | 'review';
type DocumentType = 'passport' | 'id_card' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'tax_document';
type KYCStatus = 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  email: string;
}

interface IdentityInfo {
  documentType: DocumentType;
  documentNumber: string;
  expiryDate: string;
  issuingCountry: string;
  documentFile?: File;
}

interface AddressInfo {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  proofOfAddressFile?: File;
}

interface FinancialInfo {
  employmentStatus: string;
  occupation: string;
  annualIncome: string;
  sourceOfFunds: string;
  investmentExperience: string;
  riskTolerance: string;
}

interface KYCData {
  personal: PersonalInfo;
  identity: IdentityInfo;
  address: AddressInfo;
  financial: FinancialInfo;
}

// File Upload Component
const FileUpload: React.FC<{
  label: string;
  description: string;
  acceptedTypes: string[];
  file?: File;
  onFileSelect: (file: File | undefined) => void;
  required?: boolean;
}> = ({ label, description, acceptedTypes, file, onFileSelect, required = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    onFileSelect(selectedFile);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-gray-500">{description}</p>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          isDragOver
            ? 'border-[#695936] bg-[#695936]/5'
            : file
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-sm font-medium text-green-700">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button
              onClick={() => onFileSelect(undefined)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <span className="text-3xl text-gray-400">📎</span>
            </div>
            <div>
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-[#695936] hover:text-[#7a6a42]">
                  Upload a file
                </span>
                <span className="text-sm text-gray-500"> or drag and drop</span>
                <input
                  type="file"
                  className="hidden"
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileSelect}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {acceptedTypes.join(', ')} up to 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Progress Indicator
const ProgressIndicator: React.FC<{ currentStep: KYCStep; completedSteps: KYCStep[] }> = ({ 
  currentStep, 
  completedSteps 
}) => {
  const steps = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'identity', label: 'Identity', icon: '🆔' },
    { id: 'address', label: 'Address', icon: '🏠' },
    { id: 'financial', label: 'Financial', icon: '💼' },
    { id: 'review', label: 'Review', icon: '✅' }
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const currentIndex = getCurrentStepIndex();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id as KYCStep);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isCompleted || isPast
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-[#695936] border-[#695936] text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span className="text-lg">
                  {isCompleted || isPast ? '✓' : step.icon}
                </span>
              </motion.div>
              
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  isPast || (isCurrent && index < currentIndex) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {steps[currentIndex]?.label}
        </h2>
        <p className="text-sm text-gray-500">
          Step {currentIndex + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
};

// Personal Info Step
const PersonalInfoStep: React.FC<{
  data: PersonalInfo;
  onChange: (data: Partial<PersonalInfo>) => void;
}> = ({ data, onChange }) => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        <p className="text-sm text-gray-500 mt-1">
          Please provide your basic personal details as they appear on your official documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
            placeholder="Enter your last name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nationality <span className="text-red-500">*</span>
          </label>
          <select
            value={data.nationality}
            onChange={(e) => onChange({ nationality: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
            required
          >
            <option value="">Select nationality</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="AE">United Arab Emirates</option>
            {/* Add more countries as needed */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => onChange({ phoneNumber: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
            placeholder="your.email@example.com"
            required
          />
        </div>
      </div>
    </motion.div>
  );
};

// Identity Step
const IdentityStep: React.FC<{
  data: IdentityInfo;
  onChange: (data: Partial<IdentityInfo>) => void;
}> = ({ data, onChange }) => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Identity Verification</h3>
        <p className="text-sm text-gray-500 mt-1">
          Upload a clear photo of your government-issued ID document.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data.documentType}
            onChange={(e) => onChange({ documentType: e.target.value as DocumentType })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
            required
          >
            <option value="">Select document type</option>
            <option value="passport">Passport</option>
            <option value="id_card">National ID Card</option>
            <option value="drivers_license">Driver's License</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.documentNumber}
              onChange={(e) => onChange({ documentNumber: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
              placeholder="Enter document number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data.expiryDate}
              onChange={(e) => onChange({ expiryDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issuing Country <span className="text-red-500">*</span>
          </label>
          <select
            value={data.issuingCountry}
            onChange={(e) => onChange({ issuingCountry: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#695936] focus:border-[#695936]"
            required
          >
            <option value="">Select issuing country</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="AE">United Arab Emirates</option>
          </select>
        </div>

        <FileUpload
          label="Document Photo"
          description="Upload a clear, high-resolution photo of your ID document. Both sides may be required."
          acceptedTypes={['.jpg', '.jpeg', '.png', '.pdf']}
          file={data.documentFile}
          onFileSelect={(file) => onChange({ documentFile: file })}
          required
        />
      </div>
    </motion.div>
  );
};

// Main KYC Component
const KYCPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<KYCStep>('personal');
  const [completedSteps, setCompletedSteps] = useState<KYCStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>('not_started');

  const [kycData, setKycData] = useState<KYCData>({
    personal: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      phoneNumber: '',
      email: session?.user?.email || ''
    },
    identity: {
      documentType: 'passport',
      documentNumber: '',
      expiryDate: '',
      issuingCountry: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    financial: {
      employmentStatus: '',
      occupation: '',
      annualIncome: '',
      sourceOfFunds: '',
      investmentExperience: '',
      riskTolerance: ''
    }
  });

  const updatePersonalInfo = useCallback((data: Partial<PersonalInfo>) => {
    setKycData(prev => ({
      ...prev,
      personal: { ...prev.personal, ...data }
    }));
  }, []);

  const updateIdentityInfo = useCallback((data: Partial<IdentityInfo>) => {
    setKycData(prev => ({
      ...prev,
      identity: { ...prev.identity, ...data }
    }));
  }, []);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'personal':
        const { firstName, lastName, dateOfBirth, nationality, phoneNumber, email } = kycData.personal;
        return !!(firstName && lastName && dateOfBirth && nationality && phoneNumber && email);
      
      case 'identity':
        const { documentType, documentNumber, expiryDate, issuingCountry, documentFile } = kycData.identity;
        return !!(documentType && documentNumber && expiryDate && issuingCountry && documentFile);
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      alert('Please complete all required fields before proceeding.');
      return;
    }

    const steps: KYCStep[] = ['personal', 'identity', 'address', 'financial', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      const nextStepValue = steps[currentIndex + 1];
      setCurrentStep(nextStepValue);
      
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
    }
  };

  const prevStep = () => {
    const steps: KYCStep[] = ['personal', 'identity', 'address', 'financial', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <PersonalInfoStep
            data={kycData.personal}
            onChange={updatePersonalInfo}
          />
        );
      
      case 'identity':
        return (
          <IdentityStep
            data={kycData.identity}
            onChange={updateIdentityInfo}
          />
        );
      
      // Add other steps as needed
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Step Under Development
            </h3>
            <p className="text-gray-500">This step will be available soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
        <p className="text-gray-500">
          Complete your identity verification to unlock all platform features
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} completedSteps={completedSteps} />

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <motion.button
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentStep === 'personal'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={prevStep}
          disabled={currentStep === 'personal'}
          whileHover={currentStep !== 'personal' ? { scale: 1.02 } : {}}
          whileTap={currentStep !== 'personal' ? { scale: 0.98 } : {}}
        >
          Previous
        </motion.button>

        <motion.button
          className="px-8 py-3 bg-[#695936] text-white rounded-lg font-medium hover:bg-[#7a6a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={nextStep}
          disabled={!validateCurrentStep() || isSubmitting}
          whileHover={validateCurrentStep() && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={validateCurrentStep() && !isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Processing...</span>
            </>
          ) : currentStep === 'review' ? (
            'Submit Application'
          ) : (
            'Continue'
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default KYCPage;