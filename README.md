# Fantasy Coup

เว็บแอปพลิเคชันสำหรับเล่นบอร์ดเกม Coup ธีมแฟนตาซีออนไลน์ (รองรับผู้เล่นหลายคน) พร้อม 5 ตัวละครใหม่ (ราชา, นักผจญภัย, นักฆ่า, สตรีศักดิ์สิทธิ์, พ่อค้า)

## สมาชิกกลุ่ม
| ลำดับ | ชื่อ-นามสกุล | รหัสนักศึกษา | Section | Branch | หน้าที่รับผิดชอบ |
|---|---|---|---|---|---|
| 1 | [ชื่อ-นามสกุล] | [รหัสนักศึกษา] | [Section] | [Branch] | [หน้าที่] |

## Tech Stack
- **Frontend**: React (TypeScript) + Vite
- **Backend**: Spring Boot 3.x (Java 17+)
- **Database**: PostgreSQL (หรือ MySQL/MariaDB)
- **Build Tool**: Maven
- **Deployment**: [รอระบุ]

## System Architecture
- **Layered Architecture**: Presentation (Controller), Business Logic (Service), Data Access (Repository), Domain (Entity)
- **RESTful API** สำหรับการสื่อสารระหว่าง Frontend และ Backend

## Database Design (ER Diagram)
- (รอเพิ่มรูปภาพ ER Diagram ใน doc/diagrams/)
- ตารางหลัก: User, UserProfile, GameRoom, GamePlayer, Card, GameActionLog

## Installation & Setup
1. Clone repository นี้
2. นำเข้าโปรเจกต์ `code/backend` ใน IDE (IntelliJ IDEA / Eclipse)
3. รันคำสั่ง `npm install` ใน `code/frontend`

## How to Run
- **Backend**: รัน `CoupApplication.java`
- **Frontend**: รัน `npm run dev` ใน `code/frontend`

## API Documentation
- เข้าถึง Swagger UI ได้ที่ `http://localhost:8080/swagger-ui.html`

## How to Run Tests
- **Backend**: รันคำสั่ง `./mvnw test` ใน `code/backend`

## Deployment URL
- [รอระบุ URL]

## Project Structure
- `code/backend`: Source code ของ Spring Boot (Backend)
- `code/frontend`: Source code ของ React (Frontend)
- `test/`: การทดสอบ
- `doc/`: เอกสารทั้งหมด (Diagrams, SOLID Analysis, Design Patterns)
- `img/`: รูปภาพประกอบ
