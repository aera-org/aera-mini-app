import TelegramWebApp from '@twa-dev/sdk';
import { useMemo } from 'react';

import { MessageMoreIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import type { ICharacter, IScenario } from '@/common/types';
import { cn } from '@/common/utils';
import { Card } from '@/components/card';
import { Typography } from '@/components/text';

import s from './CharacterDetails.module.scss';

type CreateScenarioCard = {
  imageUrl: string;
  title: string;
  description: string;
  priceAir: number;
  onClick: () => void;
};

type CharacterDetailsProps = {
  character: ICharacter;
  heroImageUrl: string;
  description?: string;
  getScenarioImageUrl: (scenario: IScenario) => string | undefined;
  createScenarioCard?: CreateScenarioCard;
  className?: string;
};

export function CharacterDetails({
  character,
  heroImageUrl,
  description = character.description,
  getScenarioImageUrl,
  createScenarioCard,
  className,
}: CharacterDetailsProps) {
  const sortedScenarios = useMemo(() => {
    if (!character.scenarios?.length) return [];

    const parseDate = (value: string) => {
      const timestamp = Date.parse(value);
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    return [...character.scenarios].sort((a, b) => {
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return parseDate(b.createdAt) - parseDate(a.createdAt);
    });
  }, [character.scenarios]);

  const hasNewScenario = (character.scenarios ?? []).some(
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
              {sortedScenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  className={s.scenarioCard}
                  variant="neutral"
                  backgroundImage={getScenarioImageUrl(scenario)}
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
              {createScenarioCard ? (
                <Card
                  className={s.scenarioCard}
                  variant="neutral"
                  backgroundImage={createScenarioCard.imageUrl}
                >
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
