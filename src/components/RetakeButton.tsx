import { useStore } from '../state/hooks';
import s from './RetakeButton.module.css';

export function RetakeButton() {
  const { dispatch } = useStore();
  return (
    <button
      className={s['btn-retake']}
      type="button"
      onClick={() => dispatch({ type: 'RETAKE' })}
    >
      もう一度やってみる
    </button>
  );
}
