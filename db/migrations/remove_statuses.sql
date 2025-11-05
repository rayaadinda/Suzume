-- Migration: Remove Technical Review and Paused statuses
-- Date: 2025-11-05

-- First, update any tasks that are using the removed statuses
-- Move technical-review tasks to in-progress
UPDATE tasks 
SET status_id = 'in-progress', updated_at = NOW()
WHERE status_id = 'technical-review';

-- Move paused tasks to to-do
UPDATE tasks 
SET status_id = 'to-do', updated_at = NOW()
WHERE status_id = 'paused';

-- Now delete the statuses
DELETE FROM statuses WHERE id = 'technical-review';
DELETE FROM statuses WHERE id = 'paused';

-- Update display_order for remaining statuses
UPDATE statuses SET display_order = 0 WHERE id = 'backlog';
UPDATE statuses SET display_order = 1 WHERE id = 'to-do';
UPDATE statuses SET display_order = 2 WHERE id = 'in-progress';
UPDATE statuses SET display_order = 3 WHERE id = 'completed';
