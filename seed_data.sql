-- ==============================================================================
-- SMART CITY: SEED DATA FOR INDORE MUNICIPAL CORPORATION
-- ==============================================================================

-- 1. Insert Default Departments
INSERT INTO departments (id, name, code, description, head_name, contact_email, contact_phone, is_active)
VALUES
    ('d1000000-0000-0000-0000-000000000001', 'Road Infrastructure & Bridges', 'RDB', 'Pothole repairs, asphalt resurfacing, flyovers and speed breakers.', 'Shri R.K. Saxena (Chief Engineer)', 'roads@smartcity.gov.in', '0731-2534001', true),
    ('d1000000-0000-0000-0000-000000000002', 'Water Works & Drainage', 'WWD', 'Drinking water pipeline leaks, supply pressure, sewage and storm drains.', 'Smt. Vandana Gupta (Executive Engineer)', 'water@smartcity.gov.in', '0731-2534002', true),
    ('d1000000-0000-0000-0000-000000000003', 'Electricity & Street Lighting', 'ESL', 'Streetlight faults, transformer sparking, dangling cables and public smart poles.', 'Er. O.P. Sharma (Superintending Engineer)', 'electricity@smartcity.gov.in', '0731-2534003', true),
    ('d1000000-0000-0000-0000-000000000004', 'Solid Waste & Public Sanitation', 'SWM', 'Door-to-door garbage vans, community dustbins, open dumping and community toilets.', 'Dr. Akhilesh Upadhyay (Health Officer)', 'sanitation@smartcity.gov.in', '0731-2534004', true),
    ('d1000000-0000-0000-0000-000000000005', 'Traffic & Urban Mobility', 'TUM', 'Traffic signals, signages, encroached footpaths and unauthorized parking.', 'DSP Kailash Narain (Traffic In-charge)', 'traffic@smartcity.gov.in', '0731-2534005', true),
    ('d1000000-0000-0000-0000-000000000006', 'General Civic Amenities & Parks', 'GCA', 'Municipal gardens, children play zones, stray animal control and civic assets.', 'Shri Manoj Bhargava (Zonal Director)', 'civic@smartcity.gov.in', '0731-2534006', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Default 10 Categories
INSERT INTO complaint_categories (id, name, slug, description, default_department_id, default_priority, sla_hours, is_active)
VALUES
    ('c1000000-0000-0000-0000-000000000001', 'Road Damage', 'road-damage', 'Potholes, broken road patches, cave-ins, and uneven speed breakers.', 'd1000000-0000-0000-0000-000000000001', 'Medium', 48, true),
    ('c1000000-0000-0000-0000-000000000002', 'Water Supply', 'water-supply', 'No water supply, low water pressure, contaminated supply or pipeline leakage.', 'd1000000-0000-0000-0000-000000000002', 'High', 24, true),
    ('c1000000-0000-0000-0000-000000000003', 'Drainage and Sewage', 'drainage-sewage', 'Overflowing gutters, blocked manholes, water logging, foul drain odors.', 'd1000000-0000-0000-0000-000000000002', 'High', 24, true),
    ('c1000000-0000-0000-0000-000000000004', 'Electricity', 'electricity', 'Sparking transformers, dangling overhead cables, exposed fuse boxes.', 'd1000000-0000-0000-0000-000000000003', 'Critical', 12, true),
    ('c1000000-0000-0000-0000-000000000005', 'Street Lights', 'street-lights', 'Dark street, flickering lamp, missing LED fixture, or bent lamp pole.', 'd1000000-0000-0000-0000-000000000003', 'Medium', 24, true),
    ('c1000000-0000-0000-0000-000000000006', 'Garbage Collection', 'garbage-collection', 'Missed door-to-door van, overflowing garbage bin, open roadside dumping.', 'd1000000-0000-0000-0000-000000000004', 'Medium', 18, true),
    ('c1000000-0000-0000-0000-000000000007', 'Public Sanitation', 'public-sanitation', 'Unhygienic community washroom, dead animal disposal, pesticide fogging.', 'd1000000-0000-0000-0000-000000000004', 'High', 16, true),
    ('c1000000-0000-0000-0000-000000000008', 'Traffic and Parking', 'traffic-parking', 'Non-functional traffic lights, missing road signs, illegal parking blocking roads.', 'd1000000-0000-0000-0000-000000000005', 'Medium', 36, true),
    ('c1000000-0000-0000-0000-000000000009', 'Public Property Damage', 'public-property-damage', 'Broken park benches, vandalized bus shelters, damaged boundary walls.', 'd1000000-0000-0000-0000-000000000006', 'Low', 72, true),
    ('c1000000-0000-0000-0000-000000000010', 'Other Civic Issues', 'other-civic-issues', 'Stray dog menace, illegal hoardings, noise violations, general civic queries.', 'd1000000-0000-0000-0000-000000000006', 'Low', 48, true)
ON CONFLICT (name) DO NOTHING;
