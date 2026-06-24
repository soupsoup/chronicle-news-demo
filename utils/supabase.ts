// ---------------------------------------------------------------------------
// DEMO BUILD — mock Supabase client.
//
// The real app talks to a live Supabase project (Postgres + Auth + Storage +
// Edge Functions). This file replaces that with an in-memory database and a
// fake, already-logged-in session, so every real page/component/hook in
// this app runs unmodified against synthetic data instead of production
// infrastructure. No real credentials, URLs, or content from the live
// Chronicle News project are used anywhere below.
// ---------------------------------------------------------------------------

type Row = Record<string, any>

const now = () => new Date().toISOString()
const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)

// ---------------------------------------------------------------------------
// Seed data — entirely fictional. No real stories, sources, or contacts.
// ---------------------------------------------------------------------------

const storyWaterId = uuid()
const storyTransitId = uuid()
const storyAirlinesId = uuid()
const storyRedistrictId = uuid()

const DB: Record<string, Row[]> = {
  stories: [
    {
      id: storyWaterId,
      title: 'Municipal Water Systems Brace for Cyber Threats',
      summary:
        'Three regional water utilities adopted new intrusion-detection requirements after a near-miss at a treatment plant control system.',
      category: 'Infrastructure',
      image_url: '',
      image_credit: '',
      status: 'published',
      created_at: '2026-05-04T13:10:00Z',
      updated_at: '2026-06-02T16:40:00Z',
    },
    {
      id: storyTransitId,
      title: 'Downtown Transit Overhaul Hits Funding Snag',
      summary:
        'The light-rail extension lost its federal matching grant after a procurement audit flagged the lead contractor.',
      category: 'Transportation',
      image_url: '',
      image_credit: '',
      status: 'draft',
      created_at: '2026-05-21T09:00:00Z',
      updated_at: '2026-06-10T11:05:00Z',
    },
    {
      id: storyAirlinesId,
      title: 'Regional Airlines Consolidate Amid Fuel Cost Spike',
      summary:
        'Two mid-size carriers announced a merger after jet fuel costs rose 18% over the last two quarters.',
      category: 'Business',
      image_url: '',
      image_credit: '',
      status: 'published',
      created_at: '2026-04-12T08:30:00Z',
      updated_at: '2026-05-29T14:20:00Z',
    },
    {
      id: storyRedistrictId,
      title: 'Statehouse Redistricting Fight Heads to Court',
      summary: null,
      category: 'Politics',
      image_url: '',
      image_credit: '',
      status: 'archived',
      created_at: '2026-03-02T10:00:00Z',
      updated_at: '2026-03-28T17:50:00Z',
    },
  ],

  atoms: [
    {
      id: uuid(), story_id: storyWaterId, type: 'text',
      content: 'Three utilities serving a combined 480,000 residents confirmed they are rolling out new SCADA intrusion-detection rules.',
      rich_content: { html: '<p>Three utilities serving a combined <strong>480,000 residents</strong> confirmed they are rolling out new SCADA intrusion-detection rules after a contractor flagged unusual remote-access attempts at a treatment plant in March.</p>', plainText: 'Three utilities serving a combined 480,000 residents confirmed they are rolling out new SCADA intrusion-detection rules after a contractor flagged unusual remote-access attempts at a treatment plant in March.' },
      is_published: true, send_push: true, source_url: '', source_title: '', position: 0,
      created_at: '2026-05-04T13:10:00Z', updated_at: '2026-05-04T13:10:00Z', linked_atom_id: null,
    },
    {
      id: uuid(), story_id: storyWaterId, type: 'quote',
      content: '',
      rich_content: { text: 'We caught this before it touched anything operational, but the margin was thinner than anyone wants to admit.', attribution: 'Utility IT director, speaking on background', sourceUrl: '' },
      is_published: true, send_push: false, source_url: '', source_title: '', position: 1,
      created_at: '2026-05-05T10:00:00Z', updated_at: '2026-05-05T10:00:00Z', linked_atom_id: null,
    },
    {
      id: uuid(), story_id: storyWaterId, type: 'text',
      content: 'State regulators are now drafting a rule that would require annual third-party penetration tests for any utility serving more than 50,000 customers.',
      rich_content: { html: '<p>State regulators are now drafting a rule that would require annual third-party penetration tests for any utility serving more than 50,000 customers.</p>', plainText: 'State regulators are now drafting a rule that would require annual third-party penetration tests for any utility serving more than 50,000 customers.' },
      is_published: false, send_push: true, source_url: '', source_title: '', position: 2,
      created_at: '2026-06-02T16:40:00Z', updated_at: '2026-06-02T16:40:00Z', linked_atom_id: null,
    },

    {
      id: uuid(), story_id: storyTransitId, type: 'text',
      content: 'The federal matching grant for the light-rail extension was pulled after a procurement audit flagged the lead contractor for change-order irregularities.',
      rich_content: { html: '<p>The federal matching grant for the light-rail extension was pulled after a procurement audit flagged the lead contractor for change-order irregularities totaling an estimated $14M.</p>', plainText: 'The federal matching grant for the light-rail extension was pulled after a procurement audit flagged the lead contractor for change-order irregularities totaling an estimated $14M.' },
      is_published: false, send_push: true, source_url: '', source_title: '', position: 0,
      created_at: '2026-05-21T09:00:00Z', updated_at: '2026-05-21T09:00:00Z', linked_atom_id: null,
    },
    {
      id: uuid(), story_id: storyTransitId, type: 'image',
      content: '',
      rich_content: { url: '', alt: 'Light-rail extension construction site, halted', caption: 'Construction at the Fifth Street extension site, paused since early June.' },
      is_published: false, send_push: false, source_url: '', source_title: '', position: 1,
      created_at: '2026-06-05T12:00:00Z', updated_at: '2026-06-05T12:00:00Z', linked_atom_id: null,
    },

    {
      id: uuid(), story_id: storyAirlinesId, type: 'text',
      content: 'Two mid-size regional carriers announced plans to merge after jet fuel costs rose 18% over the last two quarters, squeezing margins on short-haul routes.',
      rich_content: { html: '<p>Two mid-size regional carriers announced plans to merge after jet fuel costs rose <strong>18%</strong> over the last two quarters, squeezing margins on short-haul routes.</p>', plainText: 'Two mid-size regional carriers announced plans to merge after jet fuel costs rose 18% over the last two quarters, squeezing margins on short-haul routes.' },
      is_published: true, send_push: true, source_url: '', source_title: '', position: 0,
      created_at: '2026-04-12T08:30:00Z', updated_at: '2026-04-12T08:30:00Z', linked_atom_id: null,
    },
    {
      id: uuid(), story_id: storyAirlinesId, type: 'video',
      content: '',
      rich_content: { provider: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', embedId: 'dQw4w9WgXcQ', thumbnail: '' },
      is_published: true, send_push: false, source_url: '', source_title: '', position: 1,
      created_at: '2026-04-15T09:00:00Z', updated_at: '2026-04-15T09:00:00Z', linked_atom_id: null,
    },
    {
      id: uuid(), story_id: storyAirlinesId, type: 'quote',
      content: '',
      rich_content: { text: 'This is consolidation driven by fuel costs, not demand. The routes are still profitable on their own.', attribution: 'Regional aviation analyst', sourceUrl: '' },
      is_published: true, send_push: false, source_url: '', source_title: '', position: 2,
      created_at: '2026-05-29T14:20:00Z', updated_at: '2026-05-29T14:20:00Z', linked_atom_id: null,
    },

    {
      id: uuid(), story_id: storyRedistrictId, type: 'text',
      content: 'A state appeals court agreed to hear arguments on whether the new district maps dilute representation in three majority-minority districts.',
      rich_content: { html: '<p>A state appeals court agreed to hear arguments on whether the new district maps dilute representation in three majority-minority districts.</p>', plainText: 'A state appeals court agreed to hear arguments on whether the new district maps dilute representation in three majority-minority districts.' },
      is_published: true, send_push: false, source_url: '', source_title: '', position: 0,
      created_at: '2026-03-02T10:00:00Z', updated_at: '2026-03-02T10:00:00Z', linked_atom_id: null,
    },
  ],

  sources: [
    {
      id: uuid(), url: 'https://example-news.test/wire/water-utility-grant', raw_content: null,
      title: 'Regional utilities awarded joint cybersecurity grant', status: 'pending',
      story_id: null, error_message: null, created_at: '2026-06-12T08:00:00Z', processed_at: null,
    },
    {
      id: uuid(), url: 'https://example-news.test/wire/transit-board-meeting', raw_content: null,
      title: 'Transit board meets behind closed doors over funding gap', status: 'pending',
      story_id: null, error_message: null, created_at: '2026-06-14T15:30:00Z', processed_at: null,
    },
  ],

  draft_atoms: [],

  rss_feeds: [
    { id: uuid(), url: 'https://example-news.test/feeds/statehouse-wire.xml', name: 'Statehouse Wire', category: 'Politics', last_checked: '2026-06-20T07:00:00Z', is_active: true, created_at: '2026-02-01T00:00:00Z' },
    { id: uuid(), url: 'https://example-news.test/feeds/transit-authority.xml', name: 'Transit Authority Press Releases', category: 'Transportation', last_checked: '2026-06-22T07:00:00Z', is_active: true, created_at: '2026-02-01T00:00:00Z' },
    { id: uuid(), url: 'https://example-news.test/feeds/regional-business.xml', name: 'Regional Business Journal', category: 'Business', last_checked: null, is_active: false, created_at: '2026-02-01T00:00:00Z' },
  ],

  rss_items: [],
}

// draft_atoms tied to the two pending sources
DB.draft_atoms = [
  { id: uuid(), source_id: DB.sources[0].id, content: 'The grant covers SCADA monitoring upgrades at three treatment plants.', position: 0, is_approved: false, created_at: '2026-06-12T08:01:00Z' },
  { id: uuid(), source_id: DB.sources[0].id, content: 'Funding comes from a federal infrastructure cybersecurity set-aside announced in April.', position: 1, is_approved: false, created_at: '2026-06-12T08:01:00Z' },
  { id: uuid(), source_id: DB.sources[0].id, content: 'Utilities have 18 months to complete the rollout or forfeit unspent funds.', position: 2, is_approved: false, created_at: '2026-06-12T08:01:00Z' },
  { id: uuid(), source_id: DB.sources[1].id, content: 'The transit board met for 90 minutes in closed session, citing active procurement review.', position: 0, is_approved: false, created_at: '2026-06-14T15:31:00Z' },
  { id: uuid(), source_id: DB.sources[1].id, content: 'No public vote was taken; a follow-up session is scheduled for next month.', position: 1, is_approved: false, created_at: '2026-06-14T15:31:00Z' },
]

// rss_items tied to feeds
DB.rss_items = [
  { id: uuid(), feed_id: DB.rss_feeds[0].id, url: 'https://example-news.test/articles/redistrict-appeal', title: 'Appeals court agrees to hear redistricting case', description: 'Three-judge panel will hear oral arguments next month.', status: 'new', discovered_at: '2026-06-19T06:00:00Z' },
  { id: uuid(), feed_id: DB.rss_feeds[0].id, url: 'https://example-news.test/articles/budget-special-session', title: 'Governor calls special session over budget gap', description: 'Lawmakers return to the capitol on short notice.', status: 'new', discovered_at: '2026-06-20T06:30:00Z' },
  { id: uuid(), feed_id: DB.rss_feeds[1].id, url: 'https://example-news.test/articles/light-rail-pause', title: 'Light-rail extension construction paused', description: 'Contractor confirms work stoppage pending audit findings.', status: 'processed', discovered_at: '2026-06-05T11:00:00Z' },
  { id: uuid(), feed_id: DB.rss_feeds[1].id, url: 'https://example-news.test/articles/bus-rapid-transit', title: 'City studies bus rapid transit as light-rail alternative', description: 'Planners weigh a cheaper, faster-to-build option.', status: 'new', discovered_at: '2026-06-21T07:15:00Z' },
]

// ---------------------------------------------------------------------------
// Postgrest-style chainable query builder
// ---------------------------------------------------------------------------

type Op = 'select' | 'insert' | 'update' | 'delete' | 'upsert'

class QueryBuilder implements PromiseLike<{ data: any; error: any }> {
  private table: string
  private op: Op = 'select'
  private payload: any = null
  private filters: Array<(row: Row) => boolean> = []
  private orderSpec: { col: string; ascending: boolean } | null = null
  private wantsSingle = false

  constructor(table: string) {
    this.table = table
    if (!DB[table]) DB[table] = []
  }

  select(_cols?: string) {
    if (this.op === 'select') this.op = 'select'
    return this
  }
  eq(col: string, val: any) {
    this.filters.push((row) => row[col] === val)
    return this
  }
  neq(col: string, val: any) {
    this.filters.push((row) => row[col] !== val)
    return this
  }
  in(col: string, vals: any[]) {
    this.filters.push((row) => vals.includes(row[col]))
    return this
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderSpec = { col, ascending: opts?.ascending !== false }
    return this
  }
  single() {
    this.wantsSingle = true
    return this
  }
  insert(payload: any) {
    this.op = 'insert'
    this.payload = payload
    return this
  }
  update(payload: any) {
    this.op = 'update'
    this.payload = payload
    return this
  }
  upsert(payload: any) {
    this.op = 'upsert'
    this.payload = payload
    return this
  }
  delete() {
    this.op = 'delete'
    return this
  }

  private matched(): Row[] {
    return DB[this.table].filter((row) => this.filters.every((f) => f(row)))
  }

  private resolveLinkedAtom(atom: Row) {
    if (this.table !== 'atoms') return atom
    if (!atom.linked_atom_id) return { ...atom, linked_atom: null }
    const linked = DB.atoms.find((a) => a.id === atom.linked_atom_id)
    if (!linked) return { ...atom, linked_atom: null }
    const story = DB.stories.find((s) => s.id === linked.story_id)
    return {
      ...atom,
      linked_atom: {
        id: linked.id,
        story_id: linked.story_id,
        stories: story ? { id: story.id, title: story.title } : undefined,
      },
    }
  }

  private execute(): { data: any; error: any } {
    try {
      if (this.op === 'select') {
        let rows = this.matched().map((r) => this.resolveLinkedAtom(r))
        if (this.orderSpec) {
          const { col, ascending } = this.orderSpec
          rows = [...rows].sort((a, b) => {
            if (a[col] < b[col]) return ascending ? -1 : 1
            if (a[col] > b[col]) return ascending ? 1 : -1
            return 0
          })
        }
        if (this.wantsSingle) {
          const row = rows[0]
          return row ? { data: row, error: null } : { data: null, error: { message: 'No rows found' } }
        }
        return { data: rows, error: null }
      }

      if (this.op === 'insert') {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload]
        const created = items.map((item) => {
          const row: Row = {
            id: uuid(),
            created_at: now(),
            ...item,
          }
          if ('updated_at' in (DB[this.table][0] || { updated_at: undefined }) || this.table === 'stories' || this.table === 'atoms') {
            row.updated_at = row.updated_at || now()
          }
          DB[this.table].push(row)
          return row
        })
        if (this.wantsSingle) return { data: created[0], error: null }
        return { data: created, error: null }
      }

      if (this.op === 'update') {
        const rows = this.matched()
        rows.forEach((row) => {
          Object.assign(row, this.payload)
          if ('updated_at' in row) row.updated_at = now()
        })
        if (this.wantsSingle) return { data: rows[0] || null, error: null }
        return { data: rows, error: null }
      }

      if (this.op === 'delete') {
        const rows = this.matched()
        DB[this.table] = DB[this.table].filter((row) => !rows.includes(row))
        return { data: rows, error: null }
      }

      if (this.op === 'upsert') {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload]
        const result = items.map((item) => {
          const existing = item.id ? DB[this.table].find((r) => r.id === item.id) : undefined
          if (existing) {
            Object.assign(existing, item, { updated_at: now() })
            return existing
          }
          const row: Row = { id: uuid(), created_at: now(), updated_at: now(), ...item }
          DB[this.table].push(row)
          return row
        })
        return { data: this.wantsSingle ? result[0] : result, error: null }
      }

      return { data: null, error: { message: `Unsupported operation: ${this.op}` } }
    } catch (err: any) {
      return { data: null, error: { message: err?.message || 'Mock query failed' } }
    }
  }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled as any, onrejected as any)
  }
}

