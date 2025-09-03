-- Add Contact Tracking Fields to user_interactions table
-- This enables tracking of lead generation activities

-- Add contact form submission tracking
ALTER TABLE user_interactions 
ADD COLUMN IF NOT EXISTS contact_form_submitted BOOLEAN DEFAULT FALSE;

-- Add phone click tracking  
ALTER TABLE user_interactions 
ADD COLUMN IF NOT EXISTS phone_clicked BOOLEAN DEFAULT FALSE;

-- Add WhatsApp click tracking
ALTER TABLE user_interactions 
ADD COLUMN IF NOT EXISTS whatsapp_clicked BOOLEAN DEFAULT FALSE;

-- Add index for better query performance on contact tracking
CREATE INDEX IF NOT EXISTS idx_user_interactions_contact_tracking 
ON user_interactions(contact_form_submitted, phone_clicked, whatsapp_clicked);

-- Add index for product context in contact interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_product_contact 
ON user_interactions(product_id, contact_form_submitted, phone_clicked, whatsapp_clicked);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_interactions' 
AND column_name IN ('contact_form_submitted', 'phone_clicked', 'whatsapp_clicked');

-- Show sample data structure
SELECT 
  session_id,
  product_id,
  contact_form_submitted,
  phone_clicked,
  whatsapp_clicked,
  timestamp
FROM user_interactions 
WHERE contact_form_submitted = true 
   OR phone_clicked = true 
   OR whatsapp_clicked = true
LIMIT 5;
