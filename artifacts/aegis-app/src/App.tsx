import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import {
  Activity, AlarmClock, ArrowRight, Bell, BookOpen, CalendarDays, Check, CheckCircle2,
  ChevronRight, CircleHelp, Clock3, ContactRound, HeartHandshake, Home, Info,
  LifeBuoy, LockKeyhole, Menu, MessageCircle, Moon, Phone, Plus, ShieldCheck, SlidersHorizontal,
  Sparkles, UserRound, UsersRound, X, Zap, type LucideIcon,
} from 'lucide-react';
import {
  getGetActivityQueryKey, getGetDashboardQueryKey, getGetFamilyQueryKey, getGetHealthItemsQueryKey,
  getGetHelpRequestsQueryKey, getGetNotificationsQueryKey, getGetPermissionsQueryKey,
  getGetProfileQueryKey, getGetServicesQueryKey, useCreateCheckIn, useCreateEmergencyAlert,
  useCreateFamilyMember, useCreateHealthItem, useCreateHelpRequest, useCreateService,
  useGetActivity, useGetDashboard, useGetFamily, useGetHealthItems, useGetHelpRequests,
  useGetNotifications, useGetPermissions, useGetProfile, useGetServices, useUpdatePermission,
  useUpdateProfile,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Notice = { kind: 'success' | 'error'; text: string };

function useNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const show = (kind: Notice['kind'], text: string) => {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 4500);
  };
  return { notice, show };
}

function NoticeBar({ notice }: { notice: Notice | null }) {
  if (!notice) return null;
  return (
    <div role="status" data-testid="status-notice" className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg ${notice.kind === 'success' ? 'border-teal-200 bg-teal-50 text-teal-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
      {notice.kind === 'success' ? <CheckCircle2 size={18} /> : <CircleHelp size={18} />}
      <span>{notice.text}</span>
    </div>
  );
}

function LoadingBlock({ label = 'Loading your space' }: { label?: string }) {
  return <div data-testid="loading-state" className="space-y-4"><div className="h-8 w-2/5 animate-pulse rounded-lg bg-muted" /><div className="h-28 animate-pulse rounded-3xl bg-muted" /><p className="text-sm text-muted-foreground">{label}</p></div>;
}

function ErrorBlock({ onRetry }: { onRetry?: () => void }) {
  return <div data-testid="error-state" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"><p className="font-semibold">We could not bring that in right now.</p><p className="mt-1 text-sm text-red-800/80">Your information has not been changed. Please try again.</p>{onRetry && <button data-testid="button-retry" onClick={onRetry} className="focus-ring mt-4 rounded-xl bg-red-900 px-4 py-2 text-sm font-semibold text-white">Try again</button>}</div>;
}

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/today', label: 'Today', icon: Home },
  { href: '/family', label: 'My people', icon: UsersRound },
  { href: '/help', label: 'Ask for help', icon: LifeBuoy },
  { href: '/health', label: 'Health notes', icon: HeartHandshake },
  { href: '/services', label: 'Services', icon: CalendarDays },
];

const mobileNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/today', label: 'Today', icon: Home },
  { href: '/family', label: 'Family', icon: UsersRound },
  { href: '/help', label: 'Help', icon: LifeBuoy },
  { href: '/services', label: 'Services', icon: CalendarDays },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

function DemoNotice() {
  return (
    <aside aria-label="Demo information" className="demo-notice">
      <Info size={20} aria-hidden="true" />
      <p><strong>Shared demo only.</strong> The fictional profile, preferences, and records are shared with everyone using this demo; they are not private. Do not enter real personal, health, or emergency information.</p>
    </aside>
  );
}

function useAccessibleDialog<T extends HTMLElement>(ref: RefObject<T | null>, onClose: () => void, active = true) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.focus();

    const getFocusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.getAttribute('aria-hidden') !== 'true');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [active, ref]);
}

