import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { ADMIN_SECTIONS, type AdminSection } from './adminShell';
import s from './Admin.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'sm' | 'md';
export type AdminSelectOption = {
  value: string;
  label: ReactNode;
  intent?: 'default' | 'action';
};

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant;
  size?: ButtonSize;
};

export function AdminButton({
  variant,
  size = 'md',
  className,
  type = 'button',
  ...props
}: AdminButtonProps) {
  const variantClass = {
    primary: s.adminButtonPrimary,
    secondary: s.adminButtonSecondary,
    tertiary: s.adminButtonTertiary,
    danger: s.adminButtonDanger,
  }[variant];
  const sizeClass = size === 'sm' ? s.adminButtonSm : s.adminButtonMd;
  return (
    <button
      {...props}
      type={type}
      className={[s.adminButton, variantClass, sizeClass, className].filter(Boolean).join(' ')}
    />
  );
}

export function ActionGroup({ children }: { children: ReactNode }) {
  return <div className={s.actionGroup}>{children}</div>;
}

export function AdminSelect({
  value,
  options,
  onChange,
  ariaLabel,
  invalid = false,
  disabled = false,
}: {
  value: string;
  options: readonly AdminSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find(option => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onEscape(event: globalThis.KeyboardEvent): void {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  function selectOption(nextValue: string): void {
    onChange(nextValue);
    setOpen(false);
  }

  function moveSelection(delta: number): void {
    if (options.length === 0) return;
    const index = Math.max(0, options.findIndex(option => option.value === value));
    const nextIndex = (index + delta + options.length) % options.length;
    selectOption(options[nextIndex].value);
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) setOpen(true);
      else moveSelection(1);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) setOpen(true);
      else moveSelection(-1);
    }
  }

  return (
    <div className={s.adminSelect} ref={rootRef}>
      <button
        type="button"
        className={[s.adminSelectButton, invalid ? s.invalid : undefined].filter(Boolean).join(' ')}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled || options.length === 0}
        onClick={() => setOpen(current => !current)}
        onKeyDown={handleButtonKeyDown}
      >
        <span className={s.adminSelectValue}>{selected?.label ?? '選択してください'}</span>
        <span className={s.adminSelectChevron} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className={s.adminSelectMenu} role="listbox" id={listboxId} aria-label={ariaLabel}>
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={[
                s.adminSelectOption,
                option.intent === 'action' ? s.adminSelectOptionAction : undefined,
                option.value === value ? s.adminSelectOptionSelected : undefined,
              ].filter(Boolean).join(' ')}
              onClick={() => selectOption(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PageShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className={s.page}>
      <div className={s.adminShell}>
        {sidebar}
        <div className={s.workspace}>
          <div className={s.workspaceBody}>{children}</div>
        </div>
      </div>
    </main>
  );
}

export function SidebarNav({
  activeSection,
  dirty,
  validationOk,
  onSelect,
}: {
  activeSection: AdminSection;
  dirty: boolean;
  validationOk: boolean;
  onSelect: (section: AdminSection) => void;
}) {
  return (
    <aside className={s.sidebar}>
      <div className={s.sidebarBrand}>
        <p>横須賀市役所 部署タイプ診断</p>
        <h1>課適性診断 設定管理</h1>
      </div>
      <nav className={s.sidebarNav} aria-label="設定項目">
        {ADMIN_SECTIONS.map(section => (
          <AdminButton
            key={section.id}
            variant="tertiary"
            className={activeSection === section.id ? s.sidebarNavActive : s.sidebarNavButton}
            onClick={() => onSelect(section.id)}
          >
            {section.label}
          </AdminButton>
        ))}
      </nav>
      <div className={s.sidebarFooter} aria-label="作業状態">
        <div><span>下書き</span><strong>{dirty ? 'あり' : 'なし'}</strong></div>
        <div>
          <span>検証</span>
          <strong className={validationOk ? s.readinessOk : s.readinessError}>
            {validationOk ? '正常' : '要確認'}
          </strong>
        </div>
      </div>
    </aside>
  );
}

export type BreadcrumbItem = {
  label: ReactNode;
  onClick?: () => void;
};

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav className={s.breadcrumbs} aria-label="現在位置">
      <ol>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={index}>
              {item.onClick && !isCurrent ? (
                <button type="button" onClick={item.onClick}>
                  {item.label}
                </button>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function SectionHeader({
  title,
  breadcrumb,
  action,
}: {
  title: ReactNode;
  breadcrumb?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={s.sectionHeader}>
      <div className={s.sectionHeaderText}>
        {breadcrumb}
        <h2>{title}</h2>
      </div>
      {action && <div className={s.sectionHeaderAction}>{action}</div>}
    </div>
  );
}

export function DirectoryList({ className, children }: { className?: string; children: ReactNode }) {
  return <ol className={[s.directoryList, className].filter(Boolean).join(' ')}>{children}</ol>;
}

export function DirectoryRow({
  children,
  onClick,
  className,
  action,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <li className={[s.directoryRow, action ? s.directoryRowWithAction : undefined, className].filter(Boolean).join(' ')}>
      <button type="button" className={s.directoryRowButton} onClick={onClick}>
        {children}
      </button>
      {action && <div className={s.directoryRowAction}>{action}</div>}
    </li>
  );
}

export function FormFooter({
  onSave,
  savedMessage,
  saveLabel = '保存する',
}: {
  onSave: () => void;
  savedMessage?: string;
  saveLabel?: string;
}) {
  return (
    <div className={s.formFooter}>
      <AdminButton variant="primary" onClick={onSave}>{saveLabel}</AdminButton>
      {savedMessage && <p className={s.formFooterMessage}>{savedMessage}</p>}
    </div>
  );
}

export function DangerZone({ children }: { children: ReactNode }) {
  return (
    <section className={s.dangerZone} aria-label="危険な操作">
      {children}
    </section>
  );
}

export function ValidationSummary({
  show,
  issues,
}: {
  show: boolean;
  issues: readonly string[];
}) {
  if (!show) return null;
  return (
    <div className={s.validationSummary}>
      <strong>入力内容を確認してください。</strong>
      <ul>
        {issues.map((issue, index) => <li key={`${issue}-${index}`}>{issue}</li>)}
      </ul>
    </div>
  );
}
