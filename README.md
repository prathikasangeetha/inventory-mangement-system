# Inventory Management System

A beginner-friendly full-stack CRUD web application developed using HTML, CSS, JavaScript, Flask, SQLAlchemy and SQLite.

## Features

- Add products
- View products
- Edit products
- Delete products
- Search by product, category or supplier
- Filter by category
- Dashboard statistics
- Client-side and server-side validation
- REST API
- Responsive design
- SQLite database
- Postman-ready API
- GitHub-ready
- Render deployment-ready

## Technology Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Python Flask
- ORM: Flask-SQLAlchemy
- Database: SQLite
- API: REST + JSON
- Testing: Postman
- Version Control: Git/GitHub
- Deployment: Render

## Project Structure

```text
inventory-management-system/
├── app.py
├── requirements.txt
├── render.yaml
├── README.md
├── .gitignore
├── templates/
│   └── index.html
├── static/
│   ├── css/style.css
│   └── js/script.js
└── database/
    └── inventory.db
```

## How to Run in VS Code

### 1. Open the project folder

Open this folder in VS Code.

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate it on Windows

```bash
venv\Scripts\activate
```

### 4. Install packages

```bash
pip install -r requirements.txt
```

### 5. Start the application

```bash
python app.py
```

### 6. Open in Chrome

```text
http://127.0.0.1:5000
```

The SQLite database is automatically created in the `database` folder.

## REST API

| Operation | Method | Endpoint |
|---|---|---|
| Create | POST | `/api/items/` |
| Read All | GET | `/api/items/` |
| Read One | GET | `/api/items/<id>/` |
| Update | PUT/PATCH | `/api/items/<id>/` |
| Delete | DELETE | `/api/items/<id>/` |
| Statistics | GET | `/api/stats/` |
| Categories | GET | `/api/categories/` |

## Example POST JSON

```json
{
  "product_name": "Laptop",
  "category": "Electronics",
  "quantity": 10,
  "price": 55000,
  "supplier": "ABC Suppliers",
  "date": "2026-09-16"
}
```

## Postman Testing

### Create

POST `http://127.0.0.1:5000/api/items/`

Body → raw → JSON → use the example above.

### Read

GET `http://127.0.0.1:5000/api/items/`

### Read One

GET `http://127.0.0.1:5000/api/items/1/`

### Update

PUT `http://127.0.0.1:5000/api/items/1/`

Body:

```json
{
  "product_name": "Dell Laptop",
  "category": "Electronics",
  "quantity": 15,
  "price": 60000,
  "supplier": "ABC Suppliers",
  "date": "2026-09-16"
}
```

### Delete

DELETE `http://127.0.0.1:5000/api/items/1/`

## GitHub

```bash
git init
git add .
git commit -m "Initial CRUD inventory application"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Do not commit `venv`, `.env`, passwords or secret keys.

## Render Deployment

1. Push the project to GitHub.
2. Create a new Web Service on Render.
3. Connect the GitHub repository.
4. Build command:

```text
pip install -r requirements.txt
```

5. Start command:

```text
gunicorn app:app
```

6. Deploy the service.
7. Open the generated Render URL.

## Architecture

```text
User
  ↓
HTML / CSS / JavaScript
  ↓
Fetch API
  ↓
Flask REST API
  ↓
SQLAlchemy ORM
  ↓
SQLite Database
```

## CRUD Flow

Create:
Form → POST → Flask → SQLite → Success → Refresh UI

Read:
Frontend → GET → Flask → SQLite → JSON → Table

Update:
Edit → PUT → Flask → SQLite → JSON → Updated Table

Delete:
Delete → Confirmation → DELETE → Flask → SQLite → Refresh UI

## Validation

- Required fields cannot be empty.
- Quantity must be an integer greater than or equal to 0.
- Price must be greater than 0.
- Date must be valid.
- Server-side validation is also implemented.

## Future Enhancements

- User authentication
- Role-based access
- MySQL/PostgreSQL
- Product images
- Stock alerts
- Export to Excel/PDF
- Advanced analytics
- Cloud database
- Barcode scanning
