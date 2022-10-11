from email.policy import default
from django.db import models

# Create your models here.
class Nivel(models.Model):
    id = models.AutoField(primary_key=True)
    nivel = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=1000)

    def __str__(self):
        return "ID [%s] NIVEL [%s] DESC [%s]"%(self.id, self.nivel, self.descripcion)

class Sensor(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    cochera = models.CharField(max_length=50)
    ip = models.CharField(max_length=100, default="127.0.0.1")

    def __str__(self):
        return "ID [%s] NOMBRE [%s] COCHERA [%s] IP [%s]"%(self.id, self.nombre, self.cochera, self.ip)

class EstadoSensor(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=255)
    codigo = models.CharField(max_length=50)

    def __str__(self):
        return "ID [%s] CODIGO [%s] DESC [%s]"%(self.id, self.codigo, self.descripcion)

class Estacionamiento(models.Model):
    id = models.AutoField(primary_key=True)
    id_estado_sensor = models.ForeignKey(EstadoSensor, on_delete=models.CASCADE)
    id_nivel = models.ForeignKey(Nivel, on_delete=models.CASCADE)
    id_sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    fecha_alta = models.DateTimeField(auto_now_add=True)
    fecha_ult_mod = models.DateTimeField(auto_now_add=True)

    @property
    def codigo(self):
        return self.id_estado_sensor.codigo

    @property
    def nivel(self):
        return self.id_nivel.nivel

    @property
    def sensor(self):
        return self.id_sensor.nombre

    def __str__(self):
        return "ID [%s] NIVEL [%s] SENSOR [%s] ESTADO [%s]"%(self.id, self.nivel, self.sensor, self.codigo)

class Transaccion(models.Model):
    id = models.AutoField(primary_key=True)
    id_estado_sensor = models.ForeignKey(EstadoSensor, on_delete=models.CASCADE)
    id_nivel = models.ForeignKey(Nivel, on_delete=models.CASCADE)
    id_sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    fecha_transaccion = models.DateTimeField(auto_now_add=True)
