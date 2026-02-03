import { PAGES } from '../constants/page';
import Guide from '../pages/guide/index';
import CharactersList from '../pages/characters-list';
import Game from '../pages/game/index';
import GiftsPage from '../pages/gifts/index';
import Tasks from '../pages/tasks/index';
import Loading from '../pages/loading';
import BagPage from '../pages/bag/index';
import Girls from '../pages/girls';
import Error from '../pages/error';
import LeaderBoard from '../pages/leaderBoard';
import Referrals from '../pages/referrals';
import ChatPage from '../pages/chat';
import SubscriptionPage from '../pages/subscription/index';
import { usePage } from '../context/pageContext';

interface Props {
  openSpicyModal: () => void;
  handleTopUpClick: () => void;
}

export default function PageRenderer({
  openSpicyModal,
  handleTopUpClick,
}: Props) {
  const { page, setPage } = usePage();

  const handleSubscriptionRedirect = () => setPage(PAGES.SUBSCRIPTION);

  switch (page) {
    case PAGES.GIRLS:
      return <Girls />;
    case PAGES.BAG:
      return <BagPage />;
    case PAGES.ERROR:
      return <Error />;
    case PAGES.GAME:
      return (
        <Game
          openSpicyModal={openSpicyModal}
          handleTopUpClick={handleTopUpClick}
        />
      );
    case PAGES.TASKS:
      return <Tasks />;
    case PAGES.GIFTS:
      return <GiftsPage handleTopUpClick={handleSubscriptionRedirect} />;
    case PAGES.LOADING:
      return <Loading />;
    case PAGES.GUIDE:
      return <Guide />;
    case PAGES.LEADER_BOARD:
      return <LeaderBoard />;
    case PAGES.REFERRALS:
      return <Referrals />;
    case PAGES.CHAT:
      return <ChatPage />;
    case PAGES.HOME_PAGE:
      return <CharactersList handleTopUpClick={handleSubscriptionRedirect} />;
    case PAGES.SUBSCRIPTION:
      return <SubscriptionPage />;
    default:
      return null;
  }
}
