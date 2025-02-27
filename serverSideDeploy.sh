#!/bin/bash 
docker pull git.sethsamuel.online/fluffy/mission_ready_mission2
docker stack deploy --with-registry-auth --compose-file docker-compose.yml mission_ready_mission2