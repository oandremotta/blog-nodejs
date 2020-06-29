const mongoose = require("mongoose");
require("dotenv").config({ path: "variables.env" }); //carrega o dotenv e mostra o caminho das variaveis de ambiente

//Conexão ao banco de dados
mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});
mongoose.Promise = global.Promise; //pode usar ESC6
mongoose.connection.on("error", (error) => {
  console.error("Erro: " + error.message);
});

//carregando todos os models
require("./models/Post");
//fim do carregamento dos models
const app = require("./app"); //caregando o app

app.set("port", process.env.PORT || 7777); //pega a porta das variaveis de ambiente
const server = app.listen(app.get("port"), () => {
  console.log("Servidor rodando na porta: " + server.address().port);
});
