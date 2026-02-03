import { useState } from 'react';
import Modal from '../../components/modal';

import { Text } from '../../components/text';

const RedirectToTelegram = () => {
  const [modalOpen] = useState(true);

  return (
    <div className="app">
      <Modal isOpen={modalOpen}>
        <div>
          <Text center variant="h2">
            Game Access Notice
          </Text>
          <br />
          <br />
          <Text center>
            Unfortunately, the game cannot be opened directly in your browser.
            For the best experience, please switch to Telegram to access the
            game.
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default RedirectToTelegram;
