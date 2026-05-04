import { useHabitos } from '../hooks/useHabitos';
import HabitHeader from '../components/habitos/HabitHeader';
import HabitCard from '../components/habitos/HabitCard';
import HabitModalCrear from '../components/habitos/HabitModalCrear';
import HabitModalEditar from '../components/habitos/HabitModalEditar';
import HabitModalEliminar from '../components/habitos/HabitModalEliminar';
import HabitModalDetalle from '../components/habitos/HabitModalDetalle';
import './HabitosPage.css';

export default function HabitosPage() {
  const {
    habitos, categorias, cargando, estaCompletado, fechaFormateada,
    toggleHabito, handleCrear, handleEditar, handleEliminar, handleVerDetalle,
    rachaDetalle, modalCrear, setModalCrear, modalEditar, setModalEditar,
    modalEliminar, setModalEliminar, modalDetalle, setModalDetalle, 
    tabCrear, setTabCrear, formCrear, setFormCrear,
    sugerenciaIA, cargandoSugerencia, obtenerSugerenciaIA,
    fechaSeleccionada, cambiarFecha, irAHoy
  } = useHabitos();

  if (cargando) return <div className="cargando">Cargando...</div>;

  const esHoy = new Date().toDateString() === fechaSeleccionada.toDateString();

  return (
    <div className="habitos-contenedor">
      <HabitHeader 
        fecha={fechaFormateada}
        completadas={habitos.filter(h => estaCompletado(h.id)).length}
        pendientes={habitos.length - habitos.filter(h => estaCompletado(h.id)).length}
        alAbrirCrear={() => setModalCrear(true)}
        onCambiarFecha={cambiarFecha}
        onIrAHoy={irAHoy}
        esHoy={esHoy}
        tieneHabitos={habitos.length > 0}
      />

      <div className="habitos-lista">
        {habitos.map(h => (
            <HabitCard
                key={h.id}
                habito={h}
                completado={estaCompletado(h.id)}
                onToggle={toggleHabito}
                onVer={handleVerDetalle}
                onEliminar={setModalEliminar}
            />
        ))}
      </div>

      <HabitModalCrear 
        show={modalCrear} 
        onClose={() => setModalCrear(false)}
        onSubmit={handleCrear} 
        tab={tabCrear} 
        setTab={setTabCrear}
        form={formCrear} 
        setForm={setFormCrear} 
        categorias={categorias}
        sugerenciaIA={sugerenciaIA}
        cargandoSugerencia={cargandoSugerencia}
        obtenerSugerenciaIA={obtenerSugerenciaIA}
      />

      <HabitModalEditar
        habito={modalEditar}
        show={!!modalEditar}
        onClose={() => setModalEditar(null)}
        onSubmit={handleEditar}
        categorias={categorias}
      />

      <HabitModalEliminar 
        habito={modalEliminar} 
        onClose={() => setModalEliminar(null)} 
        onConfirm={handleEliminar} 
      />

      <HabitModalDetalle 
        habito={modalDetalle} 
        racha={rachaDetalle} 
        onClose={() => setModalDetalle(null)}
        onEditar={setModalEditar}
      />
    </div>
  );
}