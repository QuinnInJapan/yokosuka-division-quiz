import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AX, type Archetype, type Axis, type AxisDescTiers, type AxisKey, type ConfigDivision, type Question } from '../data/types';
import { type AppConfig, type RuntimeConfig } from '../config/appConfig';
import {
  ADMIN_DRAFT_KEY,
  exportAdminConfig,
  parseAdminConfigJson,
  runtimeToAppConfig,
  validateAdminConfig,
} from '../config/adminConfig';
import { archetypePalette } from '../lib/archetypePalette';
import { sukarinSrc } from '../lib/sukarinImages';
import {
  ADMIN_SECTION_STORAGE_KEY,
  getInitialAdminSection,
  type AdminSection,
} from './adminShell';
import { AdminManual } from './adminManual';
import {
  AdminButton,
  AdminSelect,
  Breadcrumbs,
  DirectoryList,
  DirectoryRow,
  FormFooter,
  PageShell,
  SectionHeader,
  SidebarNav,
  ValidationSummary,
} from './adminUi';
import s from './Admin.module.css';

type AdminStatus = { kind: 'info' | 'success' | 'error'; text: string };
type WeightSide = 'minus' | 'neutral' | 'plus';
type DivisionKey = `${string}::${string}`;
type DivisionAdminView =
  | { mode: 'list' }
  | { mode: 'create' }
  | { mode: 'edit'; key: DivisionKey }
  | { mode: 'duplicate'; key: DivisionKey };
type DivisionForm = {
  deptMode: 'existing' | 'new';
  dept: string;
  name: string;
  about: string;
} & Record<AxisKey, number>;
type DivisionFormIssue = {
  field: 'dept' | 'name' | 'about' | AxisKey | 'duplicate';
  message: string;
  duplicateIndex?: number;
};
type QuestionAdminView =
  | { mode: 'list' }
  | { mode: 'create' }
  | { mode: 'edit'; index: number };
type ArchetypeAdminView =
  | { mode: 'list' }
  | { mode: 'edit'; code: string };
type AxisAdminView =
  | { mode: 'list' }
  | { mode: 'edit'; axis: AxisKey };
type QuestionForm = {
  axis: AxisKey;
  reversed: boolean;
  scenario: string;
  options: Question['options'];
};
type QuestionFormIssue = {
  field: 'axis' | 'scenario' | `option-${number}`;
  message: string;
};
type ArchetypeForm = {
  nameLine1: string;
  nameLine2: string;
  desc: string;
};
type ArchetypeFormIssue = {
  field: 'name' | 'desc' | 'nameBreakAt';
  message: string;
};
type AxisForm = {
  axis: Axis;
  descriptions: AxisDescTiers;
};
type AxisFormIssue = {
  field: string;
  message: string;
};

const AXIS_DESCRIPTION_TIERS: (keyof AxisDescTiers)[] = [
  'strong_plus',
  'mild_plus',
  'neutral',
  'mild_minus',
  'strong_minus',
];

const AXIS_LABEL_FIELDS: { key: keyof Axis; label: string }[] = [
  { key: 'label', label: '軸名' },
  { key: 'minus', label: '左側の特性' },
  { key: 'plus', label: '右側の特性' },
];

const AXIS_COLOR_FIELDS: { key: keyof Axis; label: string }[] = [
  { key: 'color', label: '基本色' },
  { key: 'dark', label: '濃色' },
  { key: 'tint', label: '背景色' },
];

const AXIS_COLOR_PRESETS = [
  { id: 'crimson', label: '赤', color: '#E8534A', dark: '#C0392B', tint: '#FFF0EE' },
  { id: 'cobalt', label: '青', color: '#4A90D9', dark: '#2E6DB4', tint: '#EBF3FC' },
  { id: 'forest', label: '緑', color: '#4CAF7D', dark: '#1E7345', tint: '#ECF8F1' },
  { id: 'plum', label: '紫', color: '#9B59B6', dark: '#7B3F9E', tint: '#F5EDF8' },
  { id: 'bronze', label: '黄', color: '#EAB308', dark: '#A16207', tint: '#FEF9C3' },
  { id: 'teal', label: '青緑', color: '#22A6B3', dark: '#0E7490', tint: '#E6F7FA' },
  { id: 'indigo', label: '藍', color: '#5B6FD8', dark: '#344C9A', tint: '#EEF1FF' },
  { id: 'rose', label: '桃', color: '#E85C8A', dark: '#BE2F64', tint: '#FFF0F6' },
  { id: 'orange', label: '橙', color: '#F28C28', dark: '#B85C00', tint: '#FFF3E6' },
  { id: 'slate', label: '灰青', color: '#64748B', dark: '#475569', tint: '#F1F5F9' },
] as const;

const NEW_DEPT_OPTION = '__new_department__';
const DIVISION_WEIGHT_TICKS = Array.from({ length: 21 }, (_, index) => index - 10);

function freshDraft(config: RuntimeConfig): AppConfig {
  return JSON.parse(exportAdminConfig(runtimeToAppConfig(config))) as AppConfig;
}

function draftFromStorage(initialConfig: RuntimeConfig): { draft: AppConfig; restored: boolean } {
  const base = freshDraft(initialConfig);
  if (typeof window === 'undefined') return { draft: base, restored: false };
  const saved = window.localStorage.getItem(ADMIN_DRAFT_KEY);
  if (!saved) return { draft: base, restored: false };
  const result = parseAdminConfigJson(saved);
  if (!result.ok) return { draft: base, restored: false };
  return { draft: runtimeToAppConfig(result.config), restored: true };
}

function formatDownloadDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function RowDeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={s.rowDeleteButton}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      ×
    </button>
  );
}

function questionOptionLabel(question: Pick<Question, 'axis' | 'reversed'>, optionIndex: number, axes: RuntimeConfig['axes']): string {
  if (optionIndex === 2) return '中間';
  const axis = axes[question.axis];
  const isHighResponse = optionIndex > 2;
  const rightTrait = question.reversed ? !isHighResponse : isHighResponse;
  const strength = optionIndex === 0 || optionIndex === 4 ? '強い' : 'やや';
  return `${strength} ${rightTrait ? axis.plus : axis.minus}`;
}

function questionToForm(question: Question): QuestionForm {
  return {
    axis: question.axis,
    reversed: question.reversed,
    scenario: question.scenario,
    options: [...question.options] as Question['options'],
  };
}

function blankQuestionForm(axis: AxisKey): QuestionForm {
  return {
    axis,
    reversed: false,
    scenario: '',
    options: ['', '', '', '', ''],
  };
}

function questionFromForm(form: QuestionForm): Question {
  return {
    axis: form.axis,
    reversed: form.reversed,
    scenario: form.scenario.trim(),
    options: form.options.map(option => option.trim()) as Question['options'],
  };
}

function questionPreview(text: string): string {
  const value = text.trim();
  if (!value) return '設問文未入力';
  return value.length > 56 ? `${value.slice(0, 56)}...` : value;
}

