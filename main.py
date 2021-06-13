from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit, Namespace
import datetime
from random import randint
from threading import Thread, Event
import eventlet
import time
from board import *
import json
from gpiozero import LED, Button
from abc import ABC, abstractmethod

def salveaza_mecanism_db(mecanism):
    mecanism_db = MecanismDB(nume=mecanism.nume)
    db.session.add(mecanism_db)
    for motor_cheie in mecanism.motoare_dict:
        motor = MotorDB(nume=mecanism.motoare_dict[motor_cheie].nume,
                        initial=mecanism.motoare_dict[motor_cheie].initial)
        db.session.add(motor)
        min = SenzorDB(folosit_pentru='min', pin=mecanism.motoare_dict[motor_cheie].min_pin)
        db.session.add(min)
        motor.senzori.append(min)

        max = SenzorDB(folosit_pentru='max', pin=mecanism.motoare_dict[motor_cheie].max_pin)
        db.session.add(max)
        motor.senzori.append(max)

        plus = ActuatorDB(folosit_pentru='plus', pin=mecanism.motoare_dict[motor_cheie].plus_pin)
        db.session.add(plus)
        motor.actuators.append(plus)

        if mecanism.motoare_dict[motor_cheie].__class__.__name__ == "Motor_Dublu":
            minus = ActuatorDB(folosit_pentru='minus', pin=mecanism.motoare_dict[motor_cheie].minus_pin)
            db.session.add(minus)
            motor.actuators.append(minus)

        mecanism_db.motoare.append(motor)
    for faza_element in mecanism.faze_list:
        faza = FazaDB(numar=faza_element.numar, actiune=faza_element.actiune)
        for motor in mecanism_db.motoare:
            if motor.nume == faza_element.motor.nume:
                motor.faze.append(faza)
                mecanism_db.faze.append(faza)
                break
    db.session.commit()

def creaza_mecanism_din_id(id):
    mecanism_db = MecanismDB.query.get(id)
    mecanism_nume = mecanism_db.nume
    motoare = {}
    faze = []

    for motor in mecanism_db.motoare:
        motor_nume = motor.nume
        motor_initial = motor.initial
        if (len(motor.actuators) == 2):
            motor_type = "Dubla"
        else:
            motor_type = "Simpla"

        for actuator in motor.actuators:
            if (actuator.folosit_pentru == "minus"):
                motor_minus = actuator.pin
            else:
                motor_plus = actuator.pin

        for senzor in motor.senzori:
            if (senzor.folosit_pentru == "min"):
                motor_min = senzor.pin
            else:
                motor_max = senzor.pin
        if motor_type == "Dubla":
            motoare[motor_nume] = Motor_Dublu(nume=motor_nume, initial=motor_initial, min=motor_min,max=motor_max, plus=motor_plus, minus=motor_minus)
        else:
            motoare[motor_nume] = Motor_Simplu(nume=motor_nume, initial=motor_initial, min=motor_min,
                                   max=motor_max, plus=motor_plus)

    for faza in mecanism_db.faze:
        faza_numar = faza.numar
        faza_actiune = faza.actiune
        motor_nume_for_faza = faza.motor.nume
        motor_for_faza = motoare[motor_nume_for_faza]
        faze.append(Faza(numar=faza_numar, actiune=faza_actiune, motor=motor_for_faza))
    mecanism = Mecanism(nume=mecanism_nume, motoare_dict=motoare, faze_list=faze)
    return mecanism

def parseaza_json(json):
    mecanism_nume = json['nume']
    motoare = {}
    faze = []

    for motor in json['motoare']:
        nume = motor['nume']
        initial = motor['initial']
        actiune = motor['actiune']
        min = int(motor['min'].split()[1])
        max = int(motor['max'].split()[1])
        plus = int(motor['plus'].split()[1])
        if actiune == "Simpla":
            motoare[nume] = Motor_Simplu(nume=nume, initial=initial, min=min, max=max, plus=plus)
        else:
            minus = int(motor['minus'].split()[1])
            motoare[nume] = Motor_Dublu(nume=nume, initial=initial, min=min, max=max, plus=plus, minus=minus)

    for faza in json['faze']:
        numar = faza['numar']
        actiune = faza['actiune']
        motor_nume = faza['motor']
        motor = motoare[motor_nume]
        faze.append(Faza(numar=numar, actiune=actiune, motor=motor))

    mecanism = Mecanism(nume=mecanism_nume, motoare_dict=motoare, faze_list=faze)
    return mecanism

