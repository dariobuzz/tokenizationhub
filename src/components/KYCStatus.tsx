'use client';
import React, { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import Link from 'next/link';

interface KYCStatusProps {
  session: Session | null;
}

// Define KYC steps and their corresponding progress percentages
const KYC_STEPS = [
  { id: 'personal', label: 'Personal Info', progress: 25 },
  { id: 'identity', label: 'Identity Verification', progress: 50 },
  { id: 'address', label: 'Address Verification', progress: 75 },
  { id: 'review', label: 'Final Review', progress: 100 }
];

const KYCStatus: React.FC<KYCStatusProps> = ({ session }) => {
  // Define a type for KYC status
  type KycStatusType = 'not_verified' | 'pending' | 'verified' | 'rejected';
  
  // State to track the current KYC step (for the progress bar)
  const [currentStep, setCurrentStep] = useState<string>('personal');
  const [currentProgress, setCurrentProgress] = useState<number>(25);
  
  // Instead of directly accessing kycVerified, we'll use a function to determine status
  const getKycStatus = (): KycStatusType => {
    if (!session?.user) return 'not_verified';
    
    // You can implement your logic here to determine KYC status
    // For example, you might check other properties or make an API call
    // For now, we'll assume all logged-in users are in pending status
    
    // Add this line to make 'verified' a possible return value
    // In a real implementation, you would check if the user is verified
    // return 'verified'; // Uncomment this line when you have verified users
    
    return 'pending';
  };
  
  const kycStatus = getKycStatus();
  
  // Fetch the current KYC step from the backend (simulated here)
  useEffect(() => {
    if (session?.user) {
      // In a real app, you would fetch this from your API
      // For demo purposes, we'll just set a step
      const fetchedStep = 'identity'; // This would come from your API
      setCurrentStep(fetchedStep);
      
      // Find the progress percentage for this step
      const stepInfo = KYC_STEPS.find(step => step.id === fetchedStep);
      if (stepInfo) {
        setCurrentProgress(stepInfo.progress);
      }
    }
  }, [session]);
  
  // Get status badge styling based on KYC status
  const getStatusBadge = (status: KycStatusType) => {
    switch (status) {
      case 'verified':
        return {
          bgColor: 'bg-green-500',
          textColor: 'text-green-800',
          bgLight: 'bg-green-100',
          label: 'Verified'
        };
      case 'pending':
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-800',
          bgLight: 'bg-yellow-100',
          label: 'Pending Verification'
        };
      case 'rejected':
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-red-800',
          bgLight: 'bg-red-100',
          label: 'Verification Failed'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-800',
          bgLight: 'bg-gray-100',
          label: 'Not Verified'
        };
    }
  };
  
  const statusBadge = getStatusBadge(kycStatus);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">KYC Status</h2>
      
      {session && kycStatus !== 'verified' && (
        <div className="mb-6">
          {/* Progress bar */}
          <div className="mb-2 flex justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span>{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-[#695936] h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between mt-1">
            {KYC_STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    currentProgress >= step.progress ? 'bg-[#695936]' : 'bg-gray-300'
                  }`}
                ></div>
                <span className={`text-xs mt-1 ${
                  currentProgress >= step.progress ? 'text-[#695936] font-medium' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!session ? (
        // Guest user
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className={`w-4 h-4 rounded-full ${statusBadge.bgColor} mr-2`}></div>
            <span className="font-medium">{statusBadge.label}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Please sign in to complete your KYC verification.
          </p>
          <Link href="/login" className="text-[#695936] hover:underline">
            Sign In
          </Link>
        </div>
      ) : kycStatus === 'verified' ? (
        // Verified user
        <div className="mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${statusBadge.bgLight} ${statusBadge.textColor}">
            <div className={`w-3 h-3 rounded-full ${statusBadge.bgColor} mr-2`}></div>
            <span>{statusBadge.label}</span>
          </div>
          <p className="text-sm text-gray-600">
            Your KYC verification is complete. You have full access to all platform features.
          </p>
        </div>
      ) : (
        // Logged in but not verified
        <div className="mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${statusBadge.bgLight} ${statusBadge.textColor}">
            <div className={`w-3 h-3 rounded-full ${statusBadge.bgColor} mr-2`}></div>
            <span>{statusBadge.label}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Complete your KYC verification to unlock all platform features.
          </p>
          
          {/* Next step guidance */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
            <h4 className="font-medium text-sm mb-2">Next Step: {
              KYC_STEPS.find(step => step.id === currentStep)?.label
            }</h4>
            <p className="text-xs text-gray-600 mb-2">
              {currentStep === 'personal' && 'Please provide your basic personal information.'}
              {currentStep === 'identity' && 'Upload your identification documents for verification.'}
              {currentStep === 'address' && 'Provide proof of address documents.'}
              {currentStep === 'review' && 'Your information is being reviewed by our team.'}
            </p>
            <Link 
              href={`/kyc/${currentStep}`} 
              className="inline-block bg-[#695936] text-white text-sm px-4 py-2 rounded hover:bg-[#7a6a42] transition-colors"
            >
              Continue Verification
            </Link>
          </div>
          
          {/* Locked features */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h4 className="font-medium text-sm mb-2">Features Requiring Verification</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
                <span>Deposits over $1,000</span>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
                <span>Withdrawals</span>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
                <span>Investment in premium assets</span>
              </li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Why KYC is Important</h3>
        <p className="text-sm text-gray-600">
          KYC verification helps us comply with regulations and protect our users from fraud.
          Your information is securely stored and never shared with third parties.
        </p>
      </div>
    </div>
  );
};

export default KYCStatus;