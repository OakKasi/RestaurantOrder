# 🍽️ RestaurantOrder App

แอปพลิเคชันระบบสั่งอาหาร (Restaurant Order) พัฒนาด้วย **React Native + Expo**

---

## 📋 สิ่งที่ต้องเตรียมก่อนเริ่ม (Prerequisites)

ก่อนเริ่มทำงาน ให้สมาชิกทุกคนติดตั้งสิ่งเหล่านี้ลงในเครื่อง:
1. **Node.js**: เวอร์ชัน LTS (v18 หรือ v20 ขึ้นไป) -> [ดาวน์โหลด Node.js](https://nodejs.org/)
2. **Git**: สำหรับดึงและส่งโค้ด -> [ดาวน์โหลด Git](https://git-scm.com/)
3. **แอป Expo Go**: ดาวน์โหลดติดเครื่องมือถือไว้สำหรับทดสอบแอป
   - [Expo Go สำหรับ Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [Expo Go สำหรับ iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)
4. **Code Editor**: แนะนำ **VS Code**

---

## 🚀 คู่มือเริ่มต้นใช้งาน (Step-by-Step Setup)

### ขั้นตอนที่ 1: Clone โปรเจกต์ลงเครื่อง
เปิด Terminal หรือ Command Prompt ในโฟลเดอร์ที่คุณต้องการเก็บงาน แล้วรัน:
```bash
git clone <URL_REPO_ของโปรเจกต์นี้>
cd RestaurantOrder
```

---

### ขั้นตอนที่ 2: ติดตั้ง Dependencies (ห้ามข้าม!)
รันคำสั่งเพื่อดาวน์โหลดไลบรารีทั้งหมดที่โปรเจกต์ต้องใช้:
```bash
npm install
```
*(รอจนกว่าระบบจะติดตั้งเสร็จเรียบร้อย จะมีโฟลเดอร์ `node_modules` โผล่ขึ้นมา)*

---

### ขั้นตอนที่ 3: เริ่มรัน Development Server
รันคำสั่งเปิดเซิร์ฟเวอร์จำลอง:
```bash
npx expo start
```
*(หรือจะใช้ `npm start` ก็ได้)*

---

### ขั้นตอนที่ 4: เปิดทดสอบแอปพลิเคชัน
เมื่อ Terminal รันขึ้นมา จะมี **QR Code** ปรากฏขึ้น:

- **ทดสอบผ่านมือถือจริง (แนะนำ):**
  - **Android**: เปิดแอป **Expo Go** แล้วกด **Scan QR Code** เพื่อสแกนโค้ดจากหน้าจอคอมพิวเตอร์
  - **iOS**: เปิดแอป **กล้องถ่ายรูป (Camera)** ของ iPhone แล้วสแกน QR Code จากนั้นแตะเปิดในแอป **Expo Go**
  - ⚠️ *หมายเหตุ: มือถือและคอมพิวเตอร์ต้องเชื่อมต่อ **Wi-Fi วงเดียวกัน** เท่านั้น*

- **ทดสอบผ่าน Emulator / Simulator บนคอมพิวเตอร์:**
  - กดปุ่ม `a` ใน Terminal เพื่อเปิดบน **Android Emulator**
  - กดปุ่ม `i` ใน Terminal เพื่อเปิดบน **iOS Simulator** (เฉพาะ macOS)
  - กดปุ่ม `w` เพื่อเปิดดูเวอร์ชันเว็บในเบราว์เซอร์

---

## 🌿 ข้อตกลงการทำงานร่วมกันผ่าน Git (Team Workflow)

เพื่อไม่ให้โค้ดของเพื่อนในทีมชนกัน (Merge Conflict) ให้ปฏิบัติตามขั้นตอนนี้ทุกครั้งเมื่อเริ่มทำงานชิ้นใหม่:

### 1. อัปเดตโค้ดล่าสุดจาก main เสมอ
ก่อนจะเริ่มเขียนโค้ดใหม่ ให้ดึงโค้ดเวอร์ชันล่าสุดมาก่อน:
```bash
git checkout main
git pull origin main
```

### 2. แตก Branch ใหม่สำหรับฟังก์ชันที่ตัวเองทำ
**ห้ามเขียนโค้ดลงบน branch `main` โดยตรงเด็ดขาด** ให้สร้าง branch ใหม่ตามชื่อฟีเจอร์ เช่น:
```bash
# ตัวอย่างรูปแบบ: feature/<ชื่อฟังก์ชัน-ชื่อเล่น>
git checkout -b feature/menu-screen-ton
```

### 3. เมื่อทำส่วนของตัวเองเสร็จ ให้ Commit & Push
```bash
git add .
git commit -m "feat: เพิ่มหน้ารายการเมนูอาหาร"
git push origin feature/menu-screen-ton
```

### 4. รวมโค้ดเข้าสู่ main ผ่าน Pull Request (PR)
1. ไปที่หน้า GitHub ของโปรเจกต์
2. กดปุ่ม **Compare & pull request**
3. แจ้งเพื่อนในทีมให้ช่วยรีวิว แล้วจึงกดยืนยัน **Merge pull request**

---

## 📦 ไลบรารีหลักที่โปรเจกต์นี้ติดตั้งไว้แล้ว

- **Expo SDK 57**: เฟรมเวิร์กหลัก
- **React Native 0.86**: Core UI Framework
- **@react-navigation/native-stack**: จัดการหน้าจอและการเปลี่ยนหน้า (Navigation)
- **expo-sqlite**: จัดการฐานข้อมูล SQLite ภายในเครื่อง (Local Database)
- **react-native-safe-area-context**: จัดการระยะขอบหน้าจอสำหรับมือถือที่มีรอยบาก/กล้องหน้า
- **react-native-screens**: เพิ่มประสิทธิภาพการเปลี่ยนหน้าจอแบบ Native

---

## ❓ ปัญหาที่พบบ่อย (Troubleshooting)

- **Q: สแกน QR Code แล้วแอปใน Expo Go ค้าง หรือโหลดไม่ขึ้น?**
  - ตรวจสอบว่ามือถือและคอมพิวเตอร์ต่อ Wi-Fi เดียวกันหรือไม่
  - หาก Wi-Fi หอพัก/มหาลัย บล็อกการเชื่อมต่อ ให้รันด้วยคำสั่ง Tunnel แทน:
    ```bash
    npx expo start --tunnel
    ```
- **Q: ขึ้น Error เรื่อง Module หรือ Dependencies?**
  - ให้ลองลบ `node_modules` แล้วรัน `npm install` ใหม่อีกครั้ง
- **Q: โดน Error Metro Cache ค้าง?**
  - ให้สั่งรันแบบล้างแคชด้วยคำสั่ง:
    ```bash
    npx expo start -c
    ```
