import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import User from './models/User.js'
import Project from './models/Project.js'
import Task from './models/Task.js'
import Issue from './models/Issue.js'

import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const DEMO_PASSWORD = 'Sanju@03'

const demoUsersData = [
  { name: 'Alex Morgan', email: 'alex.morgan@projectpulse.dev', role: 'PROJECT_MANAGER', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { name: 'Sarah Chen', email: 'sarah.chen@projectpulse.dev', role: 'PROJECT_MANAGER', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
  { name: 'David Wilson', email: 'david.wilson@projectpulse.dev', role: 'PROJECT_MANAGER', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { name: 'Priya Sharma', email: 'priya.sharma@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { name: 'Rahul Kumar', email: 'rahul.kumar@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { name: 'Emily Davis', email: 'emily.davis@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { name: 'Daniel Lee', email: 'daniel.lee@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
  { name: 'Aarav Patel', email: 'aarav.patel@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { name: 'Sophia Brown', email: 'sophia.brown@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { name: 'Michael Smith', email: 'michael.smith@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
  { name: 'Ananya Reddy', email: 'ananya.reddy@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150' },
  { name: 'James Wilson', email: 'james.wilson@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { name: 'Olivia Martin', email: 'olivia.martin@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { name: 'Arjun Rao', email: 'arjun.rao@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
  { name: 'Maya Thomas', email: 'maya.thomas@projectpulse.dev', role: 'MEMBER', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150' },
]

async function seed() {
  try {
    console.log('Connecting to database...')
    await connectDB()

    console.log('Clearing existing collections...')
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Issue.deleteMany({}),
    ])

    console.log('Creating demo users (passwords securely hashed via User model)...')
    const users = []
    for (const u of demoUsersData) {
      const user = await User.create({
        name: u.name,
        email: u.email,
        password: DEMO_PASSWORD,
        role: u.role,
        avatar: u.avatar,
      })
      users.push(user)
    }
    console.log(`Created ${users.length} users.`)

    const alex = users[0] // PM
    const sarah = users[1] // PM
    const david = users[2] // PM

    const allMemberIds = users.slice(3).map((u) => u._id)
    const teamA = [users[3]._id, users[4]._id, users[5]._id, users[6]._id, users[7]._id]
    const teamB = [users[7]._id, users[8]._id, users[9]._id, users[10]._id, users[11]._id]
    const teamC = [users[11]._id, users[12]._id, users[13]._id, users[14]._id, users[3]._id]
    const teamD = allMemberIds

    console.log('Creating projects...')
    const now = new Date()
    const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000)
    const subDays = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000)

    const projectsData = [
      {
        name: 'Atlas Mobile App v2',
        description: 'Next-generation iOS & Android application featuring instant syncing, offline mode, and team channels.',
        startDate: subDays(45),
        deadline: addDays(40),
        status: 'ACTIVE',
        manager: alex._id,
        members: teamA,
      },
      {
        name: 'Cloud Infrastructure Migration',
        description: 'Transition monolithic infrastructure to scalable Kubernetes clusters on AWS with zero downtime.',
        startDate: subDays(30),
        deadline: addDays(60),
        status: 'ACTIVE',
        manager: sarah._id,
        members: teamB,
      },
      {
        name: 'FinTech Customer Portal',
        description: 'Secure customer self-service portal for transaction tracking, automated statements, and disputes.',
        startDate: subDays(60),
        deadline: subDays(5),
        status: 'COMPLETED',
        manager: david._id,
        members: teamC,
      },
      {
        name: 'AI Search & Analytics Engine',
        description: 'Semantic vector search engine with natural language queries across workspace knowledge documents.',
        startDate: addDays(10),
        deadline: addDays(90),
        status: 'PLANNED',
        manager: alex._id,
        members: teamD,
      },
      {
        name: 'Design System & Component Library',
        description: 'Unified cross-platform design token hierarchy and reusable component system inspired by LUNO.',
        startDate: subDays(20),
        deadline: addDays(25),
        status: 'ACTIVE',
        manager: sarah._id,
        members: [users[3]._id, users[5]._id, users[8]._id, users[12]._id],
      },
    ]

    const projects = await Project.create(projectsData)
    console.log(`Created ${projects.length} projects.`)

    console.log('Creating tasks...')
    const tasksData = [
      // Atlas Mobile App (projects[0])
      {
        title: 'Architect biometric authentication flow',
        description: 'Support FaceID and Fingerprint biometric authentication with secure enclave key storage.',
        project: projects[0]._id,
        assignedTo: users[3]._id,
        createdBy: alex._id,
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: subDays(10),
      },
      {
        title: 'Implement offline SQLite cache',
        description: 'Enable delta updates and local query caching when device network connection drops.',
        project: projects[0]._id,
        assignedTo: users[4]._id,
        createdBy: alex._id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: addDays(5),
      },
      {
        title: 'Design push notification permission modal',
        description: 'Create polite onboarding prompt explaining value before prompting OS notification dialog.',
        project: projects[0]._id,
        assignedTo: users[5]._id,
        createdBy: alex._id,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: addDays(12),
      },
      {
        title: 'Test deep-linking route handlers',
        description: 'Validate universal links from email and web redirects to correct task screens.',
        project: projects[0]._id,
        assignedTo: users[6]._id,
        createdBy: alex._id,
        status: 'TODO',
        priority: 'LOW',
        dueDate: addDays(18),
      },
      {
        title: 'App Store submission checklist',
        description: 'Prepare localized screenshots, privacy policy nutrition labels, and beta test flight notes.',
        project: projects[0]._id,
        assignedTo: users[7]._id,
        createdBy: alex._id,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: addDays(20),
      },

      // Cloud Migration (projects[1])
      {
        title: 'Provision EKS cluster with Terraform',
        description: 'Define Infrastructure as Code for multi-AZ worker nodes with auto-scaling groups.',
        project: projects[1]._id,
        assignedTo: users[7]._id,
        createdBy: sarah._id,
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: subDays(8),
      },
      {
        title: 'Configure Prometheus and Grafana alerts',
        description: 'Set up real-time telemetry dashboards for node memory pressure and API latency 99th percentile.',
        project: projects[1]._id,
        assignedTo: users[8]._id,
        createdBy: sarah._id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: addDays(4),
      },
      {
        title: 'Zero-downtime MongoDB Atlas cutover',
        description: 'Execute read-replica sync and switch DNS endpoint during low traffic window.',
        project: projects[1]._id,
        assignedTo: users[9]._id,
        createdBy: sarah._id,
        status: 'TODO',
        priority: 'HIGH',
        dueDate: addDays(15),
      },
      {
        title: 'Set up CI/CD GitHub Actions matrix',
        description: 'Automate Docker container scanning, semantic tagging, and ArgoCD staging sync.',
        project: projects[1]._id,
        assignedTo: users[10]._id,
        createdBy: sarah._id,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: subDays(2),
      },

      // FinTech Customer Portal (projects[2])
      {
        title: 'Audit PCI-DSS compliance requirements',
        description: 'Verify field-level encryption for payment credentials and sensitive ledger entries.',
        project: projects[2]._id,
        assignedTo: users[11]._id,
        createdBy: david._id,
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: subDays(30),
      },
      {
        title: 'Build statement PDF export worker',
        description: 'Generate digitally signed monthly account summaries with custom branding.',
        project: projects[2]._id,
        assignedTo: users[12]._id,
        createdBy: david._id,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: subDays(15),
      },
      {
        title: 'Implement dispute resolution workflow',
        description: 'Allow customers to file transaction disputes with receipt image attachments.',
        project: projects[2]._id,
        assignedTo: users[13]._id,
        createdBy: david._id,
        status: 'COMPLETED',
        priority: 'LOW',
        dueDate: subDays(10),
      },

      // Design System (projects[4])
      {
        title: 'Standardize typography scale & colors',
        description: 'Establish design tokens for font size, weight, line-height, and LUNO clean color palette.',
        project: projects[4]._id,
        assignedTo: users[3]._id,
        createdBy: sarah._id,
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: subDays(5),
      },
      {
        title: 'Build accessible modal dialog component',
        description: 'Implement focus trap, ESC key dismissal, and ARIA attributes for modal windows.',
        project: projects[4]._id,
        assignedTo: users[5]._id,
        createdBy: sarah._id,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: addDays(7),
      },
      {
        title: 'Design empty state illustrations & copy',
        description: 'Draft helpful onboarding guidance when lists contain 0 items.',
        project: projects[4]._id,
        assignedTo: users[8]._id,
        createdBy: sarah._id,
        status: 'TODO',
        priority: 'LOW',
        dueDate: addDays(14),
      },
    ]

    const tasks = await Task.create(tasksData)
    console.log(`Created ${tasks.length} tasks.`)

    console.log('Creating issues...')
    const issuesData = [
      {
        title: 'Token expiry causes white screen on app resume',
        description: 'When device wakes after 24h background sleep, refresh token failure triggers unhandled promise rejection.',
        project: projects[0]._id,
        task: tasks[0]._id,
        reportedBy: users[6]._id,
        assignedTo: users[3]._id,
        severity: 'HIGH',
        status: 'IN_PROGRESS',
      },
      {
        title: 'Memory leak in real-time notification socket listener',
        description: 'Event listener is not removed when navigating away from the chat screen, accumulating memory.',
        project: projects[0]._id,
        task: tasks[1]._id,
        reportedBy: users[5]._id,
        assignedTo: users[4]._id,
        severity: 'CRITICAL',
        status: 'OPEN',
      },
      {
        title: 'Pod restart loop under 80% synthetic load',
        description: 'Kubernetes liveness probe timeout is too aggressive (3s), restarting containers prematurely.',
        project: projects[1]._id,
        task: tasks[6]._id,
        reportedBy: users[9]._id,
        assignedTo: users[8]._id,
        severity: 'HIGH',
        status: 'OPEN',
      },
      {
        title: 'Statement PDF export missing decimal zero on currency',
        description: 'Amounts like $12.50 were rendering as $12.5 due to parseFloat truncation.',
        project: projects[2]._id,
        task: tasks[10]._id,
        reportedBy: users[12]._id,
        assignedTo: users[12]._id,
        severity: 'LOW',
        status: 'RESOLVED',
      },
      {
        title: 'Focus ring invisible on dark theme toggle switch',
        description: 'Keyboard navigation users cannot see outline when tabbing into dark mode control.',
        project: projects[4]._id,
        task: tasks[13]._id,
        reportedBy: users[8]._id,
        assignedTo: users[5]._id,
        severity: 'MEDIUM',
        status: 'OPEN',
      },
    ]

    const issues = await Issue.create(issuesData)
    console.log(`Created ${issues.length} issues.`)

    console.log('Seed finished successfully!')
    console.log('All 15 users have password:', DEMO_PASSWORD)
    console.log('Example PM login: alex.morgan@projectpulse.dev')
    console.log('Example Member login: priya.sharma@projectpulse.dev')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()
