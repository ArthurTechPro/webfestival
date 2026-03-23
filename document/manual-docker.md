cat << 'EOF' > manual-docker.md
# 🐳 Manual Completo de Docker

## 📌 ¿Qué es Docker?
Docker es una plataforma que permite crear, ejecutar y administrar aplicaciones dentro de contenedores.

# 🚀 Instalación (Linux)
```sh
sudo apt update  
sudo apt install docker.io -y  
sudo systemctl start docker  
sudo systemctl enable docker  
docker --version  
```
# 📦 Comandos básicos
```sh
docker --version
docker info
docker help
```
# 🖼️ Imágenes
```sh
docker pull nginx
docker images
docker rmi nginx
docker build -t mi_app .
docker tag mi_app usuario/mi_app:v1
docker push usuario/mi_app:v1
``
# 📦 Contenedores
```sh
docker run nginx
docker run -d nginx
docker run -it ubuntu bash
docker run -p 8080:80 nginx
docker run --name mi_nginx nginx

docker ps
docker ps -a

docker stop mi_nginx
docker start mi_nginx
docker restart mi_nginx

docker rm mi_nginx
docker rm -f mi_nginx
```
# 📂 Logs
```sh
docker logs mi_nginx
docker logs -f mi_nginx
docker stats
docker top mi_nginx
```
# 🧠 Exec
```sh
docker exec -it mi_nginx bash
docker exec mi_nginx ls /
```
# 💾 Volúmenes
```sh
docker volume create mi_volumen
docker volume ls
docker volume inspect mi_volumen
docker volume rm mi_volumen
docker run -v mi_volumen:/data nginx
```
# 🌐 Redes
```sh
docker network ls
docker network create mi_red
docker network inspect mi_red
docker network rm mi_red
docker run --network mi_red nginx
```
# 🧹 Limpieza
```sh
docker system df
docker system prune
docker container prune
docker image prune
docker volume prune
```
# 🧩 Docker Compose
```sh
docker compose up
docker compose up -d
docker compose down
docker compose ps
```