def creaza_mecanism_din_json(mecanism):
    nume = mecanism.nume
    motoare = []
    faze = []
    for cheie in mecanism.motoare_dict:
        motor = {}
        motor['nume'] = mecanism.motoare_dict[cheie].nume
        motor['initial'] = mecanism.motoare_dict[cheie].initial
        motor['min'] = 'GPIO ' + str(mecanism.motoare_dict[cheie].min_pin)
        motor['max'] = 'GPIO ' + str(mecanism.motoare_dict[cheie].max_pin)
        motor['plus'] = 'GPIO ' + str(mecanism.motoare_dict[cheie].plus_pin)
        if mecanism.motoare_dict[cheie].__class__.__name__ == "Motor_Dublu":
            motor['minus'] = 'GPIO ' + str(mecanism.motoare_dict[cheie].minus_pin)
            motor['actiune'] = "Dubla"
        else:
            motor['actiune'] = 'Simpla'
        motoare.append(motor)
    for element in mecanism.faze_list:
        faza = {}
        faza['numar'] = element.numar
        faza['actiune'] = element.actiune
        faza['motor'] = element.motor.nume
        faze.append(faza)
    json = {}
    json['nume'] = nume
    json['motoare'] = motoare
    json['faze'] = faze
    return json

def thread_trimite_faza(socketio, moment, positions, namespace):
    socketio.emit('faza', {'moment': moment, 'positions' :  positions}, namespace=namespace)

def thread_trimite_error(socketio, message, namespace):
    socketio.emit('eroare', {'message' : message}, namespace=namespace)

def thread_trimite_finished(socketio, namespace):
    socketio.emit('incheiat', {'message' : "Sequence finished"}, namespace=namespace)

class ExceptieTimp(Exception):
    pass

class Motor(ABC):

    @abstractmethod
    def __init__(self, nume, initial, min, max):
        self.nume = nume
        self.initial = initial
        self.min_pin = min
        self.max_pin = max
        self.min = Button(min)
        self.max = Button(max)
    
    @abstractmethod
    def extinde(self):
        pass

    @abstractmethod
    def retrage(self):
        pass

    @abstractmethod
    def stop(self):
        pass

    @abstractmethod
    def curata_pini(self):
        pass

    def initiaza(self):
        if self.initial == "Extins":
            self.extinde()
        else:
            self.retrage()

    def citeste_pozitie(self):
        if self.min.is_pressed:
            return 0
        elif self.max.is_pressed:
            return 1
        else:
            return 'between'

class Motor_Dublu(Motor):
    def __init__(self, nume, initial, min, max, plus, minus):
        Motor.__init__(self, nume=nume, initial=initial, min = min, max=max)
        self.minus_pin = minus
        self.plus_pin = plus
        self.plus = LED(plus)
        self.minus = LED(minus)

    def extinde(self):
        print('extinde' + self.nume)
        start_moment = datetime.datetime.now()
        current_moment = datetime.datetime.now()
        self.plus.on()
        while (int((current_moment - start_moment).total_seconds()) < 10):
            current_moment = datetime.datetime.now()
            if self.max.is_pressed:
                break
        else:
            print(self.nume + "failed extending")
            raise ExceptieTimp(self.nume + " failed extending")
        self.plus.off()

    def retrage(self):
        print('retrage' + self.nume)
        start_moment = datetime.datetime.now()
        current_moment = datetime.datetime.now()

        self.minus.on()
        while (int((current_moment - start_moment).total_seconds()) < 10):
            current_moment = datetime.datetime.now()
            if self.min.is_pressed:
                break
        else:
            print(self.nume + 'failed retracting')
            raise ExceptieTimp(self.nume + " failed retracting")
        self.minus.off()

    def stop(self):
        self.minus.off()
        self.plus.off()

    def curata_pini(self):
        self.min.close()
        self.max.close()
        self.minus.close()
        self.plus.close()

class Motor_Simplu(Motor):
    def __init__(self, nume, initial, min, max, plus):
        Motor.__init__(self, nume=nume, initial=initial, min = min, max=max)
        self.plus_pin = plus
        self.plus = LED(plus)

    def extinde(self):
        print('extinde' + self.nume)
        start_moment = datetime.datetime.now()
        current_moment = datetime.datetime.now()
        self.plus.on()
        while (int((current_moment - start_moment).total_seconds()) < 10):
            current_moment = datetime.datetime.now()
            if self.max.is_pressed:
                break
        else:
            print(self.nume + "failed extending")
            raise ExceptieTimp(self.nume + " failed extending")

    def retrage(self):
        print('retrage' + self.nume)
        start_moment = datetime.datetime.now()
        current_moment = datetime.datetime.now()

        self.plus.off()
        while (int((current_moment - start_moment).total_seconds()) < 10):
            current_moment = datetime.datetime.now()
            if self.min.is_pressed:
                break
        else:
            print(self.nume + 'failed retracting')
            raise ExceptieTimp(self.nume + " failed retracting")



    def stop(self):
        self.plus.off()

    def curata_pini(self):
        self.min.close()
        self.max.close()
        self.plus.close()

class Faza:
    def __init__(self, numar, actiune, motor):
        self.numar = numar
        self.actiune = actiune
        self.motor = motor

    def actioneaza(self):
        print('faza ' + str(self.numar) + ':' + self.actiune + ' ' + str(self.motor.nume))

        if(self.actiune == 'Extinde'):
            self.motor.extinde()
        else:
            self.motor.retrage()

