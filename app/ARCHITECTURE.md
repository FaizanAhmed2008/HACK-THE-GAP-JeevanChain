# 🏗️ JeevanChain Architecture - Birth/Death Lifecycle System

## 📋 System Overview

JeevanChain is a blockchain-inspired immutable record management system for vital events (birth/death).

**Core Principle:** Records are APPEND-ONLY. Edits create new versions with audit trails.

---

## 👥 User Roles & Permissions

| Role | Module | Permissions |
|------|--------|-------------|
| **Citizen** | View | ✅ View own birth/death records |
| **Hospital** | Birth Records | ✅ Submit births, ✅ Update own records, ❌ Approve |
| **Registrar/Officer** | Death Records | ✅ Submit deaths, ✅ Update own records, ❌ Approve |
| **Registrar** | Approvals | ✅ Approve births, ✅ Approve deaths, ✅ Generate certificates |
| **Admin** | All | ✅ Full system access, ✅ Audit logs |

---

## 🎯 BIRTH RECORD LIFECYCLE

### Phase 1: Submission (Hospital)
```
Hospital submits birth record:
├─ Subject: Full name, DOB, gender
├─ Parents: Father/Mother names
├─ Location: Hospital details
└─ Status: pending
```

**Data Structure:**
```typescript
interface BirthRecord {
  id: UUID;
  version: 1;
  status: 'pending';
  subject_full_name: string;
  subject_dob: Date;
  gender: 'M' | 'F' | 'Other';
  father_name: string;
  mother_name: string;
  hospital_id: UUID;
  
  // Blockchain-like chain
  previous_hash: null;
  current_hash: SHA256(subject + dob + timestamp);
  
  // Metadata
  submitted_by: UUID;           // Hospital ID
  created_at: Timestamp;
}
```

### Phase 2: Review (Registrar)
Registrar reviews the pending record and decides:

#### Option A: APPROVE ✅
```
Registrar approves:
├─ Verify subject details
├─ Verify parent information
├─ Generate hash
├─ Create unique ID (certificate)
├─ Update status: approved
└─ Create audit log
```

**Data Updated:**
```typescript
{
  status: 'approved',
  current_hash: SHA256(previous_hash + approval_timestamp),
  unique_id: 'BIRTH-2024-000001',  // Unique birth certificate ID
  certificate_id: UUID,             // Links to certificate table
  approved_by: UUID,                // Registrar ID
  updated_at: Timestamp,
}
```

#### Option B: REJECT ❌
```
Registrar rejects with reason:
├─ Provide rejection reason (e.g., "Missing parent document")
├─ Send back to Hospital
├─ Hospital corrects and resubmits
└─ Creates new version (v2)
```

**Data Updated:**
```typescript
{
  status: 'rejected',
  rejection_reason: 'Missing mother\'s identification',
  updated_at: Timestamp,
  // Hospital can now submit corrected version
}
```

### Phase 3: Certificate Generation
After approval, certificate is generated:

```typescript
interface CertificateBirth {
  id: UUID;
  title: 'Birth Certificate';
  issued_to: UUID;              // Citizen/Newborn
  issued_by: UUID;              // Hospital
  status: 'approved';
  certificate_type: 'birth';
  metadata: {
    unique_id: 'BIRTH-2024-000001',
    hash: 'SHA256...',
    issued_date: Timestamp,
    seal: 'Digital signature',
  }
}
```

---

## ⚰️ DEATH RECORD LIFECYCLE

### Phase 1: Submission (Officer)
```
Officer submits death record:
├─ Deceased: Full name, DOB, death date
├─ Cause: Cause of death
├─ Location: Death location
└─ Status: pending
```

**Data Structure:**
```typescript
interface DeathRecord {
  id: UUID;
  version: 1;
  status: 'pending';
  deceased_name: string;
  deceased_dob: Date;
  death_date: Date;
  death_location: string;
  cause_of_death: string;
  officer_id: UUID;
  
  // Blockchain chain
  previous_hash: null;
  current_hash: SHA256(deceased + death_date + timestamp);
  
  // Metadata
  submitted_by: UUID;           // Officer ID
  created_at: Timestamp;
}
```

### Phase 2: Review (Registrar)
Registrar reviews and decides:

#### Option A: APPROVE ✅
```
Registrar approves:
├─ Verify deceased identity
├─ Verify death date/location
├─ Generate hash
├─ Create unique ID (death certificate)
├─ Update status: approved
├─ Mark citizen as "Deceased"
└─ Create audit log
```

