import { fileURLToPath } from 'url'

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000'
const DEMO_PASSWORD = 'Sanju@03'

// 1. Target Users: 4 Project Managers + 12 Members = 16 Users
const DEMO_USERS = [
  // Project Managers
  { name: 'Steve Rogers', email: 'steve.rogers@demo.projectpulse.local', role: 'PROJECT_MANAGER' },
  { name: 'Tony Stark', email: 'tony.stark@demo.projectpulse.local', role: 'PROJECT_MANAGER' },
  { name: 'Nick Fury', email: 'nick.fury@demo.projectpulse.local', role: 'PROJECT_MANAGER' },
  { name: 'Erwin Smith', email: 'erwin.smith@demo.projectpulse.local', role: 'PROJECT_MANAGER' },

  // Members
  { name: 'Clint Barton', email: 'clint.barton@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Wanda Maximoff', email: 'wanda.maximoff@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Peter Parker', email: 'peter.parker@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Jon Snow', email: 'jon.snow@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Steve Harrington', email: 'steve.harrington@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'William Byers', email: 'william.byers@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Jane Hopper', email: 'jane.hopper@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Dustin Henderson', email: 'dustin.henderson@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Arjun Reddy', email: 'arjun.reddy@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Mike Wheeler', email: 'mike.wheeler@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Lucas Sinclair', email: 'lucas.sinclair@demo.projectpulse.local', role: 'MEMBER' },
  { name: 'Harry Potter', email: 'harry.potter@demo.projectpulse.local', role: 'MEMBER' },
]

// 2. Target Projects: 10 Projects across 4 PMs
const DEMO_PROJECTS = [
  // PM: Steve Rogers
  {
    name: 'Campus Connect',
    description: 'A centralized social and academic community portal connecting university students, clubs, and campus events.',
    managerEmail: 'steve.rogers@demo.projectpulse.local',
    memberEmails: [
      'clint.barton@demo.projectpulse.local',
      'wanda.maximoff@demo.projectpulse.local',
      'peter.parker@demo.projectpulse.local',
      'dustin.henderson@demo.projectpulse.local',
    ],
    status: 'ACTIVE',
    startDate: '2026-01-10T09:00:00.000Z',
    deadline: '2026-05-30T18:00:00.000Z',
  },
  {
    name: 'Smart Placement Portal',
    description: 'Automated campus recruitment management system streamlining job postings, applications, interviews, and offer tracking.',
    managerEmail: 'steve.rogers@demo.projectpulse.local',
    memberEmails: [
      'peter.parker@demo.projectpulse.local',
      'jane.hopper@demo.projectpulse.local',
      'mike.wheeler@demo.projectpulse.local',
    ],
    status: 'ACTIVE',
    startDate: '2026-02-01T09:00:00.000Z',
    deadline: '2026-07-15T18:00:00.000Z',
  },
  {
    name: 'Expense Tracker',
    description: 'Corporate budget tracking application featuring automated multi-currency receipts scanning, categorization, and audit reporting.',
    managerEmail: 'steve.rogers@demo.projectpulse.local',
    memberEmails: [
      'clint.barton@demo.projectpulse.local',
      'arjun.reddy@demo.projectpulse.local',
      'lucas.sinclair@demo.projectpulse.local',
    ],
    status: 'COMPLETED',
    startDate: '2025-10-01T09:00:00.000Z',
    deadline: '2026-02-28T18:00:00.000Z',
  },

  // PM: Tony Stark
  {
    name: 'Team Collaboration Platform',
    description: 'Next-generation workplace communication suite with real-time markdown document editing, channels, and video sync.',
    managerEmail: 'tony.stark@demo.projectpulse.local',
    memberEmails: [
      'peter.parker@demo.projectpulse.local',
      'wanda.maximoff@demo.projectpulse.local',
      'harry.potter@demo.projectpulse.local',
      'jon.snow@demo.projectpulse.local',
    ],
    status: 'ACTIVE',
    startDate: '2026-01-15T09:00:00.000Z',
    deadline: '2026-08-01T18:00:00.000Z',
  },
  {
    name: 'Study Space Finder',
    description: 'IoT-enabled seat availability and ambient noise monitoring app helping campus students find vacant study desks.',
    managerEmail: 'tony.stark@demo.projectpulse.local',
    memberEmails: [
      'steve.harrington@demo.projectpulse.local',
      'william.byers@demo.projectpulse.local',
      'dustin.henderson@demo.projectpulse.local',
    ],
    status: 'PLANNED',
    startDate: '2026-04-01T09:00:00.000Z',
    deadline: '2026-09-30T18:00:00.000Z',
  },
  {
    name: 'AI Resume Analyzer',
    description: 'Intelligent candidate screening service using NLP heuristics to extract skills, evaluate job fit, and score resumes against ATS.',
    managerEmail: 'tony.stark@demo.projectpulse.local',
    memberEmails: [
      'harry.potter@demo.projectpulse.local',
      'arjun.reddy@demo.projectpulse.local',
      'jane.hopper@demo.projectpulse.local',
    ],
    status: 'ACTIVE',
    startDate: '2026-02-15T09:00:00.000Z',
    deadline: '2026-06-20T18:00:00.000Z',
  },

  // PM: Nick Fury
  {
    name: 'Event Management System',
    description: 'End-to-end ticketing, seating chart orchestration, and QR gate validation platform for large stadium and tech conferences.',
    managerEmail: 'nick.fury@demo.projectpulse.local',
    memberEmails: [
      'clint.barton@demo.projectpulse.local',
      'steve.harrington@demo.projectpulse.local',
      'mike.wheeler@demo.projectpulse.local',
      'lucas.sinclair@demo.projectpulse.local',
    ],
    status: 'ACTIVE',
    startDate: '2026-01-05T09:00:00.000Z',
    deadline: '2026-05-15T18:00:00.000Z',
  },
  {
    name: 'E-Learning Platform',
    description: 'Interactive course management system with adaptive bitrate video streaming, real-time code sandboxes, and automated quizzes.',
    managerEmail: 'nick.fury@demo.projectpulse.local',
    memberEmails: [
      'jon.snow@demo.projectpulse.local',
      'william.byers@demo.projectpulse.local',
      'dustin.henderson@demo.projectpulse.local',
    ],
    status: 'COMPLETED',
    startDate: '2025-09-01T09:00:00.000Z',
    deadline: '2026-01-31T18:00:00.000Z',
  },

  // PM: Erwin Smith
  {
    name: 'Inventory Management System',
    description: 'Enterprise warehouse inventory management featuring barcode scanning, low-stock threshold triggers, and supplier reordering.',
    managerEmail: 'erwin.smith@demo.projectpulse.local',
    memberEmails: [
      'jon.snow@demo.projectpulse.local',
      'arjun.reddy@demo.projectpulse.local',
      'lucas.sinclair@demo.projectpulse.local',
      'william.byers@demo.projectpulse.local',
    ],
    status: 'ACTIVE',
    startDate: '2026-02-10T09:00:00.000Z',
    deadline: '2026-08-31T18:00:00.000Z',
  },
  {
    name: 'Digital Safety Platform',
    description: 'Cybersecurity training and threat reporting application with phishing simulation drill workflows and compliance reporting.',
    managerEmail: 'erwin.smith@demo.projectpulse.local',
    memberEmails: [
      'steve.harrington@demo.projectpulse.local',
      'jane.hopper@demo.projectpulse.local',
      'harry.potter@demo.projectpulse.local',
    ],
    status: 'PLANNED',
    startDate: '2026-05-01T09:00:00.000Z',
    deadline: '2026-11-30T18:00:00.000Z',
  },
]

// 3. Target Milestones: 10 Milestones
const DEMO_MILESTONES = [
  {
    projectName: 'Campus Connect',
    name: 'Alpha Architecture & Auth Module',
    description: 'Core schema design, JWT session authentication, and student profile verification.',
    dueDate: '2026-02-20T18:00:00.000Z',
    status: 'COMPLETED',
  },
  {
    projectName: 'Campus Connect',
    name: 'Beta Community Feed & Messaging',
    description: 'Campus announcement board, club discussions, and image sharing pipeline.',
    dueDate: '2026-04-15T18:00:00.000Z',
    status: 'IN_PROGRESS',
  },
  {
    projectName: 'Smart Placement Portal',
    name: 'Company Registration & Job Board',
    description: 'Employer onboarding portal, vacancy posting engine, and student eligibility filter.',
    dueDate: '2026-05-01T18:00:00.000Z',
    status: 'IN_PROGRESS',
  },
  {
    projectName: 'Expense Tracker',
    name: 'Multi-Currency & Export Release',
    description: 'Dynamic currency conversion rates, tax category summaries, and CSV/PDF export engine.',
    dueDate: '2026-02-15T18:00:00.000Z',
    status: 'COMPLETED',
  },
  {
    projectName: 'Team Collaboration Platform',
    name: 'Realtime WebSockets Integration',
    description: 'Persistent bi-directional WebSocket connection for instant chat and status sync.',
    dueDate: '2026-04-30T18:00:00.000Z',
    status: 'IN_PROGRESS',
  },
  {
    projectName: 'Team Collaboration Platform',
    name: 'File Sharing & Document Collaboration',
    description: 'Multi-user operational transformation document editing and asset management.',
    dueDate: '2026-06-15T18:00:00.000Z',
    status: 'PLANNED',
  },
  {
    projectName: 'AI Resume Analyzer',
    name: 'NLP Parsing & Scoring Engine v1',
    description: 'Tokenization, entity recognition for skills/education, and weighted match algorithm.',
    dueDate: '2026-04-10T18:00:00.000Z',
    status: 'IN_PROGRESS',
  },
  {
    projectName: 'Event Management System',
    name: 'Ticket Booking & QR Code Check-in',
    description: 'Payment gateway integration and high-speed offline-capable QR scanner.',
    dueDate: '2026-03-30T18:00:00.000Z',
    status: 'IN_PROGRESS',
  },
  {
    projectName: 'E-Learning Platform',
    name: 'LMS Core Video Streaming Release',
    description: 'Video transcoding, adaptive streaming CDN caching, and progress bookmarks.',
    dueDate: '2026-01-20T18:00:00.000Z',
    status: 'COMPLETED',
  },
  {
    projectName: 'Inventory Management System',
    name: 'Barcode Scanner & Stock Audit Release',
    description: 'Handheld scanner integration, audit reconciliation workflows, and alert notifications.',
    dueDate: '2026-07-01T18:00:00.000Z',
    status: 'PLANNED',
  },
]

// 4. Target Tasks: 28 Tasks across projects
const DEMO_TASKS = [
  // Project 1: Campus Connect (PM: Steve Rogers)
  {
    projectName: 'Campus Connect',
    title: 'Design responsive navigation bar & theme toggle',
    description: 'Implement dark/light mode toggle with Tailwind CSS and responsive mobile hamburger menu.',
    assignedEmail: 'clint.barton@demo.projectpulse.local',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    dueDate: '2026-02-10T18:00:00.000Z',
  },
  {
    projectName: 'Campus Connect',
    title: 'Implement campus feed REST endpoints',
    description: 'Build paginated feed API supporting posts, comment threads, and upvotes.',
    assignedEmail: 'wanda.maximoff@demo.projectpulse.local',
    status: 'COMPLETED',
    priority: 'HIGH',
    dueDate: '2026-02-25T18:00:00.000Z',
  },
  {
    projectName: 'Campus Connect',
    title: 'Build interactive campus map view',
    description: 'Vector-rendered campus building directory with search and GPS directions.',
    assignedEmail: 'peter.parker@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-04-20T18:00:00.000Z',
  },
  {
    projectName: 'Campus Connect',
    title: 'Add notification badge for unread club messages',
    description: 'Real-time badge indicator in navigation header reflecting unread messages counter.',
    assignedEmail: 'dustin.henderson@demo.projectpulse.local',
    status: 'TODO',
    priority: 'LOW',
    dueDate: '2026-05-10T18:00:00.000Z',
  },

  // Project 2: Smart Placement Portal (PM: Steve Rogers)
  {
    projectName: 'Smart Placement Portal',
    title: 'Setup resume upload and PDF parsing pipeline',
    description: 'Validate PDF file extensions, size limits, and extract metadata safely into storage.',
    assignedEmail: 'peter.parker@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-04-15T18:00:00.000Z',
  },
  {
    projectName: 'Smart Placement Portal',
    title: 'Develop recruiter dashboard for applicant reviews',
    description: 'Kanban view of applicants across Applied, Shortlisted, Interviewed, and Offered stages.',
    assignedEmail: 'jane.hopper@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-05-01T18:00:00.000Z',
  },
  {
    projectName: 'Smart Placement Portal',
    title: 'Implement email alerts for scheduled interviews',
    description: 'Automated calendar invite and transactional email trigger when interview slot is booked.',
    assignedEmail: 'mike.wheeler@demo.projectpulse.local',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-05-20T18:00:00.000Z',
  },

  // Project 3: Expense Tracker (PM: Steve Rogers)
  {
    projectName: 'Expense Tracker',
    title: 'Implement receipt scanning OCR service',
    description: 'Extract total amounts, tax figures, merchant names, and timestamps from uploaded images.',
    assignedEmail: 'clint.barton@demo.projectpulse.local',
    status: 'COMPLETED',
    priority: 'HIGH',
    dueDate: '2026-01-20T18:00:00.000Z',
  },
  {
    projectName: 'Expense Tracker',
    title: 'Generate monthly expense PDF analytics report',
    description: 'Visual breakdown charts of spending categories, monthly variance, and budget caps.',
    assignedEmail: 'arjun.reddy@demo.projectpulse.local',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    dueDate: '2026-02-15T18:00:00.000Z',
  },

  // Project 4: Team Collaboration Platform (PM: Tony Stark)
  {
    projectName: 'Team Collaboration Platform',
    title: 'Configure WebSockets server for live team channels',
    description: 'Socket.IO or ws connection pool with heartbeat ping/pong and channel subscription rooms.',
    assignedEmail: 'peter.parker@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-04-05T18:00:00.000Z',
  },
  {
    projectName: 'Team Collaboration Platform',
    title: 'Create markdown document editor with live sync',
    description: 'Rich text markdown editor supporting headers, tables, code syntax highlighting, and live cursors.',
    assignedEmail: 'wanda.maximoff@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-04-25T18:00:00.000Z',
  },
  {
    projectName: 'Team Collaboration Platform',
    title: 'Implement granular channel access roles',
    description: 'Define channel read/write permissions for guest collaborators vs full team members.',
    assignedEmail: 'harry.potter@demo.projectpulse.local',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-05-15T18:00:00.000Z',
  },
  {
    projectName: 'Team Collaboration Platform',
    title: 'Benchmark message throughput under load',
    description: 'Load test WebSocket broadcaster with 5,000 concurrent simulated client connections.',
    assignedEmail: 'jon.snow@demo.projectpulse.local',
    status: 'TODO',
    priority: 'LOW',
    dueDate: '2026-06-01T18:00:00.000Z',
  },

  // Project 5: Study Space Finder (PM: Tony Stark)
  {
    projectName: 'Study Space Finder',
    title: 'Integrate library seat availability sensor API',
    description: 'Polling service to ingest occupancy data from hardware pressure sensors every 30 seconds.',
    assignedEmail: 'steve.harrington@demo.projectpulse.local',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2026-05-10T18:00:00.000Z',
  },
  {
    projectName: 'Study Space Finder',
    title: 'Design floor-by-floor occupancy UI',
    description: 'Interactive SVG floorplan indicating quiet zones, available desks, and power outlets.',
    assignedEmail: 'dustin.henderson@demo.projectpulse.local',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-05-25T18:00:00.000Z',
  },

  // Project 6: AI Resume Analyzer (PM: Tony Stark)
  {
    projectName: 'AI Resume Analyzer',
    title: 'Extract skills and experience keywords via NLP',
    description: 'Entity recognition pipeline identifying technical frameworks, programming languages, and years of experience.',
    assignedEmail: 'harry.potter@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-03-30T18:00:00.000Z',
  },
  {
    projectName: 'AI Resume Analyzer',
    title: 'Calculate ATS compatibility score and tips',
    description: 'Formula scoring keyword match ratio, layout simplicity, and bullet point action-verb density.',
    assignedEmail: 'arjun.reddy@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-04-10T18:00:00.000Z',
  },
  {
    projectName: 'AI Resume Analyzer',
    title: 'Build candidate comparison visual radar chart',
    description: 'Multi-axis radar chart comparing top 5 candidates across relevant competency metrics.',
    assignedEmail: 'jane.hopper@demo.projectpulse.local',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-05-15T18:00:00.000Z',
  },

  // Project 7: Event Management System (PM: Nick Fury)
  {
    projectName: 'Event Management System',
    title: 'Implement stripe webhook for ticket transactions',
    description: 'Secure webhook handling payment confirmation, order fulfillment, and digital receipt generation.',
    assignedEmail: 'clint.barton@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-04-01T18:00:00.000Z',
  },
  {
    projectName: 'Event Management System',
    title: 'Develop attendee mobile QR scanner component',
    description: 'HTML5 camera scanner with sound/vibration feedback upon successful check-in badge validation.',
    assignedEmail: 'steve.harrington@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-04-12T18:00:00.000Z',
  },
  {
    projectName: 'Event Management System',
    title: 'Build VIP seat reservation layout',
    description: 'Interactive seat picker allowing ticket holders to select specific rows and booths.',
    assignedEmail: 'lucas.sinclair@demo.projectpulse.local',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-04-28T18:00:00.000Z',
  },

  // Project 8: E-Learning Platform (PM: Nick Fury)
  {
    projectName: 'E-Learning Platform',
    title: 'Encode HLS adaptive bitrate video streaming',
    description: 'FFmpeg transcode worker generating 1080p, 720p, and 480p m3u8 playlists.',
    assignedEmail: 'jon.snow@demo.projectpulse.local',
    status: 'COMPLETED',
    priority: 'HIGH',
    dueDate: '2025-12-15T18:00:00.000Z',
  },
  {
    projectName: 'E-Learning Platform',
    title: 'Create interactive quiz engine with instant grading',
    description: 'Multiple choice, fill-in-the-blank, and drag-and-drop questions with progress percentage calculation.',
    assignedEmail: 'dustin.henderson@demo.projectpulse.local',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    dueDate: '2026-01-15T18:00:00.000Z',
  },

  // Project 9: Inventory Management System (PM: Erwin Smith)
  {
    projectName: 'Inventory Management System',
    title: 'Setup low-stock automated threshold alerts',
    description: 'Scheduled cron evaluation notifying warehouse managers when SKUs drop below reorder levels.',
    assignedEmail: 'jon.snow@demo.projectpulse.local',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-04-20T18:00:00.000Z',
  },
  {
    projectName: 'Inventory Management System',
    title: 'Integrate Zebra handheld Bluetooth scanner',
    description: 'Web Bluetooth API bridge to receive rapid barcode input directly into picking list form.',
    assignedEmail: 'lucas.sinclair@demo.projectpulse.local',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-05-15T18:00:00.000Z',
  },
  {
    projectName: 'Inventory Management System',
    title: 'Build warehouse batch transfer workflow',
    description: 'Multi-item relocation manifest between aisle, shelf, and loading dock bays.',
    assignedEmail: 'arjun.reddy@demo.projectpulse.local',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-06-01T18:00:00.000Z',
  },

  // Project 10: Digital Safety Platform (PM: Erwin Smith)
  {
    projectName: 'Digital Safety Platform',
    title: 'Configure two-factor SMS & TOTP authentication',
    description: 'Authenticator app QR code setup with backup emergency recovery codes.',
    assignedEmail: 'steve.harrington@demo.projectpulse.local',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2026-06-10T18:00:00.000Z',
  },
  {
    projectName: 'Digital Safety Platform',
    title: 'Develop audit trail log explorer with filtering',
    description: 'Searchable timeline of user security events, login locations, IP addresses, and permission changes.',
    assignedEmail: 'harry.potter@demo.projectpulse.local',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2026-06-25T18:00:00.000Z',
  },
]

// 5. Target Issues: 10 Issues across projects and tasks
const DEMO_ISSUES = [
  {
    projectName: 'Campus Connect',
    taskTitle: 'Implement campus feed REST endpoints',
    title: 'Feed API returns 500 error when posts contain multi-byte emojis',
    description: 'Submitting a feed update with surrogate pair unicode characters causes MongoDB text indexing validation to throw an unhandled exception.',
    assignedEmail: 'wanda.maximoff@demo.projectpulse.local',
    severity: 'HIGH',
    status: 'RESOLVED',
  },
  {
    projectName: 'Campus Connect',
    taskTitle: 'Build interactive campus map view',
    title: 'Map canvas fails to render on Safari iOS 17',
    description: 'WebGL context creation error occurs when opening campus map in mobile Safari due to strict memory limits on hardware textures.',
    assignedEmail: 'peter.parker@demo.projectpulse.local',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
  },
  {
    projectName: 'Smart Placement Portal',
    taskTitle: 'Setup resume upload and PDF parsing pipeline',
    title: 'PDF upload size exceeds 10MB memory limit',
    description: 'Users attempting to upload large portfolios receive a connection reset error instead of an informative 413 Payload Too Large toast notification.',
    assignedEmail: 'peter.parker@demo.projectpulse.local',
    severity: 'HIGH',
    status: 'OPEN',
  },
  {
    projectName: 'Team Collaboration Platform',
    taskTitle: 'Configure WebSockets server for live team channels',
    title: 'WebSocket disconnects unexpectedly after 60 seconds idle',
    description: 'Cloudflare reverse proxy terminates TCP connection due to missing client-side keepalive ping heartbeat frames.',
    assignedEmail: 'peter.parker@demo.projectpulse.local',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
  },
  {
    projectName: 'Team Collaboration Platform',
    taskTitle: 'Create markdown document editor with live sync',
    title: 'Concurrent markdown edits cause cursor jumping',
    description: 'When two users type simultaneously in adjacent lines, the text selection index resets to line zero for the remote editor.',
    assignedEmail: 'wanda.maximoff@demo.projectpulse.local',
    severity: 'HIGH',
    status: 'OPEN',
  },
  {
    projectName: 'AI Resume Analyzer',
    taskTitle: 'Extract skills and experience keywords via NLP',
    title: 'Special characters in resume headers break parser tokenization',
    description: 'Bullet symbols like diamonds and arrows in executive resumes break the regex boundary split, merging company name with job title.',
    assignedEmail: 'harry.potter@demo.projectpulse.local',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
  },
  {
    projectName: 'Event Management System',
    taskTitle: 'Implement stripe webhook for ticket transactions',
    title: 'Webhook signature validation fails during retry events',
    description: 'Stripe retry payload raw body parsing does not preserve exact whitespace encoding, resulting in HMAC verification failure.',
    assignedEmail: 'clint.barton@demo.projectpulse.local',
    severity: 'HIGH',
    status: 'RESOLVED',
  },
  {
    projectName: 'Event Management System',
    taskTitle: 'Develop attendee mobile QR scanner component',
    title: 'Camera permission denied prompt not recoverable without page refresh',
    description: 'If user accidentally denies webcam access on mobile browser, no retry button is shown to request media stream again.',
    assignedEmail: 'steve.harrington@demo.projectpulse.local',
    severity: 'MEDIUM',
    status: 'OPEN',
  },
  {
    projectName: 'Inventory Management System',
    taskTitle: 'Setup low-stock automated threshold alerts',
    title: 'Alert emails delay during high concurrency checkout spike',
    description: 'Low-stock notification worker queue blocks when processing more than 100 simultaneous SKU decrements.',
    assignedEmail: 'jon.snow@demo.projectpulse.local',
    severity: 'LOW',
    status: 'OPEN',
  },
  {
    projectName: 'E-Learning Platform',
    taskTitle: 'Encode HLS adaptive bitrate video streaming',
    title: 'HLS playback stutter on low-bandwidth mobile devices',
    description: 'Default master manifest did not include 360p fallback bitrate, causing mobile cellular playback buffering.',
    assignedEmail: 'jon.snow@demo.projectpulse.local',
    severity: 'MEDIUM',
    status: 'CLOSED',
  },
]

// State to keep track of created/reused items
const state = {
  users: new Map(), // email -> { id, name, role, email, cookie }
  projects: new Map(), // name -> project object
  milestones: new Map(), // `${projectName}::${name}` -> milestone object
  tasks: new Map(), // `${projectName}::${title}` -> task object
  issues: new Map(), // `${projectName}::${title}` -> issue object
  counts: {
    usersCreated: 0,
    usersReused: 0,
    teamsCreated: 0,
    projectsCreated: 0,
    projectsReused: 0,
    milestonesCreated: 0,
    milestonesReused: 0,
    tasksCreated: 0,
    tasksReused: 0,
    issuesCreated: 0,
    issuesReused: 0,
  },
}

function extractCookie(response) {
  const getSetCookie = response.headers.getSetCookie
  let cookies = []
  if (typeof getSetCookie === 'function') {
    cookies = getSetCookie.call(response.headers)
  } else {
    const raw = response.headers.get('set-cookie')
    if (raw) cookies = [raw]
  }

  for (const c of cookies) {
    const match = c.match(/projectpulse_token=([^;]+)/)
    if (match) {
      return `projectpulse_token=${match[1]}`
    }
  }
  return null
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.cookie ? { Cookie: options.cookie } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  let data = null
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  return { status: res.status, headers: res.headers, data }
}

async function checkHealth() {
  console.log('1. Checking backend health at /api/health...')
  const res = await request('/api/health')
  if (res.status !== 200 || !res.data?.success) {
    throw new Error(`Backend is not healthy! Status: ${res.status}, response: ${JSON.stringify(res.data)}`)
  }
  console.log('   ✓ Backend is running and healthy.')
}

async function checkTeamsSupport() {
  console.log('\n2. Checking Team management API support...')
  // Attempt standard team endpoints to see if backend implements any team API
  const testEndpoints = ['/api/teams', '/api/team']
  let teamApiFound = false
  for (const ep of testEndpoints) {
    const res = await request(ep)
    if (res.status !== 404) {
      teamApiFound = true
      break
    }
  }

  if (!teamApiFound) {
    console.log('   [REPORT] Team management API is not currently implemented.')
  } else {
    console.log('   Team management API discovered.')
  }
}

async function syncUsers() {
  console.log('\n3. Authenticating / registering demo users via REST API (/api/auth)...')

  for (const userDef of DEMO_USERS) {
    let cookie = null
    let userId = null

    // First attempt registration
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: userDef.name,
        email: userDef.email,
        password: DEMO_PASSWORD,
        role: userDef.role,
      }),
    })

    if (regRes.status === 201 && regRes.data?.success) {
      state.counts.usersCreated++
      userId = regRes.data.user.id
      console.log(`   + Registered ${userDef.role}: ${userDef.name} (${userDef.email})`)
    } else if (regRes.status === 409) {
      state.counts.usersReused++
      console.log(`   ~ Already registered: ${userDef.name} (${userDef.email})`)
    } else {
      console.error(`   ! Registration failed for ${userDef.email}:`, regRes.data)
      throw new Error(`Registration failed: ${regRes.data?.message || regRes.status}`)
    }

    // Now log in to get session cookie and user profile
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userDef.email,
        password: DEMO_PASSWORD,
      }),
    })

    if (loginRes.status !== 200 || !loginRes.data?.success) {
      throw new Error(`Login failed for ${userDef.email}: ${JSON.stringify(loginRes.data)}`)
    }

    cookie = extractCookie(loginRes)
    if (!cookie) {
      throw new Error(`No projectpulse_token cookie returned for ${userDef.email}!`)
    }
    userId = loginRes.data.user.id

    state.users.set(userDef.email, {
      id: userId,
      name: userDef.name,
      email: userDef.email,
      role: userDef.role,
      cookie,
    })
  }

  console.log(`   Summary: ${state.counts.usersCreated} created, ${state.counts.usersReused} reused. Total demo users active: ${state.users.size}`)
}

