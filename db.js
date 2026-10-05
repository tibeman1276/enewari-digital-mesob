import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
const dataDir = path.resolve('data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'mesob.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, full_name TEXT DEFAULT '', role TEXT DEFAULT 'superadmin', institution_id INTEGER, active INTEGER DEFAULT 1, last_login_at TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS citizens (id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, phone TEXT UNIQUE NOT NULL, email TEXT DEFAULT '', kebele TEXT DEFAULT '', password_hash TEXT NOT NULL, active INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS institutions (id INTEGER PRIMARY KEY AUTOINCREMENT, name_am TEXT NOT NULL, name_en TEXT NOT NULL, description_am TEXT DEFAULT '', description_en TEXT DEFAULT '', phone TEXT DEFAULT '', email TEXT DEFAULT '', address TEXT DEFAULT '', head_am TEXT DEFAULT '', head_en TEXT DEFAULT '', work_hours TEXT DEFAULT '', services_am TEXT DEFAULT '', services_en TEXT DEFAULT '', forms_url TEXT DEFAULT '', photo_url TEXT DEFAULT '', icon TEXT DEFAULT '🏛️', active INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT DEFAULT '', updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS news (id INTEGER PRIMARY KEY AUTOINCREMENT, title_am TEXT NOT NULL, title_en TEXT DEFAULT '', body_am TEXT DEFAULT '', body_en TEXT DEFAULT '', image TEXT DEFAULT '', published INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY AUTOINCREMENT, title_am TEXT NOT NULL, title_en TEXT DEFAULT '', category TEXT DEFAULT 'General', filename TEXT NOT NULL, original_name TEXT NOT NULL, mime_type TEXT DEFAULT '', size INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS chat_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, user_message TEXT, assistant_message TEXT, provider TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS request_updates (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id INTEGER NOT NULL, status TEXT NOT NULL, note TEXT DEFAULT '', actor TEXT DEFAULT 'system', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id INTEGER, citizen_id INTEGER, channel TEXT NOT NULL, recipient TEXT DEFAULT '', message TEXT DEFAULT '', status TEXT DEFAULT 'Queued', read_at TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS service_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, reference_no TEXT UNIQUE NOT NULL, service_key TEXT NOT NULL, service_name_am TEXT NOT NULL, service_name_en TEXT DEFAULT '', full_name TEXT NOT NULL, phone TEXT NOT NULL, kebele TEXT DEFAULT '', details TEXT DEFAULT '', status TEXT DEFAULT 'Received', admin_note TEXT DEFAULT '', assigned_institution_id INTEGER, priority TEXT DEFAULT 'Normal', due_date TEXT DEFAULT '', citizen_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS service_request_documents (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id INTEGER NOT NULL, filename TEXT NOT NULL, original_name TEXT NOT NULL, mime_type TEXT DEFAULT '', size INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id INTEGER NOT NULL, reference_no TEXT NOT NULL, provider TEXT NOT NULL, amount REAL NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'ETB', status TEXT NOT NULL DEFAULT 'Pending', provider_reference TEXT DEFAULT '', checkout_url TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS office_services (id INTEGER PRIMARY KEY AUTOINCREMENT, institution_id INTEGER NOT NULL, service_key TEXT UNIQUE NOT NULL, name_am TEXT NOT NULL, name_en TEXT NOT NULL, description_am TEXT DEFAULT '', description_en TEXT DEFAULT '', fee REAL DEFAULT 0, currency TEXT DEFAULT 'ETB', estimated_days INTEGER DEFAULT 3, required_documents TEXT DEFAULT '', form_schema TEXT DEFAULT '[]', workflow_schema TEXT DEFAULT '[]', active INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS service_workflow_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id INTEGER NOT NULL, step_key TEXT NOT NULL, step_name_am TEXT NOT NULL, step_name_en TEXT DEFAULT '', action TEXT NOT NULL, actor TEXT DEFAULT 'system', note TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS service_feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, request_id INTEGER NOT NULL UNIQUE, citizen_id INTEGER, reference_no TEXT NOT NULL, rating INTEGER NOT NULL, comment TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS certificates (id INTEGER PRIMARY KEY AUTOINCREMENT, certificate_no TEXT UNIQUE NOT NULL, verification_code TEXT UNIQUE NOT NULL, request_id INTEGER, citizen_id INTEGER, title_am TEXT NOT NULL, title_en TEXT DEFAULT '', holder_name TEXT NOT NULL, service_name_am TEXT DEFAULT '', service_name_en TEXT DEFAULT '', issued_by TEXT DEFAULT 'Enewari City Administration', issued_at TEXT DEFAULT CURRENT_TIMESTAMP, expires_at TEXT DEFAULT '', status TEXT DEFAULT 'Valid', notes TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_cert_verification ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_cert_request ON certificates(request_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_request ON service_workflow_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_srd_request ON service_request_documents(request_id);
CREATE INDEX IF NOT EXISTS idx_payments_request ON payments(request_id);
`);
export default db;

const migrations=[['head_am',"TEXT DEFAULT ''"],['head_en',"TEXT DEFAULT ''"],['work_hours',"TEXT DEFAULT ''"],['services_am',"TEXT DEFAULT ''"],['services_en',"TEXT DEFAULT ''"],['forms_url',"TEXT DEFAULT ''"],['photo_url',"TEXT DEFAULT ''"]]; for(const [col,type] of migrations){try{db.exec(`ALTER TABLE institutions ADD COLUMN ${col} ${type}`)}catch{}}

for (const [col,type] of [['assigned_institution_id','INTEGER'],['priority',"TEXT DEFAULT 'Normal'"],['due_date',"TEXT DEFAULT ''"]]) { try { db.exec(`ALTER TABLE service_requests ADD COLUMN ${col} ${type}`); } catch {} }

for (const [col,type] of [['citizen_id','INTEGER']]) { try { db.exec(`ALTER TABLE service_requests ADD COLUMN ${col} ${type}`); } catch {} }
try { db.exec("ALTER TABLE office_services ADD COLUMN workflow_schema TEXT DEFAULT '[]'"); } catch {}
try { db.exec(`ALTER TABLE notifications ADD COLUMN citizen_id INTEGER`); } catch {}
try { db.exec(`ALTER TABLE notifications ADD COLUMN read_at TEXT DEFAULT ''`); } catch {}

for (const [col,type] of [['full_name',"TEXT DEFAULT ''"],['role',"TEXT DEFAULT 'superadmin'"],['institution_id','INTEGER'],['active','INTEGER DEFAULT 1'],['last_login_at',"TEXT DEFAULT ''"]]) { try { db.exec(`ALTER TABLE admins ADD COLUMN ${col} ${type}`); } catch {} }

for (const [col,type] of [['form_data',"TEXT DEFAULT '{}'"],['current_step_key',"TEXT DEFAULT ''"],['workflow_schema_snapshot',"TEXT DEFAULT '[]'"]]) { try { db.exec(`ALTER TABLE service_requests ADD COLUMN ${col} ${type}`); } catch {} }
