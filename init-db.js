import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';
const email = process.env.ADMIN_EMAIL || 'admin@enewari.gov.et';
const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const hash = bcrypt.hashSync(password, 12);
const exists = db.prepare('SELECT id FROM admins WHERE email=?').get(email);
if (!exists) db.prepare('INSERT INTO admins(email,password_hash,full_name,role,active) VALUES(?,?,?,?,1)').run(email, hash, 'System Administrator', 'superadmin'); else db.prepare("UPDATE admins SET role=COALESCE(NULLIF(role,''),'superadmin'), active=1 WHERE id=?").run(exists.id);
const count = db.prepare('SELECT COUNT(*) c FROM institutions').get().c;
if (!count) {
 const rows = [
 ['ከንቲባ ፅ/ቤት','Mayor\'s Office','የከንቲባው ፅ/ቤት መረጃና አገልግሎቶች','Mayor office information and services','🏛️'],
 ['ከተማና መሰረተልማት ፅ/ቤት','Urban & Infrastructure Office','የከተማ ልማትና መሰረተልማት መረጃ','Urban development and infrastructure information','🏗️'],
 ['መሬት ፅ/ቤት','Land Administration Office','የመሬት አስተዳደርና አገልግሎቶች','Land administration and services','🏠'],
 ['ኢንቨስትመንት ፅ/ቤት','Investment Office','የኢንቨስትመንት እድሎችና መረጃ','Investment opportunities and information','📈'],
 ['ገንዘብ ፅ/ቤት','Finance Office','የፋይናንስና በጀት መረጃ','Finance and budget information','💼'],
 ['ሴቶች፣ ህፃናት እና ወጣቶች ፅ/ቤት','Women, Children & Youth Office','የሴቶች፣ ህፃናትና ወጣቶች ጉዳይ አገልግሎቶች','Services for women, children and youth','👩‍👧'],
 ['ስፖርትና ባህል ቱሪዝም ፅ/ቤት','Sport, Culture & Tourism Office','ስፖርት፣ ባህልና ቱሪዝም መረጃ','Sport, culture and tourism information','🎭'],
 ['ገቢዎች ፅ/ቤት','Revenue Office','የግብርና ገቢ አገልግሎቶች','Tax and revenue services','💰'],
 ['ስራና ክህሎት ፅ/ቤት','Labor & Skills Office','የስራና ክህሎት አገልግሎቶች','Labor and skills services','🛠️'],
 ['ንግድ ፅ/ቤት','Trade Office','የንግድ ፈቃድና የገበያ መረጃ','Trade licensing and market information','🛒'],
 ['ምክር ቤት','City Council','የከተማ ምክር ቤት መረጃ','City council information','⚖️'],
 ['ፖሊስ ፅ/ቤት','Police Office','የደህንነትና ትራፊክ መረጃ','Safety and traffic information','🚓']
 ];
 const stmt=db.prepare('INSERT INTO institutions(name_am,name_en,description_am,description_en,icon) VALUES(?,?,?,?,?)');
 const tx=db.transaction(()=>rows.forEach(r=>stmt.run(...r))); tx();
}
const newsCount=db.prepare('SELECT COUNT(*) c FROM news').get().c;
if(!newsCount){
 const news=[
  ['የእነዋሪ ከተማ የUrban Profile ሰነድ ታትሟል','Enewari Town Urban Profile published','የከተማና መሰረተልማት ሚኒስቴር የEnewari Town Urban Profile ሰነድ በ2025 አሳትሟል። ሰነዱ የከተማውን አስተዳደራዊ መዋቅር፣ ህዝብ፣ መሰረተልማት፣ ኢኮኖሚ እና ባህል/ቱሪዝም ይዘረዝራል።','The Ministry of Urban and Infrastructure published the Enewari Town Urban Profile in 2025. It covers administration, population, infrastructure, economy, culture and tourism.'],
  ['የእነዋሪ ከተማ የ2023 የህዝብ ትንበያ 15,978 ነው','Enewari Town population projection: 15,978','የኢትዮጵያ ስታቲስቲካዊ አገልግሎት 2023 የህዝብ ትንበያ መሠረት ከተማዋ 15,978 ህዝብ እንዳላት የከተማው መገለጫ ያሳያል።','The city profile reports a 2023 population projection of 15,978 based on Ethiopian Statistical Service data.']
 ];
 const stmt=db.prepare('INSERT INTO news(title_am,title_en,body_am,body_en,published) VALUES(?,?,?,?,1)');
 const tx=db.transaction(()=>news.forEach(r=>stmt.run(...r))); tx();
}
const defaults={city_name_am:'እነዋሪ ከተማ አስተዳደር',city_name_en:'Enewari City Administration',address:'እነዋሪ ከተማ፣ ሞረትና ጅሩ ወረዳ፣ ሰሜን ሸዋ ዞን፣ አማራ ክልል፣ ኢትዮጵያ',phone:'0919812680',email:'enewaricity@gmail.com',facebook:'https://www.facebook.com/share/1YFTVApnwm/',tiktok:'https://www.tiktok.com/@.enewari.city?_r=1&_t=ZS-9AHXy4eir12',map_url:'https://www.openstreetmap.org/?mlat=9.8922&mlon=39.1464#map=14/9.8922/39.1464',work_hours:'',about_am:'',about_en:'',mission_am:'',mission_en:'',vision_am:'',vision_en:'',mayor_name_am:'',mayor_name_en:'',city_profile_am:'',city_profile_en:'',population:'',area_ha:'',kebele_count:'',elevation_m:'',coordinates:'',profile_source_name:'',profile_source_url:'',footer_text_am:'',footer_text_en:'',privacy_url:'',terms_url:'',certificate_org_name_am:'',certificate_org_name_en:'',certificate_signatory_am:'',certificate_signatory_en:'',certificate_title_am:'',certificate_title_en:''}; const put=db.prepare('INSERT OR IGNORE INTO site_settings(key,value) VALUES(?,?)'); for(const [k,v] of Object.entries(defaults)) put.run(k,v);

