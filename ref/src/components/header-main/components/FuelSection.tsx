import { Button } from '../../button';
import { Text } from '../../text';
import { useUser } from '../../../context/userContext';
import ProgressBar from '../../progressBar';
import fuel from '../../../assets/header/fuel.png';
import s from '../index.module.css';

interface FuelSectionProps {
  onTopUpClick: () => void;
}

export default function FuelSection({ onTopUpClick }: FuelSectionProps) {
  const { user } = useUser();
  const fuelAmount = user?.ai_fuel || 0;
  const fuelPercentage = Math.min(Math.max(fuelAmount, 0), 100);

  return (
    <div className={s.fuelContainer}>
      <img src={fuel} alt="fuel_icon" draggable={false} />
      <ProgressBar 
        progress={fuelPercentage} 
        showText={true}
        text={`${fuelAmount}`}
      />

      <Button
        onClick={onTopUpClick}
        className={s.topBtn}
        label={
          <Text nowrap variant="h3">
            Top Up
          </Text>
        }
      />
    </div>
  );
}
