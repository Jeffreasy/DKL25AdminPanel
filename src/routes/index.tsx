import { EmailInbox } from '../features/email/components/EmailInbox'
import { InboxTab } from '../features/dashboard/tabs/InboxTab'

export const routes = [
  {
    path: '/emails',
    element: <EmailInbox />
  }
]

export const dashboardTabs = [
  {
    label: 'Volledig overzicht',
    path: '/dashboard',
    element: <OverviewTab />
  },
  {
    label: 'Aanmeldingen',
    path: '/dashboard/aanmeldingen',
    element: <AanmeldingenTab />
  },
  {
    label: 'Contact',
    path: '/dashboard/contact',
    element: <ContactTab />
  },
  {
    label: 'Email Inbox',
    path: '/dashboard/inbox',
    element: <InboxTab />
  }
] 