async function syncProjects() {
  console.log('\n4. Syncing projects via REST API (/api/projects)...')

  for (const projDef of DEMO_PROJECTS) {
    const pm = state.users.get(projDef.managerEmail)
    if (!pm) throw new Error(`Manager ${projDef.managerEmail} not found in state`)

    // List existing projects for this PM
    const listRes = await request('/api/projects', {
      method: 'GET',
      cookie: pm.cookie,
    })

    if (listRes.status !== 200 || !listRes.data?.success) {
      throw new Error(`Failed to list projects for PM ${pm.name}: ${JSON.stringify(listRes.data)}`)
    }

    const existingProject = listRes.data.projects.find((p) => p.name.trim().toLowerCase() === projDef.name.trim().toLowerCase())

    const memberIds = projDef.memberEmails.map((email) => {
      const user = state.users.get(email)
      if (!user) throw new Error(`Member ${email} not found`)
      return user.id
    })

    if (existingProject) {
      state.counts.projectsReused++
      state.projects.set(projDef.name, existingProject)
      console.log(`   ~ Reusing project: "${projDef.name}" (ID: ${existingProject._id})`)

      // Ensure all members are added to the existing project
      const existingMemberIds = new Set((existingProject.members || []).map((m) => m._id || m.id || m.toString()))
      for (const mId of memberIds) {
        if (!existingMemberIds.has(mId)) {
          const addRes = await request(`/api/projects/${existingProject._id}/members`, {
            method: 'POST',
            cookie: pm.cookie,
            body: JSON.stringify({ memberId: mId }),
          })
          if (addRes.status === 200 && addRes.data?.success) {
            console.log(`     + Added missing member ${mId} to ${projDef.name}`)
          }
        }
      }
    } else {
      // Create new project
      const createRes = await request('/api/projects', {
        method: 'POST',
        cookie: pm.cookie,
        body: JSON.stringify({
          name: projDef.name,
          description: projDef.description,
          startDate: projDef.startDate,
          deadline: projDef.deadline,
          status: projDef.status,
          members: memberIds,
        }),
      })

      if (createRes.status !== 201 || !createRes.data?.success) {
        throw new Error(`Failed to create project "${projDef.name}": ${JSON.stringify(createRes.data)}`)
      }

      state.counts.projectsCreated++
      state.projects.set(projDef.name, createRes.data.project)
      console.log(`   + Created project: "${projDef.name}" (Manager: ${pm.name}, Status: ${projDef.status})`)
    }
  }

  console.log(`   Summary: ${state.counts.projectsCreated} created, ${state.counts.projectsReused} reused. Total projects: ${state.projects.size}`)
}

