/**
 * Inventory & Procurement Service
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError } from "../../middleware/errorHandler.js";

const T="tenant-001",H="hosp-001";

export async function getItems({page=1,limit=50,search,category,tenantId,hospitalId}={}){
  const db=getDb();const offset=(page-1)*limit;
  const where=["i.hospital_id=?","i.is_active=1"];const params=[hospitalId||H];
  if(search){where.push("LOWER(i.name) LIKE ?");params.push(`%${search.toLowerCase()}%`);}
  if(category){where.push("i.category=?");params.push(category);}
  const cond=where.join(" AND ");
  const total=(await db.prepare(`SELECT COUNT(*) as n FROM inventory_items i WHERE ${cond}`).get(...params))?.n??0;
  const rows=await db.prepare(`SELECT * FROM inventory_items i WHERE ${cond} ORDER BY i.name LIMIT ? OFFSET ?`).all(...params,limit,offset);
  return{data:rows.map(fmt),meta:{total,page:+page,limit:+limit,totalPages:Math.ceil(total/limit)}};
}

export async function getItemById(id){
  const db=getDb();
  const i=await db.prepare(`SELECT * FROM inventory_items WHERE id=?`).get(id);
  if(!i)throw new NotFoundError("Inventory item");
  return fmt(i);
}

export async function createItem(data,createdBy,tenantId,hospitalId){
  const db=getDb();const id=`itm-${uuidv4().slice(0,8)}`;
  await db.prepare(`INSERT INTO inventory_items (id,tenant_id,hospital_id,name,category,unit,current_stock,reorder_level,unit_cost,location) VALUES(?,?,?,?,?,?,?,?,?,?)`).run(id,tenantId||T,hospitalId||H,data.name,data.category||"General",data.unit||"piece",data.currentStock||0,data.reorderLevel||10,data.unitCost||null,data.location||null);
  return getItemById(id);
}

export async function updateItem(id,data){
  const db=getDb();
  const i=await db.prepare(`SELECT id FROM inventory_items WHERE id=?`).get(id);
  if(!i)throw new NotFoundError("Inventory item");
  const fields=[];const vals=[];
  const map={name:"name",category:"category",unit:"unit",reorderLevel:"reorder_level",unitCost:"unit_cost",location:"location",isActive:"is_active"};
  for(const[k,col]of Object.entries(map)){if(data[k]!==undefined){fields.push(`${col}=?`);vals.push(data[k]);}}
  if(!fields.length)return getItemById(id);
  fields.push("updated_at=datetime('now')");vals.push(id);
  await db.prepare(`UPDATE inventory_items SET ${fields.join(",")} WHERE id=?`).run(...vals);
  return getItemById(id);
}

export async function issueStock(id,qty,destination,userId){
  const db=getDb();
  const i=await db.prepare(`SELECT * FROM inventory_items WHERE id=?`).get(id);
  if(!i)throw new NotFoundError("Inventory item");
  if(i.current_stock<qty)throw new Error(`Insufficient stock. Available: ${i.current_stock}`);
  await db.prepare(`UPDATE inventory_items SET current_stock=current_stock-?, updated_at=datetime('now') WHERE id=?`).run(qty,id);
  await db.prepare(`INSERT INTO stock_movements (id,item_id,tenant_id,movement_type,quantity,to_location,created_by) VALUES(?,?,?,'issued',?,?,?)`).run(`mov-${uuidv4().slice(0,8)}`,id,i.tenant_id,qty,destination||null,userId);
  return getItemById(id);
}

export async function receiveStock(id,qty,reference,userId){
  const db=getDb();
  const i=await db.prepare(`SELECT id,tenant_id FROM inventory_items WHERE id=?`).get(id);
  if(!i)throw new NotFoundError("Inventory item");
  await db.prepare(`UPDATE inventory_items SET current_stock=current_stock+?, updated_at=datetime('now') WHERE id=?`).run(qty,id);
  await db.prepare(`INSERT INTO stock_movements (id,item_id,tenant_id,movement_type,quantity,reference,created_by) VALUES(?,?,?,'received',?,?,?)`).run(`mov-${uuidv4().slice(0,8)}`,id,i.tenant_id,qty,reference||null,userId);
  return getItemById(id);
}

export async function getLowStockAlerts(hospitalId){
  const db=getDb();
  return(await db.prepare(`SELECT * FROM inventory_items WHERE hospital_id=? AND current_stock<=reorder_level AND is_active=1 ORDER BY current_stock ASC`).all(hospitalId||H)).map(fmt);
}

export async function getPurchaseRequests({page=1,limit=20,status,tenantId,hospitalId}={}){
  const db=getDb();const offset=(page-1)*limit;
  const where=["pr.hospital_id=?"];const params=[hospitalId||H];
  if(status){where.push("pr.status=?");params.push(status);}
  const cond=where.join(" AND ");
  const total=(await db.prepare(`SELECT COUNT(*) as n FROM purchase_requests pr WHERE ${cond}`).get(...params))?.n??0;
  const rows=await db.prepare(`SELECT pr.*,u.first_name||' '||u.last_name as requested_by_name FROM purchase_requests pr LEFT JOIN users u ON u.id=pr.requested_by WHERE ${cond} ORDER BY pr.created_at DESC LIMIT ? OFFSET ?`).all(...params,limit,offset);
  return{data:rows.map(fmtPR),meta:{total,page:+page,limit:+limit,totalPages:Math.ceil(total/limit)}};
}

export async function createPurchaseRequest(data,userId,tenantId,hospitalId){
  const db=getDb();const id=`pr-${uuidv4().slice(0,8)}`;
  const num=`PR-${new Date().getFullYear()}-${uuidv4().slice(0,6).toUpperCase()}`;
  await db.prepare(`INSERT INTO purchase_requests (id,tenant_id,hospital_id,request_number,items,status,requested_by,notes) VALUES(?,?,?,?,?,?,?,?)`).run(id,tenantId||T,hospitalId||H,num,JSON.stringify(data.items||[]),"pending",userId,data.notes||null);
  const pr=await db.prepare(`SELECT pr.*,u.first_name||' '||u.last_name as requested_by_name FROM purchase_requests pr LEFT JOIN users u ON u.id=pr.requested_by WHERE pr.id=?`).get(id);
  return fmtPR(pr);
}

export async function approvePurchaseRequest(id,userId){
  const db=getDb();
  await db.prepare(`UPDATE purchase_requests SET status='approved',approved_by=?,approved_at=datetime('now'),updated_at=datetime('now') WHERE id=?`).run(userId,id);
  const pr=await db.prepare(`SELECT pr.*,u.first_name||' '||u.last_name as requested_by_name FROM purchase_requests pr LEFT JOIN users u ON u.id=pr.requested_by WHERE pr.id=?`).get(id);
  if(!pr)throw new NotFoundError("Purchase request");
  return fmtPR(pr);
}

function fmt(i){return{id:i.id,name:i.name,category:i.category,unit:i.unit,currentStock:i.current_stock,reorderLevel:i.reorder_level,unitCost:i.unit_cost,location:i.location,isActive:Boolean(i.is_active),lowStock:i.current_stock<=i.reorder_level,tenantId:i.tenant_id,hospitalId:i.hospital_id,createdAt:i.created_at,updatedAt:i.updated_at};}
function fmtPR(p){return{id:p.id,requestNumber:p.request_number,items:safeJson(p.items)||[],status:p.status,requestedBy:p.requested_by,requestedByName:p.requested_by_name,approvedBy:p.approved_by,approvedAt:p.approved_at,notes:p.notes,createdAt:p.created_at,updatedAt:p.updated_at};}
function safeJson(v){try{return v?JSON.parse(v):null;}catch{return v;}}
