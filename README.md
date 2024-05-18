# Quizzi Project

This repository contains the backend of a Quizzi using the Node.js, Express.js and MongoDB.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)

## Installation

### Prerequisites

- Node.js
- npm (or yarn)
- MongoDB

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/K-Chavda/quizzie-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd mern-backend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
   or if you are using yarn:
   ```bash
   yarn install
   ```

## Configuration

1. Create a `.env` file in the root directory and add the following environment variables:
   ```plaintext
   PORT=<Desired Port>
   DATABASE_URI=<Mongo DB Connection String>
   CORS_ORIGINS=<Origins to Allow API Access>
   JWT_SECRET=<Token Secret>
   ```

## Usage

### Running the Server

1. Start the server:

   ```bash
   npm run start
   ```

## API Endpoints

### User Routes

- `POST /api/user/register` - Register User
- `POST /api/user/login` - Login User

### Example Request

### Activity Routes

- `POST /api/activity/create` - Create Activity
- `POST /api/activity/analytics` - Analytics for Activity
- `POST /api/activity/analytics/:id` - Analytics for Single Activity
- `POST /api/activity/trending` - To Get all Trending Activity