// ---------------------------------------------------------------------------
// Auth mock — starts already logged in, per the demo's "fake authenticated
// session" requirement, so every page renders without a login step.
// ---------------------------------------------------------------------------

const DEMO_USER = {
  id: uuid(),
  email: 'demo.editor@chronicle.example',
  app_metadata: {},
  user_metadata: { display_name: 'Demo Editor' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
}

const makeSession = (user: typeof DEMO_USER) => ({
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user,
})

let currentSession: any = makeSession(DEMO_USER)
const authListeners: Array<(event: string, session: any) => void> = []

function notifyAuthChange(event: string) {
  authListeners.forEach((cb) => cb(event, currentSession))
}

// ---------------------------------------------------------------------------
// Storage mock — uploaded files get a real, local object URL so previews
// work without any network call.
// ---------------------------------------------------------------------------

const objectUrls = new Map<string, string>()
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#64748b" text-anchor="middle">Demo image</text></svg>'
  )

function makeStorage(bucket: string) {
  return {
    upload(path: string, file: any, _opts?: any) {
      try {
        const url = typeof URL !== 'undefined' && file ? URL.createObjectURL(file) : FALLBACK_IMAGE
        objectUrls.set(`${bucket}/${path}`, url)
      } catch {
        objectUrls.set(`${bucket}/${path}`, FALLBACK_IMAGE)
      }
      return Promise.resolve({ data: { path }, error: null })
    },
    getPublicUrl(path: string) {
      return { data: { publicUrl: objectUrls.get(`${bucket}/${path}`) || FALLBACK_IMAGE } }
    },
    remove(paths: string[]) {
      paths.forEach((p) => objectUrls.delete(`${bucket}/${p}`))
      return Promise.resolve({ data: null, error: null })
    },
  }
}

