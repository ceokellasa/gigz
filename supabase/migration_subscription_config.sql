-- Upgrading site_settings content to support JSON type dynamically
-- Only needed if the previous insert failed or if we want to ensure the column is treated correctly, 
-- but since we use a generic 'text' column for values and a 'type' column for UI hinting, 
-- the previous migration is sufficient. This file is a placeholder/confirmation.
-- The actual 'value' column is text, so it holds the JSON string fine.

-- Re-running the insert just to be safe
insert into site_settings (key, value, label, type)
values (
    'subscription_plans', 
    '[{"id":"1_day","name":"1 Day Pass","price":49,"duration_days":1,"features":["Access to all contact numbers","Unlimited job views","Direct messaging"],"popular":false},{"id":"1_week","name":"Weekly Pro","price":270,"duration_days":7,"features":["Access to all contact numbers","Unlimited job views","Direct messaging","Priority support"],"popular":true},{"id":"1_month","name":"Monthly Elite","price":1000,"duration_days":30,"features":["Access to all contact numbers","Unlimited job views","Direct messaging","Priority support","Featured profile"],"popular":false}]', 
    'Subscription Plans JSON', 
    'json'
) on conflict (key) do nothing;
