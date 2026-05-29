import TelegramWebApp from '@twa-dev/sdk';
import { useMemo } from 'react';

import { MessageMoreIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import type { ICharacter, IScenario } from '@/common/types';
import { cn } from '@/common/utils';
import { Card } from '@/components/card';
import { Typography } from '@/components/text';

import s from './CharacterDetails.module.scss';

const GENERIC_UNLOCK_TEXT = 'Finish previous scenario to unlock';

type ScenarioLockState =
  | {
      kind: 'prerequisite';
      text: string;
    }
  | {
      kind: 'timer';
      text: string;
    }
  | null;

type CreateScenarioCard = {
  imageUrl: string;
  title: string;
  description: string;
  priceAir?: number;
  onClick: () => void;
};

type CharacterDetailsProps = {
  character: ICharacter;
  heroImageUrl: string;
  description?: string;
  getScenarioImageUrl: (scenario: IScenario) => string | undefined;
  createScenarioCard?: CreateScenarioCard;
  scenarioComparator?: (a: IScenario, b: IScenario) => number;
  className?: string;
};

function formatTimeUntilOpen(opensAt: string, now: number): string | null {
  const opensAtTimestamp = Date.parse(opensAt);

  if (Number.isNaN(opensAtTimestamp)) {
    return null;
  }

  const diffMs = opensAtTimestamp - now;

  if (diffMs <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (totalDays >= 1) {
    const hours = totalHours % 24;

    return hours > 0 ? `${totalDays}d ${hours}h` : `${totalDays}d`;
  }

  if (totalHours >= 1) {
    const minutes = totalMinutes % 60;

    return minutes > 0 ? `${totalHours}h ${minutes}m` : `${totalHours}h`;
  }

  return `${Math.max(totalMinutes, 1)}m`;
}

function LockIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.75 10V8.25C7.75 5.9 9.65 4 12 4C14.35 4 16.25 5.9 16.25 8.25V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 14.2V15.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CharacterDetails({
  character,
  heroImageUrl,
  description = character.description,
  getScenarioImageUrl,
  createScenarioCard,
  scenarioComparator,
  className,
}: CharacterDetailsProps) {
  const scenarioNameById = useMemo(
    () =>
      new Map((character.scenarios ?? []).map((scenario) => [scenario.id, scenario.name])),
    [character.scenarios],
  );

  const sortedScenarios = useMemo(() => {
    if (!character.scenarios?.length) return [];

    return [...character.scenarios].sort((a, b) => {
      if (scenarioComparator) {
        return scenarioComparator(a, b);
      }

      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }

      const leftCreatedAt = Date.parse(a.createdAt);
      const rightCreatedAt = Date.parse(b.createdAt);
      const leftTimestamp = Number.isNaN(leftCreatedAt) ? 0 : leftCreatedAt;
      const rightTimestamp = Number.isNaN(rightCreatedAt) ? 0 : rightCreatedAt;

      return rightTimestamp - leftTimestamp;
    });
  }, [character.scenarios, scenarioComparator]);

  const hasNewScenario = (character.scenarios ?? []).some(
    (scenario) => scenario.isNew && scenario.isActive,
  );

  const scenarioLockStateById = useMemo(() => {
    const now = Date.now();

    return new Map<string, ScenarioLockState>(
      sortedScenarios.map((scenario) => {
        if (scenario.level <= 1) {
          return [scenario.id, null];
        }

        const timeUntilOpen = scenario.scenarioProgress
          ? formatTimeUntilOpen(scenario.scenarioProgress.opensAt, now)
          : null;

        if (timeUntilOpen) {
          return [
            scenario.id,
            {
              kind: 'timer',
              text: `Opens In ${timeUntilOpen}`,
            },
          ];
        }

        if (!scenario.scenarioProgress) {
          const prerequisiteName = scenario.opensAfterId
            ? scenarioNameById.get(scenario.opensAfterId)
            : null;

          return [
            scenario.id,
            {
              kind: 'prerequisite',
              text: prerequisiteName
                ? `Finish "${prerequisiteName}" to unlock`
                : GENERIC_UNLOCK_TEXT,
            },
          ];
        }

        return [scenario.id, null];
      }),
    );
  }, [scenarioNameById, sortedScenarios]);

  const handleStartScenarioChat = (scenario: IScenario) => {
    const botUsername = import.meta.env.VITE_BOT_USERNAME;
    if (!botUsername) {
      console.error('VITE_BOT_USERNAME is not set');
      return;
    }
    if (!scenario.slug) {
      console.error('Scenario slug is missing');
      return;
    }

    TelegramWebApp.openTelegramLink(
      `https://t.me/${botUsername}?start=s_${scenario.slug}`,
    );
    TelegramWebApp.close();
  };

  return (
    <div className={cn(s.page, [className])}>
      <section className={s.hero}>
        <img
          src={heroImageUrl}
          alt={character.name}
          className={s.heroImage}
          draggable={false}
        />
        <div className={s.heroContent}>
          <div className={s.titleRow}>
            <Typography
              as="span"
              variant="heading-lg"
              family="brand"
              weight={600}
              className={s.name}
            >
              {character.name}
            </Typography>
            {hasNewScenario ? (
              <span className={s.badge}>
                <Typography
                  as="span"
                  variant="body-sm"
                  family="brand"
                  weight={500}
                  className={s.badgeText}
                >
                  new scenario
                </Typography>
              </span>
            ) : null}
          </div>
          <Typography
            as="p"
            variant="body-md"
            family="system"
            weight={400}
            className={s.description}
          >
            {description}
          </Typography>
        </div>
        <div className={s.container}>
          <section className={s.scenariosSection}>
            <div className={s.scenariosList}>
              {sortedScenarios.map((scenario) => {
                const lockState = scenarioLockStateById.get(scenario.id) ?? null;

                return (
                  <Card
                    key={scenario.id}
                    className={s.scenarioCard}
                    variant="neutral"
                    backgroundImage={getScenarioImageUrl(scenario)}
                  >
                    <div
                      className={cn(s.scenarioCardBody, [
                        lockState ? s.scenarioCardBodyLocked : null,
                      ])}
                    >
                      <div className={s.scenarioRow}>
                        <div className={s.scenarioTextBlock}>
                          <Typography
                            as="span"
                            variant="heading-lg"
                            family="brand"
                            weight={600}
                            className={s.scenarioName}
                          >
                            {scenario.name}
                          </Typography>
                          <Typography
                            as="span"
                            variant="body-md"
                            family="system"
                            weight={400}
                            className={s.scenarioDescription}
                          >
                            {scenario.shortDescription}
                          </Typography>
                        </div>
                        {lockState ? null : scenario.isActive ? (
                          <button
                            type="button"
                            className={s.startChatButton}
                            onClick={() => handleStartScenarioChat(scenario)}
                          >
                            <MessageMoreIcon width={20} height={20} />
                            <Typography
                              as="span"
                              variant="body-sm"
                              family="brand"
                              weight={500}
                              color="black"
                              className={s.startChatButtonText}
                            >
                              Start chat
                            </Typography>
                          </button>
                        ) : (
                          <span className={s.comingSoonBadge}>
                            <Typography
                              as="span"
                              variant="body-sm"
                              family="brand"
                              weight={500}
                              className={s.comingSoonBadgeText}
                            >
                              coming soon
                            </Typography>
                          </span>
                        )}
                      </div>
                    </div>
                    {lockState ? (
                      <div
                        className={cn(s.scenarioLockOverlay, [
                          lockState.kind === 'timer' ? s.scenarioLockOverlayTimer : null,
                        ])}
                      >
                        {lockState.kind === 'prerequisite' ? (
                          <div className={s.scenarioLockTopText}>
                            <Typography
                              as="span"
                              variant="body-sm"
                              family="brand"
                              weight={500}
                              className={cn(s.scenarioLockText, [s.scenarioLockPrerequisiteTopText])}
                            >
                              {lockState.text}
                            </Typography>
                          </div>
                        ) : null}
                        <div className={s.scenarioLockBadge}>
                          <LockIcon />
                        </div>
                        {lockState.kind === 'timer' ? (
                          <div className={cn(s.scenarioLockStatusBadge, [s.scenarioLockStatusBadgeTimer])}>
                            <Typography
                              as="span"
                              variant="body-sm"
                              family="brand"
                              weight={500}
                              className={cn(s.scenarioLockText, [s.scenarioLockTimerText])}
                            >
                              {lockState.text}
                            </Typography>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </Card>
                );
              })}
              {createScenarioCard ? (
                <Card
                  className={s.scenarioCard}
                  variant="neutral"
                  backgroundImage={createScenarioCard.imageUrl}
                >
                  {typeof createScenarioCard.priceAir === 'number' ? (
                    <div className={s.airPriceBadge}>
                      <img
                        src={airIcon}
                        alt="air"
                        className={s.airPriceIcon}
                        draggable={false}
                      />
                      <Typography
                        as="span"
                        variant="body-sm"
                        family="brand"
                        weight={500}
                        className={s.airPriceText}
                      >
                        {createScenarioCard.priceAir} AIR
                      </Typography>
                    </div>
                  ) : null}
                  <div className={s.scenarioCardBody}>
                    <div className={s.scenarioRow}>
                      <div className={s.scenarioTextBlock}>
                        <Typography
                          as="span"
                          variant="heading-lg"
                          family="brand"
                          weight={600}
                          className={s.scenarioName}
                        >
                          {createScenarioCard.title}
                        </Typography>
                        <Typography
                          as="span"
                          variant="body-md"
                          family="system"
                          weight={400}
                          className={s.scenarioDescription}
                        >
                          {createScenarioCard.description}
                        </Typography>
                      </div>
                      <button
                        type="button"
                        className={s.createScenarioButton}
                        onClick={createScenarioCard.onClick}
                      >
                        <Typography
                          as="span"
                          variant="body-sm"
                          family="brand"
                          weight={500}
                          className={s.createScenarioButtonText}
                        >
                          Create
                        </Typography>
                      </button>
                    </div>
                  </div>
                </Card>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