function MobilePrimaryNavigation() {
  const [location] = useLocation();
  return (
    <nav aria-label="Primary navigation" className="mobile-primary-nav" data-testid="mobile-primary-navigation">
      {mobileNavItems.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-current={location === href ? 'page' : undefined} className="mobile-primary-nav-link">
          <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useAccessibleDialog(menuRef, () => setMenuOpen(false), menuOpen);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const updateKeyboardState = () => setKeyboardOpen(window.innerWidth < 1024 && window.innerHeight - viewport.height > 140);
    viewport.addEventListener('resize', updateKeyboardState);
    viewport.addEventListener('scroll', updateKeyboardState);
    updateKeyboardState();
    return () => {
      viewport.removeEventListener('resize', updateKeyboardState);
      viewport.removeEventListener('scroll', updateKeyboardState);
    };
  }, []);
  const profile = useGetProfile();
  const unread = useGetNotifications();
  const unreadCount = unread.data?.filter((item) => !item.read).length ?? 0;
  const initials = profile.data?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) ?? 'AE';
  return (
    <div className="aegis-shell min-h-[100dvh]" data-large-text={profile.data?.accessibilityLargeText ? 'true' : 'false'} data-reduced-motion={profile.data?.reducedMotion ? 'true' : 'false'} data-keyboard-open={keyboardOpen ? 'true' : 'false'}>
      <a href="#main-content" className="skip-link focus-ring">Skip to main content</a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar px-5 py-6 text-sidebar-foreground lg:flex">
          <Link href="/today" data-testid="link-logo" className="focus-ring mb-12 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground"><ShieldCheck size={22} /></div>
          <div><div className="serif text-2xl leading-none">aegis</div><div className="mt-1 text-[10px] uppercase tracking-[.2em] text-sidebar-foreground/60">support, by consent</div></div>
        </Link>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/45">Your space</p>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={location === href ? 'page' : undefined} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${location === href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></Link>)}
        </nav>
        <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/45">Keep close</p>
        <nav className="space-y-1">
          <Link href="/notifications" aria-current={location === '/notifications' ? 'page' : undefined} data-testid="link-nav-notifications" className={`focus-ring flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold ${location === '/notifications' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60'}`}><span className="flex items-center gap-3"><Bell size={18} strokeWidth={1.8} />Updates</span>{unreadCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sidebar-primary px-1 text-[11px] font-bold text-sidebar-primary-foreground">{unreadCount}</span>}</Link>
          <Link href="/privacy" aria-current={location === '/privacy' ? 'page' : undefined} data-testid="link-nav-privacy" className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${location === '/privacy' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60'}`}><LockKeyhole size={18} strokeWidth={1.8} />Privacy</Link>
          <Link href="/emergency" aria-current={location === '/emergency' ? 'page' : undefined} data-testid="link-nav-emergency" className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${location === '/emergency' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-primary hover:bg-sidebar-accent/60'}`}><Zap size={18} strokeWidth={1.8} />Emergency demo</Link>
        </nav>
        <div className="mt-auto border-t border-sidebar-border pt-4">
          <Link href="/profile" data-testid="link-profile" className="focus-ring flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sidebar-primary font-bold text-sidebar-primary-foreground">{initials}</div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{profile.data?.name ?? 'Your profile'}</p><p className="text-xs text-sidebar-foreground/55">Personal settings</p></div>
          </Link>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="mobile-app-header sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-5 py-4 lg:hidden">
          <Link href="/today" data-testid="link-mobile-logo" className="focus-ring flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck size={19} aria-hidden="true" /></div><span className="serif text-2xl">aegis</span></Link>
          <div className="flex items-center gap-2">
            <Link href="/emergency" data-testid="link-mobile-emergency-quick" className="focus-ring mobile-emergency-link"><Zap size={17} aria-hidden="true" />Emergency</Link>
          <button data-testid="button-open-menu" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="mobile-navigation-dialog" onClick={() => setMenuOpen((open) => !open)} className="focus-ring rounded-xl p-2 text-foreground"><Menu size={22} aria-hidden="true" /></button>
          </div>
        </header>
        {menuOpen && (
          <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)}>
            <div ref={menuRef} id="mobile-navigation-dialog" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" tabIndex={-1} className="mobile-menu-panel" onClick={(event) => event.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between border-b border-sidebar-border pb-4">
                <h2 id="mobile-menu-title" className="serif text-2xl">More options</h2>
                <button data-testid="button-close-menu" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="focus-ring rounded-lg p-2"><X size={21} aria-hidden="true" /></button>
              </div>
              <nav aria-label="More options" className="space-y-1">
                <Link href="/health" aria-current={location === '/health' ? 'page' : undefined} onClick={() => setMenuOpen(false)} data-testid="link-mobile-health" className="mobile-menu-link"><HeartHandshake size={19} aria-hidden="true" />Health notes</Link>
                <Link href="/notifications" aria-current={location === '/notifications' ? 'page' : undefined} onClick={() => setMenuOpen(false)} data-testid="link-mobile-notifications" className="mobile-menu-link"><Bell size={19} aria-hidden="true" />Updates</Link>
                <Link href="/privacy" aria-current={location === '/privacy' ? 'page' : undefined} onClick={() => setMenuOpen(false)} data-testid="link-mobile-privacy" className="mobile-menu-link"><LockKeyhole size={19} aria-hidden="true" />Privacy</Link>
                <Link href="/profile" aria-current={location === '/profile' ? 'page' : undefined} onClick={() => setMenuOpen(false)} data-testid="link-mobile-profile" className="mobile-menu-link"><UserRound size={19} aria-hidden="true" />Profile settings</Link>
              </nav>
            </div>
          </div>
        )}
        <main id="main-content" className="mobile-main-content page-reveal mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <DemoNotice />
          {children}
        </main>
        {!keyboardOpen && <MobilePrimaryNavigation />}
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">{eyebrow}</p><h1 data-testid="text-page-title" className="serif mt-2 text-3xl leading-tight text-foreground md:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{detail}</p></div>{action}</div>;
}

function Button({ children, className = '', variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet' | 'danger' }) {
  const styles = { primary: 'bg-primary text-primary-foreground hover:opacity-90', secondary: 'border border-border bg-card text-foreground hover:bg-muted', quiet: 'text-primary hover:bg-secondary/60', danger: 'border border-red-200 bg-red-50 text-red-900 hover:bg-red-100' };
  return <button {...props} className={`focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${styles[variant]} ${className}`}>{children}</button>;
}

function EmptyState({ icon: Icon, title, detail, action }: { icon: LucideIcon; title: string; detail: string; action?: ReactNode }) {
  return <div data-testid="empty-state" className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary"><Icon size={23} /></div><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{detail}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

function TodayPage() {
  const dashboard = useGetDashboard();
  const activity = useGetActivity();
  const family = useGetFamily();
  const createCheckIn = useCreateCheckIn();
  const qc = useQueryClient();
  const { notice, show } = useNotice();
  const [note, setNote] = useState('');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'okay' | 'help' | 'urgent'>('okay');
  const data = dashboard.data;
  const submitCheckIn = () => {
    createCheckIn.mutate({ data: { status: savingStatus, note: note || undefined } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); qc.invalidateQueries({ queryKey: getGetActivityQueryKey() }); setCheckInOpen(false); setNote(''); show('success', 'Demo check-in recorded. No one was notified.'); }, onError: () => show('error', 'That demo check-in did not save. Please try again.') });
  };
  if (dashboard.isLoading) return <LoadingBlock />;
  if (dashboard.isError || !data) return <ErrorBlock onRetry={() => dashboard.refetch()} />;
  return <><PageHeading eyebrow="Today · shared demo" title={`${data.greeting}, ${data.name}.`} detail="This is a shared fictional profile. Check-ins and activity are saved as demo records; no contacts are notified." action={!data.checkInToday && <Button data-testid="button-check-in" onClick={() => setCheckInOpen(true)}><CheckCircle2 size={17} />Try a check-in</Button>} />
    <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <section className="soft-card overflow-hidden rounded-[2rem]"><div className="relative p-7 sm:p-9"><div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[5rem] bg-secondary/60" /><div className="relative"><div className="flex items-center gap-2 text-sm font-bold text-primary"><span className={`h-2.5 w-2.5 rounded-full ${data.checkInToday ? 'bg-teal-600' : 'bg-accent'}`} />{data.checkInToday ? 'Checked in today' : 'Your day is waiting for you'}</div><h2 data-testid="status-today" className="serif mt-5 max-w-xl text-3xl leading-tight sm:text-4xl">{data.statusLabel}</h2><p className="mt-3 max-w-xl leading-7 text-muted-foreground">{data.statusDetail}</p>{data.nextItem && <div className="mt-8 flex max-w-md items-center gap-4 rounded-2xl border border-border bg-background/70 p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Clock3 size={19} /></div><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Next up</p><p className="mt-1 font-bold">{data.nextItem}</p><p className="text-sm text-muted-foreground">{data.nextItemTime}</p></div></div>}</div></div><div className="grid grid-cols-3 border-t border-border bg-secondary/30"><Metric label="Open requests" value={data.openRequests} /><Metric label="Family online" value={data.familyOnline} /><Metric label="Emergency contacts" value={data.emergencyContacts} /></div></section>
      <section className="soft-card rounded-[2rem] p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Your people</p><h2 className="mt-1 text-xl font-bold">Close by, not over you</h2></div><Link href="/family" data-testid="link-see-family" className="focus-ring rounded-lg p-2 text-primary"><ChevronRight size={19} /></Link></div><p className="mt-3 text-sm leading-6 text-muted-foreground">The people you trust can see only what you have allowed.</p><div className="mt-6 space-y-3">{family.isLoading ? <div className="h-10 animate-pulse rounded-xl bg-muted" /> : family.data?.slice(0, 3).map((person) => <div key={person.id} data-testid={`row-family-${person.id}`} className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-secondary font-bold text-primary">{person.initials}</div><div className="min-w-0 flex-1"><p className="font-semibold">{person.name}</p><p className="text-xs text-muted-foreground">{person.relationship}</p></div><span className={`h-2.5 w-2.5 rounded-full ${person.status === 'online' ? 'bg-teal-600' : 'bg-border'}`} /></div>)}{!family.isLoading && !family.data?.length && <p className="text-sm text-muted-foreground">Your trusted circle is ready when you are.</p>}</div><Link href="/family" data-testid="link-manage-family" className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">Manage my people <ArrowRight size={15} /></Link></section>
    </div>
    <section className="mt-7"><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">A quiet timeline</p><h2 className="serif mt-1 text-2xl">Recent activity</h2></div><span className="text-xs text-muted-foreground">Shared sample activity</span></div>{activity.isLoading ? <LoadingBlock label="Bringing in recent activity" /> : activity.isError ? <ErrorBlock onRetry={() => activity.refetch()} /> : activity.data?.length ? <div className="soft-card divide-y divide-border rounded-3xl">{activity.data.map((item) => <div key={item.id} data-testid={`row-activity-${item.id}`} className="flex gap-4 p-5"><div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">{item.kind === 'check-in' ? <Check size={17} /> : item.kind === 'health' ? <HeartHandshake size={17} /> : <Activity size={17} />}</div><div className="min-w-0 flex-1"><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p></div><time className="shrink-0 text-xs text-muted-foreground">{item.timeLabel}</time></div>)}</div> : <EmptyState icon={Activity} title="Your demo timeline is clear" detail="Sample check-ins, requests, and reminders appear here." />}</section>
    {checkInOpen && <Modal title="How are you today?" onClose={() => setCheckInOpen(false)}><div className="grid gap-3 sm:grid-cols-3">{(['okay', 'help', 'urgent'] as const).map((status) => <button key={status} data-testid={`button-check-in-${status}`} onClick={() => setSavingStatus(status)} className={`focus-ring rounded-2xl border p-4 text-left ${savingStatus === status ? 'border-primary bg-secondary' : 'border-border bg-card'}`}><span className={`block h-3 w-3 rounded-full ${status === 'okay' ? 'bg-teal-600' : status === 'help' ? 'bg-amber-500' : 'bg-red-600'}`} /><span className="mt-3 block font-bold">{status === 'okay' ? 'I am okay' : status === 'help' ? 'I could use help' : 'I need urgent help'}</span></button>)}</div><label className="mt-5 block text-sm font-bold" htmlFor="check-in-note">A note, if you want to add one <span className="font-normal text-muted-foreground">(optional)</span></label><textarea id="check-in-note" data-testid="textarea-check-in-note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="focus-ring mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm" placeholder="Share only what feels useful" /><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" data-testid="button-cancel-check-in" onClick={() => setCheckInOpen(false)}>Not now</Button><Button data-testid="button-save-check-in" onClick={submitCheckIn} disabled={createCheckIn.isPending}>{createCheckIn.isPending ? 'Saving…' : 'Save check-in'}</Button></div></Modal>}
    <NoticeBar notice={notice} /></>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="p-4 text-center"><p data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`} className="serif text-2xl text-primary">{value}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p></div>; }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useAccessibleDialog(dialogRef, onClose);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/55 p-4 sm:p-5">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="focus-ring max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-border bg-card p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="serif text-2xl">{title}</h2>
          <button data-testid="button-close-modal" onClick={onClose} aria-label="Close dialog" className="focus-ring rounded-lg p-1 text-muted-foreground"><X size={20} aria-hidden="true" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FamilyPage() {
  const family = useGetFamily();
  const create = useCreateFamilyMember();
  const qc = useQueryClient();
  const { notice, show } = useNotice();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', contact: '', canSeeCheckIns: true, canSeeRequests: true });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const initials = form.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    create.mutate({ data: { ...form, initials } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetFamilyQueryKey() });
        setOpen(false);
        setForm({ name: '', relationship: '', contact: '', canSeeCheckIns: true, canSeeRequests: true });
        show('success', 'Demo contact record saved.');
      },
      onError: () => show('error', 'The demo contact could not be saved. Please try again.'),
    });
  };

  return (
    <>
      <PageHeading
        eyebrow="Demo contacts"
        title="A sample support circle."
        detail="The contacts and permission settings are fictional examples. These settings do not restrict access to shared demo records, and no calls or messages are sent."
        action={<Button data-testid="button-add-family" onClick={() => setOpen(true)}><Plus size={17} />Add demo contact</Button>}
      />
      {family.isLoading ? <LoadingBlock /> : family.isError ? <ErrorBlock onRetry={() => family.refetch()} /> : family.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {family.data.map((person) => (
            <article key={person.id} data-testid={`card-family-${person.id}`} className="soft-card rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-secondary text-lg font-bold text-primary">{person.initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold">{person.name}</h2>
                    <span className="rounded-full border border-border px-2.5 py-1 text-xs font-bold text-muted-foreground">Sample contact</span>
                  </div>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{person.relationship} · {person.contact}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-muted/70 p-3">
                  <p className="font-bold">Check-ins</p>
                  <p className="mt-1 text-muted-foreground">{person.canSeeCheckIns ? 'On in sample settings' : 'Off in sample settings'}</p>
                </div>
                <div className="rounded-xl bg-muted/70 p-3">
                  <p className="font-bold">Help requests</p>
                  <p className="mt-1 text-muted-foreground">{person.canSeeRequests ? 'On in sample settings' : 'Off in sample settings'}</p>
                </div>
              </div>
              <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
                <Clock3 size={16} aria-hidden="true" /> Sample check-in: {person.lastCheckIn ?? 'No sample time'}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={UsersRound} title="No sample contacts yet" detail="Add fictional details to explore this demo. No one will be contacted." action={<Button data-testid="button-empty-add-family" onClick={() => setOpen(true)}>Add demo contact</Button>} />
      )}
      {open && (
        <Modal title="Add a demo contact" onClose={() => setOpen(false)}>
          <p className="demo-feature-note mt-5">Use fictional details only. This record is shared with everyone using the demo.</p>
          <form onSubmit={submit} autoComplete="off" className="mt-5 space-y-4">
            <Field label="Fictional name" id="family-name"><input required id="family-name" data-testid="input-family-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="Relationship (fictional)" id="family-relationship"><input required id="family-relationship" data-testid="input-family-relationship" placeholder="For example, daughter or neighbor" value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} /></Field>
            <Field label="Phone or email (fictional)" id="family-contact"><input required id="family-contact" data-testid="input-family-contact" value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} /></Field>
            <CheckField checked={form.canSeeCheckIns} onChange={(value) => setForm({ ...form, canSeeCheckIns: value })} label="Sample setting: include check-ins" id="allow-check-ins" />
            <CheckField checked={form.canSeeRequests} onChange={(value) => setForm({ ...form, canSeeRequests: value })} label="Sample setting: include help requests" id="allow-requests" />
            <p className="text-sm text-muted-foreground">These sample settings do not control who can view shared demo data.</p>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="secondary" type="button" data-testid="button-cancel-family" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" data-testid="button-save-family" disabled={create.isPending}>{create.isPending ? 'Saving…' : 'Save demo contact'}</Button>
            </div>
          </form>
        </Modal>
      )}
      <NoticeBar notice={notice} />
    </>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) { return <div><label htmlFor={id} className="mb-1.5 block text-sm font-bold">{label}</label>{children}</div>; }
function CheckField({ checked, onChange, label, id }: { checked: boolean; onChange: (value: boolean) => void; label: string; id: string }) { return <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm"><input id={id} data-testid={`checkbox-${id}`} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />{label}</label>; }
function inputClasses() { return 'focus-ring w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm'; }

function HelpPage() {
  const requests = useGetHelpRequests(); const create = useCreateHelpRequest(); const qc = useQueryClient(); const { notice, show } = useNotice(); const [form, setForm] = useState({ category: 'Around the house', description: '', preferredTime: '' });
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate({ data: form }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetHelpRequestsQueryKey() }); setForm({ category: 'Around the house', description: '', preferredTime: '' }); show('success', 'Your request is in. You can update your circle if you want them involved.'); }, onError: () => show('error', 'That request did not send. Please try again.') }); };
  return <><PageHeading eyebrow="Ask for help" title="A small ask is still independent." detail="Describe what would make today easier. This is for practical support, not medical advice or emergency services." /><div className="grid gap-7 lg:grid-cols-[.8fr_1.2fr]"><section className="soft-card rounded-3xl p-6 sm:p-8"><div className="mb-6 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><MessageCircle size={19} /></div><div><h2 className="text-lg font-bold">Make a request</h2><p className="text-sm text-muted-foreground">You decide who sees it.</p></div></div><form onSubmit={submit} className="space-y-4"><Field label="What kind of help?" id="help-category"><select id="help-category" data-testid="select-help-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={inputClasses()}><option>Around the house</option><option>Getting somewhere</option><option>Shopping or errands</option><option>Company or a call</option><option>Something else</option></select></Field><Field label="Tell us a little more" id="help-description"><textarea required id="help-description" data-testid="textarea-help-description" rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClasses()} placeholder="What would feel useful?" /></Field><Field label="Preferred time" id="help-time"><input id="help-time" data-testid="input-help-time" value={form.preferredTime} onChange={(event) => setForm({ ...form, preferredTime: event.target.value })} className={inputClasses()} placeholder="For example, tomorrow afternoon" /></Field><Button type="submit" data-testid="button-send-help" disabled={create.isPending} className="w-full">{create.isPending ? 'Sending…' : 'Send help request'}<ArrowRight size={16} /></Button></form></section><section><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Your requests</p><h2 className="serif mt-1 text-2xl">Nothing gets lost</h2></div></div>{requests.isLoading ? <LoadingBlock /> : requests.isError ? <ErrorBlock onRetry={() => requests.refetch()} /> : requests.data?.length ? <div className="space-y-3">{requests.data.map((request) => <article data-testid={`card-help-${request.id}`} key={request.id} className="soft-card rounded-2xl p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{request.category}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{request.description}</p></div><StatusPill status={request.status} /></div><div className="mt-4 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 size={13} />{request.preferredTime || 'No preferred time'}</span><span>{request.createdAt}</span></div></article>)}</div> : <EmptyState icon={LifeBuoy} title="No open requests" detail="When something would make the day easier, you can ask here." />}</section></div><NoticeBar notice={notice} /></>;
}

function ServicesPage() {
  const services = useGetServices(); const create = useCreateService(); const qc = useQueryClient(); const { notice, show } = useNotice(); const [form, setForm] = useState({ category: 'Home maintenance', description: '', preferredTime: '' });
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate({ data: form }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetServicesQueryKey() }); setForm({ category: 'Home maintenance', description: '', preferredTime: '' }); show('success', 'Service request added to your tracker.'); }, onError: () => show('error', 'That service request did not save.') }); };
  return <><PageHeading eyebrow="Services" title="Keep the practical things moving." detail="Track requests for services you use at home or in your neighborhood. AEGIS does not endorse or verify providers." /><div className="grid gap-7 lg:grid-cols-[.8fr_1.2fr]"><section className="soft-card rounded-3xl p-6 sm:p-8"><div className="mb-6 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><SlidersHorizontal size={19} /></div><div><h2 className="text-lg font-bold">Track a service</h2><p className="text-sm text-muted-foreground">Keep details in one place.</p></div></div><form onSubmit={submit} className="space-y-4"><Field label="Service type" id="service-category"><select id="service-category" data-testid="select-service-category" className={inputClasses()} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Home maintenance</option><option>Transportation</option><option>Meal support</option><option>Technology help</option><option>Other</option></select></Field><Field label="Details" id="service-description"><textarea required id="service-description" data-testid="textarea-service-description" rows={5} className={inputClasses()} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What are you arranging?" /></Field><Field label="Preferred time" id="service-time"><input id="service-time" data-testid="input-service-time" className={inputClasses()} value={form.preferredTime} onChange={(event) => setForm({ ...form, preferredTime: event.target.value })} placeholder="For example, this week" /></Field><Button type="submit" data-testid="button-add-service" disabled={create.isPending} className="w-full">{create.isPending ? 'Adding…' : 'Add service request'}</Button></form></section><section>{services.isLoading ? <LoadingBlock /> : services.isError ? <ErrorBlock onRetry={() => services.refetch()} /> : services.data?.length ? <div className="space-y-3">{services.data.map((service) => <article key={service.id} data-testid={`card-service-${service.id}`} className="soft-card rounded-2xl p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{service.category}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{service.description}</p></div><StatusPill status={service.status} /></div><div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 size={13} />{service.preferredTime || 'No preferred time'}</div></article>)}</div> : <EmptyState icon={CalendarDays} title="No services to track" detail="Add a request when you are arranging practical help." />}</section></div><NoticeBar notice={notice} /></>;
}

function HealthPage() {
  const health = useGetHealthItems(); const create = useCreateHealthItem(); const qc = useQueryClient(); const { notice, show } = useNotice(); const [form, setForm] = useState({ kind: 'appointment' as 'medication' | 'appointment' | 'note', title: '', detail: '', dueLabel: '' }); const [open, setOpen] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate({ data: form }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetHealthItemsQueryKey() }); setOpen(false); setForm({ kind: 'appointment', title: '', detail: '', dueLabel: '' }); show('success', 'Health note added.'); }, onError: () => show('error', 'That note did not save.') }); };
  return <><PageHeading eyebrow="Health notes" title="Support that stays yours." detail="Keep reminders and appointments where you can see them. AEGIS does not diagnose, prescribe, or replace care from a qualified professional." action={<Button data-testid="button-add-health" onClick={() => setOpen(true)}><Plus size={17} />Add health note</Button>} /><div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><Info size={18} className="shrink-0" /><p>These are personal reminders. For urgent symptoms or immediate danger, contact local emergency services.</p></div>{health.isLoading ? <LoadingBlock /> : health.isError ? <ErrorBlock onRetry={() => health.refetch()} /> : health.data?.length ? <div className="grid gap-3 md:grid-cols-2">{health.data.map((item) => <article key={item.id} data-testid={`card-health-${item.id}`} className={`soft-card rounded-2xl p-5 ${item.completed ? 'opacity-60' : ''}`}><div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">{item.kind === 'medication' ? <AlarmClock size={18} /> : item.kind === 'appointment' ? <CalendarDays size={18} /> : <BookOpen size={18} />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.kind}</p><h2 className="mt-1 font-bold">{item.title}</h2></div>{item.completed && <CheckCircle2 size={18} className="text-primary" />}</div><p className="mt-2 text-sm text-muted-foreground">{item.detail}</p><p className="mt-4 text-xs font-bold text-primary">{item.dueLabel}</p></div></div></article>)}</div> : <EmptyState icon={HeartHandshake} title="Nothing on your health list" detail="Add a reminder, appointment, or note that helps you feel prepared." action={<Button data-testid="button-empty-health" onClick={() => setOpen(true)}>Add health note</Button>} />}{open && <Modal title="Add a health note" onClose={() => setOpen(false)}><form onSubmit={submit} className="mt-5 space-y-4"><Field label="Type" id="health-kind"><select id="health-kind" data-testid="select-health-kind" className={inputClasses()} value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as typeof form.kind })}><option value="appointment">Appointment</option><option value="medication">Medication reminder</option><option value="note">Personal note</option></select></Field><Field label="Title" id="health-title"><input required id="health-title" data-testid="input-health-title" className={inputClasses()} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="For example, Dr. Patel" /></Field><Field label="Details" id="health-detail"><textarea required id="health-detail" data-testid="textarea-health-detail" rows={3} className={inputClasses()} value={form.detail} onChange={(event) => setForm({ ...form, detail: event.target.value })} placeholder="What would you like to remember?" /></Field><Field label="When" id="health-due"><input required id="health-due" data-testid="input-health-due" className={inputClasses()} value={form.dueLabel} onChange={(event) => setForm({ ...form, dueLabel: event.target.value })} placeholder="For example, Tuesday at 2:00 PM" /></Field><div className="flex justify-end gap-3"><Button variant="secondary" type="button" data-testid="button-cancel-health" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" data-testid="button-save-health" disabled={create.isPending}>{create.isPending ? 'Saving…' : 'Save note'}</Button></div></form></Modal>}<NoticeBar notice={notice} /></>;
}

function StatusPill({ status }: { status: string }) { return <span className={`shrink-0 border border-current px-2.5 py-1 text-xs font-bold ${status.toLowerCase().includes('open') || status.toLowerCase().includes('progress') ? 'text-amber-900' : status.toLowerCase().includes('complete') ? 'text-teal-900' : 'text-muted-foreground'}`}>{status}</span>; }

function NotificationsPage() { const notifications = useGetNotifications(); return <><PageHeading eyebrow="Updates" title="A calmer inbox." detail="Messages about your requests and circle, in one place." />{notifications.isLoading ? <LoadingBlock /> : notifications.isError ? <ErrorBlock onRetry={() => notifications.refetch()} /> : notifications.data?.length ? <div className="soft-card divide-y divide-border rounded-3xl">{notifications.data.map((item) => <article key={item.id} data-testid={`row-notification-${item.id}`} className={`flex gap-4 p-5 ${!item.read ? 'bg-secondary/30' : ''}`}><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">{item.kind === 'family' ? <UsersRound size={18} /> : item.kind === 'request' ? <LifeBuoy size={18} /> : <Bell size={18} />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><h2 className="font-bold">{item.title}</h2>{!item.read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />}</div><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p><time className="mt-3 block text-xs text-muted-foreground">{item.timeLabel}</time></div></article>)}</div> : <EmptyState icon={Bell} title="You are all caught up" detail="New updates will appear here." />}</>; }

function ProfilePage() {
  const profile = useGetProfile(); const update = useUpdateProfile(); const qc = useQueryClient(); const { notice, show } = useNotice(); const [editing, setEditing] = useState(false); const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const data = profile.data;
  const start = () => { if (data) { setName(data.name); setPhone(data.phone ?? ''); setEditing(true); } };
  const save = (event: FormEvent) => { event.preventDefault(); update.mutate({ data: { name, phone: phone || null, accessibilityLargeText: data?.accessibilityLargeText, reducedMotion: data?.reducedMotion } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetProfileQueryKey() }); setEditing(false); show('success', 'Profile saved.'); }, onError: () => show('error', 'Your profile did not save.') }); };
  if (profile.isLoading) return <LoadingBlock />; if (profile.isError || !data) return <ErrorBlock onRetry={() => profile.refetch()} />;
  return <><PageHeading eyebrow="Profile" title="Your settings, your pace." detail="Keep your details current and choose the experience that feels most comfortable." action={<Button variant="secondary" data-testid="button-edit-profile" onClick={start}>Edit profile</Button>} /><div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><section className="soft-card rounded-3xl p-7"><div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-xl font-bold text-primary">{data.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><h2 data-testid="text-profile-name" className="serif mt-5 text-3xl">{data.name}</h2><p className="mt-1 text-muted-foreground">{data.email}</p><p className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">{data.role}</p><div className="mt-8 space-y-3 border-t border-border pt-5 text-sm"><p className="flex justify-between gap-4"><span className="text-muted-foreground">Phone</span><span className="font-semibold">{data.phone || 'Not added'}</span></p><p className="flex justify-between gap-4"><span className="text-muted-foreground">Large text</span><span className="font-semibold">{data.accessibilityLargeText ? 'On' : 'Off'}</span></p><p className="flex justify-between gap-4"><span className="text-muted-foreground">Reduced motion</span><span className="font-semibold">{data.reducedMotion ? 'On' : 'Off'}</span></p></div></section><section className="soft-card rounded-3xl p-7"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><SlidersHorizontal size={19} /></div><div><h2 className="text-lg font-bold">Accessibility</h2><p className="text-sm text-muted-foreground">Small changes can make AEGIS easier to use.</p></div></div><AccessibilityControls profile={data} show={show} /><Link href="/privacy" data-testid="link-profile-privacy" className="focus-ring mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Review privacy controls <ArrowRight size={15} /></Link></section></div>{editing && <Modal title="Edit your profile" onClose={() => setEditing(false)}><form onSubmit={save} className="mt-5 space-y-4"><Field label="Name" id="profile-name"><input required id="profile-name" data-testid="input-profile-name" className={inputClasses()} value={name} onChange={(event) => setName(event.target.value)} /></Field><Field label="Phone" id="profile-phone"><input id="profile-phone" data-testid="input-profile-phone" className={inputClasses()} value={phone} onChange={(event) => setPhone(event.target.value)} /></Field><div className="flex justify-end gap-3"><Button variant="secondary" type="button" data-testid="button-cancel-profile" onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" data-testid="button-save-profile" disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save profile'}</Button></div></form></Modal>}<NoticeBar notice={notice} /></>;
}

function AccessibilityControls({ profile, show }: { profile: { accessibilityLargeText: boolean; reducedMotion: boolean }; show: (kind: Notice['kind'], text: string) => void }) {
  const update = useUpdateProfile(); const qc = useQueryClient(); const toggle = (key: 'accessibilityLargeText' | 'reducedMotion', value: boolean) => update.mutate({ data: { [key]: value } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetProfileQueryKey() }); show('success', 'Accessibility preference updated.'); }, onError: () => show('error', 'That preference did not save.') });
  return <div className="mt-6 space-y-3"><ToggleRow id="toggle-large-text" label="Larger text" detail="Increase text size throughout AEGIS." checked={profile.accessibilityLargeText} onChange={(value) => toggle('accessibilityLargeText', value)} /><ToggleRow id="toggle-reduced-motion" label="Reduced motion" detail="Use fewer transitions and movement." checked={profile.reducedMotion} onChange={(value) => toggle('reducedMotion', value)} /></div>;
}
function ToggleRow({ id, label, detail, checked, onChange }: { id: string; label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) { return <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border p-4"><span><span className="block font-bold">{label}</span><span className="mt-1 block text-sm text-muted-foreground">{detail}</span></span><input id={id} data-testid={id} type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-[hsl(var(--primary))]" /></label>; }

function PrivacyPage() { const permissions = useGetPermissions(); const update = useUpdatePermission(); const qc = useQueryClient(); const { notice, show } = useNotice(); return <><PageHeading eyebrow="Privacy" title="Consent is the feature." detail="AEGIS only coordinates the support you choose. Review each permission and turn it off whenever you want." /><div className="mb-6 flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950"><ShieldCheck size={19} className="mt-0.5 shrink-0" /><p>Your choices are yours. Changing a permission updates what trusted people can see going forward.</p></div>{permissions.isLoading ? <LoadingBlock /> : permissions.isError ? <ErrorBlock onRetry={() => permissions.refetch()} /> : permissions.data?.length ? <div className="space-y-7">{Array.from(new Set(permissions.data.map((item) => item.category))).map((category) => <section key={category}><p className="eyebrow mb-3">{category}</p><div className="soft-card divide-y divide-border rounded-3xl">{permissions.data?.filter((item) => item.category === category).map((permission) => <div key={permission.id} data-testid={`row-permission-${permission.id}`} className="flex items-center justify-between gap-5 p-5"><div className="min-w-0"><h2 className="font-bold">{permission.subject}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{permission.description}</p></div><button data-testid={`toggle-permission-${permission.id}`} aria-pressed={permission.enabled} onClick={() => update.mutate({ id: permission.id, data: { enabled: !permission.enabled } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetPermissionsQueryKey() }); show('success', 'Privacy preference updated.'); }, onError: () => show('error', 'That preference did not save.') })} className={`focus-ring relative h-7 w-12 shrink-0 rounded-full transition ${permission.enabled ? 'bg-primary' : 'bg-muted'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${permission.enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>)}</div></section>)}</div> : <EmptyState icon={LockKeyhole} title="No permissions to review" detail="Your privacy choices will appear here when they are available." />}<NoticeBar notice={notice} /></>; }

