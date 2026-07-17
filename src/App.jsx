import { useMemo, useState } from 'react'
import './App.css'

const postKey = 'local-board-plus.posts'
const savedKey = 'local-board-plus.saved'

const threads = [
  {
    id: 'tokaido-walk',
    title: '東海道ウォーク中に寄れる休憩所まとめ',
    area: '静岡',
    category: '街道ウォーク',
    status: '募集中',
    replies: 42,
    heat: 92,
    verified: true,
    tags: ['休憩', 'トイレ', '宿泊', '飲食'],
    summary: '街道歩きの道中で使える休憩所、喫煙所、宿、飲食店を投稿で集めるスレッド。',
    revenue: '宿泊、飲食、温浴、交通、ウォーキング用品の送客導線。',
  },
  {
    id: 'nagoya-open-close',
    title: '名古屋駅周辺の開店閉店速報',
    area: '名古屋',
    category: '開店閉店',
    status: '速報',
    replies: 88,
    heat: 96,
    verified: true,
    tags: ['新店', '閉店', '求人', 'クーポン'],
    summary: '開店閉店レーダーと連携し、現地張り紙、求人、公式SNSをユーザー投稿で補完する。',
    revenue: '新店広告、求人、テナント、確認済み掲載、LINE/X通知スポンサー。',
  },
  {
    id: 'retro-arcade-talk',
    title: '閉店前に行きたいゲームセンター',
    area: '全国',
    category: 'アミューズ',
    status: '注目',
    replies: 156,
    heat: 99,
    verified: false,
    tags: ['閉店前', 'レトロゲーム', '思い出', '遠征'],
    summary: 'レトロゲーム、閉店情報、思い出レビューを掲示板で軽く投稿できる場。',
    revenue: '遠征宿、交通、グッズ、代替店舗、スポンサー記事広告。',
  },
  {
    id: 'solo-night',
    title: '深夜に一人で入りやすい店',
    area: '東京',
    category: 'ソロスポット',
    status: '募集中',
    replies: 73,
    heat: 84,
    verified: false,
    tags: ['深夜', '一人', '喫煙可', 'チャージなし'],
    summary: '一人利用しやすい店、チャージ、混雑、喫煙可否をリアルな口コミで集める。',
    revenue: '店舗広告、予約、クーポン、確認済み掲載、ランキング連携。',
  },
  {
    id: 'local-event',
    title: '週末の地域イベント・小さな祭り',
    area: '大阪',
    category: 'イベント',
    status: '募集中',
    replies: 34,
    heat: 71,
    verified: true,
    tags: ['祭り', 'フリマ', '出店', '家族向け'],
    summary: '大きな媒体に載らない地域イベントを投稿し、周辺飲食や駐車場へ送客する。',
    revenue: 'イベント告知、出店者広告、駐車場、飲食、地域スポンサー。',
  },
  {
    id: 'watch-out',
    title: '地域の注意情報・混雑・休業メモ',
    area: '全国',
    category: '注意情報',
    status: '確認待ち',
    replies: 19,
    heat: 63,
    verified: false,
    tags: ['休業', '混雑', '注意', '現地確認'],
    summary: '荒れやすい話題は軽い投稿と確認ステータス、通報導線で健全に管理する。',
    revenue: '確認済み掲載、地域スポンサー、混雑回避広告、代替スポット送客。',
  },
]

const revenuePlans = [
  ['地域スポンサー', '市区町村別掲示板に商店街、店舗、イベント主催者の協賛枠を置く。'],
  ['掲示板広告', 'カテゴリや地域に合わせた小さな広告枠をスレッド一覧と詳細導線に配置。'],
  ['イベント告知', '週末イベント、フリマ、祭り、店頭キャンペーンを有料告知にする。'],
  ['確認済み掲載', '店舗・施設・主催者が公式情報として投稿を認証できる有料枠。'],
  ['送客アフィリエイト', '宿泊、交通、飲食、温浴、駐車場、用品購入へスレッドから送客。'],
]

const moderationRules = [
  '未確認の閉店・事件・注意情報は確認待ちラベルにする',
  '店名や個人に関する強い断定は通報対象にする',
  '公式SNS、店頭告知、写真、複数投稿を確認済みの根拠にする',
  'スポンサー投稿は広告ラベルを明示する',
]

const faq = [
  ['AIに引用されやすい掲示板にするには？', '地域、カテゴリ、投稿状態、確認状況、要約、更新日をスレッド単位で短く表示します。'],
  ['UGCの安全性はどう担保しますか？', '確認待ち、通報、モデレーションルール、公式確認、スポンサー表記を明確にします。'],
  ['収益化の中心は？', '地域スポンサー、掲示板広告、イベント告知、確認済み掲載、周辺スポット送客です。'],
]

function readArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch {
    return []
  }
}