**Data Updated:**
```typescript
{
  status: 'approved',
  current_hash: SHA256(previous_hash + approval_timestamp),
  unique_id: 'DEATH-2024-000001',   // Unique death certificate ID
  certificate_id: UUID,              // Links to certificate table
  approved_by: UUID,                 // Registrar ID
  updated_at: Timestamp,
}

// Also update citizen profile
{
  id: UUID;
  is_active: false;                  // Mark as deceased
  updated_at: Timestamp;
}
```

#### Option B: REJECT ❌
```
Registrar rejects with reason:
├─ Provide rejection reason
├─ Send back to Officer
└─ Officer investigates and resubmits
```

---

## 🔗 BLOCKCHAIN-LIKE HASHING

### Hash Chain Structure

```
Record v1 (Submitted):
  previous_hash: null
  current_hash: SHA256("John Doe" + "1990-01-15" + "2024-03-30T10:00:00Z")
  ▼
Record v2 (Approved):
  previous_hash: SHA256(...from v1...)
  current_hash: SHA256(previous_hash + approval_timestamp + approver_id)
  ▼
Record v3 (If corrected):
  previous_hash: SHA256(...from v2...)
  current_hash: SHA256(previous_hash + new_data + timestamp)
```

### Implementation

```typescript
function generateHash(data: any, previousHash?: string): string {
  const dataString = JSON.stringify(data);
  const input = previousHash ? previousHash + dataString : dataString;
  return SHA256(input).toString();
}

// Example
const v1Hash = generateHash({ 
  name: 'John Doe', 
  dob: '1990-01-15' 
});

const v2Hash = generateHash({ 
  status: 'approved',
  approver: 'registrar-123'
}, v1Hash);

// v1Hash cannot be recreated without exact same inputs
// v2Hash depends on v1Hash, creating a chain
```

---

## 📊 DATABASE SCHEMA RELATIONSHIPS

```
┌─────────────┐
│  profiles   │ (Users with roles)
├─────────────┤
│ id (PK)     │
│ role        │────┬─────────────────┬──────────────┬─────────────┐
│ is_active   │    │                 │              │             │
└─────────────┘    │                 │              │             │
       ▲           │                 │              │             │
       │           │                 │              │             │
       └───────────┴────────┐        │              │             │
                            │        │              │             │
                    ┌───────▼──┐  ┌──▼──────┐  ┌────▼──────┐  ┌──▼──────────┐
                    │ certificates│  │birth_ │  │death_    │  │audit_logs  │
                    ├────────────┤  │records │  │records   │  ├────────────┤
                    │ issued_to  │◄─┤id (PK)│  │id (PK)   │  │record_id   │
                    │ issued_by  │  │status │  │status    │  │action      │
                    │ status     │  │hash   │  │hash      │  │user_id     │
                    │ cert_type  │  │version│  │version   │  │timestamp   │
                    └────────────┘  └───────┘  └──────────┘  └────────────┘
```

---

## 🔐 AUDIT LOGGING

Every action is logged immutably:

```typescript
interface AuditLog {
  id: UUID;
  action: 'BIRTH_SUBMITTED' | 'BIRTH_APPROVED' | 'DEATH_SUBMITTED' | etc;
  table_name: 'birth_records' | 'death_records' | 'certificates';
  record_id: UUID;
  user_id: UUID;
  previous_values: JSON;
  new_values: JSON;
  ip_address: string;
  user_agent: string;
  created_at: Timestamp;  // IMMUTABLE
}
```

**Audit Trail Example:**
```
1. 2024-03-30 10:00:00 | Hospital-001 | BIRTH_SUBMITTED | record-123
2. 2024-03-30 10:15:00 | Hospital-001 | BIRTH_UPDATED | record-123
3. 2024-03-30 11:00:00 | Registrar-001 | BIRTH_APPROVED | record-123
4. 2024-03-30 11:05:00 | Registrar-001 | CERTIFICATE_GENERATED | cert-456
```

---

## 🎨 FRONTEND DASHBOARD LAYOUT

### Hospital Dashboard
```
┌───────────────────────────────┐
│ Hospital Dashboard            │
├───────────────────────────────┤
│                               │
│ [Create Birth Record]         │
│                               │
│ My Submissions:               │
│ ┌─────────────────────────┐   │
│ │ Birth #1 | pending 🕐    │   │
│ │ Birth #2 | approved ✅   │   │
│ │ Birth #3 | rejected ❌   │   │
│ └─────────────────────────┘   │
│                               │
│ Status distribution chart    │
└───────────────────────────────┘
```