async function syncMilestones() {
  console.log('\n5. Syncing milestones via REST API (/api/projects/:projectId/milestones)...')

  for (const mDef of DEMO_MILESTONES) {
    const project = state.projects.get(mDef.projectName)
    if (!project) throw new Error(`Project "${mDef.projectName}" not found`)

    // Find manager for this project
    const projDef = DEMO_PROJECTS.find((p) => p.name === mDef.projectName)
    const pm = state.users.get(projDef.managerEmail)

    // Check existing milestones
    const listRes = await request(`/api/projects/${project._id}/milestones`, {
      method: 'GET',
      cookie: pm.cookie,
    })

    if (listRes.status !== 200 || !listRes.data?.success) {
      throw new Error(`Failed to list milestones for project ${project.name}: ${JSON.stringify(listRes.data)}`)
    }

    const existingMilestone = listRes.data.milestones.find((m) => m.name.trim().toLowerCase() === mDef.name.trim().toLowerCase())

    const key = `${mDef.projectName}::${mDef.name}`
    if (existingMilestone) {
      state.counts.milestonesReused++
      state.milestones.set(key, existingMilestone)
      console.log(`   ~ Reusing milestone: "${mDef.name}" on ${mDef.projectName}`)
    } else {
      const createRes = await request(`/api/projects/${project._id}/milestones`, {
        method: 'POST',
        cookie: pm.cookie,
        body: JSON.stringify({
          name: mDef.name,
          description: mDef.description,
          project: project._id,
          dueDate: mDef.dueDate,
          status: mDef.status,
        }),
      })

      if (createRes.status !== 201 || !createRes.data?.success) {
        throw new Error(`Failed to create milestone "${mDef.name}": ${JSON.stringify(createRes.data)}`)
      }

      state.counts.milestonesCreated++
      state.milestones.set(key, createRes.data.milestone)
      console.log(`   + Created milestone: "${mDef.name}" on ${mDef.projectName} (${mDef.status})`)
    }
  }

  console.log(`   Summary: ${state.counts.milestonesCreated} created, ${state.counts.milestonesReused} reused. Total milestones: ${state.milestones.size}`)
}

