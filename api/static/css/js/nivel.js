let ip_global = "192.168.1.42:8000";


let parksPB = ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20"];
let parksPA = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20"];

function crearCard(container, id, park, estado) {
    let divCard = document.createElement("div");
    divCard.classList.add("card");
    divCard.classList.add(estado.toLowerCase());
    let p = document.createElement("p");
    p.id = id
    p.innerHTML = estado;
    p.classList.add("cardTitulo");
    p.classList.add("center");


    let divRow1 = document.createElement("div");
    divRow1.classList.add("center");

    let divTitulo = document.createElement("div");
    let h3 = document.createElement("h3");
    h3.classList.add("titulodiv")
    h3.innerHTML = park;
    divTitulo.appendChild(h3);

    divRow1.appendChild(divTitulo);

    /*let divImage = document.createElement("div");
    var imgAuto = document.createElement("img");
    imgAuto.setAttribute("src","/static/img/parking.png");
    imgAuto.classList.add("cardAuto");
    divImage.appendChild(imgAuto);
    divRow1.appendChild(divImage);*/

    let divButton = document.createElement("div");
    divButton.classList.add("center");

    let btnReservar = document.createElement("button");
    btnReservar.id = 'btn' + park;
    btnReservar.classList.add("custombtn");
    btnReservar.classList.add("btnReserva");

    btnReservar.onclick = function() {
        console.log(this.id)

        let sensor = this.parentNode.parentNode.getElementsByTagName("p")[0];
        let estadoActual = sensor.innerHTML;

        let btnText = this.innerHTML;
        let estado = "";

        if (btnText === "RESERVAR") {
            this.innerHTML = "LIBERAR";
            estado = "RESERVADO";
        }
        else
        {
            this.innerHTML = "RESERVAR";
            estado = "LIBERADO";
        }

        sensor.innerHTML = estado;
        let theCard = this.parentNode.parentNode;

        theCard.classList.remove(estadoActual.toLowerCase());
        theCard.classList.add(estado.toLowerCase());

        let myPromise = new Promise(function (myResolve, myReject) {
            myJson = updEstadoSensor(sensor.id, estado);
            myJson = "hola";

            if (myJson) {
                myResolve(myJson);
            } else {
                myReject("Error");
            }
        });

        myPromise.then(
            function (value) {
                console.log("value promise: ", value)
            });
    }

    /*
    let iClock = document.createElement("i");
    iClock.classList.add("fa");
    iClock.classList.add("fa-clock-o");
    iClock.classList.add("clockClass");
    btnReservar.appendChild(iClock);
    btnReservar.innerHTML = btnReservar.innerHTML + 'RESERVAR';
    */

    if (estado === "RESERVADO") {
        btnReservar.innerHTML = 'LIBERAR';
    }
    else
    {
        btnReservar.innerHTML = 'RESERVAR';
    }

    divButton.appendChild(btnReservar);

    divCard.appendChild(p);
    divCard.appendChild(divRow1);
    divCard.appendChild(divButton);
    container.appendChild(divCard);
}

function myDisplayer(some) {
    console.log("myDisplayer => ", some);
}

function crearCards(piso) {
    console.log("crearCards")
    let cardContainer = document.getElementsByClassName("contenedor-conciertos")[0];
    cardContainer.innerHTML = "";

    console.log(piso)

    let myPromise = new Promise(function (myResolve, myReject) {
        myJson = getPiso(piso)

        if (myJson) {
            myResolve(myJson);
        } else {
            myReject("Error");
        }
    });

    myPromise.then(
        function (value) {
            let cntLibre = 0;
            let cntOcupado = 0;
            let cntReservado = 0;
            let cntLiberado = 0;
            myDisplayer(value);

            console.log("totales: ", value.totales)

            value.parking.forEach(park => {
                crearCard(cardContainer, park.id, park.id_sensor_id__nombre, park.id_estado_sensor_id__codigo)

                if (park.id_estado_sensor_id__codigo == "LIBRE")
                    cntLibre++;
                else if (park.id_estado_sensor_id__codigo == "OCUPADO")
                    cntOcupado++;
                else if (park.id_estado_sensor_id__codigo == "LIBERADO")
                    cntLiberado++;
                else
                    cntReservado++;
            })

            let divTotales = document.getElementById("lugaresTotales");
            divTotales.innerHTML = value.totales;
            let divLibres = document.getElementById("lugaresLibres");
            divLibres.innerHTML = cntLibre;
            let divOcupados = document.getElementById("lugaresOcupados");
            divOcupados.innerHTML = cntOcupado;
            let divReservados = document.getElementById("lugaresReservados");
            divReservados.innerHTML = cntReservado;
            //let divLiberados = document.getElementById("lugaresLiberados");
            //divLiberados.innerHTML = cntLiberado;

        },
        function (error) { myDisplayer(error); }
    );
}


