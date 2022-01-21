import paper from 'paper';
import "bootstrap";
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'


import Sandbox from "./sandbox";
import App from "./App";
import "@style/main.scss";

const canvasField = document.getElementById("work-area");
paper.install(window);
paper.setup(canvasField);

// const sandbox = new Sandbox(paper);
// sandbox.init();

const app = new App(paper);
app.init();
