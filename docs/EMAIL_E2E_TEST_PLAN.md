# Email System End-to-End Test Plan

> **Version:** 1.0  
> **Date:** 2025-11-08  
> **Status:** Ready for Testing

Complete test plan voor het email systeem inclusief alle nieuwe features.

---

## 🎯 Test Scope

### Features to Test

1. ✅ Email Inbox viewing (beide accounts)
2. ✅ Email details viewing
3. ✅ Email compose (nieuw)
4. ✅ Email reply
5. ✅ Email forward
6. ✅ Email delete
7. ✅ Mark as read/unread
8. ✅ Manual email fetch
9. ✅ AutoResponse management (NEW)
10. ✅ Dashboard statistics (NEW)
11. ✅ Search & filtering
12. ✅ Keyboard shortcuts
13. ✅ Pagination
14. ✅ Mobile responsive

---

## 📝 Test Scenarios

### Scenario 1: Email Inbox Workflow

**Test:** Basis inbox functionaliteit

**Steps:**
1. Login als admin user
2. Navigate naar `/email`
3. Verify inbox loads met emails
4. Switch tussen Info en Inschrijving accounts
5. Verify emails update per account
6. Check pagination werkt (als >20 emails)
7. Verify unread count is correct

**Expected:**
- ✅ Emails tonen sender, subject, date
- ✅ Unread emails hebben bold font
- ✅ Account switch werkt smooth
- ✅ Pagination controls tonen als needed

**Checklist:**
- [ ] Inbox laadt correct
- [ ] Account switch werkt
- [ ] Pagination werkt
- [ ] Unread count klopt
- [ ] Loading states tonen

---

### Scenario 2: Email Detail Viewing

**Test:** Email details bekijken en acties

**Steps:**
1. Open inbox (`/email`)
2. Click op een email in de lijst
3. Verify email detail toont in rechterpaneel (desktop)
4. Verify email detail toont in modal (mobile)
5. Check HTML rendering is correct en veilig
6. Click "Beantwoorden" button
7. Verify reply dialog opent met pre-filled data
8. Close dialog met Escape key

**Expected:**
- ✅ Email HTML is gesanitized (geen scripts)
- ✅ Images tonen correct
- ✅ Reply button werkt
- ✅ Forward button werkt
- ✅ Delete button werkt
- ✅ Navigation tussen emails werkt (prev/next)

**Checklist:**
- [ ] Email detail laadt
- [ ] HTML is veilig gerenderd
- [ ] Images tonen
- [ ] Reply werkt
- [ ] Forward werkt
- [ ] Delete werkt (met confirmatie)
- [ ] Keyboard shortcuts werken (j/k)

---

### Scenario 3: Email Compose

**Test:** Nieuwe email opstellen en versturen

**Steps:**
1. Click "Nieuwe Email" button
2. Select recipient from autocomplete
3. Enter subject
4. Type email body in rich text editor
5. Test formatting buttons (bold, italic, etc.)
6. Insert image via image modal
7. Click "Preview" button
8. Verify preview toont correct
9. Click "Verstuur"
10. Verify success toast
11. Verify email dialog closes

**Expected:**
- ✅ Rich text editor werkt
- ✅ Recipient autocomplete toont suggestions
- ✅ Image insertion werkt
- ✅ Preview accurate
- ✅ Email wordt verzonden
- ✅ Draft auto-save werkt

**Checklist:**
- [ ] Dialog opent
- [ ] Recipient autocomplete werkt
- [ ] Rich text editor functies werken
- [ ] Image insertion werkt
- [ ] Preview klopt
- [ ] Email verzendt succesvol
- [ ] Draft saves automatically

---

### Scenario 4: Reply & Forward

**Test:** Email beantwoorden en doorsturen

**Steps:**
1. Select een email in inbox
2. Click "Beantwoorden"
3. Verify recipient is pre-filled
4. Verify subject heeft "Re:" prefix
5. Verify original email is quoted
6. Modify reply content
7. Send email
8. Repeat voor "Doorsturen" functie
9. Verify forward heeft "Fwd:" prefix
10. Verify original message is included

**Expected:**
- ✅ Reply pre-fills correct data
- ✅ Forward pre-fills correct data
- ✅ Original content preserved
- ✅ Send werkt voor beide

**Checklist:**
- [ ] Reply pre-fills recipient
- [ ] Reply adds "Re:" prefix
- [ ] Reply quotes original
- [ ] Forward heeft no recipient
- [ ] Forward adds "Fwd:" prefix
- [ ] Forward includes original
- [ ] Both send successfully

---

### Scenario 5: Search & Filter

**Test:** Email zoeken en filteren

