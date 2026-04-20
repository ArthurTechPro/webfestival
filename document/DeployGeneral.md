# DEPLOY GENERAL VPS

cd /opt/webfestival

# 1. Pull del código 
cd webfestival-api && git pull origin master && cd ..
cd webfestival-app && git pull origin master && cd ..

# 2. Aplicar la migración de base de datos
docker exec wf-api npx prisma migrate deploy

# 3. Reconstruir y reiniciar la API
docker compose up -d --build api

# 4. Si también tienes el frontend en el mismo repo, reconstruirlo
docker compose up -d --build app