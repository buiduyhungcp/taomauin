// src/CreateApp.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

// Hàm tải ảnh và chuyển thành DataURL (Promise)
const loadImageAsDataURL = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image from ${src}`));
    };
  });
};

// Hàm lấy ảnh demo từ ../images/demo
const getDemoImage = (demoFileName) => {
  try {
    const fileName = demoFileName.startsWith('./') ? demoFileName.substring(2) : demoFileName;
    const imageModule = require(`../images/demo/${fileName}`);
    return imageModule.default || imageModule;
  } catch (error) {
    return null;
  }
};

// Hàm lấy ảnh nền template từ ../images/templates
const getTemplateImage = (bgFileName) => {
  try {
    const fileName = bgFileName.startsWith('./') ? bgFileName.substring(2) : bgFileName;
    const imageModule = require(`../images/templates/${fileName}`);
    return imageModule.default || imageModule;
  } catch (error) {
    return null;
  }
};

// Các hàm chuyển đổi
function convertToVni(text) {
  return text;
}
function convertToTcvn3(text) {
  return text;
}
function convertText(text, encoding) {
  if (encoding === 'vni') return convertToVni(text);
  if (encoding === 'tcvn3') return convertToTcvn3(text);
  return text;
}
function getFontEncoding(fontName) {
  return 'unicode';
}
function adjustX(anchorX, textWidth, fieldAlign, textAlign) {
  return anchorX;
}
function calculateYPosition(userY) {
  return userY;
}

// Watermark config
const watermarkTop = { text: "TOP WATERMARK", font: "36px sans-serif", color: "#FF0000", opacity: 0.3 };
const watermarkCenter = { text: "CENTER WATERMARK", font: "48px sans-serif", color: "#0000FF", opacity: 0.3, rotation: -Math.PI / 4 };
const watermarkBottom = { text: "BOTTOM WATERMARK", font: "36px sans-serif", color: "#008000", opacity: 0.3 };

const CreateApp = ({ selectedTemplate }) => {
  const [dynamicFields, setDynamicFields] = useState({});
  const [fixedFields, setFixedFields] = useState({});
  const [generating, setGenerating] = useState(false);

  // Bảng dữ liệu "Dữ liệu đầu vào"
  const [tableData, setTableData] = useState([]);
  // Dynamic fields
  const [fetchedFields, setFetchedFields] = useState([]);
  // Fixed fields
  const [fetchedFixedFields, setFetchedFixedFields] = useState([]);
  // Danh sách font
  const [fonts, setFonts] = useState([]);
  // Danh sách khổ giấy
  const [paperSizes, setPaperSizes] = useState([]);

  const fileInputRef = useRef(null);

  // Fetch fonts
  useEffect(() => {
    fetch('http://192.168.1.122:5000/api/fonts')
      .then(res => res.json())
      .then(data => {
        if (data) setFonts(data);
      })
      .catch(err => console.error("Error fetching fonts:", err));
  }, []);

  // Fetch paper_sizes (mới thêm)
  useEffect(() => {
    fetch('http://192.168.1.122:5000/api/paper_sizes')
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data) setPaperSizes(data);
      })
      .catch(err => console.error("Error fetching paper_sizes:", err));
  }, []);

  // Fetch fixed_fields
  useEffect(() => {
    if (selectedTemplate) {
      const url = `http://192.168.1.122:5000/api/fixed_fields?template_id=${selectedTemplate.id}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setFetchedFixedFields(data);
            const initialFixed = data.reduce((acc, field) => {
              acc[field.id] = field.content || "";
              return acc;
            }, {});
            setFixedFields(initialFixed);
          } else {
            setFetchedFixedFields([]);
            setFixedFields({});
          }
        })
        .catch(err => console.error("Error fetching fixed_fields:", err));
    }
  }, [selectedTemplate]);

  // Fetch template_fields
  useEffect(() => {
    if (selectedTemplate) {
      const url = `http://192.168.1.122:5000/api/template_fields?template_id=${selectedTemplate.id}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setFetchedFields(data);
            const headerRow = data.map(field => field.name);
            setTableData([headerRow, headerRow.map(() => "")]);
          } else {
            setFetchedFields([]);
            setTableData([]);
          }
        })
        .catch(err => console.error("Error fetching template_fields:", err));
    }
  }, [selectedTemplate]);

  // Handler thay đổi dynamicFields
  const handleDynamicFieldChange = (fieldName, value) => {
    setDynamicFields(prev => ({ ...prev, [fieldName]: value }));
  };

  // Handler thay đổi fixedFields
  const handleFixedFieldChange = (fieldId, value) => {
    setFixedFields(prev => ({ ...prev, [fieldId]: value }));
  };

  // Ảnh demo
  const previewImageSrc = useMemo(() => {
    return selectedTemplate && selectedTemplate.demo ? getDemoImage(selectedTemplate.demo) : null;
  }, [selectedTemplate]);

  if (!selectedTemplate) {
    return (
      <div className="p-4">
        <h1>Create Certificate</h1>
        <p>Chưa có mẫu được chọn.</p>
      </div>
    );
  }
  if (!previewImageSrc) {
    return (
      <div className="p-4">
        <h1>Create Certificate</h1>
        <p>Không tìm thấy ảnh demo với tên: {selectedTemplate.demo}</p>
      </div>
    );
  }

  // Thêm dòng
  const addRow = () => {
    setTableData(prev => {
      if (prev.length === 0) return [];
      const header = prev[0];
      const newRow = header.map(() => "");
      return [...prev, newRow];
    });
  };

  // Tải file Excel mẫu
  const downloadSampleExcel = () => {
    if (!selectedTemplate || fetchedFields.length === 0) return;
    const header = fetchedFields.map(f => f.name);
    const ws = XLSX.utils.aoa_to_sheet([header]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, "sample.xlsx");
  };

  // Upload file Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const header = fetchedFields.map(f => f.name);
      if (JSON.stringify(jsonData[0]) !== JSON.stringify(header)) {
        alert("File Excel không có cấu trúc cột phù hợp.");
        return;
      }
      const newData = [header, ...jsonData.slice(1)];
      setTableData(newData);
    };
    reader.onerror = (err) => {
      console.error("Error reading Excel file:", err);
      alert("Lỗi khi đọc file Excel.");
    };
    reader.readAsBinaryString(file);
  };

  // Render spreadsheet
  const renderSpreadsheet = () => {
    return (
      <div id="spreadsheet-section" className="mt-3">
        <label className="form-label fw-bold">Dữ liệu đầu vào:</label>
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead className="table-light">
              <tr>
                {tableData.length > 0 &&
                  tableData[0].map((col, idx) => <th key={idx}>{col}</th>)}
                <th>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {tableData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={cell}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setTableData(prev => {
                            const newData = [...prev];
                            newData[rowIndex + 1][cellIndex] = newValue;
                            return newData;
                          });
                        }}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        setTableData(prev => prev.filter((r, i) => i !== rowIndex + 1))
                      }
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-3">
          <button className="btn btn-primary me-2" onClick={addRow}>Thêm dòng</button>
          <button className="btn btn-secondary me-2" onClick={() => fileInputRef.current.click()}>
            Nhập từ file Excel
          </button>
          <button className="btn btn-info me-2" onClick={downloadSampleExcel}>
            Tải file Excel mẫu
          </button>
          <input
            type="file"
            accept=".xls,.xlsx"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>
    );
  };

  // Render dynamic fields
  const renderDynamicFieldOptions = () => {
    if (!fetchedFields || fetchedFields.length === 0) return null;
    return (
      <div className="mt-3">
        {fetchedFields.map((field) => {
          const fieldId = field.name.replace(/\s+/g, "").toLowerCase();
          return (
            <div className="mb-3" key={fieldId}>
              <label htmlFor={fieldId} className="form-label">{field.name}:</label>
              <input
                type="text"
                id={fieldId}
                className="form-control"
                placeholder={`Nhập ${field.name}`}
                disabled
                defaultValue={field.value || ''}
              />
              <div className="row mt-2">
                {/* Ẩn X, Y, align, v.v. nếu không cần hiển thị */}
                <div className="col" style={{ display: 'none' }}>
                  <label htmlFor={`x-${fieldId}`} className="form-label">Tọa độ X:</label>
                  <input type="number" id={`x-${fieldId}`} className="form-control" defaultValue={field.x} />
                </div>
                <div className="col" style={{ display: 'none' }}>
                  <label htmlFor={`y-${fieldId}`} className="form-label">Tọa độ Y:</label>
                  <input type="number" id={`y-${fieldId}`} className="form-control" defaultValue={field.y} />
                </div>
                <div className="col" style={{ display: 'none' }}>
                  <label htmlFor={`align-${fieldId}`} className="form-label">Căn lề:</label>
                  <select id={`align-${fieldId}`} className="form-control" defaultValue={field.align}>
                    <option value="left">Căn trái</option>
                    <option value="center">Căn giữa</option>
                    <option value="right">Căn phải</option>
                  </select>
                </div>
                <div className="col">
                  <label htmlFor={`color-${fieldId}`} className="form-label">Màu sắc:</label>
                  <input type="color" id={`color-${fieldId}`} className="form-control" defaultValue={field.color || '#000000'} />
                </div>
                <div className="col">
                  <label htmlFor={`size-${fieldId}`} className="form-label">Cỡ chữ:</label>
                  <input type="number" id={`size-${fieldId}`} className="form-control" defaultValue={field.size || 14} />
                </div>
                <div className="col">
                  <label htmlFor={`font-${fieldId}`} className="form-label">Font:</label>
                  <select id={`font-${fieldId}`} className="form-control" defaultValue={field.font}>
                    {fonts.map((f, idx) => (
                      <option key={idx} value={f.name} data-path-font={f.path_font} style={{ fontFamily: f.name }}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render fixed fields (chỉ hiển thị những field có display = 1)
  const renderFixedFieldOptions = () => {
    if (!fetchedFixedFields || fetchedFixedFields.length === 0) return null;
    const visibleFixedFields = fetchedFixedFields.filter(ff => parseInt(ff.display) === 1);
    if (visibleFixedFields.length === 0) return null;
    return (
      <div className="mt-3">
        <h4 className="mb-3">Các đối tượng khác</h4>
        {visibleFixedFields.map((ff) => (
          <div key={ff.id} className="mb-3">
            <label htmlFor={`fixed-${ff.id}`} className="form-label">{ff.content}:</label>
            <input
              type="text"
              id={`fixed-${ff.id}`}
              className="form-control"
              placeholder="Nhập nội dung fixed field"
              value={fixedFields[ff.id] || ""}
              onChange={(e) => handleFixedFieldChange(ff.id, e.target.value)}
            />
            <div className="row mt-2">
              <div className="col" style={{ display: 'none' }}>
                <label htmlFor={`x-fixed-${ff.id}`} className="form-label">Tọa độ X:</label>
                <input type="number" id={`x-fixed-${ff.id}`} className="form-control" defaultValue={ff.x} />
              </div>
              <div className="col" style={{ display: 'none' }}>
                <label htmlFor={`y-fixed-${ff.id}`} className="form-label">Tọa độ Y:</label>
                <input type="number" id={`y-fixed-${ff.id}`} className="form-control" defaultValue={ff.y} />
              </div>
              <div className="col">
                <label htmlFor={`color-fixed-${ff.id}`} className="form-label">Màu sắc:</label>
                <input type="color" id={`color-fixed-${ff.id}`} className="form-control" defaultValue={ff.color || '#000000'} />
              </div>
              <div className="col">
                <label htmlFor={`size-fixed-${ff.id}`} className="form-label">Cỡ chữ:</label>
                <input type="number" id={`size-fixed-${ff.id}`} className="form-control" defaultValue={ff.size || 14} />
              </div>
              <div className="col">
                <label htmlFor={`font-fixed-${ff.id}`} className="form-label">Font:</label>
                <select id={`font-fixed-${ff.id}`} className="form-control" defaultValue={ff.font}>
                  {fonts.map((f, idx) => (
                    <option key={idx} value={f.name} data-path-font={f.path_font} style={{ fontFamily: f.name }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Hàm generatePDF
  const generatePDF = async () => {
    try { 
      setGenerating(true);
      // Tìm paper size tương ứng
      const paper = paperSizes.find(p => p.id == selectedTemplate.paper_id);
      let orientation, customFormat;
      if (paper) {
        orientation = (paper.width > paper.height) ? 'landscape' : 'portrait';
        customFormat = [paper.width, paper.height];
      } else {
        orientation = 'portrait';
        customFormat = 'a4';
      }
      
      const pdf = new jsPDF({ orientation, unit: 'mm', format: customFormat });

      // Load ảnh nền từ ../images/templates
      const bgSrc = selectedTemplate.background ? getTemplateImage(selectedTemplate.background) : null;
      if (!bgSrc) {
        throw new Error(`Failed to load template image: ${selectedTemplate.background}`);
      }
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const bgDataURL = await loadImageAsDataURL(bgSrc);
      pdf.addImage(bgDataURL, 'PNG', 0, 0, pageWidth, pageHeight);

      
      // In dynamic fields
      if (fetchedFields && fetchedFields.length > 0) {
        
        fetchedFields.forEach((field) => {
          const rawValue = dynamicFields[field.name] || "";
          const encoding = getFontEncoding(field.font || 'Helvetica');
          const text = convertText(rawValue, encoding);
          const x = Number(field.x) || 10;
          const y = Number(field.y) || 20;
          pdf.setFontSize(field.size || 14);
          pdf.setTextColor(field.color || '#000000');
          try {
            pdf.setFont(field.font || 'Helvetica');
          } catch (e) {
            pdf.setFont('Helvetica');
          }
          pdf.text(
            text,
            adjustX(x, pdf.getTextWidth(text), field.align || 'left', field.text_align || 'left'),
            calculateYPosition(y)
          );
          console.log(text);
        });
      }

      // In fixed fields (display = 1)
      if (fetchedFixedFields && fetchedFixedFields.length > 0) {
        fetchedFixedFields
          .filter(ff => parseInt(ff.display) === 1)
          .forEach((ff) => {
            const rawContent = fixedFields[ff.id] || ff.content || "";
            const encoding = getFontEncoding(ff.font || 'Helvetica');
            const text = convertText(rawContent, encoding);
            const x = Number(ff.x) || 10;
            const y = Number(ff.y) || 20;
            pdf.setFontSize(ff.size || 14);
            pdf.setTextColor(ff.color || '#000000');
            try {
              pdf.setFont(ff.font || 'Helvetica');
            } catch (e) {
              pdf.setFont('Helvetica');
            }
            pdf.text(
              text,
              adjustX(x, pdf.getTextWidth(text), ff.align || 'left', ff.text_align || 'left'),
              calculateYPosition(y)
            );
          });
      }

      // In watermark
      pdf.setFontSize(36);
      pdf.setTextColor(watermarkTop.color);
      pdf.text(watermarkTop.text, pageWidth / 2, 40, { align: 'center' });

      pdf.setFontSize(48);
      pdf.setTextColor(watermarkCenter.color);
      if (pdf.saveGraphicsState && pdf.restoreGraphicsState) {
        pdf.saveGraphicsState();
        pdf.text(watermarkCenter.text, pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: watermarkCenter.rotation * (180 / Math.PI),
          opacity: watermarkCenter.opacity
        });
        pdf.restoreGraphicsState();
      } else {
        pdf.text(watermarkCenter.text, pageWidth / 2, pageHeight / 2, { align: 'center' });
      }

      pdf.setFontSize(36);
      pdf.setTextColor(watermarkBottom.color);
      pdf.text(watermarkBottom.text, pageWidth / 2, pageHeight - 20, { align: 'center' });

      // Lưu file PDF
      pdf.save('certificate.pdf');
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Có lỗi xảy ra khi tạo PDF: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const panelStyle = {
    background: '#f0f0f0',
    padding: '10px 20px',
    marginBottom: '20px',
    borderRadius: '5px',
    textAlign: 'center'
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '800px',
    margin: '20px auto'
  };

  const imageStyle = {
    width: '100%',
    height: 'auto',
    display: 'block'
  };

  const overlayContainerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  };

  const overlayStyle = {
    position: 'absolute',
    color: '#000',
    fontSize: '18px'
  };

  return (
    <div className="container p-4">
      <div style={panelStyle}>
        <h2>{selectedTemplate.name}</h2>
        <p>{selectedTemplate.description}</p>
      </div>
      <div style={containerStyle}>
        <img src={previewImageSrc} alt="Demo" style={imageStyle} />
        <div style={overlayContainerStyle}>
          {fetchedFields &&
            fetchedFields.map((field, index) => (
              <div
                key={index}
                style={{
                  ...overlayStyle,
                  left: field.x ? `${field.x}px` : '10px',
                  top: field.y ? `${field.y}px` : `${50 + index * 30}px`,
                  color: field.color || '#000',
                  fontSize: field.size ? `${field.size}px` : '18px',
                  fontFamily: field.font || 'Helvetica'
                }}
              >
                <input
                  type="text"
                  value={dynamicFields[field.name] || ""}
                  onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%' }}
                />
              </div>
            ))}
        </div>
      </div>
      {renderSpreadsheet()}
      {renderDynamicFieldOptions()}
      {renderFixedFieldOptions()}
      <div className="text-center mt-4">
        <button className="btn btn-success btn-lg" onClick={generatePDF} disabled={generating}>
          {generating ? 'Đang tạo PDF...' : 'Tạo Thư Khen'}
        </button>
      </div>
    </div>
  );
};

export default CreateApp;