async function syncTasks() {
  console.log('\n6. Syncing tasks via REST API (/api/tasks)...')

  for (const tDef of DEMO_TASKS) {
    const project = state.projects.get(tDef.projectName)
    if (!project) throw new Error(`Project "${tDef.projectName}" not found`)

    const projDef = DEMO_PROJECTS.find((p) => p.name === tDef.projectName)
    const pm = state.users.get(projDef.managerEmail)
    const assignee = state.users.get(tDef.assignedEmail)
    if (!assignee) throw new Error(`Assignee ${tDef.assignedEmail} not found`)

    // List existing tasks for project
    const listRes = await request(`/api/tasks?project=${project._id}`, {
      method: 'GET',
      cookie: pm.cookie,
    })

    if (listRes.status !== 200 || !listRes.data?.success) {
      throw new Error(`Failed to list tasks for project ${project.name}: ${JSON.stringify(listRes.data)}`)
    }

    const existingTask = listRes.data.tasks.find((t) => t.title.trim().toLowerCase() === tDef.title.trim().toLowerCase())

    const key = `${tDef.projectName}::${tDef.title}`
    if (existingTask) {
      state.counts.tasksReused++
      state.tasks.set(key, existingTask)
      console.log(`   ~ Reusing task: "${tDef.title}" on ${tDef.projectName}`)
    } else {
      const createRes = await request('/api/tasks', {
        method: 'POST',
        cookie: pm.cookie,
        body: JSON.stringify({
          title: tDef.title,
          description: tDef.description,
          project: project._id,
          assignedTo: assignee.id,
          status: tDef.status,
          priority: tDef.priority,
          dueDate: tDef.dueDate,
        }),
      })

      if (createRes.status !== 201 || !createRes.data?.success) {
        throw new Error(`Failed to create task "${tDef.title}": ${JSON.stringify(createRes.data)}`)
      }

      state.counts.tasksCreated++
      state.tasks.set(key, createRes.data.task)
      console.log(`   + Created task: "${tDef.title}" -> ${assignee.name} (${tDef.status}, ${tDef.priority})`)
    }
  }

  console.log(`   Summary: ${state.counts.tasksCreated} created, ${state.counts.tasksReused} reused. Total tasks: ${state.tasks.size}`)
}

