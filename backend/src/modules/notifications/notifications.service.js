/**
 * Notifications Service — in-app notifications with SMS/email stubs.
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";

export async function createNotification({ tenantId, userId, patientId, type="info", title, message, channel="in-app", metadata }){
  const db=getDb();const id=`notif-${uuidv4().slice(0,8)}`;
  await db.prepare(`INSERT INTO notifications (id,tenant_id,user_id,patient_id,type,title,message,channel,status,metadata) VALUES(?,?,?,?,?,?,?,?,?,?)`).run(id,tenantId||null,userId||null,patientId||null,type,title,message,channel,"delivered",metadata?JSON.stringify(metadata):null);
  return getById(id);
}

export async function getById(id){
  const db=getDb();
  return db.prepare(`SELECT * FROM notifications WHERE id=?`).get(id);
}

export async function getUserNotifications(userId,{page=1,limit=20,unreadOnly}={}){
  const db=getDb();const offset=(page-1)*limit;
  const where=["user_id=?"];const params=[userId];
  if(unreadOnly){where.push("read_at IS NULL");}
  const cond=where.join(" AND ");
  const total=(await db.prepare(`SELECT COUNT(*) as n FROM notifications WHERE ${cond}`).get(...params))?.n??0;
  const rows=await db.prepare(`SELECT * FROM notifications WHERE ${cond} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params,limit,offset);
  return{data:rows.map(fmt),meta:{total,page:+page,limit:+limit,totalPages:Math.ceil(total/limit)},unreadCount:rows.filter(r=>!r.read_at).length};
}

export async function markRead(id,userId){
  const db=getDb();
  await db.prepare(`UPDATE notifications SET read_at=datetime('now') WHERE id=? AND user_id=?`).run(id,userId);
}

export async function markAllRead(userId){
  const db=getDb();
  await db.prepare(`UPDATE notifications SET read_at=datetime('now') WHERE user_id=? AND read_at IS NULL`).run(userId);
}

export async function getUnreadCount(userId){
  const db=getDb();
  const r=await db.prepare(`SELECT COUNT(*) as n FROM notifications WHERE user_id=? AND read_at IS NULL`).get(userId);
  return r?.n??0;
}

// Convenience: send critical alert to a specific user
export async function sendCriticalAlert(toUserId, title, message, tenantId, patientId){
  return createNotification({tenantId,userId:toUserId,patientId,type:"danger",title,message,channel:"in-app"});
}

function fmt(n){
  return{id:n.id,tenantId:n.tenant_id,userId:n.user_id,patientId:n.patient_id,type:n.type,title:n.title,message:n.message,channel:n.channel,status:n.status,readAt:n.read_at,sentAt:n.sent_at,metadata:safeJson(n.metadata),createdAt:n.created_at};
}
function safeJson(v){try{return v?JSON.parse(v):null;}catch{return v;}}
