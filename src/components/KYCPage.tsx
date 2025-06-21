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

const KYCPage = () => {
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
  }, [status, session]);

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
  
  const getStatusBadge = (status: StatusType) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Not Submitted</span>;
    }
  };
  
  const renderDocumentPreview = (documentType: FormType) => {
    const document = documents[documentType];
    
    if (!document) {
      return (
        <div className="mt-2 text-sm text-gray-500">
          No document uploaded
        </div>
      );
    }
    
    return (
      <div className="mt-2">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Document uploaded</span>
        </div>
        <a 
          href={`/api/kyc/documents/${document.id}/blob`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-1 text-sm text-blue-600 hover:underline"
        >
          View document
        </a>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#695936] mb-6">KYC Verification</h2>
      <p className="mb-4">Logged in as: {session?.user?.name || 'User'}</p>
      
      {/* KYC Status Overview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Verification Status</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(kycStatus).map(([type, status]) => (
                <tr key={type}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 capitalize">{type}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(status.form)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(status.document)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {isKycComplete && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded">
            <p className="font-medium">Your KYC verification is complete! Thank you for providing all required information.</p>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          {['identification', 'address', 'tax', 'financial'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as FormType)}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-[#695936] text-[#695936]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Identification Form */}
      {activeTab === 'identification' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Identification Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.identification.fullName  as string}
                  onChange={(e) => handleInputChange('identification', 'fullName', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
           
                
                
                <input
                  type="date"
                  value={formData.identification.dateOfBirth as string} // Add type assertion
                  onChange={(e) => handleInputChange('identification', 'dateOfBirth', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.identification.nationality  as string}
                  onChange={(e) => handleInputChange('identification', 'nationality', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select
                  value={formData.identification.idType  as string}
                  onChange={(e) => handleInputChange('identification', 'idType', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
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
                  value={formData.identification.idNumber  as string}
                  onChange={(e) => handleInputChange('identification', 'idNumber', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.identification.expiryDate  as string}
                  onChange={(e) => handleInputChange('identification', 'expiryDate', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload ID Document
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'identification')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#695936] file:text-white
                  hover:file:bg-[#7a6a42]"
                accept="image/*,.pdf"
              />
              {renderDocumentPreview('identification')}
            </div>
            
            <button
              onClick={() => handleSubmitForm('identification')}
              disabled={isSubmitting}
              className={`w-full bg-[#695936] text-white py-3 px-4 rounded hover:bg-[#7a6a42] font-medium ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
            </button>
          </div>
        </div>
      )}
      
      {/* Rest of the component remains the same */}
      {/* Address Form */}
      {activeTab === 'address' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address.streetAddress as string}
                  onChange={(e) => handleInputChange('address', 'streetAddress', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.address.city as string}
                  onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input
                  type="text"
                  value={formData.address.state as string}
                  onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.address.postalCode as string}
                  onChange={(e) => handleInputChange('address', 'postalCode', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.address.country as string}
                  onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Residence Since</label>
                <input
                  type="date"
                  value={formData.address.residenceSince as string}
                  onChange={(e) => handleInputChange('address', 'residenceSince', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Proof of Address
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'address')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#695936] file:text-white
                  hover:file:bg-[#7a6a42]"
                accept="image/*,.pdf"
              />
              {renderDocumentPreview('address')}
            </div>
            
            <button
              onClick={() => handleSubmitForm('address')}
              disabled={isSubmitting}
              className={`w-full bg-[#695936] text-white py-3 px-4 rounded hover:bg-[#7a6a42] font-medium ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
            </button>
          </div>
        </div>
      )}
      
      {/* Tax Form */}
      {activeTab === 'tax' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Number</label>
                <input
                  type="text"
                  value={formData.tax.taxIdNumber as string}
                  onChange={(e) => handleInputChange('tax', 'taxIdNumber', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Residency</label>
                <input
                  type="text"
                  value={formData.tax.taxResidency as string}
                  onChange={(e) => handleInputChange('tax', 'taxResidency', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Status</label>
                <select
                  value={formData.tax.taxStatus as string}
                  onChange={(e) => handleInputChange('tax', 'taxStatus', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                >
                  <option value="">Select status</option>
                  <option value="resident">Tax Resident</option>
                  <option value="non_resident">Non-Resident</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.tax.isForeignTaxPayer as boolean}
                  onChange={(e) => handleInputChange('tax', 'isForeignTaxPayer', e.target.checked)}
                  className="h-4 w-4 text-[#695936] focus:ring-[#695936] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Foreign Tax Payer</label>
              </div>
              {formData.tax.isForeignTaxPayer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foreign Tax ID</label>
                  <input
                    type="text"
                    value={formData.tax.foreignTaxId as string}
                    onChange={(e) => handleInputChange('tax', 'foreignTaxId', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Tax Document
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'tax')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#695936] file:text-white
                  hover:file:bg-[#7a6a42]"
                accept="image/*,.pdf"
              />
              {renderDocumentPreview('tax')}
            </div>
            
            <button
              onClick={() => handleSubmitForm('tax')}
              disabled={isSubmitting}
              className={`w-full bg-[#695936] text-white py-3 px-4 rounded hover:bg-[#7a6a42] font-medium ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
            </button>
          </div>
        </div>
      )}
      
      {/* Financial Form */}
      {activeTab === 'financial' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                <select
                  value={formData.financial.employmentStatus as string}
                  onChange={(e) => handleInputChange('financial', 'employmentStatus', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={formData.financial.occupation as string}
                  onChange={(e) => handleInputChange('financial', 'occupation', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                <select
                  value={formData.financial.annualIncome as string}
                  onChange={(e) => handleInputChange('financial', 'annualIncome', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                >
                  <option value="">Select range</option>
                  <option value="0-25000">€0 - €25,000</option>
                  <option value="25001-50000">€25,001 - €50,000</option>
                  <option value="50001-100000">€50,001 - €100,000</option>
                  <option value="100001+">€100,001+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source of Funds</label>
                <select
                  value={formData.financial.sourceOfFunds as string}
                  onChange={(e) => handleInputChange('financial', 'sourceOfFunds', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                >
                  <option value="">Select source</option>
                  <option value="salary">Salary</option>
                  <option value="savings">Savings</option>
                  <option value="investments">Investments</option>
                  <option value="inheritance">Inheritance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Account</label>
                <select
                  value={formData.financial.purposeOfAccount as string}
                  onChange={(e) => handleInputChange('financial', 'purposeOfAccount', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-[#695936] focus:border-[#695936]"
                  required
                >
                  <option value="">Select purpose</option>
                  <option value="personal_use">Personal Use</option>
                  <option value="business">Business</option>
                  <option value="investing">Investing</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Financial Document
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'financial')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#695936] file:text-white
                  hover:file:bg-[#7a6a42]"
                accept="image/*,.pdf"
              />
              {renderDocumentPreview('financial')}
            </div>
            
            <button
              onClick={() => handleSubmitForm('financial')}
              disabled={isSubmitting}
              className={`w-full bg-[#695936] text-white py-3 px-4 rounded hover:bg-[#7a6a42] font-medium ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Verification'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCPage;