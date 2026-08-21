import jsPDF from 'jspdf';

export const generateEsgCertificate = (companyName: string, totalWaste: number, carbonSaved: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald color
  doc.text('SERTIFIKAT KONTRIBUSI SIRKULAR (ESG)', 20, 30);

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(`Diberikan kepada: ${companyName}`, 20, 50);
  doc.text(`Atas partisipasi aktif menyalurkan limbah organik secara terintegrasi.`, 20, 60);

  doc.setFillColor(240, 253, 244);
  doc.rect(20, 75, 170, 40, 'F');

  doc.setFontSize(14);
  doc.setTextColor(6, 95, 70);
  doc.text(`Total Sampah Terolah: ${totalWaste} kg`, 30, 90);
  doc.text(`Total Emisi CO2e Dicegah: ${carbonSaved} kg`, 30, 100);

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Diverifikasi oleh BioLoop Circular Logistics Engine - ${new Date().toLocaleDateString()}`, 20, 130);

  doc.save(`Sertifikat_ESG_${companyName.replace(/\s+/g, '_')}.pdf`);
};