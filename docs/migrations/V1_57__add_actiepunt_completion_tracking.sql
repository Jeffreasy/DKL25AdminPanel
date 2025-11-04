-- Migration: V1_57__add_actiepunt_completion_tracking.sql
-- Description: Add completion tracking fields to action items (actiepunten)
-- Date: 2025-11-04

-- Add completion tracking columns to notulen table
-- Note: Since actiepunten is stored as JSONB, we need to update the structure
-- This migration will update existing records to include the new completion fields

-- Update existing actiepunten JSONB structure to include completion tracking
-- This is a data migration that adds completion fields to existing action items

-- Create a function to update existing actiepunten with completion tracking
CREATE OR REPLACE FUNCTION add_completion_tracking_to_actiepunten()
RETURNS void AS $$
DECLARE
    notulen_record RECORD;
    updated_acties jsonb;
    actie_item jsonb;
BEGIN
    -- Loop through all notulen records
    FOR notulen_record IN SELECT id, actiepunten FROM notulen WHERE actiepunten IS NOT NULL LOOP
        -- Initialize updated acties array
        updated_acties := '[]'::jsonb;

        -- Process each actie in the acties array
        FOR actie_item IN SELECT * FROM jsonb_array_elements((notulen_record.actiepunten->'acties')) LOOP
            -- Add completion tracking fields to each actie
            actie_item := jsonb_set(
                actie_item,
                '{voltooid}',
                'false'::jsonb
            );

            -- Add to updated array
            updated_acties := updated_acties || jsonb_build_array(actie_item);
        END LOOP;

        -- Update the record with new structure
        UPDATE notulen
        SET actiepunten = jsonb_set(
            actiepunten,
            '{acties}',
            updated_acties
        ),
        updated_at = NOW()
        WHERE id = notulen_record.id;
    END LOOP;

    RAISE NOTICE 'Updated % notulen records with completion tracking for actiepunten', (SELECT COUNT(*) FROM notulen WHERE actiepunten IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update existing data
SELECT add_completion_tracking_to_actiepunten();

-- Drop the function as it's no longer needed
DROP FUNCTION add_completion_tracking_to_actiepunten();

-- Create index for efficient querying of completed action items
CREATE INDEX IF NOT EXISTS idx_notulen_actiepunten_voltooid
ON notulen USING gin ((actiepunten->'acties'));

-- Create index for querying by completion user
CREATE INDEX IF NOT EXISTS idx_notulen_actiepunten_voltooid_door
ON notulen USING gin ((actiepunten->'acties'->'voltooid_door'));

-- Add comments for documentation
COMMENT ON COLUMN notulen.actiepunten IS 'JSONB structure containing action items with completion tracking: {"acties": [{"actie": "description", "verantwoordelijke": "person", "voltooid": false, "voltooid_door": null, "voltooid_op": null, "voltooid_opmerking": null}]}';

-- Log the migration completion
INSERT INTO migration_log (version, description, executed_at)
VALUES ('V1_57', 'Add completion tracking fields to actiepunten JSONB structure', NOW());