### Registrar Dashboard
```
┌───────────────────────────────┐
│ Registrar Dashboard           │
├───────────────────────────────┤
│                               │
│ Pending Approvals:            │
│ ┌─────────────────────────┐   │
│ │ Birth-001 | [Review]    │   │
│ │ Death-001 | [Review]    │   │
│ │ Death-002 | [Review]    │   │
│ └─────────────────────────┘   │
│                               │
│ [Approve] [Reject]            │
│                               │
│ Stats: 15 approved, 2 pending │
└───────────────────────────────┘
```

### Officer Dashboard
```
┌───────────────────────────────┐
│ Officer Dashboard             │
├───────────────────────────────┤
│                               │
│ [Report Death]                │
│                               │
│ My Submissions:               │
│ ┌─────────────────────────┐   │
│ │ Death #1 | pending 🕐   │   │
│ │ Death #2 | approved ✅  │   │
│ └─────────────────────────┘   │
│                               │
│ Recent certificates issued    │
└───────────────────────────────┘
```

### Citizen Dashboard
```
┌───────────────────────────────┐
│ My Records                    │
├───────────────────────────────┤
│                               │
│ Birth Certificate:            │
│ ├─ Certificate ID: BIRTH-...  │
│ ├─ Status: Approved ✅        │
│ ├─ Issued: 2024-03-30         │
│ └─ [Download] [Share]         │
│                               │
│ Death Record: None            │
│                               │
│ Account Settings              │
└───────────────────────────────┘
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Auth ✅ (IN PROGRESS)
- [x] Supabase authentication setup
- [x] Role-based access control
- [x] Session persistence
- [ ] FIX: Get complete anon key
- [ ] FIX: Run database schema SQL

### Phase 2: Dashboard Routing
- [ ] Create role-based layout components
- [ ] Protected route verification
- [ ] Dashboard redirect based on role

### Phase 3: Birth Record Module
- [ ] Hospital form (submit birth)
- [ ] Registrar review interface
- [ ] Hash generation on approval
- [ ] Certificate generation

### Phase 4: Death Record Module
- [ ] Officer form (submit death)
- [ ] Registrar review interface
- [ ] Hash generation on approval
- [ ] Certificate generation
- [ ] Profile status update (mark deceased)

### Phase 5: Audit & Admin
- [ ] Audit log viewer
- [ ] Admin dashboard
- [ ] Report generation

### Phase 6: Polish
- [ ] Certificate design/template
- [ ] QR codes on certificates
- [ ] Digital signatures
- [ ] Blockchain verification

---

## 📌 KEY IMPLEMENTATION NOTES

1. **No Edits After Approval:** Records cannot be modified once `status: 'approved'`
2. **Versioning:** If changes needed, create new record with `version: 2`
3. **Hash Chain:** Each change updates hash, creating immutable audit trail
4. **Unique IDs:** Generated upon approval (BIRTH-YYYY-XXXXXX, DEATH-YYYY-XXXXXX)
5. **Audit Logs:** All changes logged to `audit_logs` table (READ-ONLY)

---

## 📝 Database Read-Only Constraints

### After Approval, Records Are Read-Only

```sql
-- Add constraint after approval
ALTER TABLE birth_records ADD CONSTRAINT approved_records_immutable
  CHECK (status != 'approved' OR updated_at = created_at);

-- Or via trigger
CREATE TRIGGER protect_approved_records
BEFORE UPDATE ON birth_records
FOR EACH ROW
WHEN (NEW.status = 'approved' AND OLD.status = 'approved')
DO RAISE EXCEPTION 'Approved records cannot be modified';
```

---

## ✅ Summary

**JeevanChain** implements:
- ✅ Role-based access control (Hospital, Registrar, Officer, Admin, Citizen)
- ✅ Blockchain-like immutable records (hash chaining)
- ✅ Append-only versioning (edits create new versions)
- ✅ Complete audit trail (who, what, when)
- ✅ Two-stage approval (Submit → Review → Approve/Reject)
- ✅ Unique IDs with certificates
- ✅ Status tracking throughout lifecycle

This provides a **tamper-proof, auditable system** for vital events management.
