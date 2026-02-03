import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { sendMessage } from '../../api/messages';
import { useUser } from '../../context/userContext';
import { useChat } from '../../context/chatContext';
import { useChatControls } from '../../hooks/useChatControls';
import UnlockModal from '../../components/unlockModal';
import UpgradeModal from '../../components/upgradeModal';
import { Text } from '../../components/text';
import VideoRecorderModal from '../../components/videoRecorderModal';
import TelegramWebAudioPlayer from '../../components/audioMessage/TelegramWebAudioPlayer';
import VideoPlayer from '../../components/videoMessage/VideoPlayer';
import s from './index.module.css';
import { logger } from '../../utils/logger';
import { formatTimestamp } from '../../utils/time';
import electra from '../../assets/girls/electra.webp';
import { icons } from '@/assets/icons';

type MessageType = 'text' | 'audio' | 'video' | 'photo';

type Conversation = {
  user: string;
  ai: string;
  messageType: MessageType;
  options?: string[];
  timestamp?: number;
  audioBlob?: Blob;
  videoBlob?: Blob;
  imageBlob?: Blob;
};

const STORAGE_KEY = 'chat_history';

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { quickReplies } = useChat();

  // Audio recording completion handler
  const handleAudioRecordingComplete = async (audioBlob: Blob) => {
    console.log('🎵 Chat: handleAudioRecordingComplete called');
    console.log('🎵 Chat: audioBlob size:', audioBlob.size);
    console.log('🎵 Chat: audioBlob type:', audioBlob.type);

    const newConversation: Conversation = {
      user: '',
      ai: '...',
      messageType: 'audio',
      timestamp: Date.now(),
      audioBlob: audioBlob,
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    saveChatHistory(updatedConversations);
  };

  // Video recording completion handler
  const handleVideoRecordingComplete = async (videoBlob: Blob) => {
    console.log('🎥 Chat: handleVideoRecordingComplete called');
    console.log('🎥 Chat: videoBlob size:', videoBlob.size);
    console.log('🎥 Chat: videoBlob type:', videoBlob.type);

    const newConversation: Conversation = {
      user: '',
      ai: '...',
      messageType: 'video',
      timestamp: Date.now(),
      videoBlob: videoBlob,
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    saveChatHistory(updatedConversations);
    setIsLoading(true);

    // Send message to API
    if (!user) return;

    try {
      const response = await sendMessage({
        chat_id: user.id,
        bot_name: 'Electra',
        message: 'User sent a video',
      });

      const finalConversations = updatedConversations.map((conv, index) => {
        if (index === updatedConversations.length - 1) {
          return {
            ...conv,
            ai:
              response.messages[0]?.content ||
              'Amazing video! I love watching your content! 🎥',
            options: response.options || [],
          };
        }
        return conv;
      }) as Conversation[];

      setConversations(finalConversations);
      saveChatHistory(finalConversations);
    } catch (error) {
      logger.error('Failed to send video message', { error: String(error) });
      const errorConversations = updatedConversations.map((conv, index) => {
        if (index === updatedConversations.length - 1) {
          return {
            ...conv,
            ai: 'Sorry, there was an error processing your video.',
          };
        }
        return conv;
      });

      setConversations(errorConversations);
      saveChatHistory(errorConversations);
    } finally {
      setIsLoading(false);
    }
  };

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    console.log('📷 Chat: handleImageUpload called');
    console.log('📷 Chat: file size:', file.size);
    console.log('📷 Chat: file type:', file.type);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ Only image files are allowed');
      return;
    }

    // Convert File to Blob
    const imageBlob = new Blob([file], { type: file.type });

    const newConversation: Conversation = {
      user: '',
      ai: '...',
      messageType: 'photo',
      timestamp: Date.now(),
      imageBlob: imageBlob,
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    saveChatHistory(updatedConversations);
    setIsLoading(true);

    // Send message to API (currently just shows as image message)
    if (!user) return;

    try {
      const response = await sendMessage({
        chat_id: user.id,
        bot_name: 'Electra',
        message: 'User sent a photo',
      });

      const finalConversations = updatedConversations.map((conv, index) => {
        if (index === updatedConversations.length - 1) {
          return {
            ...conv,
            ai:
              response.messages[0]?.content ||
              'I can see your photo! It looks amazing! 📸',
            options: response.options || [],
          };
        }
        return conv;
      }) as Conversation[];

      setConversations(finalConversations);
      saveChatHistory(finalConversations);
    } catch (error) {
      logger.error('Failed to send image message', { error: String(error) });
      const errorConversations = updatedConversations.map((conv, index) => {
        if (index === updatedConversations.length - 1) {
          return {
            ...conv,
            ai: 'Sorry, there was an error processing your image.',
          };
        }
        return conv;
      });

      setConversations(errorConversations);
      saveChatHistory(errorConversations);
    } finally {
      setIsLoading(false);
    }
  };

  // File input change handler
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file dialog
  const handleAttachButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Chat controls hook - handles all input mode logic
  const chatControls = useChatControls(
    handleAudioRecordingComplete,
    handleVideoRecordingComplete
  );

  const handleQuickReplyClick = (reply: string) => {
    addConversation(reply);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const saveChatHistory = (newConversations: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConversations));
    } catch (error) {
      logger.error('Failed to save chat history', { error: String(error) });
    }
  };

  const addConversation = async (text: string) => {
    const newConversation: Conversation = {
      user: text,
      ai: '...',
      messageType: 'text',
      timestamp: Date.now(),
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    saveChatHistory(updatedConversations);
    setIsLoading(true);

    if (!user) return;

    try {
      const response = await sendMessage({
        chat_id: user.id,
        bot_name: 'Electra',
        message: text,
      });

      const finalConversations = updatedConversations.map((conv, index) => {
        if (index === updatedConversations.length - 1) {
          return {
            ...conv,
            ai:
              response.messages[0]?.content ||
              'Sorry, I could not process your request.',
            options: response.options || [],
          };
        }
        return conv;
      }) as Conversation[];

      setConversations(finalConversations);
      saveChatHistory(finalConversations);
    } catch (error) {
      logger.error('Failed to send message', { error: String(error) });
      const errorConversations = updatedConversations.map((conv, index) => {
        if (index === updatedConversations.length - 1) {
          return {
            ...conv,
            ai: 'Sorry, there was an error processing your request.',
          };
        }
        return conv;
      });

      setConversations(errorConversations);
      saveChatHistory(errorConversations);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    addConversation(text);
    setInputValue('');
  };

  const handleUnlockContent = () => {
    setIsUnlockModalOpen(true);
  };

  const handleUpgradeSubscription = () => {
    setIsUpgradeModalOpen(true);
  };

  return (
    <>
      <div
        className={classNames(s.chatPage, {
          //@ts-ignore
          [s.recording]:
            chatControls.isRecording || chatControls.isVideoRecording,
        })}
      >
        {/* Chat Content */}
        <div className={s.chatContent}>
          <div className={s.dateSeparator}>
            <span>July 17</span>
          </div>

          {/* Locked Content Message */}
          <div className={s.messageBubble}>
            <div className={s.lockedContent}>
              <div
                className={s.lockedImage}
                style={{ backgroundImage: `url(${electra})` }}
              ></div>
              <button className={s.unlockButton} onClick={handleUnlockContent}>
                Unlock for 12$
              </button>
            </div>
            <p className={s.messageText}>
              Electra's midnight coding comes with a tantalizing twist. Unlock
              to see the sparks fly... 🔥
            </p>
          </div>

          {/* Promotional Message */}
          <div className={s.messageBubble}>
            <p className={s.messageText}>
              Get a massive boost with our special subscription! Your fav
              girlie's fully unlocked — texts, pics, roleplay, and more 😈
            </p>
            <button
              className={s.promotionalButton}
              onClick={handleUpgradeSubscription}
            >
              👉 Upgrade & enjoy 💋
            </button>
          </div>

          {/* User Messages */}
          {conversations.map((conv, index) => (
            <div key={index} className={s.messageGroup}>
              {(conv.user || conv.messageType !== 'text') && (
                <div className={s.messageContainer}>
                  <div
                    className={classNames(s.messageBubble, s.userMessage, [
                      s[conv.messageType],
                    ])}
                  >
                    {conv.messageType === 'audio' && conv.audioBlob ? (
                      <TelegramWebAudioPlayer audioBlob={conv.audioBlob} />
                    ) : conv.messageType === 'video' && conv.videoBlob ? (
                      <VideoPlayer videoBlob={conv.videoBlob} />
                    ) : conv.messageType === 'photo' && conv.imageBlob ? (
                      <img
                        className={s.imageMessage}
                        src={URL.createObjectURL(conv.imageBlob)}
                        alt="Uploaded image"
                      />
                    ) : conv.messageType === 'text' && conv.user ? (
                      <p className={s.messageText}>{conv.user}</p>
                    ) : null}
                  </div>
                </div>
              )}
              {conv.ai && conv.ai !== '...' && (
                <div className={s.messageContainer}>
                  <div className={classNames(s.messageBubble, s.aiMessage)}>
                    <p className={s.messageText}>{conv.ai}</p>
                  </div>
                </div>
              )}
              {conv.timestamp && (
                <div className={s.timestamp}>
                  {formatTimestamp(conv.timestamp)}
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={s.inputArea}>
          <div className={s.quickReplies}>
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                className={s.quickReply}
                onClick={() => handleQuickReplyClick(reply)}
                disabled={isLoading}
              >
                {reply}
              </button>
            ))}
          </div>

          <div className={s.inputContainer}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            <button
              className={s.attachButton}
              onClick={handleAttachButtonClick}
            >
              <img src={icons.uploadIcon} alt="upload_icon" />
            </button>
            <input
              className={s.chatInput}
              type="text"
              placeholder={chatControls.getPlaceholderText()}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSend();
                }
              }}
              disabled={isLoading}
            />

            {/* Recording Timer */}
            {chatControls.isRecording ||
              (chatControls.isVideoRecording && (
                <Text
                  color="white"
                  variant="small"
                  className={s.recordingTimer}
                >
                  {Math.floor(chatControls.recordingTime / 60)
                    .toString()
                    .padStart(2, '0')}
                  :
                  {(chatControls.recordingTime % 60)
                    .toString()
                    .padStart(2, '0')}
                </Text>
              ))}

            {/* Show send button when input is focused and has text */}
            {inputValue.trim() ? (
              <button
                className={s.sendButton}
                onClick={handleSend}
                disabled={isLoading}
              >
                <img src={icons.sendIcon} alt="send_icon" />
              </button>
            ) : chatControls.inputMode === 'voice' ? (
              <button
                className={classNames(s.voiceButton, {
                  recording: chatControls.isLongPressActive,
                })}
                onMouseDown={chatControls.voiceButtonHandlers.onMouseDown}
                onMouseUp={chatControls.voiceButtonHandlers.onMouseUp}
                onMouseLeave={chatControls.voiceButtonHandlers.onMouseLeave}
                onTouchStart={chatControls.voiceButtonHandlers.onTouchStart}
                onTouchEnd={chatControls.voiceButtonHandlers.onTouchEnd}
              >
                <img src={icons.voiceIcon} alt="voice_icon" />
              </button>
            ) : (
              <button
                className={classNames(s.cameraButton, {
                  recording: chatControls.isLongPressActive,
                })}
                onMouseDown={chatControls.cameraButtonHandlers.onMouseDown}
                onMouseUp={chatControls.cameraButtonHandlers.onMouseUp}
                onMouseLeave={chatControls.cameraButtonHandlers.onMouseLeave}
                onTouchStart={chatControls.cameraButtonHandlers.onTouchStart}
                onTouchEnd={chatControls.cameraButtonHandlers.onTouchEnd}
              >
                <img src={icons.cameraIcon} alt="camera_icon" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      <VideoRecorderModal
        isOpen={chatControls.isVideoModalOpen}
        isRecording={chatControls.isVideoRecording}
        recordingTime={chatControls.videoRecordingTime}
      />
    </>
  );
}
