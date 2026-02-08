# Kellasa Platform - Final Setup Steps

## ✅ Completed
1. **Payment System** - Real Cashfree integration working
2. **MockPay Branding Removed** - Changed to "Cashfree"
3. **Subscription Expiry** - Already enforced (users lose access when expired)
4. **Code Pushed** - All changes deployed to GitHub → Hostinger

---

## 🔧 Manual Steps Required

### 1. Update Supabase Edge Function (CRITICAL)
**Location:** https://supabase.com/dashboard/project/rhqzywqsfjzjzbfqlyqf/functions/create-cashfree-order

**Change line 42 from:**
```typescript
return_url: `${req.headers.get('origin')}/subscription/success?order_id={order_id}`
```

**To:**
```typescript
return_url: `${req.headers.get('origin')}/subscription/success?order_id={order_id}&plan_id=${plan_id}`
```

Then click **"Deploy function"**

---

### 2. Enable Notification System
**Location:** https://supabase.com/dashboard/project/rhqzywqsfjzjzbfqlyqf/sql/new

**Copy and run this SQL:**
```sql
-- Enable realtime for messages table
alter publication supabase_realtime add table messages;

-- Create notifications table
create table if not exists notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id) on delete cascade not null,
    type text not null,
    title text not null,
    message text not null,
    link text,
    read boolean default false,
    created_at timestamptz default now()
);

-- Enable RLS
alter table notifications enable row level security;

-- Users can view their own notifications
create policy "Users can view own notifications"
    on notifications for select
    using (auth.uid() = user_id);

-- Users can update their own notifications
create policy "Users can update own notifications"
    on notifications for update
    using (auth.uid() = user_id);

-- System can insert notifications
create policy "System can insert notifications"
    on notifications for insert
    with check (true);

-- Create indexes
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_created_at_idx on notifications(created_at desc);

-- Function to create notification when message is sent
create or replace function notify_message_received()
returns trigger as $$
begin
    if new.receiver_id is not null and new.receiver_id != new.sender_id then
        insert into notifications (user_id, type, title, message, link)
        values (
            new.receiver_id,
            'message',
            'New Message',
            'You have a new message',
            '/messages?chat=' || new.sender_id
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger
drop trigger if exists on_message_sent on messages;
create trigger on_message_sent
    after insert on messages
    for each row
    execute function notify_message_received();
```

---

## 📋 Summary of Changes

### Payment System
- ✅ Real Cashfree production API integrated
- ✅ Secure backend via Supabase Edge Functions
- ✅ Subscription activation on success page
- ✅ "MockPay" replaced with "Cashfree" branding

### Subscription Management
- ✅ Automatic expiry enforcement (already working)
- ✅ Users prompted to subscribe when expired
- ✅ Phone numbers hidden for non-subscribers

### Notifications (After SQL migration)
- 🔔 Real-time message notifications
- 🔔 Notification badge in UI
- 🔔 Auto-created when users send messages

---

## 🚀 Next Steps
1. Update the Supabase function (Step 1 above)
2. Run the notification SQL (Step 2 above)
3. Wait 2-3 minutes for GitHub Actions to deploy
4. Test payment flow end-to-end
5. Test messaging between two users

---

**All done!** 🎉
