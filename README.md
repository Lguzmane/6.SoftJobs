# Soft Jobs - Autenticación con JWT
Backend: Node.js + Express + PostgreSQL | Frontend: React

## Instrucciones para ejecutar

1. Clonar repositorio:

2. Configurar base de datos (ejecutar en psql):
CREATE DATABASE softjobs;
\c softjobs;
CREATE TABLE usuarios(id SERIAL, email VARCHAR(50) NOT NULL, password VARCHAR(60) NOT NULL, rol VARCHAR(25), lenguage VARCHAR(20));

3. Iniciar backend:
cd backend
npm install
npm start

4. Iniciar frontend (en otra terminal):
cd frontend
npm install
npm start