**Steps:**
1. Open inbox met meerdere emails
2. Type in search box
3. Verify real-time filtering
4. Test search op subject
5. Test search op sender
6. Test search op body content
7. Click "Alleen ongelezen" filter
8. Verify only unread emails tonen
9. Press `/` key
10. Verify search box gets focus

**Expected:**
- ✅ Search is instant (client-side)
- ✅ Searches subject, sender, body
- ✅ Unread filter werkt
- ✅ Keyboard shortcut werkt

**Checklist:**
- [ ] Search werkt real-time
- [ ] Zoekt in subject
- [ ] Zoekt in sender
- [ ] Zoekt in body
- [ ] Unread filter werkt
- [ ] `/` shortcut werkt
- [ ] Clear search werkt

---

### Scenario 6: AutoResponse Management (NEW)

**Test:** Template beheer functionaliteit

**Steps:**
1. Navigate naar `/email`
2. Click "AutoResponse Templates" tab
3. Click "Nieuwe Template" button
4. Fill in template form:
   - Name: "Test Template"
   - Trigger: "Contact"
   - Subject: "RE: Test"
   - Body: "<p>Test content with {naam} variable</p>"
   - Active: checked
5. Click "Aanmaken"
6. Verify template appears in list
7. Click edit button op template
8. Modify template
9. Save changes
10. Toggle active/inactive
11. Delete template (met confirmatie)

**Expected:**
- ✅ CRUD operaties werken
- ✅ Template variables ondersteuning
- ✅ Active toggle werkt instant
- ✅ Delete heeft confirmatie

**Checklist:**
- [ ] Tab toont in EmailManagementPage
- [ ] List laadt templates
- [ ] Create form werkt
- [ ] Template saves correctly
- [ ] Edit form pre-fills data
- [ ] Update saves changes
- [ ] Toggle active/inactive werkt
- [ ] Delete werkt (met confirm)
- [ ] Empty state toont als geen templates

---

### Scenario 7: Dashboard Integration (NEW)

**Test:** Email statistics in dashboard

**Steps:**
1. Navigate naar dashboard (`/`)
2. Scroll naar email statistics sectie
3. Verify unread count toont
4. Verify total emails toont
5. Verify info account count
6. Verify inschrijving account count
7. Wait 60 seconds
8. Verify stats auto-refresh

**Expected:**
- ✅ Stats tonen correct data
- ✅ Auto-refresh elke 60s
- ✅ Loading states tijdens fetch

**Checklist:**
- [ ] Email stats card toont in dashboard
- [ ] Unread count klopt
- [ ] Total count klopt
- [ ] Per-account counts kloppen
- [ ] Auto-refresh werkt
- [ ] Loading state toont tijdens fetch

---

### Scenario 8: Keyboard Shortcuts

**Test:** Power user workflow

**Shortcuts:**
- `j` - Volgende email
- `k` - Vorige email
- `Enter` - Email openen
- `r` - Beantwoorden
- `f` - Doorsturen
- `n` - Nieuwe email
- `/` - Focus search
- `Esc` - Sluiten

**Steps:**
1. Open inbox
2. Press `j` multiple times
3. Verify selection moves down
4. Press `k`
5. Verify selection moves up
6. Press `Enter`
7. Verify email opens
8. Press `r`
9. Verify reply dialog opens
10. Press `Esc`
11. Verify dialog closes
12. Press `n`
13. Verify compose dialog opens
14. Press `/`
15. Verify search focuses

**Expected:**
- ✅ All shortcuts werken
- ✅ Shortcuts disabled in input fields
- ✅ Visual feedback op selection

**Checklist:**
- [ ] j/k navigation werkt
- [ ] Enter opens email
- [ ] r opens reply
- [ ] f opens forward
- [ ] n opens compose
- [ ] / focuses search
- [ ] Esc closes dialogs
- [ ] Shortcuts respect input focus

---

### Scenario 9: Manual Email Fetch

**Test:** Handmatig nieuwe emails ophalen

**Steps:**
1. Open inbox
2. Click CloudArrowDownIcon button (fetch button)
3. Verify loading spinner toont
4. Wait voor API response
5. Verify success toast
6. Verify inbox refreshes
7. Check nieuwe emails tonen

**Expected:**
- ✅ Fetch button triggert API call
- ✅ Loading state tijdens fetch
- ✅ Success message toont
- ✅ Inbox updates met nieuwe emails

**Checklist:**
- [ ] Fetch button zichtbaar
- [ ] Click triggert fetch
- [ ] Loading spinner toont
- [ ] Success toast toont
- [ ] Inbox refreshes
- [ ] Nieuwe emails visible

---

