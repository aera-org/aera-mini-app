import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { createCustomCharacter } from '@/api/girls';
import { ChevronLeftIcon, ChevronRightIcon, CrossIcon } from '@/assets/icons';
import heartIcon from '@/assets/mini/heart-white.png';
import {
  CharacterBodyType,
  CharacterBreastSize,
  CharacterEthnicity,
  CharacterEyeColor,
  CharacterHairColor,
  CharacterHairStyle,
  CharacterPersonality,
  CharacterType,
  type CustomCharacterCreateDto,
  type CustomCharacterCreateRouteState,
  type CustomCharacterDraft,
  type ICharacter,
} from '@/common/types';
import { cn } from '@/common/utils';
import { CreatePending, Typography } from '@/components';
import { CUSTOM_CHARACTER_CREATE_PRICE } from '@/consts';
import { useUser } from '@/context/user-context';

import s from './CreateCharacterPage.module.scss';

type SelectStepKey =
  | 'personality'
  | 'ethnicity'
  | 'hairColor'
  | 'hairStyle'
  | 'eyeColor'
  | 'bodyType'
  | 'breastSize';

type Option<T extends string> = {
  value: T;
  labelKey: string;
};

type SelectStep = {
  key: SelectStepKey;
  titleKey: string;
  options: Option<string>[];
  multi?: boolean;
};

type CreateDraft = CustomCharacterDraft;

const ages = [18, 25, 30, 40, 55];

const initialDraft: CreateDraft = {
  name: '',
  personality: [],
};

const typeStep = {
  titleKey: 'create.title',
};

const profileStep = {
  titleKey: 'create.profile',
};

const selectSteps: SelectStep[] = [
  {
    key: 'personality',
    titleKey: 'create.personality',
    multi: true,
    options: enumOptions(CharacterPersonality),
  },
  {
    key: 'ethnicity',
    titleKey: 'create.ethnicity',
    options: [
      { value: CharacterEthnicity.Caucasian, labelKey: 'create.options.caucasian' },
      { value: CharacterEthnicity.Latina, labelKey: 'create.options.latina' },
      { value: CharacterEthnicity.Arabian, labelKey: 'create.options.arabian' },
      { value: CharacterEthnicity.Asian, labelKey: 'create.options.asian' },
      { value: CharacterEthnicity.Afro, labelKey: 'create.options.afro' },
      { value: CharacterEthnicity.Indian, labelKey: 'create.options.indian' },
    ],
  },
  {
    key: 'hairColor',
    titleKey: 'create.hairColor',
    options: enumOptions(CharacterHairColor),
  },
  {
    key: 'hairStyle',
    titleKey: 'create.hairStyle',
    options: enumOptions(CharacterHairStyle),
  },
  {
    key: 'eyeColor',
    titleKey: 'create.eyeColor',
    options: enumOptions(CharacterEyeColor),
  },
  {
    key: 'bodyType',
    titleKey: 'create.bodyType',
    options: enumOptions(CharacterBodyType),
  },
  {
    key: 'breastSize',
    titleKey: 'create.breastSize',
    options: [
      { value: CharacterBreastSize.Small, labelKey: 'create.options.small' },
      { value: CharacterBreastSize.Medium, labelKey: 'create.options.medium' },
      { value: CharacterBreastSize.Large, labelKey: 'create.options.large' },
      { value: CharacterBreastSize.ExtraLarge, labelKey: 'create.options.extraLarge' },
    ],
  },
];

const reviewStep = {
  titleKey: 'create.review',
};

const totalSteps = 1 + 1 + selectSteps.length + 1;
const reviewStepIndex = totalSteps - 1;

function enumOptions<T extends Record<string, string>>(source: T): Option<string>[] {
  return Object.values(source).map((value) => ({
    value,
    labelKey: `create.options.${value}`,
  }));
}

function formatValue(value: string | number, t: (key: string) => string) {
  return typeof value === 'number' ? String(value) : t(`create.options.${value}`);
}

function createDtoFromDraft(
  draft: CreateDraft,
  incompleteMessage: string,
): CustomCharacterCreateDto {
  if (
    !draft.age ||
    !draft.type ||
    !draft.ethnicity ||
    !draft.hairColor ||
    !draft.hairStyle ||
    !draft.eyeColor ||
    !draft.bodyType ||
    !draft.breastSize ||
    draft.personality.length === 0
  ) {
    throw new Error(incompleteMessage);
  }

  return {
    name: draft.name.trim(),
    age: draft.age,
    type: draft.type,
    personality: draft.personality,
    ethnicity: draft.ethnicity,
    hairColor: draft.hairColor,
    hairStyle: draft.hairStyle,
    eyeColor: draft.eyeColor,
    bodyType: draft.bodyType,
    breastSize: draft.breastSize,
  };
}

