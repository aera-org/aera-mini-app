import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { createCustomScenario } from '@/api/girls';
import { ChevronLeftIcon, CrossIcon } from '@/assets/icons';
import heartIcon from '@/assets/mini/heart-white.png';
import type { CustomScenarioCreateDto, ICharacter } from '@/common/types';
import { cn } from '@/common/utils';
import { CreatePending, Typography } from '@/components';
import { CustomScenarioType } from '@/consts';

import s from './CreateCharacterPage.module.scss';

const CUSTOM_OPTION = 'custom';

type ScenarioOption = {
  value: CustomScenarioType | typeof CUSTOM_OPTION;
  label: string;
};

const scenarioOptions: ScenarioOption[] = [
  { value: CUSTOM_OPTION, label: 'Custom' },
  ...Object.values(CustomScenarioType).map((value) => ({
    value,
    label: formatScenarioTypeLabel(value),
  })),
];

function formatScenarioTypeLabel(value: CustomScenarioType) {
  if (value === CustomScenarioType.CEO) return 'CEO';

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getScenarioDto(description: string, clothes?: string, lingerie?: string) {
  const trimmedDescription = description.trim();
  const fallbackClothes = `${trimmedDescription} look`;
  const fallbackLingerie = `Some sexy lingerie relevant for ${trimmedDescription}`;

  return {
    description: trimmedDescription,
    clothes: clothes?.trim() || fallbackClothes,
    lingerie: lingerie?.trim() || fallbackLingerie,
  } satisfies CustomScenarioCreateDto;
}

export function CreateScenarioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<ScenarioOption | null>(
    null,
  );
  const [description, setDescription] = useState('');
  const [clothes, setClothes] = useState('');
  const [lingerie, setLingerie] = useState('');
  const isCustomStep = stepIndex === 1;
  const canCreate = isCustomStep
    ? description.trim().length > 0
    : selectedOption != null && selectedOption.value !== CUSTOM_OPTION;

  const createMutation = useMutation({
    mutationFn: (body: CustomScenarioCreateDto) => {
      if (!id) throw new Error('Character id is missing');
      return createCustomScenario(id, body);
    },
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

  const close = () => {
    navigate(id ? `/my-girls/${id}` : '/my-girls');
  };

  const goBack = () => {
    if (isCustomStep) {
      setStepIndex(0);
      return;
    }

    close();
  };

  const handleOptionClick = (option: ScenarioOption) => {
    setSelectedOption(option);
    if (option.value === CUSTOM_OPTION) {
      setStepIndex(1);
    }
  };

  const handleCreate = () => {
    if (createMutation.isPending) return;

    if (isCustomStep) {
      if (!description.trim()) return;
      createMutation.mutate(getScenarioDto(description, clothes, lingerie));
      return;
    }

    if (!selectedOption || selectedOption.value === CUSTOM_OPTION) return;
    createMutation.mutate(getScenarioDto(selectedOption.label));
  };

  if (createMutation.isPending) {
    return <CreatePending title="Creating your scenario" />;
  }

  return (
    <div className={cn(s.page, [s.scenarioPage])}>
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
          Scenario
        </Typography>
        <button type="button" className={s.closeButton} onClick={close}>
          <CrossIcon width={42} height={42} />
        </button>
      </div>

      <div className={s.progressTrack} aria-hidden>
        <div
          className={s.progressFill}
          style={{ width: isCustomStep ? '100%' : '50%' }}
        />
      </div>

      <div className={s.content}>
        {isCustomStep ? (
          <CustomScenarioForm
            description={description}
            clothes={clothes}
            lingerie={lingerie}
            onDescriptionChange={setDescription}
            onClothesChange={setClothes}
            onLingerieChange={setLingerie}
            error={
              createMutation.error instanceof Error
                ? createMutation.error.message
                : null
            }
          />
        ) : (
          <ScenarioTypeStep
            selectedOption={selectedOption}
            onOptionClick={handleOptionClick}
            error={
              createMutation.error instanceof Error
                ? createMutation.error.message
                : null
            }
          />
        )}
      </div>

      <div className={s.footer}>
        <button
          type="button"
          className={cn(s.nextButton, [s.createButton])}
          disabled={!canCreate || createMutation.isPending}
          onClick={handleCreate}
        >
          <Typography
            as="span"
            variant="body-sm"
            family="brand"
            weight={600}
            className={s.nextButtonText}
          >
            Create
          </Typography>
        </button>
      </div>
    </div>
  );
}

type ScenarioTypeStepProps = {
  selectedOption: ScenarioOption | null;
  onOptionClick: (option: ScenarioOption) => void;
  error: string | null;
};

function ScenarioTypeStep({
  selectedOption,
  onOptionClick,
  error,
}: ScenarioTypeStepProps) {
  return (
    <div className={s.optionsList}>
      {scenarioOptions.map((option) => {
        const selected = selectedOption?.value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={cn(s.optionRow, [], { [s.optionSelected]: selected })}
            onClick={() => onOptionClick(option)}
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
      {error ? (
        <Typography as="p" variant="body-md" color="error" className={s.error}>
          {error}
        </Typography>
      ) : null}
    </div>
  );
}

type CustomScenarioFormProps = {
  description: string;
  clothes: string;
  lingerie: string;
  onDescriptionChange: (value: string) => void;
  onClothesChange: (value: string) => void;
  onLingerieChange: (value: string) => void;
  error: string | null;
};

function CustomScenarioForm({
  description,
  clothes,
  lingerie,
  onDescriptionChange,
  onClothesChange,
  onLingerieChange,
  error,
}: CustomScenarioFormProps) {
  return (
    <div className={s.profileForm}>
      <label className={s.field}>
        <Typography as="span" variant="body-sm" className={s.fieldLabel}>
          Description
        </Typography>
        <textarea
          className={cn(s.input, [s.textArea])}
          rows={2}
          value={description}
          placeholder="Megan Fox from Transformers/Lara Croft, Bella from Twilight"
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </label>

      <label className={s.field}>
        <Typography as="span" variant="body-sm" className={s.fieldLabel}>
          Clothes
        </Typography>
        <textarea
          className={cn(s.input, [s.textArea, s.textAreaSmall])}
          rows={1}
          value={clothes}
          onChange={(event) => onClothesChange(event.target.value)}
        />
      </label>

      <label className={s.field}>
        <Typography as="span" variant="body-sm" className={s.fieldLabel}>
          Lingerie
        </Typography>
        <textarea
          className={cn(s.input, [s.textArea, s.textAreaSmall])}
          rows={1}
          value={lingerie}
          onChange={(event) => onLingerieChange(event.target.value)}
        />
      </label>

      {error ? (
        <Typography as="p" variant="body-md" color="error" className={s.error}>
          {error}
        </Typography>
      ) : null}
    </div>
  );
}
