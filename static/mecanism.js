var socket = io.connect('http://'+document.domain+':5050/mecanism');
var container_grafice = {}

socket.on('connect', function () {
  console.log("concted!")
})
var pozitii = ['Extins', 'Retras']
var actiuni = ['Extinde', 'Retrage']
var pini = ['GPIO 2', 'GPIO 3', 'GPIO 4', 'GPIO 5', 'GPIO 6', 'GPIO 7', 'GPIO 8', 'GPIO 9', 'GPIO 10', 'GPIO 11', 'GPIO 12', 'GPIO 13', 'GPIO 16', 'GPIO 17', 'GPIO 18', 'GPIO 19', 'GPIO 20', 'GPIO 21', 'GPIO 22', 'GPIO 23', 'GPIO 24', 'GPIO 25', 'GPIO 26', 'GPIO 27']
var actiune = ['Simpla', 'Dubla']
var nume_motoare = []
var mecanism = {};



$("#mecanism_nume").dxTextBox({
    placeholder: 'Mecanism nume'
})

$("#MotoareBtn").click(function () {
    mecanism.nume = $('#mecanism_nume').dxTextBox('instance').option('value');
    $("#pagina_1").hide();
    $("#pagina_2").show();
})
$("#schimbaMecanismBtn").click(function () {
    $("#pagina_1").show();
    $("#pagina_2").hide();
})
$("#secventaBtn").click(function () {
    $("#pagina_2").hide();
    $("#pagina_3").show();
    citesteMotoare();
    genereazaCampuriFaze(1);
})
$("#schimbaMotoareBtn").click(function () {
    $("#pagina_2").show();
    $("#pagina_3").hide();
})
$("#testeazaBtn").click(function (){
    citesteFaze();
    console.log(mecanism);
    socket.emit('mecanism', mecanism)
    $("#pagina_3").hide();
    $("#pagina_4").show();
    
})
$("#schimbaFazeBtn").click(function(){
    $("#pagina_4").hide();
    $("#pagina_3").show();
    $("#eroare").hide();
    $("#incheiat").hide();
    reseteaza_grafice();
})
$("#startTestBtn").click(function(){
    socket.emit('start');
})
$("#salveazaMecanismBtn").click(function (){
    socket.emit('save_mecanism')
})

$("#motor_1_elimina").hide();
$("#faza_1_elimina").hide();
genereazaCampuriMotor(1);


async function motorNou(i) {
    // called on "Add another button"
    // waits for the new element html to be generated
    // after set it's fields
    await genereazaMotorHTML(i)
    genereazaCampuriMotor(i)
}

async function genereazaMotorHTML(i) {
    let inainte = i - 1;
    let dupa = i + 1;
    $("#motor_" + inainte).after($('<div id="motor_' + i + '">\
            <div class="row">\
                <h4>Motor ' + i + '</h4>\
            </div>\
            <div class="row">\
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                    <div class="row">\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                            Nume\
                        </div>\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 motoare" id="motor_' + i + '_nume"></div>\
                    </div>\
                </div>\
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                </div>\
            </div>\
            <div class="row" style="padding-top: 15px">\
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                    <div class="row">\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                            Pozitie initiala\
                        </div>\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6" id="motor_' + i + '_initial"></div>\
                    </div>\
                </div>\
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                    <div class="row">\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                            Tipul actiunii\
                        </div>\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6" id="motor_' + i + '_actiune"></div>\
                    </div>\
                </div>\
            </div>\
            <div class="row">\
                <h6>Senzori capat de cursa</h6>\
            </div>\
            <div class="row">\
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                    <div class="row">\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                            Piston retras\
                        </div>\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6" id="motor_' + i + '_min"></div>\
                    </div>\
                </div>\
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                    <div class="row">\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                            Piston extins\
                        </div>\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6" id="motor_' + i + '_max"></div>\
                    </div>\
                </div>\
            </div>\
            <div class="row">\
                <h6>Actuatori</h6>\
            </div>\
            <div class="row">\
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                    <div class="row">\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                            Extinde piston\
                        </div>\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6" id="motor_' + i + '_plus"></div>\
                    </div>\
                </div>\
                <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                    <div class="row">\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                            Retrage piston\
                        </div>\
                        <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6" id="motor_' + i + '_minus"></div>\
                    </div>\
                </div>\
            </div>\
            <div class="row d-flex flex-row justify-content-aroud" style="padding-top: 30px">\
                <div class="col-lg-2 col-md-2 col-sm-2 col-xs-2 mx-auto">\
                    <button type="button" class="btn btn-danger" id="motor_' + i + '_elimina">Elimina</button>\
                </div>\
                <div class="col-lg-2 col-md-2 col-sm-2 col-xs-2 mx-auto">\
                    <button type="button" class="btn btn-primary" id="motor_' + dupa + '_adauga">Adauga motor</button>\
                </div>\
            </div>\
        </div>'))
}