async function syncIssues() {
  console.log('\n7. Syncing issues via REST API (/api/issues)...')

  for (const iDef of DEMO_ISSUES) {
    const project = state.projects.get(iDef.projectName)
    if (!project) throw new Error(`Project "${iDef.projectName}" not found`)

    const projDef = DEMO_PROJECTS.find((p) => p.name === iDef.projectName)
    const pm = state.users.get(projDef.managerEmail)

    let taskId = null
    if (iDef.taskTitle) {
      const taskKey = `${iDef.projectName}::${iDef.taskTitle}`
      const task = state.tasks.get(taskKey)
      if (task) {
        taskId = task._id
      }
    }

    let assignedId = null
    if (iDef.assignedEmail) {
      const assignee = state.users.get(iDef.assignedEmail)
      if (assignee) {
        assignedId = assignee.id
      }
    }

    // List issues for project
    const listRes = await request(`/api/issues?project=${project._id}`, {
      method: 'GET',
      cookie: pm.cookie,
    })

    if (listRes.status !== 200 || !listRes.data?.success) {
      throw new Error(`Failed to list issues for project ${project.name}: ${JSON.stringify(listRes.data)}`)
    }

    const existingIssue = listRes.data.issues.find((i) => i.title.trim().toLowerCase() === iDef.title.trim().toLowerCase())

    const key = `${iDef.projectName}::${iDef.title}`
    if (existingIssue) {
      state.counts.issuesReused++
      state.issues.set(key, existingIssue)
      console.log(`   ~ Reusing issue: "${iDef.title}" on ${iDef.projectName}`)
    } else {
      const createRes = await request('/api/issues', {
        method: 'POST',
        cookie: pm.cookie,
        body: JSON.stringify({
          title: iDef.title,
          description: iDef.description,
          project: project._id,
          task: taskId,
          assignedTo: assignedId,
          severity: iDef.severity,
          status: iDef.status,
        }),
      })

      if (createRes.status !== 201 || !createRes.data?.success) {
        throw new Error(`Failed to create issue "${iDef.title}": ${JSON.stringify(createRes.data)}`)
      }

      state.counts.issuesCreated++
      state.issues.set(key, createRes.data.issue)
      console.log(`   + Created issue: "${iDef.title}" (${iDef.severity}, ${iDef.status})`)
    }
  }

  console.log(`   Summary: ${state.counts.issuesCreated} created, ${state.counts.issuesReused} reused. Total issues: ${state.issues.size}`)
}

