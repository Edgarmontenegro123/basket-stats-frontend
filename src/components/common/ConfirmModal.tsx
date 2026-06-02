import type { ConfirmModalProps } from '../types/confirmModal'
import './ConfirmModal.css'

const ConfirmModal = ({
                          isOpen,
                          title,
                          message,
                          confirmLabel = 'Confirm',
                          cancelLabel = 'Cancel',
                          onConfirm,
                          onCancel,
                      }: ConfirmModalProps) => {
    if (!isOpen) {
        return null
    }

    return (
        <div className='confirm-modal-backdrop'>
            <div className='confirm-modal'>
                <div className='confirm-modal__header'>
                    <h2>{title}</h2>
                </div>

                <div className='confirm-modal__body'>
                    <p>{message}</p>
                </div>

                <div className='confirm-modal__actions'>
                    <button
                        className='confirm-modal__button confirm-modal__button--secondary'
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        className='confirm-modal__button confirm-modal__button--primary'
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal