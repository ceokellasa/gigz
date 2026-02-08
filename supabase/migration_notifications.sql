-- Create notifications table
create table if not exists notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id) on delete cascade not null,
    type text not null, -- 'message', 'gig_update', 'subscription', etc.
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

-- Users can update their own notifications (mark as read)
create policy "Users can update own notifications"
    on notifications for update
    using (auth.uid() = user_id);

-- System can insert notifications
create policy "System can insert notifications"
    on notifications for insert
    with check (true);

-- Create index for faster queries
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_created_at_idx on notifications(created_at desc);

-- Function to create notification when message is sent
create or replace function notify_message_received()
returns trigger as $$
begin
    -- Only create notification if receiver is not the sender
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

-- Create trigger for message notifications
drop trigger if exists on_message_sent on messages;
create trigger on_message_sent
    after insert on messages
    for each row
    execute function notify_message_received();
