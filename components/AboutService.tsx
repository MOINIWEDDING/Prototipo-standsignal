'use client';

import { motion } from 'framer-motion';

export default function AboutService() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 text-gray-800 space-y-16">
      
      {/* Encabezado */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">STANDSIGNALS</h1>
        <h2 className="text-2xl font-semibold text-blue-600">Propuesta Comercial</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stands NFC, software de analítica y mantenimiento para restaurantes, bajo una sola mensualidad.
        </p>
      </motion.div>

      {/* Imagen Principal Hero */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="w-full h-64 bg-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <span className="text-gray-500 font-medium">[Insertar Imagen de Stands NFC en mesa]</span>
      </motion.div>

      {/* Lo Esencial */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <h3 className="text-2xl font-bold mb-6 border-b pb-2">Lo esencial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <strong className="block text-blue-600 mb-2">Qué instalamos:</strong>
            <p className="text-sm">Stands NFC en las mesas del restaurante, conectados a StandSignals, nuestro software de analítica.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <strong className="block text-blue-600 mb-2">Inversión inicial:</strong>
            <p className="text-sm">RD$15,000 de instalación y configuración. Pago único, igual para cualquier tamaño de operación.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <strong className="block text-blue-600 mb-2">Mensualidad:</strong>
            <p className="text-sm">Desde RD$15,000 al mes. La cuota no cambia mientras el salón se mantenga dentro de su rango.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <strong className="block text-blue-600 mb-2">Puesta en marcha:</strong>
            <p className="text-sm">7 días desde la firma. Incluye capacitación, soporte, reposición y crecimiento.</p>
          </div>
        </div>
      </motion.div>

      {/* Por qué le sirve a un restaurante */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Por qué le sirve a un restaurante</h3>
          <p className="text-gray-600 leading-relaxed">
            Hoy lo que pasa en el salón vive en la cabeza del gerente de turno. Se sabe que hay mesas que rotan más, que hay horas fuertes y horas muertas, y que la mayoría de los clientes satisfechos se van sin dejar una reseña. Todo eso es información valiosa que nadie está capturando.
          </p>
          <p className="text-gray-600 leading-relaxed">
            El stand NFC convierte cada mesa en un punto de contacto medible. El cliente acerca el teléfono al stand y entra directo a donde ustedes decidan: el menú, una reseña de Google, una promoción del día, una encuesta corta. No hay que descargar nada. Del otro lado, ustedes ven qué mesas se usan, a qué hora y con qué frecuencia.
          </p>
        </div>
        <div className="h-full min-h-[300px] bg-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
          <span className="text-gray-500 font-medium">[Insertar Imagen de cliente usando el NFC]</span>
        </div>
      </motion.div>

      {/* StandSignals: el software incluido */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <h3 className="text-2xl font-bold mb-6 border-b pb-2">StandSignals: el software incluido</h3>
        <p className="mb-6 text-gray-600">Cada stand alimenta una plataforma donde ustedes ven el comportamiento real del salón.</p>
        
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Capacidad</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qué les da en la práctica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Estadísticas en tiempo real</td>
                <td className="px-6 py-4 text-gray-600">Interacciones por punto NFC y por ubicación, al momento, sin esperar cierre de mes.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Mapa de calor de mesas</td>
                <td className="px-6 py-4 text-gray-600">Qué mesas y zonas concentran más actividad y cuáles pasan desapercibidas. Sirve para redistribuir el salón y asignar personal.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Horarios pico</td>
                <td className="px-6 py-4 text-gray-600">Cuándo se concentra el uso durante el día y la semana, para ajustar turnos y promociones a las horas flojas.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">QR de respaldo</td>
                <td className="px-6 py-4 text-gray-600">Cada stand lleva su código QR. El cliente con un teléfono sin NFC accede igual, y nadie se queda fuera de la experiencia.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Personalización</td>
                <td className="px-6 py-4 text-gray-600">Pantallas, enlaces y diseño de la experiencia adaptados a la identidad del restaurante, no a una plantilla genérica.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Qué incluye el servicio */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-6">
        <h3 className="text-2xl font-bold border-b pb-2">Qué incluye el servicio, sin costos escondidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <strong>Capacitación inicial:</strong> Sesiones con su equipo para explicar cómo funciona StandSignals, cómo se lee el tablero y qué hacer con los datos. Presencial, en su local.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <strong>Soporte:</strong> Si algo falla, lo resolvemos. Estamos atentos al sistema y atendemos cualquier incidencia hasta dejarla cerrada.
              </div>
            </li>
          </ul>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <strong>Reposición sin costo:</strong> Un stand que se dañe, se despegue o desaparezca se reemplaza sin cargo adicional. El desgaste corre por nuestra cuenta.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <strong>Crecimiento incluido:</strong> Pueden sumar stands cuando quieran. Mientras el total se mantenga dentro del rango contratado, la mensualidad es la misma.
              </div>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Inversión y Rangos */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Tabla de Inversión */}
        <div>
          <h3 className="text-2xl font-bold mb-6 border-b pb-2">Inversión</h3>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-gray-500 uppercase">Concepto</th>
                  <th className="px-4 py-3 font-bold text-gray-500 uppercase text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3">Instalación y configuración inicial (pago único)</td>
                  <td className="px-4 py-3 text-right font-medium">RD$15,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Capacitación del equipo</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">Incluida</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Mensualidad según el rango de stands</td>
                  <td className="px-4 py-3 text-right font-medium">Desde RD$15,000 / mes</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Reposición, soporte y mantenimiento</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">Incluidos</td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="px-4 py-3">Total del primer mes</td>
                  <td className="px-4 py-3 text-right text-lg text-blue-700">RD$15,000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 italic">
            A partir del segundo mes la facturación es desde RD$15,000 en adelante. No hay cargos por reposición, visitas de soporte ni actualizaciones del software.
          </p>
        </div>

        {/* Tabla de Rangos */}
        <div>
          <h3 className="text-2xl font-bold mb-6 border-b pb-2">Cómo crece sin que suba la cuota</h3>
          <p className="text-sm text-gray-600 mb-4">No cobramos por stand, cobramos por rango. Si un local arranca con 70 stands y suma mesas hasta llegar a 100, sigue pagando lo mismo.</p>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase">Rango de Stands</th>
                  <th className="px-4 py-3 font-bold uppercase">Nivel</th>
                  <th className="px-4 py-3 font-bold uppercase text-right">Mensualidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50"><td className="px-4 py-2">1 – 25</td><td className="px-4 py-2 text-gray-500">Starter</td><td className="px-4 py-2 text-right font-medium">RD$15,000</td></tr>
                <tr className="hover:bg-gray-50"><td className="px-4 py-2">26 – 50</td><td className="px-4 py-2 text-gray-500">Growth</td><td className="px-4 py-2 text-right font-medium">RD$20,000</td></tr>
                <tr className="hover:bg-gray-50 bg-blue-50/50"><td className="px-4 py-2">51 – 100</td><td className="px-4 py-2 text-blue-600 font-semibold">Business</td><td className="px-4 py-2 text-right font-medium text-blue-600">RD$25,000</td></tr>
                <tr className="hover:bg-gray-50"><td className="px-4 py-2">101 – 150</td><td className="px-4 py-2 text-gray-500">Enterprise</td><td className="px-4 py-2 text-right font-medium">RD$32,500</td></tr>
                <tr className="hover:bg-gray-50"><td className="px-4 py-2">151 – 250</td><td className="px-4 py-2 text-gray-500">Enterprise+</td><td className="px-4 py-2 text-right font-medium">RD$42,500</td></tr>
                <tr className="hover:bg-gray-50"><td className="px-4 py-2">251 – 400</td><td className="px-4 py-2 text-gray-500">Corporate</td><td className="px-4 py-2 text-right font-medium">RD$55,000</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 italic mt-3">
            * Si el grupo tiene más de un local, el conteo total de stands define el rango. No se abre un contrato nuevo por cada sucursal.
          </p>
        </div>
      </motion.div>

      {/* Requisitos y Condiciones */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-900">Lo que necesitamos de ustedes</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
              <li>Una persona de contacto que apruebe los enlaces y el diseño.</li>
              <li>Dos horas de acceso al salón fuera de horario de servicio, una sola vez.</li>
              <li>Logo, menú digital y los enlaces a los que quieren dirigir al cliente.</li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 font-medium">Nada más. El levantamiento, la instalación y la configuración corren por nuestra cuenta.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-900">Condiciones</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><strong>Vigencia:</strong> 15 días a partir de la entrega de esta propuesta.</li>
              <li><strong>Forma de pago:</strong> Pago de la instalación al firmar. Mensualidad a partir del siguiente mes, facturada el mismo día de cada mes.</li>
              <li><strong>Permanencia:</strong> Sin permanencia mínima. Aviso con 30 días de antelación para terminar el servicio.</li>
              <li><strong>Propiedad de los datos:</strong> La información que genera el salón es del restaurante y se entrega exportada si el servicio termina.</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Contacto */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center space-y-8 pb-10">
        <div>
          <h3 className="text-2xl font-bold mb-4">El siguiente paso</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Una visita de treinta minutos al local para contar las mesas y confirmar el número exacto de stands. Con eso queda cerrada la cotización con cifras definitivas y, si dan luz verde ese mismo día, el sistema estará funcionando en las próximas semanas.
          </p>
          <p className="mt-4 font-medium text-gray-800">Quedo pendiente de su respuesta.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 pt-6 border-t">
          <div className="text-left bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-xs">
            <strong className="block text-lg text-gray-900">Carlos Rosario</strong>
            <span className="text-sm text-blue-600 font-medium block mb-2">CEO StandSignals</span>
            <p className="text-sm text-gray-500">+1 (829) 773-7231</p>
            <p className="text-sm text-gray-500">rosariosanchezc066@gmail.com</p>
          </div>
          <div className="text-left bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-xs">
            <strong className="block text-lg text-gray-900">Moisés Fermín</strong>
            <span className="text-sm text-blue-600 font-medium block mb-2">CEO StandSignals</span>
            <p className="text-sm text-gray-500">+1 (829) 584-0103</p>
            <p className="text-sm text-gray-500">asaferwork@outlook.com</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
