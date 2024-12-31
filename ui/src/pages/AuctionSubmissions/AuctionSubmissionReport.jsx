import { jsPDF } from 'jspdf';
import { Button, notification } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { formatCurrency, openNotify } from '../../commons/MethodsCommons';
import font from '../../assets/Roboto-Regular-normal'
import fontMedium from '../../assets/Roboto-Medium-normal'

const generateReceiptDocument = ({ auction, customer, product }) => {
  const doc = new jsPDF();

  // Thêm fonts
  doc.addFileToVFS("Roboto-Regular.ttf", font);
  doc.addFileToVFS("Roboto-Bold.ttf", fontMedium);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFont("Roboto-Bold.ttf", "Roboto-Bold", "normal");

  // Helper function để switch font
  const setNormalFont = () => {
    doc.setFont("Roboto", "normal");
  };

  const setBoldFont = () => {
    doc.setFont("Roboto-Bold", "normal");
  };

  setNormalFont();

  // Header
  let yPos = 20;
  doc.setFontSize(14);
  setBoldFont();
  doc.text('CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', 105, yPos, { align: 'center' });

  yPos += 10;
  doc.setFontSize(12);
  doc.text('Độc lập - Tự do - Hạnh phúc', 105, yPos, { align: 'center' });
  yPos += 5;
  doc.text('_____***_____', 105, yPos, { align: 'center' });

  // Title
  yPos += 10;
  doc.setFontSize(14);
  setBoldFont();
  doc.text('BIÊN BẢN GIAO NHẬN TIỀN ĐẤU GIÁ', 105, yPos, { align: 'center' });

  // Thông tin bên A
  yPos += 7;
  doc.setFontSize(12);
  setBoldFont();
  doc.text('BÊN A (Đơn vị tổ chức đấu giá):', 20, yPos);
  setNormalFont();
  yPos += 7;
  doc.text(`Tên đơn vị: Auction House`, 25, yPos);
  yPos += 7;
  doc.text(`Mã số thuế: 3133965224`, 25, yPos);
  yPos += 7;
  doc.text(`Địa chỉ: Số 1 đường Lê Văn Việt, Thành Phố Thủ Đức, Hồ Chí Minh`, 25, yPos);

  // Thông tin bên B
  yPos += 7;
  setBoldFont();
  doc.text('BÊN B (Người có tài sản đấu giá):', 20, yPos);
  setNormalFont();
  yPos += 7;
  doc.text(`Ông/Bà: ${customer.fullName}`, 25, yPos);
  yPos += 7;
  doc.text(`Số CMND/CCCD: ${customer?.IndentifyCode || ''}`, 25, yPos);
  yPos += 7;
  doc.text(`Địa chỉ: ${customer?.address || ''}`, 25, yPos);

  // Thông tin tài sản
  yPos += 10;
  setBoldFont();
  doc.text('THÔNG TIN TÀI SẢN VÀ KẾT QUẢ ĐẤU GIÁ:', 20, yPos);
  setNormalFont();
  yPos += 7;
  doc.text(`1. Tên tài sản: ${product.productName}`, 25, yPos);
  yPos += 7;
  doc.text(`2. Mã tài sản: ${product._id}`, 25, yPos);
  yPos += 7;
  doc.text(`3. Giá khởi điểm: ${formatCurrency(auction.startingPrice)} đồng`, 25, yPos);
  yPos += 7;
  doc.text(`4. Giá trúng đấu giá: ${formatCurrency(auction.winningPrice)} đồng`, 25, yPos);
  yPos += 7;
  doc.text(`5. Phí đăng ký đấu giá: ${formatCurrency(auction.signupFee)} đồng`, 25, yPos);

  // Nội dung thỏa thuận
  yPos += 10;
  setBoldFont();
  doc.text('NỘI DUNG THOẢ THUẬN:', 20, yPos);
  setNormalFont();
  yPos += 7;
  const agreement = `Hai bên thống nhất như sau:\n` +
    `1. Bên B đã gửi tài sản "${product.productName}" cho Bên A tổ chức đấu giá.\n` +
    `2. Bên A chịu trách nhiệm tổ chức đấu giá sản phẩm cho bên B và bàn giao lại cho bên B số tiền sau khi đấu giá thành công.\n` +
    `3. Bên A chuyển lại cho Bên B số tiền ${formatCurrency(auction.winningPrice - auction.signupFee)} đồng (đã trừ phí đăng ký đấu giá).\n` +
    `4. Bên B cần cầm theo biên bản đến bên A để nhận số tiền trong 30 ngày kể từ ngày đấu giá thành công.\n`;
  const splitAgreement = doc.splitTextToSize(agreement, 170);
  doc.text(splitAgreement, 25, yPos);
  yPos += splitAgreement.length * 4;

  // Cam kết và xử lý vi phạm
  yPos += 5;
  setBoldFont();
  doc.text('CAM KẾT VÀ XỬ LÝ VI PHẠM:', 20, yPos);
  setNormalFont();
  yPos += 7;
  const violationClause = `1. Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản đã thỏa thuận trong hợp đồng này.\n` +
    `2. Trường hợp một trong hai bên không thực hiện đúng các điều khoản đã thỏa thuận:\n` +
    `   - Bên A sẽ chịu trách nhiệm bồi thường cho Bên B số tiền tương ứng giá trị tài sản đấu giá nếu không tổ chức đúng quy định hoặc không bàn giao tiền đúng hạn.\n` +
    `   - Bên B sẽ chịu trách nhiệm bồi thường cho Bên A toàn bộ chi phí tổ chức đấu giá nếu không bàn giao tài sản đúng hạn hoặc có hành vi vi phạm hợp đồng.\n` +
    `3. Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng, nếu không thành công sẽ được đưa ra tòa án có thẩm quyền để giải quyết.`;
  const splitViolationClause = doc.splitTextToSize(violationClause, 170);
  doc.text(splitViolationClause, 25, yPos);
  yPos += splitViolationClause.length * 4;

  // Điều khoản cuối
  yPos += 10;
  const finalClause = 'Biên bản lập thành 2 bản, mỗi bên giữ 1 bản và có giá trị pháp lý ngang nhau.';
  const splitClause = doc.splitTextToSize(finalClause, 170);
  doc.text(splitClause, 25, yPos);

  // Chữ ký
  yPos += 10;
  setBoldFont();
  doc.text(`TP. Hồ Chí Minh, ngày ..... tháng ..... năm ......`, 105, yPos, { align: 'center' });
  yPos += 7;
  doc.text('ĐẠI DIỆN BÊN A', 60, yPos, { align: 'center' });
  doc.text('ĐẠI DIỆN BÊN B', 150, yPos, { align: 'center' });
  setNormalFont();
  yPos += 7;
  doc.text('(Ký, ghi rõ họ tên và đóng dấu)', 60, yPos, { align: 'center' });
  doc.text('(Ký, ghi rõ họ tên)', 150, yPos, { align: 'center' });

  // Lưu file
  doc.save(`bien-ban-giao-nhan-tien.pdf`);
};

// Transaction Report Button
const TransactionReportButton = ({data,disabled}) => {
  const handleDownload = () => {
    try {
      const customer = data.registerCustomerId;
      const product = data.product;
      const auction = data;
      generateReceiptDocument({auction,customer,product});
      openNotify('success', 'Tải biên bản giao nhận tiền thành công!');
    } catch (error) {
      console.log(error)
      openNotify('error', 'Không thể tải biên bản. Vui lòng thử lại!');
    }
  };

  return (
    <Button icon={<DownloadOutlined />} onClick={handleDownload} disabled={disabled} >
      Download Transaction Report
    </Button>
  );
};

export default TransactionReportButton;
