import { variant, size } from './button.css';
import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: keyof typeof variant;
  sz?: keyof typeof size;
};

export default function DSButton({ tone = 'primary', sz = 'md', className, ...rest }: Props) {
  return <button className={[variant[tone], size[sz], className].filter(Boolean).join(' ')} {...rest} />;
}
