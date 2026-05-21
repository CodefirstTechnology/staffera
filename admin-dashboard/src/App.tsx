import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Award,
  ShieldCheck,
  DollarSign,
  Calendar,
  MapPin,
  Search,
  ChevronRight,
  Bell,
  Clock,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  partnerName: string | null;
  serviceTitle: string;
  address: string;
  finalAmount: number;
  scheduledTime: string;
  bookingStatus: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  specialInstructions?: string;
}

interface Partner {
  id: string;
  fullname: string;
  mobile: string;
  serviceCategory: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rating: number;
  completedJobs: number;
}

export default function App() {
  // State management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'partners' | 'financials'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Time stamp sync
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Seed Data: Bookings
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'bk-501',
      customerName: 'Maya Sen',
      partnerName: 'Alex Green',
      serviceTitle: 'Full House Deep Cleaning',
      address: 'Perry Road, Bandra West, Mumbai',
      finalAmount: 2450,
      scheduledTime: 'May 21, 2026, 04:00 PM',
      bookingStatus: 'ACCEPTED',
      specialInstructions: 'Focus extra on the living room upholstery'
    },
    {
      id: 'bk-502',
      customerName: 'Kabir Mehta',
      partnerName: null,
      serviceTitle: 'Bathroom Disinfection Pack',
      address: 'Altamount Road, South Mumbai, Mumbai',
      finalAmount: 950,
      scheduledTime: 'May 21, 2026, 06:00 PM',
      bookingStatus: 'PENDING',
      specialInstructions: 'No chemical smells if possible'
    },
    {
      id: 'bk-503',
      customerName: 'Priya Anand',
      partnerName: 'Sunita Rao',
      serviceTitle: 'Kitchen Deep Degreasing',
      address: 'Hiranandani Gardens, Powai, Mumbai',
      finalAmount: 1800,
      scheduledTime: 'May 21, 2026, 02:00 PM',
      bookingStatus: 'IN_PROGRESS'
    },
    {
      id: 'bk-504',
      customerName: 'Rohan Joshi',
      partnerName: 'Vikram Singh',
      serviceTitle: 'AC Deep Service',
      address: 'Lokhandwala, Andheri West, Mumbai',
      finalAmount: 1200,
      scheduledTime: 'May 20, 2026, 11:00 AM',
      bookingStatus: 'COMPLETED'
    }
  ]);

  // Seed Data: Partners
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: 'pr-801',
      fullname: 'Alex Green',
      mobile: '+91 98765 43210',
      serviceCategory: 'Deep Cleaning',
      kycStatus: 'VERIFIED',
      rating: 4.9,
      completedJobs: 124
    },
    {
      id: 'pr-802',
      fullname: 'Sunita Rao',
      mobile: '+91 98765 11223',
      serviceCategory: 'Kitchen Specialist',
      kycStatus: 'VERIFIED',
      rating: 4.88,
      completedJobs: 98
    },
    {
      id: 'pr-803',
      fullname: 'Amit Patel',
      mobile: '+91 98765 99887',
      serviceCategory: 'Bathroom Cleaning',
      kycStatus: 'PENDING',
      rating: 0,
      completedJobs: 0
    },
    {
      id: 'pr-804',
      fullname: 'Kiran Kumar',
      mobile: '+91 98765 77665',
      serviceCategory: 'AC Mechanic',
      kycStatus: 'PENDING',
      rating: 0,
      completedJobs: 0
    }
  ]);

  // Ecosystem top-up ledger top metrics
  const totalRevenue = bookings
    .filter((b) => b.bookingStatus === 'COMPLETED' || b.bookingStatus === 'IN_PROGRESS' || b.bookingStatus === 'ACCEPTED')
    .reduce((sum, b) => sum + b.finalAmount, 0);

  const activeMatchesCount = bookings.filter((b) => b.bookingStatus !== 'COMPLETED' && b.bookingStatus !== 'CANCELLED').length;
  const verifiedPartnersCount = partners.filter((p) => p.kycStatus === 'VERIFIED').length;

  // Selected Booking for Active Match Simulators
  const [selectedSimId, setSelectedSimId] = useState<string>('bk-501');
  const selectedBooking = bookings.find((b) => b.id === selectedSimId);

  const handleStepStatus = (id: string) => {
    setBookings((prevBookings) =>
      prevBookings.map((b) => {
        if (b.id !== id) return b;
        
        const sequence: Booking['bookingStatus'][] = [
          'PENDING',
          'ACCEPTED',
          'EN_ROUTE',
          'ARRIVED',
          'IN_PROGRESS',
          'COMPLETED'
        ];
        const nextIdx = (sequence.indexOf(b.bookingStatus) + 1) % sequence.length;
        const nextStatus = sequence[nextIdx];

        return { ...b, bookingStatus: nextStatus };
      })
    );
  };

  const handlePartnerVerify = (id: string, approve: boolean) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, kycStatus: approve ? 'VERIFIED' : 'REJECTED' };
      })
    );
  };

  return (
    <div style={styles.appContainer}>
      {/* 1. Left Glassmorphic Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <TextGlow style={styles.logoTitle}>StaffEra</TextGlow>
          <span style={styles.logoSub}>ADMIN PANEL</span>
        </div>

        <nav style={styles.navMenu}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'dashboard' ? styles.navBtnActive : {})
            }}
          >
            <TrendingUp size={18} style={styles.navBtnIcon} />
            <span>Dashboard Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'bookings' ? styles.navBtnActive : {})
            }}
          >
            <Calendar size={18} style={styles.navBtnIcon} />
            <span>Bookings ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            style={{
              ...styles.navBtn,
              ...(activeTab === 'partners' ? styles.navBtnActive : {})
            }}
          >
            <Users size={18} style={styles.navBtnIcon} />
            <span>Staff Partners</span>
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.clockSection}>
            <Clock size={14} style={{ marginRight: 6, color: 'var(--text-secondary)' }} />
            <span style={styles.clockText}>{systemTime}</span>
          </div>
          <span style={styles.footerVersion}>v1.0.4 Premium</span>
        </div>
      </aside>

      {/* 2. Main Executive Content Deck */}
      <main style={styles.mainContent}>
        {/* Top Control App Bar */}
        <header style={styles.topBar}>
          <div style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>Ecosystem Registry</h1>
            <p style={styles.welcomeSub}>Real-time metrics, staffing coordinate streams, and transactions audits.</p>
          </div>

          <div style={styles.topActions}>
            <div style={styles.badgeGlow}>
              <span style={styles.glowingDot} />
              <span style={styles.badgeGlowText}>SYS ACTIVE</span>
            </div>
            <div style={styles.adminAvatar}>
              <span>AD</span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div style={styles.tabContent}>
            {/* Top Row Grid Metrics */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard} className="glass-panel">
                <div style={styles.cardHeaderRow}>
                  <TextGlow style={styles.metricValue}>₹{totalRevenue.toLocaleString()}</TextGlow>
                  <div style={styles.metricIconWrap}><DollarSign size={20} color="var(--accent)" /></div>
                </div>
                <TextGlow style={styles.metricLabel}>Gross Ecosystem Revenue</TextGlow>
                <span style={styles.metricTrend}>↑ 18% vs last week</span>
              </div>

              <div style={styles.metricCard} className="glass-panel">
                <div style={styles.cardHeaderRow}>
                  <TextGlow style={styles.metricValue}>{activeMatchesCount}</TextGlow>
                  <div style={styles.metricIconWrap}><Clock size={20} color="#f59e0b" /></div>
                </div>
                <TextGlow style={styles.metricLabel}>Active Matchings</TextGlow>
                <span style={styles.metricTrend}>All client tracking online</span>
              </div>

              <div style={styles.metricCard} className="glass-panel">
                <div style={styles.cardHeaderRow}>
                  <TextGlow style={styles.metricValue}>{verifiedPartnersCount}</TextGlow>
                  <div style={styles.metricIconWrap}><ShieldCheck size={20} color="#10b981" /></div>
                </div>
                <TextGlow style={styles.metricLabel}>Verified Staff Pros</TextGlow>
                <span style={styles.metricTrend}>Background checked</span>
              </div>

              <div style={styles.metricCard} className="glass-panel">
                <div style={styles.cardHeaderRow}>
                  <TextGlow style={styles.metricValue}>88</TextGlow>
                  <div style={styles.metricIconWrap}><Award size={20} color="#a5b4fc" /></div>
                </div>
                <TextGlow style={styles.metricLabel}>Gold Memberships</TextGlow>
                <span style={styles.metricTrend}>10% extra discount active</span>
              </div>
            </div>

            {/* Middle Row: Simulators + Graphs Charts */}
            <div style={styles.midRowGrid}>
              {/* Left Column: Coordinates / GPS Simulator Dashboard */}
              <div style={styles.simCard} className="glass-panel">
                <div style={styles.simCardHeader}>
                  <div>
                    <h2 style={styles.simTitle}>📡 WebSocket GPS Dispatch Simulator</h2>
                    <p style={styles.simSub}>Step booking status to stream mock location coordinate feeds instantly.</p>
                  </div>
                  <RefreshCw
                    size={16}
                    style={styles.refreshIcon}
                    onClick={() => setBookings([...bookings])}
                  />
                </div>

                <div style={styles.simSelectorRow}>
                  <label style={styles.simSelectLabel}>Select Booking to Simulate:</label>
                  <select
                    value={selectedSimId}
                    onChange={(e) => setSelectedSimId(e.target.value)}
                    style={styles.simSelect}
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id.toUpperCase()} ({b.customerName} - {b.serviceTitle.slice(0, 15)}...)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBooking ? (
                  <div style={styles.simBody}>
                    <div style={styles.simInfoGrid}>
                      <div style={styles.simInfoCol}>
                        <span style={styles.simFieldLabel}>CLIENT TARGET</span>
                        <span style={styles.simFieldValue}>{selectedBooking.customerName}</span>
                      </div>
                      <div style={styles.simInfoCol}>
                        <span style={styles.simFieldLabel}>PRO WORKER ASSIGNED</span>
                        <span style={styles.simFieldValue}>{selectedBooking.partnerName || 'WAITING MATCH'}</span>
                      </div>
                      <div style={styles.simInfoCol}>
                        <span style={styles.simFieldLabel}>PAYOUT</span>
                        <span style={styles.simFieldValue}>₹{selectedBooking.finalAmount}</span>
                      </div>
                      <div style={styles.simInfoCol}>
                        <span style={styles.simFieldLabel}>BOOKING STATUS</span>
                        <span style={{
                          ...styles.simFieldValue,
                          color: selectedBooking.bookingStatus === 'COMPLETED' ? 'var(--accent)' : '#f59e0b'
                        }}>{selectedBooking.bookingStatus}</span>
                      </div>
                    </div>

                    {/* Styled custom CSS navigation road graph track */}
                    <div style={styles.roadTrackContainer}>
                      <span style={styles.roadLabel}>Navigator GPS Track (Bandra West)</span>
                      <div style={styles.roadTrackLine}>
                        <div
                          style={{
                            ...styles.roadTrackProgress,
                            width:
                              selectedBooking.bookingStatus === 'PENDING' ? '0%' :
                              selectedBooking.bookingStatus === 'ACCEPTED' ? '20%' :
                              selectedBooking.bookingStatus === 'EN_ROUTE' ? '50%' :
                              selectedBooking.bookingStatus === 'ARRIVED' ? '75%' :
                              selectedBooking.bookingStatus === 'IN_PROGRESS' ? '90%' : '100%'
                          }}
                        />
                        <div
                          style={{
                            ...styles.carDot,
                            left:
                              selectedBooking.bookingStatus === 'PENDING' ? '0%' :
                              selectedBooking.bookingStatus === 'ACCEPTED' ? '20%' :
                              selectedBooking.bookingStatus === 'EN_ROUTE' ? '50%' :
                              selectedBooking.bookingStatus === 'ARRIVED' ? '75%' :
                              selectedBooking.bookingStatus === 'IN_PROGRESS' ? '90%' : '96%'
                          }}
                        >
                          🚗
                        </div>
                        <div style={styles.homeFlag}>🏠</div>
                      </div>

                      <div style={styles.roadLabelsRow}>
                        <span style={styles.roadDotLabel}>Accepted</span>
                        <span style={styles.roadDotLabel}>En Route</span>
                        <span style={styles.roadDotLabel}>Arrived</span>
                        <span style={styles.roadDotLabel}>Completed</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStepStatus(selectedBooking.id)}
                      style={styles.simStepBtn}
                    >
                      Step Booking Status Status (Emit Socket) ➔
                    </button>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No active booking selected for GPS simulation.</p>
                )}
              </div>

              {/* Right Column: Weekly Revenue SVG Chart */}
              <div style={styles.revenueCard} className="glass-panel">
                <h2 style={styles.chartTitle}>📊 Weekly Revenue Performance</h2>
                <p style={styles.chartDesc}>Aggregated gross booking payouts per day.</p>

                <div style={styles.svgContainer}>
                  {/* Beautiful pure React SVG line graph */}
                  <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 20 120 Q 80 80 140 95 T 260 40 T 380 30"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="3"
                    />
                    <path
                      d="M 20 120 Q 80 80 140 95 T 260 40 T 380 30 L 380 140 L 20 140 Z"
                      fill="url(#gradient)"
                    />
                    {/* Dots representing coordinates points */}
                    <circle cx="20" cy="120" r="4" fill="var(--accent)" />
                    <circle cx="140" cy="95" r="4" fill="var(--accent)" />
                    <circle cx="260" cy="40" r="4" fill="var(--accent)" />
                    <circle cx="380" cy="30" r="4" fill="var(--accent)" />
                  </svg>

                  <div style={styles.daysLabelsRow}>
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row Table: Verified KYC Registries */}
            <div style={styles.partnersTableSection} className="glass-panel">
              <div style={styles.tableHeaderRow}>
                <h2 style={styles.tableHeading}>📋 Pro Service Partners KYC Registry</h2>
                <span style={styles.tableSubBadge}>{partners.filter((p) => p.kycStatus === 'PENDING').length} Pending checks</span>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>FULL NAME</th>
                    <th style={styles.th}>CATEGORY</th>
                    <th style={styles.th}>PHONE NUMBER</th>
                    <th style={styles.th}>KYC STATUS</th>
                    <th style={styles.th}>RATING</th>
                    <th style={styles.th}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} style={styles.trRow}>
                      <td style={styles.td}>
                        <span style={styles.partnerTextName}>{p.fullname}</span>
                      </td>
                      <td style={styles.td}>{p.serviceCategory}</td>
                      <td style={styles.td}>{p.mobile}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusTableBadge,
                            ...(p.kycStatus === 'VERIFIED' ? styles.badgeVerified : styles.badgeKycPending)
                          }}
                        >
                          {p.kycStatus}
                        </span>
                      </td>
                      <td style={styles.td}>⭐ {p.rating > 0 ? p.rating.toFixed(2) : 'New'}</td>
                      <td style={styles.td}>
                        {p.kycStatus === 'PENDING' ? (
                          <div style={styles.tableActionGroup}>
                            <button
                              onClick={() => handlePartnerVerify(p.id, true)}
                              style={styles.verifyApproveBtn}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handlePartnerVerify(p.id, false)}
                              style={styles.verifyRejectBtn}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={styles.actionClearedText}>Cleared Check ✅</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div style={styles.tabContent} className="glass-panel" style={{ padding: 24, marginTop: 20 }}>
            <div style={styles.tableFiltersHeader}>
              <h2 style={styles.tableHeading}>Ecosystem Bookings Roster</h2>
              <div style={styles.filterBar}>
                {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{
                      ...styles.filterTabBtn,
                      ...(statusFilter === status ? styles.filterTabBtnActive : {})
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>CLIENT</th>
                  <th style={styles.th}>SERVICE REQUIRED</th>
                  <th style={styles.th}>SCHEDULED</th>
                  <th style={styles.th}>PAYOUT</th>
                  <th style={styles.th}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {bookings
                  .filter((b) => statusFilter === 'ALL' || b.bookingStatus === statusFilter)
                  .map((b) => (
                    <tr key={b.id} style={styles.trRow}>
                      <td style={styles.td}>{b.id.toUpperCase()}</td>
                      <td style={styles.td}>{b.customerName}</td>
                      <td style={styles.td}>{b.serviceTitle}</td>
                      <td style={styles.td}>{b.scheduledTime}</td>
                      <td style={styles.td}>₹{b.finalAmount}</td>
                      <td style={styles.td}>
                        <span style={styles.statusTableBadge}>{b.bookingStatus}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'partners' && (
          <div style={styles.tabContent} className="glass-panel" style={{ padding: 24, marginTop: 20 }}>
            <h2 style={styles.tableHeading}>Ecosystem Professionals Directory</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Detailed ledger profiling registered providers.</p>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>FULL NAME</th>
                  <th style={styles.th}>CATEGORY</th>
                  <th style={styles.th}>COMPLETED TASKS</th>
                  <th style={styles.th}>RATING</th>
                  <th style={styles.th}>KYC CHECK</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} style={styles.trRow}>
                    <td style={styles.td}>{p.id.toUpperCase()}</td>
                    <td style={styles.td}>{p.fullname}</td>
                    <td style={styles.td}>{p.serviceCategory}</td>
                    <td style={styles.td}>{p.completedJobs} Jobs</td>
                    <td style={styles.td}>⭐ {p.rating > 0 ? p.rating : 'N/A'}</td>
                    <td style={styles.td}>{p.kycStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// React custom styled Typography Components
const TextGlow = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span style={{ ...style, fontFamily: 'Outfit, sans-serif' }}>{children}</span>
);

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-primary)',
    overflow: 'hidden'
  } as React.CSSProperties,
  sidebar: {
    width: '280px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-card)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexShrink: 0
  } as React.CSSProperties,
  logoSection: {
    marginBottom: '40px'
  } as React.CSSProperties,
  logoTitle: {
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #a5b4fc 0%, #f472b6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px'
  } as React.CSSProperties,
  logoSub: {
    display: 'block',
    fontSize: '10px',
    color: 'var(--text-muted)',
    letterSpacing: '1.5px',
    marginTop: '4px'
  } as React.CSSProperties,
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1
  } as React.CSSProperties,
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  } as React.CSSProperties,
  navBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    boxShadow: 'var(--shadow-glow)'
  } as React.CSSProperties,
  navBtnIcon: {
    marginRight: '12px',
    color: 'inherit'
  } as React.CSSProperties,
  sidebarFooter: {
    borderTop: '1px solid var(--border-card)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  } as React.CSSProperties,
  clockSection: {
    display: 'flex',
    alignItems: 'center'
  } as React.CSSProperties,
  clockText: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)'
  } as React.CSSProperties,
  footerVersion: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  } as React.CSSProperties,
  mainContent: {
    flexGrow: 1,
    padding: '40px',
    overflowY: 'auto',
    height: '100vh'
  } as React.CSSProperties,
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  } as React.CSSProperties,
  welcomeSection: {} as React.CSSProperties,
  welcomeTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff'
  } as React.CSSProperties,
  welcomeSub: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '4px'
  } as React.CSSProperties,
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  } as React.CSSProperties,
  badgeGlow: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  } as React.CSSProperties,
  glowingDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    marginRight: '8px',
    boxShadow: '0 0 8px #10b981'
  } as React.CSSProperties,
  badgeGlowText: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: '0.5px'
  } as React.CSSProperties,
  adminAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#fff',
    border: '1px solid var(--border-card)'
  } as React.CSSProperties,
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  } as React.CSSProperties,
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  } as React.CSSProperties,
  metricCard: {
    padding: '24px'
  } as React.CSSProperties,
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  } as React.CSSProperties,
  metricValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff'
  } as React.CSSProperties,
  metricIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as React.CSSProperties,
  metricLabel: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginBottom: '6px'
  } as React.CSSProperties,
  metricTrend: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  } as React.CSSProperties,
  midRowGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '24px',
    alignItems: 'start'
  } as React.CSSProperties,
  simCard: {
    padding: '24px'
  } as React.CSSProperties,
  simCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  } as React.CSSProperties,
  simTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff'
  } as React.CSSProperties,
  simSub: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px'
  } as React.CSSProperties,
  refreshIcon: {
    color: 'var(--text-muted)',
    cursor: 'pointer'
  } as React.CSSProperties,
  simSelectorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-card)',
    paddingBottom: '16px'
  } as React.CSSProperties,
  simSelectLabel: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  } as React.CSSProperties,
  simSelect: {
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-card)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '13px',
    cursor: 'pointer'
  } as React.CSSProperties,
  simBody: {},
  simInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  } as React.CSSProperties,
  simInfoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  } as React.CSSProperties,
  simFieldLabel: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: 'var(--text-muted)',
    letterSpacing: '1px'
  } as React.CSSProperties,
  simFieldValue: {
    fontSize: '13px',
    fontWeight: '600'
  } as React.CSSProperties,
  roadTrackContainer: {
    backgroundColor: 'var(--bg-sidebar)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--border-card)',
    marginBottom: '24px'
  } as React.CSSProperties,
  roadLabel: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    textAlign: 'center'
  } as React.CSSProperties,
  roadTrackLine: {
    position: 'relative',
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    marginBottom: '28px',
    marginHorizontal: '16px'
  } as React.CSSProperties,
  roadTrackProgress: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '3px',
    transition: 'width 0.6s ease'
  } as React.CSSProperties,
  carDot: {
    position: 'absolute',
    top: '-10px',
    fontSize: '18px',
    transform: 'translateX(-50%)',
    transition: 'left 0.6s ease'
  } as React.CSSProperties,
  homeFlag: {
    position: 'absolute',
    right: '-8px',
    top: '-9px',
    fontSize: '16px'
  } as React.CSSProperties,
  roadLabelsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingHorizontal: '8px'
  } as React.CSSProperties,
  roadDotLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '500'
  } as React.CSSProperties,
  simStepBtn: {
    width: '100%',
    height: '46px',
    backgroundColor: 'var(--accent)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  } as React.CSSProperties,
  revenueCard: {
    padding: '24px',
    height: '100%'
  } as React.CSSProperties,
  chartTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff'
  } as React.CSSProperties,
  chartDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
    marginBottom: '24px'
  } as React.CSSProperties,
  svgContainer: {
    backgroundColor: 'var(--bg-sidebar)',
    borderRadius: '16px',
    border: '1px solid var(--border-card)',
    padding: '16px 8px 8px'
  } as React.CSSProperties,
  daysLabelsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingHorizontal: '16px',
    marginTop: '12px',
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '500'
  } as React.CSSProperties,
  partnersTableSection: {
    padding: '24px'
  } as React.CSSProperties,
  tableHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  } as React.CSSProperties,
  tableHeading: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff'
  } as React.CSSProperties,
  tableSubBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: '4px 10px',
    borderRadius: '20px',
    border: '1px solid rgba(245, 158, 11, 0.2)'
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  } as React.CSSProperties,
  thRow: {
    borderBottom: '1px solid var(--border-card)'
  } as React.CSSProperties,
  th: {
    padding: '12px 16px',
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'var(--text-muted)',
    letterSpacing: '1px'
  } as React.CSSProperties,
  trRow: {
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    transition: 'background 0.2s'
  } as React.CSSProperties,
  td: {
    padding: '16px',
    fontSize: '13px',
    color: 'var(--text-primary)'
  } as React.CSSProperties,
  partnerTextName: {
    fontWeight: '600',
    color: '#fff'
  } as React.CSSProperties,
  statusTableBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.05)'
  } as React.CSSProperties,
  badgeVerified: {
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)'
  } as React.CSSProperties,
  badgeKycPending: {
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.15)'
  } as React.CSSProperties,
  tableActionGroup: {
    display: 'flex',
    gap: '8px'
  } as React.CSSProperties,
  verifyApproveBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '11px'
  } as React.CSSProperties,
  verifyRejectBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '11px'
  } as React.CSSProperties,
  actionClearedText: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  } as React.CSSProperties,
  tableFiltersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-card)',
    paddingBottom: '16px'
  } as React.CSSProperties,
  filterBar: {
    display: 'flex',
    gap: '6px'
  } as React.CSSProperties,
  filterTabBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  } as React.CSSProperties,
  filterTabBtnActive: {
    backgroundColor: 'var(--accent)',
    color: '#fff'
  } as React.CSSProperties,
};
