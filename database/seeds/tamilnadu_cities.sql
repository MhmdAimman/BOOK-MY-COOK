-- Tamil Nadu Cities and Districts Seed Data

-- Insert Cities
INSERT INTO cities (name, district) VALUES
('Chennai', 'Chennai'),
('Coimbatore', 'Coimbatore'),
('Madurai', 'Madurai'),
('Tiruchirappalli', 'Tiruchirappalli'),
('Salem', 'Salem'),
('Tirunelveli', 'Tirunelveli'),
('Vellore', 'Vellore'),
('Erode', 'Erode'),
('Thoothukudi', 'Thoothukudi'),
('Dindigul', 'Dindigul'),
('Thanjavur', 'Thanjavur'),
('Karur', 'Karur'),
('Namakkal', 'Namakkal'),
('Tiruppur', 'Tiruppur'),
('Virudhunagar', 'Virudhunagar'),
('Sivakasi', 'Virudhunagar'),
('Rajapalayam', 'Virudhunagar'),
('Tirupathur', 'Vellore'),
('Kanchipuram', 'Kanchipuram'),
('Cuddalore', 'Cuddalore'),
('Nagapattinam', 'Nagapattinam'),
('Mayiladuthurai', 'Mayiladuthurai'),
('Kumbakonam', 'Thanjavur'),
('Karaikudi', 'Sivaganga'),
('Pudukkottai', 'Pudukkottai'),
('Ramanathapuram', 'Ramanathapuram'),
('Nagercoil', 'Kanyakumari'),
('Kanyakumari', 'Kanyakumari'),
('Ooty', 'Nilgiris'),
('Hosur', 'Krishnagiri'),
('Krishnagiri', 'Krishnagiri'),
('Dharmapuri', 'Dharmapuri'),
('Villupuram', 'Villupuram'),
('Perambalur', 'Perambalur'),
('Ariyalur', 'Ariyalur'),
('Tiruvarur', 'Tiruvarur'),
('Theni', 'Theni'),
('Tenkasi', 'Tenkasi'),
('Sivaganga', 'Sivaganga'),
('Ranipet', 'Ranipet');

-- Insert Areas for Chennai
INSERT INTO areas (city_id, name, pincode) VALUES
((SELECT id FROM cities WHERE name = 'Chennai'), 'Adyar', '600020'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Anna Nagar', '600040'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'T. Nagar', '600017'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Nungambakkam', '600034'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Mylapore', '600004'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Velachery', '600042'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Porur', '600116'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'OMR', '600097'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Guindy', '600032'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Egmore', '600008'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Chromepet', '600044'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Ambattur', '600053'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Avadi', '600054'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Tambaram', '600059'),
((SELECT id FROM cities WHERE name = 'Chennai'), 'Perambur', '600011');

-- Insert Areas for Coimbatore
INSERT INTO areas (city_id, name, pincode) VALUES
((SELECT id FROM cities WHERE name = 'Coimbatore'), 'RS Puram', '641002'),
((SELECT id FROM cities WHERE name = 'Coimbatore'), 'Gandhipuram', '641012'),
((SELECT id FROM cities WHERE name = 'Coimbatore'), 'Saibaba Colony', '641011'),
((SELECT id FROM cities WHERE name = 'Coimbatore'), 'Peelamedu', '641004'),
((SELECT id FROM cities WHERE name = 'Coimbatore'), 'Singanallur', '641005'),
((SELECT id FROM cities WHERE name = 'Coimbatore'), 'Saravanampatti', '641035'),
((SELECT id FROM cities WHERE name = 'Coimbatore'), 'Vadavalli', '641041'),
((SELECT id FROM cities WHERE name = 'Coimbatore'), 'Ganapathy', '641006');

-- Insert Areas for Madurai
INSERT INTO areas (city_id, name, pincode) VALUES
((SELECT id FROM cities WHERE name = 'Madurai'), 'Madurai City', '625001'),
((SELECT id FROM cities WHERE name = 'Madurai'), 'K.K. Nagar', '625020'),
((SELECT id FROM cities WHERE name = 'Madurai'), 'Anna Nagar', '625040'),
((SELECT id FROM cities WHERE name = 'Madurai'), 'Tallakulam', '625002'),
((SELECT id FROM cities WHERE name = 'Madurai'), 'Bypass Road', '625016'),
((SELECT id FROM cities WHERE name = 'Madurai'), 'Thirunagar', '625005'),
((SELECT id FROM cities WHERE name = 'Madurai'), 'Villapuram', '625012');

-- Insert Areas for Trichy
INSERT INTO areas (city_id, name, pincode) VALUES
((SELECT id FROM cities WHERE name = 'Tiruchirappalli'), 'Srirangam', '620006'),
((SELECT id FROM cities WHERE name = 'Tiruchirappalli'), 'Thillai Nagar', '620018'),
((SELECT id FROM cities WHERE name = 'Tiruchirappalli'), 'Cantonment', '620001'),
((SELECT id FROM cities WHERE name = 'Tiruchirappalli'), 'K.K. Nagar', '620021'),
((SELECT id FROM cities WHERE name = 'Tiruchirappalli'), 'Woraiyur', '620003'),
((SELECT id FROM cities WHERE name = 'Tiruchirappalli'), 'Thiruverumbur', '620013');

-- Insert Areas for Salem
INSERT INTO areas (city_id, name, pincode) VALUES
((SELECT id FROM cities WHERE name = 'Salem'), 'Salem City', '636001'),
((SELECT id FROM cities WHERE name = 'Salem'), 'Fairlands', '636004'),
((SELECT id FROM cities WHERE name = 'Salem'), 'Hasthampatti', '636007'),
((SELECT id FROM cities WHERE name = 'Salem'), 'Ammapet', '636003'),
((SELECT id FROM cities WHERE name = 'Salem'), 'Kondalampatti', '636010'),
((SELECT id FROM cities WHERE name = 'Salem'), 'Seelanaickenpatti', '636011');