const getPiso = async (piso) => {
    params = { nivel: piso };
    url = 'http://'+ip_global+'/api/park/nivel/' + params.nivel;

    console.log(params)
    console.log(url)

    const response = await fetch(url);
    const myJson = await response.json(); //extract JSON from the http response

    return myJson
}

const getNiveles = async () => {

    const response = await fetch('http://'+ip_global+'/api/nivel/');
    const myJson = await response.json(); //extract JSON from the http response

    console.log("nivelesss: " + myJson)

    /*
    myJson.parking.forEach(park => {
        console.log("paaaark: " + park.id_sensor_id__nombre)
        console.log("paaaark: " + park.id_estado_sensor_id__codigo)

        // let nro = Math.floor(Math.random() * 11);
        // let estado = "Habilitado";
        // if (nro % 2 == 1)
        //     estado = "Deshabilitado";
//
        // crearCard(cardContainer, park, estado)

    })
    */
    return myJson
}

function actualizarPiso() {
    let selected = document.getElementById("comboPisos").value;
    console.log("seleccionaste: " + selected)

    crearCards(selected)
}

function resetColor(value) {

    let estado = value.parentNode.parentNode.getElementsByTagName("p")[0]
    let somehtml = value.parentNode.parentNode.parentNode.getElementsByClassName("semaphore")[0];
    console.log('aja: ', somehtml);

    let cntTextLibres = document.getElementById("lugaresLibres").innerHTML;
    let cntTextOcupados = document.getElementById("lugaresOcupados").innerHTML;

    console.log("cntTextLibres: ", cntTextLibres)
    console.log("cntTextOcupados: ", cntTextOcupados)

    if (somehtml.classList.contains("go")) {
        estado.innerHTML = 'OCUPADO'
        somehtml.classList.remove("go");
        somehtml.classList.add("stop");

        cntTextLibres = Number(cntTextLibres) - 1;
        cntTextOcupados = Number(cntTextOcupados) + 1;
    } else {
        estado.innerHTML = 'LIBRE'
        somehtml.classList.remove("stop");
        somehtml.classList.add("go");

        cntTextLibres = Number(cntTextLibres) + 1;
        cntTextOcupados = Number(cntTextOcupados) - 1;
    }

    document.getElementById("lugaresLibres").innerHTML = cntTextLibres;
    document.getElementById("lugaresOcupados").innerHTML = cntTextOcupados

    console.log("cntTextLibres: ", cntTextLibres)
    console.log("cntTextOcupados: ", cntTextOcupados)

    updEstadoSensor(estado.id, estado.innerHTML)

    // value.parentNode.parentNode.parentNode.getElementsByClassName("semaphore").style = "semaphore stop";
}


function precarga() {
    console.log("precarga");

    let myPromise = new Promise(function (myResolve, myReject) {
        myJson = getNiveles()

        if (myJson) {
            myResolve(myJson);
        } else {
            myReject("Error");
        }
    });

    let select = document.getElementById('comboPisos')

    select.innerText = null

    myPromise.then(
        function (value) {
            myDisplayer(value);

            value.niveles.forEach(nivel => {
                console.log("niveles: " + nivel.id)
                console.log("niveles: " + nivel.nivel)
                console.log("niveles: " + nivel.descripcion)

                var opt = document.createElement('option');
                opt.value = nivel.id;
                opt.innerHTML = nivel.descripcion;
                select.appendChild(opt);
            })

            actualizarPiso()

        },
        function (error) { myDisplayer(error); }
    );

    let timeOutID = setTimeout(precarga, 20000);
}

const updEstadoSensor = async (id_park, estado) => {
    console.log("id_park: ", id_park)
    console.log("estado: ", estado)
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: estado })
    };

    const response = await fetch('http://'+ip_global+'/api/park/' + id_park, requestOptions);
    const myJson = await response.json(); //extract JSON from the http response

    console.log("update: " + myJson)

    return myJson
}

const getOcupacion = async () => {

    const response = await fetch('http://'+ip_global+'/api/park/');
    const myJson = await response.json(); //extract JSON from the http response

    console.log("estacionamiento: " + myJson)

    return myJson
}

const idxAcum = {
    Totales: 0,
    Libres: 1,
    Ocupados: 2,
    Reservados: 3
}
