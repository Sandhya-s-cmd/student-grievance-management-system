import React, { useState, useEffect } from 'react';
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DigitalEvidenceLayer = ({ attachments, onVerificationComplete }) => {
  const [verifications, setVerifications] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (attachments.length > 0) {
      verifyDocuments();
    }
  }, [attachments]);

  const verifyDocuments = async () => {
    setIsVerifying(true);
    const newVerifications = [];

    for (const attachment of attachments) {
      try {
        // Simulate document verification process
        const verification = await simulateDocumentVerification(attachment);
        newVerifications.push(verification);
      } catch (error) {
        newVerifications.push({
          fileName: attachment.name,
          status: 'error',
          message: 'Verification failed',
          details: error.message
        });
      }
    }

    setVerifications(newVerifications);
    setIsVerifying(false);
    
    if (onVerificationComplete) {
      onVerificationComplete(newVerifications);
    }
  };

  const simulateDocumentVerification = (attachment) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const random = Math.random();
        let status, message, details;

        if (random > 0.8) {
          status = 'verified';
          message = 'Document verified successfully';
          details = {
            checksum: generateChecksum(),
            timestamp: new Date().toISOString(),
            authenticity: 'High',
            integrity: 'Intact',
            metadata: extractMetadata(attachment)
          };
        } else if (random > 0.3) {
          status = 'warning';
          message = 'Document verified with warnings';
          details = {
            checksum: generateChecksum(),
            timestamp: new Date().toISOString(),
            authenticity: 'Medium',
            integrity: 'Minor issues detected',
            metadata: extractMetadata(attachment),
            warnings: ['File size larger than expected', 'Metadata partially missing']
          };
        } else {
          status = 'error';
          message = 'Document verification failed';
          details = {
            reason: 'File format not supported or corrupted',
            suggestions: ['Please upload a valid file format', 'Ensure file is not corrupted']
          };
        }

        resolve({
          fileName: attachment.name,
          fileSize: attachment.size,
          fileType: attachment.type,
          status,
          message,
          details
        });
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    });
  };

  const generateChecksum = () => {
    return 'SHA256:' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const extractMetadata = (attachment) => {
    return {
      originalName: attachment.name,
      uploadDate: new Date().toISOString(),
      mimeType: attachment.type || 'Unknown',
      size: attachment.size,
      lastModified: new Date().toISOString()
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <DocumentIcon className="h-8 w-8 text-gray-400" />;
    
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <DocumentIcon className="h-8 w-8 text-red-500" />;
    if (type.includes('image')) return <DocumentIcon className="h-8 w-8 text-blue-500" />;
    if (type.includes('doc')) return <DocumentIcon className="h-8 w-8 text-blue-600" />;
    if (type.includes('sheet') || type.includes('excel')) return <DocumentIcon className="h-8 w-8 text-green-600" />;
    return <DocumentIcon className="h-8 w-8 text-gray-400" />;
  };

  const viewFileDetails = (verification) => {
    setSelectedFile(verification);
  };

  const downloadVerificationReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      totalFiles: verifications.length,
      verifiedFiles: verifications.filter(v => v.status === 'verified').length,
      warningFiles: verifications.filter(v => v.status === 'warning').length,
      errorFiles: verifications.filter(v => v.status === 'error').length,
      verifications: verifications
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Digital Evidence Verification</h3>
        </div>
        
        {verifications.length > 0 && (
          <button
            onClick={downloadVerificationReport}
            className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            Download Report
          </button>
        )}
      </div>

      {isVerifying ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600">Verifying documents...</p>
          <p className="text-xs text-gray-500">This may take a few moments</p>
        </div>
      ) : (
        <>
          {verifications.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">No documents to verify</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getFileIcon(verification.fileType)}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{verification.fileName}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(verification.status)}`}>
                            {getStatusIcon(verification.status)}
                            <span className="ml-1">{verification.status.toUpperCase()}</span>
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{verification.message}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Size: {verification.fileSize}</span>
                          <span>Type: {verification.fileType || 'Unknown'}</span>
                        </div>

                        {verification.details && (
                          <button
                            onClick={() => viewFileDetails(verification)}
                            className="mt-2 flex items-center text-blue-600 hover:text-blue-500 text-sm"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Statistics */}
          {verifications.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Verification Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Verified</p>
                      <p className="text-lg font-bold text-green-900">
                        {verifications.filter(v => v.status === 'verified').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Warnings</p>
                      <p className="text-lg font-bold text-yellow-900">
                        {verifications.filter(v => v.status === 'warning').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Errors</p>
                      <p className="text-lg font-bold text-red-900">
                        {verifications.filter(v => v.status === 'error').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Verification Details: {selectedFile.fileName}
                  </h3>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Status Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Status:</span>
                          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFile.status)}`}>
                            {selectedFile.status.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Message:</span>
                          <span className="ml-2">{selectedFile.message}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedFile.details && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Technical Details</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(selectedFile.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalEvidenceLayer;
