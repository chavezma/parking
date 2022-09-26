from django.contrib import admin
from .models import Sensor, EstadoSensor, Nivel, Estacionamiento, Transaccion

# Register your models here.
admin.site.register([Sensor, EstadoSensor, Nivel, Estacionamiento, Transaccion])