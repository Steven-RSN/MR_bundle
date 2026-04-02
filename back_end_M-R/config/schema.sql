-- Schéma de la base de données Marche&Ramasse
-- Utilisé en développement (marche_ramasseDB) et en CI (metr_test)

CREATE TABLE IF NOT EXISTS `user`(
   id_user INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   userEmail VARCHAR(50) NOT NULL UNIQUE,
   userPseudo VARCHAR(50) NOT NULL UNIQUE,
   createAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   userPassword VARCHAR(100) NOT NULL,
   userAvatar LONGTEXT,
   collectingNumber BIGINT
);

CREATE TABLE IF NOT EXISTS `type`(
   id_type INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   `type` VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS location(
   id_location INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   location LONGTEXT NOT NULL,
   latitude DECIMAL(9,6) NOT NULL,
   longitude DECIMAL(9,6) NOT NULL
);

CREATE TABLE IF NOT EXISTS volume(
   id_volume INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   volume DECIMAL(4,1) NOT NULL,
   weight DECIMAL(4,1) NOT NULL
);

CREATE TABLE IF NOT EXISTS alertWaste(
   id_alertWaste INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   `name` VARCHAR(250) NOT NULL,
   `description` LONGTEXT,
   id_volume INT NOT NULL,
   id_location INT NOT NULL,
   id_user INT NOT NULL,
   FOREIGN KEY(id_volume) REFERENCES volume(id_volume),
   FOREIGN KEY(id_location) REFERENCES location(id_location),
   FOREIGN KEY(id_user) REFERENCES `user`(id_user)
);

CREATE TABLE IF NOT EXISTS picture(
   id_picture INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   `path` LONGTEXT NOT NULL,
   id_alertWaste INT,
   FOREIGN KEY(id_alertWaste) REFERENCES alertWaste(id_alertWaste)
);

CREATE TABLE IF NOT EXISTS report(
   id_report INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   motif LONGTEXT NOT NULL,
   date_report DATE,
   id_user INT,
   id_alertWaste INT NOT NULL,
   FOREIGN KEY(id_user) REFERENCES `user`(id_user),
   FOREIGN KEY(id_alertWaste) REFERENCES alertWaste(id_alertWaste)
);

CREATE TABLE IF NOT EXISTS alertWaste_type(
   id_alertWaste INT,
   id_type INT,
   PRIMARY KEY(id_alertWaste, id_type),
   FOREIGN KEY(id_alertWaste) REFERENCES alertWaste(id_alertWaste),
   FOREIGN KEY(id_type) REFERENCES `type`(id_type)
);

CREATE TABLE IF NOT EXISTS clear(
   id_user INT,
   id_alertWaste INT,
   is_cleared BOOLEAN NOT NULL,
   PRIMARY KEY(id_user, id_alertWaste),
   FOREIGN KEY(id_user) REFERENCES `user`(id_user),
   FOREIGN KEY(id_alertWaste) REFERENCES alertWaste(id_alertWaste)
);
