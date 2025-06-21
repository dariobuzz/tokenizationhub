'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { uploadKycDocument } from '@/lib/kyc-actions';

// Define form types
type FormType = 'identification' | 'address' | 'tax' | 'financial';
type StatusType = 'approved' | 'rejected' | 'pending' | 'not_submitted';

// Define document type
interface DocumentFile extends File {
  id?: string;
}

type Documents = {
  [key in FormType]: DocumentFile | null;
};

// Define status type
type KycStatus = {
  [key in FormType]: { 
    form: StatusType; 
    document: StatusType;
  };
};

// Define form data type
type FormDataType = {
  [key in FormType]: Record<string, string | boolean>;
};

// Define API response types
interface KycFormItem {
  formType: FormType;
  formData: Record<string, string | boolean>;
}

interface KycStatusResponse {
  status: KycStatus;
  isComplete: boolean;
}

const KYCContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FormType>('identification');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormDataType>({
    identification: {
      fullName: '',
      dateOfBirth: '',
      nationality: '',
      idNumber: '',
      idType: 'passport',
      expiryDate: '',
    },
    address: {
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      residenceSince: '',
    },
    tax: {
      taxIdNumber: '',
      taxResidency: '',
      taxStatus: '',
      isForeignTaxPayer: false,
      foreignTaxId: '',
    },
    financial: {
      employmentStatus: '',
      occupation: '',
      annualIncome: '',
      sourceOfFunds: '',
      purposeOfAccount: '',
    },
  });
  
  const [documents, setDocuments] = useState<Documents>({
    identification: null,
    address: null,
    tax: null,
    financial: null,
  });
  
  const [kycStatus, setKycStatus] = useState<KycStatus>({
    identification: { form: 'not_submitted', document: 'not_submitted' },
    address: { form: 'not_submitted', document: 'not_submitted' },
    tax: { form: 'not_submitted', document: 'not_submitted' },
    financial: { form: 'not_submitted', document: 'not_submitted' },
  });

  const [isKycComplete, setIsKycComplete] = useState(false);

  // Load existing form data if available
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchFormData();
      fetchKycStatus();
    }
  }, [status, session, activeTab]);

  const fetchFormData = async () => {
    try {
      const response = await fetch(`/api/kyc/forms?formType=${activeTab}`);
      if (response.ok) {
        const { data } = await response.json() as { data: KycFormItem };
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            [data.formType]: data.formData
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };
  
  const fetchKycStatus = async () => {
    try {
      const response = await fetch('/api/kyc/status');
      if (response.ok) {
        const { data } = await response.json() as { data: KycStatusResponse };
        setKycStatus(data.status);
        setIsKycComplete(data.isComplete);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const handleInputChange = (formType: FormType, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [field]: value,
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: FormType) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: e.target.files?.[0] || null,
    }));
  };

  const handleSubmitForm = async (formType: FormType) => {
    try {
      setIsSubmitting(true);
      
      if (status !== 'authenticated' || !session?.user?.id) {
        alert('Session expired. Please log in again.');
        router.push('/login');
        return;
      }
  
      // Submit only current section data
      const response = await fetch('/api/kyc/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType,
          formData: formData[formType]
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to submit ${formType} data`);
      }
  
      // Upload document only if provided for this section
      if (documents[formType]) {
        const formData = new FormData();
        formData.append('file', documents[formType] as Blob);
        formData.append('userId', session.user.id);
        formData.append('documentType', formType);
        
        await uploadKycDocument(formData);
      }
  
      // Update status only for current section
      setKycStatus(prev => ({
        ...prev,
        [formType]: {
          form: 'pending',
          document: documents[formType] ? 'pending' : prev[formType].document
        }
      }));
  
      alert(`${formType.charAt(0).toUpperCase() + formType.slice(1)} submitted successfully!`);
  
      // Move to next tab (optional)
      const tabs: FormType[] = ['identification', 'address', 'tax', 'financial'];
      const currentIndex = tabs.indexOf(formType);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
  
    } catch (error) {
      console.error(`Error submitting ${formType}:`, error);
      alert(`Error submitting ${formType}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the getStatusBadge function
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-300">
            Approved
          </span>
        );
      case 'pending':
        // Updated to use the suggested colors for better contrast (AA compliant)
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#FFF9E6] text-[#B8860B] border border-[#B8860B]">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-300">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-300">
            Not Submitted
          </span>
        );
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'identification':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.identification.fullName as string}
                  onChange={(e) => handleInputChange('identification', 'fullName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.identification.dateOfBirth as string}
                  onChange={(e) => handleInputChange('identification', 'dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.identification.nationality as string}
                  onChange={(e) => handleInputChange('identification', 'nationality', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select
                  value={formData.identification.idType as string}
                  onChange={(e) => handleInputChange('identification', 'idType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="passport">Passport</option>
                  <option value="driverLicense">Driver's License</option>
                  <option value="nationalId">National ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  value={formData.identification.idNumber as string}
                  onChange={(e) => handleInputChange('identification', 'idNumber', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.identification.expiryDate as string}
                  onChange={(e) => handleInputChange('identification', 'expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID Document</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'identification')}
                className="w-full"
                accept="image/jpeg,image/png,application/pdf"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please upload a clear photo or scan of your ID document (JPEG, PNG, or PDF)
              </p>
            </div>
          </div>
        );
        
      case 'address':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address.streetAddress as string}
                  onChange={(e) => handleInputChange('address', 'streetAddress', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.address.city as string}
                  onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input
                  type="text"
                  value={formData.address.state as string}
                  onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.address.postalCode as string}
                  onChange={(e) => handleInputChange('address', 'postalCode', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.address.country as string}
                  onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Residence Since</label>
                <input
                  type="date"
                  value={formData.address.residenceSince as string}
                  onChange={(e) => handleInputChange('address', 'residenceSince', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proof of Address</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'address')}
                className="w-full"
                accept="image/jpeg,image/png,application/pdf"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please upload a utility bill, bank statement, or government correspondence (not older than 3 months)
              </p>
            </div>
          </div>
        );
        
      case 'tax':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Number</label>
                <input
                  type="text"
                  value={formData.tax.taxIdNumber as string}
                  onChange={(e) => handleInputChange('tax', 'taxIdNumber', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Residency</label>
                <input
                  type="text"
                  value={formData.tax.taxResidency as string}
                  onChange={(e) => handleInputChange('tax', 'taxResidency', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Status</label>
                <select
                  value={formData.tax.taxStatus as string}
                  onChange={(e) => handleInputChange('tax', 'taxStatus', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Tax Status</option>
                  <option value="individual">Individual</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="trust">Trust</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.tax.isForeignTaxPayer as boolean}
                    onChange={(e) => handleInputChange('tax', 'isForeignTaxPayer', e.target.checked)}
                    className="h-4 w-4 text-[#695936] focus:ring-[#695936] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    I am a tax resident of a country other than my primary residence
                  </label>
                </div>
              </div>
              {formData.tax.isForeignTaxPayer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foreign Tax ID</label>
                  <input
                    type="text"
                    value={formData.tax.foreignTaxId as string}
                    onChange={(e) => handleInputChange('tax', 'foreignTaxId', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Tax Document</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'tax')}
                className="w-full"
                accept="image/jpeg,image/png,application/pdf"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please upload a tax certificate, W-8BEN form, or other tax documentation
              </p>
            </div>
          </div>
        );
        
      case 'financial':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                <select
                  value={formData.financial.employmentStatus as string}
                  onChange={(e) => handleInputChange('financial', 'employmentStatus', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={formData.financial.occupation as string}
                  onChange={(e) => handleInputChange('financial', 'occupation', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                <select
                  value={formData.financial.annualIncome as string}
                  onChange={(e) => handleInputChange('financial', 'annualIncome', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Range</option>
                  <option value="0-50000">$0 - $50,000</option>
                  <option value="50001-100000">$50,001 - $100,000</option>
                  <option value="100001-250000">$100,001 - $250,000</option>
                  <option value="250001-500000">$250,001 - $500,000</option>
                  <option value="500001+">$500,001+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source of Funds</label>
                <select
                  value={formData.financial.sourceOfFunds as string}
                  onChange={(e) => handleInputChange('financial', 'sourceOfFunds', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Source</option>
                  <option value="salary">Salary/Employment</option>
                  <option value="business">Business Income</option>
                  <option value="investments">Investment Returns</option>
                  <option value="inheritance">Inheritance</option>
                  <option value="savings">Savings</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Account</label>
                <select
                  value={formData.financial.purposeOfAccount as string}
                  onChange={(e) => handleInputChange('financial', 'purposeOfAccount', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="investment">Investment</option>
                  <option value="trading">Trading</option>
                  <option value="savings">Savings</option>
                  <option value="business">Business Operations</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Financial Document</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'financial')}
                className="w-full"
                accept="image/jpeg,image/png,application/pdf"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please upload a bank statement, payslip, or other proof of income
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#695936] mb-6">KYC Verification</h2>
      
      {isKycComplete ? (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <h3 className="text-lg font-medium text-green-800">KYC Verification Complete</h3>
          <p className="text-green-700 mt-2">
            Your identity has been verified. You now have full access to all platform features.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-700">
              Complete your identity verification to unlock all platform features. All information is encrypted and securely stored.
            </p>
          </div>
          
          {/* Status overview */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Verification Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between items-center p-2 border-b">
                <span>Identification</span>
                {getStatusBadge(kycStatus.identification.document)}
              </div>
              <div className="flex justify-between items-center p-2 border-b">
                <span>Address</span>
                {getStatusBadge(kycStatus.address.document)}
              </div>
              <div className="flex justify-between items-center p-2 border-b">
                <span>Tax Information</span>
                {getStatusBadge(kycStatus.tax.document)}
              </div>
              <div className="flex justify-between items-center p-2 border-b">
                <span>Financial</span>
                {getStatusBadge(kycStatus.financial.document)}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('identification')}
                className={`mr-2 py-2 px-4 font-medium text-sm ${
                  activeTab === 'identification'
                    ? 'border-b-2 border-[#695936] text-[#695936]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Identification
              </button>
              <button
                onClick={() => setActiveTab('address')}
                className={`mr-2 py-2 px-4 font-medium text-sm ${
                  activeTab === 'address'
                    ? 'border-b-2 border-[#695936] text-[#695936]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Address
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                className={`mr-2 py-2 px-4 font-medium text-sm ${
                  activeTab === 'tax'
                    ? 'border-b-2 border-[#695936] text-[#695936]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tax Info
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className={`mr-2 py-2 px-4 font-medium text-sm ${
                  activeTab === 'financial'
                    ? 'border-b-2 border-[#695936] text-[#695936]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Financial
              </button>
            </nav>
          </div>
          
          {/* Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmitForm(activeTab);
          }}>
            {renderForm()}
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-[#695936] text-white px-6 py-2 rounded-lg hover:bg-[#7a6a42] ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default KYCContent;
