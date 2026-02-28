import { useQuery } from '@tanstack/react-query';
import TelegramWebApp from '@twa-dev/sdk';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { getGirls } from '@/api/girls';
import { MessageMoreIcon } from '@/assets/icons';
import type { IScenario } from '@/common/types';
import { Card, Loader, Typography } from '@/components';

import s from './GirlPage.module.scss';

export function GirlPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: girls = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['girls'],
    queryFn: getGirls,
  });

  const girl = useMemo(
    () => girls.find((character) => character.id === id),
    [girls, id],
  );

  const sortedScenarios = useMemo(() => {
    if (!girl?.scenarios?.length) return [];

    const parseDate = (value: string) => {
      const timestamp = Date.parse(value);
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    return [...girl.scenarios].sort((a, b) => {
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return parseDate(b.createdAt) - parseDate(a.createdAt);
    });
  }, [girl]);

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <Loader />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <Typography variant="body-md">
            {error instanceof Error ? error.message : 'Failed to load girl'}
          </Typography>
        </div>
      </div>
    );
  }

  if (!girl) {
    return (
      <div className={s.page}>
        <div className={s.container}>
          <Typography variant="body-md">Girl not found</Typography>
        </div>
      </div>
    );
  }

  const hasNewScenario = (girl.scenarios ?? []).some(
    (scenario) => scenario.isNew && scenario.isActive,
  );

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
    <div className={s.page}>
      <section className={s.hero}>
        <img
          src={girl.promoImgUrl ?? girl.avatarUrl}
          alt={girl.name}
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
              {girl.name}
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
            {girl.description}
          </Typography>
        </div>
        <div className={s.container}>
          <section className={s.scenariosSection}>
            <div className={s.scenariosList}>
              {sortedScenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  className={s.scenarioCard}
                  variant="neutral"
                  backgroundImage={scenario.promoImgHorizontalUrl}
                >
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
                      {scenario.isActive ? (
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
                </Card>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
