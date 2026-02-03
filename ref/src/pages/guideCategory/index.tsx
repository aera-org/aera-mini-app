import { useState, useEffect, useMemo, useRef } from 'react';

import { Text } from '../../components/text';
import { useCurrency } from '../../hooks/useCurrency';

import bigFuel from '../../assets/guideCategory/bigFuel.webp';
import bigBall from '../../assets/guideCategory/bigBall.webp';
import bigHeart from '../../assets/guideCategory/bigHeart.webp';
import bigStore from '../../assets/guideCategory/bigStore.webp';
import bigGifts from '../../assets/guideCategory/bigGifts.webp';
import bigBag from '../../assets/guideCategory/bigBag.webp';
import bigTasks from '../../assets/guideCategory/bigTasks.webp';
import bigEnergy from '../../assets/guideCategory/bigEnergy.webp';
import bigEarth from '../../assets/guideCategory/bigEarth.webp';

import bigFriends from '../../assets/guide/friends.png';
import bigLeague from '../../assets/guide/league.png';

import ProgressBar from '../../components/progressBar';

import s from './index.module.css';
import { usePage } from '../../context/pageContext';
import { CATEGORY_GUIDE } from '../../constants/page';

const GuideCategoryPage = () => {
  const { category, setPage } = usePage();
  const { namePrefixed } = useCurrency();

  const data = useMemo(() => ({
    [CATEGORY_GUIDE.AI_FUEL]: {
      icon: bigFuel,
      texts: [
        'AI Fuel is the essential energy that powers your AI companion—keeping her responsive, emotionally alive, and always ready for deeper conversations, roleplay fantasies and flirty adventures. 🔋💬💖',
      ],
    },
    [CATEGORY_GUIDE.JUMPS]: {
      icon: bigBall,
      texts: [
        `${namePrefixed} is your in-game currency — earned through taps, daily tasks and quests, then spent on gifts, AI Fuel, boosts, fueling your journey into deeper connection and thrilling adventure. 💎🌀🎁`,
      ],
    },
    [CATEGORY_GUIDE.STATUS]: {
      icon: bigHeart,
      texts: [
        'Your bond with the AI companion deepens over time—evolving from playful friendship to heartfelt love through emotional moments, flirty chats, and unlockable storylines that feel almost real. 💌✨',
      ],
    },
    [CATEGORY_GUIDE.STORE]: {
      icon: bigStore,
      texts: [
        `The Asset Store offers Gifts, Boosters, and Room upgrades— designed to deepen your bond, spice up your AI connection, and boost your ${namePrefixed} score. 🛍️💝🌌`,
      ],
    },
    [CATEGORY_GUIDE.GIFTS]: {
      icon: bigGifts,
      texts: [
        'Send a gift to your AI companion to unlock new interactions, bonus AI Fuel, and moments that bring your virtual bond to life. 🎁💖⚡',
      ],
    },
    [CATEGORY_GUIDE.BAG]: {
      icon: bigBag,
      texts: [
        'Your Digital Storage where all your accessories, room upgrades, and special items are stored—ready to style, surprise, and personalize your AI journey anytime. 🎒✨🛏️',
      ],
    },
    [CATEGORY_GUIDE.TASKS]: {
      icon: bigTasks,
      texts: [
        `Complete daily tasks and challenges to earn ${namePrefixed}, unlock surprises, and grow closer to your AI companion with every mission. 🎯💖`,
      ],
    },
    [CATEGORY_GUIDE.ENERGY]: {
      icon: bigEnergy,
      texts: [
        'Energy fuels your daily taps—use your free limit each day, then top up to keep jumping, earning, and playing without limits. ⚡🖱️💎',
      ],
    },
    [CATEGORY_GUIDE.AI_WORLD]: {
      icon: bigEarth,
      texts: [
        'Each AI companion lives in a unique simulation—learning, evolving, and forming real emotional memories in a world that is always alive. 🧬🌌✨',
      ],
    },
    [CATEGORY_GUIDE.REFERRALS]: {
      icon: bigFriends,
      texts: [
        `Invite friends through Referrals to earn bonus ${namePrefixed}—the more, the merrier! Get 2,500 per friend, or 50,000 each if you have got Premium. Let us blow this up. 💥💎`,
      ],
    },
    [CATEGORY_GUIDE.LEADER_BOARD]: {
      icon: bigLeague,
      texts: [
        `Climb the Leaderboard by earning ${namePrefixed}, completing daily missions, and showing off your bond with your AI companion—compete, connect, and rise to the top. 🏆💬💎`,
      ],
    },
  }), [namePrefixed]);

  const texts = useMemo(() => {
    if (!category?.name || !category?.isVisible) {
      return [];
    }

    const categoryData = data[category.name as keyof typeof data];
    return categoryData?.texts || [];
  }, [category?.isVisible, category?.name]);

  const [currentStep, setCurrentStep] = useState(0);
  const [fillPercent, setFillPercent] = useState(0);
  const [autoRun, setAutoRun] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fillPercentRef = useRef(fillPercent);
  const stepRef = useRef(currentStep);

  useEffect(() => {
    fillPercentRef.current = fillPercent;
  }, [fillPercent]);
  useEffect(() => {
    stepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (!autoRun || isPaused || texts.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const tickInterval = 50;
    const totalTicks = 5000 / tickInterval;
    const increment = 100 / totalTicks;

    intervalRef.current = setInterval(() => {
      setFillPercent((prev) => {
        let next = prev + increment;
        if (stepRef.current === texts.length - 1) {
          if (next >= 100) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setAutoRun(false);
            return 100;
          }
          return next;
        } else {
          if (next >= 100) {
            setCurrentStep((s) => s + 1);
            return 0;
          }
          return next;
        }
      });
    }, tickInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRun, isPaused, texts.length]);

  // Touch event handlers
  const handleTouchStart = () => {
    if (autoRun && !isPaused) setIsPaused(true);
  };
  const handleTouchEnd = () => {
    if (isPaused) setIsPaused(false);
  };

  const handlePrev = () => {
    if (currentStep === 0) {
      setFillPercent(0);
      setAutoRun(true);
      return;
    }
    setCurrentStep((prev) => prev - 1);
    setFillPercent(0);
    setAutoRun(true);
  };

  const handleNext = () => {
    if (currentStep === texts.length - 1) {
      setFillPercent(100);
      setAutoRun(false);
      return;
    }
    setCurrentStep((prev) => prev + 1);
    setFillPercent(0);
    setAutoRun(true);
  };

  const handleNavigate = () => {
    const categoryName = category?.name;
    if (
      categoryName &&
      categoryName in data &&
      data[categoryName] &&
      'navigateTo' in data[categoryName] &&
      data[categoryName].navigateTo
    ) {
      setPage(data[categoryName].navigateTo as string);
    }
  };

  return (
    <div
      className={s.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <ProgressBar
        isBlocks
        progress={100}
        steps={texts.length}
        currentStep={currentStep}
        fillPercent={fillPercent}
      />
      <div className={s.info}>
        {category?.isVisible && category?.name && texts.length > 0 && (
          <div className={s.textWrap}>
            <Text variant="span">{texts[currentStep]}</Text>
          </div>
        )}
      </div>
      {category?.isVisible &&
        category?.name &&
        (() => {
          const categoryData = data[category.name as keyof typeof data];
          return categoryData?.icon ? (
            <img className={s.image} src={categoryData.icon} alt="fuel" />
          ) : null;
        })()}
      <div className={s.controlsWrap}>
        <div className={s.controlsBtn} onClick={handlePrev}></div>
        <div
          className={s.controlsBtn}
          onClick={
            currentStep === texts.length - 1 && fillPercent === 100
              ? handleNavigate
              : handleNext
          }
        ></div>
      </div>
    </div>
  );
};

export default GuideCategoryPage;
