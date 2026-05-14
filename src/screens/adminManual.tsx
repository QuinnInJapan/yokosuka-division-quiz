import s from './Admin.module.css';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

type ManualExampleProps = {
  title: string;
  note: string;
  points: ManualPoint[];
  children: ReactNode;
};

type ManualFocusPoint = {
  number: string;
  title: string;
};

type ManualPoint = ManualFocusPoint & {
  body: string;
};

type TocSection = {
  id: string;
  title: string;
  children: string[];
};

const tocSections: TocSection[] = [
  {
    id: 'manual-start',
    title: 'はじめに',
    children: ['この管理画面でできること', '下書きと配布用ファイルの違い', '編集から配布までの流れ'],
  },
  {
    id: 'manual-concepts',
    title: '診断データの基本',
    children: ['課データとは', '部と課名とは', '5軸とは', 'スコアとは', '設問とは', '回答5が示す特性とは', 'アーキタイプとは', '説明文とは'],
  },
  {
    id: 'manual-overview',
    title: '画面全体の見方',
    children: ['左側メニュー', '一覧画面', '編集画面', '番号付き説明の読み方', 'パンくず', '下書き・検証表示'],
  },
  {
    id: 'manual-divisions',
    title: '課データを編集する',
    children: ['課を探す', '課を追加する', '既存の課を編集する', '部と課名を設定する', '5軸の適性を調整する', '説明文を確認・修正する', '課を複製する', '課を削除する'],
  },
  {
    id: 'manual-questions',
    title: '設問を編集する',
    children: ['設問を探す', '設問を追加する', '設問文を確認・修正する', '選択肢を確認・修正する', '設問の軸を選ぶ', '回答5が示す特性を選ぶ', '設問を削除する'],
  },
  {
    id: 'manual-archetypes',
    title: 'アーキタイプを編集する',
    children: ['アーキタイプを探す', '結果画面のプレビューを見る', '名称を編集する', '説明文を確認・修正する', 'アーキタイプを削除する'],
  },
  {
    id: 'manual-axes',
    title: '5軸・説明文を編集する',
    children: ['軸を選ぶ', '軸の意味を編集する', '表示色を選ぶ', '診断説明文を確認・修正する', '結果画面の見え方を確認する'],
  },
  {
    id: 'manual-export',
    title: '保存と書き出し',
    children: ['各編集画面で保存する', '書き出し確認を開く', '入力内容を確認する', 'app-config.jsonを書き出す', '配布時のファイル名を確認する'],
  },
  {
    id: 'manual-errors',
    title: '入力内容に問題がある場合',
    children: ['赤く表示された項目を直す', '必須項目を入力する', '重複した部・課名を直す', '保存できない場合', '書き出しできない場合'],
  },
  {
    id: 'manual-print',
    title: 'この使い方を印刷する',
    children: ['ブラウザからPDFにする', '印刷時の見え方を確認する'],
  },
];

const manualSubtopicCopy: Record<string, string[]> = {
  'manual-start': [
    '課データ、設問、アーキタイプ、5軸の説明文、配布用ファイルの書き出しを行います。',
    '保存しても利用者向け画面にはまだ反映されません。配布用ファイルを書き出して差し替えるまで、下書きの状態です。',
    '内容を編集し、保存し、書き出し確認で問題がないことを見てから、配布用ファイルを書き出します。',
  ],
  'manual-concepts': [
    '診断結果でおすすめ候補として表示される課の情報です。',
    '部と課名の組み合わせで課を探します。同じ組み合わせは重複して登録しません。',
    '診断で使う5つのものさしです。仕事の向きやすさの違いを表します。',
    '各軸で左右どちらの特性にどの程度近いかを表します。',
    '利用者が回答する質問です。回答はどれか1つの軸に反映されます。',
    '5番目の選択肢を選んだとき、左右どちらの特性へ点数を寄せるかを指定します。',
    '5軸の組み合わせから表示される結果タイプです。',
    '利用者が結果を理解するための本文です。課、アーキタイプ、5軸の結果に表示されます。',
  ],
  'manual-overview': [
    '編集する種類を選ぶ場所です。使い方は一番下にあります。',
    '既存データを探す画面です。行を選ぶと編集画面へ進みます。',
    '1件のデータを確認・修正する画面です。保存前に戻る場合は確認が出ます。',
    '赤い番号はこの使い方ページだけの説明です。実際の編集画面には表示されません。',
    'いま開いている場所を示します。前の一覧へ戻る道筋にもなります。',
    '下書きの有無と、書き出しできる状態かを確認します。',
  ],
  'manual-divisions': [
    '部の見出しから目的の課を探します。',
    '一覧にない課を新しく登録するときに使います。',
    '課名の行を選び、部、課名、5軸、説明文を確認します。',
    '部は一覧から選びます。新しい部へ移すときだけ、部の選択肢の最後にある「新しい部を作成」を選びます。',
    'バー上の点で、この課が左右どちらの特性にどの程度近いかを調整します。',
    '診断結果でその課をすすめる理由として読まれる文章を確認・修正します。',
    '似た設定の課を新しく作るときだけ使います。',
    '結果候補から外したい課を削除します。削除前に対象を確認してください。',
  ],
  'manual-questions': [
    '設問文の一覧から編集したい設問を探します。',
    '新しい質問を追加するときに使います。',
    '利用者が状況を想像しやすい場面文を確認・修正します。',
    '1から5までの回答文を、意味の強さが自然に並ぶよう確認・修正します。',
    'この設問の回答が、どの軸の点数に影響するかを選びます。',
    '5番目の選択肢を選んだとき、左右どちらの特性へ寄せるかを選びます。',
    '使わない設問を一覧から削除します。',
  ],
  'manual-archetypes': [
    '結果タイプ名と説明文の短い表示から探します。',
    '利用者に表示される結果画面に近い見え方で確認します。',
    '長い名称は2行に分けて読みやすくできます。',
    '結果画面で読まれるタイプ説明を確認・修正します。',
    '使わない結果タイプを削除します。',
  ],
  'manual-axes': [
    '軸名と左右の特性を見て、編集する軸を選びます。',
    '診断全体で使われる軸の見出しを編集します。',
    '左右に置く特性名を編集します。優劣ではなく傾向の違いです。',
    '結果画面や設問一覧で使う色を選びます。',
    '強い傾向、やや傾向、中立など、結果画面に出る説明を確認・修正します。',
  ],
  'manual-export': [
    '各編集画面で保存すると、ブラウザ内の下書きになります。',
    '配布用ファイルを作る前に、書き出し確認を開きます。',
    '空欄や重複など、書き出しを止める問題がないか確認します。',
    '問題がなければ配布用ファイルを保存します。',
    '配布時のファイル名は app-config.json のままにします。',
  ],
  'manual-errors': [
    '赤い入力欄が修正対象です。',
    '必須項目は空欄のまま保存できません。',
    '同じ部と課名の組み合わせがある場合は、課名または部を直します。',
    '保存できない場合は、画面上部の案内と赤い入力欄を確認します。',
    '書き出しできない場合は、書き出し確認に表示された問題を先に修正します。',
  ],
  'manual-print': [
    'Microsoft Edge の印刷機能でPDFとして保存できます。',
    '赤い番号と説明が途中で読みにくくなっていないか確認します。',
  ],
};

