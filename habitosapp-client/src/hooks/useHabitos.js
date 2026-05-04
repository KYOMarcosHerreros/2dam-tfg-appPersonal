import { useState, useEffect } from 'react';
import { 
  obtenerHabitos, 
  obtenerCategorias, 
  crearHabitoCatalogo,
  crearHabitoPersonalizadoConIA,
  sugerirCategorizacion,
  actualizarHabito,
  eliminarHabito, 
  obtenerRacha 
} from '../api/habitos'; 
import { obtenerResumenDia, marcarHabito } from '../api/tracking';

export function useHabitos() {
  const [habitos, setHabitos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [registrosHoy, setRegistrosHoy] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [rachaDetalle, setRachaDetalle] = useState(null);

  const [tabCrear, setTabCrear] = useState('catalogo');
  const [formCrear, setFormCrear] = useState({ 
    nombre: '', 
    descripcion: '',
    icono: '⭐', 
    frecuenciaSemanal: 7,
    categoriaId: null,
    tipoHabito: 0,
    esNegativo: false,
    usarCategorizacionIA: true
  });

  const [sugerenciaIA, setSugerenciaIA] = useState(null);
  const [cargandoSugerencia, setCargandoSugerencia] = useState(false);

  const fechaFormateada = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(fechaSeleccionada);

  const fechaHoy = fechaSeleccionada.toISOString().split('T')[0]; // YYYY-MM-DD

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [resHabs, resCats, resRegistros] = await Promise.all([
          obtenerHabitos(),
          obtenerCategorias(),
          obtenerResumenDia(fechaHoy)
        ]);
        setHabitos(resHabs.data || []);
        setCategorias(resCats.data || []);
        setRegistrosHoy(resRegistros.data?.registros || []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarTodo();
  }, [fechaHoy]);

  const estaCompletado = (habitoId) => {
    return registrosHoy.some(registro => 
      registro.habitoId === habitoId && registro.completado
    );
  };

  const toggleHabito = async (habitoId) => {
    try {
      const yaCompletado = estaCompletado(habitoId);
      
      console.log('Marcando hábito:', {
        habitoId,
        completado: !yaCompletado,
        fecha: fechaHoy,
        fechaSeleccionada: fechaSeleccionada.toISOString()
      });
      
      const response = await marcarHabito({
        habitoId: habitoId,
        completado: !yaCompletado,
        fecha: fechaHoy
      });
      
      console.log('Respuesta del servidor:', response.data);

      // Actualizar el estado local
      if (yaCompletado) {
        // Remover el registro
        setRegistrosHoy(prev => prev.filter(r => r.habitoId !== habitoId));
      } else {
        // Agregar el registro
        setRegistrosHoy(prev => [...prev, {
          habitoId: habitoId,
          completado: true,
          fecha: fechaHoy
        }]);
      }
    } catch (error) {
      console.error("Error al marcar hábito:", error);
      console.error("Detalles del error:", error.response?.data);
    }
  };

  const obtenerSugerenciaIA = async () => {
    if (!formCrear.nombre.trim()) return;
    
    setCargandoSugerencia(true);
    try {
      const res = await sugerirCategorizacion({
        nombre: formCrear.nombre,
        descripcion: formCrear.descripcion
      });
      setSugerenciaIA(res.data);
    } catch (error) {
      console.error("Error al obtener sugerencia:", error);
    } finally {
      setCargandoSugerencia(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    
    try {
      let nuevoHabito;
      
      if (tabCrear === 'catalogo') {
        // Crear hábito del catálogo
        nuevoHabito = await crearHabitoCatalogo({
          nombre: formCrear.nombre,
          descripcion: formCrear.descripcion,
          icono: formCrear.icono,
          frecuenciaSemanal: parseInt(formCrear.frecuenciaSemanal),
          categoriaId: formCrear.categoriaId,
          esNegativo: formCrear.esNegativo
        });
      } else {
        // Crear hábito personalizado con IA
        nuevoHabito = await crearHabitoPersonalizadoConIA({
          Nombre: formCrear.nombre,
          Descripcion: formCrear.descripcion,
          Icono: formCrear.icono,
          TipoHabito: parseInt(formCrear.tipoHabito),
          FrecuenciaSemanal: parseInt(formCrear.frecuenciaSemanal),
          EsNegativo: formCrear.esNegativo,
          CategoriaIdSugerida: sugerenciaIA?.categoriaIdSugerida || formCrear.categoriaId,
          UsarCategorizacionIA: formCrear.usarCategorizacionIA
        });
      }

      // Actualizar la lista de hábitos
      setHabitos(prev => [...prev, nuevoHabito.data]);
      
      // Resetear formulario
      setFormCrear({ 
        nombre: '', 
        descripcion: '',
        icono: '⭐', 
        frecuenciaSemanal: 7,
        categoriaId: null,
        tipoHabito: 0,
        esNegativo: false,
        usarCategorizacionIA: true
      });
      setSugerenciaIA(null);
      setModalCrear(false);
      
    } catch (error) {
      console.error("Error al crear hábito:", error);
    }
  };

  const handleEditar = async (habitoId, datosActualizados) => {
    try {
      const habitoActualizado = await actualizarHabito(habitoId, {
        nombre: datosActualizados.nombre,
        descripcion: datosActualizados.descripcion,
        icono: datosActualizados.icono,
        frecuenciaSemanal: datosActualizados.frecuenciaSemanal,
        esNegativo: datosActualizados.esNegativo
      });

      // Actualizar la lista de hábitos
      setHabitos(prev => prev.map(h => 
        h.id === habitoId ? habitoActualizado.data : h
      ));
      
      setModalEditar(null);
    } catch (error) {
      console.error("Error al editar hábito:", error);
    }
  };

  const handleEliminar = async () => {
    if (modalEliminar) {
      try {
        await eliminarHabito(modalEliminar.id);
        setHabitos(habitos.filter(h => h.id !== modalEliminar.id));
        setModalEliminar(null);
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const handleVerDetalle = async (habito) => {
    setModalDetalle(habito);
    try {
      const res = await obtenerRacha(habito.id);
      setRachaDetalle(res.data);
    } catch (error) {
      setRachaDetalle({ diasActual: 0, diasRecord: 0 });
    }
  };

  const cambiarFecha = (dias) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  const irAHoy = () => {
    setFechaSeleccionada(new Date());
  };

  return {
    habitos, categorias, cargando, estaCompletado, fechaFormateada,
    toggleHabito, handleCrear, handleEditar, handleEliminar, handleVerDetalle,
    rachaDetalle, modalCrear, setModalCrear, modalEditar, setModalEditar,
    modalEliminar, setModalEliminar, modalDetalle, setModalDetalle, 
    tabCrear, setTabCrear, formCrear, setFormCrear,
    sugerenciaIA, setSugerenciaIA, cargandoSugerencia, obtenerSugerenciaIA,
    fechaSeleccionada, cambiarFecha, irAHoy
  };
}