class Mecanism:
    def __init__(self, nume, motoare_dict, faze_list):
        self.nume = nume
        self.motoare_dict = motoare_dict
        self.faze_list = faze_list

    def stop(self):
        for motor in self.motoare_dict:
            self.motoare_dict[motor].stop()


    def start(self, namespace):
        print(namespace);   # string riceived as namespace
        try:
            for cheie in self.motoare_dict:
                self.motoare_dict[cheie].initiaza()
            initial_positions = {}
            for motor in self.motoare_dict:
                initial_positions[motor] = self.motoare_dict[motor].citeste_pozitie()

            thread_initial = Thread(target=thread_trimite_faza, args=(socketio ,0, initial_positions, namespace))
            thread_initial.name = "Thread initial"
            thread_initial.start()


            start_moment =  datetime.datetime.now()
            for faza in self.faze_list:

                faza.actioneaza()
                moment = datetime.datetime.now()
                moment_difference = int((moment - start_moment).total_seconds() * 1000)
                positions = {}
                for motor in self.motoare_dict:
                    positions[motor] = self.motoare_dict[motor].citeste_pozitie()
                print(positions)
                thread_faza= Thread(target=thread_trimite_faza, args=(socketio ,moment_difference, positions, namespace))
                thread_faza.start()
            thread_finished = Thread(target=thread_trimite_finished, args=(socketio, namespace))
            thread_finished.name = "Thread finished"
            thread_finished.start()


        except ExceptieTimp as e:
            print(str(e))
            self.stop()
            thread_error= Thread(target=thread_trimite_error, args=(socketio ,str(e)))
            thread_error.name = 'Thread error'
            thread_error.start()

        finally:
            for cheie in self.motoare_dict:
                print("clear" + self.motoare_dict[cheie].nume)
                self.motoare_dict[cheie].curata_pini()

class MecanismSocket(Namespace):
    def on_connect(self):
        print("Connected to mecanism")

    def on_mecanism(self, json):
        print('trimite mecanism to back end')
        mecanism = parseaza_json(json)
        self.mecanism = mecanism
        print(self.mecanism.nume)

    def on_start(self):
        print('start test')
        mecanism_thread = Thread(target=Mecanism.start, args=(self.mecanism, '/mecanism'))
        mecanism_thread.start()


    def on_save_mecanism(self):
        salveaza_mecanism_db(self.mecanism)

class FolosesteMecanismSocket(Namespace):
    def on_connect(self):
        print('connected to use mecanism')
        mecanisme = MecanismDB.query.all()
        mecanisme_list = []
        for mecanism in mecanisme:
            mecanisme_list.append({'id': mecanism.id, 'nume': mecanism.nume})
        socketio.emit('mecanism_list', {'mecanisme_list': mecanisme_list}, namespace='/foloseste_mecanism')


    def on_select_mecanism(self, id):
        self.mecanism = creaza_mecanism_din_id(id)
        json = creaza_mecanism_din_json(self.mecanism)

        socketio.emit('mecanism_json', json, namespace='/foloseste_mecanism')

    def on_start(self):
        print('start test')
        mecanism_thread = Thread(target=Mecanism.start, args=(self.mecanism, '/foloseste_mecanism'))
        mecanism_thread.start()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///appDB.db'
socketio = SocketIO(app, async_mode='eventlet')
db = SQLAlchemy(app)
eventlet.monkey_patch()
socketio.on_namespace(MecanismSocket('/mecanism'))
socketio.on_namespace(FolosesteMecanismSocket('/foloseste_mecanism'))


mecanisme_x_motoare = db.Table('mecanisme_x_motoare',
    db.Column('mecanism_id', db.Integer, db.ForeignKey('mecanismDB.id')),
    db.Column('motor_id', db.Integer, db.ForeignKey('motorDB.id'))
)


class MecanismDB(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    nume = db.Column(db.String(50))
    faze = db.relationship('FazaDB', backref='mecanism')

class FazaDB(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    numar = db.Column(db.Integer)
    actiune = db.Column(db.String(50))
    mecanism_id = db.Column(db.Integer, db.ForeignKey('mecanismDB.id'))
    motor_id = db.Column(db.Integer, db.ForeignKey('motorDB.id'))

class MotorDB(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    nume = db.Column(db.String(50))
    initial = db.Column(db.String(50))
    actuators = db.relationship('ActuatorDB', backref='motor')
    senzori = db.relationship('SenzorDB', backref='motor')
    faze = db.relationship('FazaDB', backref='motor')
    mecanisme = db.relationship('MecanismDB', secondary=mecanisme_x_motoare, backref=db.backref('motoare', lazy='dynamic'))

class ActuatorDB(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    folosit_pentru = db.Column(db.String(50))
    pin = db.Column(db.Integer)
    motor_id = db.Column(db.Integer, db.ForeignKey('motorDB.id'))

class SenzorDB(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    folosit_pentru = db.Column(db.String(50))
    pin = db.Column(db.Integer)
    motor_id = db.Column(db.Integer, db.ForeignKey('motorDB.id'))


@app.route("/creaza_mecanism/")
def mecanism():
    return render_template('mecanism.html', )

@app.route("/foloseste_mecanism/")
def foloseste_mecanism():
    return render_template('foloseste_mecanism.html', )





if __name__ == "__main__":
    socketio.run(app,host='192.168.0.106', port='5050', debug=True)



