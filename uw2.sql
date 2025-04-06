-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: uw
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `paths` varchar(40) NOT NULL,
  `address` varchar(66) NOT NULL,
  `private_key` varchar(120) DEFAULT NULL,
  `public_key` varchar(120) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `balance` decimal(18,8) DEFAULT '10.00000000',
  `is_locked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `wallet_id` (`wallet_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,19,'m/44\'/0\'/0\'/0/0','1DAX5nBPmzQCyQDms4QeLfKGiJKX5759Pi','L2pPtsX8sNjcZTcuRo39Zomshn57E8vLggFPX4R5dwryy4So8a6J','027d0d946a2edd2f4cbe965a866cfe553a1d0124a0eca9250af58518b55e8616da','2025-03-06 12:19:01',3,10.00000000,0),(2,19,'m/44\'/0\'/0\'/0/1','17xDYQxf8kZBJ4ExzrfqxNMqjhhS6X2gdP','L2ecNPkUz24CKDBDa5Q2pvRUHzJNmCkPW3KBzjWBY9a4wRo8X3T6','0381b6f602d779d8846114c8d525eb21e2020c64c8ab4f9571d110cbf2585d179c','2025-03-11 12:07:20',3,10.00000000,0),(3,19,'m/44\'/0\'/0\'/0/2','1KFFfrprA15sWtzbxpbeyowEVZxS346gR3','Kxdi6Figa8qyjWYGfx9ip5BDPks9knxLxSdRAFcDGWbAaeP7zjqr','036938a14fbe293611a763492b8847045c47e92d5a6f3ab794ab2e7bf47fd97ced','2025-03-11 12:08:46',3,10.00000000,0),(4,20,'m/44\'/0\'/0\'/0/0','12Ai1rJmS7tycYdYFk8JKM3CdjzkqP76fM','L5Tg3PyzeGESp4kC1qNkLiwNVgBA3JRCq9xuH1sVpH6tAtJjGdS6','02782354908457054d7d299e866f3f1085f6c0de8710f3b0ab3228e143bd52d977','2025-03-14 12:17:56',4,1.00000000,0),(5,21,'m/44\'/0\'/0\'/0/0','1M3oKebdYCnvf4PBCd96pb8pVhzeSBHWWU','KwqVi62NeUbpzykdPZeN2G7JBQ1arNZqGn6nBbU9x1vijA16KRyw','025fd50e12d8d7f6c91b1aa99a695846a2562becaf846e2a5e78a75714b99c95f5','2025-03-16 08:29:50',3,0.00000000,0),(6,22,'m/44\'/0\'/0\'/0/0','19yJfyN3LH5CXT4fYkjFs7CJj3Ydo4Ch3U','L4RmerZjStvwvn4KiDqF9ySzx8sPrJdYTxakGE2HNteZKW5RQ21F','038b91c73b949f4db2f56591a05ed10d94b6476721db32e1bdb3e7a8112d0f11fd','2025-04-03 07:48:36',7,10.00000000,0),(7,22,'m/44\'/0\'/0\'/0/1','1NaTY9VNCfV7SZPASGb7FCY2eXsyHim23r','L1a7DF4sxGiAcqCePxkHwp2yKg6zpKWUigCghRcGFQMx4MgFEXJN','02389727b9293e2cbb10c60f3263b302e7bb8cd19a098c407b4d088b2aa1ce8f4a','2025-04-03 07:57:52',7,10.00000000,0),(8,23,'m/44\'/0\'/0\'/0/0','1NatG8k6iMnk6SgFTQPNadokuEkhTaKE6X','L3bEeMgcNGVKs6VAATiqSG8Gp7wjeFp7pGt3jAHUYhRTBoFqgHxq','030ae00e2f2c819ba18c74d2042c12df42cd04e58e2068665329c135c7bd2a9e47','2025-04-04 12:11:15',7,10.00000000,0);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tx_hash` varchar(512) DEFAULT NULL,
  `sender_address` varchar(42) DEFAULT NULL,
  `recipient_address` varchar(42) DEFAULT NULL,
  `amount` decimal(18,8) DEFAULT NULL,
  `sender_public_key` varchar(130) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,'e936d54ee9c8be2acf9e560fe7972c4e38b515ded53c8f1291dc5151d7db2aae','1DAX5nBPmzQCyQDms4QeLfKGiJKX5759Pi','17xDYQxf8kZBJ4ExzrfqxNMqjhhS6X2gdP',1.00000000,'027d0d946a2edd2f4cbe965a866cfe553a1d0124a0eca9250af58518b55e8616da','2025-03-24 06:37:04'),(2,'56bde8ced7c3e1e8a03e6dc593c0d473711fb6d847e1f83984e3cc63eadc414f','17xDYQxf8kZBJ4ExzrfqxNMqjhhS6X2gdP','1DAX5nBPmzQCyQDms4QeLfKGiJKX5759Pi',1.00000000,'0381b6f602d779d8846114c8d525eb21e2020c64c8ab4f9571d110cbf2585d179c','2025-04-03 07:10:37');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'apple','$2b$10$l3D.71ZMbHrJrF2RyZ1d4eAenzgTc4G84g7YbCZ66cDmy5Y0nOUc2','2025-02-22 02:16:22','apple94ra@gmail.com','0911111111'),(3,'kiwi9','$2b$10$s4syPZpzgYXcuLkYB05DNOA9Fod3Nfra1pJfg3BIkwOvPCqCo92lm','2025-02-24 06:53:31','d1114182001@gm.lhu.edu.tw','0900000000'),(4,'test123','$2b$10$TFDQAC7lvToLIXzTBOyv8.Xr84XgFMi3AWGTZ.ZJ67BuucWXOxp2C','2025-02-24 14:36:52','d1114182001@gm.lhu.edu.tw','0900000000'),(5,'kiwi888','$2b$10$6rtQsb7GSwJsY4rztvbbw.fit4rCpCdojSqXni/A2Q76K8zQQVSDi','2025-03-30 07:02:00','kiwi93520@gmail.com','123456'),(6,'kiwi88','$2b$10$fdeSww5OPYdvhRXOKA8X..InqJLS0QmG0t6oImjjflIUv4tiZrcMu','2025-03-30 07:04:00','kiwi93520@gmail.com','0919980611'),(7,'hi123','$2b$10$Sd6LUEE0d/OGEdF1T9cZBuIaxCX3pKim1SRro1zeUAW1gmnFWnhmi','2025-04-03 07:44:01','kiwi93520@gmail.com','0912345678');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mnemonic` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_id` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES (19,'chronic brain milk wealth build arch shiver identify source great monitor carry','2025-03-06 12:19:01',3),(20,'drop crop hen congress van buzz inherit gravity erode female insane town','2025-03-14 12:17:56',4),(21,'develop reduce world between scene orient junior head fringe unique oblige update','2025-03-16 08:29:50',3),(22,'visual outer wave hawk skate ghost giggle few seminar kiwi senior domain','2025-04-03 07:48:36',7),(23,'boring food defense oblige toss coach poem live fox furnace pluck wasp','2025-04-04 12:11:15',7);
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-06 17:26:03
