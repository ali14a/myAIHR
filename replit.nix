{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.python311
    pkgs.ollama
    pkgs.redis
    pkgs.postgresql
    pkgs.docker
    pkgs.docker-compose
  ];
}
