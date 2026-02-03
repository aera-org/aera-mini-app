import classNames from 'classnames';
import messageIcon from '../../assets/message.png';
import { Text } from '../text';
import { usePage } from '../../context/pageContext';
import { PAGES } from '../../constants/page';
import s from './index.module.css';
import { useChat } from '../../context/chatContext';

interface ChatUIProps {
  onInputFocusChange: (isFocused: boolean) => void;
  isChatInputFocused: boolean;
  isDesktop: boolean;
}

const MAX_CHARS = 45;

const truncateMessage = (message: string) => {
  if (message.length <= MAX_CHARS) return message;
  return message.substring(0, MAX_CHARS) + '...';
};

function ChatUI({
  onInputFocusChange,
  isDesktop,
  isChatInputFocused,
}: ChatUIProps) {
  const { setPage } = usePage();

  const {
    conversations,
    quickReplies,
    isLoading,
    inputValue,
    setInputValue,
    addConversation,
    isVisible,
  } = useChat();

  const handleFocus = () => {
    if (!isDesktop) {
      onInputFocusChange(true);
    }
  };

  const handleBlur = () => {
    if (!isDesktop) {
      onInputFocusChange(false);
    }
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    addConversation(text);
    setInputValue('');
  };

  const handleQuickReplyClick = (reply: string) => {
    addConversation(reply);
  };

  const handleMessageClick = () => {
    setPage(PAGES.CHAT);
  };

  if (!isVisible) return null;

  return (
    <div
      className={classNames(s.chatContainer, {
        [s.focus || '']: isChatInputFocused,
      })}
    >
      {conversations.map((conv, index) => (
        <div
          key={index}
          className={s.messageWrapper}
          onClick={handleMessageClick}
        >
          <div className={classNames(s.messageBubble, s.userMessage)}>
            <Text color="white" weight={400}>
              {truncateMessage(conv.user)}
            </Text>
          </div>
          {conv.ai && (
            <div className={classNames(s.messageBubble, s.aiMessage)}>
              <Text color="white" weight={400}>
                {truncateMessage(conv.ai)}
              </Text>
            </div>
          )}
        </div>
      ))}
      <div className={s.messageWrapper}>
        <div className={s.quickReplies}>
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className={s.quickReply}
              onClick={() => handleQuickReplyClick(reply)}
              disabled={isLoading}
            >
              <Text color="white" weight={400}>
                {reply}
              </Text>
            </button>
          ))}
        </div>
        <div className={s.inputArea}>
          <input
            className={s.chatInput}
            type="text"
            placeholder={isLoading ? 'Processing...' : 'Your Message...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSend();
              }
            }}
            disabled={isLoading}
          />
          <button
            className={classNames(s.sendButton, {
              [s.disabled || '']: isLoading,
            })}
            onClick={handleSend}
            disabled={isLoading}
          >
            <img className={s.sendButtonIcon} src={messageIcon} alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatUI;