async function verifyAll() {
  console.log('\n==================================================')
  console.log('8. VERIFICATION VIA REST GET REQUESTS')
  console.log('==================================================')

  // Pick Steve Rogers (PM) for verification
  const pmSteve = state.users.get('steve.rogers@demo.projectpulse.local')

  // A. Verify Users
  const usersRes = await request('/api/users', { cookie: pmSteve.cookie })
  console.log(`✓ GET /api/users: status ${usersRes.status}, returned ${usersRes.data?.users?.length || 0} total users`)

  // B. Verify Projects
  const projRes = await request('/api/projects', { cookie: pmSteve.cookie })
  console.log(`✓ GET /api/projects (Steve Rogers): status ${projRes.status}, returned ${projRes.data?.projects?.length || 0} projects managed`)
  if (projRes.data?.projects?.length > 0) {
    const sample = projRes.data.projects[0]
    console.log(`   Sample Project: "${sample.name}", Status: ${sample.status}, Progress: ${sample.progress}%, Members: ${sample.members?.length}`)
  }

  // C. Verify Tasks
  const tasksRes = await request('/api/tasks', { cookie: pmSteve.cookie })
  console.log(`✓ GET /api/tasks (Steve Rogers): status ${tasksRes.status}, returned ${tasksRes.data?.tasks?.length || 0} tasks`)

  // D. Verify Issues
  const issuesRes = await request('/api/issues', { cookie: pmSteve.cookie })
  console.log(`✓ GET /api/issues (Steve Rogers): status ${issuesRes.status}, returned ${issuesRes.data?.issues?.length || 0} issues`)

  // E. Verify Milestones on first project
  const campusProject = state.projects.get('Campus Connect')
  if (campusProject) {
    const milestonesRes = await request(`/api/projects/${campusProject._id}/milestones`, { cookie: pmSteve.cookie })
    console.log(`✓ GET /api/projects/:id/milestones (Campus Connect): status ${milestonesRes.status}, returned ${milestonesRes.data?.milestones?.length || 0} milestones`)
  }

  // F. Verify Reports
  const reportsRes = await request('/api/reports', { cookie: pmSteve.cookie })
  console.log(`✓ GET /api/reports: status ${reportsRes.status}, success: ${reportsRes.data?.success}`)
  if (reportsRes.data) {
    console.log(`   Reports Summary:`, JSON.stringify(reportsRes.data.summary || reportsRes.data))
  }

  // G. Verify Search
  const searchRes = await request('/api/search?q=Campus', { cookie: pmSteve.cookie })
  console.log(`✓ GET /api/search?q=Campus: status ${searchRes.status}`)
  console.log(`   Search matches: ${JSON.stringify(Object.keys(searchRes.data || {}).reduce((acc, k) => {
    if (Array.isArray(searchRes.data[k])) acc[k] = searchRes.data[k].length
    return acc
  }, {}))}`)
}