function genereazaCampuriMotor(i) {
    let inainte = i - 1;
    let dupa = i + 1;
    $("#motor_" + i + "_nume").dxTextBox({
        placeholder: 'Nume motor'
    })
    $("#motor_" + i + "_initial").dxSelectBox({
        items: pozitii,
        placeholder: 'Pozitie'
    });
    $("#motor_" + i + "_actiune").dxSelectBox({
        items: actiune,
        placeholder: 'Tipul actiunii'
    });
    $("#motor_" + i + "_min").dxSelectBox({
        items: pini,
        placeholder: 'Alege pin'
    });
    $("#motor_" + i + "_max").dxSelectBox({
        items: pini,
        placeholder: 'Alege pin'
    });
    $("#motor_" + i + "_plus").dxSelectBox({
        items: pini,
        placeholder: 'Alege pin'
    });
    $("#motor_" + i + "_minus").dxSelectBox({
        items: pini,
        placeholder: 'Alege pin'
    });
    $("#motor_" + i + "_elimina").click(function () {
        $("#motor_" + i).remove();
        if (inainte !== 1) {
            $("#motor_" + inainte + "_elimina").show();
        }

        $("#motor_" + i + "_adauga").show();
    })
    $("#motor_" + dupa + "_adauga").click(function () {
        $("#motor_" + dupa).show();
        $("#motor_" + i + "_elimina").hide();
        $("#motor_" + dupa + "_adauga").hide();
        motorNou(dupa);
    })
}

function citesteMotoare() {
    mecanism.motoare = [];
    mecanism.motoare.length = 0;
    number_motors = $("#motoare").children().length;
    for (let i = 1; i <= number_motors; i++) {
        motor = {}
        motor.numar = i;
        motor.nume = $("#motor_" + i + "_nume").dxTextBox('instance').option('value');
        motor.initial = $("#motor_" + i + "_initial").dxSelectBox('instance').option('value');
        motor.actiune = $("#motor_" + i + "_actiune").dxSelectBox('instance').option('value');
        motor.min = $("#motor_" + i + "_min").dxSelectBox('instance').option('value');
        motor.max = $("#motor_" + i + "_max").dxSelectBox('instance').option('value');
        motor.plus = $("#motor_" + i + "_plus").dxSelectBox('instance').option('value');
        motor.minus = $("#motor_" + i + "_minus").dxSelectBox('instance').option('value');
        mecanism.motoare.push(motor)
        nume_motoare.push(motor.nume)
    }
    genereazaGrafice(nume_motoare)
}

function genereazaCampuriFaze(i) {
    console.log('genereaza campuri faze');
    let inainte = i - 1;
    let dupa = i + 1;
    $("#faza_" + i + "_motor").dxSelectBox({
        items: nume_motoare,
        placeholder: 'Alege motor'
    });
    $("#faza_" + i + "_actiune").dxSelectBox({
        items: actiuni,
        placeholder: 'Alege actiune'
    });
    $("#faza_" + i + "_elimina").click(function () {
        $("#faza_" + i).remove();
        if (inainte !== 1) {
            $("#faza_" + inainte + "_elimina").show();
        }

        $("#faza_" + i + "_adauga").show();
    })
    $("#faza_" + dupa + "_adauga").click(function () {
        $("#faza_" + dupa).show();
        $("#faza_" + i + "_elimina").hide();
        $("#faza_" + dupa + "_adauga").hide();
        fazaNoua(dupa);
    })
}

