const libro18 = document.getElementById("libro18");

const modal = document.getElementById("adultModal");

const btnSi = document.getElementById("btnSi");

const btnNo = document.getElementById("btnNo");

let destino = "";

if (libro18) {

    libro18.addEventListener("click", function (e) {

        e.preventDefault();

        destino = this.href;

        modal.style.display = "flex";

    });

}

if (btnSi) {

    btnSi.addEventListener("click", function () {

        window.location.href = destino;

    });

}

if (btnNo) {

    btnNo.addEventListener("click", function () {

        modal.style.display = "none";

    });

}

window.addEventListener("click", function (e) {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});