function textPreview(text: string, length = 48): string {
  const value = text.trim();
  if (!value) return '未入力';
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function archetypeNameLines(type: Archetype): { line1: string; line2: string } {
  const breakAt = type.nameBreakAt;
  if (breakAt != null && breakAt > 0 && breakAt < type.name.length) {
    return {
      line1: type.name.slice(0, breakAt),
      line2: type.name.slice(breakAt),
    };
  }
  return { line1: type.name, line2: '' };
}

function archetypeToForm(type: Archetype): ArchetypeForm {
  const lines = archetypeNameLines(type);
  return {
    nameLine1: lines.line1,
    nameLine2: lines.line2,
    desc: type.desc,
  };
}

function validateArchetypeForm(form: ArchetypeForm): ArchetypeFormIssue[] {
  const issues: ArchetypeFormIssue[] = [];
  const name = `${form.nameLine1}${form.nameLine2}`.trim();
  if (!name) issues.push({ field: 'name', message: '名称を入力してください。' });
  if (!form.desc.trim()) issues.push({ field: 'desc', message: '説明文を入力してください。' });
  if (form.nameLine2 && form.nameLine1.length === 0) {
    issues.push({ field: 'nameBreakAt', message: '2行目を使う場合は名称1行目も入力してください。' });
  }
  return issues;
}

function archetypeFromForm(form: ArchetypeForm): Pick<Archetype, 'name' | 'nameBreakAt' | 'desc'> {
  const nameLine1 = form.nameLine1.trim();
  const nameLine2 = form.nameLine2.trim();
  return {
    name: `${nameLine1}${nameLine2}`,
    nameBreakAt: nameLine2.length > 0 ? nameLine1.length : undefined,
    desc: form.desc.trim(),
  };
}

function validateQuestionForm(
  form: QuestionForm,
): QuestionFormIssue[] {
  const issues: QuestionFormIssue[] = [];
  if (!AX.includes(form.axis)) issues.push({ field: 'axis', message: '軸を選択してください。' });
  if (!form.scenario.trim()) issues.push({ field: 'scenario', message: '設問文を入力してください。' });
  form.options.forEach((option, index) => {
    if (!option.trim()) issues.push({ field: `option-${index}`, message: `選択肢${index + 1}を入力してください。` });
  });
  return issues;
}

function axisDescLabel(axis: Axis, tier: keyof AxisDescTiers): string {
  if (tier === 'strong_plus') return `強い ${axis.plus}`;
  if (tier === 'mild_plus') return `やや ${axis.plus}`;
  if (tier === 'neutral') return '中立';
  if (tier === 'mild_minus') return `やや ${axis.minus}`;
  return `強い ${axis.minus}`;
}

function axisToForm(axis: Axis, descriptions: AxisDescTiers): AxisForm {
  return {
    axis: { ...axis },
    descriptions: { ...descriptions },
  };
}

function matchingAxisColorPreset(axis: Axis): string | null {
  const preset = AXIS_COLOR_PRESETS.find(item =>
    item.color.toLowerCase() === axis.color.toLowerCase()
    && item.dark.toLowerCase() === axis.dark.toLowerCase()
    && item.tint.toLowerCase() === axis.tint.toLowerCase(),
  );
  return preset?.id ?? null;
}

function axisUsingColorPreset(
  axes: Record<AxisKey, Axis>,
  presetId: string,
  currentAxis: AxisKey,
): AxisKey | null {
  return AX.find(axis => axis !== currentAxis && matchingAxisColorPreset(axes[axis]) === presetId) ?? null;
}

function validateAxisForm(form: AxisForm): AxisFormIssue[] {
  const issues: AxisFormIssue[] = [];
  for (const field of AXIS_LABEL_FIELDS) {
    const value = form.axis[field.key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      issues.push({ field: `axis.${String(field.key)}`, message: `${field.label}を入力してください。` });
    }
  }
  for (const field of AXIS_COLOR_FIELDS) {
    const value = form.axis[field.key];
    if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
      issues.push({ field: `axis.${String(field.key)}`, message: `${field.label}は#RRGGBB形式で入力してください。` });
    }
  }
  for (const tier of AXIS_DESCRIPTION_TIERS) {
    if (!form.descriptions[tier].trim()) {
      issues.push({ field: `descriptions.${tier}`, message: `${axisDescLabel(form.axis, tier)}の説明文を入力してください。` });
    }
  }
  return issues;
}

function weightSide(weight: number): WeightSide {
  if (weight < 0) return 'minus';
  if (weight > 0) return 'plus';
  return 'neutral';
}

function trimmedDivisionKey(dept: string, name: string): DivisionKey {
  return `${dept.trim()}::${name.trim()}`;
}

function divisionKey(division: Pick<ConfigDivision, 'dept' | 'name'>): DivisionKey {
  return trimmedDivisionKey(division.dept, division.name);
}

function findDivisionIndex(divisions: readonly ConfigDivision[], key: DivisionKey): number {
  return divisions.findIndex(division => divisionKey(division) === key);
}

function divisionToForm(division: ConfigDivision, existingDepts: readonly string[], mode: DivisionForm['deptMode'] = 'existing'): DivisionForm {
  return {
    deptMode: existingDepts.includes(division.dept) ? mode : 'new',
    dept: division.dept,
    name: division.name,
    about: division.about ?? '',
    A: division.A,
    B: division.B,
    C: division.C,
    D: division.D,
    E: division.E,
  };
}

function blankDivisionForm(existingDepts: readonly string[]): DivisionForm {
  return {
    deptMode: existingDepts.length > 0 ? 'existing' : 'new',
    dept: existingDepts[0] ?? '',
    name: '',
    about: '',
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  };
}

function divisionFromForm(form: DivisionForm): ConfigDivision {
  return {
    dept: form.dept.trim(),
    name: form.name.trim(),
    about: form.about.trim(),
    A: form.A,
    B: form.B,
    C: form.C,
    D: form.D,
    E: form.E,
  };
}

function divisionWeightPct(weight: number): number {
  if (!Number.isFinite(weight)) return 50;
  return ((Math.max(-10, Math.min(10, weight)) + 10) / 20) * 100;
}

function divisionWeightValue(weight: number): number {
  if (!Number.isFinite(weight)) return 0;
  return Math.max(-10, Math.min(10, Math.round(weight)));
}

function validateDivisionForm(
  form: DivisionForm,
  divisions: readonly ConfigDivision[],
  editingKey?: DivisionKey,
): DivisionFormIssue[] {
  const issues: DivisionFormIssue[] = [];
  const dept = form.dept.trim();
  const name = form.name.trim();
  const about = form.about.trim();

  if (!dept) issues.push({ field: 'dept', message: '部を入力してください。' });
  if (!name) issues.push({ field: 'name', message: '課名を入力してください。' });
  if (!about) issues.push({ field: 'about', message: '説明文を入力してください。' });

  for (const axis of AX) {
    const weight = form[axis];
    if (!Number.isFinite(weight) || !Number.isInteger(weight) || weight < -10 || weight > 10) {
      issues.push({ field: axis, message: `${axis}は-10〜10の整数で入力してください。` });
    }
  }

  if (dept && name) {
    const key = trimmedDivisionKey(dept, name);
    const duplicateIndex = divisions.findIndex(division =>
      divisionKey(division) === key && divisionKey(division) !== editingKey,
    );
    if (duplicateIndex >= 0) {
      issues.push({
        field: 'duplicate',
        message: '同じ部・課名のデータが既にあります。',
        duplicateIndex,
      });
    }
  }

  return issues;
}

