const express = require("express");
const exphbs = require("express-handlebars");
const helpers = require("handlebars-helpers")(["string"]);
const path = require("path");

const port = process.env.PORT || 3000;
const app = express();

/*High order Function qui est une fonction qui se retourne la fonction passé en argument
 mais en attrapant l'erreur au passage*/

const catchErrors =
  (asyncFunction) =>
  (...args) =>
    asyncFunction(...args).catch(console.error);

const getAllPokemon = catchErrors(async () => {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const json = await res.json();
  return json;
});

const getPokemon = catchErrors(async (pokemon) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
  const json = await res.json();
  return json;
});

//middleware
//permet de chercher le dossier public et de le considéré comme la racine du projet
app.use(express.static(path.join(__dirname, "public")));

//permet de charger handlebars, ainsi l'app sais qu'on ça et qu'on peut s'en servir
const hbs = exphbs.create();
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.get(
  "/",
  catchErrors(async (req, res) => {
    const pokemons = await getAllPokemon();
    res.render("home", { pokemons });
  })
);

app.get(
  "/:pokemon",
  catchErrors(async (req, res) => {
    const search = req.params.pokemon;
    const pokemon = await getPokemon(search);
    res.render("pokemon", { pokemon });
  })
);

app.listen(port, () => console.log(`Le serveur tourne sur le port ${port} :)`));
