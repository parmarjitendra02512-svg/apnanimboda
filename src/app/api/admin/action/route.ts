import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Centralized admin auth check
    const { error } = await verifyAuth(true);
    if (error) return error;

    const body = await req.json();
    const { action, payload } = body;
    const db = await getServerDb();

    // Password Reset Actions
    if (action === "approve_reset") {
      const { mobile, newPasswordHash } = payload;
      await db.ref(`approved_users/${mobile}`).update({ passwordHash: newPasswordHash });
      await db.ref(`pending_resets/${mobile}`).remove();
      return NextResponse.json({ success: true });
    }

    if (action === "reject_reset") {
      const { mobile } = payload;
      await db.ref(`pending_resets/${mobile}`).remove();
      return NextResponse.json({ success: true });
    }

    // Mobile Number Update Actions
    if (action === "approve_mobile_update") {
      const { oldMobile, newMobile } = payload;
      
      // 1. Fetch user data from Firebase
      const userSnap = await db.ref(`approved_users/${oldMobile}`).get();
      if (!userSnap.exists()) {
        return NextResponse.json({ error: "User data not found in Firebase" }, { status: 404 });
      }
      
      const userData = userSnap.val();
      userData.mobile = newMobile; // Update mobile number in object

      // 2. Update Supabase users table
      const { getServerSupabase } = await import("@/lib/supabase-server");
      const supabase = getServerSupabase();
      
      const { error: sbError } = await supabase
        .from("users")
        .update({ mobile: newMobile })
        .eq("mobile", oldMobile);

      if (sbError) {
        console.error("Supabase update error:", sbError);
        return NextResponse.json({ error: "Failed to update Supabase" }, { status: 500 });
      }

      // 3. Move Firebase data
      await db.ref(`approved_users/${newMobile}`).set(userData);
      await db.ref(`approved_users/${oldMobile}`).remove();
      
      // 4. Clean up pending request
      await db.ref(`pending_mobile_updates/${oldMobile}`).remove();
      
      // 5. Update auth_requests status
      await supabase
        .from("auth_requests")
        .update({ status: "approved" })
        .eq("mobile", oldMobile)
        .eq("request_type", "mobile_update")
        .eq("status", "pending");

      return NextResponse.json({ success: true });
    }

    if (action === "reject_mobile_update") {
      const { oldMobile } = payload;
      
      await db.ref(`pending_mobile_updates/${oldMobile}`).remove();
      
      const { getServerSupabase } = await import("@/lib/supabase-server");
      const supabase = getServerSupabase();
      await supabase
        .from("auth_requests")
        .update({ status: "rejected" })
        .eq("mobile", oldMobile)
        .eq("request_type", "mobile_update")
        .eq("status", "pending");

      return NextResponse.json({ success: true });
    }

    // Directory Actions
    if (action === "approve_user") {
      const { req: userReq } = payload;
      await db.ref(`approved_users/${userReq.id}`).set({
        ...userReq,
        status: "approved",
        approvedAt: Date.now(),
      });
      await db.ref(`pending_requests/${userReq.id}`).remove();

      const chatId = ["admin_config_master", userReq.id].sort().join("_");
      await db.ref(`chats/${chatId}/messages/${Date.now()}`).set({
        text: "Welcome to Apna Nimboda! Your account has been approved by the Administrator. If you need any help, you can reply here.",
        senderId: "admin_config_master",
        timestamp: Date.now(),
      });
      return NextResponse.json({ success: true });
    }

    if (action === "reject_user") {
      const { req: userReq, reason } = payload;
      await db.ref(`rejected_users/${userReq.mobile}`).set({
        reason,
        timestamp: Date.now(),
      });
      await db.ref(`pending_requests/${userReq.id}`).remove();
      return NextResponse.json({ success: true });
    }

    if (action === "approve_edit") {
      const { edit } = payload;
      const { id, status, timestamp, ...changes } = edit;
      await db.ref(`approved_users/${id}`).update(changes);
      await db.ref(`pending_edits/${id}`).remove();
      await db.ref(`notifications/${id}/${Date.now()}`).set({
        title: "Profile Approved",
        message: "Your profile changes have been approved.",
        timestamp: Date.now(),
        read: false,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "reject_edit") {
      const { editId, id } = payload;
      await db.ref(`pending_edits/${editId}`).remove();
      await db.ref(`notifications/${id}/${Date.now()}`).set({
        title: "Profile Changes Rejected",
        message: "Your recent profile changes were rejected by the admin.",
        timestamp: Date.now(),
        read: false,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "delete_user") {
      const { mobile, id } = payload;
      const keysToRemove = [id, mobile].filter(Boolean);
      
      for (const key of keysToRemove) {
        await db.ref(`approved_users/${key}`).remove();
        await db.ref(`archived_users/${key}`).remove();
        await db.ref(`banned_users/${key}`).remove();
        await db.ref(`pending_requests/${key}`).remove();
        await db.ref(`rejected_users/${key}`).remove();
        await db.ref(`users/${key}`).remove();
      }
      return NextResponse.json({ success: true });
    }

    if (action === "archive_user") {
      const { user } = payload;
      await db.ref(`archived_users/${user.id || user.mobile}`).set({
        ...user,
        archivedAt: Date.now(),
      });
      if (user.mobile) {
        await db.ref(`rejected_users/${user.mobile}`).set({
          reason: user.deleteReason || "Archived by admin",
          timestamp: Date.now(),
        });
        await db.ref(`approved_users/${user.mobile}`).remove();
        await db.ref(`users/${user.mobile}`).remove();
      }
      if (user.id) {
        await db.ref(`approved_users/${user.id}`).remove();
      }
      return NextResponse.json({ success: true });
    }

    if (action === "unarchive_user") {
      const { user } = payload;
      await db.ref(`approved_users/${user.id}`).update({
        ...user,
        status: "approved",
      });
      if (user.mobile) {
        await db.ref(`rejected_users/${user.mobile}`).remove();
      }
      await db.ref(`archived_users/${user.id}`).remove();
      return NextResponse.json({ success: true });
    }

    if (action === "ban_user") {
      const { banModalUser, bannedUntil } = payload;
      await db.ref(`banned_users/${banModalUser.mobile}`).set({
        name: banModalUser.name,
        bannedAt: Date.now(),
        bannedUntil,
        id: banModalUser.id,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "unban_user") {
      const { mobile } = payload;
      await db.ref(`banned_users/${mobile}`).remove();
      return NextResponse.json({ success: true });
    }

    // Direct Edit
    if (action === "direct_edit_user") {
      const { editingUser } = payload;
      await db.ref(`approved_users/${editingUser.id}`).set(editingUser);
      return NextResponse.json({ success: true });
    }

    if (action === "batch_upload_users") {
      const { users } = payload;
      const updates: any = {};
      users.forEach((u: any) => {
        if (u.id) {
          updates[`approved_users/${u.id}`] = {
            ...u,
            status: "approved",
            approvedAt: Date.now(),
          };
        }
      });
      await db.ref().update(updates);
      return NextResponse.json({ success: true });
    }
    if (action === "delete_bulk_users") {
      const snapshot = await db.ref("approved_users").get();
      if (snapshot.exists()) {
        const users = snapshot.val();
        const updates: any = {};
        let count = 0;
        for (const [key, user] of Object.entries(users)) {
          // Bulk uploaded users have ID starting with 'u_'
          if (key.startsWith("u_")) {
            updates[`approved_users/${key}`] = null;
            count++;
          }
        }
        if (count > 0) {
          await db.ref().update(updates);
        }
      }
      return NextResponse.json({ success: true });
    }

    // Settings
    if (action === "save_admin_setting") {
      const { path, value } = payload;
      if (value === null) {
        await db.ref(`admin_settings/${path}`).remove();
      } else {
        await db.ref(`admin_settings/${path}`).set(value);
      }
      return NextResponse.json({ success: true });
    }
    
    // Broadcast Message
    if (action === "send_broadcast") {
      const { message, approvedUsers } = payload;
      const updates: any = {};
      approvedUsers.forEach((u: any) => {
        updates[`notifications/${u.id}/${Date.now()}`] = {
          title: "Admin Announcement",
          message,
          timestamp: Date.now(),
          read: false,
        };
      });
      await db.ref().update(updates);
      return NextResponse.json({ success: true });
    }

    // System Actions
    if (action === "clear_system_logs") {
      await db.ref("system_logs").remove();
      return NextResponse.json({ success: true });
    }
    
    if (action === "resolve_chat") {
      const { chatId } = payload;
      await db.ref(`support_chats/${chatId}/meta`).update({
        status: "resolved",
        resolvedAt: Date.now(),
      });
      return NextResponse.json({ success: true });
    }

    if (action === "send_chat_message") {
      const { chatId, message } = payload;
      const msgKey = Date.now().toString();
      await db.ref(`chats/${chatId}/messages/${msgKey}`).update(message);
      return NextResponse.json({ success: true });
    }

    if (action === "send_support_chat") {
      const { chatId, message, meta } = payload;
      if (meta) {
        await db.ref(`support_chats/${chatId}/meta`).update(meta);
      }
      if (message) {
        await db.ref(`support_chats/${chatId}/messages/${Date.now()}`).set(message);
      }
      return NextResponse.json({ success: true });
    }

    if (action === "delete_chat_message") {
      const { chatId, msgKey } = payload;
      await db.ref(`chats/${chatId}/messages/${msgKey}`).update({
        isDeleted: true,
        deletedByAdmin: true,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
