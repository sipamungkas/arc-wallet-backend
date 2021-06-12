# ARC WALLET

## Contents

- [Description](#description)
- [Requirements](#requirements)
- [ERD](#erd)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)

## Description

**ARC WALLET** is an E-Wallet.

**ARC WALLET Backend** is a part of ARC WALLET that serve API for **ARC WALLET Mobile**

## Requirements

### Dependencies

| name              | Version   |
| ----------------- | --------- |
| add               | ^2.0.6    |
| bcrypt            | ^5.0.1    |
| date-fns          | ^2.22.1   |
| dotenv            | ^10.0.0   |
| express           | ^4.17.1   |
| express-validator | ^6.11.1   |
| fs-extra          | ^10.0.0   |
| jsonwebtoken      | ^8.5.1    |
| multer            | ^1.4.2    |
| mysql             | ^2.18.1   |
| nodemailer        | ^6.6.1    |
| redis             | ^3.1.2    |
| socket.io         | ^4.1.2    |
| uuid              | ^8.3.2    |
| yarn              | "^1.22.10 |

---

### Dev Dependencies

| name                   | Version |
| ---------------------- | ------- |
| eslint                 | ^7.28.0 |
| eslint-config-prettier | ^8.3.0  |
| morgan                 | ^1.10.0 |
| nodemon                | ^2.0.7  |
| prettier               | ^2.3.   |

## ERD

ARC WALLET ERD
--coming soon--

## Installation

1. Open your terminal or command prompt
2. Clone the project

```bash
git clone https://github.com/sipamungkas/arc-wallet-backend
```

3. Move to the arc-wallet-backend directory

```bash
cd arc-wallet-backend
```

4. Install required dependencies

```bash
yarn install
```

or

```bash
npm install
```

5. Set Up environtment variables
   - Copy .env.example to .env
   - change the configuration inside .env based on your machine configuration

```bash
cp .env.example .env
```

6. Run development server

```bash
yarn dev
```

or

```bash
npm dev
```

## Available Scripts

`start` to run the program on production mode
`dev` to run the program on development mode

## API Documentation

[ARC WALLET Backend on Postman](https://documenter.getpostman.com/view/6708077/TzeRo9Ta)