export function Admin({ initialConfig }: { initialConfig: RuntimeConfig }) {
  const [{ draft: initialDraft, restored }] = useState(() => draftFromStorage(initialConfig));
  const [draft, setDraft] = useState<AppConfig>(initialDraft);
  const [baseline] = useState(() => JSON.stringify(initialDraft));
  const [activeTab, setActiveTab] = useState<AdminSection>(() => getInitialAdminSection());
  const [divisionView, setDivisionView] = useState<DivisionAdminView>({ mode: 'list' });
  const [divisionForm, setDivisionForm] = useState<DivisionForm>(() => blankDivisionForm([]));
  const [divisionFormBaseline, setDivisionFormBaseline] = useState(() => JSON.stringify(blankDivisionForm([])));
  const [divisionSaveAttempted, setDivisionSaveAttempted] = useState(false);
  const [divisionSavedMessage, setDivisionSavedMessage] = useState('');
  const [questionView, setQuestionView] = useState<QuestionAdminView>({ mode: 'list' });
  const [questionForm, setQuestionForm] = useState<QuestionForm>(() => blankQuestionForm('A'));
  const [questionFormBaseline, setQuestionFormBaseline] = useState(() => JSON.stringify(blankQuestionForm('A')));
  const [questionSaveAttempted, setQuestionSaveAttempted] = useState(false);
  const [questionSavedMessage, setQuestionSavedMessage] = useState('');
  const [archetypeView, setArchetypeView] = useState<ArchetypeAdminView>({ mode: 'list' });
  const [archetypeForm, setArchetypeForm] = useState<ArchetypeForm>({ nameLine1: '', nameLine2: '', desc: '' });
  const [archetypeFormBaseline, setArchetypeFormBaseline] = useState(() => JSON.stringify({ nameLine1: '', nameLine2: '', desc: '' }));
  const [archetypeSaveAttempted, setArchetypeSaveAttempted] = useState(false);
  const [archetypeSavedMessage, setArchetypeSavedMessage] = useState('');
  const [axisView, setAxisView] = useState<AxisAdminView>({ mode: 'list' });
  const [axisForm, setAxisForm] = useState<AxisForm>(() => ({
    axis: initialConfig.axes.A,
    descriptions: initialConfig.axisDescriptions.A,
  }));
  const [axisFormBaseline, setAxisFormBaseline] = useState(() => JSON.stringify({
    axis: initialConfig.axes.A,
    descriptions: initialConfig.axisDescriptions.A,
  }));
  const [axisSaveAttempted, setAxisSaveAttempted] = useState(false);
  const [axisSavedMessage, setAxisSavedMessage] = useState('');
  const [, setStatusMessage] = useState<AdminStatus>({
    kind: restored ? 'success' : 'info',
    text: restored
      ? 'ブラウザ内の下書きを読み込みました。'
      : '現在の設定を読み込みました。',
  });

  const validation = useMemo(() => validateAdminConfig(draft), [draft]);
  const errorPaths = useMemo(
    () => new Set(validation.errors.map(error => error.path)),
    [validation.errors],
  );
  const dirty = JSON.stringify(draft) !== baseline;
  const orderedQuestions = draft.questions;
  const jsonPreview = useMemo(() => {
    try {
      return validation.ok ? exportAdminConfig(draft) : `${JSON.stringify(draft, null, 2)}\n`;
    } catch {
      return `${JSON.stringify(draft, null, 2)}\n`;
    }
  }, [draft, validation.ok]);

  useEffect(() => {
    document.body.dataset.screen = 'admin';
    return () => {
      delete document.body.dataset.screen;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ADMIN_DRAFT_KEY, `${JSON.stringify(draft, null, 2)}\n`);
  }, [draft]);

  useEffect(() => {
    window.localStorage.setItem(ADMIN_SECTION_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const existingDepts = useMemo(() => {
    const depts: string[] = [];
    for (const division of draft.divisions) {
      if (!depts.includes(division.dept)) depts.push(division.dept);
    }
    return depts;
  }, [draft.divisions]);

  const groupedDivisions = useMemo(() => {
    const groups: { dept: string; rows: { division: ConfigDivision; index: number }[] }[] = [];
    const byDept = new Map<string, { dept: string; rows: { division: ConfigDivision; index: number }[] }>();
    draft.divisions.forEach((division, index) => {
      let group = byDept.get(division.dept);
      if (!group) {
        group = { dept: division.dept, rows: [] };
        byDept.set(division.dept, group);
        groups.push(group);
      }
      group.rows.push({ division, index });
    });
    return groups;
  }, [draft.divisions]);

  const archetypeEntries = useMemo(
    () => Object.entries(draft.archetypes).sort(([a], [b]) => a.localeCompare(b)),
    [draft.archetypes],
  );
  const activeArchetype = archetypeView.mode === 'edit'
    ? draft.archetypes[archetypeView.code]
    : undefined;
  const activeAxis = axisView.mode === 'edit' ? draft.axes[axisView.axis] : undefined;

  const hasError = (path: string) => errorPaths.has(path);
  const fieldClass = (path: string) => hasError(path) ? s.invalid : undefined;
  const divisionFormIssues = useMemo(
    () => validateDivisionForm(divisionForm, draft.divisions, divisionView.mode === 'edit' ? divisionView.key : undefined),
    [divisionForm, draft.divisions, divisionView],
  );
  const divisionFormIssueFields = useMemo(
    () => new Set(divisionFormIssues.map(issue => issue.field)),
    [divisionFormIssues],
  );
  const divisionDuplicateIssue = divisionFormIssues.find(issue => issue.field === 'duplicate');
  const showDivisionFormErrors = divisionSaveAttempted && divisionFormIssues.length > 0;
  const divisionFormDirty = JSON.stringify(divisionForm) !== divisionFormBaseline;
  const currentDivisionIndex = divisionView.mode === 'edit'
    ? findDivisionIndex(draft.divisions, divisionView.key)
    : -1;
  const questionFormIssues = useMemo(
    () => validateQuestionForm(questionForm),
    [questionForm],
  );
  const questionFormIssueFields = useMemo(
    () => new Set(questionFormIssues.map(issue => issue.field)),
    [questionFormIssues],
  );
  const showQuestionFormErrors = questionSaveAttempted && questionFormIssues.length > 0;
  const questionFormDirty = JSON.stringify(questionForm) !== questionFormBaseline;
  const currentQuestionAxis = draft.axes[questionForm.axis];
  const currentQuestionOrdinal = questionView.mode === 'edit'
    ? questionView.index + 1
    : draft.questions.length + 1;
  const displayedQuestionTotal = questionView.mode === 'edit'
    ? Math.max(draft.questions.length, 1)
    : draft.questions.length + 1;
  const questionEditStyle = {
    '--question-axis-dark': currentQuestionAxis.dark,
    '--question-axis-tint': currentQuestionAxis.tint,
  } as CSSProperties;
  const archetypeFormIssues = useMemo(() => validateArchetypeForm(archetypeForm), [archetypeForm]);
  const archetypeFormIssueFields = useMemo(
    () => new Set(archetypeFormIssues.map(issue => issue.field)),
    [archetypeFormIssues],
  );
  const showArchetypeFormErrors = archetypeSaveAttempted && archetypeFormIssues.length > 0;
  const archetypeFormDirty = JSON.stringify(archetypeForm) !== archetypeFormBaseline;
  const axisFormIssues = useMemo(() => validateAxisForm(axisForm), [axisForm]);
  const axisFormIssueFields = useMemo(
    () => new Set(axisFormIssues.map(issue => issue.field)),
    [axisFormIssues],
  );
  const showAxisFormErrors = axisSaveAttempted && axisFormIssues.length > 0;
  const axisFormDirty = JSON.stringify(axisForm) !== axisFormBaseline;
  const activeEditorDirty =
    (activeTab === 'divisions' && divisionView.mode !== 'list' && divisionFormDirty)
    || (activeTab === 'questions' && questionView.mode !== 'list' && questionFormDirty)
    || (activeTab === 'archetypes' && archetypeView.mode !== 'list' && archetypeFormDirty)
    || (activeTab === 'axes' && axisView.mode !== 'list' && axisFormDirty);

  useEffect(() => {
    if (!activeEditorDirty) return undefined;
    function handleBeforeUnload(event: BeforeUnloadEvent): void {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeEditorDirty]);

  function replaceDraft(next: AppConfig, message?: AdminStatus): void {
    setDraft(next);
    if (message) setStatusMessage(message);
  }

  function confirmLeaveUnsavedEditor(): boolean {
    return window.confirm('保存していない変更があります。この画面を離れると変更は下書きに保存されません。保存せずに移動しますか？');
  }

  function discardDivisionForm(): void {
    setDivisionForm(JSON.parse(divisionFormBaseline) as DivisionForm);
    setDivisionView({ mode: 'list' });
    setDivisionSaveAttempted(false);
    setDivisionSavedMessage('');
  }

  function discardQuestionForm(): void {
    setQuestionForm(JSON.parse(questionFormBaseline) as QuestionForm);
    setQuestionView({ mode: 'list' });
    setQuestionSaveAttempted(false);
    setQuestionSavedMessage('');
  }

  function discardArchetypeForm(): void {
    setArchetypeForm(JSON.parse(archetypeFormBaseline) as ArchetypeForm);
    setArchetypeView({ mode: 'list' });
    setArchetypeSaveAttempted(false);
    setArchetypeSavedMessage('');
  }

  function discardAxisForm(): void {
    const parsed = JSON.parse(axisFormBaseline) as AxisForm;
    setAxisForm(parsed);
    setAxisView({ mode: 'list' });
    setAxisSaveAttempted(false);
    setAxisSavedMessage('');
  }

  function hasActiveEditorUnsavedChanges(): boolean {
    return activeEditorDirty;
  }

  function discardActiveEditor(): void {
    if (activeTab === 'divisions') discardDivisionForm();
    if (activeTab === 'questions') discardQuestionForm();
    if (activeTab === 'archetypes') discardArchetypeForm();
    if (activeTab === 'axes') discardAxisForm();
  }

  function canLeaveActiveEditor(): boolean {
    if (!hasActiveEditorUnsavedChanges()) return true;
    if (!confirmLeaveUnsavedEditor()) return false;
    discardActiveEditor();
    return true;
  }

  function selectAdminSection(section: AdminSection): void {
    if (section === activeTab) return;
    if (!canLeaveActiveEditor()) return;
    setActiveTab(section);
  }

  function setDivisionFormDraft(next: DivisionForm): void {
    setDivisionForm(next);
    setDivisionFormBaseline(JSON.stringify(next));
    setDivisionSaveAttempted(false);
    setDivisionSavedMessage('');
  }

  function canLeaveDivisionForm(): boolean {
    if (divisionView.mode === 'list' || !divisionFormDirty) return true;
    if (!confirmLeaveUnsavedEditor()) return false;
    discardDivisionForm();
    return true;
  }

  function openDivisionList(): void {
    if (!canLeaveDivisionForm()) return;
    setDivisionView({ mode: 'list' });
    setDivisionSaveAttempted(false);
  }

  function openCreateDivision(): void {
    setDivisionFormDraft(blankDivisionForm(existingDepts));
    setDivisionView({ mode: 'create' });
  }

  function openEditDivision(index: number): void {
    const division = draft.divisions[index];
    if (!division) return;
    setDivisionFormDraft(divisionToForm(division, existingDepts));
    setDivisionView({ mode: 'edit', key: divisionKey(division) });
  }

  function openDuplicateDivision(index: number): void {
    const division = draft.divisions[index];
    if (!division) return;
    setDivisionFormDraft(divisionToForm({ ...division, name: `${division.name} コピー` }, existingDepts));
    setDivisionView({ mode: 'duplicate', key: divisionKey(division) });
  }

  function updateDivisionForm<K extends keyof DivisionForm>(key: K, value: DivisionForm[K]): void {
    setDivisionSavedMessage('');
    setDivisionForm(form => ({ ...form, [key]: value }));
  }

  function updateDivisionDeptSelection(value: string): void {
    setDivisionSavedMessage('');
    setDivisionForm(form => value === NEW_DEPT_OPTION
      ? { ...form, deptMode: 'new', dept: '' }
      : { ...form, deptMode: 'existing', dept: value });
  }

  function saveDivisionForm(): void {
    if (divisionFormIssues.length > 0) {
      setDivisionSaveAttempted(true);
      setStatusMessage({ kind: 'error', text: '課データの入力内容を確認してください。' });
      return;
    }
    const nextDivision = divisionFromForm(divisionForm);
    const nextKey = divisionKey(nextDivision);
    let nextDivisions: ConfigDivision[];

    if (divisionView.mode === 'edit') {
      const index = findDivisionIndex(draft.divisions, divisionView.key);
      if (index < 0) {
        setStatusMessage({ kind: 'error', text: '編集対象の課データが見つかりませんでした。' });
        return;
      }
      nextDivisions = draft.divisions.map((division, i) => i === index ? nextDivision : division);
    } else if (divisionView.mode === 'duplicate') {
      const index = findDivisionIndex(draft.divisions, divisionView.key);
      const insertAt = index < 0 ? draft.divisions.length : index + 1;
      nextDivisions = [
        ...draft.divisions.slice(0, insertAt),
        nextDivision,
        ...draft.divisions.slice(insertAt),
      ];
    } else {
      nextDivisions = [...draft.divisions, nextDivision];
    }

    replaceDraft(
      { ...draft, divisions: nextDivisions },
      { kind: 'success', text: `${nextDivision.dept} ${nextDivision.name}をブラウザ内の下書きに保存しました。` },
    );
    setDivisionFormDraft(divisionToForm(nextDivision, [...existingDepts, nextDivision.dept]));
    setDivisionView({ mode: 'edit', key: nextKey });
    setDivisionSavedMessage('ブラウザ内の下書きに保存しました。');
  }

  function deleteDivision(index: number): void {
    const target = draft.divisions[index];
    if (!target) return;
    if (!window.confirm(`${target.dept} ${target.name}を削除します。元に戻せません。削除しますか？`)) return;
    const next = draft.divisions.filter((_, i) => i !== index);
    replaceDraft({ ...draft, divisions: next });
    setDivisionView({ mode: 'list' });
  }

  function setQuestionFormDraft(next: QuestionForm): void {
    setQuestionForm(next);
    setQuestionFormBaseline(JSON.stringify(next));
    setQuestionSaveAttempted(false);
    setQuestionSavedMessage('');
  }

  function canLeaveQuestionForm(): boolean {
    if (questionView.mode === 'list' || !questionFormDirty) return true;
    if (!confirmLeaveUnsavedEditor()) return false;
    discardQuestionForm();
    return true;
  }

  function openQuestionList(): void {
    if (!canLeaveQuestionForm()) return;
    setQuestionView({ mode: 'list' });
    setQuestionSaveAttempted(false);
  }

  function openCreateQuestion(): void {
    setQuestionFormDraft(blankQuestionForm('A'));
    setQuestionView({ mode: 'create' });
  }

  function openEditQuestion(index: number): void {
    const question = draft.questions[index];
    if (!question) return;
    setQuestionFormDraft(questionToForm(question));
    setQuestionView({ mode: 'edit', index });
  }

  function updateQuestionForm<K extends keyof QuestionForm>(key: K, value: QuestionForm[K]): void {
    setQuestionSavedMessage('');
    setQuestionForm(form => ({ ...form, [key]: value }));
  }

  function updateQuestionFormAxis(axis: AxisKey): void {
    setQuestionForm(form => ({
      ...form,
      axis,
    }));
  }

  function saveQuestionForm(): void {
    if (questionFormIssues.length > 0) {
      setQuestionSaveAttempted(true);
      setStatusMessage({ kind: 'error', text: '設問の入力内容を確認してください。' });
      return;
    }
    const nextQuestion = questionFromForm(questionForm);
    let nextIndex = draft.questions.length;
    if (questionView.mode === 'edit') {
      nextIndex = questionView.index;
      replaceDraft(
        {
          ...draft,
          questions: draft.questions.map((question, index) => index === questionView.index ? nextQuestion : question),
        },
        { kind: 'success', text: `設問${questionView.index + 1}をブラウザ内の下書きに保存しました。` },
      );
    } else {
      replaceDraft(
        {
          ...draft,
          questions: [...draft.questions, nextQuestion],
        },
        { kind: 'success', text: `設問${draft.questions.length + 1}をブラウザ内の下書きに保存しました。` },
      );
    }
    setQuestionFormDraft(questionToForm(nextQuestion));
    setQuestionView({ mode: 'edit', index: nextIndex });
    setQuestionSavedMessage('ブラウザ内の下書きに保存しました。');
  }

  function deleteQuestion(index: number): void {
    if (!window.confirm(`設問${index + 1}を削除します。元に戻せません。削除しますか？`)) return;
    replaceDraft({
      ...draft,
      questions: draft.questions.filter((_, questionIndex) => questionIndex !== index),
    });
    setQuestionView({ mode: 'list' });
  }

  function setArchetypeFormDraft(next: ArchetypeForm): void {
    setArchetypeForm(next);
    setArchetypeFormBaseline(JSON.stringify(next));
    setArchetypeSaveAttempted(false);
    setArchetypeSavedMessage('');
  }

  function canLeaveArchetypeForm(): boolean {
    if (archetypeView.mode === 'list' || !archetypeFormDirty) return true;
    if (!confirmLeaveUnsavedEditor()) return false;
    discardArchetypeForm();
    return true;
  }

  function openEditArchetype(code: string): void {
    const type = draft.archetypes[code];
    if (!type) return;
    setArchetypeFormDraft(archetypeToForm(type));
    setArchetypeView({ mode: 'edit', code });
  }

  function openArchetypeList(): void {
    if (!canLeaveArchetypeForm()) return;
    setArchetypeView({ mode: 'list' });
    setArchetypeSaveAttempted(false);
  }

  function deleteArchetype(code: string): void {
    const target = draft.archetypes[code];
    if (!target) return;
    if (!window.confirm(`${target.name}を削除します。元に戻せません。削除しますか？`)) return;
    const { [code]: _removed, ...nextArchetypes } = draft.archetypes;
    replaceDraft({ ...draft, archetypes: nextArchetypes });
    if (archetypeView.mode === 'edit' && archetypeView.code === code) {
      setArchetypeView({ mode: 'list' });
    }
  }

  function updateArchetypeForm<K extends keyof ArchetypeForm>(key: K, value: ArchetypeForm[K]): void {
    setArchetypeSavedMessage('');
    setArchetypeForm(form => ({ ...form, [key]: value }));
  }

  function saveArchetypeForm(): void {
    if (archetypeView.mode !== 'edit') return;
    if (archetypeFormIssues.length > 0) {
      setArchetypeSaveAttempted(true);
      setStatusMessage({ kind: 'error', text: 'アーキタイプの入力内容を確認してください。' });
      return;
    }
    const patch = archetypeFromForm(archetypeForm);
    const nextType = { ...draft.archetypes[archetypeView.code], ...patch };
    replaceDraft({
      ...draft,
      archetypes: {
        ...draft.archetypes,
        [archetypeView.code]: nextType,
      },
    }, { kind: 'success', text: `${nextType.name}をブラウザ内の下書きに保存しました。` });
    setArchetypeFormDraft(archetypeToForm(nextType));
    setArchetypeSavedMessage('ブラウザ内の下書きに保存しました。');
  }

  function setAxisFormDraft(next: AxisForm): void {
    setAxisForm(next);
    setAxisFormBaseline(JSON.stringify(next));
    setAxisSaveAttempted(false);
    setAxisSavedMessage('');
  }

  function canLeaveAxisForm(): boolean {
    if (axisView.mode === 'list' || !axisFormDirty) return true;
    if (!confirmLeaveUnsavedEditor()) return false;
    discardAxisForm();
    return true;
  }

  function openEditAxis(axis: AxisKey): void {
    setAxisFormDraft(axisToForm(draft.axes[axis], draft.axisDescriptions[axis]));
    setAxisView({ mode: 'edit', axis });
  }

  function openAxisList(): void {
    if (!canLeaveAxisForm()) return;
    setAxisView({ mode: 'list' });
    setAxisSaveAttempted(false);
  }

  function updateAxisForm(patch: Partial<Axis>): void {
    setAxisSavedMessage('');
    setAxisForm(form => ({ ...form, axis: { ...form.axis, ...patch } }));
  }

  function updateAxisColorPreset(preset: typeof AXIS_COLOR_PRESETS[number]): void {
    updateAxisForm({
      color: preset.color,
      dark: preset.dark,
      tint: preset.tint,
    });
  }

  function updateAxisFormDesc(tier: keyof AxisDescTiers, value: string): void {
    setAxisSavedMessage('');
    setAxisForm(form => ({
      ...form,
      descriptions: { ...form.descriptions, [tier]: value },
    }));
  }

  function saveAxisForm(): void {
    if (axisView.mode !== 'edit') return;
    if (axisFormIssues.length > 0) {
      setAxisSaveAttempted(true);
      setStatusMessage({ kind: 'error', text: '5軸・説明文の入力内容を確認してください。' });
      return;
    }
    replaceDraft({
      ...draft,
      axes: {
        ...draft.axes,
        [axisView.axis]: axisForm.axis,
      },
      axisDescriptions: {
        ...draft.axisDescriptions,
        [axisView.axis]: axisForm.descriptions,
      },
    }, { kind: 'success', text: `${axisView.axis} ${axisForm.axis.label}をブラウザ内の下書きに保存しました。` });
    setAxisFormDraft(axisToForm(axisForm.axis, axisForm.descriptions));
    setAxisSavedMessage('ブラウザ内の下書きに保存しました。');
  }

  function handleExport(): void {
    const result = validateAdminConfig(draft);
    if (!result.ok) return;
    const blob = new Blob([exportAdminConfig(draft)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-config-${formatDownloadDate(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatusMessage({ kind: 'success', text: 'app-config.jsonを書き出しました。配布時はファイル名をapp-config.jsonにしてください。' });
  }

  return (
    <PageShell
      sidebar={
        <SidebarNav
          activeSection={activeTab}
          dirty={dirty}
          validationOk={validation.ok}
          onSelect={selectAdminSection}
        />
      }
    >

      {activeTab === 'divisions' && (
        <section className={s.panel}>
          {divisionView.mode === 'list' ? (
            <div className={s.divisionListView}>
              <SectionHeader
                title="課データ"
                action={<AdminButton variant="secondary" onClick={openCreateDivision}>課を追加</AdminButton>}
              />
              <div className={s.divisionGroups}>
                {groupedDivisions.map(group => (
                  <section key={group.dept} className={s.divisionGroup}>
                    <div className={s.divisionGroupHead}>
                      <h3>{group.dept}</h3>
                    </div>
                    <ul className={s.divisionDirectory}>
                      {group.rows.map(({ division, index }) => (
                        <DirectoryRow
                          key={`${division.dept}-${division.name}-${index}`}
                          className={s.divisionDirectoryRow}
                          onClick={() => openEditDivision(index)}
                          action={
                            <RowDeleteButton
                              label={`${division.dept} ${division.name}を削除`}
                              onClick={() => deleteDivision(index)}
                            />
                          }
                        >
                          <span className={s.divisionNameText}>{division.name}</span>
                        </DirectoryRow>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className={s.divisionEditor}>
              <SectionHeader
                breadcrumb={
                  <Breadcrumbs
                    items={[
                      { label: '課データ', onClick: openDivisionList },
                      ...(divisionView.mode === 'create'
                        ? [{ label: '課を追加' }]
                        : [
                            { label: divisionForm.dept || '部' },
                            { label: divisionView.mode === 'duplicate' ? `${divisionForm.name || '課'}を複製` : divisionForm.name || '課' },
                          ]),
                    ]}
                  />
                }
                title={
                  <>
                    {divisionView.mode === 'create' && '課を追加'}
                    {divisionView.mode === 'edit' && `課を編集：${divisionForm.dept} ${divisionForm.name}`}
                    {divisionView.mode === 'duplicate' && `課を複製：${divisionForm.dept} ${divisionForm.name}`}
                  </>
                }
              />

              <ValidationSummary
                show={showDivisionFormErrors}
                issues={divisionFormIssues.map(issue => issue.message)}
              />

              <section className={s.formSection}>
                <h3>基本情報</h3>
                <div className={s.formGrid}>
                  <div className={s.formField}>
                    <span>部</span>
                    <AdminSelect
                      ariaLabel="部"
                      invalid={showDivisionFormErrors && divisionFormIssueFields.has('dept')}
                      value={divisionForm.deptMode === 'new' ? NEW_DEPT_OPTION : divisionForm.dept}
                      onChange={updateDivisionDeptSelection}
                      options={[
                        ...existingDepts.map(dept => ({ value: dept, label: dept })),
                        { value: NEW_DEPT_OPTION, label: '新しい部を作成', intent: 'action' as const },
                      ]}
                    />
                  </div>
                  <label>
                    課名
                    <input
                      className={showDivisionFormErrors && (divisionFormIssueFields.has('name') || divisionFormIssueFields.has('duplicate')) ? s.invalid : undefined}
                      value={divisionForm.name}
                      onChange={e => updateDivisionForm('name', e.target.value)}
                    />
                  </label>
                </div>
                {divisionForm.deptMode === 'new' && (
                  <label className={s.fullLabel}>
                    新しい部名
                    <input
                      className={showDivisionFormErrors && divisionFormIssueFields.has('dept') ? s.invalid : undefined}
                      value={divisionForm.dept}
                      onChange={e => updateDivisionForm('dept', e.target.value)}
                    />
                  </label>
                )}
                {showDivisionFormErrors && divisionDuplicateIssue?.duplicateIndex !== undefined && (
                  <div className={s.inlineActions}>
                    <AdminButton
                      variant="tertiary"
                      onClick={() => {
                        if (canLeaveDivisionForm()) openEditDivision(divisionDuplicateIssue.duplicateIndex!);
                      }}
                    >
                      既存の課を編集する
                    </AdminButton>
                  </div>
                )}
              </section>

              <section className={s.formSection}>
                <h3>5軸の適性</h3>
                <div className={s.axisEditorList}>
                  {AX.map(axis => {
                    const axisConfig = draft.axes[axis];
                    const value = divisionWeightValue(divisionForm[axis]);
                    const side = weightSide(value);
                    const activeLabel = side === 'neutral'
                      ? '中立'
                      : side === 'minus'
                        ? axisConfig.minus
                        : axisConfig.plus;
                    const strengthLabel = side === 'neutral' ? 0 : Math.abs(value);
                    return (
                      <div key={axis} className={s.axisEditorRow}>
                        <div className={s.axisVisual}>
                          <div className={s.axisVisualHead}>
                            <strong style={{ color: axisConfig.dark }}>{axis} {axisConfig.label}</strong>
                            <span>{activeLabel} {strengthLabel}</span>
                          </div>
                          <div className={s.axisTrackWrap}>
                            <span>{axisConfig.minus}</span>
                            <div
                              className={s.axisSliderArea}
                              style={{
                                '--axis-color': axisConfig.color,
                                '--axis-dark': axisConfig.dark,
                                '--axis-pos': `${divisionWeightPct(value)}%`,
                              } as CSSProperties}
                            >
                              <div className={s.axisTicks} aria-hidden="true">
                                {DIVISION_WEIGHT_TICKS.map(tick => (
                                  <span
                                    key={tick}
                                    className={tick === 0 ? s.axisTickCenter : undefined}
                                    style={{ left: `${divisionWeightPct(tick)}%` }}
                                  />
                                ))}
                              </div>
                              <div className={s.axisTickLabels} aria-hidden="true">
                                {DIVISION_WEIGHT_TICKS.map(tick => (
                                  <span key={tick} style={{ left: `${divisionWeightPct(tick)}%` }}>
                                    {Math.abs(tick)}
                                  </span>
                                ))}
                              </div>
                              <input
                                className={s.axisSlider}
                                type="range"
                                min="-10"
                                max="10"
                                step="1"
                                value={value}
                                onChange={e => updateDivisionForm(axis, Number(e.target.value))}
                                aria-label={`${axisConfig.label}の適性値`}
                                aria-valuetext={`${activeLabel} ${strengthLabel}`}
                              />
                              <span
                                className={s.axisMarker}
                                aria-hidden="true"
                              >
                                {strengthLabel}
                              </span>
                            </div>
                            <span>{axisConfig.plus}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className={s.formSection}>
                <h3>説明文</h3>
                <label className={s.fullLabel}>
                  診断結果に表示する説明
                  <textarea
                    className={showDivisionFormErrors && divisionFormIssueFields.has('about') ? s.invalid : undefined}
                    value={divisionForm.about}
                    onChange={e => updateDivisionForm('about', e.target.value)}
                    rows={6}
                  />
                </label>
                <p className={s.muted}>{divisionForm.about.trim().length}文字</p>
              </section>

              <div className={s.editorActionBar}>
                <div className={s.editorPrimaryActions}>
                  <AdminButton variant="primary" onClick={saveDivisionForm}>課を保存</AdminButton>
                  {divisionSavedMessage && <p className={s.formFooterMessage}>{divisionSavedMessage}</p>}
                </div>
                {divisionView.mode === 'edit' && currentDivisionIndex >= 0 && (
                  <div className={s.editorSecondaryActions} aria-label="その他の操作">
                    <AdminButton
                      variant="tertiary"
                      onClick={() => {
                        if (canLeaveDivisionForm()) openDuplicateDivision(currentDivisionIndex);
                      }}
                    >
                      この課を複製する
                    </AdminButton>
                    <AdminButton variant="danger" onClick={() => deleteDivision(currentDivisionIndex)}>
                      この課を削除する
                    </AdminButton>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'questions' && (
        <section className={s.panel}>
          {questionView.mode === 'list' ? (
            <div className={s.questionListView}>
              <SectionHeader
                title="設問"
                action={<AdminButton variant="secondary" onClick={openCreateQuestion}>設問を追加</AdminButton>}
              />
              <DirectoryList className={s.questionOutline}>
                {orderedQuestions.map((question, index) => {
                  const axis = draft.axes[question.axis];
                  return (
                    <DirectoryRow
                      key={index}
                      className={s.questionOutlineRow}
                      onClick={() => openEditQuestion(index)}
                      action={
                        <RowDeleteButton
                          label={`設問${index + 1}を削除`}
                          onClick={() => deleteQuestion(index)}
                        />
                      }
                    >
                      <span className={s.questionNumber}>{index + 1}</span>
                      <span className={s.questionText}>
                        <span className={s.questionScenario} style={{ color: axis.dark }}>
                          {questionPreview(question.scenario)}
                        </span>
                      </span>
                    </DirectoryRow>
                  );
                })}
              </DirectoryList>
            </div>
          ) : (
            <div className={s.questionEditor}>
              <SectionHeader
                breadcrumb={
                  <Breadcrumbs
                    items={[
                      { label: '設問', onClick: openQuestionList },
                      { label: questionView.mode === 'create' ? '設問を追加' : `設問${questionView.index + 1}` },
                    ]}
                  />
                }
                title={
                  <>
                    {questionView.mode === 'create' && '設問を追加'}
                    {questionView.mode === 'edit' && `設問${questionView.index + 1}を編集`}
                  </>
                }
              />

              <ValidationSummary
                show={showQuestionFormErrors}
                issues={questionFormIssues.map(issue => issue.message)}
              />

              <section className={`${s.formSection} ${s.questionSettingsSection}`}>
                <div className={s.questionSettingsLine}>
                  <div className={s.questionSettingField}>
                    <span>軸</span>
                    <AdminSelect
                      ariaLabel="軸"
                      invalid={showQuestionFormErrors && questionFormIssueFields.has('axis')}
                      value={questionForm.axis}
                      onChange={value => updateQuestionFormAxis(value as AxisKey)}
                      options={AX.map(axis => ({ value: axis, label: `${axis}: ${draft.axes[axis].label}` }))}
                    />
                  </div>
                  <div className={s.questionSettingField}>
                    <span>回答5が示す特性</span>
                    <AdminSelect
                      ariaLabel="回答5が示す特性"
                      value={questionForm.reversed ? 'minus' : 'plus'}
                      onChange={value => updateQuestionForm('reversed', value === 'minus')}
                      options={[
                        { value: 'plus', label: draft.axes[questionForm.axis].plus },
                        { value: 'minus', label: draft.axes[questionForm.axis].minus },
                      ]}
                    />
                  </div>
                </div>
              </section>

              <section className={`${s.formSection} ${s.questionLiveSection}`} style={questionEditStyle}>
                <div className={s.quizEditSurface}>
                  <div className={s.quizEditMeta}>
                    <span className={s.quizEditQuestionNumber}>
                      Q.{currentQuestionOrdinal > 0 ? currentQuestionOrdinal : 1}
                      <span aria-hidden="true">/</span>
                      {displayedQuestionTotal}
                    </span>
                    <span className={s.quizEditAxisTag}>{currentQuestionAxis.label}</span>
                  </div>

                  <label className={s.quizScenarioField}>
                    <span>設問文</span>
                    <textarea
                      aria-label="設問文"
                      className={showQuestionFormErrors && questionFormIssueFields.has('scenario') ? s.invalid : undefined}
                      rows={4}
                      value={questionForm.scenario}
                      onChange={e => updateQuestionForm('scenario', e.target.value)}
                    />
                    <small>{questionForm.scenario.length}字</small>
                  </label>

                  <p className={s.quizOptionsPrompt}>この場面、あなたにはどのくらい合っていますか？</p>
                  <ol className={s.quizOptionEditList}>
                    {questionForm.options.map((option, optionIndex) => {
                      const optionAffinity = questionOptionLabel(questionForm, optionIndex, draft.axes);
                      return (
                      <li key={optionIndex}>
                        <div className={s.quizOptionEditRow}>
                          <span className={s.quizOptionEditNumber}>{optionIndex + 1}</span>
                          <label className={s.quizOptionEditBody}>
                            <span>{optionAffinity}</span>
                            <input
                              aria-label={`選択肢${optionIndex + 1}`}
                              className={showQuestionFormErrors && questionFormIssueFields.has(`option-${optionIndex}`) ? s.invalid : undefined}
                              value={option}
                              onChange={e => {
                                const options = [...questionForm.options] as Question['options'];
                                options[optionIndex] = e.target.value;
                                updateQuestionForm('options', options);
                              }}
                            />
                          </label>
                        </div>
                      </li>
                      );
                    })}
                  </ol>
                </div>
              </section>

              <div className={s.editorActionBar}>
                <div className={s.editorPrimaryActions}>
                  <AdminButton variant="primary" onClick={saveQuestionForm}>設問を保存</AdminButton>
                  {questionSavedMessage && <p className={s.formFooterMessage}>{questionSavedMessage}</p>}
                </div>
                {questionView.mode === 'edit' && (
                  <div className={s.editorSecondaryActions} aria-label="その他の操作">
                    <AdminButton variant="danger" onClick={() => deleteQuestion(questionView.index)}>
                      この設問を削除する
                    </AdminButton>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'archetypes' && (
        <section className={s.panel}>
          {archetypeView.mode === 'list' ? (
            <div className={s.archetypeListView}>
              <SectionHeader title="アーキタイプ" />
              <DirectoryList className={s.archetypeDirectory}>
                {archetypeEntries.map(([code, type]) => (
                  <DirectoryRow
                    key={code}
                    className={s.archetypeDirectoryRow}
                    onClick={() => openEditArchetype(code)}
                    action={
                      <RowDeleteButton
                        label={`${type.name}を削除`}
                        onClick={() => deleteArchetype(code)}
                      />
                    }
                  >
                    <span className={s.archetypeNameText}>{type.name}</span>
                    <span className={s.archetypeDescText}>{textPreview(type.desc, 58)}</span>
                  </DirectoryRow>
                ))}
              </DirectoryList>
            </div>
          ) : activeArchetype ? (() => {
            const lines = { line1: archetypeForm.nameLine1, line2: archetypeForm.nameLine2 };
            const palette = archetypePalette(archetypeView.code);
            const imageSrc = sukarinSrc(archetypeView.code);
            return (
              <div className={s.archetypeEditor}>
                <SectionHeader
                  breadcrumb={
                    <Breadcrumbs
                      items={[
                        { label: 'アーキタイプ', onClick: openArchetypeList },
                        { label: activeArchetype.name },
                      ]}
                    />
                  }
                  title={`${activeArchetype.name}を編集`}
                />

                <ValidationSummary
                  show={showArchetypeFormErrors}
                  issues={archetypeFormIssues.map(issue => issue.message)}
                />

                <section className={s.archetypePreview} style={{ background: palette.baseGradient }}>
                  {imageSrc && <img src={imageSrc} alt="" aria-hidden="true" />}
                  <div>
                    <p>結果画面での表示</p>
                    <h3>
                      <span>{lines.line1 || '名称'}</span>
                      {lines.line2 ? <span>{lines.line2}<small>型</small></span> : <span><small>型</small></span>}
                    </h3>
                    <p>{archetypeForm.desc || '説明文未入力'}</p>
                  </div>
                </section>

                <section className={s.archetypeForm}>
                  <div className={s.archetypeNameLineFields}>
                    <label>
                      名称 1行目
                      <input
                        className={showArchetypeFormErrors && archetypeFormIssueFields.has('name') ? s.invalid : fieldClass(`archetypes.${archetypeView.code}.name`)}
                        value={archetypeForm.nameLine1}
                        onChange={e => updateArchetypeForm('nameLine1', e.target.value)}
                      />
                    </label>
                    <label>
                      名称 2行目（任意）
                      <input
                        className={showArchetypeFormErrors && archetypeFormIssueFields.has('nameBreakAt') ? s.invalid : fieldClass(`archetypes.${archetypeView.code}.nameBreakAt`)}
                        value={archetypeForm.nameLine2}
                        onChange={e => updateArchetypeForm('nameLine2', e.target.value)}
                      />
                    </label>
                  </div>
                  <label className={s.fullLabel}>
                    説明文
                    <textarea
                      className={showArchetypeFormErrors && archetypeFormIssueFields.has('desc') ? s.invalid : fieldClass(`archetypes.${archetypeView.code}.desc`)}
                      rows={7}
                      value={archetypeForm.desc}
                      onChange={e => updateArchetypeForm('desc', e.target.value)}
                    />
                  </label>
                </section>
                <FormFooter onSave={saveArchetypeForm} savedMessage={archetypeSavedMessage} saveLabel="アーキタイプを保存" />
              </div>
            );
          })() : (
            <div className={s.archetypeEditor}>
              <SectionHeader
                breadcrumb={
                  <Breadcrumbs
                    items={[
                      { label: 'アーキタイプ', onClick: openArchetypeList },
                      { label: '未選択' },
                    ]}
                  />
                }
                title="アーキタイプ"
              />
              <p className={s.muted}>選択したアーキタイプが見つかりません。</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'axes' && (
        <section className={s.panel}>
          {axisView.mode === 'list' ? (
            <div className={s.axisListView}>
              <SectionHeader title="5軸・説明文" />
              <DirectoryList className={s.axisDirectory}>
                {AX.map(axis => {
                  const item = draft.axes[axis];
                  return (
                    <DirectoryRow key={axis} className={s.axisDirectoryRow} onClick={() => openEditAxis(axis)}>
                      <span className={s.axisNameText} style={{ color: item.dark }}>{item.label}</span>
                      <span className={s.axisVsText}>{item.minus} <span>vs.</span> {item.plus}</span>
                    </DirectoryRow>
                  );
                })}
              </DirectoryList>
            </div>
          ) : activeAxis ? (
            <div className={s.axisEditor}>
              <SectionHeader
                breadcrumb={
                  <Breadcrumbs
                    items={[
                      { label: '5軸・説明文', onClick: openAxisList },
                      { label: axisForm.axis.label },
                    ]}
                  />
                }
                title={`${axisForm.axis.label}を編集`}
              />

              <ValidationSummary
                show={showAxisFormErrors}
                issues={axisFormIssues.map(issue => issue.message)}
              />

              <section className={s.axisFormSection}>
                <div className={s.axisSectionHead}>
                  <h3>軸の意味</h3>
                  <p>診断で比較する2つの方向を設定します。</p>
                </div>
                <div className={s.axisMeaningGrid}>
                  <label className={s.axisNameField}>
                    軸名
                    <input
                      className={showAxisFormErrors && axisFormIssueFields.has('axis.label') ? s.invalid : fieldClass(`axes.${axisView.axis}.label`)}
                      value={axisForm.axis.label}
                      onChange={e => updateAxisForm({ label: e.target.value })}
                    />
                  </label>
                  <div className={s.axisPoleFields}>
                    <label>
                      左側の特性
                      <input
                        className={showAxisFormErrors && axisFormIssueFields.has('axis.minus') ? s.invalid : fieldClass(`axes.${axisView.axis}.minus`)}
                        value={axisForm.axis.minus}
                        onChange={e => updateAxisForm({ minus: e.target.value })}
                      />
                    </label>
                    <span className={s.axisVsDivider}>vs.</span>
                    <label>
                      右側の特性
                      <input
                        className={showAxisFormErrors && axisFormIssueFields.has('axis.plus') ? s.invalid : fieldClass(`axes.${axisView.axis}.plus`)}
                        value={axisForm.axis.plus}
                        onChange={e => updateAxisForm({ plus: e.target.value })}
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section className={s.axisFormSection}>
                <div className={s.axisSectionHead}>
                  <h3>表示色</h3>
                  <p>1つ選ぶと、文字色・基本色・背景色をまとめて設定します。</p>
                </div>
                <div className={s.axisColorChoiceGrid}>
                  {AXIS_COLOR_PRESETS.map(preset => {
                    const selected = matchingAxisColorPreset(axisForm.axis) === preset.id;
                    const usedBy = axisUsingColorPreset(draft.axes, preset.id, axisView.axis);
                    const unavailable = Boolean(usedBy) && !selected;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`${s.axisColorChoice} ${selected ? s.axisColorChoiceSelected : ''} ${unavailable ? s.axisColorChoiceDisabled : ''}`}
                        onClick={() => updateAxisColorPreset(preset)}
                        disabled={unavailable}
                        aria-pressed={selected}
                        title={usedBy ? `${draft.axes[usedBy].label}で使用中` : undefined}
                      >
                        <span className={s.axisColorChoiceName}>{preset.label}</span>
                        <span className={s.axisColorSwatches} aria-hidden="true">
                          <span style={{ background: preset.dark }} />
                          <span style={{ background: preset.color }} />
                          <span style={{ background: preset.tint }} />
                        </span>
                        {unavailable && usedBy && (
                          <span className={s.axisColorUsedLabel}>{draft.axes[usedBy].label}で使用中</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className={s.axisColorPreview} style={{ background: axisForm.axis.tint }}>
                  <span style={{ color: axisForm.axis.dark }}>{axisForm.axis.label}</span>
                  <strong style={{ color: axisForm.axis.dark }}>{axisForm.axis.minus} vs. {axisForm.axis.plus}</strong>
                </div>
                {showAxisFormErrors && AXIS_COLOR_FIELDS.some(field => axisFormIssueFields.has(`axis.${String(field.key)}`)) && (
                  <p className={s.fieldError}>表示色を選び直してください。</p>
                )}
              </section>

              <section className={s.axisFormSection}>
                <div className={s.axisSectionHead}>
                  <h3>診断説明文</h3>
                  <p>結果画面で、利用者の傾向に合わせて表示される文章です。</p>
                </div>
                <div className={s.axisDescriptionGroups}>
                  <div className={s.axisDescriptionGroup}>
                    <h4>{axisForm.axis.plus}側</h4>
                    {(['strong_plus', 'mild_plus'] as const).map(tier => (
                      <label key={tier}>
                        {axisDescLabel(axisForm.axis, tier)}
                        <textarea
                          className={showAxisFormErrors && axisFormIssueFields.has(`descriptions.${tier}`) ? s.invalid : fieldClass(`axisDescriptions.${axisView.axis}.${tier}`)}
                          rows={4}
                          value={axisForm.descriptions[tier]}
                          onChange={e => updateAxisFormDesc(tier, e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                  <div className={s.axisDescriptionGroup}>
                    <h4>中立</h4>
                    <label>
                      {axisDescLabel(axisForm.axis, 'neutral')}
                      <textarea
                        className={showAxisFormErrors && axisFormIssueFields.has('descriptions.neutral') ? s.invalid : fieldClass(`axisDescriptions.${axisView.axis}.neutral`)}
                        rows={4}
                        value={axisForm.descriptions.neutral}
                        onChange={e => updateAxisFormDesc('neutral', e.target.value)}
                      />
                    </label>
                  </div>
                  <div className={s.axisDescriptionGroup}>
                    <h4>{axisForm.axis.minus}側</h4>
                    {(['mild_minus', 'strong_minus'] as const).map(tier => (
                      <label key={tier}>
                        {axisDescLabel(axisForm.axis, tier)}
                        <textarea
                          className={showAxisFormErrors && axisFormIssueFields.has(`descriptions.${tier}`) ? s.invalid : fieldClass(`axisDescriptions.${axisView.axis}.${tier}`)}
                          rows={4}
                          value={axisForm.descriptions[tier]}
                          onChange={e => updateAxisFormDesc(tier, e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <section className={s.axisResultPreview}>
                <div className={s.axisSectionHead}>
                  <h3>結果画面の見え方</h3>
                </div>
                <div className={s.axisResultCard} style={{ background: axisForm.axis.tint }}>
                  <span style={{ color: axisForm.axis.dark }}>強い {axisForm.axis.plus}</span>
                  <p>{axisForm.descriptions.strong_plus}</p>
                  <strong style={{ color: axisForm.axis.dark }}>{axisForm.axis.plus}</strong>
                </div>
              </section>

              <FormFooter onSave={saveAxisForm} savedMessage={axisSavedMessage} saveLabel="軸設定を保存" />
            </div>
          ) : (
            <div className={s.axisEditor}>
              <SectionHeader
                breadcrumb={
                  <Breadcrumbs
                    items={[
                      { label: '5軸・説明文', onClick: openAxisList },
                      { label: '未選択' },
                    ]}
                  />
                }
                title="5軸・説明文"
              />
              <p className={s.muted}>選択した軸が見つかりません。</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'json' && (
        <section className={s.panel}>
          <SectionHeader
            title="書き出し確認"
            action={
              <AdminButton variant="primary" onClick={handleExport} disabled={!validation.ok}>
                app-config.jsonを書き出す
              </AdminButton>
            }
          />
          {!validation.ok && (
            <div className={s.errorBox}>
              <h3>確認事項</h3>
              <ul>
                {validation.errors.map((error, index) => (
                  <li key={`${error.path}-${index}`}><strong>{error.path}</strong>: {error.message}</li>
                ))}
              </ul>
            </div>
          )}
          <textarea className={s.jsonPreview} readOnly value={jsonPreview} />
        </section>
      )}

      {activeTab === 'manual' && (
        <section className={s.panel}>
          <AdminManual />
        </section>
      )}
    </PageShell>
  );
}
