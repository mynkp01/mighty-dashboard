import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { showToast } from '../../utils/helper';
import { Modal } from '../ui/modal';

const ImportExcel = ({
  isOpen,
  closeModal,
  handleFetchData,
  endPoint,
}: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
    }
  };

  const handleImportExcelData = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile!);

    try {
      const { data, status } = await endPoint(formData);
      if (status === 200 || status === 201) {
        showToast('success', data?.message);
        handleFetchData();
        closeModal();
        setSelectedFile(null);
      }
    } catch (error: any) {
      showToast('error', error?.message);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[800px] max-h-[600px] m-4 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Import Excel File
          </h2>
          <p className="text-gray-600 dark:text-gray-400 sm:text-base text-sm">
            Upload your Excel files to import data
          </p>
        </div>

        {/* Drop Zone */}
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-12 text-center cursor-pointer transition-all duration-300 ease-in-out transform ${
              isDragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10'
            }`}
          >
            <input {...getInputProps()} />

            {/* Excel Icon */}
            <div className="mb-6 flex justify-center">
              <div
                className={`flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-2xl transition-all duration-300 ${
                  isDragActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                }`}
              >
                <svg
                  className="h-8 sm:h-10 w-8 sm:w-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3
                className={`text-xl font-semibold transition-colors duration-300 ${
                  isDragActive
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {isDragActive
                  ? 'Drop your Excel file here!'
                  : 'Upload Excel File'}
              </h3>

              <p className="text-gray-500 text-sm sm:text-base dark:text-gray-400 max-w-md mx-auto">
                Drag and drop your Excel file (.xlsx, .xls) here, or click to
                browse and select a file
              </p>
            </div>

            {/* File Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Supported: .xlsx, .xls
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Max size: 10MB
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Selected File Display */
          <div className="bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-700 rounded-2xl p-4 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* File Icon */}
                <div className="flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg">
                  <svg
                    className="h-6 sm:h-8 w-6 sm:w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                </div>

                {/* File Details */}
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg text-wrap font-semibold text-gray-800 dark:text-white truncate max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formatFileSize(selectedFile.size)} • Excel File
                  </p>
                  <div className="mt-2 flex text-xs sm:text-sm items-center text-primary-600 dark:text-primary-400">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">Ready to import</span>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={removeFile}
                className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                title="Remove file"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Change File Option */}
            <div className="mt-3 sm:mt-6 pt-2 sm:pt-4 border-t border-primary-200 dark:border-primary-700">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm underline cursor-pointer">
                  Choose a different file
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => {
              closeModal();
              setSelectedFile(null);
            }}
            className="px-6 py-2 sm:py-2.5 sm:text-base text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            disabled={!selectedFile}
            className={`px-6 py-2 sm:py-2.5 sm:text-base text-sm rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
              selectedFile
                ? 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => handleImportExcelData()}
          >
            Import
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportExcel;
