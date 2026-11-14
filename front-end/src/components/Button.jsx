import { Link } from 'react-router'
import { cx } from '../lib/utils'
import { Icon } from './Icon'

const BASE =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-btn border-2 font-bold no-underline select-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'

const VARIANTS = {
  primary: 'press border-ink bg-violet text-white shadow-hard',
  lime: 'press border-ink bg-lime text-ink shadow-hard',
  secondary: 'border-ink bg-white text-ink active:translate-y-0.5',
  ink: 'border-ink bg-ink text-paper active:translate-y-0.5',
  ghost: 'border-transparent bg-transparent text-violet active:translate-y-0.5',
  dashed: 'border-dashed border-ink bg-transparent text-ink active:translate-y-0.5',
  danger: 'border-ink bg-coral text-ink active:translate-y-0.5',
  // Sobre fundo escuro (modo foco)
  'dark-primary': 'press border-paper bg-violet text-white shadow-hard-lime',
  'dark-lime': 'press border-paper bg-lime text-ink shadow-hard-violet',
  'dark-outline': 'border-paper bg-transparent text-paper active:translate-y-0.5',
}

const SIZES = {
  sm: 'h-11 px-4 text-sm',
  md: 'h-13 px-6 text-base',
  lg: 'h-15 px-6 text-[17px]',
}

/**
 * Botão da identidade. Com `to` vira um link com cara de botão.
 * variant: primary | lime | secondary | ink | ghost | dashed | danger | dark-*
 *
 * Para trocar algo que a variante ou o tamanho já definem (padding, altura,
 * peso, cor), use "!" no fim da classe: className="px-3!". Sem isso, as duas
 * classes brigam e quem ganha é a ordem do CSS, não a ordem em que você escreveu.
 */
export function Button({ variant = 'primary', size = 'md', to, className, children, ...props }) {
  const classes = cx(BASE, VARIANTS[variant], SIZES[size], className)
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}

const ICON_TONES = {
  light: 'border-ink bg-white text-ink',
  dark: 'border-ink-line bg-transparent text-paper',
  'dark-strong': 'border-paper bg-transparent text-paper',
}

/** Botão quadrado só com ícone. `label` é obrigatório (leitores de tela). */
export function IconButton({ icon, label, tone = 'light', to, className, ...props }) {
  const classes = cx(
    'inline-flex size-11 shrink-0 items-center justify-center rounded-chip border-2 active:translate-y-0.5',
    'disabled:cursor-not-allowed disabled:opacity-50',
    ICON_TONES[tone],
    className,
  )
  const content = <Icon name={icon} size={20} strokeWidth={2.4} />
  if (to) {
    return (
      <Link to={to} aria-label={label} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" aria-label={label} className={classes} {...props}>
      {content}
    </button>
  )
}