const MANUAL_SLIDER_TICKS = Array.from({ length: 21 }, (_, index) => index - 10);

function manualSliderTickPosition(tick: number): string {
  return `${((tick + 10) / 20) * 100}%`;
}

function childId(sectionId: string, index: number): string {
  return `${sectionId}-${index + 1}`;
}

function scrollToManualTarget(event: MouseEvent<HTMLAnchorElement>, targetId: string): void {
  event.preventDefault();
  document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
}

function ManualExample({ title, note, points, children }: ManualExampleProps) {
  return (
    <figure className={s.manualExample}>
      <figcaption>
        <strong>{title}</strong>
        <span>{note}</span>
      </figcaption>
      <div className={s.manualExampleBody}>
        <div className={s.manualExampleSurface}>{children}</div>
        <ol className={s.manualPointList} aria-label={`${title}の説明`}>
          {points.map(point => (
            <li key={`${point.number}-${point.title}`}>
              <span>{point.number}</span>
              <div>
                <strong>{point.title}</strong>
                <p>{point.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}

function ManualSubtopicList({ sectionId }: { sectionId: string }) {
  const section = tocSections.find(item => item.id === sectionId);
  const bodies = manualSubtopicCopy[sectionId] ?? [];
  if (!section) return null;
  return (
    <div className={s.manualSubtopicList}>
      {section.children.map((title, index) => (
        <section key={title} id={childId(sectionId, index)} className={s.manualSubtopic}>
          <h4>{title}</h4>
          <p>{bodies[index]}</p>
        </section>
      ))}
    </div>
  );
}

function focusAttrs(number: string, title: string) {
  return {
    'aria-label': `強調${number}：${title}`,
    'data-focus-label': number,
  };
}

function StaticButton({
  children,
  variant = 'secondary',
  focus,
  disabled = false,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  focus?: ManualFocusPoint;
  disabled?: boolean;
}) {
  const variantClass = {
    primary: s.adminButtonPrimary,
    secondary: s.adminButtonSecondary,
    tertiary: s.adminButtonTertiary,
    danger: s.adminButtonDanger,
  }[variant];
  return (
    <span
      className={`${s.adminButton} ${variantClass} ${s.adminButtonMd} ${s.manualStaticControl} ${disabled ? s.manualDisabledButton : ''} ${focus ? s.manualFocus : ''}`}
      {...(focus ? focusAttrs(focus.number, focus.title) : {})}
    >
      {children}
    </span>
  );
}

function StaticField({
  label,
  value,
  multiline = false,
  invalid = false,
  focus,
}: {
  label: string;
  value: ReactNode;
  multiline?: boolean;
  invalid?: boolean;
  focus?: ManualFocusPoint;
}) {
  return (
    <label className={`${s.manualFieldLabel} ${focus ? s.manualFocus : ''}`} {...(focus ? focusAttrs(focus.number, focus.title) : {})}>
      <span>{label}</span>
      <span className={`${multiline ? s.manualStaticTextarea : s.manualStaticInput} ${invalid ? s.invalid : ''}`}>
        {value}
      </span>
    </label>
  );
}

function StaticSelect({
  label,
  value,
  focus,
}: {
  label: string;
  value: string;
  focus?: ManualFocusPoint;
}) {
  return (
    <label className={`${s.manualFieldLabel} ${focus ? s.manualFocus : ''}`} {...(focus ? focusAttrs(focus.number, focus.title) : {})}>
      <span>{label}</span>
      <span className={`${s.manualStaticInput} ${s.manualStaticSelect}`}>{value}</span>
    </label>
  );
}

function StaticBreadcrumbs({ items, focus }: { items: string[]; focus?: ManualFocusPoint }) {
  return (
    <nav className={`${s.breadcrumbs} ${focus ? s.manualFocus : ''}`} aria-label="現在位置の例" {...(focus ? focusAttrs(focus.number, focus.title) : {})}>
      <ol>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StaticDelete({ label, focus }: { label: string; focus?: ManualFocusPoint }) {
  return (
    <span
      className={`${s.rowDeleteButton} ${s.manualStaticControl} ${s.manualDeleteX} ${focus ? s.manualFocus : ''}`}
      aria-label={label}
      {...(focus ? focusAttrs(focus.number, focus.title) : {})}
    >
      ×
    </span>
  );
}

function AxisCard({
  code,
  label,
  left,
  right,
  value,
  color,
  dark,
  pos,
  focus,
}: {
  code: string;
  label: string;
  left: string;
  right: string;
  value: string;
  color: string;
  dark: string;
  pos: string;
  focus?: ManualFocusPoint;
}) {
  return (
    <div className={`${s.manualAxisCard} ${focus ? s.manualFocus : ''}`} {...(focus ? focusAttrs(focus.number, focus.title) : {})}>
      <div className={s.manualAxisCardHead}>
        <strong style={{ color: dark }}>{code} {label}</strong>
        <span className={s.manualAxisBadge}>{right} {value}</span>
      </div>
      <div className={s.manualAxisCardBody}>
        <span>{left}</span>
        <div className={s.manualAxisCardTrack} style={{ '--manual-axis-color': color, '--manual-axis-pos': pos } as CSSProperties}>
          <div className={s.manualAxisCardTicks} aria-hidden="true">
            {MANUAL_SLIDER_TICKS.map(tick => (
              <span
                key={tick}
                className={tick === 0 ? s.manualAxisCardTickCenter : undefined}
                style={{ left: manualSliderTickPosition(tick) }}
              />
            ))}
          </div>
          <div className={s.manualAxisCardTickLabels} aria-hidden="true">
            {MANUAL_SLIDER_TICKS.map(tick => (
              <span key={tick} style={{ left: manualSliderTickPosition(tick) }}>
                {Math.abs(tick)}
              </span>
            ))}
          </div>
          <span className={s.manualAxisCardMarker}>{value}</span>
        </div>
        <span>{right}</span>
      </div>
    </div>
  );
}

function SidebarMiniExample() {
  return (
    <div className={s.manualMiniShell}>
      <aside className={s.manualMiniSidebar} aria-label="設定項目の例">
        <strong>課適性診断 設定管理</strong>
        <nav className={s.manualMiniNav} aria-label="設定項目の例">
          {['課データ', '設問', 'アーキタイプ', '5軸・説明文', '書き出し確認'].map(label => (
            <span key={label} className={`${s.adminButton} ${s.adminButtonTertiary} ${s.adminButtonMd} ${s.sidebarNavButton} ${s.manualStaticControl}`}>{label}</span>
          ))}
          <span
            className={`${s.adminButton} ${s.adminButtonTertiary} ${s.adminButtonMd} ${s.sidebarNavActive} ${s.manualFocus} ${s.manualStaticControl}`}
            {...focusAttrs('1', '使い方を開く')}
          >
            使い方
          </span>
        </nav>
        <div className={s.manualMiniStatus}>
          <span>下書きあり</span>
          <span>検証: 正常</span>
        </div>
      </aside>
      <div className={`${s.manualMiniContent} ${s.manualFocus}`} {...focusAttrs('2', '選択した画面が表示される場所')}>
        <span>選択した項目の一覧または編集画面が表示されます。</span>
      </div>
    </div>
  );
}

function DivisionListExample() {
  return (
    <div className={`${s.manualDivisionExample} ${s.divisionListView}`}>
      <div className={s.sectionHeader}>
        <div className={s.sectionHeaderText}>
          <h2>課データ</h2>
        </div>
        <div className={s.sectionHeaderAction}>
          <StaticButton focus={{ number: '1', title: '新しい課を作る' }}>課を追加</StaticButton>
        </div>
      </div>
      <section className={s.divisionGroup}>
        <div className={`${s.divisionGroupHead} ${s.manualFocus}`} {...focusAttrs('2', '部ごとに探す')}>
          <h3>市長室</h3>
        </div>
        <ul className={s.divisionDirectory}>
          {['秘書課', '広報課', '危機管理課'].map((name, index) => (
            <li
              key={name}
              className={`${s.directoryRow} ${s.divisionDirectoryRow} ${index === 1 ? s.manualFocus : ''} ${index === 1 ? s.directoryRowWithAction : ''}`}
              {...(index === 1 ? focusAttrs('3', '編集する課を選ぶ') : {})}
            >
              <span className={`${s.directoryRowButton} ${s.manualStaticControl}`}>
                <span className={s.divisionNameText}>{name}</span>
              </span>
              {index === 1 && (
                <span className={s.directoryRowAction}>
                  <StaticDelete label="広報課を削除" focus={{ number: '4', title: '一覧から削除する' }} />
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DivisionEditExample() {
  return (
    <div className={s.manualEditScreenshot}>
      <StaticBreadcrumbs items={['課データ', '市長室', '広報課']} focus={{ number: '1', title: '一覧へ戻る道筋' }} />
      <h4 className={s.manualEditTitle}>課を編集：市長室 広報課</h4>

      <section className={`${s.manualStaticSection} ${s.manualFocus}`} {...focusAttrs('2', '基本情報を確認する')}>
        <h5>基本情報</h5>
        <div className={s.manualStaticFormGrid}>
          <StaticSelect label="部" value="市長室" />
          <StaticField label="課名" value="広報課" />
        </div>
        <p className={s.manualInlineNote}>部の選択肢の最後に「新しい部を作成」があります。通常は既存の部から選びます。</p>
      </section>

      <section className={s.manualStaticSection}>
        <h5>5軸の適性</h5>
        <AxisCard
          code="A"
          label="人との関わり方"
          left="制度・仕組み"
          right="市民対話"
          value="8"
          color="#ea514d"
          dark="#b9332c"
          pos="82%"
          focus={{ number: '3', title: '適性の傾きを調整' }}
        />
        <AxisCard
          code="B"
          label="仕事の進め方"
          left="政策立案"
          right="現場対応"
          value="2"
          color="#4092dc"
          dark="#1f5f9f"
          pos="40%"
        />
      </section>

      <div className={`${s.manualCutMarker} ${s.manualFocus}`} {...focusAttrs('4', '途中の入力欄を省略')}>
        <span>ここで画面の途中を省略</span>
        <p>C〜E軸と説明文の入力欄がこの間に続きます。</p>
      </div>

      <section className={`${s.manualStaticSection} ${s.manualSaveSlice}`}>
        <h5>保存</h5>
        <p>編集内容を確認し、問題がなければ下書きに保存します。</p>
        <div className={s.editorActionBar}>
          <div className={s.editorPrimaryActions}>
            <StaticButton variant="primary" focus={{ number: '5', title: '最後に保存する' }}>課を保存</StaticButton>
          </div>
          <div className={s.editorSecondaryActions}>
            <StaticButton variant="tertiary" focus={{ number: '6', title: '似た課を作る' }}>この課を複製する</StaticButton>
            <StaticButton variant="danger" focus={{ number: '7', title: 'この課を消す' }}>この課を削除する</StaticButton>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuestionListExample() {
  return (
    <div className={s.questionListView}>
      <div className={s.sectionHeader}>
        <div className={s.sectionHeaderText}>
          <h2>設問</h2>
        </div>
        <div className={s.sectionHeaderAction}>
          <StaticButton focus={{ number: '1', title: '設問を増やす' }}>設問を追加</StaticButton>
        </div>
      </div>
      <ul className={`${s.directoryList} ${s.questionOutline}`}>
        {[
          ['1', '高齢の市民が窓口を訪れ、介護申請の手続きに困っている。'],
          ['2', '台風の翌朝、道路の損傷箇所を現場で確認しながら作業を指揮する。'],
          ['3', '生活費に困っている市民が相談に訪れた。'],
        ].map(([number, text], index) => (
          <li
            key={number}
            className={`${s.directoryRow} ${s.questionOutlineRow} ${index === 0 ? s.manualFocus : ''} ${index === 2 ? s.directoryRowWithAction : ''}`}
            {...(index === 0 ? focusAttrs('2', '編集する設問を選ぶ') : {})}
          >
            <span className={`${s.directoryRowButton} ${s.manualStaticControl}`}>
              <span className={s.questionNumber}>{number}</span>
              <span className={s.questionText}>
                <span className={s.questionScenario} style={{ color: index === 1 ? '#1f5f9f' : '#b9332c' }}>{text}</span>
              </span>
            </span>
            {index === 2 && (
              <span className={s.directoryRowAction}>
                <StaticDelete label="設問3を削除" focus={{ number: '3', title: '一覧から削除する' }} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuestionEditExample() {
  return (
    <div className={s.questionEditor}>
      <StaticBreadcrumbs items={['設問', '設問1']} focus={{ number: '1', title: '設問一覧へ戻る' }} />
      <h4 className={s.manualEditTitle}>設問1を編集</h4>
      <section className={`${s.formSection} ${s.questionSettingsSection}`}>
        <div className={s.questionSettingsLine}>
          <StaticSelect label="軸" value="A: 人との関わり方" focus={{ number: '2', title: '反映先の軸を選ぶ' }} />
          <StaticSelect label="回答5が示す特性" value="市民対話" focus={{ number: '3', title: '強く同意したときの向きを選ぶ' }} />
        </div>
      </section>
      <section className={`${s.formSection} ${s.questionLiveSection}`} style={{ '--question-axis-dark': '#b9332c', '--question-axis-tint': '#fff1f1' } as CSSProperties}>
        <div className={s.quizEditSurface}>
          <div className={s.quizEditMeta}>
            <span className={s.quizEditQuestionNumber}>Q.1<span aria-hidden="true">/</span>20</span>
            <span className={s.quizEditAxisTag}>人との関わり方</span>
          </div>
          <div className={`${s.quizScenarioField} ${s.manualFocus}`} {...focusAttrs('4', '設問文を書く')}>
            <span>設問文</span>
            <span className={s.manualStaticQuestionText}>高齢の市民が窓口を訪れ、介護申請の手続きに困っている。</span>
            <small>32字</small>
          </div>
          <p className={s.quizOptionsPrompt}>この場面、あなたにはどのくらい合っていますか？</p>
          <ol className={`${s.quizOptionEditList} ${s.manualFocus}`} {...focusAttrs('5', '選択肢を書く')}>
            {['自分には向いていないと思う', 'あまり向いていないと思う', 'どちらともいえない', '少し向いていると思う', 'とても向いていると思う'].map((option, index) => (
              <li key={option}>
                <div className={s.quizOptionEditRow}>
                  <span className={s.quizOptionEditNumber}>{index + 1}</span>
                  <div className={s.quizOptionEditBody}>
                    <span>{['強い 制度・仕組み', 'やや 制度・仕組み', '中間', 'やや 市民対話', '強い 市民対話'][index]}</span>
                    <span className={s.manualStaticInput}>{option}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <div className={s.editorActionBar}>
        <div className={s.editorPrimaryActions}>
          <StaticButton variant="primary" focus={{ number: '6', title: '設問を保存する' }}>設問を保存</StaticButton>
        </div>
        <div className={s.editorSecondaryActions}>
          <StaticButton variant="danger" focus={{ number: '7', title: 'この設問を消す' }}>この設問を削除する</StaticButton>
        </div>
      </div>
    </div>
  );
}

function ArchetypeListExample() {
  return (
    <div className={s.archetypeListView}>
      <div className={s.sectionHeader}>
        <div className={s.sectionHeaderText}>
          <h2>アーキタイプ</h2>
        </div>
      </div>
      <ul className={`${s.directoryList} ${s.archetypeDirectory}`}>
        {[
          ['秩序の番人', '正確さと安定運用を大切にするタイプです。'],
          ['制度を編む人', '仕組みづくりで市民を支えるタイプです。'],
          ['現場の伴走者', '困っている人に寄り添いながら動くタイプです。'],
        ].map(([name, desc], index) => (
          <li
            key={name}
            className={`${s.directoryRow} ${s.archetypeDirectoryRow} ${index === 0 ? s.manualFocus : ''} ${index === 1 ? s.directoryRowWithAction : ''}`}
            {...(index === 0 ? focusAttrs('1', '編集するアーキタイプを選ぶ') : {})}
          >
            <span className={`${s.directoryRowButton} ${s.manualStaticControl}`}>
              <span className={s.archetypeNameText}>{name}</span>
              <span className={s.archetypeDescText}>{desc}</span>
            </span>
            {index === 1 && (
              <span className={s.directoryRowAction}>
                <StaticDelete label="制度を編む人を削除" focus={{ number: '2', title: '一覧から削除する' }} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArchetypeEditExample() {
  return (
    <div className={s.archetypeEditor}>
      <StaticBreadcrumbs items={['アーキタイプ', '秩序の番人']} focus={{ number: '1', title: '一覧へ戻る道筋' }} />
      <h4 className={s.manualEditTitle}>秩序の番人を編集</h4>
      <section className={`${s.manualArchetypePreview} ${s.manualFocus}`} {...focusAttrs('2', '結果画面の見え方を確認する')}>
        <div className={s.manualArchetypeAvatar}>型</div>
        <div>
          <p>結果画面での表示</p>
          <h5>秩序の番人</h5>
          <p>決められた手順を正確に守り、安定した行政運営を支えるタイプです。</p>
        </div>
      </section>
      <section className={s.archetypeForm}>
        <div className={s.archetypeNameLineFields}>
          <StaticField label="名称 1行目" value="秩序の番人" focus={{ number: '3', title: '結果名を編集する' }} />
          <StaticField label="名称 2行目（任意）" value="" />
        </div>
        <StaticField
          label="説明文"
          value="決められた手順を正確に守り、安定した行政運営を支えるタイプです。"
          multiline
          focus={{ number: '4', title: '結果説明を書く' }}
        />
      </section>
      <StaticButton variant="primary" focus={{ number: '5', title: 'アーキタイプを保存する' }}>アーキタイプを保存</StaticButton>
    </div>
  );
}

function AxisListExample() {
  return (
    <div className={s.axisListView}>
      <div className={s.sectionHeader}>
        <div className={s.sectionHeaderText}>
          <h2>5軸・説明文</h2>
        </div>
      </div>
      <ul className={`${s.directoryList} ${s.axisDirectory}`}>
        {[
          ['人との関わり方', '制度・仕組み', '市民対話', '#b9332c'],
          ['仕事の進め方', '政策立案', '現場対応', '#1f5f9f'],
          ['担う役割', '支援・調整', '推進・決定', '#1e7a45'],
        ].map(([name, left, right, color], index) => (
          <li
            key={name}
            className={`${s.directoryRow} ${s.axisDirectoryRow} ${index === 0 ? s.manualFocus : ''}`}
            {...(index === 0 ? focusAttrs('1', '編集する軸を選ぶ') : {})}
          >
            <span className={`${s.directoryRowButton} ${s.manualStaticControl}`}>
              <span className={s.axisNameText} style={{ color }}>{name}</span>
              <span className={s.axisVsText}>{left} <span>vs.</span> {right}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AxisEditExample() {
  return (
    <div className={s.axisEditor}>
      <StaticBreadcrumbs items={['5軸・説明文', '人との関わり方']} focus={{ number: '1', title: '軸一覧へ戻る' }} />
      <h4 className={s.manualEditTitle}>人との関わり方を編集</h4>
      <section className={`${s.axisFormSection} ${s.manualFocus}`} {...focusAttrs('2', '軸名と左右の特性を編集する')}>
        <div className={s.axisSectionHead}>
          <h3>軸の意味</h3>
          <p>診断で比較する2つの方向を設定します。</p>
        </div>
        <div className={s.axisMeaningGrid}>
          <StaticField label="軸名" value="人との関わり方" />
          <div className={s.axisPoleFields}>
            <StaticField label="左側の特性" value="制度・仕組み" />
            <span className={s.axisVsDivider}>vs.</span>
            <StaticField label="右側の特性" value="市民対話" />
          </div>
        </div>
      </section>
      <section className={`${s.axisFormSection} ${s.manualFocus}`} {...focusAttrs('3', '表示色を選ぶ')}>
        <div className={s.axisSectionHead}>
          <h3>表示色</h3>
          <p>1つ選ぶと、文字色・基本色・背景色をまとめて設定します。</p>
        </div>
        <div className={s.axisColorChoiceGrid}>
          {[
            ['赤', '#c0392b', '#e8534a', '#fff0ee', 'selected', ''],
            ['青', '#2e6db4', '#4a90d9', '#ebf3fc', 'used', '仕事の進め方で使用中'],
            ['緑', '#1e7345', '#4caf7d', '#ecf8f1', 'used', '担う役割で使用中'],
            ['紫', '#7b3f9e', '#9b59b6', '#f5edf8', 'normal', ''],
            ['橙', '#b85c00', '#f28c28', '#fff3e6', 'normal', ''],
            ['青緑', '#0e7490', '#22a6b3', '#e6f7fa', 'normal', ''],
          ].map(([label, dark, color, tint, state, usedLabel]) => (
            <span
              key={label}
              className={`${s.axisColorChoice} ${state === 'selected' ? s.axisColorChoiceSelected : ''} ${state === 'used' ? s.axisColorChoiceDisabled : ''}`}
            >
              <span className={s.axisColorChoiceName}>{label}</span>
              <span className={s.axisColorSwatches}>
                <span style={{ background: dark }} />
                <span style={{ background: color }} />
                <span style={{ background: tint }} />
              </span>
              {usedLabel && <span className={s.axisColorUsedLabel}>{usedLabel}</span>}
            </span>
          ))}
        </div>
      </section>
      <section className={`${s.axisFormSection} ${s.manualFocus}`} {...focusAttrs('4', '診断説明文を書く')}>
        <div className={s.axisSectionHead}>
          <h3>診断説明文</h3>
          <p>結果画面で、利用者の傾向に合わせて表示される文章です。</p>
        </div>
        <div className={s.axisDescriptionGroups}>
          <div className={s.axisDescriptionGroup}>
            <h4>市民対話側</h4>
            <StaticField label="強い 市民対話" value="市民の話を直接聞きながら、必要な支援を考えることに向いています。" multiline />
            <StaticField label="やや 市民対話" value="人と話しながら状況を整理する仕事に取り組みやすい傾向があります。" multiline />
          </div>
        </div>
      </section>
      <div className={s.manualCutMarker} aria-label="省略">
        <span>ここで説明文の一部を省略</span>
        <p>実際の画面では、中立、やや左側、強い左側の説明文が続きます。</p>
      </div>
      <section className={`${s.axisResultPreview} ${s.manualFocus}`} {...focusAttrs('5', '結果画面の見え方を確認する')}>
        <div className={s.axisSectionHead}>
          <h3>結果画面の見え方</h3>
        </div>
        <div className={s.axisResultCard} style={{ background: '#fff0ee' }}>
          <span style={{ color: '#c0392b' }}>強い 市民対話</span>
          <p>市民の話を直接聞きながら、必要な支援を考えることに向いています。</p>
          <strong style={{ color: '#c0392b' }}>市民対話</strong>
        </div>
      </section>
      <StaticButton variant="primary" focus={{ number: '6', title: '軸設定を保存する' }}>軸設定を保存</StaticButton>
    </div>
  );
}

function ExportExample() {
  return (
    <div className={s.manualExportExample}>
      <div className={s.sectionHeader}>
        <div className={s.sectionHeaderText}>
          <h2>書き出し確認</h2>
        </div>
        <div className={s.sectionHeaderAction}>
          <StaticButton variant="primary" focus={{ number: '3', title: '配布用ファイルを書き出す' }}>app-config.jsonを書き出す</StaticButton>
        </div>
      </div>
      <div className={`${s.manualExportStatus} ${s.manualFocus}`} {...focusAttrs('1', '入力内容を確認する')}>
        <strong>検証: 正常</strong>
        <span>保存済みの下書きは書き出しできます。</span>
      </div>
      <pre className={`${s.manualJsonPreview} ${s.manualFocus}`} {...focusAttrs('2', '配布用ファイルの確認欄を見る')}>
{`{
  "divisions": [
    { "dept": "市長室", "name": "広報課" }
  ],
  "questions": [...]
}`}
      </pre>
      <p className={s.manualFileName}>通常、この確認欄を手で直す必要はありません。問題がないかの確認に使います。</p>
      <p className={s.manualFileName}>ファイル名は <strong>app-config.json</strong> のまま配布します。</p>
    </div>
  );
}

function ErrorExample() {
  return (
    <div className={s.manualErrorExample}>
      <div className={`${s.errorBanner} ${s.manualFocus}`} {...focusAttrs('1', '問題の概要を見る')}>
        <strong>入力内容を確認してください。</strong>
        <ul>
          <li>課名を入力してください。</li>
          <li>同じ部と課名の組み合わせがすでにあります。</li>
        </ul>
      </div>
      <div className={s.manualStaticFormGrid}>
        <StaticSelect label="部" value="市長室" />
        <StaticField label="課名" value="" invalid focus={{ number: '2', title: '赤い項目を直す' }} />
      </div>
      <div className={`${s.errorBanner} ${s.manualFocus}`} {...focusAttrs('3', '書き出しできない理由を見る')}>
        <strong>書き出し前に修正が必要です。</strong>
        <p>必須項目や重複を直すと、書き出しできるようになります。</p>
      </div>
      <StaticButton variant="primary" disabled focus={{ number: '4', title: '問題が残る間は使えない' }}>app-config.jsonを書き出す</StaticButton>
    </div>
  );
}

export function AdminManual() {
  return (
    <article className={s.manualPage}>
      <header className={s.manualHeader}>
        <p>設定管理をはじめる前に</p>
        <h2>設定管理の使い方</h2>
        <p>
          この画面では、診断で使用する課データ、設問、アーキタイプ、5軸の説明文を編集できます。
          編集内容はブラウザ内の下書きとして保存されます。配布するときは「書き出し確認」から
          app-config.json を書き出してください。
        </p>
      </header>

      <nav className={s.manualToc} aria-label="目次">
        <h3>目次</h3>
        <ol className={s.manualTocList}>
          {tocSections.map((section, index) => (
            <li key={section.id}>
              <a href="#/admin" onClick={event => scrollToManualTarget(event, section.id)}>{index + 1}. {section.title}</a>
              <ol className={s.manualTocChildren}>
                {section.children.map((child, childIndex) => {
                  const targetId = childId(section.id, childIndex);
                  return (
                    <li key={child}>
                      <a href="#/admin" onClick={event => scrollToManualTarget(event, targetId)}>{child}</a>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </nav>

      <section id="manual-start" className={s.manualSection}>
        <h3>1. はじめに</h3>
        <ManualSubtopicList sectionId="manual-start" />
        <div className={s.manualLeadGrid}>
          <div>
            <h4>この管理画面でできること</h4>
            <p>診断で使う文章や適性値を編集します。診断を受ける画面ではなく、診断に表示される内容を準備するための画面です。</p>
          </div>
          <div>
            <h4>下書きと配布用ファイルの違い</h4>
            <p>各編集画面で保存した内容は、まずブラウザ内の下書きに保存されます。利用者に配布するには、最後に配布用ファイルを書き出します。</p>
          </div>
        </div>
        <div className={s.manualFlow} aria-label="編集から配布までの流れ">
          {['編集する', '保存する', '確認する', '書き出す', '配布する'].map((label, index) => (
            <span key={label} className={index === 1 || index === 3 ? s.manualFocus : undefined} {...(index === 1 ? focusAttrs('1', '下書きに保存') : index === 3 ? focusAttrs('2', '配布用ファイルを書き出す') : {})}>
              {label}
            </span>
          ))}
        </div>
        <ManualExample
          title="左側メニュー"
          note="編集したい項目を選ぶ場所です。使い方は最後の項目として置きます。"
          points={[
            { number: '1', title: '使い方を開く', body: '操作に迷ったときに読む説明ページです。設定データを編集する場所ではありません。' },
            { number: '2', title: '作業画面を確認する', body: '選んだ項目の一覧や編集画面が右側に表示されます。' },
          ]}
        >
          <SidebarMiniExample />
        </ManualExample>
      </section>

      <section id="manual-concepts" className={s.manualSection}>
        <h3>2. 診断データの基本</h3>
        <ManualSubtopicList sectionId="manual-concepts" />
        <dl className={s.manualDefinitionList}>
          <div>
            <dt>課データ</dt>
            <dd>診断結果でおすすめ候補として表示される課の情報です。部、課名、説明文、5軸の適性値を持ちます。</dd>
          </div>
          <div>
            <dt>部と課名</dt>
            <dd>課を探すための組み合わせです。同じ部の中に同じ課名を重複して登録しないようにします。</dd>
          </div>
          <div>
            <dt>5軸</dt>
            <dd>診断で使う5つのものさしです。どちらが良い・悪いではなく、仕事の向きやすさの違いを表します。</dd>
          </div>
          <div>
            <dt>スコア</dt>
            <dd>各軸で、どちらの特性にどの程度近いかを表す値です。中央は中立、端に近いほど傾向が強くなります。</dd>
          </div>
          <div>
            <dt>設問</dt>
            <dd>利用者が回答する質問です。回答結果は、どれか1つの軸のスコアに反映されます。</dd>
          </div>
          <div>
            <dt>回答5が示す特性</dt>
            <dd>5番目の選択肢を選んだとき、左右どちらの特性に点数を寄せるかを指定します。</dd>
          </div>
          <div>
            <dt>アーキタイプ</dt>
            <dd>5軸の傾向を組み合わせて表示する結果タイプです。管理画面では内部コードではなく、名称と説明文を編集します。</dd>
          </div>
          <div>
            <dt>説明文</dt>
            <dd>課、アーキタイプ、5軸の結果画面に表示される文章です。利用者が結果を理解するための本文になります。</dd>
          </div>
        </dl>

        <ManualExample
          title="5軸とスコア"
          note="スコアは、左右どちらの特性にどの程度近いかを示します。"
          points={[
            { number: '1', title: '軸名を見る', body: '何についての傾向を設定しているかを示します。' },
            { number: '2', title: '左右の特性を見る', body: '左と右は優劣ではなく、仕事の向きの違いです。' },
            { number: '3', title: '点の位置を見る', body: '数字が大きいほど、その側の特性が強くなります。' },
          ]}
        >
          <div className={s.manualConceptGrid}>
            <strong className={s.manualFocus} style={{ color: '#b9332c' }} {...focusAttrs('1', '軸名を見る')}>A 人との関わり方</strong>
            <div className={s.manualAxisCardBody}>
              <span className={s.manualFocus} {...focusAttrs('2', '左右の特性を見る')}>制度・仕組み</span>
              <div className={`${s.manualAxisCardTrack} ${s.manualFocus}`} style={{ '--manual-axis-color': '#ea514d', '--manual-axis-pos': '82%' } as CSSProperties} {...focusAttrs('3', '点の位置を見る')}>
                <div className={s.manualAxisCardTicks} aria-hidden="true">
                  {MANUAL_SLIDER_TICKS.map(tick => (
                    <span
                      key={tick}
                      className={tick === 0 ? s.manualAxisCardTickCenter : undefined}
                      style={{ left: manualSliderTickPosition(tick) }}
                    />
                  ))}
                </div>
                <div className={s.manualAxisCardTickLabels} aria-hidden="true">
                  {MANUAL_SLIDER_TICKS.map(tick => (
                    <span key={tick} style={{ left: manualSliderTickPosition(tick) }}>
                      {Math.abs(tick)}
                    </span>
                  ))}
                </div>
                <span className={s.manualAxisCardMarker}>8</span>
              </div>
              <span>市民対話</span>
            </div>
          </div>
        </ManualExample>
      </section>

      <section id="manual-overview" className={s.manualSection}>
        <h3>3. 画面全体の見方</h3>
        <ManualSubtopicList sectionId="manual-overview" />
        <p className={s.manualSectionLead}>左側で編集項目を選び、右側で一覧や編集画面を操作します。番号付きの赤枠は、この使い方ページだけの説明用表示です。</p>
        <ManualExample
          title="管理画面の基本構造"
          note="左側メニュー、作業画面、下書き状態の位置を確認します。"
          points={[
            { number: '1', title: '編集項目を選ぶ', body: '課データ、設問、アーキタイプなど、編集したい種類を選びます。' },
            { number: '2', title: '作業画面を見る', body: '一覧画面または編集画面がここに表示されます。' },
            { number: '3', title: '下書きと検証を見る', body: '保存した下書きの有無と、書き出しできる状態かを確認します。' },
          ]}
        >
          <div className={s.manualMiniShell}>
            <aside className={s.manualMiniSidebar}>
              <strong>課適性診断 設定管理</strong>
              <nav className={`${s.manualMiniNav} ${s.manualFocus}`} {...focusAttrs('1', '編集項目を選ぶ')}>
                <span className={`${s.adminButton} ${s.adminButtonTertiary} ${s.adminButtonMd} ${s.sidebarNavActive} ${s.manualStaticControl}`}>課データ</span>
                <span className={`${s.adminButton} ${s.adminButtonTertiary} ${s.adminButtonMd} ${s.sidebarNavButton} ${s.manualStaticControl}`}>設問</span>
                <span className={`${s.adminButton} ${s.adminButtonTertiary} ${s.adminButtonMd} ${s.sidebarNavButton} ${s.manualStaticControl}`}>アーキタイプ</span>
                <span className={`${s.adminButton} ${s.adminButtonTertiary} ${s.adminButtonMd} ${s.sidebarNavButton} ${s.manualStaticControl}`}>5軸・説明文</span>
                <span className={`${s.adminButton} ${s.adminButtonTertiary} ${s.adminButtonMd} ${s.sidebarNavButton} ${s.manualStaticControl}`}>書き出し確認</span>
                <span className={`${s.adminButton} ${s.adminButtonTertiary} ${s.adminButtonMd} ${s.sidebarNavButton} ${s.manualStaticControl}`}>使い方</span>
              </nav>
              <div className={`${s.manualMiniStatus} ${s.manualFocus}`} {...focusAttrs('3', '下書きと検証を見る')}>
                <span>下書きあり</span>
                <span>検証: 正常</span>
              </div>
            </aside>
            <div className={`${s.manualMiniContent} ${s.manualFocus}`} {...focusAttrs('2', '作業画面を見る')}>
              <span>一覧画面、編集画面、書き出し確認が表示されます。</span>
            </div>
          </div>
        </ManualExample>
      </section>

      <section id="manual-divisions" className={s.manualSection}>
        <h3>4. 課データを編集する</h3>
        <ManualSubtopicList sectionId="manual-divisions" />
        <ol className={s.manualSteps}>
          <li>左側メニューで「課データ」を開きます。</li>
          <li>既存の課を編集するときは、課名の行をクリックします。</li>
          <li>新しい課を作るときは「課を追加」をクリックします。</li>
          <li>編集画面で部、課名、5軸の適性、説明文を確認し、「課を保存」をクリックします。</li>
        </ol>
        <ManualExample
          title="課データ一覧"
          note="部ごとの並びから課を探します。削除は行の右側に表示される×を使います。"
          points={[
            { number: '1', title: '新しい課を作る', body: '一覧にない課を登録するときの入口です。既存の課を直す場合は使いません。' },
            { number: '2', title: '部ごとに探す', body: '組織図の感覚で、部の見出しから目的の課を探します。' },
            { number: '3', title: '編集する課を選ぶ', body: '課名の行をクリックすると、その課の編集画面を開きます。' },
            { number: '4', title: '一覧から削除する', body: '不要な課は行の右側の×で削除します。誤操作を避けるため、通常は目立ちすぎない表示です。' },
          ]}
        >
          <DivisionListExample />
        </ManualExample>

        <ManualExample
          title="課データ編集"
          note="実際の編集画面の上から順に、連続した範囲を示しています。省略した部分は明示します。"
          points={[
            { number: '1', title: '一覧へ戻る道筋', body: '編集画面から課データ一覧へ戻るための位置です。保存前に戻る場合は確認が出ます。' },
            { number: '2', title: '基本情報を確認する', body: '部は一覧から選びます。新しい部へ移す場合だけ、部の選択肢の最後にある「新しい部を作成」を使います。' },
            { number: '3', title: '適性の傾きを調整', body: 'バー上の点で、この課がどちらの特性にどの程度近いかを設定します。' },
            { number: '4', title: '途中の入力欄を省略', body: '実際の画面では、C〜E軸と説明文がこの位置に続きます。' },
            { number: '5', title: '最後に保存する', body: '入力が終わったら、変更を下書きに保存します。' },
            { number: '6', title: '似た課を作る', body: '似た設定の課を追加したいときだけ使います。' },
            { number: '7', title: 'この課を消す', body: '結果候補から外したい課を削除します。削除前に内容を確認してください。' },
          ]}
        >
          <DivisionEditExample />
        </ManualExample>
      </section>

      <section id="manual-questions" className={s.manualSection}>
        <h3>5. 設問を編集する</h3>
        <ManualSubtopicList sectionId="manual-questions" />
        <ol className={s.manualSteps}>
          <li>「設問」を開き、設問文の一覧から編集する設問を選びます。</li>
          <li>新しい設問は「設問を追加」から作ります。</li>
          <li>設問文、5つの選択肢、軸、回答5が示す特性を確認します。</li>
          <li>編集後は「設問を保存」をクリックします。</li>
        </ol>
        <ManualExample
          title="設問一覧"
          note="設問文を読んで探します。設問番号は一覧上の順番です。"
          points={[
            { number: '1', title: '設問を増やす', body: '新しい質問を追加するときに使います。' },
            { number: '2', title: '編集する設問を選ぶ', body: '行全体が編集画面への入口です。文字だけをリンクのように探す必要はありません。' },
            { number: '3', title: '一覧から削除する', body: '不要な設問は行の右側の×で削除します。' },
          ]}
        >
          <QuestionListExample />
        </ManualExample>
        <ManualExample
          title="設問編集"
          note="利用者が見る質問画面に近い形で、設問文と選択肢を編集します。"
          points={[
            { number: '1', title: '設問一覧へ戻る', body: 'ほかの設問へ移るときに使います。保存前に戻る場合は確認が出ます。' },
            { number: '2', title: '反映先の軸を選ぶ', body: 'この設問の回答が、どの軸の点数に影響するかを選びます。' },
            { number: '3', title: '5番目の選択肢の向きを選ぶ', body: '5番目の選択肢を選んだとき、左右どちらの特性に近づく回答なのかを指定します。' },
            { number: '4', title: '設問文を書く', body: '利用者が状況を想像しやすい、具体的な場面を書きます。' },
            { number: '5', title: '5つの選択肢を確認・修正する', body: '1から5までの回答文を編集します。意味の強さが自然に並ぶようにします。' },
            { number: '6', title: '設問を保存する', body: '設問文、選択肢、判定設定を下書きに保存します。' },
            { number: '7', title: 'この設問を削除する', body: '使わない設問を削除します。通常の保存とは別の、取り消しに注意が必要な操作です。' },
          ]}
        >
          <QuestionEditExample />
        </ManualExample>
      </section>

      <section id="manual-archetypes" className={s.manualSection}>
        <h3>6. アーキタイプを編集する</h3>
        <ManualSubtopicList sectionId="manual-archetypes" />
        <ol className={s.manualSteps}>
          <li>「アーキタイプ」を開き、結果名から編集するタイプを選びます。</li>
          <li>一覧には内部コードは表示されません。名称と説明文で探します。</li>
          <li>結果画面のプレビューを見ながら、名称と説明文を整えます。</li>
          <li>編集後は「アーキタイプを保存」をクリックします。</li>
        </ol>
        <ManualExample
          title="アーキタイプ一覧"
          note="結果タイプの名前と説明文の短い表示から探します。"
          points={[
            { number: '1', title: '編集するアーキタイプを選ぶ', body: '内部コードではなく、結果名と説明文を見て選びます。行をクリックして編集画面を開きます。' },
            { number: '2', title: '一覧から削除する', body: '使わないタイプを削除するときは、行の右側の×を使います。' },
          ]}
        >
          <ArchetypeListExample />
        </ManualExample>
        <ManualExample
          title="アーキタイプ編集"
          note="結果画面での見え方を確認しながら、名称と説明文を編集します。"
          points={[
            { number: '1', title: '一覧へ戻る道筋', body: 'アーキタイプ一覧へ戻る位置です。' },
            { number: '2', title: '結果画面の見え方を確認する', body: '利用者に表示される結果に近い見え方で確認します。' },
            { number: '3', title: '結果名を編集する', body: '長すぎる場合は2行目を使って読みやすくします。' },
            { number: '4', title: '結果説明を書く', body: 'このタイプの特徴がわかる短い説明を書きます。' },
            { number: '5', title: 'アーキタイプを保存する', body: '名称と説明文を下書きに保存します。' },
          ]}
        >
          <ArchetypeEditExample />
        </ManualExample>
      </section>

      <section id="manual-axes" className={s.manualSection}>
        <h3>7. 5軸・説明文を編集する</h3>
        <ManualSubtopicList sectionId="manual-axes" />
        <ol className={s.manualSteps}>
          <li>「5軸・説明文」を開き、編集する軸を選びます。</li>
          <li>軸の意味、表示色、診断説明文の順に編集します。</li>
          <li>表示色は候補から1つ選ぶだけで、文字色・基本色・背景色がまとまって決まります。</li>
          <li>編集後は「軸設定を保存」をクリックします。</li>
        </ol>
        <ManualExample
          title="軸一覧"
          note="軸名と左右の特性を見て、編集する軸を選びます。"
          points={[
            { number: '1', title: '編集する軸を選ぶ', body: '軸の行をクリックして編集画面を開きます。' },
          ]}
        >
          <AxisListExample />
        </ManualExample>
        <ManualExample
          title="軸編集"
          note="診断結果に出る言葉と色をまとめて調整します。"
          points={[
            { number: '1', title: '軸一覧へ戻る', body: 'ほかの軸を編集するときに使います。' },
            { number: '2', title: '軸名と左右の特性を編集する', body: '軸の見出しと、左右に置く特性名を編集します。' },
            { number: '3', title: '表示色を選ぶ', body: '候補から1つ選ぶと、読みやすい文字色・基本色・背景色がまとめて設定されます。' },
            { number: '4', title: '診断説明文を書く', body: '強い傾向、やや傾向、中立など、結果画面に表示する説明を書きます。' },
            { number: '5', title: '結果画面の見え方を確認する', body: '代表的な結果表示として、強い右側の説明文がどう見えるか確認します。' },
            { number: '6', title: '軸設定を保存する', body: '軸名、色、説明文を下書きに保存します。' },
          ]}
        >
          <AxisEditExample />
        </ManualExample>
      </section>

      <section id="manual-export" className={s.manualSection}>
        <h3>8. 保存と書き出し</h3>
        <ManualSubtopicList sectionId="manual-export" />
        <ol className={s.manualSteps}>
          <li>各編集画面で保存すると、内容はブラウザ内の下書きになります。</li>
          <li>配布するときは「書き出し確認」を開きます。</li>
          <li>入力内容に問題がないことを確認し、「app-config.jsonを書き出す」をクリックします。</li>
          <li>配布時のファイル名は app-config.json のままにします。</li>
        </ol>
        <div className={s.manualChecklist}>
          <h4>書き出し前の確認</h4>
          <ul>
            <li>課名の重複がない</li>
            <li>設問、選択肢、説明文に空欄がない</li>
            <li>結果画面の名称と説明文が読める</li>
            <li>書き出すファイル名は app-config.json のままにする</li>
          </ul>
        </div>
        <ManualExample
          title="書き出し確認"
          note="下書きを配布用ファイルにする最後の画面です。"
          points={[
            { number: '1', title: '入力内容を確認する', body: '書き出しできる状態かを確認します。問題がある場合は先に修正します。' },
            { number: '2', title: '配布用ファイルの確認欄を見る', body: '通常、この欄を手で直す必要はありません。問題がないかの確認に使います。' },
            { number: '3', title: '配布用ファイルを書き出す', body: 'クリックすると app-config.json が保存されます。配布時はファイル名を変えません。' },
          ]}
        >
          <ExportExample />
        </ManualExample>
      </section>

      <section id="manual-errors" className={s.manualSection}>
        <h3>9. 入力内容に問題がある場合</h3>
        <ManualSubtopicList sectionId="manual-errors" />
        <p className={s.manualSectionLead}>問題がある場合だけ、画面上部の案内や赤い入力欄が表示されます。表示された項目を直すと保存・書き出しできます。</p>
        <ManualExample
          title="入力内容の確認"
          note="必須項目、重複、書き出しできない状態を見つけるための表示です。"
          points={[
            { number: '1', title: '問題の概要を見る', body: '保存できない理由がまとめて表示されます。' },
            { number: '2', title: '赤い項目を直す', body: '赤く表示された入力欄が修正対象です。必須項目は空欄にしないでください。' },
            { number: '3', title: '書き出しできない理由を見る', body: '問題が残っている間は、配布用ファイルを書き出せません。' },
            { number: '4', title: '問題が残る間は使えない', body: '書き出しボタンが使えないときは、先に表示された問題を修正します。' },
          ]}
        >
          <ErrorExample />
        </ManualExample>
      </section>

      <section id="manual-print" className={s.manualSection}>
        <h3>10. この使い方を印刷する</h3>
        <ManualSubtopicList sectionId="manual-print" />
        <div className={s.manualPrintBox}>
          <h4>ブラウザからPDFにする</h4>
          <p>Microsoft Edge の印刷機能で、送信先を「PDFとして保存」にすると、この使い方をPDFとして保存できます。</p>
          <ol>
            <li>Edge のメニューから「印刷」を開きます。</li>
            <li>送信先で「PDFとして保存」を選びます。</li>
            <li>プレビューで赤い番号と説明が読めることを確認します。</li>
            <li>保存します。</li>
          </ol>
        </div>
      </section>
    </article>
  );
}
