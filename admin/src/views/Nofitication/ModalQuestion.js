import React from 'react';
import { CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react';

function ModalQuestion(props) {
  const { message, title, visible, setVisible, onConfirm, onCancel } = props;

  return (
    <CModal visible={visible} onClose={() => setVisible(false)} aria-labelledby="LiveDemoExampleLabel">
      <CModalHeader onClose={() => setVisible(false)}>
        <CModalTitle id="LiveDemoExampleLabel">{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>{message}</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onCancel}>
          Đóng
        </CButton>
        <CButton color="primary" onClick={onConfirm}>
          Xác nhận
        </CButton>
      </CModalFooter>
    </CModal>
  );
}

export default ModalQuestion;