const svcCount=db.prepare('SELECT COUNT(*) c FROM office_services').get().c;
if(!svcCount){
 const services=[
  [2,'water','የውሃ አገልግሎት','Water Service','የውሃ ጥያቄ እና ቅሬታ','Water service requests and complaints',0,3,'', '[{"name":"meter_no","label_am":"የሜትር ቁጥር","label_en":"Meter Number","type":"text","required":false}]'],
  [8,'tax','የግብር አገልግሎት','Tax Service','የግብርና ገቢ አገልግሎት ጥያቄ','Tax and revenue service request',0,5,'TIN/መታወቂያ','[{"name":"tin","label_am":"TIN ቁጥር","label_en":"TIN Number","type":"text","required":false}]'],
  [12,'traffic','የትራፊክ ቅጣት ጥያቄ','Traffic Fine Inquiry','የትራፊክ ቅጣት መረጃ ጥያቄ','Traffic fine inquiry',0,3,'መታወቂያ','[{"name":"plate_no","label_am":"የመኪና ታርጋ","label_en":"Plate Number","type":"text","required":true}]'],
  [10,'trade','የንግድ ፈቃድ ጥያቄ','Trade License Request','የንግድ ፈቃድ አገልግሎት','Trade licensing service',0,7,'መታወቂያ,የንግድ ሰነድ','[{"name":"business_name","label_am":"የንግድ ስም","label_en":"Business Name","type":"text","required":true}]'],
  [3,'land','የመሬት አገልግሎት ጥያቄ','Land Service Request','የመሬት አስተዳደር ጥያቄ','Land administration request',0,10,'መታወቂያ','[{"name":"parcel_no","label_am":"የመሬት መለያ/ፓርሴል ቁጥር","label_en":"Parcel Number","type":"text","required":false}]'],
  [1,'complaint','የዜጎች ቅሬታ/ጥቆማ','Citizen Complaint/Feedback','ቅሬታ፣ ጥቆማ ወይም አስተያየት','Citizen complaint, feedback or suggestion',0,5,'','[{"name":"category","label_am":"የቅሬታ ምድብ","label_en":"Category","type":"text","required":false}]'],
  [1,'general','አጠቃላይ የአገልግሎት ጥያቄ','General Service Request','አጠቃላይ የከተማ አገልግሎት ጥያቄ','General city service request',0,5,'','[]']
 ];
 const st=db.prepare('INSERT INTO office_services(institution_id,service_key,name_am,name_en,description_am,description_en,fee,estimated_days,required_documents,form_schema) VALUES(?,?,?,?,?,?,?,?,?,?)');
 const tx=db.transaction(()=>services.forEach(r=>st.run(...r))); tx();
}

console.log(`Database ready. Admin: ${email}`);