function EmergencyPage() {
  const family = useGetFamily(); const create = useCreateEmergencyAlert(); const qc = useQueryClient(); const { notice, show } = useNotice(); const [message, setMessage] = useState(''); const [selected, setSelected] = useState<number[]>([]); const [sent, setSent] = useState(false);
  const toggle = (id: number) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const submit = () => { if (!message.trim() || !selected.length) return; create.mutate({ data: { message, contactIds: selected } }, { onSuccess: (alert) => { setSent(true); qc.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }); show('success', `${alert.notified.length || selected.length} trusted contact${(alert.notified.length || selected.length) === 1 ? '' : 's'} notified.`); }, onError: () => show('error', 'The alert did not send. Please try again.') }); };
  return <><PageHeading eyebrow="Emergency contacts" title="Reach your people quickly." detail="This sends a message to selected trusted contacts. It does not contact emergency services." /><div className="grid gap-6 lg:grid-cols-[1fr_.75fr]"><section className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8"><div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-900 text-red-50"><Zap size={21} /></div><div><h2 className="text-xl font-bold text-red-950">Notify trusted contacts</h2><p className="mt-1 text-sm leading-6 text-red-900/75">Choose who should receive your message. Use this when you need your support network to know quickly.</p></div></div>{sent ? <div data-testid="status-emergency-sent" className="mt-7 rounded-2xl border border-red-200 bg-card p-5"><CheckCircle2 className="text-primary" /><h3 className="mt-3 font-bold">Your message was sent</h3><p className="mt-1 text-sm text-muted-foreground">You can return to Today or keep this page open.</p><Button className="mt-5" variant="secondary" data-testid="button-send-another" onClick={() => { setSent(false); setMessage(''); setSelected([]); }}>Send another</Button></div> : <><div className="mt-7"><p className="mb-3 text-sm font-bold text-red-950">Select contacts</p>{family.isLoading ? <div className="h-20 animate-pulse rounded-2xl bg-red-100" /> : family.data?.length ? <div className="space-y-2">{family.data.map((person) => <label key={person.id} htmlFor={`emergency-${person.id}`} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-red-200 bg-card p-3"><input id={`emergency-${person.id}`} data-testid={`checkbox-emergency-${person.id}`} type="checkbox" checked={selected.includes(person.id)} onChange={() => toggle(person.id)} className="h-4 w-4 accent-red-900" /><span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{person.initials}</span><span><span className="block font-bold text-sm">{person.name}</span><span className="block text-xs text-muted-foreground">{person.relationship}</span></span></label>)}</div> : <p className="text-sm text-red-900">Add a trusted person first.</p>}</div><label htmlFor="emergency-message" className="mt-6 block text-sm font-bold text-red-950">Your message</label><textarea id="emergency-message" data-testid="textarea-emergency-message" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className="focus-ring mt-2 w-full rounded-2xl border border-red-200 bg-card p-3 text-sm" placeholder="For example, I need a call when you see this." /><Button variant="danger" data-testid="button-notify-contacts" onClick={submit} disabled={create.isPending || !message.trim() || !selected.length} className="mt-5 w-full">{create.isPending ? 'Sending alert…' : 'Notify selected contacts'}</Button></>}</section><section className="soft-card rounded-3xl p-6 sm:p-8"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><Phone size={19} /></div><h2 className="text-lg font-bold">Need emergency services?</h2></div><p className="mt-4 text-sm leading-7 text-muted-foreground">If there is immediate danger or someone needs urgent medical assistance, contact your local emergency service directly.</p><a href="tel:911" data-testid="link-call-emergency-services" className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-900 hover:bg-red-100"><Phone size={16} />Call emergency services</a><p className="mt-3 text-center text-xs text-muted-foreground">Your local emergency number may be different.</p></section></div><NoticeBar notice={notice} /></>; }

const publicPages: Record<string, { title: string; intro: string; sections: { heading: string; body: string }[] }> = {
  '/about': { title: 'A support concept, in demo form.', intro: 'AEGIS is a prototype exploring how everyday support coordination could work for adults, older adults, and the people they trust.', sections: [{ heading: 'Designed around dignity', body: 'The product concept puts the person at the center of support choices and aims to preserve independence.' }, { heading: 'What this demo does', body: 'It uses one shared fictional profile. Permission settings are illustrative only; the demo does not enforce access boundaries or send notifications.' }] },
  '/how-it-works': { title: 'Explore the prototype.', intro: 'Use the sample screens to explore possible check-in, contact, reminder, and request flows. This is not a live support service.', sections: [{ heading: 'Shared fictional records', body: 'All demo users see the same sample profile and saved records. Do not enter real personal, contact, health, or emergency information.' }, { heading: 'No external delivery', body: 'The demo records sample actions in the app. It does not place calls, send messages, or contact providers.' }, { heading: 'Health boundary', body: 'Health notes organize demo reminders only. They do not diagnose, prescribe, or replace care from a qualified professional.' }] },
  '/safety': { title: 'Clear about this demo.', intro: 'This prototype is not a medical device or an emergency response service, and it does not contact trusted people or local emergency services.', sections: [{ heading: 'For urgent situations', body: 'If there is immediate danger or someone needs urgent assistance, contact local emergency services directly. Do not wait for this demo.' }, { heading: 'For everyday support', body: 'Requests and alerts are saved only as shared sample records. No contact, provider, or emergency service is notified.' }] },
  '/accessibility': { title: 'A space that meets you there.', intro: 'Accessibility is part of making support feel usable and respectful. The demo includes text-size and reduced-motion settings.', sections: [{ heading: 'Make it easier to read', body: 'Turn on larger text from the profile settings. In this shared demo, the preference is shared with other demo users.' }, { heading: 'Make it quieter', body: 'Reduced motion lowers transitions for people who prefer a steadier experience. This demo preference is also shared.' }] },
  '/contact': { title: 'We are here to listen.', intro: 'Questions, feedback, and accessibility notes are welcome. This contact page is a template for the team to review before launch.', sections: [{ heading: 'Review placeholder', body: '[TEAM: Add the support email, response hours, and any preferred contact method here.]' }, { heading: 'For urgent help', body: 'Do not use this page for emergencies. Contact your local emergency services or a trusted person directly.' }] },
  '/privacy-policy': { title: 'Privacy policy', intro: 'Review placeholder: this page describes the privacy commitments AEGIS intends to make and must be reviewed by the appropriate legal and privacy teams.', sections: [{ heading: 'Review placeholder', body: '[LEGAL REVIEW: Add data collection, use, retention, access, deletion, and contact details.]' }, { heading: 'Production requirement', body: 'A production service must explain what is shared, with whom, and why. This prototype is not private: its fictional profile, settings, and records are shared.' }] },
  '/terms': { title: 'Terms of use', intro: 'Review placeholder: these terms require legal review before publication.', sections: [{ heading: 'Review placeholder', body: '[LEGAL REVIEW: Add acceptable use, account responsibilities, limitations, dispute terms, and governing law.]' }] },
  '/cookie-policy': { title: 'Cookie policy', intro: 'Review placeholder: explain which cookies or similar technologies the production service uses.', sections: [{ heading: 'Review placeholder', body: '[LEGAL REVIEW: Add cookie categories, purposes, retention, controls, and third-party details.]' }] },
};

function PublicHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);
  return (
    <>
      <header className="public-header flex items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-12">
        <Link href="/" data-testid="link-public-logo" className="focus-ring flex items-center gap-3">
          <span className="public-mark"><ShieldCheck size={19} aria-hidden="true" /></span>
          <span className="public-wordmark">AEGIS</span>
        </Link>
        <nav id="public-navigation" className={`public-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <Link href="/how-it-works" aria-current={location === '/how-it-works' ? 'page' : undefined} onClick={() => setMenuOpen(false)} data-testid="link-public-how">How it works</Link>
          <Link href="/safety" aria-current={location === '/safety' ? 'page' : undefined} onClick={() => setMenuOpen(false)} data-testid="link-public-safety">Safety</Link>
          <Link href="/about" aria-current={location === '/about' ? 'page' : undefined} onClick={() => setMenuOpen(false)} data-testid="link-public-about">About</Link>
        </nav>
        <button ref={menuButtonRef} type="button" className="public-nav-toggle focus-ring" aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
        <Link href="/today" data-testid="link-enter-app" className="focus-ring public-open-app">Open demo</Link>
      </header>
      <div className="public-demo-notice"><DemoNotice /></div>
    </>
  );
}

function LandingPage() {
  const imageUrl = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;
  const stories = [
    {
      image: 'aegis-garden-companionship.webp',
      alt: 'An older man and a caregiver tending flowers together in a garden.',
      index: '02 / EVERYDAY HELP',
      caption: 'Help with a task. Keep the rest of the day your own.',
      layout: 'photo-story-garden',
    },
    {
      image: 'aegis-transition-support.png',
      alt: 'An older woman outdoors with a caregiver beside her.',
      index: '03 / A CHANGE IN ROUTINE',
      caption: 'Plan the next step with someone you trust.',
      layout: 'photo-story-transition',
    },
    {
      image: 'aegis-home-health-check.jpg',
      alt: 'A care professional checking an older woman’s blood pressure at home.',
      index: '04 / PERSONAL NOTES',
      caption: 'Keep the details you choose in one place.',
      layout: 'photo-story-check',
    },
    {
      image: 'aegis-medication-planning.webp',
      alt: 'An older man and a younger caregiver reviewing medication together at a table.',
      index: '05 / DAILY ROUTINES',
      caption: 'Organize reminders. Decide what stays private.',
      layout: 'photo-story-routine',
    },
  ];

  return (
    <div className="aegis-public min-h-[100dvh] bg-background">
      <PublicHeader />
      <main id="main-content">
        <section className="editorial-hero" aria-labelledby="landing-title">
          <div className="editorial-hero-copy">
            <p className="eyebrow">AEGIS / SUPPORT COORDINATION DEMO</p>
            <h1 id="landing-title">Stay close.<span>Without hovering.</span></h1>
            <p className="editorial-hero-lede">
              AEGIS is being designed to help people coordinate check-ins, practical requests, and reminders. This prototype uses shared fictional data and does not send notifications.
            </p>
            <div className="editorial-actions">
              <Link href="/today" data-testid="link-landing-start" className="focus-ring editorial-button editorial-button-primary">
                Explore the shared demo <ArrowRight size={17} />
              </Link>
              <Link href="/how-it-works" data-testid="link-landing-learn" className="focus-ring editorial-button editorial-button-secondary">
                See how it works
              </Link>
            </div>
            <p className="editorial-consent"><Info size={16} aria-hidden="true" /> Demo only · privacy settings are examples, not access controls.</p>
          </div>
          <figure className="editorial-hero-figure">
            <img
              className="editorial-hero-photo"
              src={imageUrl('aegis-support-conversation.jpg')}
              alt="An older woman and her companion talking together in a bright room."
              fetchPriority="high"
            />
            <figcaption className="photo-caption">
              <span>01 / SUPPORT BY CONSENT</span>
              <span>Support that leaves room to live.</span>
            </figcaption>
          </figure>
        </section>

        <section className="principles-band" aria-label="How AEGIS approaches support">
          <div className="principles-grid">
            <article className="principle">
              <span className="principle-index">01</span>
              <div><h2>Consent first</h2><p>The product is designed to make sharing choices visible.</p></div>
            </article>
            <article className="principle">
              <span className="principle-index">02</span>
              <div><h2>Useful by design</h2><p>Keep everyday details clear and in one place.</p></div>
            </article>
            <article className="principle">
              <span className="principle-index">03</span>
              <div><h2>Independence matters</h2><p>Support should help, not ask you to prove anything.</p></div>
            </article>
          </div>
        </section>

        <section aria-labelledby="moments-title">
          <div className="story-intro">
            <div>
              <p className="eyebrow">Support in the details</p>
              <h2 id="moments-title">A real day is not a dashboard.</h2>
            </div>
            <p>
              Good support is practical. It can be a ride, a reminder, or a conversation. This prototype demonstrates sample coordination flows, not a live support service. <span className="photo-disclaimer">Illustrative photography; people pictured are not represented as AEGIS users.</span>
            </p>
          </div>
          <div className="photo-essay">
            {stories.map((story) => (
              <figure className={`photo-story ${story.layout}`} key={story.image}>
                <img src={imageUrl(story.image)} alt={story.alt} loading="lazy" />
                <figcaption><span>{story.index}</span><strong>{story.caption}</strong></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="editorial-explainer" aria-labelledby="consent-title">
          <div>
            <p className="eyebrow">You stay in control</p>
            <h2 id="consent-title">Support is not surveillance.</h2>
          </div>
          <div className="explainer-copy">
            <p>AEGIS is designed to make sharing choices visible. The demo does not enforce permissions; all records remain shared with demo users.</p>
            <p>Health notes organize demo reminders. They do not diagnose, prescribe, or replace care from a qualified professional.</p>
            <Link href="/safety" data-testid="link-landing-safety" className="focus-ring explainer-link">
              Read the safety boundaries <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <aside className="safety-note" aria-label="Emergency limitations">
          <strong>For urgent danger, contact local emergency services directly.</strong>
          <span>This demo does not notify contacts or emergency services.</span>
        </aside>
      </main>
      <PublicFooter />
    </div>
  );
}

function PublicPage({ page }: { page: (typeof publicPages)[string] }) {
  return (
    <div className="aegis-public min-h-[100dvh] bg-background">
      <a href="#main-content" className="skip-link focus-ring">Skip to main content</a>
      <PublicHeader />
      <main id="main-content" className="public-page">
        <p className="eyebrow">AEGIS / trust & clarity</p>
        <h1>{page.title}</h1>
        <p className="page-intro">{page.intro}</p>
        <div>
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div>
          <div className="public-wordmark">AEGIS</div>
          <p className="public-footer-about">A consent-first support layer for independent living.</p>
        </div>
        <nav className="public-footer-links" aria-label="Footer navigation">
          <Link href="/about" data-testid="link-footer-about">About</Link>
          <Link href="/accessibility" data-testid="link-footer-accessibility">Accessibility</Link>
          <Link href="/contact" data-testid="link-footer-contact">Contact</Link>
          <Link href="/privacy-policy" data-testid="link-footer-privacy">Privacy policy</Link>
          <Link href="/terms" data-testid="link-footer-terms">Terms</Link>
          <Link href="/cookie-policy" data-testid="link-footer-cookies">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}

function Router() { const [location] = useLocation(); return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={LandingPage} />{navItems.map(({ href, label }) => <Route key={href} path={href}>{() => <AppShell>{href === '/today' ? <TodayPage /> : href === '/family' ? <FamilyPage /> : href === '/help' ? <HelpPage /> : href === '/health' ? <HealthPage /> : <ServicesPage />}</AppShell>}</Route>)}<Route path="/notifications">{() => <AppShell><NotificationsPage /></AppShell>}</Route><Route path="/profile">{() => <AppShell><ProfilePage /></AppShell>}</Route><Route path="/privacy">{() => <AppShell><PrivacyPage /></AppShell>}</Route><Route path="/emergency">{() => <AppShell><EmergencyPage /></AppShell>}</Route>{Object.entries(publicPages).map(([path, page]) => <Route key={path} path={path}>{() => <PublicPage page={page} />}</Route>)}<Route component={NotFound} /></Switch></ErrorBoundary>; }

function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }

export default App;