// ---------------------------------------------------------------------------
// RPC mock
// ---------------------------------------------------------------------------

function rpc(fn: string, args: Record<string, any>) {
  if (fn === 'get_related_stories_for_atom') {
    const atom = DB.atoms.find((a) => a.id === args.p_atom_id)
    if (!atom) return Promise.resolve({ data: [], error: null })
    // Demo heuristic: surface one other story as "related" so the UI's
    // related-stories badge has something real to render.
    const other = DB.stories.find((s) => s.id !== atom.story_id)
    const related = other ? [{ story_id: other.id, title: other.title, image_url: other.image_url }] : []
    return Promise.resolve({ data: related, error: null })
  }
  if (fn === 'get_unread_atoms_for_user') {
    return Promise.resolve({ data: [], error: null })
  }
  return Promise.resolve({ data: null, error: { message: `Unknown RPC: ${fn}` } })
}

// ---------------------------------------------------------------------------
// Fetch patch — intercepts calls to the two Supabase Edge Functions this app
// calls directly via fetch() (check-rss-feeds, atomize-url), so those flows
// complete end-to-end against the in-memory DB instead of hitting a live
// backend. Everything else passes through to the real fetch.
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined' && !(window as any).__chronicleDemoFetchPatched) {
  ;(window as any).__chronicleDemoFetchPatched = true
  const realFetch = window.fetch.bind(window)

  window.fetch = async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url || ''

    if (url.includes('/functions/v1/check-rss-feeds')) {
      let newItems = 0
      DB.rss_feeds.forEach((feed) => {
        if (!feed.is_active) return
        feed.last_checked = now()
        const item = {
          id: uuid(),
          feed_id: feed.id,
          url: `https://example-news.test/articles/auto-${Math.random().toString(36).slice(2, 8)}`,
          title: `New item from ${feed.name}`,
          description: 'Discovered during a simulated feed check.',
          status: 'new',
          discovered_at: now(),
        }
        DB.rss_items.push(item)
        newItems += 1
      })
      return new Response(JSON.stringify({ processed: DB.rss_feeds.length, newItems }), { status: 200 })
    }

    if (url.includes('/functions/v1/atomize-url')) {
      const u = new URL(url, 'https://demo.local')
      const sourceId = u.searchParams.get('sourceId')
      const articleUrl = u.searchParams.get('url') || ''

      const source = DB.sources.find((s) => s.id === sourceId)
      const title = source?.title || `Atomized story from ${articleUrl}`

      const storyId = uuid()
      DB.stories.push({
        id: storyId,
        title,
        summary: null,
        category: null,
        image_url: '',
        image_credit: '',
        status: 'draft',
        created_at: now(),
        updated_at: now(),
      })
      ;['First atomic fact extracted from the source article.', 'Second atomic fact, with supporting detail.', 'Third atomic fact, ready for editorial review.'].forEach(
        (content, i) => {
          DB.atoms.push({
            id: uuid(), story_id: storyId, type: 'text', content,
            rich_content: { html: `<p>${content}</p>`, plainText: content },
            is_published: false, send_push: true, source_url: articleUrl, source_title: title,
            position: i, created_at: now(), updated_at: now(), linked_atom_id: null,
          })
        }
      )
      if (source) {
        source.status = 'processed'
        source.story_id = storyId
        source.processed_at = now()
      }

      return new Response(JSON.stringify({ storyId }), { status: 200 })
    }

    return realFetch(input, init)
  }
}

// ---------------------------------------------------------------------------
// Public mock client — same call-chain shape as @supabase/supabase-js
// ---------------------------------------------------------------------------

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table)
  },
  rpc(fn: string, args: Record<string, any> = {}) {
    return rpc(fn, args)
  },
  storage: {
    from(bucket: string) {
      return makeStorage(bucket)
    },
  },
  auth: {
    getSession() {
      return Promise.resolve({ data: { session: currentSession }, error: null })
    },
    onAuthStateChange(cb: (event: string, session: any) => void) {
      authListeners.push(cb)
      return { data: { subscription: { unsubscribe() { const i = authListeners.indexOf(cb); if (i >= 0) authListeners.splice(i, 1) } } } }
    },
    async signInWithPassword({ email }: { email: string; password: string }): Promise<{ data: { session: any }; error: { message: string } | null }> {
      currentSession = makeSession({ ...DEMO_USER, email })
      notifyAuthChange('SIGNED_IN')
      return { data: { session: currentSession }, error: null }
    },
    async signOut(): Promise<{ error: { message: string } | null }> {
      currentSession = null
      notifyAuthChange('SIGNED_OUT')
      return { error: null }
    },
  },
}
