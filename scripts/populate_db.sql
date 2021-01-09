USE CSC648Project;

INSERT INTO category(id, category) VALUES (1, 'Any');
INSERT INTO category(id, category) VALUES (2, 'Textbooks');
INSERT INTO category(id, category) VALUES (3, 'Housing');
INSERT INTO category(id, category) VALUES (4, 'Automotive');

INSERT INTO listing(id, name, timestamp, description, price, category_id, isApproved) VALUES (1, 'Car', NOW(), 'Cool car', 20000, 4, true);
INSERT INTO listing(id, name, timestamp, description, price, category_id, isApproved) VALUES (2, 'Room', NOW(), 'Cool room', 2000, 3, true);
INSERT INTO listing(id, name, timestamp, description, price, category_id, isApproved) VALUES (3, 'Book', NOW(), 'Cool book', 2000, 2, true);
INSERT INTO listing(id, name, timestamp, description, price, category_id, isApproved) VALUES (4, 'Pineapple car', NOW(), 'Cool pineapple car', 2000, 4, true);
INSERT INTO listing(id, name, timestamp, description, price, category_id, isApproved) VALUES (5, 'Apple car', NOW(), 'Cool apple car', 2000, 4, true);

INSERT INTO photo_path(id, path, thumbnailPath, listing_id) VALUES (1, '/images/car.png', '/images/car-thmb.png', 1);
INSERT INTO photo_path(id, path, thumbnailPath, listing_id) VALUES (2, '/images/room.png', '/images/room-thmb.png', 2);
INSERT INTO photo_path(id, path, thumbnailPath, listing_id) VALUES (3, '/images/textbook.png', '/images/textbook-thmb.png', 3);
INSERT INTO photo_path(id, path, thumbnailPath, listing_id) VALUES (4, '/images/pineapple-car.png', '/images/pineapple-car-thmb.png', 4);
INSERT INTO photo_path(id, path, thumbnailPath, listing_id) VALUES (5, '/images/apple-car.png', '/images/apple-car-thmb.png', 5);
INSERT INTO photo_path(id, path, thumbnailPath, listing_ID) VALUES (6, '/images/car2.png', '/images/car2-thmb.png', 1);
INSERT INTO photo_path(id, path, thumbnailPath, listing_ID) VALUES (7, '/images/car3.png', '/images/car3-thmb.png', 1);

