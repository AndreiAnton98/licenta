
var socket = io.connect('http://' + document.domain + ':5050/foloseste_mecanism');
var mecanism_json;
var container_grafice = {}
socket.on('mecanism_list', function (msg) {
    console.log('received list')
    console.log(msg)
    for (var i = 0; i < msg.mecanisme_list.length; i++) {
        var dataSource = $("#tabel_mecanisme").dxDataGrid({}).dxDataGrid("instance").getDataSource();
        dataSource.store().insert({
            "Nume mecanism": msg.mecanisme_list[i]["nume"],
            "mecanism_id": msg.mecanisme_list[i]["id"],
        }).then(function () {
            dataSource.reload();
        });
    }
    var cols = $("#tabel_mecanisme").dxDataGrid("instance").option("columns");
    cols.push({
        caption: "Use",
        cellTemplate: function (element, options) {
            $('<button type="button" class="btn btn-primary" style="margin-top:0px">Use</button>')
                .click(function () {
                    console.log(options.row.key)
                    socket.emit('select_mecanism', options.row.key.mecanism_id)
                })
                .appendTo(element)
        }
    })
    $("#tabel_mecanisme").dxDataGrid("instance").option("columns", cols);
})

$(function () {
    $("#tabel_mecanisme").dxDataGrid({
        selection: {
            mode: "single"
        },
        filterRow: {
            visible: false,
            applyFilter: "auto"
        },
        hoverStateEnabled: true,
        showBorders: true,
        showRowLines: true,
        columnAutoWidth: true,
        dataSource: [],
        editing: {
            // allowUpdating: true,
            //   allowDeleting: true
        },
        columns: [
            {
                dataField: "Nume mecanism",

            },
            {
                dataField: "mecanism_id",
                allowHiding: true,
                visible: false
            }
        ]
    });
})

function genereazaMotorHTML() {
    for (let j = 0; j < mecanism_json.motoare.length; j++) {
        i = j + 1;
        if (mecanism_json.motoare[j].actiune === "Double") {
            $("#motoare").append($('<div id="motor_' + i + '">\
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
                <h6>Senzori de capat de cursa</h6>\
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
        </div>'))
        } else {
            $("#motoare").append($('<div id="motor_' + i + '">\
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
                <h6>Senzori de capat de cursa</h6>\
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
                    </div>\
                </div>\
            </div>\
        </div>'))
        }
        $("#motor_" + i +"_nume").text(mecanism_json.motoare[j].nume);
        $("#motor_" + i +"_initial").text(mecanism_json.motoare[j].initial);
        $("#motor_" + i +"_type").text(mecanism_json.motoare[j].actiune);
        $("#motor_" + i +"_min").text(mecanism_json.motoare[j].min);
        $("#motor_" + i +"_max").text(mecanism_json.motoare[j].max);
        $("#motor_" + i +"_plus").text(mecanism_json.motoare[j].plus);
        if(mecanism_json.motoare[j].actiune === "Double"){
            $("#motor_" + i +"_minus").text(mecanism_json.motoare[j].minus);
        }
    }
}

function genereazaFazeHTML(){
    for (let j = 0; j <mecanism_json.faze.length; j++){
        i = j +1;
        console.log(i);
        $("#faze").append($('<div class="row">\
        <div id = "faza_' + i + '_numar" class="col-lg-4 col-sm-4 col-md-4 col-xs-4"></div>\
        <div id = "faza_' + i + '_motor" class="col-lg-4 col-sm-4 col-md-4 col-xs-4"></div>\
        <div id = "faza_' + i + '_actiune" class="col-lg-4 col-sm-4 col-md-4 col-xs-4"></div>\
        </div>'))
        $("#faza_" + i +"_numar").text("Faza " +mecanism_json.faze[j].numar);
        $("#faza_" + i +"_motor").text(mecanism_json.faze[j].motor);
        $("#faza_" + i +"_actiune").text(mecanism_json.faze[j].actiune);

    }
}

socket.on('mecanism_json', function (msg) {
    console.log('received json');
    console.log(msg);
    mecanism_json = msg;
    $("#nume_mecanims").text(mecanism_json.nume);
    genereazaMotorHTML();
    genereazaFazeHTML();
    $("#pagina_1").hide();
    $("#pagina_2").show();
    genereazaGrafice()
})

$("#schimbaMecanismBTN").click(function (){
    $("#pagina_2").hide();
    $("#pagina_1").show();
    $("#motoare").empty();
    $("#faze").empty();
})

$("#testBtn").click(function (){
    $("#pagina_2").hide();
    $("#pagina_3").show();
})

$("#startBtn").click(function (){
    reseteaza_grafice();
    socket.emit('start');
})

socket.on('faza', function(msg){
    console.log(msg);
    for(let j = 0; j < mecanism_json.motoare.length; j++){
        let motor = mecanism_json.motoare[j].nume;
        container_grafice[motor + 'PosData'].data.datasets[0].data.push(msg.positions[motor])
        container_grafice[motor + 'PosData'].data.labels.push(msg.moment);
        container_grafice[motor + 'PosChart'].update();
    }
})

function genereazaGrafice(){
    genereazaGraficeHTML();
    configureazaGrafice();
}

function genereazaGraficeHTML(){
    for (let j = 0; j < mecanism_json.motoare.length; j++){
        let motor = mecanism_json.motoare[j].nume;
        $('#start').after($('<div class="row" style="padding-top: 40px;">\
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

function configureazaGrafice(){
    container_grafice = {}
    for (let j = 0; j < mecanism_json.motoare.length; j++){
        let motor = mecanism_json.motoare[j].nume;
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
    for(let j = 0; j < mecanism_json.motoare.length; j++){
        let motor = mecanism_json.motoare[j].nume;
        container_grafice[motor + 'PosData'].data.datasets[0].data.length = 0;
        container_grafice[motor + 'PosData'].data.labels.length = 0;
        container_grafice[motor + 'PosChart'].update();
    }
}