async function fazaNoua(i) {
    console.log('faza noua');
    await genereazaFazeHTML(i)
    genereazaCampuriFaze(i)
}
async function genereazaFazeHTML(i) {
    console.log('genereaza faza html');
    let inainte = i - 1;
    let dupa = i + 1;
    $("#faza_" + inainte).after($('<div id="faza_' + i +'">\
                <div class="row">\
                    <h4>Faza ' + i +'</h4>\
                </div>\
                <div class="row" style="padding-top: 15px">\
                    <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                        <div class="row">\
                            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                                Motor\
                            </div>\
                            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6" id="faza_' + i +'_motor"></div>\
                        </div>\
                    </div>\
                    <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                        <div class="row">\
                            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">\
                                Actiune\
                            </div>\
                            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6" id="faza_' + i +'_actiune"></div>\
                        </div>\
                    </div>\
                </div>\
                <div class="row d-flex flex-row justify-content-aroud" style="padding-top: 30px">\
                    <div class="col-lg-2 col-md-2 col-sm-2 col-xs-2 mx-auto">\
                        <button type="button" class="btn btn-danger" id="faza_' + i +'_elimina">Elimina</button>\
                    </div>\
                    <div class="col-lg-2 col-md-2 col-sm-2 col-xs-2 mx-auto">\
                        <button type="button" class="btn btn-primary" id="faza_' + dupa +'_adauga">Adauga faza</button>\
                    </div>\
                </div>\
            </div>'))
}

function citesteFaze() {
    mecanism.faze = [];
    numar_faze = $("#faze").children().length;
    for (let i = 1; i <= numar_faze; i++) {
        faza = {}
        faza.numar = i;
        faza.motor = $("#faza_" + i + "_motor").dxSelectBox('instance').option('value');
        faza.actiune = $("#faza_" + i + "_actiune").dxSelectBox('instance').option('value');
        mecanism.faze.push(faza)
    }
}

async function genereazaGrafice(nume_motoare){
    await genereazaGraficeHTML(nume_motoare);
    configureazaGrafice(nume_motoare);
}

async function genereazaGraficeHTML(nume_motoare){
    for (motor of nume_motoare){
        $('#buttons_graph').before($('<div class="row" style="padding-top: 40px;">\
        <div class="col-lg-1 col-md-1 col-sm-1 col-xs-1 position-labels" style="height:120px;width: 15%;">\
            <div class="row">' + motor + '1</div>\
            <div class="row">' + motor +'0</div>\
        </div>\
        <div class="col-lg-10 col-md-10 col-sm-10 col-xs-10">\
            <canvas id="'+ motor + 'PosChart" class="chart-sequence"></canvas>\
        </div>\
    </div>'))
    }
}

function configureazaGrafice(nume_motoare){
    container_grafice = {}
    for (motor of nume_motoare){
        container_grafice[motor + 'PosCtx'] = document.getElementById(motor + 'PosChart').getContext('2d');
        container_grafice[motor +'PosData'] = {
            type: 'line',
            data: {
              labels: [],
              datasets: [{
                data: [],
                borderColor: 'rgb(255, 99, 132, 1)',
                borderWidth: 1
              }]
            },
            options:{
              legend : {
                display : false
              },
              scales: {
                yAxes: [{
                  display: false,
                }],
                xAxes: [{
                  display: true,
                  ticks : {
                    fontSize : 20
                  },
                  scaleLabel: {
                    display: true,
                    labelString: "Timp [ms]",
                    fontSize: 30
                  }
                }]
              },
              elements : {
                line : {
                  tension : 0
                }
              }
            }
          }
        container_grafice[motor + 'PosChart'] = new Chart(container_grafice[motor + 'PosCtx'], container_grafice[motor +'PosData']);
    }
}

function reseteaza_grafice(){
    for(motor of nume_motoare){
        container_grafice[motor + 'PosData'].data.datasets[0].data.length = 0;
        container_grafice[motor + 'PosData'].data.labels.length = 0;
        container_grafice[motor + 'PosChart'].update();
    }
}


socket.on('faza', function(msg){
    console.log(msg);
    for(motor of nume_motoare){
        container_grafice[motor + 'PosData'].data.datasets[0].data.push(msg.positions[motor])
        container_grafice[motor + 'PosData'].data.labels.push(msg.moment);
        container_grafice[motor + 'PosChart'].update();
    }
})


socket.on('eroare', function(msg){
    $("#eroare").text(msg.message);
    $("#eroare").show();
})

socket.on('incheiat', function(msg){
    $("#incheiat").show();
})


