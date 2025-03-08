'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiDownload, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get('/api/medical-records');
      setRecords(response.data);
    } catch (error) {
      toast.error('Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecord = (recordId) => {
    setSelectedRecord(selectedRecord?._id === recordId ? null : records.find(r => r._id === recordId));
  };

  const generatePDF = (record) => {
    try {
      const doc = new jsPDF();
      const patientName = record.patientId?.fullName || 'Unknown Patient';
      
      // Add hospital logo - adjusted dimensions and position
      doc.addImage('/images/hospital-logo.png', 'PNG', 15, 10, 30, 20);
      
      // Add header info - adjusted position to align with new logo size
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Hospital Registration No: HMS-2023-001', 140, 15);
      doc.text('ISO 9001:2015 Certified Institution', 140, 20);
      
      // Add horizontal line
      doc.setDrawColor(66, 135, 245);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL RECORD', 105, 45, { align: 'center' });
      
      // Enhanced Patient Information Box
      doc.setDrawColor(66, 135, 245);
      doc.setFillColor(240, 247, 255);
      doc.roundedRect(20, 55, 170, 45, 2, 2, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('PATIENT INFORMATION', 25, 63);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      // Left column - Updated to use populated fields
      doc.text([
        `Full Name: ${patientName}`,
        `Patient ID: ${record.patientId?._id || 'N/A'}`,
        `Gender: ${record.patientId?.gender || 'N/A'}`  // This will now show the actual gender
      ], 25, 73);
      
      // Right column - Updated to use populated fields
      doc.text([
        `Date: ${new Date(record.date).toLocaleDateString()}`,
        `Age: ${record.patientId?.age || 'N/A'}`,
        `Contact: ${record.patientId?.phone || 'N/A'}`  // This will now show the actual phone number
      ], 120, 73);
      
      // Clinical Details Section - adjusted Y positions after removing vital signs
      doc.setDrawColor(66, 135, 245);
      doc.setLineWidth(0.1);
      doc.line(20, 110, 190, 110);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(66, 135, 245);
      doc.text('CLINICAL ASSESSMENT', 20, 118);
      
      // Diagnosis - adjusted Y positions
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Diagnosis:', 20, 130);
      doc.setFont('helvetica', 'normal');
      const diagnosisLines = doc.splitTextToSize(record.diagnosis || 'N/A', 160);
      doc.text(diagnosisLines, 25, 138);
      
      // Clinical Notes - Update to use doctorNotes instead of clinicalNotes
      doc.setFont('helvetica', 'bold');
      doc.text('Clinical Notes:', 20, 155);
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(record.doctorNotes || 'N/A', 160);
      doc.text(notesLines, 25, 163);
      
      // Treatment Plan Section - adjusted Y positions
      doc.setDrawColor(66, 135, 245);
      doc.line(20, 180, 190, 180);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(66, 135, 245);
      doc.text('TREATMENT PLAN', 20, 188);
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const treatmentLines = doc.splitTextToSize(record.treatment || 'N/A', 160);
      doc.text(treatmentLines, 25, 198);
      
      // Medications Table - Update to include quantity in frequency
      if (record.medications && record.medications.length > 0) {
        doc.autoTable({
          startY: 215,
          head: [['Medication', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
          body: record.medications.map(med => [
            med.name || 'N/A',
            med.dosage || 'N/A',
            `${med.quantity || 'N/A'} ${med.unit || ''} per dose` || 'N/A',
            med.duration || 'N/A',
            med.instructions || 'N/A'
          ]),
          headStyles: {
            fillColor: [66, 135, 245],
            fontSize: 10,
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [60, 60, 60]
          },
          alternateRowStyles: {
            fillColor: [245, 250, 255]
          },
          margin: { left: 20, right: 20 },
          theme: 'grid'
        });
      }
      
      // Add footer with adjusted stamp size and position
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer image - adjusted to be smaller and positioned bottom left like a stamp
        doc.addImage('/images/report-footer.png', 'PNG', 20, 275, 30, 15);
        
        // Page number - kept in center
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }
  
      // Save the PDF
      doc.save(`${patientName.replace(/\s+/g, '_')}_medical_record.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>

      {/* Records List */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-xl p-6">
        <div className="space-y-4">
          {records.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No medical records found.</p>
          ) : (
            records.map((record, index) => (
              <motion.div
                key={record._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FiFileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{record.type}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => generatePDF(record)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition-colors"
                    >
                      <FiDownload className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => toggleRecord(record._id)}
                      className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                    >
                      {selectedRecord?._id === record._id ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              
                {/* Details Section */}
                <AnimatePresence>
                  {selectedRecord?._id === record._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pl-16 text-gray-600"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-gray-700">Diagnosis</h5>
                          <p className="text-gray-600">{record.diagnosis}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700">Treatment</h5>
                          <p className="text-gray-600">{record.treatment}</p>
                        </div>
                        {record.medications?.length > 0 && (
                          <div className="col-span-2">
                            <h5 className="font-medium text-gray-700 mb-2">Medications</h5>
                            <div className="grid grid-cols-3 gap-4">
                              {record.medications.map((med, idx) => (
                                <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                  <p className="font-medium text-gray-800">{med.name}</p>
                                  <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                                  <p className="text-sm text-gray-600">Duration: {med.duration}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