### Scenario 10: Error Handling

**Test:** Foutafhandeling en edge cases

**Steps:**
1. Disconnect internet/stop backend
2. Try te laden emails
3. Verify error message toont
4. Reconnect
5. Click refresh
6. Verify recovery werkt
7. Try te versturen email zonder recipient
8. Verify validation error
9. Try te versturen email zonder subject
10. Verify validation error

**Expected:**
- ✅ Network errors tonen friendly message
- ✅ Validation errors prevent submit
- ✅ Recovery werkt na reconnect
- ✅ No app crashes

**Checklist:**
- [ ] Network error handled gracefully
- [ ] Error messages zijn duidelijk
- [ ] Recovery werkt
- [ ] Form validation werkt
- [ ] No console errors bij normal use
- [ ] No app crashes

---

### Scenario 11: Mobile Responsive

**Test:** Mobile device compatibility

**Steps:**
1. Open DevTools
2. Switch naar mobile view (375px width)
3. Navigate naar `/email`
4. Verify layout past op scherm
5. Click email in list
6. Verify modal opent (niet split view)
7. Verify scroll werkt
8. Test alle buttons reachable
9. Test touch gestures werken

**Expected:**
- ✅ Layout responsive
- ✅ Modal voor email detail op mobile
- ✅ All features accessible
- ✅ Touch-friendly buttons

**Checklist:**
- [ ] Layout past op small screens
- [ ] Email list scrolls
- [ ] Modal opens voor email detail
- [ ] All buttons reachable
- [ ] Text readable
- [ ] No horizontal scroll
- [ ] Touch targets adequate size

---

### Scenario 12: Draft Auto-Save

**Test:** Automatic draft saving

**Steps:**
1. Click "Nieuwe Email"
2. Start typing recipient
3. Wait 2 seconds
4. Type subject
5. Wait 2 seconds
6. Type body content
7. Close dialog zonder te versturen
8. Reopen compose dialog
9. Verify draft notification toont
10. Click "Herstellen"
11. Verify all fields restored
12. Send email
13. Verify draft cleared

**Expected:**
- ✅ Auto-saves every 2 seconds
- ✅ Draft persists 24 hours
- ✅ Restore werkt
- ✅ Clears on send

**Checklist:**
- [ ] Auto-save werkt (2s interval)
- [ ] Draft notification toont
- [ ] Restore herstelt all fields
- [ ] Discard verwijdert draft
- [ ] Send clears draft
- [ ] Draft age toont correct

---

## 🧪 Integration Tests

### Test 1: Full Email Receive Flow

```typescript
describe('Email Receive Flow', () => {
  it('should receive and display new email', async () => {
    // 1. Trigger fetch
    await emailClient.fetchNewEmails()
    
    // 2. Load inbox
    const { emails } = await emailClient.getEmailsByAccount('info', 20, 0)
    
    // 3. Verify email appears
    expect(emails.length).toBeGreaterThan(0)
    
    // 4. Get email details
    const email = await emailClient.getEmailById(emails[0].id)
    expect(email).toBeTruthy()
    
    // 5. Mark as read
    await emailClient.markAsProcessed(email.id)
    
    // 6. Verify updated
    const updated = await emailClient.getEmailById(email.id)
    expect(updated.read).toBe(true)
  })
})
```

---

### Test 2: Email Send Flow

```typescript
describe('Email Send Flow', () => {
  it('should send email successfully', async () => {
    const result = await emailClient.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      body: '<p>Test content</p>'
    })
    
    expect(result.success).toBe(true)
    expect(result.id).toBeTruthy()
  })
})
```

---

### Test 3: AutoResponse Flow

```typescript
describe('AutoResponse Flow', () => {
  it('should create and use autoresponse', async () => {
    // 1. Create template
    const template = await emailClient.createAutoResponse({
      name: 'Test Template',
      subject: 'RE: Test',
      body: '<p>Auto reply</p>',
      trigger_event: 'contact',
      is_active: true,
      template_variables: {}
    })
    
    expect(template.id).toBeTruthy()
    
    // 2. Fetch templates
    const templates = await emailClient.getAutoResponses()
    expect(templates).toContainEqual(expect.objectContaining({
      name: 'Test Template'
    }))
    
    // 3. Update template
    const updated = await emailClient.updateAutoResponse(template.id, {
      is_active: false
    })
    expect(updated.is_active).toBe(false)
    
    // 4. Delete template
    await emailClient.deleteAutoResponse(template.id)
    
    // 5. Verify deleted
    const after = await emailClient.getAutoResponses()
    expect(after).not.toContainEqual(expect.objectContaining({
      id: template.id
    }))
  })
})
```

---

