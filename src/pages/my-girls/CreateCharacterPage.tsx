import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  type ICharacter,
} from '@/common/types';
import { capitalize, cn, formatPersonality } from '@/common/utils';
import { Typography } from '@/components';

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
  label: string;
};

type SelectStep = {
  key: SelectStepKey;
  title: string;
  options: Option<string>[];
  multi?: boolean;
};

type CreateDraft = {
  name: string;
  age?: number;
  type?: CharacterType;
  personality: CharacterPersonality[];
  ethnicity?: CharacterEthnicity;
  hairColor?: CharacterHairColor;
  hairStyle?: CharacterHairStyle;
  eyeColor?: CharacterEyeColor;
  bodyType?: CharacterBodyType;
  breastSize?: CharacterBreastSize;
};

const ages = [18, 25, 30, 40, 55];

const initialDraft: CreateDraft = {
  name: '',
  personality: [],
};

const profileStep = {
  title: 'Profile',
};

const selectSteps: SelectStep[] = [
  {
    key: 'personality',
    title: 'Personality',
    multi: true,
    options: enumOptions(CharacterPersonality),
  },
  {
    key: 'ethnicity',
    title: 'Ethnicity',
    options: [
      { value: CharacterEthnicity.Caucasian, label: 'Caucasian' },
      { value: CharacterEthnicity.Latina, label: 'Latina' },
      { value: CharacterEthnicity.Arabian, label: 'Arabian' },
      { value: CharacterEthnicity.Asian, label: 'Asian' },
      { value: CharacterEthnicity.Afro, label: 'Afro' },
      { value: CharacterEthnicity.Indian, label: 'Indian' },
    ],
  },
  {
    key: 'hairColor',
    title: 'Hair color',
    options: enumOptions(CharacterHairColor),
  },
  {
    key: 'hairStyle',
    title: 'Hair style',
    options: enumOptions(CharacterHairStyle),
  },
  {
    key: 'eyeColor',
    title: 'Eye color',
    options: enumOptions(CharacterEyeColor),
  },
  {
    key: 'bodyType',
    title: 'Body type',
    options: enumOptions(CharacterBodyType),
  },
  {
    key: 'breastSize',
    title: 'Breast size',
    options: [
      { value: CharacterBreastSize.Small, label: 'Small' },
      { value: CharacterBreastSize.Medium, label: 'Medium' },
      { value: CharacterBreastSize.Large, label: 'Large' },
      { value: CharacterBreastSize.ExtraLarge, label: 'Extra large' },
    ],
  },
];

const reviewStep = {
  title: 'Review',
};

const totalSteps = 1 + selectSteps.length + 1;

function enumOptions<T extends Record<string, string>>(source: T): Option<string>[] {
  return Object.values(source).map((value) => ({
    value,
    label: splitCamelCase(capitalize(value)),
  }));
}

function splitCamelCase(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function formatValue(value: string | number) {
  return typeof value === 'number' ? String(value) : splitCamelCase(capitalize(value));
}

function createDtoFromDraft(draft: CreateDraft): CustomCharacterCreateDto {
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
    throw new Error('Character draft is incomplete');
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
  return draft.name.trim().length > 0 && Boolean(draft.age) && Boolean(draft.type);
}

function isStepValid(stepIndex: number, draft: CreateDraft) {
  if (stepIndex === 0) return isProfileValid(draft);
  if (stepIndex === totalSteps - 1) return true;

  const step = selectSteps[stepIndex - 1];
  const value = draft[step.key];
  if (step.multi) {
    return Array.isArray(value) && value.length >= 1 && value.length <= 3;
  }

  return Boolean(value);
}

function getStepTitle(stepIndex: number) {
  if (stepIndex === 0) return profileStep.title;
  if (stepIndex === totalSteps - 1) return reviewStep.title;
  return selectSteps[stepIndex - 1].title;
}

export function CreateCharacterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<CreateDraft>(initialDraft);
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const currentStepValid = isStepValid(stepIndex, draft);
  const isReviewStep = stepIndex === totalSteps - 1;

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
      navigate(`/my-girls/${character.id}`, { replace: true });
    },
  });

  const reviewItems = useMemo(
    () => [
      { label: 'Name', value: draft.name.trim() },
      { label: 'Age', value: draft.age ? formatValue(draft.age) : '' },
      { label: 'Type', value: draft.type ? formatValue(draft.type) : '' },
      { label: 'Personality', value: formatPersonality(draft.personality) },
      {
        label: 'Ethnicity',
        value: draft.ethnicity ? formatValue(draft.ethnicity) : '',
      },
      {
        label: 'Hair color',
        value: draft.hairColor ? formatValue(draft.hairColor) : '',
      },
      {
        label: 'Hair style',
        value: draft.hairStyle ? formatValue(draft.hairStyle) : '',
      },
      {
        label: 'Eye color',
        value: draft.eyeColor ? formatValue(draft.eyeColor) : '',
      },
      {
        label: 'Body type',
        value: draft.bodyType ? formatValue(draft.bodyType) : '',
      },
      {
        label: 'Breast size',
        value: draft.breastSize ? formatValue(draft.breastSize) : '',
      },
    ],
    [draft],
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

    createMutation.mutate(createDtoFromDraft(draft));
  };

  const updateDraft = (nextDraft: Partial<CreateDraft>) => {
    setDraft((current) => ({ ...current, ...nextDraft }));
  };

  const renderStep = () => {
    if (stepIndex === 0) {
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

    const step = selectSteps[stepIndex - 1];
    return <SelectStepView step={step} draft={draft} onChange={updateDraft} />;
  };

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <button type="button" className={s.iconButton} onClick={goBack}>
          <ChevronLeftIcon width={30} height={30} />
        </button>
        <Typography
          as="h1"
          variant="heading-sm"
          family="brand"
          weight={400}
          className={s.title}
        >
          {getStepTitle(stepIndex)}
        </Typography>
        <button type="button" className={s.closeButton} onClick={close}>
          <CrossIcon width={42} height={42} />
        </button>
      </div>

      <div className={s.progressTrack} aria-hidden>
        <div className={s.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={s.content}>{renderStep()}</div>

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
                ? 'Creating...'
                : 'Create'
              : 'Next'}
          </Typography>
          {!isReviewStep ? (
            <ChevronRightIcon width={24} height={24} className={s.nextChevron} />
          ) : null}
        </button>
      </div>
    </div>
  );
}

type ProfileStepProps = {
  draft: CreateDraft;
  onChange: (nextDraft: Partial<CreateDraft>) => void;
};

function ProfileStep({ draft, onChange }: ProfileStepProps) {
  return (
    <div className={s.profileForm}>
      <label className={s.field}>
        <Typography as="span" variant="body-sm" className={s.fieldLabel}>
          Name
        </Typography>
        <input
          className={s.input}
          value={draft.name}
          maxLength={100}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </label>

      <ChoiceGroup
        label="Age"
        options={ages.map((age) => ({ value: age, label: String(age) }))}
        value={draft.age}
        onChange={(age) => onChange({ age })}
      />

      <ChoiceGroup
        label="Type"
        options={[
          { value: CharacterType.Realistic, label: 'Realistic' },
          { value: CharacterType.Anime, label: 'Anime' },
        ]}
        value={draft.type}
        onChange={(type) => onChange({ type })}
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
          Pick 1-3
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
              {option.label}
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
  return (
    <div className={s.review}>
      <Typography
        as="p"
        variant="body-md"
        family="system"
        className={s.reviewIntro}
      >
        Check the details before creating your character.
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
              {item.value || 'Not selected'}
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
