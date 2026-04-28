<!-- ABOUT THE PROJECT --> 
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url] 
[![Pull Request][pr-shield]][pr-url]
[![Activity][activity-shield]][activity-url] 
[![Stargazers][stars-shield]][stars-url] 

<div align="center"> 
    <img src="frontend/public/LabConnect_Logo-removebg-preview.png" alt="LabConnect Logo" width="320">
    <p>
        A centralized platform that connects RPI students with research and lab opportunities posted by professors and graduate students.
    <p>
</div> 

## Table of Contents

- [About](#about)
- [License](#contact--license)
- [Built With](#built-with)
- [Quickstart](#quickstart)
- [Contributors](#project-contributors)
- [Backend Development](#backend)
- [Frontend Development](#frontend)
- [Testing](#testing)
- [Deployment](#deployment)


## About

## Contact & License

[![Discord](https://img.shields.io/badge/Discord-5865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/tsaxCKjYHT)
[![Jira](https://img.shields.io/badge/Jira-0052CC.svg?style=for-the-badge&logo=jira&logoColor=white)](https://rcoslabconnect.atlassian.net/jira/software/projects/CCS/list)

Distributed under the Apache License. See [LICENSE](https://github.com/WBroadwell/LabConnect/blob/main/LICENSE) for more information.

### Built With

#### Backend 
[![Python][Python]][Python-url]
[![Flask][Flask]][Flask-url]
[![PostgreSQL][PostgreSQL]][PostgreSQL-url]
[![SQLAlchemy][SQLAlchemy]][SQLAlchemy-url]

#### Frontend
[![TypeScript][TypeScript]][TypeScript-url]
[![React][React]][React-url]
[![Node.js][Node.js]][Node.js-url]
[![Tailwind CSS][TailwindCSS]][TailwindCSS-url]

## Quickstart

1. Clone the repo
```bash
    $ git clone https://github.com/WBroadwell/LabConnect.git
    $ cd LabConnect
```
2. Install backend dependencies
```bash
    $ python3 -m pip install -r requirements.txt
```
3. Install frontend dependencies
```bash
    $ cd frontend
    $ npm install
    $ cd ..
```
4. Set up the database
```bash
    $ psql -U postgres -d postgres
    CREATE DATABASE labconnect;
    ALTER USER postgres WITH PASSWORD 'root';
    \q
    $ make create
```
5. Set environment variables
```bash
    $ export VITE_BACKEND_SERVER="http://127.0.0.1:9000"
```
6. Run the app (in two separate terminals)
```bash
    # Terminal 1 - Backend
    $ make develop

    # Terminal 2 - Frontend
    $ cd frontend && make develop
```
7. Visit `http://localhost:5173` in your browser
  
## Project Contributors

Running list of contributors to the LabConnect project:

### Project Lead

- **Will Broadwell** [Project Lead]

### Rensselaer Center for Open Source Development Team
- **Sarah W** [Backend] (S'24-S'26)


### Past Rensselaer Center for Open Source Development Team

- **Jaswanth D** [Frontend] (F'26)
- **Doan N** [Frontend] (F'26)
- **Pragathi A** [Frontend / Backend] (F'26)
- **Aniket S** [Backend] (F'26)
- **Rafael Cenzano** [Former Project Lead] (F'23-S'25)
- **Mohammed P** [Backend] (S'25)
- **Sagar S** [Frontend] (S'25)
- **Gowrisankar P** [Frontend] (S'25)
- **Devan P** [Frontend] (S'25)
- **Sidarth E** [Frontend] (F'24-S'25)
- **Ramzey Y** [Backend] (S'24-F'24)
- **Siddhi W** [Frontend / Backend] (F'23-F'24)
- **Mrunal A** [Frontend / Backend] (F'23-F'24)
- **Abid T** [Frontend / Backend] (F'23-S'24)
- **Nelson** [Backend] (S'24)
- **Duy L** [Database Systems] (F'23)
- **Yash K** [Frontend] (F'23)
- **Sam B** [Scraping / Integration] (F'23)

# Backend
<!-- Getting Started -->
## Prerequisites
 * Clone
    * Clone repo through CLI
        ```bash
        $ git clone https://github.com/LabConnect-RCOS/LabConnect-Backend.git
        ```
    * or through [Github Desktop](https://desktop.github.com/)

  * Install Python 3.12.4
    * Mac:
```
        brew install python@3.12
```
   * Windows: [here](https://www.python.org/downloads/release/python-3124/)
   * Linux:
```
        $ sudo apt install python3.12
```

 * Install PostgreSQL
    * The application is built and tested with postgresql 17
    * Mac: [UI here](https://postgresapp.com/) or
    ```
    brew install postgresql@17
    ```
    * Windows: [here](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) 
    * Linux:
        ```
        $ sudo apt install postgresql
        ```
 * Install Libraries 
    ```
    $ python3 -m pip install -r requirements.txt
    ```
* Setup user and initialize database
    * Windows:
        ```bash
        $ psql -U postgres -d postgres
        CREATE DATABASE labconnect;
        ALTER USER postgres WITH PASSWORD 'root';
        \q
        ```
    * macOS (Homebrew):
        ```bash
        # start postgres if not running
        $ brew services start postgresql
        $ psql -U postgres -d postgres
        CREATE DATABASE labconnect;
        ALTER USER postgres WITH PASSWORD 'root';
        \q
        ```
    * macOS (Postgres.app):
        ```bash
        # open Postgres.app, then in a terminal (Postgres.app adds psql to PATH)
        $ psql -d postgres
        CREATE DATABASE labconnect;
        ALTER USER postgres WITH PASSWORD 'root';
        \q
        ```
    * Linux:
        ```bash
        $ sudo -i -u postgres
        $ psql
        ALTER USER postgres WITH PASSWORD 'root';
        \q
        $ exit
        $ sudo -u postgres createdb labconnect
        ```
    
    * Final step
      * Run the db initialization with test/dummy data `make create`

## Testing
 * Run pytest
   * Run all the test files and generate a coverage report. Coverage reports are set up to output to the terminal and provide an HTML file that can be viewed to show what branches or statements are not covered. It is in the project's best interest to have high coverage to ensure all statements and branches work as expected.
   ```bash
   $ make test
   ```
   or manually
   ```bash
   $ python3 -m pytest
   ```
   or manually with a coverage report generated
   ```bash
   $ python3 -m pytest --cov
   ```
   or individual tests
   ```bash
   $ python3 -m pytest -q tests/(file_name).py
   ```

## Development
 * Run flask with python directly
   * Run all the test files
   ```bash
   $ make develop
   ```
   or
   ```bash
   $ python run.py
   ```

## Deployment
Create PRs to the main branch. Upon merging, a new Docker container will be created and pushed to the [packages for this repo](https://github.com/LabConnect-RCOS/LabConnect-Backend/pkgs/container/labconnect-backend).

## Production
Use the Docker container in the [packages tab](https://github.com/LabConnect-RCOS/LabConnect-Backend/pkgs/container/labconnect-backend). You can set these environment variables:

### Environment Variables

| Variable Name          | Default Value | Description                                                   |
|------------------------|---------------|---------------------------------------------------------------|
| `SECRET_KEY` | `main-secret` | Secret Key for Flask |
| `JWT_SECRET_KEY` | `jwt-secret` | Secret Key for JWT |
| `FRONTEND_URL` | None | URL to the frontend server |
| `DB` | None | URI for postgres database eg. `postgresql+psycopg2://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres/labconnect` |
| `CONFIG` | `config.TestingConfig` | Application configuration class (e.g. `config.ProductionConfig` for production) |

 * Run gunicorn to test how the service runs in production
   ```bash
   $ make run
   ```
   or with Makefile
    ```bash
   $ gunicorn run:app -w 6 --preload --max-requests-jitter 300 --bind 0.0.0.0:8000
   ```
### Current Frontend UI
<img src="src/images/website_image2.png" alt="Website Image 1" width="360" align="top">
<img src="src/images/website_image1.png" alt="Website Image 2" width="360" align="top">

# Frontend
<!-- Getting Started -->
## Prerequisites
 * Clone
    * Clone repo through CLI
        ```bash
        $ git clone https://github.com/LabConnect-RCOS/LabConnect-Frontend.git
        ```
    * or through [Github Desktop](https://desktop.github.com/)
 * Install Node and NPM. Recommend using nvm to manage node versions. The frontend currently uses `Node 22`
    * Mac: 
        ```
        $ brew install nvm
        $ nvm install node
        ```
    * Windows: [here](https://nodejs.org/dist/v22.20.0/node-v22.20.0-x64.msi) 
    * Linux:
        ```
        $ sudo apt install curl
        $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        ```
        Close and reopen terminal then run:
        ```
        $ nvm install node
        ```
 * Install Packages 
    ```
    $ npm install
    ```

### Environment Variables

| Variable Name          | Default Value | Description                                                   |
|------------------------|---------------|---------------------------------------------------------------|
| `VITE_BACKEND_SERVER` | None | URL to the backend server |

* Set the variable with:
    ```
    $ export VITE_BACKEND_SERVER="http://127.0.0.1:9000"
    ```

## Testing
 * To run the frontend locally run the following:
    ```
    $ make develop
    ```
    This command allows editing and autoreloading while making changes
    
### Linting
* Run the linter and fix any lint issues to maintain code quality and standards
    ```
    make lint
    ```

## Building
  * To build the application use this command to build the static files and test the production version of the files.
    ```
    $ npm run build
    ```
    This command allows editing and autoreloading while making changes

## Deployment
Create a PR to the main branch from your working branch. Make sure your new code is tested and bug-free. Upon merging, a build test will verify your code runs without errors, a new Docker image will be built, and the updated container will be pushed to the packages for this repo.

### Linting

Run the linter and fix any lint issues to maintiain code quality and standards
```
make lint
```

### Special Thanks
We extend our special thanks support and opportunity provided by the RCOS community.

[contributors-shield]: https://img.shields.io/github/contributors/LabConnect-RCOS/LabConnect.svg?style=for-the-badge
[contributors-url]: https://github.com/LabConnect-RCOS/LabConnect/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/LabConnect-RCOS/LabConnect.svg?style=for-the-badge
[forks-url]: https://github.com/LabConnect-RCOS/LabConnect/network/members
[stars-shield]: https://img.shields.io/github/stars/LabConnect-RCOS/LabConnect.svg?style=for-the-badge
[stars-url]: https://github.com/LabConnect-RCOS/LabConnect/stargazers
[issues-shield]: https://img.shields.io/github/issues/LabConnect-RCOS/LabConnect.svg?style=for-the-badge
[issues-url]: https://github.com/LabConnect-RCOS/LabConnect/issues
[pr-shield]: https://img.shields.io/github/issues-pr/LabConnect-RCOS/LabConnect.svg?style=for-the-badge
[pr-url]: https://github.com/LabConnect-RCOS/LabConnect/pulls
[activity-shield]: https://img.shields.io/github/last-commit/LabConnect-RCOS/LabConnect?style=for-the-badge
[activity-url]: https://github.com/LabConnect-RCOS/LabConnect/activity

<!-- LINKS & IMAGES -->
[Python]: https://img.shields.io/badge/Python-3776AB.svg?style=for-the-badge&logo=Python&logoColor=white
[Python-url]: https://www.python.org/
[Flask]: https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/en/3.0.x/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[SQLAlchemy]: https://img.shields.io/badge/SQLAlchemy-000000?style=for-the-badge&logo=sqlalchemy&logoColor=white
[SQLAlchemy-url]: https://www.sqlalchemy.org/

[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[React]: https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black
[React-url]: https://reactjs.org/
[Node.js]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Node.js-url]: https://nodejs.org/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
