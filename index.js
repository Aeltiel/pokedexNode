const express = require("express");
const exphbs = require("express-handlebars");
const helpers = require("handlebars-helpers")(["string"]);
const path = require("path");
const bodyParser = require("body-parser");

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
// permet de signifier qu'on utilisera pas de librairies externes pour envoyer les donné du formulaire
app.use(bodyParser.urlencoded({ extended: false }));

app.get(
  "/",
  catchErrors(async (req, res) => {
    const pokemons = await getAllPokemon();
    res.render("home", { pokemons });
  })
);

app.post("/search", (req, res) => {
  const search = req.body.search;
  res.redirect(`/${search}`);
});

app.get("/notFound", (req, res) => res.render("notFound"));

app.get(
  "/:pokemon",
  catchErrors(async (req, res) => {
    const search = req.params.pokemon;
    const pokemon = await getPokemon(search);
    if (pokemon) {
      res.render("pokemon", { pokemon });
    } else {
      res.redirect("notFound");
    }
  })
);

app.listen(port, () => console.log(`Le serveur tourne sur le port ${port} :)`));
