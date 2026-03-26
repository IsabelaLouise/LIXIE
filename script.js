const inputData = document.getElementById("data_nasc");


inputData.addEventListener("input", function(e) {
    let v = e.target.value;

    v = v.replace(/\D/g, "");

    if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0,5) + "/" + v.slice(5,9);

    e.target.value = v;
});

const numero = document.getElementById("numero");

numero.addEventListener("input", function(e) {
    let v = e.target.value;

    v = v.replace(/\D/g, "");

    if (v.length > 2) v = "(" + v.slice(0,2) + ") " + v.slice(2);
    if (v.length > 10) v = v.slice(0,10) + "-" + v.slice(10,15);

    e.target.value = v;
});

