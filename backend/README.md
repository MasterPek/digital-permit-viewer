# Digital Permit Management API

![Python](https://img.shields.io/badge/Python-3.7%20|%203.8%20|%203.9%20|%203.10-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.95.2-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blueviolet) ![License](https://img.shields.io/badge/License-MIT-yellow)

A FastAPI-based backend application for managing digital permits with spatial data (points and polygons) stored in a PostgreSQL database using PostGIS.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [API Endpoints](#api-endpoints)
7. [Testing the API](#testing-the-api)
8. [Contributing](#contributing)
9. [License](#license)

---

## Overview

This application provides CRUD (Create, Read, Update, Delete) operations for managing digital permits with spatial data. It supports two types of geometries:
- **Points**: Represented by the `digital_permit_point` table.
- **Polygons**: Represented by the `digital_permit_polygon` table.
- **Annotations**: Represented by the `digital_permit_annotation` table.

The application uses:
- **FastAPI** for building the RESTful API.
- **SQLAlchemy** and **GeoAlchemy2** for database interactions and handling PostGIS spatial data.
- **PostgreSQL** as the database with the PostGIS extension enabled.

---

## Features

- **CRUD Operations**: Create, read, update, and delete digital permits.
- **Spatial Data Support**: Handle points and polygons using PostGIS.
- **Automatic Documentation**: Interactive API documentation via Swagger UI and ReDoc.
- **Validation**: Pydantic models ensure data integrity and validation.
- **Asynchronous Support**: Built with FastAPI's native async capabilities.

---

## Prerequisites

Before running the application, ensure you have the following installed:
- Python 3.7 or higher
- PostgreSQL 14 or higher with PostGIS extension enabled
- `pip` for installing Python dependencies

---

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/digital-permit-api.git
cd digital-permit-api
```
### Step 2: Set Up a Virtual Environment (Optional but Recommended)
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies
```
pip install -r requirements.txt
```
### Step 4: Set Up the Database
```
CREATE DATABASE gamudagisdb;
\c gamudagisdb
CREATE EXTENSION postgis;
```
-Populate the database schema with the digital_permit_point, digital_permit_annotation and digital_permit_polygon tables.

### Step 5: Configure Environment Variables
```
DATABASE_URL=postgresql+psycopg2://username:password@localhost:5432/gamudagisdb
```

## Configuration

The application uses environment variables for configuration. The key variable is:

- `DATABASE_URL`: Connection string for the PostgreSQL database.

You can also configure logging levels and other settings in the `app.py` file.

---

## API Endpoints

### Points (`/digital-permits/points/`)

| Method | Endpoint                          | Description                                   |
|--------|-----------------------------------|-----------------------------------------------|
| GET    | `/digital-permits/points/`        | Retrieve all digital permit points.          |
| GET    | `/digital-permits/points/{id}`    | Retrieve a specific point by ID.             |
| POST   | `/digital-permits/points/`        | Create a new digital permit point.           |
| PUT    | `/digital-permits/points/{id}`    | Update an existing point.                    |
| DELETE | `/digital-permits/points/{id}`    | Delete a point.                              |

### Polygons (`/digital-permits/polygon/`)

| Method | Endpoint                            | Description                                   |
|--------|-------------------------------------|-----------------------------------------------|
| GET    | `/digital-permits/polygon/`        | Retrieve all digital permit polygons.        |
| GET    | `/digital-permits/polygon/{id}`    | Retrieve a specific polygon by ID.           |
| POST   | `/digital-permits/polygon/`        | Create a new digital permit polygon.         |
| PUT    | `/digital-permits/polygon/{id}`    | Update an existing polygon.                  |
| DELETE | `/digital-permits/polygon/{id}`    | Delete a polygon.                            |

### Annotation (`/digital-permits/annotations/`)

| Method | Endpoint                            | Description                                   |
|--------|-------------------------------------|-----------------------------------------------|
| GET    | `/digital-permits/annotations/`        | Retrieve all digital permit polygons.        |
| GET    | `/digital-permits/annotations/{id}`    | Retrieve a specific polygon by ID.           |
| POST   | `/digital-permits/annotations/`        | Create a new digital permit polygon.         |
| PUT    | `/digital-permits/annotations/{id}`    | Update an existing polygon.                  |
| DELETE | `/digital-permits/annotations/{id}`    | Delete a polygon.                            |
---

## Testing the API

### Run the Application
Start the FastAPI server:
```bash
uvicorn app:app --reload --port 8000

