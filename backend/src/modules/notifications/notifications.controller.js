import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./notifications.service.js";
export const list      = asyncHandler(async(req,res)=>res.json(await svc.getUserNotifications(req.user.id,req.query)));
export const unread    = asyncHandler(async(req,res)=>res.json({count:await svc.getUnreadCount(req.user.id)}));
export const markRead  = asyncHandler(async(req,res)=>{await svc.markRead(req.params.id,req.user.id);res.json({ok:true});});
export const markAll   = asyncHandler(async(req,res)=>{await svc.markAllRead(req.user.id);res.json({ok:true});});
