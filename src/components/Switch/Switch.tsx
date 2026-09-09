import { useId } from 'react';
import { Switch as BaseSwitch } from '@base-ui-components/react/switch';
import styles from './Switch.module.css';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof BaseSwitch.Root> {
  /** Text shown next to the control. */
  label?: string;
}

/**
 * A binary on/off control. Prefer this over a checkbox when the change
 * takes effect immediately rather than on submit.
 */
export function Switch({ label, className, id, ...props }: SwitchProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;

  const control = (
    <BaseSwitch.Root
      id={controlId}
      className={[styles.root, className ?? ''].filter(Boolean).join(' ')}
      {...props}
    >
      <BaseSwitch.Thumb className={styles.thumb} />
    </BaseSwitch.Root>
  );

  if (!label) return control;

  return (
    <span className={styles.wrapper}>
      {control}
      <label className={styles.label} htmlFor={controlId}>
        {label}
      </label>
    </span>
  );
}