function isProfileValid(draft: CreateDraft) {
  return draft.name.trim().length > 0 && Boolean(draft.age);
}

function isStepValid(stepIndex: number, draft: CreateDraft) {
  if (stepIndex === 0) return true;
  if (stepIndex === 1) return isProfileValid(draft);
  if (stepIndex === totalSteps - 1) return true;

  const step = selectSteps[stepIndex - 2];
  const value = draft[step.key];
  if (step.multi) {
    return Array.isArray(value) && value.length >= 1 && value.length <= 3;
  }

  return Boolean(value);
}

function getStepTitle(stepIndex: number, t: (key: string) => string) {
  if (stepIndex === 0) return t(typeStep.titleKey);
  if (stepIndex === 1) return t(profileStep.titleKey);
  if (stepIndex === totalSteps - 1) return t(reviewStep.titleKey);
  return t(selectSteps[stepIndex - 2].titleKey);
}

export function CreateCharacterPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoading: isUserLoading } = useUser();
  const resumeState = getCustomCharacterRouteState(location.state);
  const autoCreateTriggeredRef = useRef(false);
  const [stepIndex, setStepIndex] = useState(
    resumeState?.returnStep === 'review' ? reviewStepIndex : 0,
  );
  const [draft, setDraft] = useState<CreateDraft>(resumeState?.draft ?? initialDraft);
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const currentStepValid = isStepValid(stepIndex, draft);
  const isReviewStep = stepIndex === reviewStepIndex;
  const isTypeStep = stepIndex === 0;

  const createMutation = useMutation({
    mutationFn: createCustomCharacter,
    onSuccess: (character) => {
      queryClient.setQueryData<ICharacter[]>(['characters', 'custom'], (current) => {
        const previous = current ?? [];
        return [
          character,
          ...previous.filter((item) => item.id !== character.id),
        ].sort((a, b) => a.name.localeCompare(b.name));
      });
      void queryClient.invalidateQueries({ queryKey: ['characters', 'custom'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate(`/my-girls/${character.id}`, { replace: true });
    },
  });

  const reviewItems = useMemo(
    () => [
      { label: t('create.name'), value: draft.name.trim() },
      { label: t('create.age'), value: draft.age ? formatValue(draft.age, t) : '' },
      { label: t('create.type'), value: draft.type ? t(`common.${draft.type}`) : '' },
      {
        label: t('create.personality'),
        value: draft.personality.map((personality) => t(`create.options.${personality}`)).join(', '),
      },
      {
        label: t('create.ethnicity'),
        value: draft.ethnicity ? formatValue(draft.ethnicity, t) : '',
      },
      {
        label: t('create.hairColor'),
        value: draft.hairColor ? formatValue(draft.hairColor, t) : '',
      },
      {
        label: t('create.hairStyle'),
        value: draft.hairStyle ? formatValue(draft.hairStyle, t) : '',
      },
      {
        label: t('create.eyeColor'),
        value: draft.eyeColor ? formatValue(draft.eyeColor, t) : '',
      },
      {
        label: t('create.bodyType'),
        value: draft.bodyType ? formatValue(draft.bodyType, t) : '',
      },
      {
        label: t('create.breastSize'),
        value: draft.breastSize ? formatValue(draft.breastSize, t) : '',
      },
    ],
    [draft, t],
  );

  const goBack = () => {
    if (stepIndex === 0) {
      navigate('/my-girls');
      return;
    }

    setStepIndex((current) => current - 1);
  };

  const close = () => {
    navigate('/my-girls');
  };

  const handleNext = () => {
    if (!currentStepValid || createMutation.isPending) return;

    if (!isReviewStep) {
      setStepIndex((current) => current + 1);
      return;
    }

    if ((user?.air ?? 0) < CUSTOM_CHARACTER_CREATE_PRICE) {
      navigate('/store', {
        state: buildCustomCharacterRouteState(draft),
      });
      return;
    }

    createMutation.mutate(
      createDtoFromDraft(draft, t('create.characterDraftIncomplete')),
    );
  };

  const updateDraft = (nextDraft: Partial<CreateDraft>) => {
    setDraft((current) => ({ ...current, ...nextDraft }));
  };

  const handleTypeSelect = (type: CharacterType) => {
    setDraft((current) => ({ ...current, type }));
    setStepIndex(1);
  };

  const renderStep = () => {
    if (stepIndex === 0) {
      return <TypeStep selectedType={draft.type} onSelect={handleTypeSelect} />;
    }

    if (stepIndex === 1) {
      return <ProfileStep draft={draft} onChange={updateDraft} />;
    }

    if (isReviewStep) {
      return (
        <ReviewStep
          items={reviewItems}
          error={createMutation.error instanceof Error ? createMutation.error.message : null}
        />
      );
    }

    const step = selectSteps[stepIndex - 2];
    return <SelectStepView step={step} draft={draft} onChange={updateDraft} />;
  };

  useEffect(() => {
    if (!resumeState?.purchaseCompleted || !resumeState.autoCreateAfterPurchase) {
      return;
    }
    if (autoCreateTriggeredRef.current) return;
    if (isUserLoading || createMutation.isPending) return;
    if (stepIndex !== reviewStepIndex || !isStepValid(reviewStepIndex, draft)) return;
    if ((user?.air ?? 0) < CUSTOM_CHARACTER_CREATE_PRICE) return;

    autoCreateTriggeredRef.current = true;
    createMutation.mutate(
      createDtoFromDraft(draft, t('create.characterDraftIncomplete')),
    );
  }, [
    createMutation,
    draft,
    isUserLoading,
    resumeState,
    stepIndex,
    t,
    user?.air,
  ]);

  if (createMutation.isPending) {
    return <CreatePending title={t('create.creatingCharacter')} />;
  }

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <button type="button" className={s.iconButton} onClick={goBack}>
          <ChevronLeftIcon width={30} height={30} />
        </button>
        {isTypeStep ? <div aria-hidden /> : (
          <Typography
            as="h1"
            variant="heading-sm"
            family="brand"
            weight={400}
            className={s.title}
          >
            {getStepTitle(stepIndex, t)}
          </Typography>
        )}
        <button type="button" className={s.closeButton} onClick={close}>
          <CrossIcon width={42} height={42} />
        </button>
      </div>

      {isTypeStep ? (
        <div className={s.typeStepTitleWrap}>
          <Typography
            as="h1"
            variant="heading-lg"
            family="brand"
            weight={400}
            className={s.typeStepTitle}
          >
            {t('create.titleLineBreak')
              .split('\n')
              .map((line, index) => (
                <span key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
          </Typography>
        </div>
      ) : (
        <div className={s.progressTrack} aria-hidden>
          <div className={s.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className={s.content}>{renderStep()}</div>

      {!isTypeStep ? (
        <div className={s.footer}>
          <button
            type="button"
            className={cn(s.nextButton, [], {
              [s.createButton]: isReviewStep,
            })}
            disabled={!currentStepValid || createMutation.isPending}
            onClick={handleNext}
          >
            <Typography
              as="span"
              variant="body-sm"
              family="brand"
              weight={600}
              className={s.nextButtonText}
            >
              {isReviewStep
                ? createMutation.isPending
                  ? t('common.creating')
                  : t('common.create')
                : t('common.next')}
            </Typography>
            {!isReviewStep ? (
              <ChevronRightIcon width={24} height={24} className={s.nextChevron} />
            ) : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function buildCustomCharacterRouteState(
  draft: CreateDraft,
): CustomCharacterCreateRouteState {
  return {
    source: 'custom-character-create',
    draft,
    returnStep: 'review',
    autoCreateAfterPurchase: true,
  };
}

function getCustomCharacterRouteState(
  value: unknown,
): CustomCharacterCreateRouteState | null {
  if (!value || typeof value !== 'object') return null;

  const state = value as Partial<CustomCharacterCreateRouteState>;
  if (state.source !== 'custom-character-create') return null;
  if (state.returnStep !== 'review') return null;
  if (typeof state.autoCreateAfterPurchase !== 'boolean') return null;
  if (!state.draft || typeof state.draft !== 'object') return null;
  if (typeof state.draft.name !== 'string') return null;
  if (!Array.isArray(state.draft.personality)) return null;

  return state as CustomCharacterCreateRouteState;
}

type TypeStepProps = {
  selectedType?: CharacterType;
  onSelect: (type: CharacterType) => void;
};

const typeOptions = [
  {
    type: CharacterType.Realistic,
    labelKey: 'common.realistic',
    videoUrl: import.meta.env.VITE_CC_VIDEO_R?.trim(),
  },
  {
    type: CharacterType.Anime,
    labelKey: 'common.anime',
    videoUrl: import.meta.env.VITE_CC_VIDEO_A?.trim(),
  },
] satisfies Array<{
  type: CharacterType;
  labelKey: string;
  videoUrl?: string;
}>;

function TypeStep({ selectedType, onSelect }: TypeStepProps) {
  const { t } = useTranslation();

  return (
    <div className={s.typeStep}>
      {typeOptions.map((option) => {
        const selected = option.type === selectedType;

        return (
          <button
            key={option.type}
            type="button"
            className={cn(s.typeCard, [], {
              [s.typeCardSelected]: selected,
            })}
            onClick={() => onSelect(option.type)}
          >
            {option.videoUrl ? (
              <video
                className={s.typeVideo}
                src={option.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <div className={s.typeVideoFallback} aria-hidden />
            )}
            <div className={s.typeCardOverlay} />
            <Typography
              as="span"
              variant="body-lg"
              family="brand"
              weight={600}
              className={s.typeCardLabel}
            >
              {t(option.labelKey)}
            </Typography>
          </button>
        );
      })}
    </div>
  );
}

type ProfileStepProps = {
  draft: CreateDraft;
  onChange: (nextDraft: Partial<CreateDraft>) => void;
};

function ProfileStep({ draft, onChange }: ProfileStepProps) {
  const { t } = useTranslation();

  return (
    <div className={s.profileForm}>
      <label className={s.field}>
        <Typography as="span" variant="body-sm" className={s.fieldLabel}>
          {t('create.name')}
        </Typography>
        <input
          className={s.input}
          value={draft.name}
          maxLength={100}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </label>

      <ChoiceGroup
        label={t('create.age')}
        options={ages.map((age) => ({ value: age, label: String(age) }))}
        value={draft.age}
        onChange={(age) => onChange({ age })}
      />
    </div>
  );
}

type ChoiceGroupProps<T extends string | number> = {
  label: string;
  options: Array<{ value: T; label: string }>;
  value?: T;
  onChange: (value: T) => void;
};

function ChoiceGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: ChoiceGroupProps<T>) {
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className={s.field}>
      <Typography as="span" variant="body-sm" className={s.fieldLabel}>
        {label}
      </Typography>
      <div className={s.segmented}>
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            className={cn(s.segmentButton, [], {
              [s.segmentSelected]: option.value === value,
            })}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className={s.fieldValue}>{selectedLabel ?? ''}</span>
    </div>
  );
}

type SelectStepViewProps = {
  step: SelectStep;
  draft: CreateDraft;
  onChange: (nextDraft: Partial<CreateDraft>) => void;
};

function SelectStepView({ step, draft, onChange }: SelectStepViewProps) {
  const { t } = useTranslation();
  const value = draft[step.key];
  const selectedValues: string[] = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  const toggleValue = (nextValue: string) => {
    if (step.multi) {
      const nextValues = selectedValues.includes(nextValue)
        ? selectedValues.filter((item) => item !== nextValue)
        : selectedValues.length < 3
          ? [...selectedValues, nextValue]
          : selectedValues;
      onChange({ [step.key]: nextValues } as Partial<CreateDraft>);
      return;
    }

    onChange({ [step.key]: nextValue } as Partial<CreateDraft>);
  };

  return (
    <div className={s.optionsList}>
      {step.multi ? (
        <Typography as="p" variant="body-md" className={s.stepHint}>
          {t('create.pickOneToThree')}
        </Typography>
      ) : null}
      {step.options.map((option) => {
        const selected = selectedValues.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={cn(s.optionRow, [], { [s.optionSelected]: selected })}
            onClick={() => toggleValue(option.value)}
          >
            <img
              src={heartIcon}
              alt=""
              className={s.heartIcon}
              draggable={false}
              aria-hidden
            />
            <Typography
              as="span"
              variant="body-lg"
              family="system"
              className={s.optionLabel}
            >
              {t(option.labelKey)}
            </Typography>
          </button>
        );
      })}
    </div>
  );
}

type ReviewStepProps = {
  items: Array<{ label: string; value: string }>;
  error: string | null;
};

function ReviewStep({ items, error }: ReviewStepProps) {
  const { t } = useTranslation();

  return (
    <div className={s.review}>
      <Typography
        as="p"
        variant="body-md"
        family="system"
        className={s.reviewIntro}
      >
        {t('create.checkDetails')}
      </Typography>
      <div className={s.summaryGrid}>
        {items.map((item) => (
          <div className={s.summaryItem} key={item.label}>
            <Typography as="span" variant="caption" className={s.summaryLabel}>
              {item.label}
            </Typography>
            <Typography
              as="span"
              variant="body-md"
              family="brand"
              weight={500}
              className={s.summaryValue}
            >
              {item.value || t('common.notSelected')}
            </Typography>
          </div>
        ))}
      </div>
      {error ? (
        <Typography as="p" variant="body-md" color="error" className={s.error}>
          {error}
        </Typography>
      ) : null}
    </div>
  );
}
