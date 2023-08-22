let ip_global = "192.168.1.42:8000";


function myDisplayer(some) {
    console.log("myDisplayer => ", some);
}

function precarga() {
    //console.log("precarga");

    armarTableroOcupacion();

    armarCardsOcupacion();
}

const getOcupacion = async () => {

    const response = await fetch('http://'+ip_global+'/api/park/');
    const myJson = await response.json(); //extract JSON from the http response

    //console.log("estacionamiento: " + myJson)

    return myJson
}

const idxAcum = {
    Totales: 0,
    Libres: 1,
    Ocupados: 2

}

function armarCardsOcupacion() {
    console.log("armarCardsOcupacion");

    let myPromise = new Promise(function (myResolve, myReject) {
        myJson = getOcupacion()

        if (myJson) {
            myResolve(myJson);
        } else {
            myReject("Error");
        }
    });

    let divContainer = document.getElementById("contenedorCards");

    myPromise.then(
        function (value) {
            let arrCnt = [0,0,0,0,0];
            let cntTotales = 0;
            let cntLibre = 0;
            let cntOcupado = 0;
            myDisplayer(value);

            console.log("totales: ", value.totales)

            value.parking.forEach(park => {
                //crearCard(cardContainer, park.id, park.id_sensor_id__nombre, park.id_estado_sensor_id__codigo)

                arrCnt[idxAcum.Totales]++;

                if (park.id_estado_sensor_id__codigo == "LIBRE")
                    arrCnt[idxAcum.Libres]++;
                else if (park.id_estado_sensor_id__codigo == "OCUPADO")
                    arrCnt[idxAcum.Ocupados]++;
                else if (park.id_estado_sensor_id__codigo == "LIBERADO")
                    arrCnt[idxAcum.Liberados]++;
                else if (park.id_estado_sensor_id__codigo == "RESERVADO")
                arrCnt[idxAcum.Ocupados]++;
            })

            arrCnt.forEach( (value, index) => {
                console.log("cnt: ", value);
                console.log("cnt2: ", Object.keys(idxAcum)[index].toUpperCase());

                if (index > 0 )
                    crearCard(divContainer, 1, Object.keys(idxAcum)[index], value);
            });
        },
        function (error) { myDisplayer(error); }
    );
}

function crearCard(container, id, estado, cantidad) {
    let divCard = document.createElement("div");
    divCard.classList.add("card-view-totales");
    divCard.classList.add(estado.toLowerCase());

    let p = document.createElement("p");
    p.id = id
    p.innerHTML = estado.toUpperCase();
    p.classList.add("cardTitulo");
    p.classList.add("center");


    let divRow1 = document.createElement("div");
    divRow1.classList.add("center");

    let divTitulo = document.createElement("div");
    let h3 = document.createElement("h3");
    h3.classList.add("titulodiv")
    h3.innerHTML = cantidad;
    divTitulo.appendChild(h3);
    divRow1.appendChild(divTitulo);


    divCard.appendChild(divRow1);
    divCard.appendChild(p);
    container.appendChild(divCard);
}


function armarTableroOcupacion() {

    let myPromise = new Promise(function (myResolve, myReject) {
        myJson = getOcupacion()

        if (myJson) {
            myResolve(myJson);
        } else {
            myReject("Error");
        }
    });

    let divTableWrapper = document.createElement("div");
    divTableWrapper.classList.add("table-wrapper");

    myPromise.then(
        function (value) {
            //myDisplayer(value);

            /*

            let table = document.createElement('table');
            table.classList.add("table");
            table.classList.add("table-striped");

            let tableHeader = document.createElement('thead');
            tableHeader.classList.add("tableHeader");

            let tableHeaderRow = document.createElement('tr');
            tableHeaderRow.classList.add("tableHeaderRow");

            let headerValues = ['Piso', 'Totales', 'Libres', 'Ocupados', 'Reservados'];
            let i = 0;
            headerValues.forEach(function (rowData) {
                let cell = document.createElement('td');
                i++;
                cell.id = i;
                cell.appendChild(document.createTextNode(rowData));
                tableHeaderRow.appendChild(cell);
                //console.log(headerValues);
            });

            */
            tableHeader.appendChild(tableHeaderRow);

            table.appendChild(tableHeader);

            let estadisticas = new Object();

            value.parking.forEach(cochera => {
                //console.log("cochera: %O", cochera)
                //console.log("cochera: " + cochera.id_nivel_id__descripcion)
                //console.log("cochera: " + cochera.id_estado_sensor_id__codigo)

                fila = estadisticas[cochera.id_nivel_id__descripcion] || [0, 0, 0, 0];

                //console.log("fila: ", fila)

                if (cochera.id_estado_sensor_id__codigo == "OCUPADO") {
                    fila[idxAcum.Ocupados] = fila[idxAcum.Ocupados] + 1;
                } else if (cochera.id_estado_sensor_id__codigo == "LIBRE") {
                    fila[idxAcum.Libres] = fila[idxAcum.Libres] + 1;
                }

                fila[idxAcum.Totales] = fila[idxAcum.Totales] + 1;

                estadisticas[cochera.id_nivel_id__descripcion] = fila;
            })

            //console.log("estadisticas: ", estadisticas);

            let tableBody = document.createElement('tbody');
            tableBody.classList.add("tableBody");

            for (let [key, value] of Object.entries(estadisticas)) {
                //console.log(key, value);

                let tableBodyRow = document.createElement('tr');
                tableBodyRow.classList.add("tableBodyRow");

                let cell = document.createElement('td');
                cell.appendChild(document.createTextNode(key));
                tableBodyRow.appendChild(cell);

                value.forEach(function (rowData) {
                    let cell = document.createElement('td');
                    cell.appendChild(document.createTextNode(rowData));
                    tableBodyRow.appendChild(cell);

                });

                tableBody.appendChild(tableBodyRow);
            }

            table.appendChild(tableBody);

            document.getElementById("tablaprueba").appendChild(table);
        },
        function (error) { myDisplayer(error); }
    );
}

