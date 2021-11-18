const formulario = document.getElementById("formulario");
const loading = document.getElementById("loading");
const resultadoError = document.getElementById("resultadoError");
const resultadoUser = document.getElementById("resultadoUser");
const resultadoRepo = document.getElementById("resultadoRepo");
const templateUser = document.getElementById("templateUser").content;
const templateRepo = document.getElementById("templateRepo").content;
const templateError = document.getElementById("templateError").content;

class User {
    #url = "https://api.github.com/users";
    constructor(name) {
        this.name = name;
    }

    get getUrlBase() {
        return this.#url;
    }

    get getUrlUser() {
        return `${this.getUrlBase}/${this.name}`;
    }

    async fetchUser() {
        try {
            const res = await fetch(this.getUrlUser);

            if (!res.ok) {
                return {
                    ok: false,
                    error: "User no existe",
                };
            }

            const data = await res.json();

            return {
                ok: true,
                data,
            };
        } catch (error) {
            console.log(error);
            return {
                ok: false,
                error,
            };
        }
    }
}

class Repo extends User {
    constructor(name, pagina, nRepos) {
        super(name);
        this.pagina = pagina;
        this.nRepos = nRepos;
    }

    get getUrlRepo() {
        return `${this.getUrlBase}/${this.name}/repos?page=${this.pagina}&per_page=${this.nRepos}`;
    }

    async fectchRepo() {
        try {
            const res = await fetch(this.getUrlRepo);

            console.log(res);

            if (!res.ok) {
                return {
                    ok: false,
                    error: "Repo no existe",
                };
            }

            const data = await res.json();
            console.log(data);

            return {
                ok: true,
                data,
            };
        } catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }
}

formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(formulario);
    const objetoData = Object.fromEntries([...data.entries()]);

    const repo = new Repo(
        objetoData.name,
        objetoData.pagina,
        objetoData.nRepos
    );

    pintarDatos(repo);
});

const pintarDatos = async (repo) => {
    loading.classList.remove("d-none");
    try {
        const user = await repo.fetchUser();
        if (!user.ok) {
            return pintarError(user.error);
        }
        pintarUser(user.data);

        const repos = await repo.fectchRepo();
        if (!repos.ok) {
            return console.log(repos);
        }

        if (repos.data.length === 0) {
            pintarRepos(repos.data);
            return pintarError("sin repos en esa página");
        }

        // limpiamos error
        resultadoError.textContent = "";

        pintarRepos(repos.data);
    } catch (error) {
        console.log(error);
    } finally {
        loading.classList.add("d-none");
    }
};

const pintarError = (error) => {
    resultadoError.textContent = "";
    const clone = templateError.cloneNode(true);
    clone.querySelector(".alert").textContent = error;
    resultadoError.appendChild(clone);
};

const pintarUser = (user) => {
    resultadoUser.textContent = "";
    const clone = templateUser.cloneNode(true);
    clone.querySelector("img").setAttribute("src", user.avatar_url);
    clone.querySelectorAll("li")[1].textContent = user.name;
    clone.querySelectorAll("li")[2].textContent = user.bio
        ? user.bio
        : "sin descripción";
    clone.querySelectorAll("li")[3].textContent = user.blog;
    resultadoUser.appendChild(clone);
};

const pintarRepos = (repos) => {
    resultadoRepo.textContent = "";
    const fragment = document.createDocumentFragment();
    repos.forEach((item) => {
        const clone = templateRepo.cloneNode(true);
        clone.querySelector("li").textContent = item.name;
        fragment.appendChild(clone);
    });
    resultadoRepo.appendChild(fragment);
};
