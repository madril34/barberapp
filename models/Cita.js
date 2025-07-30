class Cita {
  constructor(id, cliente_id, fecha, hora, servicio, barbero, estado) {
    Object.assign(this, { id, cliente_id, fecha, hora, servicio, barbero, estado });
  }
}
module.exports = Cita;
