export type DocLegal = 'terminos' | 'datos';

export function Legal({
  doc,
  alVolver,
}: {
  doc: DocLegal;
  alVolver: () => void;
}) {
  return (
    <main className="hoja legal">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Volver
      </button>
      {doc === 'terminos' ? <Terminos /> : <Datos />}
      <p className="ayuda">
        Prototipo formativo ADSO. No es un producto oficial del IDPYBA ni de la
        Alcaldía. Marca comercial: en definición.
      </p>
    </main>
  );
}

function Terminos() {
  return (
    <>
      <p className="ojo">Uso de la plataforma</p>
      <h1>Términos y condiciones</h1>
      <p>
        Al crear una cuenta aceptas estas reglas. El prototipo opera en el área
        urbana de Bogotá y solo para caninos y felinos domésticos.
      </p>
      <h2>Para qué sirve</h2>
      <p>
        Publicar animales de refugios y hogares de paso verificados, postularse
        a una adopción con un cuestionario breve y cubrir ítems concretos de
        alimento, medicina o aseo. La métrica norte es un cupo liberado
        (animal en estado adoptado).
      </p>
      <h2>Lo que no hay</h2>
      <ul>
        <li>No hay recaudo de dinero, Nequi, apadrinamiento ni pasarela de pagos.</li>
        <li>No se publican especies distintas de perro o gato doméstico.</li>
        <li>No se vende ningún animal. La adopción la cierra la entidad, no un pago.</li>
        <li>El rol validador no se autoasigna en el registro.</li>
      </ul>
      <h2>Cuentas y roles</h2>
      <p>
        Adoptante, donante o entidad. Una entidad no publica hasta tener sello
        Nivel 1 o Nivel 2. El visitante puede ver el catálogo, el badge y la
        bitácora pública.
      </p>
      <h2>Contenido que publicas</h2>
      <p>
        La historia y la foto de un animal son públicas en el catálogo. Las
        evidencias de verificación y el contacto de entrega de un donante no lo
        son. No publiques datos de terceros sin autorización.
      </p>
      <h2>Cuentas de ejemplo</h2>
      <p>
        Las fichas y correos marcados EJEMPLO son de demostración local. No
        corresponden a personas, animales ni refugios reales.
      </p>
    </>
  );
}

function Datos() {
  return (
    <>
      <p className="ojo">Ley 1581 de 2012 · Decreto 1377 de 2013</p>
      <h1>Tratamiento de datos personales</h1>
      <p>
        Quien recolecta datos debe tener autorización, finalidad clara, medidas
        de seguridad y permitir consulta o corrección. Este aviso cumple el
        mínimo de RNF-02 del expediente.
      </p>
      <h2>Responsable</h2>
      <p>
        Julio David Parada León, prototipo formativo ADSO (ficha 3228973 B).
        Entorno de piloto local / demostración. No es un operador de recaudo.
      </p>
      <h2>Qué datos y para qué</h2>
      <ul>
        <li>Nombre, correo, contraseña (hash con sal), localidad y rol: crear la cuenta y la sesión.</li>
        <li>Cinco respuestas de hogar: calcular un puntaje explicable y postularse.</li>
        <li>Contacto de entrega del donante: solo lo ve la entidad; no sale en la bitácora pública.</li>
        <li>Evidencias de verificación (RUT, Cámara, IDPYBA, COMVEZCOL): solo entidad dueña y validador.</li>
        <li>Foto e historia del animal: catálogo público, para adoptar con información honesta.</li>
      </ul>
      <h2>Qué no se publica</h2>
      <p>
        Cédula, teléfono del donante, archivos de verificación ni montos de
        dinero. La bitácora muestra ítem, cantidad, unidad y fecha.
      </p>
      <h2>Seguridad</h2>
      <p>
        Contraseña con hash y sal (bcrypt). Sesión en cookie httpOnly (`sid`).
        En un despliegue piloto se usará HTTPS. Las evidencias no son listables
        sin autenticación.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes pedir consulta o corrección de tus datos al operador del piloto.
        El consentimiento queda registrado (`consentimiento_datos` y
        `consentimiento_en`). Sin aceptación no se crea la cuenta.
      </p>
    </>
  );
}

export function PieLegal({
  alTerminos,
  alDatos,
}: {
  alTerminos: () => void;
  alDatos: () => void;
}) {
  return (
    <footer className="pie-legal">
      <p>Sin recaudo · Solo Bogotá urbana · Caninos y felinos</p>
      <p>
        <button type="button" className="enlace" onClick={alTerminos}>
          Términos
        </button>
        {' · '}
        <button type="button" className="enlace" onClick={alDatos}>
          Datos personales
        </button>
      </p>
    </footer>
  );
}