## 🔍 Manual Testing Checklist

### Pre-requisites

- [ ] Backend running (local or production)
- [ ] Frontend running (`npm run dev`)
- [ ] Usuario ingelogd met admin permissions
- [ ] At least 1 email in each inbox (info, inschrijving)

---

### Basic Functionality

- [ ] Inbox laadt zonder errors
- [ ] Emails tonen in lijst
- [ ] Click email opent detail view
- [ ] Delete email werkt (met confirmatie)
- [ ] Mark as read werkt
- [ ] Search functionality werkt
- [ ] Filter "Alleen ongelezen" werkt
- [ ] Pagination werkt (bij >20 emails)

---

### Email Actions

- [ ] "Nieuwe Email" button opent dialog
- [ ] Compose dialog heeft werkende rich text editor
- [ ] Send email werkt (zonder errors)
- [ ] Reply pre-fills correct data
- [ ] Forward pre-fills correct data
- [ ] Image insertion werkt
- [ ] Email preview accurate

---

### AutoResponse Management (NEW)

- [ ] AutoResponse tab zichtbaar
- [ ] Templates lijst laadt
- [ ] "Nieuwe Template" opent form
- [ ] Create template werkt
- [ ] Edit template werkt
- [ ] Delete template werkt (met confirm)
- [ ] Toggle active/inactive werkt
- [ ] Template variabelen worden correct parsed

---

### Dashboard Integration (NEW)

- [ ] Dashboard toont email stats card
- [ ] Unread count is zichtbaar en correct
- [ ] Total email count klopt
- [ ] Info account count klopt
- [ ] Inschrijving account count klopt
- [ ] Stats refresh automatisch (60s)
- [ ] Click op email card navigeert naar `/email` (optional)

---

### Advanced Features

- [ ] Manual fetch werkt (CloudArrowDown icon)
- [ ] Refresh werkt (ArrowPath icon)
- [ ] Keyboard shortcuts (j,k,r,f,n,/,Esc)
- [ ] Draft auto-save (2s interval)
- [ ] Draft restore werkt
- [ ] Mobile responsive (modal view)
- [ ] Tablet responsive
- [ ] Dark mode werkt correct

---

### Security & Permissions

- [ ] Alleen geauthoriseerde users zien email menu
- [ ] HTML is gesanitized (no script execution)
- [ ] JWT token wordt correct meegestuurd
- [ ] 401 error logt user uit
- [ ] 403 error toont message (geen logout)
- [ ] No XSS via email HTML

---

## 🐛 Known Issues & Workarounds

### Issue 1: Period Statistics

**Status:** Not implemented in backend

**Impact:** `todayCount`, `weekCount`, `monthCount` zijn 0

**Workaround:** Currently unused, toon alleen totals en unread

**Fix:** Requires backend API enhancement

---

### Issue 2: Large Inbox Performance

**Status:** No virtual scrolling

**Impact:** Kan traag worden bij >100 emails

**Workaround:** Gebruik pagination (20 per page)

**Fix:** Implement virtual scrolling in future version

---

## 📊 Test Results Template

```markdown
## Test Run: [Date]

**Tester:** [Name]
**Environment:** Development / Production
**Browser:** Chrome / Firefox / Safari
**Device:** Desktop / Mobile / Tablet

### Results

| Scenario | Status | Notes |
|----------|--------|-------|
| Email Inbox Workflow | ✅ Pass | |
| Email Detail Viewing | ✅ Pass | |
| Email Compose | ✅ Pass | |
| Reply & Forward | ✅ Pass | |
| Search & Filter | ✅ Pass | |
| AutoResponse Management | ✅ Pass | |
| Dashboard Integration | ✅ Pass | |
| Keyboard Shortcuts | ✅ Pass | |
| Mobile Responsive | ✅ Pass | |
| Security & Permissions | ✅ Pass | |

### Issues Found

1. [Issue description]
   - Severity: Critical / High / Medium / Low
   - Steps to reproduce: ...
   - Expected vs Actual: ...

### Performance Notes

- Average inbox load time: [X]ms
- Email detail load time: [X]ms
- Send email time: [X]ms
```

---

## 🚀 Deployment Checklist

Voor productie deployment:

- [ ] All tests passed
- [ ] Environment variables configured
- [ ] Backend email service running
- [ ] IMAP credentials valid
- [ ] SMTP credentials valid
- [ ] Rate limiting configured
- [ ] Email templates uploaded
- [ ] AutoResponse templates configured
- [ ] Permissions setup correct
- [ ] Monitoring enabled

---

**Version:** 1.0  
**Last Updated:** 2025-11-08  
**Status:** ✅ Ready for Testing