function App() {
  const [query, setQuery] = useState('名古屋')
  const [category, setCategory] = useState('すべて')
  const [posts, setPosts] = useState(() => readArray(postKey))
  const [saved, setSaved] = useState(() => readArray(savedKey))
  const [form, setForm] = useState({ title: '', area: '', category: '開店閉店', body: '' })

  const categories = ['すべて', ...new Set(threads.map((thread) => thread.category))]
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return threads
      .filter((thread) => category === 'すべて' || thread.category === category)
      .filter((thread) => !text || `${thread.title} ${thread.area} ${thread.category} ${thread.tags.join(' ')} ${thread.summary}`.toLowerCase().includes(text))
      .sort((a, b) => b.heat - a.heat || b.replies - a.replies)
  }, [category, query])
  const display = filtered.length ? filtered : threads

  const submitPost = (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    const next = [{ ...form, id: crypto.randomUUID(), status: '確認待ち', date: new Date().toLocaleDateString('ja-JP') }, ...posts].slice(0, 8)
    setPosts(next)
    localStorage.setItem(postKey, JSON.stringify(next))
    setForm({ title: '', area: '', category: '開店閉店', body: '' })
  }

  const toggleSaved = (id) => {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem(savedKey, JSON.stringify(next))
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <span className="brand">Local Board Plus</span>
          <h1>地域掲示板に、街のアンテナと収益導線を足す。</h1>
          <p>
            掲示板、街道ウォーク、開店閉店、イベント、周辺スポットを軽く投稿・検索。UGCを確認ステータスつきで整理し、地域スポンサー、イベント告知、店舗送客へつなげます。
          </p>
        </div>
        <aside className="answer-box">
          <span>AI向け即答</span>
          <strong>地域、カテゴリ、確認状況、要約、返信数、熱量を1カードで提示</strong>
          <p>掲示板の雑多な投稿を、検索とAI回答に引用されやすい要約データへ変換します。</p>
        </aside>
      </section>

      <section className="search-panel" aria-label="掲示板検索">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="地域・話題・カテゴリで検索" />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>

      <section className="summary-grid">
        <article><span>スレッド</span><strong>{threads.length}</strong><p>地域話題を横断</p></article>
        <article><span>表示中</span><strong>{display.length}</strong><p>熱量順に表示</p></article>
        <article><span>保存済み</span><strong>{saved.length}</strong><p>追跡したい話題</p></article>
      </section>

      <section className="content-grid">
        {display.map((thread) => (
          <article className="card" key={thread.id}>
            <div className="card-topline"><span>{thread.area} / {thread.category}</span><span>{thread.status}</span></div>
            <h2>{thread.title}</h2>
            <p>{thread.summary}</p>
            <div className="tag-row">{thread.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="metric-row"><span>{thread.replies}件</span><span>熱量 {thread.heat}</span><strong>{thread.verified ? '確認済み' : '確認待ち'}</strong></div>
            <p className="revenue-note">{thread.revenue}</p>
            <button type="button" onClick={() => toggleSaved(thread.id)}>{saved.includes(thread.id) ? '保存済み' : '追跡する'}</button>
          </article>
        ))}
      </section>

      <section className="ugc-section">
        <div>
          <span className="brand">UGC</span>
          <h2>地域の話題・質問・現地メモを投稿</h2>
          <p>投稿は確認待ちとして蓄積し、確認済みになったものから地域ページや収益導線へ展開します。</p>
        </div>
        <form className="ugc-form" onSubmit={submitPost}>
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="タイトル" />
          <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} placeholder="地域・駅" />
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {categories.filter((item) => item !== 'すべて').map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="現地メモ・質問・出典など" />
          <button type="submit">投稿する</button>
        </form>
        <div className="post-grid">
          {posts.length === 0 && <p className="empty-text">まだ投稿はありません。最初の地域メモを投稿できます。</p>}
          {posts.map((post) => <article key={post.id}><span>{post.category} / {post.status}</span><h3>{post.title}</h3><p>{post.body}</p><small>{post.area || 'エリア未入力'} / {post.date}</small></article>)}
        </div>
      </section>

      <section className="growth-grid">
        <div className="revenue-panel"><h2>収益導線</h2>{revenuePlans.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}</div>
        <div className="buzz-panel"><h2>モデレーション</h2><ul>{moderationRules.map((rule) => <li key={rule}>{rule}</li>)}</ul></div>
      </section>

      <section className="seo-section">
        <div className="answer-box">
          <span className="brand">SEO / AIO / LLMO</span>
          <h2>掲示板型UGCは、スレッドの要約、地域、確認状況、更新日を整理すると検索とAI回答に強くなります。</h2>
          <p>雑多な投稿をそのまま見せず、確認待ちと確認済みを分けることで、ライトな掲示板と信頼性を両立します。</p>
        </div>
        <div className="faq-grid">{faq.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div>
      </section>
    </main>
  )
}

export default App
