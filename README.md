# Pratica 1 -DevOps

Aluno: Luiz Gustavo da Silva Barros
RA: 800225

O Projeto a seguir consiste em um sistema com o objetivo de executar, via Docker e containers, uma aplicação que faça requisições de Login, Cadastro e conexão entre os usuários.
O sistema proporciona que o usuário possa fazer cadastro, login e visualize outros usuários utilizando a mesma aplicação.
Entre estes usuários, é possível enviar uma "Solicitação de Amizade".
No projeto, foi utilizada as linguagens: HTML, CSS e JS para o frontend, que podem ser executados via Docker, através do comando:

docker build frontend

Para o backend, foi utilizada a linguagem Node.JS, que irá criar os servidores e as rotas entre as partes de frontend e Banco de Dados, que pode ser executado através de:

docker build backend

E, por fim, para o Banco de Dados, utilizamos a linguagem MySQL, presente na pasta db, que contém init.sql que servirá para inicialização do Banco de Dados.

Para utilizar o programa inteiro, basta executar via Docker, através do comando:

cd solicitacao_amizade
docker compose up --build

A partir disso, é possível observar a execução do programa em localhost:8080, que abrirá a opção de fazer login ou fazer cadastro no sistema.

Caso seja escolhido fazer cadastro, basta inserir um nome de usuário e senha, que será criptografada a partir da biblioteca bcrypt através de hash.

O sistema irá redirecioná-lo para a página de Login, em que deve se inserir os dados cadastrados anteriormente e será executado com sucesso.

Então, há a opção de abrir a página de usuários cadastrados.
Abrindo essa opção, aparecerá uma lista dos usuários e um botão de solicitação de amizade.

Para atestar a corretude do programa, há a possibilidade de fazer login como o usuário no qual foi enviada a solicitação.

Testado o programa, basta finalizá-lo com o comando:

docker compose down


