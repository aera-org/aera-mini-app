import classNames from 'classnames';
import { Text } from '../text';
import style from './index.module.css';

const Modal = ({
  children,
  title,
  onClose,
  isOpen,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
  isOpen: boolean;
}) => {
  return (
    <div
      className={classNames(style.background, { [style.isOpen || '']: isOpen })}
      onClick={onClose}
    >
      {title && <Text>{title}</Text>}
      <div
        className={style.content}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {onClose && (
          <button
            className={style.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              fill="#fff"
              viewBox="16 16 896 896"
              width={16}
              height={16}
              focusable="false"
            >
              <path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