async function run() {
  console.log('==================================================')
  console.log('PROJECTPULSE — DEMO DATA GENERATION SCRIPT')
  console.log('==================================================')
  const startTime = Date.now()

  try {
    await checkHealth()
    await checkTeamsSupport()
    await syncUsers()
    await syncProjects()
    await syncMilestones()
    await syncTasks()
    await syncIssues()
    await verifyAll()

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log('\n==================================================')
    console.log(`DEMO DATA GENERATION COMPLETED SUCCESSFULLY in ${elapsed}s!`)
    console.log('==================================================')
    console.log(`Users created:      ${state.counts.usersCreated} (reused: ${state.counts.usersReused})`)
    console.log(`Teams created:      0 (Team management API is not currently implemented)`)
    console.log(`Projects created:   ${state.counts.projectsCreated} (reused: ${state.counts.projectsReused})`)
    console.log(`Milestones created: ${state.counts.milestonesCreated} (reused: ${state.counts.milestonesReused})`)
    console.log(`Tasks created:      ${state.counts.tasksCreated} (reused: ${state.counts.tasksReused})`)
    console.log(`Issues created:     ${state.counts.issuesCreated} (reused: ${state.counts.issuesReused})`)
  } catch (error) {
    console.error('\n❌ ERROR during demo data generation:', error)
    process.exit(1)
  }
}

run()
