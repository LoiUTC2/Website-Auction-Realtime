import React, { useState } from "react";
import styles from '../../scss/AuctionsComponentApprove.module.scss';

function AuctionApproveValues({ auction, onClose, onApprove }) {
  const [values, setValues] = useState({
    startTime: auction.startTime || "",
    endTime: auction.endTime || "",
    registrationOpenDate: auction.registrationOpenDate || "",
    registrationCloseDate: auction.registrationCloseDate || "",
    reservePrice: auction.reservePrice || "",
    registrationFee: auction.registrationFee || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApprove(values); // Gửi dữ liệu qua hàm xử lý phê duyệt
  };
  const handleOutsideClick = (e) => {
    onClose();
  };

  return (
    <div className={styles["modal"]} onClick={handleOutsideClick}>
        <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>
            <span className={styles["modal-close-icon"]} onClick={onClose}>&times;</span> {/* Icon đóng */}
            <h2>Phê duyệt phiên đấu giá</h2>
            <form onSubmit={handleSubmit}>
            <label>Thời gian bắt đầu:</label>
            <input
                type="datetime-local"
                name="startTime"
                value={values.startTime}
                onChange={handleChange}
                required
            />
            <label>Thời gian kết thúc:</label>
            <input
                type="datetime-local"
                name="endTime"
                value={values.endTime}
                onChange={handleChange}
                required
            />
            <label>Thời gian mở đăng kí:</label>
            <input
                type="datetime-local"
                name="registrationOpenDate"
                value={values.registrationOpenDate}
                onChange={handleChange}
                required
            />
            <label>Thời gian đóng đăng kí:</label>
            <input
                type="datetime-local"
                name="registrationCloseDate"
                value={values.registrationCloseDate}
                onChange={handleChange}
                required
            />
            <label>Mức giá tối thiểu:</label>
            <input
                type="number"
                name="reservePrice"
                value={values.reservePrice}
                onChange={handleChange}
                required
            />
            <label>Lệ phí đăng kí:</label>
            <input
                type="number"
                name="registrationFee"
                value={values.registrationFee}
                onChange={handleChange}
                required
            />

            <div className={styles["modal-actions"]}>
                <button type="submit" className={styles["approve-button"]}>
                Phê duyệt
                </button>
                <button type="button" className={styles["sclose-button"]} onClick={onClose}>
                Đóng
                </button>
            </div>
            </form>
        </div>
    </div>

  );
}

export default AuctionApproveValues;
