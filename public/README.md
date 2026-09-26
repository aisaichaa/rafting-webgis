# RaftingPro - WebGIS Pemetaan Jalur Rafting

## Project Overview

RaftingPro adalah aplikasi WebGIS yang dikembangkan untuk memetakan lokasi dan jalur rafting secara interaktif melalui peta berbasis web.

Aplikasi ini memungkinkan pengguna untuk melihat persebaran lokasi rafting, jalur rafting, informasi destinasi, serta informasi penyedia rafting melalui peta interaktif.

Pemetaan menggunakan koordinat geografis yang divisualisasikan dalam bentuk marker dan polyline pada peta.

## Project Purpose

Project ini dibuat untuk menerapkan konsep Teknologi Pemetaan Berbasis Web (TPBW) dalam pengembangan aplikasi WebGIS.

Tujuan utama project:

* Memetakan lokasi destinasi rafting.
* Menampilkan jalur rafting secara interaktif.
* Menyediakan informasi mengenai destinasi rafting.
* Membantu pengguna menemukan lokasi rafting melalui peta digital.
* Menerapkan teknologi pemetaan berbasis web dalam sebuah aplikasi.

## Main Features

### Interactive Map

Menampilkan lokasi rafting pada peta interaktif menggunakan marker.

### Rafting Route Mapping

Menampilkan jalur rafting menggunakan polyline berdasarkan koordinat geografis jalur.

### Search and Filter

Menyediakan fitur pencarian dan filter untuk membantu pengguna menemukan lokasi rafting.

### Destination Information

Menampilkan informasi mengenai destinasi atau penyedia rafting, seperti lokasi, deskripsi, harga, dan informasi lainnya.

### User Authentication

Menyediakan fitur:

* Register
* Login
* Logout

### Rating and Review

Pengguna dapat memberikan rating dan review terhadap destinasi rafting.

### Admin

Menyediakan halaman admin untuk mengelola data yang digunakan dalam aplikasi.

## Mapping

Pemetaan pada aplikasi menggunakan:

* **Leaflet** sebagai library peta interaktif.
* **OpenStreetMap** sebagai base map.
* **Latitude dan longitude** sebagai koordinat lokasi.
* **Marker** untuk menunjukkan lokasi rafting.
* **Polyline** untuk menggambarkan jalur rafting.

Alur pemetaan:

```text
Data Lokasi Rafting
        |
        v
Latitude & Longitude
        |
        v
Database
        |
        v
Leaflet Map
        |
        +---- Marker Lokasi
        |
        +---- Polyline Jalur
        |
        +---- Informasi Destinasi
        |
        v
Peta Interaktif
```

## Technologies Used

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Mapping

* Leaflet
* OpenStreetMap

### Database & Authentication

* Supabase

### UI

* shadcn/ui
* Radix UI
* Lucide React

## Installation

Clone repository:

```bash
git clone https://github.com/USERNAME/raftingpro-webgis.git
```

Masuk ke folder project:

```bash
cd raftingpro-webgis
```

Install dependencies:

```bash
npm install
```

Jalankan project:

```bash
npm run dev
```

## Environment Variables

Buat file `.env` pada folder utama project:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Jangan mengunggah file `.env` yang berisi credential asli ke repository GitHub.

## Author

**Aisha Patricia Sekar Ayu**

Project ini dibuat sebagai bagian dari tugas pada mata kuliah **Teknologi Pemetaan Berbasis Web (TPBW)**.

**Tanggal Pembuatan:** 25 Juni 2025
